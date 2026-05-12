/**
 * Yi Jing Oracle Bridge
 *
 * Wraps the `yi-jing-oracle` MIT library to provide FutureSeer's I-Ching
 * module with complete, canonical hexagram data:
 *   - All 64 hexagrams with Chinese names, pinyin, characters
 *   - Full Judgement (Decision) text from King Wen
 *   - Full Image (Da Xiang) text
 *   - All 6 individual line texts (Yao Ci)
 *   - Upper and lower trigram references
 *   - Binary representation for bitwise transformation
 *
 * Additionally provides all 8 trigrams with attributes, images, and family
 * relationships.
 */

import {
  getHexagram as yijGetHexagram,
  getAllHexagrams as yijGetAllHexagrams,
  getTrigram as yijGetTrigram,
  getAllTrigrams as yijGetAllTrigrams,
  findHexagramByBinary,
  type Hexagram as YijHexagram,
  type Trigram as YijTrigram,
} from 'yi-jing-oracle';

// -------------------------------------------------------------------------
// RE-EXPORTED TYPES (enriched for FutureSeer)
// -------------------------------------------------------------------------

export interface EnrichedHexagram {
  number: number;
  name: string;
  alternateNames: string[];
  chineseName: string;
  pinyin: string;
  character: string;
  binary: string;
  title: string;
  description: string;
  summary: string;
  heaven: string;
  judgement: string[];
  image: string[];
  lineTexts: string[];
  upperTrigramNumber: number;
  lowerTrigramNumber: number;
  upperTrigram: EnrichedTrigram | null;
  lowerTrigram: EnrichedTrigram | null;
}

export interface EnrichedTrigram {
  number: number;
  name: string;
  alternateNames: string[];
  chineseName: string;
  pinyin: string;
  character: string;
  attribute: string;
  images: string[];
  chineseImage: string;
  pinyinImage: string;
  familyRelationship: string;
  binary: string;
}

// -------------------------------------------------------------------------
// CONVERSION HELPERS
// -------------------------------------------------------------------------

function convertTrigram(t: YijTrigram | undefined): EnrichedTrigram | null {
  if (!t) return null;
  return {
    number: t.number,
    name: t.names[0] ?? '',
    alternateNames: t.names.slice(1),
    chineseName: t.chinese_name,
    pinyin: t.pinyin_name,
    character: t.character,
    attribute: t.attribute,
    images: t.images,
    chineseImage: t.chinese_image,
    pinyinImage: t.pinyin_image,
    familyRelationship: t.family_relationship,
    binary: t.binary,
  };
}

function convertHexagram(h: YijHexagram): EnrichedHexagram {
  return {
    number: h.number,
    name: h.names[0] ?? '',
    alternateNames: h.names.slice(1),
    chineseName: h.chinese_name,
    pinyin: h.pinyin,
    character: h.character,
    binary: h.binary,
    title: h.title,
    description: h.description,
    summary: h.summary,
    heaven: h.heaven,
    judgement: h.judgement,
    image: h.image,
    lineTexts: h.lines,
    upperTrigramNumber: h.top_trigram,
    lowerTrigramNumber: h.bottom_trigram,
    upperTrigram: convertTrigram(yijGetTrigram(h.top_trigram)),
    lowerTrigram: convertTrigram(yijGetTrigram(h.bottom_trigram)),
  };
}

// -------------------------------------------------------------------------
// PUBLIC API
// -------------------------------------------------------------------------

/**
 * Get an enriched hexagram by number (1-64).
 */
export function getEnrichedHexagram(num: number): EnrichedHexagram | null {
  const raw = yijGetHexagram(num);
  if (!raw) return null;
  return convertHexagram(raw);
}

/**
 * Get all 64 enriched hexagrams.
 */
export function getAllEnrichedHexagrams(): EnrichedHexagram[] {
  return yijGetAllHexagrams().map(convertHexagram);
}

/**
 * Get an enriched trigram by number (1-8).
 */
export function getEnrichedTrigram(num: number): EnrichedTrigram | null {
  return convertTrigram(yijGetTrigram(num));
}

/**
 * Get all 8 enriched trigrams.
 */
export function getAllEnrichedTrigrams(): EnrichedTrigram[] {
  return yijGetAllTrigrams().map(t => convertTrigram(t)!);
}

/**
 * Given a 6-character binary string (e.g. "111111" for hexagram 1),
 * find the matching enriched hexagram.
 */
export function findEnrichedHexagramByBinary(binary: string): EnrichedHexagram | null {
  const raw = findHexagramByBinary(binary);
  if (!raw) return null;
  return convertHexagram(raw);
}

/**
 * Compute the transformed hexagram when specific lines change.
 * @param hexagramNumber — the original hexagram (1-64)
 * @param changingLinePositions — 1-based line positions that are changing
 * @returns The resulting hexagram after the transformation, or null.
 */
export function computeTransformedHexagram(
  hexagramNumber: number,
  changingLinePositions: number[],
): EnrichedHexagram | null {
  const original = yijGetHexagram(hexagramNumber);
  if (!original) return null;

  const bits = original.binary.split('');
  for (const pos of changingLinePositions) {
    const idx = pos - 1;
    if (idx >= 0 && idx < 6) {
      bits[idx] = bits[idx] === '1' ? '0' : '1';
    }
  }

  return findEnrichedHexagramByBinary(bits.join(''));
}

/**
 * Format a hexagram's Judgement + Image for prompt injection.
 */
export function formatHexagramForPrompt(hex: EnrichedHexagram): string {
  const parts: string[] = [
    `Hexagram ${hex.number}: ${hex.name} (${hex.character} ${hex.chineseName})`,
    `Upper Trigram: ${hex.upperTrigram?.name ?? 'Unknown'} (${hex.upperTrigram?.attribute ?? ''})`,
    `Lower Trigram: ${hex.lowerTrigram?.name ?? 'Unknown'} (${hex.lowerTrigram?.attribute ?? ''})`,
    '',
    `Description: ${hex.description}`,
  ];

  if (hex.judgement.length > 0) {
    parts.push('', 'Judgement:', ...hex.judgement);
  }
  if (hex.image.length > 0) {
    parts.push('', 'Image:', ...hex.image);
  }
  if (hex.lineTexts.length > 0) {
    parts.push('', 'Line Texts:');
    hex.lineTexts.forEach((text, i) => {
      parts.push(`  Line ${i + 1}: ${text}`);
    });
  }

  return parts.join('\n');
}
