/**
 * Monday weekly social digest email (Phase C-lite checklist — no AI batch in cron).
 */

import { Resend } from 'resend';
import { devLog } from '@/lib/devLogger';
import { buildWeeklySocialDigestHtml } from '@/lib/growth/socialWeeklyDigestContent';

const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'onboarding@resend.dev';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    return new Resend(apiKey);
  } catch (err) {
    devLog.warn('Failed to initialize Resend for social digest', err, 'socialWeeklyDigestEmail');
    return null;
  }
}

export { buildWeeklySocialDigestHtml } from '@/lib/growth/socialWeeklyDigestContent';

export function getWeeklyDigestRecipient(): string | null {
  const email = process.env.SOCIAL_WEEKLY_DIGEST_EMAIL?.trim();
  return email || null;
}

export function isWeeklyDigestEnabled(): boolean {
  if (process.env.SOCIAL_WEEKLY_DIGEST_ENABLED === 'false') return false;
  return !!getWeeklyDigestRecipient();
}

/**
 * Sends the weekly checklist email to SOCIAL_WEEKLY_DIGEST_EMAIL.
 */
export async function sendWeeklySocialDigestEmail(): Promise<boolean> {
  const to = getWeeklyDigestRecipient();
  if (!to) {
    devLog.warn('SOCIAL_WEEKLY_DIGEST_EMAIL not set, skipping digest', 'socialWeeklyDigestEmail');
    return false;
  }

  const resend = getResendClient();
  if (!resend) {
    devLog.warn('RESEND_API_KEY not set, skipping social digest', 'socialWeeklyDigestEmail');
    return false;
  }

  const weekStart = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `FutureSeer social queue — week of ${weekStart}`,
      html: buildWeeklySocialDigestHtml(),
    });
    if (error) {
      devLog.error('Resend error sending social digest:', error, 'socialWeeklyDigestEmail');
      return false;
    }
    return !!data?.id;
  } catch (err) {
    devLog.error('Failed to send social digest:', err, 'socialWeeklyDigestEmail');
    return false;
  }
}
