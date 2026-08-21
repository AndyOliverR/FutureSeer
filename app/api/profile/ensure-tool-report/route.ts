/**
 * POST /api/profile/ensure-tool-report
 *
 * Generate and persist a single tool report when the user opens that tool.
 * Idempotent for the current profileDataHash.
 *
 * Body: { toolSlug: string }
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminAvailable, getDocument } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { calculateProfileDataHash, type UserProfile } from '@/lib/firebase';
import { isReadyToolReport } from '@/lib/toolReportReadiness';
import { rateLimiters } from '@/lib/rateLimit';
import { checkRateLimitWithOptionalFirestore } from '@/lib/rateLimitFirestore';
import { logServerError } from '@/lib/serverErrorLogging';
import { devLog } from '@/lib/devLogger';
import {
  generateAndPersistToolReports,
  isOnDemandToolSlug,
  storedReportMatchesHash,
} from '@/lib/onDemandToolReports';
import { hasToolReportExtraInputs, sanitizeToolReportExtraInputs } from '@/lib/toolReportExtraInputs';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  let uid: string | undefined;
  try {
    if (!ensureAdminAvailable('POST /api/profile/ensure-tool-report')) {
      return NextResponse.json(
        { error: 'Report generation is temporarily unavailable. Please retry shortly.', code: 'admin_unavailable' },
        { status: 503 },
      );
    }

    const auth = await verifyUserRequest(request, 'ensure-tool-report');
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.reason === 'missing_token' ? 'Missing Authorization Bearer token' : 'Invalid or expired token' },
        { status: 401 },
      );
    }
    uid = auth.uid;

    const genLimit = await checkRateLimitWithOptionalFirestore(
      rateLimiters.user,
      'profile_ensure_tool_report',
      uid,
    );
    if (!genLimit.allowed) {
      const retryAfter = Math.ceil((genLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: rateLimiters.user.getErrorMessage(), retryAfter },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfter)) } },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      toolSlug?: unknown
      extraInputs?: unknown
    };
    const toolSlug = typeof body.toolSlug === 'string' ? body.toolSlug.trim() : '';
    if (!toolSlug || !isOnDemandToolSlug(toolSlug)) {
      return NextResponse.json({ error: 'Invalid or disallowed toolSlug' }, { status: 400 });
    }

    const extraInputs = sanitizeToolReportExtraInputs(body.extraInputs);

    const userDoc = await getDocument('users', uid);
    if (!userDoc) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    const userProfile = userDoc as UserProfile;
    if (userProfile.mysticalProfileGenerated !== true) {
      return NextResponse.json(
        { error: 'Generate your profile first, then open this tool.', code: 'profile_not_generated' },
        { status: 409 },
      );
    }

    const profileHash = calculateProfileDataHash(userProfile);
    const stored = ((await getDocument('comprehensiveMysticalProfiles', uid)) || {}) as Record<string, unknown>;
    const existing = stored[toolSlug];
    const forceRefresh = hasToolReportExtraInputs(extraInputs);
    if (
      !forceRefresh &&
      isReadyToolReport(existing, toolSlug) &&
      storedReportMatchesHash(existing, profileHash)
    ) {
      return NextResponse.json({
        success: true,
        alreadyReady: true,
        toolSlug,
        report: existing,
      });
    }

    const result = await generateAndPersistToolReports({
      uid,
      profile: { ...userProfile, uid },
      profileHash,
      toolSlugs: [toolSlug],
      skipVedicComprehensive: false,
      extraInputs,
    });
    const report = result.toolReports[toolSlug]?.data ?? stored[toolSlug] ?? null;
    const failed = result.failedSlugs.includes(toolSlug);

    return NextResponse.json({
      success: !failed,
      alreadyReady: false,
      toolSlug,
      report,
      error: failed ? (result.toolReports[toolSlug]?.error ?? 'This reading could not be generated.') : undefined,
    }, { status: failed ? 502 : 200 });
  } catch (err) {
    devLog.error('ensure-tool-report API error', err, 'ensure-tool-report');
    try {
      await logServerError({
        area: 'mystical-profile',
        action: 'ensure_tool_report',
        message: err instanceof Error ? err.message : 'Unknown ensure-tool-report error',
        userId: uid,
        route: request.nextUrl.pathname,
      });
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate this tool report' },
      { status: 500 },
    );
  }
}
