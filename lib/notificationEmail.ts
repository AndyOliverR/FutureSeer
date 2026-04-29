import { Resend } from 'resend';
import { devLog } from '@/lib/devLogger';

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
  },
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    devLog.warn('RESEND_API_KEY not set, skipping email', 'notificationEmail');
    return false;
  }
  const name = displayName || 'there';
  const nudgeStage = options?.nudgeStage ?? 'active'
  const trialDaysLeft = typeof options?.trialDaysLeft === 'number' ? options.trialDaysLeft : null
  const stageCopy =
    nudgeStage === 'trial_ending'
      ? `Your trial has ${trialDaysLeft ?? 0} day(s) left. Open FutureSeer to lock in your next breakthrough.`
      : nudgeStage === 'reactivation'
        ? 'Welcome back. One small check-in today is enough to restart your flow.'
        : nudgeStage === 'at_risk'
          ? 'You are one step away from keeping your momentum. A quick check-in today keeps your streak alive.'
          : 'Your consistency is building. Keep your daily momentum with one focused check-in.'
  const subject = nudgeStage === 'trial_ending' ? 'Your FutureSeer trial is ending soon' : 'Your Daily Astrological Insight';
  const html = `
    <p>Hi ${name},</p>
    <p>Here’s your daily astrological insight from FutureSeer.</p>
    <p>Today’s energies invite reflection and small, grounded steps. Check the app for personalized insights based on your chart.</p>
    <p>${stageCopy}</p>
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
