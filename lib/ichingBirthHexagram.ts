/**
 * deterministic birth hexagram from birth date for profile generation.
 * Used when no I Ching reading has been cast; provides a stable seed for Ask the Seer.
 */

import type { IChingHexagram } from './ichingIntelligence';

const HEXAGRAM_NAMES: Record<number, { name: string; meaning: string }> = {
  1: { name: 'The Creative', meaning: 'Pure Yang, Creative Force' },
  2: { name: 'The Receptive', meaning: 'Pure Yin, Receptive Force' },
  3: { name: 'Difficulty at the Beginning', meaning: 'Initial Hardship, Growth' },
  4: { name: 'Youthful Folly', meaning: 'Inexperience, Learning' },
  5: { name: 'Waiting', meaning: 'Patience, Nourishment' },
  6: { name: 'Conflict', meaning: 'Dispute, Resolution' },
  7: { name: 'The Army', meaning: 'Discipline, Leadership' },
  8: { name: 'Holding Together', meaning: 'Union, Cooperation' },
  9: { name: 'Small Taming', meaning: 'Gentle Restraint' },
  10: { name: 'Treading', meaning: 'Conduct, Behavior' },
  11: { name: 'Peace', meaning: 'Harmony, Prosperity' },
  12: { name: 'Standstill', meaning: 'Stagnation, Block' },
  13: { name: 'Fellowship', meaning: 'Unity, Cooperation' },
  14: { name: 'Great Possession', meaning: 'Abundance, Success' },
  15: { name: 'Modesty', meaning: 'Humility, Balance' },
  16: { name: 'Enthusiasm', meaning: 'Energy, Inspired Action' },
  17: { name: 'Following', meaning: 'Adaptation, Flow' },
  18: { name: 'Work on What Has Been Spoiled', meaning: 'Repair, Correction' },
  19: { name: 'Approach', meaning: 'Advancement, Approach' },
  20: { name: 'Contemplation', meaning: 'Awareness, Observation' },
};

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
  const meta = HEXAGRAM_NAMES[num] ?? { name: `Hexagram ${num}`, meaning: 'Guidance' };
  const bits = (num - 1).toString(2).padStart(6, '0');
  const lines = [1, 2, 3, 4, 5, 6].map((position) => {
    const yang = bits[6 - position] === '1';
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
    name: meta.name,
    chinese: '',
    pinyin: '',
    trigram: '',
    element: 'Metal',
    meaning: meta.meaning,
    description: meta.meaning,
    lines,
    changingLines: [],
    trigramUpper: '',
    trigramLower: '',
    elementUpper: '',
    elementLower: '',
  };
}
