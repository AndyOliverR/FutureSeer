/**
 * Pure helpers for admin newspaper / outreach article copy (no AI imports).
 */

import {
  FUTURESEER_CORE_MESSAGE,
  FUTURESEER_SITE_URL,
} from '@/lib/growth/socialPostTemplates';

import type { NewspaperOutlet } from '@/lib/growth/newspaperOutlets';

export interface NewspaperArticleCopyInput {
  outletId: string;
  topicAngle?: string;
  locationHook?: string;
  customNote?: string;
}

export interface GeneratedNewspaperArticleCopy {
  outletId: string;
  headline: string;
  subhead: string;
  body: string;
  photoCaption: string;
  submissionChecklist: string;
  disclaimer: string;
  notes: string;
}

function normalizeStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseGeneratedNewspaperArticleCopy(
  data: Record<string, unknown>,
  outletId: string,
): GeneratedNewspaperArticleCopy {
  return {
    outletId,
    headline: normalizeStringField(data.headline),
    subhead: normalizeStringField(data.subhead),
    body: normalizeStringField(data.body),
    photoCaption: normalizeStringField(data.photoCaption),
    submissionChecklist: normalizeStringField(data.submissionChecklist),
    disclaimer: normalizeStringField(data.disclaimer),
    notes: normalizeStringField(data.notes),
  };
}

export function buildNewspaperOptionalContext(input: NewspaperArticleCopyInput): string {
  const parts: string[] = [];
  if (input.topicAngle?.trim()) {
    parts.push(`Topic / angle: ${input.topicAngle.trim()}`);
  }
  if (input.locationHook?.trim()) {
    parts.push(`Location or civic hook: ${input.locationHook.trim()}`);
  }
  if (input.customNote?.trim()) {
    parts.push(`Additional direction: ${input.customNote.trim()}`);
  }
  return parts.join('\n');
}

export function buildNewspaperArticlePromptMessages(
  outlet: NewspaperOutlet,
  input: NewspaperArticleCopyInput,
): { system: string; user: string; guardText: string } {
  const optionalContext = buildNewspaperOptionalContext(input);
  const guardText = optionalContext;

  const system = `You draft submission-ready articles and pitches about FutureSeer (${FUTURESEER_SITE_URL}) for newspaper/outreach channels.

Brand context (do not paste verbatim every time):
"${FUTURESEER_CORE_MESSAGE}"

Hard rules:
- Never promise guaranteed predictions, lottery wins, medical/legal/financial outcomes, or celebrity endorsements.
- No fear-based manipulation. Educational and civic angles are preferred.
- TOI Citizen Reporter and similar channels reject pure ads — write as journalism or human interest, not a sales page.
- Paid print classifieds are NOT free; do not claim free newspaper placement.
- Mention ${FUTURESEER_SITE_URL} at most once in the body unless the outlet is a press pitch.

Return ONLY a JSON object with keys:
- headline (string)
- subhead (string, dek/subtitle; empty if unused)
- body (string, main article or pitch body with paragraph breaks using \\n\\n)
- photoCaption (string, suggested image caption; empty if unused)
- submissionChecklist (string, numbered steps for admin to submit manually)
- disclaimer (string, short editorial/legal note for admin)
- notes (string, internal tips: tone tweaks, what to attach; empty if none)`;

  const user = `Outlet: ${outlet.label}
Kind: ${outlet.kind}
Target length: ${outlet.targetWords} words

Structure guidance:
${outlet.structureHint}

Submission channel notes:
${outlet.submissionNotes}

${optionalContext ? `${optionalContext}\n` : ''}
Generate a fresh draft suitable for manual review before submission.`;

  return { system, user, guardText };
}
