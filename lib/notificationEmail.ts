import { Resend } from 'resend';
import { devLog } from '@/lib/devLogger';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send a daily astrological insight email to a user.
 * Used by the cron job for users who have opted in (notificationPreferences.dailyInsights and notificationsEnabled).
 */
export async function sendDailyInsightEmail(
  to: string,
  displayName?: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    devLog.warn('RESEND_API_KEY not set, skipping email', 'notificationEmail');
    return false;
  }
  const name = displayName || 'there';
  const subject = 'Your Daily Astrological Insight';
  const html = `
    <p>Hi ${name},</p>
    <p>Here’s your daily astrological insight from FutureSeer.</p>
    <p>Today’s energies invite reflection and small, grounded steps. Check the app for personalized insights based on your chart.</p>
    <p>— FutureSeer</p>
  `;
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
