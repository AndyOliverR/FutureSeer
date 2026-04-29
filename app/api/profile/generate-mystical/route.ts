/**
 * POST /api/profile/generate-mystical
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
import { getAuth } from 'firebase-admin/auth';
import { getDocument, setDocument, batchSetDocuments, isAdminAvailable, adminDb } from '@/lib/firebase-admin';
import { generateAllReports, generateCoreReportsStageA, getCoreStageToolCount } from '@/lib/reportGenerationService';
import { ALL_TOOL_SLUGS, summarizeToolReadiness } from '@/lib/profileGenerationOrchestrator';
import type { UserProfile } from '@/lib/firebase';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
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
import { acquireMysticalGenerationLock } from '@/lib/generationLock';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for all tools

/** Grace past `maxDuration` before treating a lock as stale (failed/crashed run). */
function mysticalLockStaleMs(): number {
  return maxDuration * 1000 + 90_000;
}

function cleanData(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => cleanData(item));
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      cleaned[key] = cleanData(value);
    }
  }
  return cleaned;
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

    if (hashMatches) {
      const stored = await getDocument('comprehensiveMysticalProfiles', uid);
      const storedProfile = (stored || {}) as Record<string, unknown>;
      const readiness = summarizeToolReadiness(storedProfile, ALL_TOOL_SLUGS);
      const missingSlugs = readiness.pendingToolSlugs;
      if (missingSlugs.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Profile already generated.',
          alreadyGenerated: true,
          allReportsReady: true,
          readyToolsCount: readiness.readyToolsCount,
          pendingToolSlugs: [],
        });
      }
      devLog.info(
        `[generate-mystical] Re-running pipeline to backfill missing tools: ${missingSlugs.join(', ')}`,
        'generate-mystical'
      );
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

    await setDocument('generationLocks', uid, {
      status: 'running',
      phase: 'stageA',
      totalTools: ALL_TOOL_SLUGS.length,
      completedTools: 0,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const stageAResult = await generateCoreReportsStageA(uid, profileWithUid as unknown as UserProfile);

    if (stageAResult.aggregateUsage && adminDb) {
      const runId = Date.now().toString();
      try {
        await adminDb
          .collection('profileGenerationUsage')
          .doc(uid)
          .collection('runs')
          .doc(runId)
          .set({
            promptTokens: stageAResult.aggregateUsage.promptTokens,
            completionTokens: stageAResult.aggregateUsage.completionTokens,
            totalTokens: stageAResult.aggregateUsage.totalTokens,
            generatedAt: new Date().toISOString(),
            toolCount: stageAResult.systemsUsed?.length ?? 0,
            phase: 'stageA',
          });
      } catch (usageErr) {
        devLog.warn('[generate-mystical] Failed to store aggregate usage (non-blocking)', usageErr, 'generate-mystical');
      }
    }

    if (!stageAResult.success && stageAResult.systemsUsed.length === 0) {
      const errorMessage = 'Profile generation failed. Vedic chart could not be generated.';
      await logServerError({
        area: 'profile',
        action: 'generate_mystical',
        message: errorMessage,
        userId: uid ?? null,
        route: '/api/profile/generate-mystical',
        meta: { systemsUsed: stageAResult.systemsUsed?.length ?? 0, failedTools: stageAResult.failedTools ?? [] },
      }).catch(() => {});
      await setDocument('generationLocks', uid, {
        status: 'failed',
        phase: 'stageA_failed',
        completedTools: 0,
        totalTools: ALL_TOOL_SLUGS.length,
        failedAt: Date.now(),
        updatedAt: Date.now(),
      });

      return NextResponse.json(
        {
          success: true,
          generationState: 'stageA_failed',
          message: 'Core profile generation could not complete. Please retry Vedic chart generation.',
          systemsUsed: stageAResult.systemsUsed,
          failedTools: stageAResult.failedTools,
          partial: true,
          error: errorMessage,
        },
        { status: 202 }
      );
    }

    // Store comprehensive profile
    if (!isAdminAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const toStore = cleanData(stageAResult.comprehensiveProfile);
    // Omit duplicate toolReports so we stay under Firestore 1 MiB limit; each tool is already at top-level (vedic, western, scrying, etc.)
    delete (toStore as Record<string, unknown>).toolReports;

    // Preserve existing real tool reports when this run produced a placeholder (e.g. BaZi API failed on re-run)
    const storedBeforeWrite = await getDocument('comprehensiveMysticalProfiles', uid);
    const storedProfile = (storedBeforeWrite || {}) as Record<string, unknown>;
    for (const slug of ALL_TOOL_SLUGS) {
      const newVal = (toStore as Record<string, unknown>)[slug];
      const existingVal = storedProfile[slug];
      const newIsPlaceholder =
        newVal != null &&
        typeof newVal === 'object' &&
        (newVal as { placeholder?: boolean }).placeholder === true;
      const existingIsRealReport =
        existingVal != null &&
        typeof existingVal === 'object' &&
        (existingVal as { placeholder?: boolean }).placeholder !== true;
      if (newIsPlaceholder && existingIsRealReport) {
        (toStore as Record<string, unknown>)[slug] = existingVal;
        devLog.info(`[generate-mystical] Preserved existing real report for tool: ${slug}`, 'generate-mystical');
      }
    }
    // Preserve pipeline-derived reports (not in ALL_TOOL_SLUGS) when this run didn't produce them or produced placeholder
    const EXTRA_PROFILE_KEYS = ['vedicAstroNumerology', 'astroNumerology'] as const;
    for (const slug of EXTRA_PROFILE_KEYS) {
      const newVal = (toStore as Record<string, unknown>)[slug];
      const existingVal = storedProfile[slug];
      const newIsPlaceholder =
        newVal != null &&
        typeof newVal === 'object' &&
        (newVal as { placeholder?: boolean }).placeholder === true;
      const existingIsRealReport =
        existingVal != null &&
        typeof existingVal === 'object' &&
        (existingVal as { placeholder?: boolean }).placeholder !== true;
      const shouldPreserve = existingIsRealReport && (newVal == null || newIsPlaceholder);
      if (shouldPreserve) {
        (toStore as Record<string, unknown>)[slug] = existingVal;
        devLog.info(`[generate-mystical] Preserved existing real report for tool: ${slug}`, 'generate-mystical');
      }
    }

    const newHash = calculateProfileDataHash(profileWithUid as Partial<UserProfile>);
    const profileDefiningFields = [
      'birthDate', 'birthTime', 'birthPlace', 'currentLocation', 'fullName', 'displayName',
      'gender', 'facePhotoUrl', 'palmPhotoUrl', 'birthLatitude', 'birthLongitude',
    ] as const;
    const userUpdate: Record<string, unknown> = {
      mysticalProfileGenerated: true,
      mysticalProfileGeneratedAt: Date.now(),
      profileDataHash: newHash,
      profileStatus: 'stageA_complete_stageB_running',
      allReportsReady: false,
      pendingToolSlugs: ALL_TOOL_SLUGS,
      updatedAt: Date.now(),
    };
    for (const key of profileDefiningFields) {
      if (profileWithUid[key] !== undefined) {
        userUpdate[key] = profileWithUid[key];
      }
    }
    const batchSuccess = await batchSetDocuments([
      { collection: 'comprehensiveMysticalProfiles', docId: uid, data: toStore },
      {
        collection: 'users',
        docId: uid,
        data: userUpdate,
      },
      {
        collection: 'seerMaster',
        docId: uid,
        data: {
          ...stageAResult.seerMaster,
          userId: uid,
          generatedAt: new Date().toISOString(),
          systemsUsed: stageAResult.systemsUsed,
        },
      },
    ]);

    if (!batchSuccess) {
      return NextResponse.json({ error: 'Failed to save profile data. Please try again.' }, { status: 500 });
    }

    // Invalidate divination cache
    clearCachedDivinationData(uid);

    await setDocument('generationLocks', uid, {
      status: 'running',
      phase: 'stageB',
      totalTools: ALL_TOOL_SLUGS.length,
      completedTools: getCoreStageToolCount(),
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const stageAReadiness = summarizeToolReadiness(toStore as Record<string, unknown>, ALL_TOOL_SLUGS);
    const response: Record<string, unknown> = {
      success: true,
      systemsUsed: stageAResult.systemsUsed,
      failedTools: stageAResult.failedTools,
      message: 'Core profile generated. Remaining systems are completing in the background.',
      generationState: 'stageA_complete_stageB_running',
      generationMode,
      phase: 'stageB',
      completedTools: getCoreStageToolCount(),
      totalTools: ALL_TOOL_SLUGS.length,
      readyToolsCount: stageAReadiness.readyToolsCount,
      pendingToolSlugs: stageAReadiness.pendingToolSlugs,
      allReportsReady: stageAReadiness.allReportsReady,
      comprehensiveProfile: toStore,
    };
    void (async () => {
      try {
        const coreCount = getCoreStageToolCount();
        const totalTools = ALL_TOOL_SLUGS.length;
        const result = await generateAllReports(uid!, profileWithUid as unknown as UserProfile, {
          onProgress: async ({ completedTools }) => {
            const stageBCompleted = Math.max(0, completedTools - coreCount);
            const stageBTotal = Math.max(0, totalTools - coreCount);
            const overallCompleted = Math.min(totalTools, coreCount + stageBCompleted);
            await setDocument('generationLocks', uid!, {
              status: 'running',
              phase: 'stageB',
              completedTools: overallCompleted,
              totalTools,
              stageBCompletedTools: stageBCompleted,
              stageBTotalTools: stageBTotal,
              updatedAt: Date.now(),
            });
          },
        });
        const finalToStore = cleanData(result.comprehensiveProfile);
        delete (finalToStore as Record<string, unknown>).toolReports;
        const finalReadiness = summarizeToolReadiness(finalToStore as Record<string, unknown>, ALL_TOOL_SLUGS);
        const batchSuccessFinal = await batchSetDocuments([
          { collection: 'comprehensiveMysticalProfiles', docId: uid!, data: finalToStore },
          {
            collection: 'users',
            docId: uid!,
            data: {
              mysticalProfileGenerated: true,
              mysticalProfileGeneratedAt: Date.now(),
              profileDataHash: newHash,
              profileStatus: 'completed',
              allReportsReady: finalReadiness.allReportsReady,
              pendingToolSlugs: finalReadiness.pendingToolSlugs,
              updatedAt: Date.now(),
            },
          },
          {
            collection: 'seerMaster',
            docId: uid!,
            data: {
              ...result.seerMaster,
              userId: uid!,
              generatedAt: new Date().toISOString(),
              systemsUsed: result.systemsUsed,
            },
          },
        ]);
        if (!batchSuccessFinal) {
          throw new Error('Failed to save Stage B data.');
        }
        await setDocument('generationLocks', uid!, {
          lockedAt: null,
          status: 'completed',
          phase: 'completed',
          completedAt: Date.now(),
          completedTools: ALL_TOOL_SLUGS.length,
          totalTools: ALL_TOOL_SLUGS.length,
          readyToolsCount: finalReadiness.readyToolsCount,
          pendingToolSlugs: finalReadiness.pendingToolSlugs,
          allReportsReady: finalReadiness.allReportsReady,
          updatedAt: Date.now(),
        });
        clearCachedDivinationData(uid!);
      } catch (bgErr) {
        devLog.error('[generate-mystical] Stage B continuation failed', bgErr, 'generate-mystical');
        await setDocument('generationLocks', uid!, {
          lockedAt: null,
          status: 'failed',
          phase: 'failed',
          failedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    })();

    return NextResponse.json(response, { status: 202 });
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
    const [userDoc, lockDoc, profileDoc] = await Promise.all([
      getDocument('users', uid),
      getDocument('generationLocks', uid),
      getDocument('comprehensiveMysticalProfiles', uid),
    ]);
    const user = (userDoc as Record<string, unknown> | null) ?? {};
    const lock = (lockDoc as Record<string, unknown> | null) ?? {};
    const profile = (profileDoc as Record<string, unknown> | null) ?? {};
    const lockStatus = lock?.status;
    const inProgress = lockStatus === 'running' || lockStatus === 'started';
    const generated = !inProgress && Boolean(user?.mysticalProfileGenerated);
    const readiness = summarizeToolReadiness(profile, ALL_TOOL_SLUGS);
    return NextResponse.json({
      success: true,
      inProgress,
      generated,
      hasProfile: Boolean(profileDoc),
      allReportsReady: Boolean(user?.allReportsReady ?? readiness.allReportsReady),
      readyToolsCount: readiness.readyToolsCount,
      pendingToolSlugs: readiness.pendingToolSlugs,
      lockStatus: lockStatus ?? null,
      phase: (lock?.phase as string | undefined) ?? null,
      completedTools: (lock?.completedTools as number | undefined) ?? null,
      totalTools: (lock?.totalTools as number | undefined) ?? null,
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
