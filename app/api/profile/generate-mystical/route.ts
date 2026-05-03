/**
 * POST /api/profile/generate-mystical
 *
 * Stage B work is scheduled with `after()` so it can continue after the 202 response (serverless).
 * Parallel tools: env `MYSTICAL_TOOL_RUN_CONCURRENCY` (default 4, max 8). On Vercel Pro try `5` if 429/rate-limit errors stay rare.
 *
 * ONE-TIME, ATOMIC profile generation.
 * 1. Lock profile generation
 * 2. Run ALL tools (no exceptions)
 * 3. Store each tool's output separately
 * 4. Build Master Seer Database
 * 5. Unlock chat
 *
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb, getDocument, setDocument } from '@/lib/firebase-admin';
import { ALL_TOOL_SLUGS, summarizeToolReadiness } from '@/lib/profileGenerationOrchestrator';
import type { UserProfile } from '@/lib/firebase';
import { calculateProfileDataHash } from '@/lib/firebase';
import { normalizeBirthTime } from '@/lib/birthTimeUtils';
import { devLog } from '@/lib/devLogger';
import {
  canRunFullPipeline,
  getMissingFullProfileFields,
  isNoChargeSubscriptionEmail,
  isTrialExpired,
} from '@/lib/subscriptionConfig';
import { logServerError } from '@/lib/serverErrorLogging';
import { rateLimiters } from '@/lib/rateLimit';
import { checkRateLimitWithOptionalFirestore } from '@/lib/rateLimitFirestore';
import { acquireMysticalGenerationLock, getMysticalLockRuntimeStatus } from '@/lib/generationLock';
import { tryResumeMysticalStageB } from '@/lib/mysticalStageB';
import type { PersistedToolStatusMap } from '@/lib/mysticalStageB';

export const dynamic = 'force-dynamic';
/** Stage B runs via `after()` after the 202 response; allow enough wall time for full sequential/parallel pipeline. */
export const maxDuration = 300;
const HEARTBEAT_STALE_MS = 45_000;

/** Grace past `maxDuration` before treating a lock as stale (failed/crashed run). */
function mysticalLockStaleMs(): number {
  return maxDuration * 1000 + 120_000;
}

function buildToolStatus(
  profile: Record<string, unknown>,
  now: number,
): PersistedToolStatusMap {
  const status: PersistedToolStatusMap = {};
  for (const slug of ALL_TOOL_SLUGS) {
    const report = profile[slug];
    const hasObj = report != null && typeof report === 'object';
    const isPlaceholder = hasObj && (report as { placeholder?: boolean }).placeholder === true;
    const isFailed = hasObj && (report as { status?: string }).status === 'failed';
    const isReady = hasObj && !isPlaceholder && !isFailed;
    status[slug] = {
      state: isReady ? 'ready' : isPlaceholder ? 'placeholder' : isFailed ? 'failed' : 'pending',
      startedAt: now,
      updatedAt: now,
      generatedAt: isReady ? now : undefined,
      attempts: 1,
      error: isFailed ? ((report as { error?: string }).error ?? 'Generation failed') : null,
      unchanged: false,
    };
  }
  return status;
}

type RegenDecisionReason =
  | 'unchanged_hash_all_ready'
  | 'missing_tools_backfill'
  | 'profile_hash_changed'
  | 'payment_blocked';

async function writeRegenDecisionTelemetry(
  uid: string,
  payload: {
    event: string;
    generationMode: 'preview' | 'full';
    hashMatch: boolean;
    pendingToolCount: number;
    reason: RegenDecisionReason;
  }
): Promise<string> {
  const auditId = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  const data = {
    ...payload,
    userId: uid,
    auditId,
    createdAt: Date.now(),
  };
  try {
    if (adminDb) {
      await adminDb.collection('profileGenerationUsage').doc(uid).collection('runs').doc(auditId).set(data);
      return auditId;
    }
  } catch (err) {
    devLog.warn('[generate-mystical] Failed profileGenerationUsage decision telemetry write', err, 'generate-mystical');
  }
  try {
    await setDocument('profileGenerationDecisionAudit', `${uid}_${auditId}`, data);
  } catch {
    // best effort telemetry only
  }
  return auditId;
}

export async function POST(request: NextRequest) {
  let uid: string | undefined;
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const genLimit = await checkRateLimitWithOptionalFirestore(
      rateLimiters.profileGeneration,
      'profile_generate_mystical',
      uid,
    );
    if (!genLimit.allowed) {
      const retryAfter = Math.ceil((genLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: rateLimiters.profileGeneration.getErrorMessage(),
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(1, retryAfter)),
          },
        }
      );
    }

    // Fetch user profile
    const userDoc = await getDocument('users', uid);
    if (!userDoc) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userProfile = userDoc as Record<string, unknown>;
    const birthDate = (userProfile.birthDate ?? userProfile.birth_date) as string | undefined;
    const birthPlace = (userProfile.birthPlace ?? userProfile.birth_place) as string | undefined;
    if (!birthDate || !String(birthDate).trim() || !birthPlace || !String(birthPlace).trim()) {
      return NextResponse.json(
        { error: 'Please complete your profile (birth date and place required)' },
        { status: 400 }
      );
    }

    const email = (userProfile.email ?? userProfile.Email) as string | undefined;
    // Onboarding is intentionally low-friction: generation should not be blocked by payment/plan choice.
    // Keep this read so existing no-charge account logic remains compatible for downstream analytics/meta.
    void isNoChargeSubscriptionEmail(email);

    // Launch hotfix: do not block mystical profile generation by edit quota.
    // We keep counting edits elsewhere so telemetry remains intact.

    // Build effective profile from Firestore + optional client overrides (before idempotency so we compare against what we would use)
    const ALLOWED_OVERRIDES = [
      'birthDate', 'birthTime', 'birthPlace', 'birthLatitude', 'birthLongitude',
      'currentLocation', 'fullName', 'displayName',
      'gender', 'facePhotoUrl', 'palmPhotoUrl',
    ] as const;
    const profileWithUid: Record<string, unknown> = {
      ...userProfile,
      uid,
      birthDate: birthDate ?? userProfile.birthDate,
      birthPlace: birthPlace ?? userProfile.birthPlace,
    };
    let requestBody: Record<string, unknown> = {};
    try {
      const body = await request.json().catch(() => ({}));
      requestBody = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
      const overrides = (body && typeof body === 'object' && (body as Record<string, unknown>).profileOverrides) as Record<string, unknown> | undefined;
      if (overrides && typeof overrides === 'object') {
        for (const key of ALLOWED_OVERRIDES) {
          const val = overrides[key];
          if (val !== undefined && val !== null) {
            if (key === 'birthTime' && typeof val === 'string') {
              profileWithUid[key] = normalizeBirthTime(val) || val;
            } else {
              profileWithUid[key] = val;
            }
          }
        }
        devLog.info('[generate-mystical] Applied profileOverrides from request body', 'generate-mystical');
      }
    } catch {
      // No body or invalid JSON: proceed with Firestore profile only
    }

    const modeRaw = typeof requestBody.mode === 'string' ? requestBody.mode.trim().toLowerCase() : 'preview';
    const generationMode: 'preview' | 'full' = modeRaw === 'full' ? 'full' : 'preview';
    const isFirstOnboardingGeneration = userProfile.mysticalProfileGenerated !== true;
    const missingFullFields = getMissingFullProfileFields(profileWithUid as Partial<UserProfile>);
    if (generationMode === 'full') {
      if (missingFullFields.length > 0) {
        return NextResponse.json(
          {
            error: 'Please complete all required profile details for full report generation.',
            blockReason: 'missing_fields',
            missingFields: missingFullFields,
            generationMode,
          },
          { status: 400 },
        );
      }
      if (!isFirstOnboardingGeneration) {
        const trialExpired = isTrialExpired(profileWithUid as Partial<UserProfile>);
        const canRunFull = canRunFullPipeline(profileWithUid as Partial<UserProfile>);
        if (!canRunFull) {
          const auditId = await writeRegenDecisionTelemetry(uid, {
            event: 'mystical_regen_blocked_payment',
            generationMode,
            hashMatch: false,
            pendingToolCount: 0,
            reason: 'payment_blocked',
          });
          const subscriptionStatus = String((profileWithUid as Partial<UserProfile>).subscriptionStatus ?? '').trim().toLowerCase();
          const paymentBlockReason =
            trialExpired
              ? 'trial_expired'
              : subscriptionStatus === 'past_due' || subscriptionStatus === 'incomplete'
                ? 'payment_method_update_required'
                : 'payment_required';
          return NextResponse.json(
            {
              error: trialExpired
                ? 'Your trial has ended. Please choose a plan and add payment details to generate the full report.'
                : subscriptionStatus === 'past_due' || subscriptionStatus === 'incomplete'
                  ? 'Your payment method needs an update before full report generation can continue.'
                  : 'To unlock the full report, add your plan and payment details.',
              blockReason: paymentBlockReason,
              missingFields: missingFullFields,
              trialExpired,
              subscriptionStatus,
              generationMode,
              decision: 'blocked',
              decisionReason: 'payment_blocked',
              auditId,
            },
            { status: 403 },
          );
        }
      }
    }

    // Idempotent guard: already generated with same effective data — do not re-run tools
    // Unless stored comprehensive profile is missing any tool report (e.g. new tool added after first run)
    const effectiveHash = calculateProfileDataHash(profileWithUid as Partial<UserProfile>);
    const hashMatches =
      userProfile.mysticalProfileGenerated === true &&
      userProfile.profileDataHash != null &&
      userProfile.profileDataHash !== '' &&
      userProfile.profileDataHash === effectiveHash;
    let decisionAuditId: string | null = null;

    if (hashMatches) {
      const stored = await getDocument('comprehensiveMysticalProfiles', uid);
      const storedProfile = (stored || {}) as Record<string, unknown>;
      const readiness = summarizeToolReadiness(storedProfile, ALL_TOOL_SLUGS);
      const missingSlugs = readiness.pendingToolSlugs;
      if (missingSlugs.length === 0) {
        const auditId = await writeRegenDecisionTelemetry(uid, {
          event: 'mystical_regen_skipped_unchanged',
          generationMode,
          hashMatch: true,
          pendingToolCount: 0,
          reason: 'unchanged_hash_all_ready',
        });
        return NextResponse.json({
          success: true,
          message: 'Profile already generated.',
          alreadyGenerated: true,
          allReportsReady: true,
          readyToolsCount: readiness.readyToolsCount,
          pendingToolSlugs: [],
          skipReason: 'unchanged_hash_all_ready',
          decision: 'skipped',
          decisionReason: 'unchanged_hash_all_ready',
          auditId,
        });
      }
      decisionAuditId = await writeRegenDecisionTelemetry(uid, {
        event: 'mystical_regen_backfill_missing_tools',
        generationMode,
        hashMatch: true,
        pendingToolCount: missingSlugs.length,
        reason: 'missing_tools_backfill',
      });
      devLog.info(
        `[generate-mystical] Re-running pipeline to backfill missing tools: ${missingSlugs.join(', ')}`,
        'generate-mystical'
      );
      devLog.info(`[generate-mystical] decision=rerun reason=missing_tools_backfill auditId=${decisionAuditId}`, 'generate-mystical');
    }
    if (!hashMatches) {
      decisionAuditId = await writeRegenDecisionTelemetry(uid, {
        event: 'mystical_regen_hash_changed',
        generationMode,
        hashMatch: false,
        pendingToolCount: ALL_TOOL_SLUGS.length,
        reason: 'profile_hash_changed',
      });
      devLog.info(`[generate-mystical] decision=rerun reason=profile_hash_changed auditId=${decisionAuditId}`, 'generate-mystical');
    }

    const idempotencyKey =
      request.headers.get('Idempotency-Key')?.trim() ||
      request.headers.get('X-Idempotency-Key')?.trim() ||
      undefined;

    const lockResult = await acquireMysticalGenerationLock(uid, idempotencyKey, mysticalLockStaleMs());
    if (lockResult === 'idempotent_in_progress') {
      return NextResponse.json(
        {
          success: true,
          inProgress: true,
          generationState: 'in_progress',
          generationMode,
          message: 'Profile generation is already running for this request.',
        },
        { status: 202 }
      );
    }
    if (lockResult === 'concurrent') {
      return NextResponse.json(
        { error: 'Profile generation is already in progress. Please wait for it to complete.', generationState: 'in_progress' },
        { status: 409 }
      );
    }

    // Check for selective retry of failed tools via query param
    const retryParam = request.nextUrl.searchParams.get('retryTools');
    if (retryParam) {
      const retryOnly = retryParam.split(',').map(s => s.trim()).filter(Boolean);
      devLog.info(`[generate-mystical] Selective retry for tools: ${retryOnly.join(', ')}`, 'generate-mystical');
    }

    const now = Date.now();
    const newHash = calculateProfileDataHash(profileWithUid as Partial<UserProfile>);
    const profileDefiningFields = [
      'birthDate', 'birthTime', 'birthPlace', 'currentLocation', 'fullName', 'displayName',
      'gender', 'facePhotoUrl', 'palmPhotoUrl', 'birthLatitude', 'birthLongitude',
    ] as const;
    const userUpdate: Record<string, unknown> = {
      mysticalProfileGenerated: true,
      mysticalProfileGeneratedAt: now,
      profileDataHash: newHash,
      profileStatus: 'running',
      allReportsReady: false,
      pendingToolSlugs: ALL_TOOL_SLUGS,
      updatedAt: now,
    };
    for (const key of profileDefiningFields) {
      if (profileWithUid[key] !== undefined) userUpdate[key] = profileWithUid[key];
    }

    await setDocument('users', uid, userUpdate);
    await setDocument('generationLocks', uid, {
      status: 'running',
      phase: 'running',
      totalTools: ALL_TOOL_SLUGS.length,
      completedTools: 0,
      startedAt: now,
      updatedAt: now,
      currentToolSlug: null,
    });
    await setDocument('generationJobs', uid, {
      uid,
      status: 'queued',
      phase: 'running',
      queuedAt: now,
      updatedAt: now,
      attempts: 0,
      maxAttempts: 3,
      nextRetryAt: null,
      profileHash: newHash,
      profileSnapshot: profileWithUid,
      pipelineMode: 'unified',
      completedTools: 0,
      totalTools: ALL_TOOL_SLUGS.length,
      lastProgressAt: now,
      lastHeartbeatAt: now,
    });

    if (!uid) {
      throw new Error('[generate-mystical] invariant: uid missing after auth before Stage B');
    }
    const uidStageB: string = uid;
    after(() => {
      void tryResumeMysticalStageB(uidStageB).catch((e) => {
        devLog.error('[generate-mystical] after(tryResumeMysticalStageB) failed', e, 'generate-mystical');
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Generating your mystical profile. Reports will unlock one by one in tools order.',
      generationState: 'running',
      generationMode,
      decision: 'rerun',
      decisionReason: hashMatches ? 'missing_tools_backfill' : 'profile_hash_changed',
      auditId: decisionAuditId,
      phase: 'running',
      completedTools: 0,
      totalTools: ALL_TOOL_SLUGS.length,
      readyToolsCount: 0,
      pendingToolSlugs: ALL_TOOL_SLUGS,
      allReportsReady: false,
      toolStatus: buildToolStatus({}, now),
    }, { status: 202 });
  } catch (err) {
    // Release generation lock on failure
    if (uid) { try { await setDocument('generationLocks', uid, { lockedAt: null, status: 'failed', failedAt: Date.now() }); } catch { /* ignore */ } }
    devLog.error('Profile generate-mystical API error', err, 'generate-mystical');
    try {
      await logServerError({
        area: 'mystical-profile',
        action: 'generate',
        message: err instanceof Error ? err.message : 'Unknown generate-mystical error',
        userId: uid,
        route: request.nextUrl.pathname,
      });
    } catch {
      // ignore logging failures
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate mystical profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }
    const decoded = await getAuth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const [userDoc, lockDoc, profileDoc, generationJobDoc] = await Promise.all([
      getDocument('users', uid),
      getDocument('generationLocks', uid),
      getDocument('comprehensiveMysticalProfiles', uid),
      getDocument('generationJobs', uid),
    ]);
    const user = (userDoc as Record<string, unknown> | null) ?? {};
    const lock = (lockDoc as Record<string, unknown> | null) ?? {};
    const profile = (profileDoc as Record<string, unknown> | null) ?? {};
    const lockStatus = lock?.status;
    const generationJob = (generationJobDoc as Record<string, unknown> | null) ?? null;
    const generationJobStatus = typeof generationJob?.status === 'string' ? generationJob.status : null;
    const lockRuntime = getMysticalLockRuntimeStatus(lock, mysticalLockStaleMs());
    const generated = Boolean(user?.mysticalProfileGenerated) || Boolean(profileDoc);
    const readiness = summarizeToolReadiness(profile, ALL_TOOL_SLUGS);
    const allReportsReady = readiness.allReportsReady;
    const pendingToolSlugs = readiness.pendingToolSlugs;
    const lastHeartbeatAt = typeof generationJob?.lastHeartbeatAt === 'number' ? generationJob.lastHeartbeatAt : null;
    const runningHeartbeatStale =
      generationJobStatus === 'running' &&
      lastHeartbeatAt != null &&
      Date.now() - lastHeartbeatAt > HEARTBEAT_STALE_MS;
    const inProgress = lockRuntime.isRunning && !lockRuntime.isStale && !runningHeartbeatStale;
    const partialReady = readiness.readyToolsCount > 0 && !allReportsReady;
    const completed = generated && allReportsReady;
    const generationState = inProgress
      ? 'running'
      : completed
        ? 'completed'
        : generated
          ? 'partial_ready'
          : 'not_started';

    const userAllReportsReady = Boolean(user?.allReportsReady);
    const userPending = Array.isArray(user?.pendingToolSlugs) ? (user.pendingToolSlugs as unknown[]) : [];
    const userPendingNormalized = userPending.filter((s): s is string => typeof s === 'string').sort();
    const pendingNormalized = [...pendingToolSlugs].sort();
    const pendingMismatch =
      userPendingNormalized.length !== pendingNormalized.length ||
      userPendingNormalized.some((slug, idx) => slug !== pendingNormalized[idx]);
    if (generated && (userAllReportsReady !== allReportsReady || pendingMismatch)) {
      await setDocument('users', uid, {
        allReportsReady,
        pendingToolSlugs,
        profileStatus: allReportsReady ? 'completed' : inProgress ? 'running' : 'partial_ready',
        updatedAt: Date.now(),
      });
    }

    if (lockRuntime.isRunning && lockRuntime.isStale) {
      await setDocument('generationLocks', uid, {
        status: allReportsReady ? 'completed' : 'failed',
        phase: allReportsReady ? 'completed' : 'stale_timeout',
        staleRecovered: true,
        staleRecoveredAt: Date.now(),
        completedTools: readiness.readyToolsCount,
        totalTools: ALL_TOOL_SLUGS.length,
        readyToolsCount: readiness.readyToolsCount,
        pendingToolSlugs,
        allReportsReady,
        updatedAt: Date.now(),
      });
    }

    const jobUpdatedAt = typeof generationJob?.updatedAt === 'number' ? generationJob.updatedAt : null;
    if (
      generationJobStatus === 'running' &&
      jobUpdatedAt != null &&
      Date.now() - jobUpdatedAt > mysticalLockStaleMs()
    ) {
      await setDocument('generationJobs', uid, {
        status: 'stale_running',
        phase: 'stale_timeout',
        staleRecovered: true,
        staleRecoveredAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    let resumeAttempted = false;
    const shouldResume =
      generated &&
      !allReportsReady &&
      (
        generationJobStatus === 'queued' ||
        generationJobStatus === 'failed' ||
        generationJobStatus === 'stale_running' ||
        runningHeartbeatStale
      );
    if (shouldResume) {
      resumeAttempted = true;
      if (runningHeartbeatStale) {
        await setDocument('generationJobs', uid, {
          status: 'stale_running',
          phase: 'stale_heartbeat',
          staleRecovered: true,
          staleRecoveredAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      after(() => {
        void tryResumeMysticalStageB(uid).catch((e) => {
          devLog.error('[generate-mystical] GET after(tryResumeMysticalStageB) failed', e, 'generate-mystical');
        });
      });
    }

    const generationJobCompletedToolsRaw = generationJob?.completedTools;
    const generationJobTotalToolsRaw = generationJob?.totalTools;
    const generationJobCompletedTools =
      typeof generationJobCompletedToolsRaw === 'number' ? generationJobCompletedToolsRaw : null;
    const generationJobTotalTools =
      typeof generationJobTotalToolsRaw === 'number' ? generationJobTotalToolsRaw : null;
    return NextResponse.json({
      success: true,
      inProgress,
      generated,
      hasProfile: Boolean(profileDoc),
      completed,
      partialReady,
      generationState,
      allReportsReady,
      readyToolsCount: readiness.readyToolsCount,
      pendingToolSlugs,
      toolStatus: (profile?.toolStatus as Record<string, unknown> | undefined) ?? null,
      lastProgressAt:
        (profile?.lastProgressAt as number | undefined) ??
        (generationJob?.lastProgressAt as number | undefined) ??
        (lock?.updatedAt as number | undefined) ??
        null,
      lockStaleRecovered: lockRuntime.isStale,
      lockAgeMs: lockRuntime.lockAgeMs,
      lockStatus: lockStatus ?? null,
      generationJobStatus,
      resumeAttempted,
      phase: (lock?.phase as string | undefined) ?? null,
      completedTools: (lock?.completedTools as number | undefined) ?? null,
      totalTools: (lock?.totalTools as number | undefined) ?? null,
      currentToolSlug:
        (generationJob?.currentToolSlug as string | undefined) ??
        (lock?.currentToolSlug as string | undefined) ??
        null,
      currentToolElapsedMs: (generationJob?.currentToolElapsedMs as number | undefined) ?? null,
      lastHeartbeatAt,
      queuePosition:
        generationJobCompletedTools !== null && generationJobTotalTools !== null
          ? {
              completed: generationJobCompletedTools,
              total: generationJobTotalTools,
            }
          : null,
      stageBCompletedTools: (lock?.stageBCompletedTools as number | undefined) ?? null,
      stageBTotalTools: (lock?.stageBTotalTools as number | undefined) ?? null,
      updatedAt: (lock?.updatedAt as number | undefined) ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to check generation status' },
      { status: 500 }
    );
  }
}
