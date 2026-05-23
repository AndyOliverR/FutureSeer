import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import {
  isWeeklyDigestEnabled,
  sendWeeklySocialDigestEmail,
} from '@/lib/growth/socialWeeklyDigestEmail';

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = process.env.CRON_SECRET;
  return !!secret && !!token && token === secret;
}

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/weekly-social-digest
 * Monday checklist email to SOCIAL_WEEKLY_DIGEST_EMAIL (Vercel Cron + CRON_SECRET).
 */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWeeklyDigestEnabled()) {
    return NextResponse.json({
      skipped: true,
      reason: 'Set SOCIAL_WEEKLY_DIGEST_EMAIL (and RESEND_API_KEY) to enable',
    });
  }

  try {
    const sent = await sendWeeklySocialDigestEmail();
    if (!sent) {
      return NextResponse.json({ error: 'Failed to send digest' }, { status: 500 });
    }
    return NextResponse.json({ sent: true });
  } catch (err) {
    devLog.error('Cron weekly-social-digest error:', err, 'route');
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
