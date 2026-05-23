/**
 * Keyword overlap similarity for Seer question cache (shared by client routes and server cache).
 */

export function scoreKeywordSimilarity(
  question1: string,
  question2: string,
  keywords: string[],
): number {
  const q1 = question1.toLowerCase();
  const q2 = question2.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (q1.includes(k) && q2.includes(k)) {
      matches += 2;
    }
  }
  return matches;
}

/** Preset keyword lists for tool Seer caches. */
export const SEER_CACHE_KEYWORDS = {
  iching: [
    'hexagram',
    'changing',
    'line',
    'trigram',
    'element',
    'timing',
    'guidance',
    'decision',
  ],
  geomancy: [
    'figure',
    'house',
    'judge',
    'geomantic',
    'condition',
    'proceed',
    'obstruction',
    'stable',
  ],
  sortilege: [
    'cast',
    'dice',
    'stone',
    'card',
    'coin',
    'stick',
    'symbol',
    'interpretation',
    'guidance',
    'sortilege',
  ],
  navaratna: [
    'gemstone',
    'stone',
    'lagnesh',
    'life stone',
    'dasha',
    'planet',
    'wear',
    'mantra',
    'benefit',
    'avoid',
  ],
} as const;
