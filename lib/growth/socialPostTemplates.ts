/**
 * Admin social post templates (copy-only Phase B). No auto-publish.
 */

import type { ScheduledPostTime } from '@/lib/growth/socialPostSchedule';

export const FUTURESEER_CORE_MESSAGE =
  'One birth chart. 50+ traditions. One AI Seer that only speaks from your saved reports.';

export const FUTURESEER_SITE_URL =
  (process.env.NEXT_PUBLIC_APP_URL || 'https://futureseer.app').replace(/\/$/, '');

export type SocialChannel =
  | 'whatsapp'
  | 'facebook'
  | 'threads'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'x';

export type SocialPostKind =
  | 'capability'
  | 'myth_bust'
  | 'curiosity_hook'
  | 'unified_stack'
  | 'reel_script';

export interface SocialPostTemplate {
  id: string;
  channel: SocialChannel;
  kind: SocialPostKind;
  label: string;
  description: string;
  /** Suggested day from weekly organic calendar */
  calendarDay?: string;
  structureHint: string;
  /** Soft character guidance for the model */
  targetLength?: 'short' | 'medium' | 'long';
}

export interface SocialChannelMeta {
  id: SocialChannel;
  label: string;
  calendarDay: string;
  postTime: ScheduledPostTime;
  /** Why this day/time was chosen (engagement research summary). */
  timingNote?: string;
}

/** Order = Sun (index 0) … Sat (index 6). Times tuned for IST + US diaspora via UTC column in admin. */
export const SOCIAL_CHANNELS: SocialChannelMeta[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp Status',
    calendarDay: 'Sunday',
    postTime: { hourIst: 19, minuteIst: 0 },
    timingNote: 'Evening personal browsing in India',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    calendarDay: 'Monday',
    postTime: { hourIst: 8, minuteIst: 30 },
    timingNote: 'B2B week-start; LinkedIn peaks Tue–Thu 8–10 AM IST',
  },
  {
    id: 'threads',
    label: 'Threads',
    calendarDay: 'Tuesday',
    postTime: { hourIst: 11, minuteIst: 0 },
    timingNote: 'Tue–Wed 10 AM–12 PM engagement window',
  },
  {
    id: 'facebook',
    label: 'Facebook Page',
    calendarDay: 'Wednesday',
    postTime: { hourIst: 10, minuteIst: 0 },
    timingNote: 'Wed–Thu 9–11 AM peak for Page posts',
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    calendarDay: 'Thursday',
    postTime: { hourIst: 9, minuteIst: 30 },
    timingNote: 'Wed–Thu 9–11 AM; strong for news-style hooks + US morning overlap',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    calendarDay: 'Friday',
    postTime: { hourIst: 12, minuteIst: 30 },
    timingNote: 'Midweek lunch window for Reels and carousels',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    calendarDay: 'Saturday',
    postTime: { hourIst: 16, minuteIst: 0 },
    timingNote: 'Weekend Shorts; Thu–Sat afternoon leisure viewing',
  },
];

export const SOCIAL_POST_TEMPLATES: SocialPostTemplate[] = [
  {
    id: 'whatsapp-status-hook',
    channel: 'whatsapp',
    kind: 'curiosity_hook',
    label: 'Status — curiosity hook',
    description: 'Short status text + link for manual post',
    calendarDay: 'Sunday',
    structureHint:
      '2–4 short lines. Friendly tone. End with link to futureseer.app. No guaranteed predictions.',
    targetLength: 'short',
  },
  {
    id: 'facebook-capability-carousel',
    channel: 'facebook',
    kind: 'capability',
    label: 'Capability / myth-bust carousel',
    description: 'Intro + 3 bullet myths or features + CTA',
    calendarDay: 'Wednesday',
    structureHint:
      'Opening hook, then 3 numbered bullets (myth vs reality or one capability each), closing CTA with link.',
    targetLength: 'long',
  },
  {
    id: 'threads-short-hook',
    channel: 'threads',
    kind: 'curiosity_hook',
    label: 'Short hook + link',
    description: '1–3 lines, conversational',
    calendarDay: 'Tuesday',
    structureHint: 'Punchy opener, one insight, link. Under ~500 characters total.',
    targetLength: 'short',
  },
  {
    id: 'instagram-reel-caption',
    channel: 'instagram',
    kind: 'reel_script',
    label: 'Reel script + caption',
    description: 'On-screen hook lines + caption + hashtags',
    calendarDay: 'Friday',
    structureHint:
      'headline = first 3s hook. primary = caption body. bullets = on-screen text beats. hashtags = 5–12 relevant tags.',
    targetLength: 'medium',
  },
  {
    id: 'youtube-short-pack',
    channel: 'youtube',
    kind: 'capability',
    label: 'Short description pack',
    description: 'Title, description, community post snippet',
    calendarDay: 'Saturday',
    structureHint:
      'headline = video title (≤70 chars). primary = description (2 short paragraphs). notes = community tab post (1–2 sentences).',
    targetLength: 'medium',
  },
  {
    id: 'linkedin-unified-stack',
    channel: 'linkedin',
    kind: 'unified_stack',
    label: 'Professional unified stack',
    description: 'B2C professional angle on unified divination',
    calendarDay: 'Monday',
    structureHint:
      'Thought-leadership tone. Problem → insight → how FutureSeer unifies traditions without hype. No fortune guarantees.',
    targetLength: 'long',
  },
  {
    id: 'x-curiosity-hook',
    channel: 'x',
    kind: 'curiosity_hook',
    label: 'Curiosity hook + link',
    description: 'Single post under 280 characters if possible',
    calendarDay: 'Thursday',
    structureHint: 'primary must fit in 280 characters including link. Sharp hook, no hashtag spam.',
    targetLength: 'short',
  },
  {
    id: 'facebook-myth-bust',
    channel: 'facebook',
    kind: 'myth_bust',
    label: 'Myth bust — one belief',
    description: 'One common misconception about astrology/divination apps',
    structureHint: 'State myth, gentle correction, tie to unified reports + CTA.',
    targetLength: 'medium',
  },
  {
    id: 'instagram-static-card',
    channel: 'instagram',
    kind: 'capability',
    label: 'Static card caption',
    description: 'Caption for a golden share-card style image',
    structureHint: 'Caption references “my cosmic profile” style identity post; hashtags separate field.',
    targetLength: 'medium',
  },
  {
    id: 'linkedin-capability',
    channel: 'linkedin',
    kind: 'capability',
    label: 'Capability spotlight',
    description: 'One product capability with professional framing',
    structureHint: 'Lead with user benefit, mention 50+ traditions briefly, CTA to site.',
    targetLength: 'medium',
  },
];

export function getSocialPostTemplate(templateId: string): SocialPostTemplate | undefined {
  return SOCIAL_POST_TEMPLATES.find((t) => t.id === templateId);
}

export function listTemplatesForChannel(channel: SocialChannel): SocialPostTemplate[] {
  return SOCIAL_POST_TEMPLATES.filter((t) => t.channel === channel);
}

export function channelLabel(channel: SocialChannel): string {
  return SOCIAL_CHANNELS.find((c) => c.id === channel)?.label ?? channel;
}
