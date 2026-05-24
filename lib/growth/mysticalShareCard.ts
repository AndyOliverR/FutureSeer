/**
 * Builds share-card copy from a user's comprehensive mystical profile.
 */

import { buildMysticalCardSnippet, resolveToolReportFromProfile } from '@/lib/mysticalProfilePositiveSnippet';
import { ALL_TOOL_SLUGS } from '@/lib/profileGenerationOrchestrator';
import { toolManager } from '@/lib/services/toolManager';
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath';

/** Tools preferred for the public-facing archetype headline. */
const SHARE_HEADLINE_PRIORITY = [
  'western',
  'vedic',
  'numerology',
  'tarot',
  'humanDesign',
  'runes',
  'lenormand',
  'iching',
] as const;

export interface MysticalSharePayload {
  displayName: string;
  archetypeTitle: string;
  hookLine: string;
  subLine: string;
  rarityLabel: string;
  highlightToolName: string;
  highlightToolSlug: string;
  shareUrl: string;
}

function resolveDisplayName(profile: Record<string, unknown> | null | undefined): string {
  if (!profile) return 'Seeker';
  const raw =
    (typeof profile.displayName === 'string' && profile.displayName) ||
    (typeof profile.fullName === 'string' && profile.fullName) ||
    (typeof profile.name === 'string' && profile.name) ||
    '';
  const trimmed = raw.trim();
  if (!trimmed) return 'Seeker';
  return trimmed.split(/\s+/)[0] ?? 'Seeker';
}

function buildShareUrl(options: { referralCode?: string; userId?: string }): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'https://futureseer.app').replace(/\/$/, '');
  const ref = options.referralCode?.trim() || options.userId?.trim();
  return ref ? `${base}?ref=${encodeURIComponent(ref)}` : base;
}

function toolDisplayName(slug: string): string {
  const pathSeg = toolPathForSlug(slug);
  return toolManager.getTool(pathSeg)?.name ?? slug;
}

/**
 * Picks the best tool snippet for a viral share card, or null if profile has no ready reports.
 */
export function buildMysticalSharePayload(
  profile: Record<string, unknown> | null | undefined,
  options?: {
    displayName?: string;
    referralCode?: string;
    userId?: string;
  },
): MysticalSharePayload | null {
  if (!profile) return null;

  const prioritySet = new Set<string>(SHARE_HEADLINE_PRIORITY);
  const order: string[] = [...SHARE_HEADLINE_PRIORITY];
  for (const slug of ALL_TOOL_SLUGS) {
    if (!prioritySet.has(slug)) order.push(slug);
  }

  for (const slug of order) {
    const report = resolveToolReportFromProfile(profile, slug);
    if (report == null) continue;
    const { primaryLine, secondaryLine, teaser } = buildMysticalCardSnippet(slug, report);
    if (!teaser.archetypeName || !primaryLine) continue;

    return {
      displayName: options?.displayName?.trim() || resolveDisplayName(profile),
      archetypeTitle: teaser.archetypeName,
      hookLine: primaryLine,
      subLine: secondaryLine,
      rarityLabel: teaser.rarityLabel,
      highlightToolName: toolDisplayName(slug),
      highlightToolSlug: slug,
      shareUrl: buildShareUrl({
        referralCode: options?.referralCode,
        userId: options?.userId,
      }),
    };
  }

  return null;
}
