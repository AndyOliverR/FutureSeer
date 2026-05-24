/**
 * Per-archetype accent layer for share cards — sits on top of tool-themed base art.
 */

export type ArchetypeAccentKind =
  | 'tension'
  | 'harmony'
  | 'focus'
  | 'fate'
  | 'anchor'
  | 'storm'
  | 'weaver'
  | 'walker'
  | 'witness'
  | 'seeker'
  | 'messenger'
  | 'forger';

export interface ArchetypeAccentConfig {
  kind: ArchetypeAccentKind;
  stroke: string;
  fill: string;
  /** Optional extra radial tint merged into the card halo. */
  haloTint: string;
}

const ACCENT_BY_KIND: Record<ArchetypeAccentKind, ArchetypeAccentConfig> = {
  tension: {
    kind: 'tension',
    stroke: 'rgba(239, 68, 68, 0.55)',
    fill: 'rgba(239, 68, 68, 0.1)',
    haloTint: 'rgba(239, 68, 68, 0.12)',
  },
  harmony: {
    kind: 'harmony',
    stroke: 'rgba(45, 212, 191, 0.5)',
    fill: 'rgba(45, 212, 191, 0.1)',
    haloTint: 'rgba(45, 212, 191, 0.1)',
  },
  focus: {
    kind: 'focus',
    stroke: 'rgba(251, 191, 36, 0.55)',
    fill: 'rgba(251, 191, 36, 0.14)',
    haloTint: 'rgba(251, 191, 36, 0.14)',
  },
  fate: {
    kind: 'fate',
    stroke: 'rgba(167, 139, 250, 0.55)',
    fill: 'rgba(167, 139, 250, 0.1)',
    haloTint: 'rgba(167, 139, 250, 0.12)',
  },
  anchor: {
    kind: 'anchor',
    stroke: 'rgba(148, 163, 184, 0.5)',
    fill: 'rgba(148, 163, 184, 0.08)',
    haloTint: 'rgba(148, 163, 184, 0.1)',
  },
  storm: {
    kind: 'storm',
    stroke: 'rgba(96, 165, 250, 0.45)',
    fill: 'rgba(96, 165, 250, 0.08)',
    haloTint: 'rgba(96, 165, 250, 0.1)',
  },
  weaver: {
    kind: 'weaver',
    stroke: 'rgba(244, 114, 182, 0.45)',
    fill: 'rgba(244, 114, 182, 0.08)',
    haloTint: 'rgba(244, 114, 182, 0.08)',
  },
  walker: {
    kind: 'walker',
    stroke: 'rgba(253, 224, 71, 0.45)',
    fill: 'rgba(253, 224, 71, 0.08)',
    haloTint: 'rgba(253, 224, 71, 0.1)',
  },
  witness: {
    kind: 'witness',
    stroke: 'rgba(196, 181, 253, 0.5)',
    fill: 'rgba(196, 181, 253, 0.1)',
    haloTint: 'rgba(196, 181, 253, 0.1)',
  },
  seeker: {
    kind: 'seeker',
    stroke: 'rgba(251, 191, 36, 0.48)',
    fill: 'rgba(251, 191, 36, 0.08)',
    haloTint: 'rgba(251, 191, 36, 0.1)',
  },
  messenger: {
    kind: 'messenger',
    stroke: 'rgba(254, 243, 199, 0.5)',
    fill: 'rgba(254, 243, 199, 0.08)',
    haloTint: 'rgba(254, 243, 199, 0.1)',
  },
  forger: {
    kind: 'forger',
    stroke: 'rgba(249, 115, 22, 0.5)',
    fill: 'rgba(249, 115, 22, 0.1)',
    haloTint: 'rgba(249, 115, 22, 0.1)',
  },
};

/** Explicit map for every archetype title emitted by teaser builders. */
const ARCHETYPE_TITLE_TO_KIND: Record<string, ArchetypeAccentKind> = {
  'Tension Alchemist': 'tension',
  Crossroads: 'tension',
  'Harmonic Triad': 'harmony',
  'Qi Harmonizer': 'harmony',
  'Gem Harmonist': 'harmony',
  'Concentration Core': 'focus',
  'Pillar Bearer': 'anchor',
  'Finger of Fate': 'fate',
  'Cosmic Anchor': 'anchor',
  'Steady Builder': 'anchor',
  'Mandala Keeper': 'anchor',
  'Name Bearer': 'anchor',
  'Quiet Storm': 'storm',
  'Field Weaver': 'storm',
  'Signal Weaver': 'weaver',
  'Number Weaver': 'weaver',
  'Palace Weaver': 'weaver',
  'Remedy Weaver': 'weaver',
  'Blueprint Cartographer': 'weaver',
  'Threshold Walker': 'walker',
  'Dream Walker': 'walker',
  'Line Reader': 'walker',
  'Quest Witness': 'witness',
  'Graha Witness': 'witness',
  'Arcana Witness': 'witness',
  'Visage Witness': 'witness',
  'World Pattern Reader': 'witness',
  Seeker: 'seeker',
  'Verse Seeker': 'seeker',
  'Gematria Seeker': 'seeker',
  'Horizon Mapper': 'seeker',
  'Cusp Navigator': 'seeker',
  'Muhurta Guide': 'seeker',
  Messenger: 'messenger',
  'Cycle Breaker': 'forger',
  'Path Forger': 'forger',
};

const KEYWORD_RULES: { pattern: RegExp; kind: ArchetypeAccentKind }[] = [
  { pattern: /tension|alchemist|crossroad/i, kind: 'tension' },
  { pattern: /harmon|triad/i, kind: 'harmony' },
  { pattern: /concentrat|core|pillar|builder|anchor|keeper|bearer|steady/i, kind: 'anchor' },
  { pattern: /fate|finger/i, kind: 'fate' },
  { pattern: /storm|field/i, kind: 'storm' },
  { pattern: /weaver|cartographer/i, kind: 'weaver' },
  { pattern: /walker|reader|mapper/i, kind: 'walker' },
  { pattern: /witness/i, kind: 'witness' },
  { pattern: /seeker|guide|navigator/i, kind: 'seeker' },
  { pattern: /messenger/i, kind: 'messenger' },
  { pattern: /forger|breaker/i, kind: 'forger' },
];

function hashTitle(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return h;
}

const FALLBACK_KINDS: ArchetypeAccentKind[] = [
  'seeker',
  'witness',
  'weaver',
  'harmony',
  'focus',
  'anchor',
];

function normalizeArchetypeTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ');
}

/**
 * Resolves the accent overlay for an archetype title (second layer on tool art).
 */
export function resolveArchetypeAccent(archetypeTitle: string): ArchetypeAccentConfig {
  const normalized = normalizeArchetypeTitle(archetypeTitle);
  const explicit = ARCHETYPE_TITLE_TO_KIND[normalized];
  if (explicit) return ACCENT_BY_KIND[explicit];

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(normalized)) return ACCENT_BY_KIND[rule.kind];
  }

  const fallback = FALLBACK_KINDS[hashTitle(normalized) % FALLBACK_KINDS.length];
  return ACCENT_BY_KIND[fallback];
}

/** Merge tool halo with archetype tint for the center glow. */
export function blendHaloWithAccent(toolHalo: string, accent: ArchetypeAccentConfig): string {
  return `${toolHalo}, radial-gradient(circle, ${accent.haloTint} 0%, transparent 55%)`;
}
