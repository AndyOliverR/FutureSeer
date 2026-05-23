/**
 * Pure helpers for admin social post copy (no AI imports — safe for unit tests).
 */

import {
  channelLabel,
  FUTURESEER_CORE_MESSAGE,
  FUTURESEER_SITE_URL,
  type SocialPostTemplate,
} from '@/lib/growth/socialPostTemplates';
export interface SocialPostCopyInput {
  templateId: string;
  capabilityBullet?: string;
  mythTopic?: string;
  customNote?: string;
}

export interface GeneratedSocialPostCopy {
  templateId: string;
  channel: SocialPostTemplate['channel'];
  headline: string;
  primary: string;
  bullets: string[];
  hashtags: string;
  cta: string;
  notes: string;
}

function normalizeStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBullets(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

export function parseGeneratedSocialPostCopy(
  data: Record<string, unknown>,
  templateId: string,
  channel: SocialPostTemplate['channel'],
): GeneratedSocialPostCopy {
  return {
    templateId,
    channel,
    headline: normalizeStringField(data.headline),
    primary: normalizeStringField(data.primary),
    bullets: normalizeBullets(data.bullets),
    hashtags: normalizeStringField(data.hashtags),
    cta: normalizeStringField(data.cta),
    notes: normalizeStringField(data.notes),
  };
}

export function buildAdminOptionalContext(input: SocialPostCopyInput): string {
  const parts: string[] = [];
  if (input.capabilityBullet?.trim()) {
    parts.push(`Capability / feature to highlight: ${input.capabilityBullet.trim()}`);
  }
  if (input.mythTopic?.trim()) {
    parts.push(`Myth or misconception to address: ${input.mythTopic.trim()}`);
  }
  if (input.customNote?.trim()) {
    parts.push(`Additional direction from admin: ${input.customNote.trim()}`);
  }
  return parts.join('\n');
}

export function buildSocialPostPromptMessages(
  template: SocialPostTemplate,
  input: SocialPostCopyInput,
): { system: string; user: string; guardText: string } {
  const optionalContext = buildAdminOptionalContext(input);
  const guardText = optionalContext;

  const system = `You write organic social media copy for FutureSeer (${FUTURESEER_SITE_URL}), an app that unifies 50+ divination traditions with AI grounded in each user's saved reports.

Brand one-liner (use as north star, do not paste verbatim every time):
"${FUTURESEER_CORE_MESSAGE}"

Hard rules:
- Never promise guaranteed outcomes, lottery wins, medical/legal/financial certainty, or "the AI knows your future."
- No fear-based manipulation. Curiosity and clarity are fine.
- Do not claim endorsements from celebrities or religions.
- CTA must include the site URL: ${FUTURESEER_SITE_URL}
- Write in clear, modern English. Match the channel tone.

Return ONLY a JSON object with these keys:
- headline (string, optional hook; empty string if unused)
- primary (string, main post body)
- bullets (array of strings, optional list items; empty array if unused)
- hashtags (string, include # only for Instagram/Threads when useful; else empty string)
- cta (string, call-to-action line with link)
- notes (string, brief admin tip: e.g. "Pair with mystical share card image" or "Post as carousel slide 1–4"; empty if none)`;

  const user = `Channel: ${channelLabel(template.channel)} (${template.channel})
Template: ${template.label}
Post kind: ${template.kind}
${template.calendarDay ? `Suggested calendar day: ${template.calendarDay}` : ''}

Structure guidance:
${template.structureHint}

Target length: ${template.targetLength ?? 'medium'}

${optionalContext ? `${optionalContext}\n` : ''}
Generate fresh copy for this template. Obey channel conventions (e.g. X post primary ≤280 chars when possible).`;

  return { system, user, guardText };
}
