/**
 * Deterministic birth hexagram from birth date for profile generation.
 * Used when no I Ching reading has been cast; provides a stable seed for Ask the Seer.
 * The drawn lines are the King Wen figure for that number (bottom line first).
 */

import type { IChingHexagram } from './ichingIntelligence';
import { kingWenHexagramByNumber } from '@/lib/iching/kingWenLines';

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Build a deterministic birth hexagram from birth date.
 * No changing lines.
 */
export function buildBirthHexagram(birthDate: string): IChingHexagram {
  const num = (hashString(birthDate || '') % 64) + 1;
  const canonical = kingWenHexagramByNumber(num);
  const bottomUp = canonical?.bottomUp ?? (num - 1).toString(2).padStart(6, '0');
  const lines = [1, 2, 3, 4, 5, 6].map((position) => {
    const yang = bottomUp[position - 1] === '1';
    return {
      position,
      text: yang ? 'Nine' : 'Six',
      meaning: yang ? 'Yang line — firm, initiating' : 'Yin line — yielding, receptive',
      changing: false,
      yinYang: (yang ? 'yang' : 'yin') as 'yang' | 'yin',
      element: yang ? 'Metal' : 'Earth',
    };
  });
  return {
    number: num,
    name: canonical?.name ?? `Hexagram ${num}`,
    chinese: canonical?.chinese ?? '',
    pinyin: canonical?.pinyin ?? '',
    trigram: '',
    element: '',
    meaning: canonical?.name ?? 'Guidance',
    description: canonical?.name ?? 'Guidance',
    lines,
    changingLines: [],
    trigramUpper: '',
    trigramLower: '',
    elementUpper: '',
    elementLower: '',
  };
}
