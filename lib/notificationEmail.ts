import { Resend } from 'resend';
import { devLog } from '@/lib/devLogger';
import type { DailyInsightCardData } from '@/lib/dailyInsightForHome';
import { formatDailyInsightEmailHtml } from '@/lib/dailyInsightEmailFormat';

export { formatDailyInsightEmailHtml } from '@/lib/dailyInsightEmailFormat';

const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'onboarding@resend.dev';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    return new Resend(apiKey);
  } catch (err) {
    devLog.warn('Failed to initialize Resend client', err, 'notificationEmail');
    return null;
  }
}

/**
 * Send a daily astrological insight email to a user.
 * Used by the cron job for users who have opted in (notificationPreferences.dailyInsights and notificationsEnabled).
 */
export async function sendDailyInsightEmail(
  to: string,
  displayName?: string,
  options?: {
    nudgeStage?: 'active' | 'at_risk' | 'reactivation' | 'trial_ending'
    trialDaysLeft?: number | null
    insight?: Pick<
      DailyInsightCardData,
      'summary' | 'accentLabel' | 'luckyColor' | 'luckyNumber' | 'rulingPlanet' | 'moonSign'
    >
  },
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    devLog.warn('RESEND_API_KEY not set, skipping email', 'notificationEmail');
    return false;
  }
  const nudgeStage = options?.nudgeStage ?? 'active';
  const trialDaysLeft = typeof options?.trialDaysLeft === 'number' ? options.trialDaysLeft : null;
  const { subject, html } = formatDailyInsightEmailHtml({
    displayName,
    nudgeStage,
    trialDaysLeft,
    insight: options?.insight,
  });
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });
    if (error) {
      devLog.error('Resend error sending daily insight:', error, 'notificationEmail');
      return false;
    }
    return !!data?.id;
  } catch (err) {
    devLog.error('Failed to send daily insight email:', err, 'notificationEmail');
    return false;
  }
}
