/**
 * Internal Seer Synthesizer – replaces Groq for answer formatting.
 * Takes engine analysis (from our own occult database) and produces a concise,
 * direct answer. No external API calls. Keeps the app external-API-free for core Seer.
 */

export interface SynthesisInput {
  answer: string;
  recommendedDate?: string;
  sources?: string[];
  confidenceBand?: { low: number; high: number };
  confidence?: number;
  /** For optional closing line rotation (exploring | confirming | concluding). */
  certaintyLevel?: 'exploring' | 'confirming' | 'concluding';
}

/** Closing lines by certainty level (Phase 4). */
const CLOSING_LINES: Record<string, string[]> = {
  exploring: ['This isn\'t finished yet.', 'There\'s another layer we haven\'t touched.'],
  confirming: ['Your next question matters more than the first.'],
  concluding: []
};

/**
 * Synthesize a concise 2–4 sentence answer from engine output.
 * Preserves: verdict, recommended date, date comparisons ("Why not X?"), key facts.
 * Removes: verbose meta-commentary, long confidence explanations, system jargon.
 * Language rules: conditional phrasing, avoid bullets-only, add optional closing line.
 */
export function synthesizeSeerAnswer(input: SynthesisInput): string {
  const { answer, sources = [], confidenceBand, confidence, certaintyLevel = 'exploring' } = input;
  if (!answer || typeof answer !== 'string') return '';

  let raw = answer.trim();

  // Seer Voice: strip technical leakage and expert deflection
  const SEER_VOICE_STRIP = [
    /\s*Vedic Astrology addresses this from its domain:\s*/gi,
    /\s*Together, this suggests a layered view: no single system overrides another[^.]*\.?\s*/gi,
    /\s*This is a probability-based synthesis from symbolic systems, not a certainty\.?\s*/gi,
    /\s*This is a probability-based recommendation from your chart, not a certainty\.?\s*/gi,
    /\s*According to Vedic Dasha[s]?\s*/gi,
    /\s*without (the )?exact birth time[^.]*\.?\s*/gi,
    /\s*without (the )?birth time[^.]*\.?\s*/gi,
    /\s*providing a precise date is (challenging|difficult)[^.]*\.?\s*/gi,
    /\s*would depend on the subsequent[^.]*\.?\s*/gi,
    /\s*probability-based\s*/gi,
  ];
  for (const re of SEER_VOICE_STRIP) raw = raw.replace(re, ' ');

  // Avoid system jargon in user-facing text (Phase 4)
  raw = raw
    .replace(/\bVedic Dasha[s]?\b/gi, 'planetary periods')
    .replace(/\bKP Astrology\b/gi, 'predictive system')
    .replace(/\bDasha\b/g, 'planetary period');

  // Convert bullet-only to prose (avoid bullet-only answers)
  const bulletMatch = raw.match(/^(\s*[-*•]\s+.+(\n\s*[-*•]\s+.+)+)/m);
  if (bulletMatch && raw.split(/\n/).filter(l => l.trim()).length <= 4) {
    raw = raw.replace(/^\s*[-*•]\s+/gm, '').replace(/\n\s*[-*•]\s+/g, ', ').replace(/\n{2,}/g, ' ').trim();
  }

  // Take everything before the first meta paragraph (multi-system note first, then confidence)
  const metaMarkers = [
    /\n\nThe recommended date is from your Vedic chart[^.]*\.?/i,
    /\s+The recommended date is from your Vedic chart[^.]*\.?/i,
    /\n\nOther dates in \d{4} may also work[^.]*\.?/i,
    /\s+Other dates in \d{4} may also work[^.]*\.?/i,
    /\n\nConfidence band:/i,
    /\n\nThis probability band/i,
  ];

  let mainContent = raw;
  for (const re of metaMarkers) {
    const match = raw.match(re);
    if (match && match.index != null) {
      const before = raw.slice(0, match.index).trim();
      if (before.length > 50) {
        mainContent = before;
        break;
      }
    }
  }

  // Inline meta trimming (space-prefixed phrases)
  mainContent = mainContent
    .replace(/\s+The recommended date is from your Vedic chart[^.]*\.?/gi, '')
    .replace(/\s+Confidence band:\s*\d[^.]*\.?/gi, '')
    .replace(/\s+This is a probability-based recommendation from your chart, not a certainty\.?$/i, '')
    .replace(/\s+This probability band combines[^.]*\.?$/i, '')
    .replace(/\s+Other dates in \d{4} may also work[^.]*\.?/gi, '')
    .trim();

  // Confidence stays in metadata only; do not append to spoken answer (Option A)

  // Skip closing line when answer is already substantive (complete timing answer)
  const isSubstantive = mainContent.length > 100;
  const closings = CLOSING_LINES[certaintyLevel] ?? CLOSING_LINES.exploring;
  if (closings.length > 0 && !isSubstantive) {
    const closing = closings[Math.floor(Math.random() * closings.length)];
    if (closing && !mainContent.includes(closing)) mainContent = `${mainContent} ${closing}`;
  }

  return mainContent.replace(/\*\*/g, '').trim();
}
