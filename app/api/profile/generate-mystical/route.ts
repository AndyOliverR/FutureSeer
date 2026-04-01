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
import { generateAllReports } from '@/lib/reportGenerationService';
import { ALL_TOOL_SLUGS } from '@/lib/profileGenerationOrchestrator';
import type { UserProfile } from '@/lib/firebase';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
import { calculateProfileDataHash } from '@/lib/firebase';
import { normalizeBirthTime } from '@/lib/birthTimeUtils';
import { devLog } from '@/lib/devLogger';
import {
  getEditLimit,
  shouldResetPeriod,
  isPaidPlan,
} from '@/lib/profileEditQuota';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
import { logServerError } from '@/lib/serverErrorLogging';
import { rateLimiters } from '@/lib/rateLimit';
import { acquireMysticalGenerationLock } from '@/lib/generationLock';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for all tools

/** Grace past `maxDuration` before treating a lock as stale (failed/crashed run). */
function mysticalLockStaleMs(): number {
  return maxDuration * 1000 + 90_000;
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

    const genLimit = rateLimiters.profileGeneration.check(`profile_gen:${uid}`);
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
    const selectedPlan = (userProfile.selectedPlan ?? userProfile.selected_plan) as string | undefined;
    const hasPlan = selectedPlan && typeof selectedPlan === 'string' && selectedPlan.trim().length > 0;
    if (!isNoChargeSubscriptionEmail(email) && !hasPlan) {
      return NextResponse.json(
        { error: 'Please select a plan to generate your mystical profile.' },
        { status: 403 }
      );
    }

    // Profile edit quota: reject if over limit (no-charge / admin emails bypass)
    if (!isNoChargeSubscriptionEmail(email)) {
      const limit = getEditLimit(selectedPlan);
      const isPaid = isPaidPlan(selectedPlan);
      const now = new Date();
      let count = typeof userProfile.profileEditCount === 'number' ? userProfile.profileEditCount : 0;
      const periodStart = typeof userProfile.profileEditPeriodStart === 'number' ? userProfile.profileEditPeriodStart : undefined;
      if (shouldResetPeriod(periodStart, now, isPaid)) {
        count = 0;
      }
      if (count > limit) {
        return NextResponse.json(
          { error: 'Profile update limit reached for this period. Upgrade your plan for more.' },
          { status: 403 }
        );
      }
    }

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
    try {
      const body = await request.json().catch(() => ({}));
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
      const missingSlugs = ALL_TOOL_SLUGS.filter((slug) => {
        const value = storedProfile[slug];
        // Consider missing if key absent or placeholder (no real report)
        if (value == null) return true;
        if (typeof value === 'object' && (value as { placeholder?: boolean }).placeholder === true) return true;
        return false;
      });
      if (missingSlugs.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Profile already generated.',
          alreadyGenerated: true,
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
          message: 'Profile generation is already running for this request.',
        },
        { status: 202 }
      );
    }
    if (lockResult === 'concurrent') {
      return NextResponse.json(
        { error: 'Profile generation is already in progress. Please wait for it to complete.' },
        { status: 409 }
      );
    }

    // Check for selective retry of failed tools via query param
    let retryOnly: string[] | null = null;
    const retryParam = request.nextUrl.searchParams.get('retryTools');
    if (retryParam) {
      retryOnly = retryParam.split(',').map(s => s.trim()).filter(Boolean);
      devLog.info(`[generate-mystical] Selective retry for tools: ${retryOnly.join(', ')}`, 'generate-mystical');
    }

    const result = await generateAllReports(uid, profileWithUid as unknown as UserProfile);

    if (result.aggregateUsage && adminDb) {
      const runId = Date.now().toString();
      try {
        await adminDb
          .collection('profileGenerationUsage')
          .doc(uid)
          .collection('runs')
          .doc(runId)
          .set({
            promptTokens: result.aggregateUsage.promptTokens,
            completionTokens: result.aggregateUsage.completionTokens,
            totalTokens: result.aggregateUsage.totalTokens,
            generatedAt: new Date().toISOString(),
            toolCount: result.systemsUsed?.length ?? 0,
          });
      } catch (usageErr) {
        devLog.warn('[generate-mystical] Failed to store aggregate usage (non-blocking)', usageErr, 'generate-mystical');
      }
    }

    if (!result.success && result.systemsUsed.length === 0) {
      const errorMessage = 'Profile generation failed. Vedic chart could not be generated.';
      await logServerError({
        area: 'profile',
        action: 'generate_mystical',
        message: errorMessage,
        userId: uid ?? null,
        route: '/api/profile/generate-mystical',
        meta: { systemsUsed: result.systemsUsed?.length ?? 0, failedTools: result.failedTools ?? [] },
      }).catch(() => {});
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Store comprehensive profile
    if (!isAdminAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const cleanData = (obj: unknown): unknown => {
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
    };

    const toStore = cleanData(result.comprehensiveProfile);
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
      profileStatus: 'completed',
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
          ...result.seerMaster,
          userId: uid,
          generatedAt: new Date().toISOString(),
          systemsUsed: result.systemsUsed,
        },
      },
    ]);

    if (!batchSuccess) {
      return NextResponse.json({ error: 'Failed to save profile data. Please try again.' }, { status: 500 });
    }

    // Invalidate divination cache
    clearCachedDivinationData(uid);

    // Release generation lock
    await setDocument('generationLocks', uid, { lockedAt: null, status: 'completed', completedAt: Date.now() });

    const response: Record<string, unknown> = {
      success: true,
      systemsUsed: result.systemsUsed,
      failedTools: result.failedTools,
      message: 'Mystical profile generated successfully. All tools have run.',
      comprehensiveProfile: toStore,
    };

    if (result.failedTools && result.failedTools.length > 0) {
      response.retryUrl = `/api/profile/generate-mystical?retryTools=${result.failedTools.join(',')}`;
      response.message = `Profile generated with ${result.failedTools.length} tool(s) that need retry: ${result.failedTools.join(', ')}`;
    }

    return NextResponse.json(response);
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
