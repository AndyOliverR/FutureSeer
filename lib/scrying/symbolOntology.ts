/**
 * Scrying Symbol Ontology
 * Structured taxonomy: elemental, archetypal, objects, motion, color.
 * Each symbol has meanings per context domain and risk/opportunity polarity.
 */

export type ContextDomain = 'relationship' | 'career' | 'financial' | 'spiritual' | 'health';

export type SymbolCategory = 'elemental' | 'archetypal' | 'object' | 'motion' | 'color';

export interface SymbolMeaning {
  psychological: string;
  situational: string;
  positive: string;
  shadow: string;
  /** -1 = risk, 0 = neutral, 1 = opportunity */
  polarity: -1 | 0 | 1;
  /** Domain-specific short interpretation */
  byDomain: Partial<Record<ContextDomain, string>>;
}

export interface SymbolEntry {
  id: string;
  category: SymbolCategory;
  label: string;
  meaning: SymbolMeaning;
}

/** Elemental symbols */
export const ELEMENTAL_SYMBOLS: SymbolEntry[] = [
  {
    id: 'fire',
    category: 'elemental',
    label: 'Fire',
    meaning: {
      psychological: 'Passion, will, transformation',
      situational: 'Action, purification, drive',
      positive: 'Creative energy, courage',
      shadow: 'Destruction, anger, burnout',
      polarity: 1,
      byDomain: {
        relationship: 'Passion and renewal in connection',
        career: 'Initiative and leadership',
        financial: 'Speculative energy; manage risk',
        spiritual: 'Inner fire and devotion',
        health: 'Vitality; watch inflammation',
      },
    },
  },
  {
    id: 'water',
    category: 'elemental',
    label: 'Water',
    meaning: {
      psychological: 'Emotion, intuition, flow',
      situational: 'Adaptability, healing',
      positive: 'Emotional depth, receptivity',
      shadow: 'Overwhelm, escapism',
      polarity: 0,
      byDomain: {
        relationship: 'Depth of feeling and empathy',
        career: 'Flow and collaboration',
        financial: 'Liquid assets; avoid impulsive moves',
        spiritual: 'Surrender and purification',
        health: 'Emotional and fluid balance',
      },
    },
  },
  {
    id: 'wind',
    category: 'elemental',
    label: 'Wind / Air',
    meaning: {
      psychological: 'Mind, communication, change',
      situational: 'Movement, ideas, breath',
      positive: 'Clarity, new perspectives',
      shadow: 'Scattered energy, anxiety',
      polarity: 0,
      byDomain: {
        relationship: 'Communication and honesty',
        career: 'Networking and ideas',
        financial: 'Information flow; volatility',
        spiritual: 'Breath and spirit',
        health: 'Respiratory and nervous balance',
      },
    },
  },
  {
    id: 'earth',
    category: 'elemental',
    label: 'Earth',
    meaning: {
      psychological: 'Stability, embodiment, security',
      situational: 'Manifestation, grounding',
      positive: 'Practical results, patience',
      shadow: 'Stagnation, rigidity',
      polarity: 1,
      byDomain: {
        relationship: 'Stability and commitment',
        career: 'Steady growth and reliability',
        financial: 'Security and long-term holdings',
        spiritual: 'Grounded practice',
        health: 'Physical and structural support',
      },
    },
  },
];

/** Archetypal figures */
export const ARCHETYPAL_SYMBOLS: SymbolEntry[] = [
  {
    id: 'animal',
    category: 'archetypal',
    label: 'Animal',
    meaning: {
      psychological: 'Instinct, nature, vitality',
      situational: 'Primal guidance',
      positive: 'Instinctual wisdom',
      shadow: 'Unconscious drive',
      polarity: 0,
      byDomain: {
        relationship: 'Natural compatibility',
        career: 'Competitive or cooperative instinct',
        financial: 'Gut feeling; verify with logic',
        spiritual: 'Totem or guide',
        health: 'Body wisdom',
      },
    },
  },
  {
    id: 'child',
    category: 'archetypal',
    label: 'Child',
    meaning: {
      psychological: 'Innocence, new beginnings',
      situational: 'Fresh start, vulnerability',
      positive: 'Openness and curiosity',
      shadow: 'Naivety, dependence',
      polarity: 1,
      byDomain: {
        relationship: 'New love or renewal',
        career: 'New projects or learning',
        financial: 'New income stream; caution',
        spiritual: 'Beginner mind',
        health: 'Recovery and renewal',
      },
    },
  },
  {
    id: 'elder',
    category: 'archetypal',
    label: 'Elder / Sage',
    meaning: {
      psychological: 'Wisdom, tradition',
      situational: 'Mentorship, legacy',
      positive: 'Guidance and patience',
      shadow: 'Rigidity, fear of change',
      polarity: 1,
      byDomain: {
        relationship: 'Mature love or mentorship',
        career: 'Experience and authority',
        financial: 'Conservative wisdom',
        spiritual: 'Lineage and tradition',
        health: 'Long-term care',
      },
    },
  },
  {
    id: 'warrior',
    category: 'archetypal',
    label: 'Warrior',
    meaning: {
      psychological: 'Courage, boundaries',
      situational: 'Conflict or defense',
      positive: 'Assertion and protection',
      shadow: 'Aggression, domination',
      polarity: 0,
      byDomain: {
        relationship: 'Setting boundaries',
        career: 'Competition and ambition',
        financial: 'Assertive negotiation',
        spiritual: 'Discipline and will',
        health: 'Strength and endurance',
      },
    },
  },
  {
    id: 'shadow',
    category: 'archetypal',
    label: 'Shadow figure',
    meaning: {
      psychological: 'Unconscious, repressed',
      situational: 'Hidden influence',
      positive: 'Integration and awareness',
      shadow: 'Fear, blockage',
      polarity: -1,
      byDomain: {
        relationship: 'Unspoken dynamics',
        career: 'Hidden opposition or self-sabotage',
        financial: 'Hidden risk or debt',
        spiritual: 'Shadow work',
        health: 'Underlying condition',
      },
    },
  },
];

/** Objects */
export const OBJECT_SYMBOLS: SymbolEntry[] = [
  { id: 'key', category: 'object', label: 'Key', meaning: { psychological: 'Access, solution', situational: 'Opening', positive: 'Opportunity unlocked', shadow: 'Secrets', polarity: 1, byDomain: { relationship: 'Resolution', career: 'Breakthrough', financial: 'Access to resources', spiritual: 'Initiation', health: 'Diagnosis or cure' } } },
  { id: 'door', category: 'object', label: 'Door', meaning: { psychological: 'Transition', situational: 'Choice', positive: 'New phase', shadow: 'Blocked path', polarity: 1, byDomain: { relationship: 'New chapter', career: 'New role', financial: 'New opportunity', spiritual: 'Gateway', health: 'Recovery path' } } },
  { id: 'bridge', category: 'object', label: 'Bridge', meaning: { psychological: 'Connection', situational: 'Transition', positive: 'Building links', shadow: 'Unstable crossing', polarity: 1, byDomain: { relationship: 'Reconciliation', career: 'Partnership', financial: 'Mediation', spiritual: 'Between worlds', health: 'Integration' } } },
  { id: 'snake', category: 'object', label: 'Snake', meaning: { psychological: 'Transformation', situational: 'Renewal or danger', positive: 'Healing, kundalini', shadow: 'Deception, volatility', polarity: 0, byDomain: { relationship: 'Jealousy or transformation', career: 'Strategic change', financial: 'Hidden volatility', spiritual: 'Kundalini awakening', health: 'Healing or toxin' } } },
  { id: 'crown', category: 'object', label: 'Crown', meaning: { psychological: 'Authority', situational: 'Recognition', positive: 'Achievement', shadow: 'Ego', polarity: 1, byDomain: { relationship: 'Commitment', career: 'Leadership', financial: 'Wealth peak', spiritual: 'Sovereignty', health: 'Vitality' } } },
  { id: 'tower', category: 'object', label: 'Tower', meaning: { psychological: 'Structure', situational: 'Stability or collapse', positive: 'Achievement', shadow: 'Sudden fall', polarity: -1, byDomain: { relationship: 'Crisis or solidity', career: 'Institution', financial: 'Sudden loss risk', spiritual: 'Ego structure', health: 'Structural issue' } } },
  { id: 'light', category: 'object', label: 'Light source', meaning: { psychological: 'Clarity', situational: 'Revelation', positive: 'Insight', shadow: 'Blinding', polarity: 1, byDomain: { relationship: 'Clarity', career: 'Visibility', financial: 'Transparency', spiritual: 'Illumination', health: 'Diagnosis' } } },
  { id: 'veil', category: 'object', label: 'Veil / Fog', meaning: { psychological: 'Mystery', situational: 'Uncertainty', positive: 'Protection', shadow: 'Confusion', polarity: -1, byDomain: { relationship: 'Unclear intentions', career: 'Uncertainty', financial: 'Lack of clarity', spiritual: 'Mystery', health: 'Unclear cause' } } },
];

/** Motion patterns */
export const MOTION_SYMBOLS: SymbolEntry[] = [
  { id: 'rising', category: 'motion', label: 'Rising', meaning: { psychological: 'Growth', situational: 'Future', positive: 'Ascension', shadow: 'Overreach', polarity: 1, byDomain: { relationship: 'Developing', career: 'Advancement', financial: 'Uptrend', spiritual: 'Evolution', health: 'Recovery' } } },
  { id: 'falling', category: 'motion', label: 'Falling', meaning: { psychological: 'Release', situational: 'Decline', positive: 'Letting go', shadow: 'Loss', polarity: -1, byDomain: { relationship: 'Ending phase', career: 'Setback', financial: 'Downtrend', spiritual: 'Surrender', health: 'Decline' } } },
  { id: 'breaking', category: 'motion', label: 'Breaking', meaning: { psychological: 'Disruption', situational: 'Change', positive: 'Breakthrough', shadow: 'Shattering', polarity: -1, byDomain: { relationship: 'Rupture', career: 'Disruption', financial: 'Volatility', spiritual: 'Ego death', health: 'Crisis' } } },
  { id: 'circular', category: 'motion', label: 'Circular', meaning: { psychological: 'Cycles', situational: 'Repetition', positive: 'Completion', shadow: 'Stuck', polarity: 0, byDomain: { relationship: 'Cycles', career: 'Routine', financial: 'Cycles', spiritual: 'Karma', health: 'Recurrence' } } },
];

/** Color mapping */
export const COLOR_SYMBOLS: SymbolEntry[] = [
  { id: 'red', category: 'color', label: 'Red', meaning: { psychological: 'Urgency', situational: 'Conflict or passion', positive: 'Vitality', shadow: 'Anger', polarity: 0, byDomain: { relationship: 'Passion', career: 'Competition', financial: 'Risk', spiritual: 'Root energy', health: 'Inflammation' } } },
  { id: 'blue', category: 'color', label: 'Blue', meaning: { psychological: 'Intuition', situational: 'Calm', positive: 'Clarity', shadow: 'Depression', polarity: 1, byDomain: { relationship: 'Trust', career: 'Communication', financial: 'Stability', spiritual: 'Throat/vision', health: 'Calm' } } },
  { id: 'black', category: 'color', label: 'Black', meaning: { psychological: 'Hidden', situational: 'Unknown', positive: 'Potential', shadow: 'Fear', polarity: -1, byDomain: { relationship: 'Secrets', career: 'Hidden factors', financial: 'Hidden risk', spiritual: 'Shadow', health: 'Unknown cause' } } },
  { id: 'gold', category: 'color', label: 'Gold', meaning: { psychological: 'Opportunity', situational: 'Abundance', positive: 'Success', shadow: 'Greed', polarity: 1, byDomain: { relationship: 'Value', career: 'Reward', financial: 'Wealth', spiritual: 'Light', health: 'Vitality' } } },
  { id: 'green', category: 'color', label: 'Green', meaning: { psychological: 'Growth', situational: 'Nature', positive: 'Healing', shadow: 'Envy', polarity: 1, byDomain: { relationship: 'Growth', career: 'Expansion', financial: 'Growth', spiritual: 'Heart', health: 'Healing' } } },
];

export const ALL_SYMBOLS: SymbolEntry[] = [
  ...ELEMENTAL_SYMBOLS,
  ...ARCHETYPAL_SYMBOLS,
  ...OBJECT_SYMBOLS,
  ...MOTION_SYMBOLS,
  ...COLOR_SYMBOLS,
];

const symbolById = new Map<string, SymbolEntry>();
ALL_SYMBOLS.forEach((s) => symbolById.set(s.id, s));

export function getSymbolById(id: string): SymbolEntry | undefined {
  return symbolById.get(id);
}

export function getSymbolsByCategory(category: SymbolCategory): SymbolEntry[] {
  return ALL_SYMBOLS.filter((s) => s.category === category);
}

export function getSymbolsByPolarity(polarity: -1 | 0 | 1): SymbolEntry[] {
  return ALL_SYMBOLS.filter((s) => s.meaning.polarity === polarity);
}
