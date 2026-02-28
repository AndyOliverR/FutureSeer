/**
 * POST /api/profile/save-tool-report
 *
 * Persist a single tool's report into the user's comprehensive mystical profile.
 * Used when a tool report was generated on-demand (e.g. Hellenistic) so that
 * returning visits load from cache instead of calling the tool API again.
 *
 * Body: { toolSlug: string, data: object }
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { setDocument, isAdminAvailable } from '@/lib/firebase-admin';
import { ALL_TOOL_SLUGS } from '@/lib/profileGenerationOrchestrator';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';

/** Any slug the pipeline can store can also be saved incrementally via this API. */
const ALLOWED_TOOL_SLUGS = new Set([...ALL_TOOL_SLUGS, 'vedicAstroNumerology', 'astroNumerology']);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const toolSlug = typeof body?.toolSlug === 'string' ? body.toolSlug.trim() : '';
    const data = body?.data;

    if (!toolSlug || !ALLOWED_TOOL_SLUGS.has(toolSlug)) {
      return NextResponse.json(
        { error: 'Invalid or disallowed toolSlug' },
        { status: 400 }
      );
    }

    if (data === undefined || data === null) {
      return NextResponse.json(
        { error: 'Missing or invalid data' },
        { status: 400 }
      );
    }

    if (!isAdminAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    await setDocument('comprehensiveMysticalProfiles', uid, { [toolSlug]: data });

    devLog.debug('Saved tool report to profile', { uid, toolSlug }, 'save-tool-report');

    return NextResponse.json({
      success: true,
      message: 'Tool report saved to profile.',
    });
  } catch (err) {
    devLog.error('save-tool-report API error', err, 'save-tool-report');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save tool report' },
      { status: 500 }
    );
  }
}
