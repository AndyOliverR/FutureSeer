/**
 * Static esoteric astrology data (Alice Bailey / Tibetan tradition).
 * Used for deterministic Soul's Purpose and Life Direction from chart.
 */

export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

export type CrossLabel = 'Cardinal' | 'Fixed' | 'Mutable';

/** Esoteric ruler of each sign (Alice Bailey). */
export const ESOTERIC_RULER_BY_SIGN: Record<ZodiacSign, string> = {
  Aries: 'Mercury',
  Taurus: 'Vulcan',
  Gemini: 'Venus',
  Cancer: 'Neptune',
  Leo: 'Sun',
  Virgo: 'Moon',
  Libra: 'Uranus',
  Scorpio: 'Mars',
  Sagittarius: 'Earth',
  Capricorn: 'Saturn',
  Aquarius: 'Jupiter',
  Pisces: 'Pluto',
};

/** Exoteric (orthodox) ruler of each sign. */
export const EXOTERIC_RULER_BY_SIGN: Record<ZodiacSign, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

/** Hierarchical ruler of each sign (Alice Bailey, advanced). */
export const HIERARCHICAL_RULER_BY_SIGN: Record<ZodiacSign, string> = {
  Aries: 'Mercury',
  Taurus: 'Vulcan',
  Gemini: 'Venus',
  Cancer: 'Neptune',
  Leo: 'Sun',
  Virgo: 'Moon',
  Libra: 'Uranus',
  Scorpio: 'Mars',
  Sagittarius: 'Earth',
  Capricorn: 'Saturn',
  Aquarius: 'Jupiter',
  Pisces: 'Pluto',
};

/** Soul Keynote / Key Mantra per sign (Alice Bailey). */
export const SOUL_KEYNOTE_BY_SIGN: Record<ZodiacSign, string> = {
  Aries: 'I come forth and from the plane of mind I rule.',
  Taurus: 'I see, and when the eye is opened, all is illumined.',
  Gemini: 'I recognize my other self and in the waning of that self I grow and glow.',
  Cancer: 'I build a lighted house and therein dwell.',
  Leo: 'I am That and That am I.',
  Virgo: 'I am the Mother and the Child. I, God, I, Matter am.',
  Libra: 'I choose the way which leads between the two great lines of force.',
  Scorpio: 'Warrior I am, and from the battle I emerge triumphant.',
  Sagittarius: 'I see the goal. I reach the goal and then I see another.',
  Capricorn: 'Lost am I in light supernal, yet on that light I turn my back.',
  Aquarius: 'Water of life am I, poured forth for thirsty men.',
  Pisces: "I leave the Father's house and turning back, I save.",
};

/** Modality (Cross) per sign. */
export const MODALITY_BY_SIGN: Record<ZodiacSign, Modality> = {
  Aries: 'Cardinal',
  Taurus: 'Fixed',
  Gemini: 'Mutable',
  Cancer: 'Cardinal',
  Leo: 'Fixed',
  Virgo: 'Mutable',
  Libra: 'Cardinal',
  Scorpio: 'Fixed',
  Sagittarius: 'Mutable',
  Capricorn: 'Cardinal',
  Aquarius: 'Fixed',
  Pisces: 'Mutable',
};

/** Life direction sentence fragment by Cross (Cardinal = Will/Initiation, Fixed = Love-Wisdom/Stability, Mutable = Active Intelligence/Change). */
export const LIFE_DIRECTION_BY_CROSS: Record<CrossLabel, { focus: string; tests: string }> = {
  Cardinal: {
    focus: 'Initiation',
    tests: 'Will',
  },
  Fixed: {
    focus: 'Stability',
    tests: 'Loyalty',
  },
  Mutable: {
    focus: 'Change',
    tests: 'Adaptability',
  },
};

/** Evolutionary stage by Cross (Alice Bailey: Mutable = Experience, Fixed = Discipleship, Cardinal = Initiation). */
export const EVOLUTIONARY_STAGE_BY_CROSS: Record<CrossLabel, string> = {
  Cardinal: 'Initiation',
  Fixed: 'Discipleship',
  Mutable: 'Experience',
};

const SIGN_NAMES: ZodiacSign[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

/** Normalize sign string to ZodiacSign (case-insensitive). */
export function normalizeSign(sign: string | undefined | null): ZodiacSign | null {
  if (!sign || typeof sign !== 'string') return null;
  const trimmed = sign.trim();
  const found = SIGN_NAMES.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  return found ?? null;
}

/** Get esoteric ruler for a sign (e.g. Ascendant or Sun). */
export function getEsotericRuler(sign: string | undefined | null): string {
  const s = normalizeSign(sign);
  return s ? ESOTERIC_RULER_BY_SIGN[s] : 'Unknown';
}

/** Get exoteric (orthodox) ruler for a sign. */
export function getExotericRuler(sign: string | undefined | null): string {
  const s = normalizeSign(sign);
  return s ? EXOTERIC_RULER_BY_SIGN[s] : 'Unknown';
}

/** Get hierarchical ruler for a sign (Alice Bailey). */
export function getHierarchicalRuler(sign: string | undefined | null): string {
  const s = normalizeSign(sign);
  return s ? HIERARCHICAL_RULER_BY_SIGN[s] : 'Unknown';
}

/** Get soul keynote / key mantra for a sign. */
export function getSoulKeynote(sign: string | undefined | null): string {
  const s = normalizeSign(sign);
  return s ? SOUL_KEYNOTE_BY_SIGN[s] : '';
}

/** Get modality (Cardinal/Fixed/Mutable) for a sign. */
export function getModality(sign: string | undefined | null): Modality | null {
  const s = normalizeSign(sign);
  return s ? MODALITY_BY_SIGN[s] : null;
}

/** Get life direction focus and tests for a cross. */
export function getLifeDirection(cross: CrossLabel): { focus: string; tests: string } {
  return LIFE_DIRECTION_BY_CROSS[cross] ?? { focus: 'Integration', tests: 'Balance' };
}
