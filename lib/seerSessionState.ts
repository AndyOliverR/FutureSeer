/**
 * Seer Session State
 *
 * Per-session memory: active intent, sub-intent, consumed entities, blocked domains.
 * Used to prevent repetition, exclude consumed dates, and enforce remedy sub-intent.
 */

export interface SeerSessionStateData {
  activeIntent?: string;
  activeSubIntent?: string;
  lastAnswerHash?: string;
  consumedEntities?: string[];
  blockedDomains?: string[];
}

/** Simple hash for answer deduplication. */
export function hashAnswer(answer: string): string {
  const safe = (answer || '').trim().slice(0, 200);
  let h = 0;
  for (let i = 0; i < safe.length; i++) {
    h = ((h << 5) - h) + safe.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h).toString(36);
}

/** Extract dates (YYYY-MM-DD) from text for consumption. */
export function extractDatesFromText(text: string): string[] {
  const matches = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/g);
  return matches ? [...new Set(matches)] : [];
}

/** Check if we should exclude a date (already consumed). */
export function shouldExcludeDate(dateStr: string, consumedDates: string[]): boolean {
  return consumedDates.includes(dateStr);
}
