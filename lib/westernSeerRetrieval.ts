/**
 * Western Seer retrieval: intent → section mapping and loading report chunks.
 * Deterministic retrieval only; no ML.
 */

import type { WesternReportChunks, WesternChunkKey } from './westernReportChunks';
import { adminDb } from './firebase-admin';

/** Western question types that map to report chunk keys. */
export type WesternIntent =
  | 'career'
  | 'relationships'
  | 'timing'
  | 'health'
  | 'personality'
  | 'general'
  | 'sun_sign'
  | 'moon_sign'
  | 'rising_sign'
  | 'transits'
  | 'electional'
  | 'life_purpose'
  | 'wealth'
  | 'houses'
  | 'aspects'
  | 'remedies';

/** Intent → report section (chunk) keys to inject into the prompt. */
const INTENT_TO_CHUNK_KEYS: Record<WesternIntent, WesternChunkKey[]> = {
  career: ['career', 'sun', 'timing'],
  relationships: ['relationships', 'moon', 'personality', 'timing'],
  timing: ['timing', 'general'],
  electional: ['timing', 'general'],
  transits: ['timing', 'general'],
  health: ['health', 'moon', 'general'],
  personality: ['personality', 'sun', 'moon', 'ascendant'],
  sun_sign: ['personality', 'sun', 'ascendant'],
  moon_sign: ['personality', 'moon', 'ascendant'],
  rising_sign: ['personality', 'ascendant', 'sun'],
  life_purpose: ['personality', 'career', 'sun', 'general'],
  wealth: ['career', 'general'],
  houses: ['general', 'personality'],
  aspects: ['general', 'personality'],
  remedies: ['personality', 'general'],
  general: ['general', 'personality']
};

/**
 * Returns which report chunk keys to retrieve for the given intent.
 * Used to build the prompt context from stored report chunks.
 */
export function getSectionsForIntent(intent: string): WesternChunkKey[] {
  const normalized = intent.toLowerCase().trim() as WesternIntent;
  const keys = INTENT_TO_CHUNK_KEYS[normalized];
  if (keys && keys.length > 0) return keys;
  return ['general', 'personality'];
}

/**
 * Loads stored Western report chunks for a user from Firestore.
 * Path: users/{userId}/westernAstrologyReports/comprehensive.reportChunks
 * Returns null if no report or no reportChunks (e.g. pre-chunk cache).
 */
export async function getWesternReportChunksForUser(userId: string): Promise<WesternReportChunks | null> {
  if (!userId) return null;
  if (!adminDb) return null;
  try {
    const ref = adminDb
      .collection('users')
      .doc(userId)
      .collection('westernAstrologyReports')
      .doc('comprehensive');
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : null;
    const chunks = data?.reportChunks;
    if (chunks && typeof chunks === 'object') return chunks as WesternReportChunks;
    return null;
  } catch {
    return null;
  }
}

/**
 * Renders selected chunks as plain text for the prompt (retrieval-only context).
 */
export function formatChunksForPrompt(chunks: WesternReportChunks, chunkKeys: WesternChunkKey[]): string {
  const seen = new Set<WesternChunkKey>();
  const lines: string[] = [];
  for (const key of chunkKeys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const section = chunks[key];
    if (!section) continue;
    if ('meaning' in section && typeof (section as { meaning?: string }).meaning === 'string') {
      const s = section as { sign: string; house?: number; meaning: string };
      lines.push(`## ${key}`);
      lines.push(`${s.sign}${s.house != null ? `, House ${s.house}` : ''}: ${s.meaning}`);
    } else if ('summary' in section) {
      const s = section as { summary: string; indicators?: string[] };
      lines.push(`## ${key}`);
      lines.push(s.summary);
      if (Array.isArray(s.indicators) && s.indicators.length > 0) {
        lines.push(`Indicators: ${s.indicators.join(', ')}`);
      }
      if ('chartOverview' in s && (s as { chartOverview?: string }).chartOverview) {
        lines.push((s as { chartOverview: string }).chartOverview);
      }
    }
    lines.push('');
  }
  return lines.join('\n').trim() || '';
}
