/**
 * POST /api/profile/generate-mystical
 *
 * Commits the user profile and persists natal charts (vedic + western, no catalog LLM).
 * Remaining tools generate on visit via POST /api/profile/ensure-tool-report.
 *
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb, ensureAdminAvailable, getDocument, setDocument } from '@/lib/firebase-admin';
import { ALL_TOOL_SLUGS, summarizeToolReadiness } from '@/lib/profileGenerationOrchestrator';
import { extractFailedToolSummaries } from '@/lib/generationFailureUx';
import type { UserProfile } from '@/lib/firebase';
import { calculateProfileDataHash } from '@/lib/firebase';
import { normalizeBirthTime } from '@/lib/birthTimeUtils';
import { devLog } from '@/lib/devLogger';
import {
  getMissingFullProfileFields,
  isNoChargeSubscriptionEmail,
} from '@/lib/subscriptionConfig';
import { consumeBillingAction } from '@/lib/billingCreditsServer';
import { hasUnlimitedBillingAccess } from '@/lib/billingAccess';
import { logServerError } from '@/lib/serverErrorLogging';
import { rateLimiters } from '@/lib/rateLimit';
import { checkRateLimitWithOptionalFirestore } from '@/lib/rateLimitFirestore';
import { acquireMysticalGenerationLock, getMysticalLockRuntimeStatus } from '@/lib/generationLock';
import type { PersistedToolStatusMap } from '@/lib/mysticalStageB';
import {
  generateAndPersistToolReports,
  NATAL_CHART_SLUGS,
} from '@/lib/onDemandToolReports';

export const dynamic = 'force-dynamic';
/** Natal charts only (vedic + western). Full catalog is on-demand per tool. */
export const maxDuration = 60;
const HEARTBEAT_STALE_MS = 45_000;

function resolveBaseUrlSource(): string {
  if (process.env.INTERNAL_BASE_URL) return 'INTERNAL_BASE_URL';
  if (process.env.NEXT_PUBLIC_BASE_URL) return 'NEXT_PUBLIC_BASE_URL';
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return 'VERCEL_PROJECT_PRODUCTION_URL';
  if (process.env.VERCEL_URL) return 'VERCEL_URL';
  if (process.env.NODE_ENV === 'development') return 'localhost_fallback';
  return 'futureseer_app_fallback';
}

function auditGeneration(tag: string, payload: Record<string, unknown>): void {
  // Temporary production diagnostics for local/prod parity verification.
  const safe = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
  console.info(`[GENERATE-MYSTICAL-AUDIT] ${tag}`, safe);
}

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
  | 'unchanged_hash_committed'
  | 'unchanged_hash_all_ready'
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
    const baseUrlSource = resolveBaseUrlSource();
    if (!ensureAdminAvailable('POST /api/profile/generate-mystical')) {
      auditGeneration('post_admin_unavailable', {
        uid: uid ?? null,
        baseUrlSource,
      });
      return NextResponse.json(
        {
          error: 'Profile generation is temporarily unavailable on this deployment. Please retry shortly.',
          code: 'admin_unavailable',
        },
        { status: 503 },
      );
    }

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
        const profileForBilling = profileWithUid as Partial<UserProfile>;
        if (!hasUnlimitedBillingAccess(profileForBilling)) {
          const billing = await consumeBillingAction(uid, 'profile_regen');
          if (!billing.ok) {
            const auditId = await writeRegenDecisionTelemetry(uid, {
              event: 'mystical_regen_blocked_payment',
              generationMode,
              hashMatch: false,
              pendingToolCount: 0,
              reason: 'payment_blocked',
            });
            return NextResponse.json(
              {
                error: 'Add credits to regenerate your full mystical profile, or choose unlimited membership.',
                blockReason: 'credits_required',
                code: 'insufficient_credits',
                creditBalance: billing.creditBalance,
                creditsRequired: billing.creditsRequired,
                addCreditsUrl: '/credits',
                missingFields: missingFullFields,
                generationMode,
                decision: 'blocked',
                decisionReason: 'payment_blocked',
                auditId,
              },
              { status: 402 },
            );
          }
        }
      }
    }

    // Idempotent: same hash already committed — remaining tools generate on visit.
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
      const auditId = await writeRegenDecisionTelemetry(uid, {
        event: 'mystical_regen_skipped_unchanged',
        generationMode,
        hashMatch: true,
        pendingToolCount: 0,
        reason: 'unchanged_hash_committed',
      });
      return NextResponse.json({
        success: true,
        message: 'Profile already generated. Open a tool to generate its reading.',
        alreadyGenerated: true,
        allReportsReady: true,
        readyToolsCount: readiness.readyToolsCount,
        pendingToolSlugs: [],
        skipReason: 'unchanged_hash_committed',
        decision: 'skipped',
        decisionReason: 'unchanged_hash_committed',
        generationState: 'completed',
        auditId,
      });
    }
    decisionAuditId = await writeRegenDecisionTelemetry(uid, {
      event: 'mystical_regen_hash_changed',
      generationMode,
      hashMatch: false,
      pendingToolCount: NATAL_CHART_SLUGS.length,
      reason: 'profile_hash_changed',
    });
    devLog.info(`[generate-mystical] decision=rerun reason=profile_hash_changed auditId=${decisionAuditId}`, 'generate-mystical');

    const idempotencyKey =
      request.headers.get('Idempotency-Key')?.trim() ||
      request.headers.get('X-Idempotency-Key')?.trim() ||
      undefined;

    const lockResult = await acquireMysticalGenerationLock(uid, idempotencyKey, mysticalLockStaleMs());
    if (lockResult === 'idempotent_in_progress') {
      auditGeneration('post_idempotent_in_progress', {
        uid,
        lockResult,
        baseUrlSource,
      });
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
      auditGeneration('post_concurrent_lock', {
        uid,
        lockResult,
        baseUrlSource,
      });
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
      pendingToolSlugs: [],
      updatedAt: now,
    };
    for (const key of profileDefiningFields) {
      if (profileWithUid[key] !== undefined) userUpdate[key] = profileWithUid[key];
    }

    const userWriteOk = await setDocument('users', uid, userUpdate);
    const lockWriteOk = await setDocument('generationLocks', uid, {
      status: 'running',
      phase: 'natal',
      totalTools: NATAL_CHART_SLUGS.length,
      completedTools: 0,
      startedAt: now,
      updatedAt: now,
      currentToolSlug: 'vedic',
      pipelineMode: 'on_demand',
    });
    if (!userWriteOk || !lockWriteOk) {
      throw new Error('Failed to persist generation state. Check Firebase Admin availability.');
    }
    auditGeneration('post_natal_start', {
      uid,
      lockResult,
      generationMode,
      decisionReason: 'profile_hash_changed',
      baseUrlSource,
      natalTools: NATAL_CHART_SLUGS,
    });

    let natalReady: string[] = [];
    let natalFailed: string[] = [];
    try {
      const natal = await generateAndPersistToolReports({
        uid,
        profile: profileWithUid as unknown as UserProfile,
        profileHash: newHash,
        toolSlugs: NATAL_CHART_SLUGS,
        skipVedicComprehensive: true,
      });
      natalReady = natal.readySlugs;
      natalFailed = natal.failedSlugs;
    } catch (natalErr) {
      devLog.warn('[generate-mystical] Natal chart persist failed (profile still committed)', natalErr, 'generate-mystical');
      natalFailed = [...NATAL_CHART_SLUGS];
      await setDocument('users', uid, {
        mysticalProfileGenerated: true,
        mysticalProfileGeneratedAt: Date.now(),
        profileDataHash: newHash,
        profileStatus: 'completed',
        allReportsReady: true,
        pendingToolSlugs: [],
        updatedAt: Date.now(),
      });
      await setDocument('generationLocks', uid, {
        lockedAt: null,
        status: 'completed',
        phase: 'completed',
        allReportsReady: true,
        pendingToolSlugs: [],
        updatedAt: Date.now(),
      });
    }

    auditGeneration('post_committed', {
      uid,
      natalReady,
      natalFailed,
      baseUrlSource,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile saved. Natal charts are ready — open any tool to generate its reading.',
      generationState: 'completed',
      generationMode,
      decision: 'rerun',
      decisionReason: 'profile_hash_changed',
      auditId: decisionAuditId,
      phase: 'completed',
      completedTools: natalReady.length,
      totalTools: NATAL_CHART_SLUGS.length,
      readyToolsCount: natalReady.length,
      pendingToolSlugs: [],
      allReportsReady: true,
      natalReady,
      natalFailed,
      toolStatus: buildToolStatus({}, now),
    });
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
    const baseUrlSource = resolveBaseUrlSource();
    if (!ensureAdminAvailable('GET /api/profile/generate-mystical')) {
      auditGeneration('get_admin_unavailable', {
        uid: null,
        baseUrlSource,
      });
      return NextResponse.json(
        {
          error: 'Generation status is temporarily unavailable on this deployment. Please retry shortly.',
          code: 'admin_unavailable',
        },
        { status: 503 },
      );
    }

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
    const lastHeartbeatAt = typeof generationJob?.lastHeartbeatAt === 'number' ? generationJob.lastHeartbeatAt : null;
    const runningHeartbeatStale =
      generationJobStatus === 'running' &&
      (lastHeartbeatAt == null || Date.now() - lastHeartbeatAt > HEARTBEAT_STALE_MS);
    const inProgress = lockRuntime.isRunning && !lockRuntime.isStale && !runningHeartbeatStale;
    const catalogCommitted = generated && !inProgress;
    const allReportsReady = catalogCommitted;
    const pendingToolSlugs: string[] = [];
    const partialReady = false;
    const completed = catalogCommitted;
    const generationState = inProgress
      ? 'running'
      : catalogCommitted
        ? 'completed'
        : 'not_started';

    if (generated && (!Boolean(user?.allReportsReady) || (Array.isArray(user?.pendingToolSlugs) && (user.pendingToolSlugs as unknown[]).length > 0))) {
      await setDocument('users', uid, {
        allReportsReady: true,
        pendingToolSlugs: [],
        profileStatus: inProgress ? 'running' : 'completed',
        updatedAt: Date.now(),
      });
    }

    if (lockRuntime.isRunning && lockRuntime.isStale) {
      await setDocument('generationLocks', uid, {
        status: 'completed',
        phase: 'stale_timeout',
        staleRecovered: true,
        staleRecoveredAt: Date.now(),
        completedTools: readiness.readyToolsCount,
        readyToolsCount: readiness.readyToolsCount,
        pendingToolSlugs: [],
        allReportsReady: true,
        updatedAt: Date.now(),
      });
    }

    const resumeAttempted = false;

    const generationJobCompletedToolsRaw = generationJob?.completedTools;
    const generationJobTotalToolsRaw = generationJob?.totalTools;
    const generationJobCompletedTools =
      typeof generationJobCompletedToolsRaw === 'number' ? generationJobCompletedToolsRaw : null;
    const generationJobTotalTools =
      typeof generationJobTotalToolsRaw === 'number' ? generationJobTotalToolsRaw : null;
    auditGeneration('get_status_summary', {
      uid,
      generationState,
      jobStatus: generationJobStatus,
      lockStatus: lockStatus ?? null,
      lastHeartbeatAt,
      readyToolsCount: readiness.readyToolsCount,
      pendingCount: pendingToolSlugs.length,
      resumeAttempted,
      currentToolSlug:
        (generationJob?.currentToolSlug as string | undefined) ??
        (lock?.currentToolSlug as string | undefined) ??
        null,
      baseUrlSource,
    });
    const failedToolSummaries = !inProgress ? extractFailedToolSummaries(profile) : [];
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
      failedToolSlugs: failedToolSummaries.map((t) => t.slug),
      failedTools: failedToolSummaries,
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
