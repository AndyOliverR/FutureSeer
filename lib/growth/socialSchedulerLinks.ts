/**
 * External scheduler URLs for Phase C-lite (manual paste workflow).
 * Override via env when you have a direct Page / company URL.
 */

import type { SocialChannel } from '@/lib/growth/socialPostTemplates';

export interface SchedulerLink {
  label: string;
  url: string;
  /** Shown when there is no reliable web composer */
  manualOnly?: boolean;
}

const DEFAULT_LINKS: Record<SocialChannel, SchedulerLink> = {
  whatsapp: {
    label: 'WhatsApp (phone)',
    url: 'https://web.whatsapp.com/',
    manualOnly: true,
  },
  facebook: {
    label: 'Meta Business Suite',
    url: 'https://business.facebook.com/latest/home',
  },
  threads: {
    label: 'Threads',
    url: 'https://www.threads.net/',
    manualOnly: true,
  },
  instagram: {
    label: 'Meta Business Suite (IG)',
    url: 'https://business.facebook.com/latest/composer',
  },
  youtube: {
    label: 'YouTube Studio',
    url: 'https://studio.youtube.com/',
  },
  linkedin: {
    label: 'LinkedIn feed',
    url: 'https://www.linkedin.com/feed/',
  },
  x: {
    label: 'X compose',
    url: 'https://x.com/compose/post',
  },
};

function envUrl(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v || fallback;
}

/** Resolves scheduler link for a channel (env overrides optional). */
export function getSchedulerLink(channel: SocialChannel): SchedulerLink {
  const base = DEFAULT_LINKS[channel];
  const envKey = `SOCIAL_SCHEDULER_URL_${channel.toUpperCase()}`;
  const url = envUrl(envKey, base.url);
  return { ...base, url };
}
