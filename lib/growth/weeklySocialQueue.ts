/**
 * Weekly organic posting queue (Phase C-lite). Copy-only — no auto-publish.
 */

import {
  channelLabel,
  getSocialPostTemplate,
  listTemplatesForChannel,
  SOCIAL_CHANNELS,
  type SocialChannel,
} from '@/lib/growth/socialPostTemplates';
import { formatScheduledTimeDisplay } from '@/lib/growth/socialPostSchedule';
import { getSchedulerLink, type SchedulerLink } from '@/lib/growth/socialSchedulerLinks';

/** 0 = Sunday … 6 = Saturday (matches Date.getDay()). */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface WeeklyQueueItem {
  dayIndex: WeekdayIndex;
  dayName: string;
  channel: SocialChannel;
  channelLabel: string;
  defaultTemplateId: string;
  defaultTemplateLabel: string;
  calendarHint: string;
  postTimeIst: string;
  postTimeUtc: string;
  timingNote?: string;
  scheduler: SchedulerLink;
  /** Short manual note for channels without API posting */
  postingNote?: string;
}

function defaultTemplateIdForChannel(channel: SocialChannel): string {
  const meta = SOCIAL_CHANNELS.find((c) => c.id === channel);
  const byDay = listTemplatesForChannel(channel).find((t) => t.calendarDay === meta?.calendarDay);
  if (byDay) return byDay.id;
  return listTemplatesForChannel(channel)[0]?.id ?? '';
}

function buildQueueItem(dayIndex: WeekdayIndex): WeeklyQueueItem {
  const meta = SOCIAL_CHANNELS[dayIndex];
  const channel = meta.id;
  const templateId = defaultTemplateIdForChannel(channel);
  const template = getSocialPostTemplate(templateId);
  const { ist, utc } = formatScheduledTimeDisplay(meta.postTime);
  return {
    dayIndex,
    dayName: meta.calendarDay,
    channel,
    channelLabel: channelLabel(channel),
    defaultTemplateId: templateId,
    defaultTemplateLabel: template?.label ?? 'Default',
    calendarHint: template?.description ?? meta.label,
    postTimeIst: ist,
    postTimeUtc: utc,
    timingNote: meta.timingNote,
    scheduler: getSchedulerLink(channel),
    postingNote:
      channel === 'whatsapp'
        ? 'Download a share card from a tool report or use a brand image; paste status text manually.'
        : channel === 'youtube'
          ? 'Upload Short in Studio; paste title/description from generated copy.'
          : undefined,
  };
}

/** Sun → Sat weekly calendar aligned with SOCIAL_CHANNELS order. */
export const WEEKLY_SOCIAL_QUEUE: WeeklyQueueItem[] = (
  [0, 1, 2, 3, 4, 5, 6] as WeekdayIndex[]
).map(buildQueueItem);

export function getWeekdayIndex(date: Date = new Date()): WeekdayIndex {
  return date.getDay() as WeekdayIndex;
}

export function getTodayQueueItem(date: Date = new Date()): WeeklyQueueItem {
  const idx = getWeekdayIndex(date);
  return WEEKLY_SOCIAL_QUEUE[idx] ?? WEEKLY_SOCIAL_QUEUE[0];
}

export function getQueueItemByChannel(channel: SocialChannel): WeeklyQueueItem | undefined {
  return WEEKLY_SOCIAL_QUEUE.find((q) => q.channel === channel);
}

export function adminSocialPostsUrl(options?: {
  channel?: SocialChannel;
  templateId?: string;
  baseUrl?: string;
}): string {
  const base = (options?.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://futureseer.app').replace(
    /\/$/,
    '',
  );
  const params = new URLSearchParams();
  if (options?.channel) params.set('channel', options.channel);
  if (options?.templateId) params.set('template', options.templateId);
  const qs = params.toString();
  return `${base}/admin/social-posts${qs ? `?${qs}` : ''}`;
}
