/**
 * Tool Seer question-cache registry: collection names + keywords per route label.
 * Used by callTextStream (auto-resolve) and route handlers (write-after-stream).
 */

import type { SeerQuestionCacheConfig } from '@/lib/seerQuestionCacheTypes';
import { SEER_CACHE_KEYWORDS } from '@/lib/seerQuestionSimilarity';

export const GENERIC_SEER_CACHE_KEYWORDS = [
  'chart',
  'reading',
  'guidance',
  'timing',
  'meaning',
  'future',
  'career',
  'love',
  'relationship',
  'planet',
  'house',
  'sign',
  'transit',
  'birth',
  'question',
] as const;

/** Extra domain terms merged with {@link GENERIC_SEER_CACHE_KEYWORDS} per tool slug. */
const TOOL_KEYWORD_EXTRA: Record<string, readonly string[]> = {
  tarot: ['card', 'spread', 'arcana', 'reversed', 'deck', 'major', 'minor'],
  lenormand: ['card', 'spread', 'line', 'reading', 'symbol'],
  western: ['ascendant', 'moon', 'sun', 'aspect', 'natal', 'libra', 'scorpio'],
  vedic: ['dasha', 'nakshatra', 'rashi', 'graha', 'remedy', 'muhurta'],
  'kp-astrology': ['sub', 'cusp', 'significator', 'ruling', 'star'],
  horary: ['querent', 'quesited', 'hour', 'chart', 'outcome'],
  numerology: ['life path', 'destiny', 'number', 'digit', 'name'],
  'kabbalistic-numerology': ['gematria', 'hebrew', 'number', 'name'],
  'angel-numbers': ['angel', 'number', 'sequence', 'synchronicity'],
  synastry: ['compatibility', 'partner', 'composite', 'aspect', 'relationship'],
  astrocartography: ['relocation', 'line', 'country', 'city', 'map'],
  financial: ['market', 'wealth', 'money', 'invest', 'cycle'],
  mundane: ['world', 'event', 'nation', 'eclipse', 'ingress'],
  bazi: ['pillar', 'element', 'luck', 'cycle', 'day master'],
  'ziwei-dou-shu': ['palace', 'star', 'destiny', 'board'],
  vastu: ['direction', 'room', 'home', 'energy', 'space'],
  'feng-shui': ['chi', 'direction', 'element', 'home', 'cure'],
  runes: ['rune', 'cast', 'spread', 'odin', 'symbol'],
  ogham: ['ogham', 'tree', 'stave', 'celtic'],
  scrying: ['vision', 'symbol', 'gaze', 'image'],
  bibliomancy: ['book', 'page', 'verse', 'passage'],
  akashic: ['record', 'soul', 'past', 'karmic'],
  'human-design': ['type', 'authority', 'profile', 'gate', 'channel'],
  'energy-healing': ['chakra', 'healing', 'block', 'energy'],
  shamanic: ['journey', 'spirit', 'totem', 'soul'],
  hermetic: ['hermetic', 'as above', 'correspondence', 'alchemy'],
  esoteric: ['esoteric', 'mystery', 'initiation', 'symbol'],
  psychological: ['psyche', 'shadow', 'archetype', 'inner'],
  'face-reading': ['face', 'feature', 'physiognomy', 'line'],
  'name-analysis': ['name', 'letter', 'sound', 'vibration'],
  'dream-symbols': ['dream', 'symbol', 'night', 'meaning'],
  'daily-decisions': ['decision', 'choice', 'today', 'action'],
  trichakra: ['chakra', 'energy', 'balance', 'body'],
  palmistry: ['palm', 'line', 'mount', 'hand'],
  hellenistic: ['lot', 'sect', 'traditional', 'hellenistic'],
  'kabbalistic-astrology': ['sephira', 'tree', 'kabbalah', 'zodiac'],
};

function toolSlugFromLabel(label: string): string | null {
  if (label.startsWith('ask-') && label.endsWith('-seer')) {
    return label.slice(4, -5);
  }
  if (label.endsWith('-ask-seer')) {
    return label.slice(0, -9);
  }
  return null;
}

/** e.g. `ask-tarot-seer` → `tarotSeerCache`, `hellenistic-ask-seer` → `hellenisticSeerCache` */
export function toolSeerCacheCollectionFromLabel(label: string): string | null {
  const slug = toolSlugFromLabel(label);
  if (!slug) return null;
  const camel = slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  return `${camel}SeerCache`;
}

export function keywordsForToolLabel(label: string): string[] {
  const slug = toolSlugFromLabel(label);
  const preset =
    slug && slug in SEER_CACHE_KEYWORDS
      ? SEER_CACHE_KEYWORDS[slug as keyof typeof SEER_CACHE_KEYWORDS]
      : slug
        ? TOOL_KEYWORD_EXTRA[slug]
        : undefined;

  const merged = new Set<string>([...GENERIC_SEER_CACHE_KEYWORDS]);
  if (preset) {
    for (const kw of preset) merged.add(kw);
  }
  return [...merged];
}

export function buildToolSeerQuestionCache(
  label: string,
  question: string,
): SeerQuestionCacheConfig | null {
  const collectionName = toolSeerCacheCollectionFromLabel(label);
  if (!collectionName) return null;
  return {
    collectionName,
    question,
    keywords: keywordsForToolLabel(label),
  };
}

export async function cacheToolSeerAnswer(
  label: string,
  userId: string,
  question: string,
  answer: string,
): Promise<void> {
  const collectionName = toolSeerCacheCollectionFromLabel(label);
  if (!collectionName || !answer.trim()) return;
  const { cacheSeerQuestionAnswer } = await import('@/lib/seerQuestionCache');
  await cacheSeerQuestionAnswer({
    userId,
    collectionName,
    question,
    answer,
  });
}

/** Resolve explicit `questionCache` or auto-build from tool route label. */
export function resolveToolSeerQuestionCache(
  options: {
    label: string;
    userId?: string;
    questionCache?: SeerQuestionCacheConfig;
    cacheQuestion?: string;
    guardUserText?: string;
  },
): SeerQuestionCacheConfig | undefined {
  if (options.questionCache) return options.questionCache;
  if (!options.userId) return undefined;
  const question = (options.cacheQuestion ?? options.guardUserText ?? '').trim();
  if (!question) return undefined;
  return buildToolSeerQuestionCache(options.label, question) ?? undefined;
}
