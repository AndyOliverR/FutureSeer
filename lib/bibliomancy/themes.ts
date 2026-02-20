/**
 * Controlled ontology for bibliomancy: themes, archetypes, tone, and domain mapping.
 * Used for symbolic tagging and life-domain interpretation.
 */

export const THEMES = [
  'Patience',
  'Conflict',
  'Faith',
  'Warning',
  'Abundance',
  'Surrender',
  'Guidance',
  'Covenant',
  'Renewal',
  'Hope',
  'Duty',
  'Devotion',
] as const;

export type Theme = (typeof THEMES)[number];

export const ARCHETYPES = [
  'Journey',
  'Covenant',
  'Exile',
  'Battle',
  'Surrender',
  'Renewal',
  'Refuge',
  'Guidance',
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export const TONES = [
  'Encouragement',
  'Warning',
  'Judgment',
  'Reflection',
  'Instruction',
  'Neutral',
] as const;

export type Tone = (typeof TONES)[number];

export const POLARITY = ['positive', 'cautionary', 'neutral'] as const;
export type Polarity = (typeof POLARITY)[number];

export const DIRECTIVES = [
  'wait',
  'act',
  'surrender',
  'reflect',
  'persist',
  'restructure',
  'trust',
] as const;

export type Directive = (typeof DIRECTIVES)[number];

export const LIFE_DOMAINS = [
  'finance',
  'relationship',
  'career',
  'spiritual',
  'health',
  'general',
] as const;

export type LifeDomain = (typeof LIFE_DOMAINS)[number];

/** Map theme -> domain -> short interpretation template */
export const DOMAIN_TEMPLATES: Record<
  string,
  Partial<Record<LifeDomain, string>>
> = {
  Patience: {
    finance: 'This passage suggests delayed reward and the importance of long-term discipline.',
    relationship: 'Patience in connection is advised; timing and trust matter.',
    career: 'Steady progress over time is favored over haste.',
    spiritual: 'Inner waiting and trust in a higher order are highlighted.',
    health: 'Recovery and balance may require time; avoid forcing outcomes.',
    general: 'Patience and steadfastness are emphasized.',
  },
  Faith: {
    finance: 'Trust in a larger order while taking practical steps.',
    relationship: 'Faith in the bond and in timing can support the path.',
    career: 'Belief in your purpose can sustain effort.',
    spiritual: 'Faith and surrender to the unseen are central.',
    health: 'Hope and trust can support healing.',
    general: 'Faith and trust are central to the message.',
  },
  Surrender: {
    general: 'Letting go of control and accepting what is can bring peace.',
    spiritual: 'Surrender to the divine or to life as it unfolds.',
    career: 'Release rigid plans; allow new possibilities.',
    relationship: 'Acceptance of the other and of timing.',
    finance: 'Avoid forcing outcomes; allow flow.',
    health: 'Rest and acceptance support recovery.',
  },
  Guidance: {
    general: 'The passage points toward seeking or following guidance.',
    spiritual: 'Divine or inner guidance is indicated.',
    career: 'Mentorship or clarity of direction may help.',
    relationship: 'Listening and heeding wise counsel.',
    finance: 'Seek advice before major decisions.',
    health: 'Follow professional or intuitive guidance.',
  },
  Duty: {
    career: 'Fulfilling responsibility and dharma is emphasized.',
    relationship: 'Commitment and duty to others.',
    spiritual: 'Right action and purpose are highlighted.',
    general: 'Doing what is right regardless of outcome.',
    finance: 'Integrity and honest effort.',
    health: 'Care for self and others as duty.',
  },
  Hope: {
    general: 'Hope and expectation of good are encouraged.',
    spiritual: 'Trust in a positive outcome or higher plan.',
    health: 'Hope supports healing and resilience.',
    career: 'Optimism about future possibilities.',
    relationship: 'Hope for connection and resolution.',
    finance: 'Positive outlook with practical steps.',
  },
  Warning: {
    general: 'Caution and awareness are advised.',
    finance: 'Avoid rash decisions; check details.',
    relationship: 'Proceed with care and clarity.',
    career: 'Watch for overconfidence or haste.',
    health: 'Take care; avoid excess.',
    spiritual: 'Vigilance in practice and intention.',
  },
  Abundance: {
    finance: 'Generosity and plenty are themes.',
    general: 'Abundance and gratitude are highlighted.',
    spiritual: 'Spiritual richness and giving.',
    relationship: 'Generosity in love and attention.',
    career: 'Recognition and reward possible.',
    health: 'Vitality and nourishment.',
  },
  Conflict: {
    general: 'Inner or outer conflict is acknowledged; resolution through clarity.',
    relationship: 'Tension may require honest dialogue.',
    career: 'Obstacles call for strategy, not force.',
    spiritual: 'Inner struggle as part of growth.',
    finance: 'Avoid impulsive moves during tension.',
    health: 'Address sources of stress.',
  },
  Devotion: {
    spiritual: 'Devotion and love for the divine are central.',
    relationship: 'Dedication and loyalty in connection.',
    career: 'Commitment to craft or purpose.',
    general: 'Wholehearted dedication is valued.',
    finance: 'Invest in what truly matters.',
    health: 'Care and attention to self.',
  },
  Renewal: {
    general: 'New beginnings and renewal are possible.',
    spiritual: 'Inner renewal and rebirth.',
    career: 'Fresh starts and new directions.',
    relationship: 'Healing and a new chapter.',
    health: 'Recovery and revitalization.',
    finance: 'New cycles of opportunity.',
  },
  Covenant: {
    relationship: 'Commitment and promise are emphasized.',
    spiritual: 'Sacred bond or vow.',
    general: 'Keeping one’s word and commitments.',
    career: 'Partnerships and agreements.',
    finance: 'Trust and contractual integrity.',
    health: 'Commitment to care.',
  },
};

/** Default template when theme has no domain mapping */
export const DEFAULT_DOMAIN_TEMPLATE =
  'This passage offers symbolic reflection; consider how its themes relate to your situation.';

export function getDomainInterpretation(
  theme: string,
  domain: LifeDomain
): string {
  const templates = DOMAIN_TEMPLATES[theme];
  if (templates && templates[domain]) return templates[domain] as string;
  if (templates && templates.general) return templates.general as string;
  return DEFAULT_DOMAIN_TEMPLATE;
}
