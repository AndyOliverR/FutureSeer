import type { DailyInsightCardData } from '@/lib/dailyInsightForHome';

export function formatDailyInsightEmailHtml(params: {
  displayName?: string;
  nudgeStage: 'active' | 'at_risk' | 'reactivation' | 'trial_ending';
  trialDaysLeft: number | null;
  insight?: Pick<
    DailyInsightCardData,
    'summary' | 'accentLabel' | 'luckyColor' | 'luckyNumber' | 'rulingPlanet' | 'moonSign'
  >;
}): { subject: string; html: string } {
  const name = params.displayName || 'there';
  const nudgeStage = params.nudgeStage;
  const trialDaysLeft = params.trialDaysLeft;
  const stageCopy =
    nudgeStage === 'trial_ending'
      ? `Your trial has ${trialDaysLeft ?? 0} day(s) left. Open FutureSeer to lock in your next breakthrough.`
      : nudgeStage === 'reactivation'
        ? 'Welcome back. One small check-in today is enough to restart your flow.'
        : nudgeStage === 'at_risk'
          ? 'You are one step away from keeping your momentum. A quick check-in today keeps your streak alive.'
          : 'Your consistency is building. Keep your daily momentum with one focused check-in.';
  const subject =
    nudgeStage === 'trial_ending' ? 'Your FutureSeer trial is ending soon' : 'Your Daily Astrological Insight';
  const insight = params.insight;
  const summary =
    insight?.summary ??
    "Today's energies invite reflection and small, grounded steps. Open FutureSeer for chart-grounded detail.";
  const detailLines: string[] = [];
  if (insight?.accentLabel) detailLines.push(`<strong>${insight.accentLabel}</strong>`);
  if (insight?.moonSign) detailLines.push(`Moon in ${insight.moonSign}`);
  if (insight?.luckyColor) detailLines.push(`Lucky color: ${insight.luckyColor}`);
  if (typeof insight?.luckyNumber === 'number') detailLines.push(`Lucky number: ${insight.luckyNumber}`);
  const detailHtml =
    detailLines.length > 0
      ? `<p style="margin:12px 0;color:#475569;font-size:14px;">${detailLines.join(' · ')}</p>`
      : '';
  const html = `
    <p>Hi ${name},</p>
    <p>Here’s your daily astrological insight from FutureSeer.</p>
    <p>${summary}</p>
    ${detailHtml}
    <p>${stageCopy}</p>
    <p><a href="https://futureseer.app/tools">Open Occult / Divination tools</a> or <a href="https://futureseer.app/seer">Ask the Seer</a>.</p>
    <p>— FutureSeer</p>
  `;
  return { subject, html };
}
