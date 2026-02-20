/**
 * Scrying Context Engine
 * Maps symbols and profile to domain-specific interpretations
 * (relationship, career, financial, spiritual, health).
 */

import type { SymbolEntry, ContextDomain } from './symbolOntology';
import { ALL_SYMBOLS, getSymbolById } from './symbolOntology';

export interface UserProfileForScrying {
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
}

const CONTEXT_DOMAINS: ContextDomain[] = [
  'relationship',
  'career',
  'financial',
  'spiritual',
  'health',
];

/**
 * Simple deterministic seed from profile string (for stable symbol selection).
 */
export function profileSeed(profile: UserProfileForScrying): number {
  const str = [
    profile.fullName ?? '',
    profile.birthDate ?? '',
    profile.birthTime ?? '',
    profile.birthPlace ?? '',
  ]
    .join('|')
    .toLowerCase();
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Seeded pick: given seed and array, return item at index (seed % length).
 * With offset for variety (e.g. offset 0,1,2 for multiple picks).
 */
export function seededPick<T>(arr: T[], seed: number, offset: number = 0): T {
  const idx = (seed + offset) % arr.length;
  return arr[Math.abs(idx)];
}

/**
 * Get interpretation for a symbol in a given domain.
 */
export function getInterpretationForDomain(
  symbol: SymbolEntry,
  domain: ContextDomain
): string {
  const text = symbol.meaning.byDomain[domain];
  if (text) return text;
  return symbol.meaning.situational;
}

/**
 * Build domain interpretations for a set of symbol IDs.
 */
export function buildDomainInterpretations(
  symbolIds: string[],
  profile: UserProfileForScrying
): Record<ContextDomain, string[]> {
  const result = {} as Record<ContextDomain, string[]>;
  for (const domain of CONTEXT_DOMAINS) {
    result[domain] = [];
  }
  for (const id of symbolIds) {
    const sym = getSymbolById(id);
    if (!sym) continue;
    for (const domain of CONTEXT_DOMAINS) {
      const interp = getInterpretationForDomain(sym, domain);
      if (interp) result[domain].push(`${sym.label}: ${interp}`);
    }
  }
  return result;
}

/**
 * Select a stable set of symbol IDs from ontology based on profile seed.
 * Returns roughly 5–8 symbols for variety.
 */
export function selectSymbolsForProfile(
  profile: UserProfileForScrying,
  count: number = 7
): string[] {
  const seed = profileSeed(profile);
  const ids: string[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const sym = seededPick(ALL_SYMBOLS, seed, i * 31);
    if (!used.has(sym.id)) {
      used.add(sym.id);
      ids.push(sym.id);
    }
  }
  return ids;
}

/**
 * Get dominant elemental IDs from selected symbol IDs.
 */
export function getElementalBalance(symbolIds: string[]): Record<string, number> {
  const balance: Record<string, number> = {
    fire: 0,
    water: 0,
    wind: 0,
    earth: 0,
  };
  for (const id of symbolIds) {
    const sym = getSymbolById(id);
    if (sym?.category === 'elemental' && balance[sym.id] !== undefined) {
      balance[sym.id]++;
    }
  }
  return balance;
}

/**
 * Get archetype pattern label from selected symbols (e.g. transition, protection).
 */
export function getArchetypalPattern(symbolIds: string[]): string {
  const patterns = [
    'transition',
    'protection',
    'revelation',
    'conflict',
    'nurturing',
    'transformation',
    'stability',
    'release',
  ];
  const seed = symbolIds.sort().join('');
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return patterns[Math.abs(h) % patterns.length];
}

/**
 * Risk indicators (symbols with polarity -1).
 */
export function getRiskIndicatorSymbols(symbolIds: string[]): string[] {
  return symbolIds.filter((id) => {
    const sym = getSymbolById(id);
    return sym?.meaning.polarity === -1;
  });
}

/**
 * Opportunity indicators (symbols with polarity 1).
 */
export function getOpportunityIndicatorSymbols(symbolIds: string[]): string[] {
  return symbolIds.filter((id) => {
    const sym = getSymbolById(id);
    return sym?.meaning.polarity === 1;
  });
}

/**
 * Timeline orientation: rising = future, central = present, fading = past.
 * Derived from motion symbols in selection.
 */
export function getTimelineOrientation(symbolIds: string[]): {
  past: string;
  present: string;
  future: string;
} {
  const motionIds = symbolIds
    .map((id) => getSymbolById(id))
    .filter((s): s is SymbolEntry => s?.category === 'motion' ?? false);
  const hasRising = motionIds.some((s) => s.id === 'rising');
  const hasFalling = motionIds.some((s) => s.id === 'falling');
  const hasCircular = motionIds.some((s) => s.id === 'circular');
  return {
    past: hasFalling
      ? 'Fading or releasing imagery suggests past influences still informing the present.'
      : 'Past influences remain in the background.',
    present:
      'Central and sustained imagery points to the present moment as the focus of energy.',
    future: hasRising
      ? 'Rising imagery indicates future activation and growth ahead.'
      : 'Future direction is emerging from current choices.',
  };
}
