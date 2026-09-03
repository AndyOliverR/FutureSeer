/**
 * POST /api/profile/generate-catalog-batch
 *
 * Generate the next unfinished catalog tools (2 per request) after natal charts
 * are committed. Profile stays on this loop until allReportsReady or only
 * exhausted failures remain.
 *
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminAvailable, getDocument } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { calculateProfileDataHash, type UserProfile } from '@/lib/firebase';
import { ALL_TOOL_SLUGS, summarizeToolReadiness } from '@/lib/toolReportReadiness';
import { CATALOG_BATCH_SIZE, selectRunnableCatalogSlugs } from '@/lib/catalogBatchSelection';
import { rateLimiters } from '@/lib/rateLimit';
import { checkRateLimitWithOptionalFirestore } from '@/lib/rateLimitFirestore';
import { logServerError } from '@/lib/serverErrorLogging';
import { devLog } from '@/lib/devLogger';
import { generateAndPersistToolReports } from '@/lib/onDemandToolReports';
import type { PersistedToolStatusMap } from '@/lib/mysticalStageB';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  let uid: string | undefined;
  try {
    if (!ensureAdminAvailable('POST /api/profile/generate-catalog-batch')) {
      return NextResponse.json(
        { error: 'Report generation is temporarily unavailable. Please retry shortly.', code: 'admin_unavailable' },
        { status: 503 },
      );
    }

    const auth = await verifyUserRequest(request, 'generate-catalog-batch');
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.reason === 'missing_token' ? 'Missing Authorization Bearer token' : 'Invalid or expired token' },
        { status: 401 },
      );
    }
    uid = auth.uid;

    const genLimit = await checkRateLimitWithOptionalFirestore(
      rateLimiters.catalogBatch,
      'profile_generate_catalog_batch',
      uid,
    );
    if (!genLimit.allowed) {
      const retryAfter = Math.ceil((genLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: rateLimiters.catalogBatch.getErrorMessage(), retryAfter },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfter)) } },
      );
    }

    const userDoc = await getDocument('users', uid);
    if (!userDoc) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    const userProfile = userDoc as UserProfile;
    if (userProfile.mysticalProfileGenerated !== true) {
      return NextResponse.json(
        { error: 'Generate your profile first, then fill remaining reports.', code: 'profile_not_generated' },
        { status: 409 },
      );
    }

    const stored = ((await getDocument('comprehensiveMysticalProfiles', uid)) || {}) as Record<
      string,
      unknown
    >;
    const profileHash = calculateProfileDataHash(userProfile);
    const before = summarizeToolReadiness(stored, ALL_TOOL_SLUGS, profileHash);
    const toolStatus = (stored.toolStatus as PersistedToolStatusMap | undefined) ?? {};
    if (before.allReportsReady) {
      return NextResponse.json({
        success: true,
        allReportsReady: true,
        catalogFillComplete: true,
        readyToolsCount: before.readyToolsCount,
        pendingToolSlugs: [],
        totalTools: ALL_TOOL_SLUGS.length,
        generatedSlugs: [],
      });
    }

    const { batch: batchSlugs } = selectRunnableCatalogSlugs(
      before.pendingToolSlugs,
      toolStatus,
      CATALOG_BATCH_SIZE,
    );
    if (batchSlugs.length === 0) {
      return NextResponse.json({
        success: true,
        allReportsReady: false,
        catalogFillComplete: true,
        readyToolsCount: before.readyToolsCount,
        pendingToolSlugs: before.pendingToolSlugs,
        totalTools: ALL_TOOL_SLUGS.length,
        generatedSlugs: [],
      });
    }

    const result = await generateAndPersistToolReports({
      uid,
      profile: { ...userProfile, uid },
      profileHash,
      toolSlugs: batchSlugs,
      skipVedicComprehensive: false,
    });

    const readiness = result.readiness ?? summarizeToolReadiness(stored, ALL_TOOL_SLUGS, profileHash);
    const next = selectRunnableCatalogSlugs(
      readiness.pendingToolSlugs,
      result.toolStatus ?? toolStatus,
      CATALOG_BATCH_SIZE,
    );
    const catalogFillComplete = readiness.allReportsReady || next.batch.length === 0;

    return NextResponse.json({
      success: result.failedSlugs.length === 0,
      allReportsReady: readiness.allReportsReady,
      catalogFillComplete,
      readyToolsCount: readiness.readyToolsCount,
      pendingToolSlugs: readiness.pendingToolSlugs,
      totalTools: ALL_TOOL_SLUGS.length,
      generatedSlugs: batchSlugs,
      failedSlugs: result.failedSlugs,
    });
  } catch (err) {
    devLog.error('generate-catalog-batch API error', err, 'generate-catalog-batch');
    try {
      await logServerError({
        area: 'mystical-profile',
        action: 'generate_catalog_batch',
        message: err instanceof Error ? err.message : 'Unknown generate-catalog-batch error',
        userId: uid,
        route: request.nextUrl.pathname,
      });
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate catalog reports' },
      { status: 500 },
    );
  }
}
