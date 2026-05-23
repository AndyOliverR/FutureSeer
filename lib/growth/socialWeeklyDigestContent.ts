/**
 * Weekly social digest HTML (no Resend import — safe for Jest).
 */

import {
  adminSocialPostsUrl,
  WEEKLY_SOCIAL_QUEUE,
  type WeeklyQueueItem,
} from '@/lib/growth/weeklySocialQueue';
import { FUTURESEER_SITE_URL } from '@/lib/growth/socialPostTemplates';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderQueueRow(item: WeeklyQueueItem, baseUrl: string): string {
  const link = adminSocialPostsUrl({
    channel: item.channel,
    templateId: item.defaultTemplateId,
    baseUrl,
  });
  const note = item.postingNote
    ? `<br/><span style="color:#64748b;font-size:12px;">${escapeHtml(item.postingNote)}</span>`
    : '';
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #1e293b;white-space:nowrap;"><strong>${escapeHtml(item.dayName)}</strong></td>
    <td style="padding:8px 12px;border-bottom:1px solid #1e293b;">${escapeHtml(item.channelLabel)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #1e293b;">${escapeHtml(item.defaultTemplateLabel)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #1e293b;">
      <a href="${escapeHtml(link)}" style="color:#fbbf24;">Generate copy</a>
      · <a href="${escapeHtml(item.scheduler.url)}" style="color:#94a3b8;">${escapeHtml(item.scheduler.label)}</a>
      ${note}
    </td>
  </tr>`;
}

export function buildWeeklySocialDigestHtml(baseUrl?: string): string {
  const appBase = (baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? FUTURESEER_SITE_URL).replace(/\/$/, '');
  const todayLink = adminSocialPostsUrl({ baseUrl: appBase });
  const rows = WEEKLY_SOCIAL_QUEUE.map((item) => renderQueueRow(item, appBase)).join('\n');

  return `
    <div style="font-family:system-ui,sans-serif;background:#020617;color:#e2e8f0;padding:24px;">
      <h1 style="color:#fbbf24;font-size:20px;margin:0 0 8px;">FutureSeer — This week&apos;s social queue</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 20px;">
        Phase C-lite: generate copy in admin, paste into free native schedulers. No auto-post.
      </p>
      <p style="margin:0 0 16px;">
        <a href="${escapeHtml(todayLink)}" style="background:#d97706;color:#020617;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;">
          Open social post generator
        </a>
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="text-align:left;color:#94a3b8;">
            <th style="padding:8px 12px;">Day</th>
            <th style="padding:8px 12px;">Channel</th>
            <th style="padding:8px 12px;">Template</th>
            <th style="padding:8px 12px;">Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#64748b;font-size:12px;margin-top:24px;">
        Tip: batch ~30 min once — generate each day, schedule in Meta Business Suite &amp; LinkedIn.
        WhatsApp Status stays manual (Sunday).
      </p>
    </div>
  `;
}
