import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminApiAuth';
import {
  getWeeklyDigestRecipient,
  isWeeklyDigestEnabled,
  sendWeeklySocialDigestEmail,
} from '@/lib/growth/socialWeeklyDigestEmail';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/social/send-weekly-digest
 * Manually send the Monday-style weekly checklist email (admin only).
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  const auth = await verifyAdminRequest(request, 'admin/social/send-weekly-digest');
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recipient = getWeeklyDigestRecipient();
  if (!isWeeklyDigestEnabled()) {
    return NextResponse.json(
      {
        error:
          'Weekly digest is disabled. Set SOCIAL_WEEKLY_DIGEST_EMAIL in Vercel env (and RESEND_API_KEY).',
      },
      { status: 400 },
    );
  }

  const sent = await sendWeeklySocialDigestEmail();
  if (!sent) {
    return NextResponse.json({ error: 'Failed to send email. Check RESEND_API_KEY and logs.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, sentTo: recipient });
}
