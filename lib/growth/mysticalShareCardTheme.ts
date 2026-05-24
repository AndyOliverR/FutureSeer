/**
 * Per-tool palettes & ornament keys for mystical profile share cards.
 * Buckets group related tools so every highlight tool gets distinct art without 50 one-offs.
 */

export type ShareCardOrnamentKind =
  | 'zodiac-wheel'
  | 'vedic-mandala'
  | 'numerology-glyphs'
  | 'tarot-celestial'
  | 'bodygraph'
  | 'rune-stone'
  | 'lenormand-bird'
  | 'iching-hexagram'
  | 'palm-lines'
  | 'feng-shui-compass'
  | 'cosmic-default';

export interface MysticalShareCardPalette {
  baseGradient: string;
  bokehGradient: string;
  halo: string;
  frameOuter: string;
  frameInner: string;
  cornerBorder: string;
  cornerGlow: string;
  accentGlow: string;
  nameplateBg: string;
  nameplateBorder: string;
}

export interface MysticalShareCardTheme {
  ornament: ShareCardOrnamentKind;
  /** Decorative mark above the title band (tarot-style top numeral). */
  topMark: string;
  palette: MysticalShareCardPalette;
}

const THEMES: Record<ShareCardOrnamentKind, MysticalShareCardTheme> = {
  'zodiac-wheel': {
    ornament: 'zodiac-wheel',
    topMark: '☉',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 85% 50% at 50% 15%, rgba(220, 38, 38, 0.22) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 92%, rgba(251, 191, 36, 0.14) 0%, transparent 50%), linear-gradient(175deg, #1a0508 0%, #2d0a12 40%, #120818 100%)',
      bokehGradient:
        'radial-gradient(circle at 18% 20%, rgba(251,191,36,0.14) 0%, transparent 30%), radial-gradient(circle at 82% 24%, rgba(220,38,38,0.12) 0%, transparent 28%), radial-gradient(circle at 50% 55%, rgba(251,191,36,0.06) 0%, transparent 35%)',
      halo: 'radial-gradient(circle, rgba(251, 191, 36, 0.28) 0%, rgba(220, 38, 38, 0.1) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(251, 191, 36, 0.58), inset 0 0 0 5px rgba(220, 38, 38, 0.15), inset 0 0 0 7px rgba(15, 23, 42, 0.92), 0 0 28px rgba(251, 191, 36, 0.28), 0 0 64px rgba(220, 38, 38, 0.12)',
      frameInner: '1px solid rgba(251, 191, 36, 0.32)',
      cornerBorder: 'rgba(251, 191, 36, 0.5)',
      cornerGlow: '0 0 12px rgba(251, 191, 36, 0.4), inset 0 0 8px rgba(220, 38, 38, 0.12)',
      accentGlow: '0 0 10px rgba(251, 191, 36, 0.55)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.14) 0%, rgba(45, 10, 18, 0.65) 100%)',
      nameplateBorder: '1px solid rgba(251, 191, 36, 0.32)',
    },
  },
  'vedic-mandala': {
    ornament: 'vedic-mandala',
    topMark: 'ॐ',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 55% at 50% 12%, rgba(245, 158, 11, 0.2) 0%, transparent 55%), radial-gradient(ellipse 70% 48% at 50% 88%, rgba(99, 102, 241, 0.18) 0%, transparent 52%), linear-gradient(175deg, #0c0820 0%, #1e1040 42%, #0f172a 100%)',
      bokehGradient:
        'radial-gradient(circle at 22% 18%, rgba(245,158,11,0.12) 0%, transparent 32%), radial-gradient(circle at 78% 22%, rgba(129,140,248,0.1) 0%, transparent 30%), radial-gradient(circle at 50% 70%, rgba(245,158,11,0.05) 0%, transparent 28%)',
      halo: 'radial-gradient(circle, rgba(245, 158, 11, 0.24) 0%, rgba(99, 102, 241, 0.1) 38%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(245, 158, 11, 0.55), inset 0 0 0 5px rgba(99, 102, 241, 0.12), inset 0 0 0 7px rgba(12, 8, 32, 0.92), 0 0 28px rgba(245, 158, 11, 0.22), 0 0 56px rgba(99, 102, 241, 0.1)',
      frameInner: '1px solid rgba(245, 158, 11, 0.28)',
      cornerBorder: 'rgba(245, 158, 11, 0.48)',
      cornerGlow: '0 0 12px rgba(245, 158, 11, 0.38), inset 0 0 8px rgba(99, 102, 241, 0.1)',
      accentGlow: '0 0 10px rgba(245, 158, 11, 0.5)',
      nameplateBg: 'linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(30, 16, 64, 0.6) 100%)',
      nameplateBorder: '1px solid rgba(245, 158, 11, 0.28)',
    },
  },
  'numerology-glyphs': {
    ornament: 'numerology-glyphs',
    topMark: 'VII',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 50% at 50% 18%, rgba(139, 92, 246, 0.2) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 90%, rgba(59, 130, 246, 0.14) 0%, transparent 50%), linear-gradient(175deg, #050818 0%, #0f172a 45%, #1e1b4b 100%)',
      bokehGradient:
        'radial-gradient(circle at 20% 25%, rgba(139,92,246,0.12) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 28%), radial-gradient(circle at 55% 75%, rgba(167,139,250,0.06) 0%, transparent 26%)',
      halo: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(167, 139, 250, 0.5), inset 0 0 0 5px rgba(59, 130, 246, 0.1), inset 0 0 0 7px rgba(5, 8, 24, 0.92), 0 0 28px rgba(139, 92, 246, 0.22), 0 0 56px rgba(59, 130, 246, 0.1)',
      frameInner: '1px solid rgba(167, 139, 250, 0.28)',
      cornerBorder: 'rgba(167, 139, 250, 0.45)',
      cornerGlow: '0 0 12px rgba(139, 92, 246, 0.35), inset 0 0 8px rgba(59, 130, 246, 0.08)',
      accentGlow: '0 0 10px rgba(167, 139, 250, 0.48)',
      nameplateBg: 'linear-gradient(180deg, rgba(167, 139, 250, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
      nameplateBorder: '1px solid rgba(167, 139, 250, 0.28)',
    },
  },
  'tarot-celestial': {
    ornament: 'tarot-celestial',
    topMark: 'XIX',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 85% 55% at 50% 14%, rgba(251, 191, 36, 0.2) 0%, transparent 58%), radial-gradient(ellipse 70% 45% at 50% 88%, rgba(45, 212, 191, 0.12) 0%, transparent 50%), radial-gradient(ellipse 55% 35% at 50% 42%, rgba(244, 114, 182, 0.1) 0%, transparent 55%), linear-gradient(175deg, #041018 0%, #0c2a32 38%, #1a1040 100%)',
      bokehGradient:
        'radial-gradient(circle at 15% 22%, rgba(251,191,36,0.1) 0%, transparent 32%), radial-gradient(circle at 85% 18%, rgba(45,212,191,0.08) 0%, transparent 28%), radial-gradient(circle at 72% 78%, rgba(244,114,182,0.08) 0%, transparent 30%)',
      halo: 'radial-gradient(circle, rgba(251, 191, 36, 0.26) 0%, rgba(45, 212, 191, 0.08) 38%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(251, 191, 36, 0.52), inset 0 0 0 5px rgba(45, 212, 191, 0.1), inset 0 0 0 7px rgba(4, 16, 24, 0.92), 0 0 28px rgba(251, 191, 36, 0.24), 0 0 64px rgba(45, 212, 191, 0.08)',
      frameInner: '1px solid rgba(251, 191, 36, 0.26)',
      cornerBorder: 'rgba(251, 191, 36, 0.42)',
      cornerGlow: '0 0 12px rgba(251, 191, 36, 0.32), inset 0 0 8px rgba(45, 212, 191, 0.08)',
      accentGlow: '0 0 10px rgba(251, 191, 36, 0.45)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.11) 0%, rgba(12, 42, 50, 0.58) 100%)',
      nameplateBorder: '1px solid rgba(251, 191, 36, 0.26)',
    },
  },
  bodygraph: {
    ornament: 'bodygraph',
    topMark: 'IV',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 50% at 50% 16%, rgba(239, 68, 68, 0.16) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 90%, rgba(251, 191, 36, 0.12) 0%, transparent 50%), linear-gradient(175deg, #0a0812 0%, #1a1028 45%, #120818 100%)',
      bokehGradient:
        'radial-gradient(circle at 25% 20%, rgba(239,68,68,0.1) 0%, transparent 30%), radial-gradient(circle at 75% 25%, rgba(251,191,36,0.08) 0%, transparent 28%)',
      halo: 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, rgba(251, 191, 36, 0.08) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(251, 191, 36, 0.48), inset 0 0 0 5px rgba(239, 68, 68, 0.1), inset 0 0 0 7px rgba(10, 8, 18, 0.92), 0 0 28px rgba(251, 191, 36, 0.2)',
      frameInner: '1px solid rgba(251, 191, 36, 0.24)',
      cornerBorder: 'rgba(251, 191, 36, 0.4)',
      cornerGlow: '0 0 12px rgba(251, 191, 36, 0.3)',
      accentGlow: '0 0 10px rgba(251, 191, 36, 0.42)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(26, 16, 40, 0.58) 100%)',
      nameplateBorder: '1px solid rgba(251, 191, 36, 0.24)',
    },
  },
  'rune-stone': {
    ornament: 'rune-stone',
    topMark: 'ᚠ',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 50% at 50% 18%, rgba(148, 163, 184, 0.14) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 88%, rgba(251, 191, 36, 0.12) 0%, transparent 50%), linear-gradient(175deg, #0c1018 0%, #1e293b 45%, #0f172a 100%)',
      bokehGradient:
        'radial-gradient(circle at 20% 22%, rgba(148,163,184,0.1) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.08) 0%, transparent 28%)',
      halo: 'radial-gradient(circle, rgba(148, 163, 184, 0.16) 0%, rgba(251, 191, 36, 0.1) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(203, 213, 225, 0.4), inset 0 0 0 5px rgba(251, 191, 36, 0.08), inset 0 0 0 7px rgba(12, 16, 24, 0.92), 0 0 28px rgba(251, 191, 36, 0.18)',
      frameInner: '1px solid rgba(203, 213, 225, 0.22)',
      cornerBorder: 'rgba(203, 213, 225, 0.38)',
      cornerGlow: '0 0 12px rgba(251, 191, 36, 0.28)',
      accentGlow: '0 0 10px rgba(203, 213, 225, 0.35)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(30, 41, 59, 0.58) 100%)',
      nameplateBorder: '1px solid rgba(203, 213, 225, 0.22)',
    },
  },
  'lenormand-bird': {
    ornament: 'lenormand-bird',
    topMark: 'III',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 52% at 50% 16%, rgba(45, 212, 191, 0.16) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 88%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), linear-gradient(175deg, #061820 0%, #0c3a3a 42%, #0f172a 100%)',
      bokehGradient:
        'radial-gradient(circle at 18% 20%, rgba(45,212,191,0.1) 0%, transparent 30%), radial-gradient(circle at 82% 22%, rgba(254,243,199,0.06) 0%, transparent 28%)',
      halo: 'radial-gradient(circle, rgba(45, 212, 191, 0.18) 0%, rgba(251, 191, 36, 0.08) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(45, 212, 191, 0.42), inset 0 0 0 5px rgba(251, 191, 36, 0.08), inset 0 0 0 7px rgba(6, 24, 32, 0.92), 0 0 28px rgba(45, 212, 191, 0.16)',
      frameInner: '1px solid rgba(45, 212, 191, 0.24)',
      cornerBorder: 'rgba(45, 212, 191, 0.38)',
      cornerGlow: '0 0 12px rgba(45, 212, 191, 0.28)',
      accentGlow: '0 0 10px rgba(45, 212, 191, 0.38)',
      nameplateBg: 'linear-gradient(180deg, rgba(45, 212, 191, 0.1) 0%, rgba(12, 58, 58, 0.55) 100%)',
      nameplateBorder: '1px solid rgba(45, 212, 191, 0.22)',
    },
  },
  'iching-hexagram': {
    ornament: 'iching-hexagram',
    topMark: '☷',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 50% at 50% 18%, rgba(180, 83, 9, 0.16) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 88%, rgba(251, 191, 36, 0.12) 0%, transparent 50%), linear-gradient(175deg, #120c08 0%, #292018 45%, #0f172a 100%)',
      bokehGradient:
        'radial-gradient(circle at 22% 20%, rgba(180,83,9,0.1) 0%, transparent 30%), radial-gradient(circle at 78% 22%, rgba(251,191,36,0.08) 0%, transparent 28%)',
      halo: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(180, 83, 9, 0.08) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(251, 191, 36, 0.48), inset 0 0 0 5px rgba(180, 83, 9, 0.1), inset 0 0 0 7px rgba(18, 12, 8, 0.92), 0 0 28px rgba(251, 191, 36, 0.2)',
      frameInner: '1px solid rgba(251, 191, 36, 0.24)',
      cornerBorder: 'rgba(251, 191, 36, 0.4)',
      cornerGlow: '0 0 12px rgba(251, 191, 36, 0.3)',
      accentGlow: '0 0 10px rgba(251, 191, 36, 0.42)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(41, 32, 24, 0.58) 100%)',
      nameplateBorder: '1px solid rgba(251, 191, 36, 0.24)',
    },
  },
  'palm-lines': {
    ornament: 'palm-lines',
    topMark: '✋',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 50% at 50% 18%, rgba(244, 114, 182, 0.14) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 88%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), linear-gradient(175deg, #100818 0%, #1a1028 45%, #0f172a 100%)',
      bokehGradient:
        'radial-gradient(circle at 20% 22%, rgba(244,114,182,0.08) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.08) 0%, transparent 28%)',
      halo: 'radial-gradient(circle, rgba(244, 114, 182, 0.16) 0%, rgba(251, 191, 36, 0.08) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(251, 191, 36, 0.46), inset 0 0 0 5px rgba(244, 114, 182, 0.08), inset 0 0 0 7px rgba(16, 8, 24, 0.92), 0 0 28px rgba(251, 191, 36, 0.18)',
      frameInner: '1px solid rgba(251, 191, 36, 0.22)',
      cornerBorder: 'rgba(251, 191, 36, 0.38)',
      cornerGlow: '0 0 12px rgba(244, 114, 182, 0.22)',
      accentGlow: '0 0 10px rgba(251, 191, 36, 0.4)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(26, 16, 40, 0.58) 100%)',
      nameplateBorder: '1px solid rgba(251, 191, 36, 0.22)',
    },
  },
  'feng-shui-compass': {
    ornament: 'feng-shui-compass',
    topMark: '八卦',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 80% 50% at 50% 18%, rgba(34, 197, 94, 0.14) 0%, transparent 55%), radial-gradient(ellipse 75% 45% at 50% 88%, rgba(251, 191, 36, 0.12) 0%, transparent 50%), linear-gradient(175deg, #061210 0%, #0c2820 45%, #0f172a 100%)',
      bokehGradient:
        'radial-gradient(circle at 22% 20%, rgba(34,197,94,0.08) 0%, transparent 30%), radial-gradient(circle at 78% 22%, rgba(251,191,36,0.08) 0%, transparent 28%)',
      halo: 'radial-gradient(circle, rgba(34, 197, 94, 0.16) 0%, rgba(251, 191, 36, 0.08) 40%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(251, 191, 36, 0.46), inset 0 0 0 5px rgba(34, 197, 94, 0.08), inset 0 0 0 7px rgba(6, 18, 16, 0.92), 0 0 28px rgba(251, 191, 36, 0.18)',
      frameInner: '1px solid rgba(251, 191, 36, 0.22)',
      cornerBorder: 'rgba(251, 191, 36, 0.38)',
      cornerGlow: '0 0 12px rgba(34, 197, 94, 0.2)',
      accentGlow: '0 0 10px rgba(251, 191, 36, 0.4)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(12, 40, 32, 0.58) 100%)',
      nameplateBorder: '1px solid rgba(251, 191, 36, 0.22)',
    },
  },
  'cosmic-default': {
    ornament: 'cosmic-default',
    topMark: '✦',
    palette: {
      baseGradient:
        'radial-gradient(ellipse 90% 55% at 50% 18%, rgba(251, 191, 36, 0.18) 0%, transparent 58%), radial-gradient(ellipse 80% 45% at 50% 88%, rgba(129, 140, 248, 0.16) 0%, transparent 52%), radial-gradient(ellipse 60% 40% at 50% 42%, rgba(244, 114, 182, 0.08) 0%, transparent 55%), linear-gradient(175deg, #020617 0%, #0c1222 38%, #151033 72%, #1a1040 100%)',
      bokehGradient:
        'radial-gradient(circle at 15% 22%, rgba(251,191,36,0.12) 0%, transparent 32%), radial-gradient(circle at 85% 18%, rgba(251,191,36,0.08) 0%, transparent 28%), radial-gradient(circle at 72% 78%, rgba(148,163,184,0.1) 0%, transparent 30%), radial-gradient(circle at 28% 68%, rgba(244,114,182,0.06) 0%, transparent 26%)',
      halo: 'radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(251, 191, 36, 0.08) 35%, transparent 68%)',
      frameOuter:
        'inset 0 0 0 2px rgba(251, 191, 36, 0.55), inset 0 0 0 5px rgba(251, 191, 36, 0.12), inset 0 0 0 7px rgba(15, 23, 42, 0.9), 0 0 28px rgba(251, 191, 36, 0.25), 0 0 64px rgba(251, 191, 36, 0.12)',
      frameInner: '1px solid rgba(251, 191, 36, 0.28)',
      cornerBorder: 'rgba(251, 191, 36, 0.45)',
      cornerGlow: '0 0 12px rgba(251, 191, 36, 0.35), inset 0 0 8px rgba(251, 191, 36, 0.15)',
      accentGlow: '0 0 10px rgba(251, 191, 36, 0.45)',
      nameplateBg: 'linear-gradient(180deg, rgba(251, 191, 36, 0.12) 0%, rgba(15, 23, 42, 0.55) 100%)',
      nameplateBorder: '1px solid rgba(251, 191, 36, 0.28)',
    },
  },
};

/** Maps profile tool slugs to ornament buckets. */
const SLUG_TO_ORNAMENT: Record<string, ShareCardOrnamentKind> = {
  western: 'zodiac-wheel',
  hellenistic: 'zodiac-wheel',
  horary: 'zodiac-wheel',
  synastry: 'zodiac-wheel',
  financialAstrology: 'zodiac-wheel',
  medicalAstrology: 'zodiac-wheel',
  psychologicalAstrology: 'zodiac-wheel',
  mundaneAstrology: 'zodiac-wheel',
  hermeticAstrology: 'zodiac-wheel',
  esotericAstrology: 'zodiac-wheel',
  kabbalisticAstrology: 'zodiac-wheel',
  shamanicAstrology: 'zodiac-wheel',
  astrocartography: 'zodiac-wheel',
  kp: 'zodiac-wheel',

  vedic: 'vedic-mandala',
  vastu: 'vedic-mandala',
  navaratna: 'vedic-mandala',
  trichakra: 'vedic-mandala',

  numerology: 'numerology-glyphs',
  angelNumbers: 'numerology-glyphs',
  kabbalisticNumerology: 'numerology-glyphs',
  nameAnalysis: 'numerology-glyphs',

  tarot: 'tarot-celestial',
  scrying: 'tarot-celestial',

  humanDesign: 'bodygraph',

  runes: 'rune-stone',
  pendulum: 'rune-stone',
  ogham: 'rune-stone',

  lenormand: 'lenormand-bird',
  geomancy: 'lenormand-bird',

  iching: 'iching-hexagram',
  bibliomancy: 'iching-hexagram',

  palmistry: 'palm-lines',
  faceReading: 'palm-lines',

  fengShui: 'feng-shui-compass',
  'feng-shui': 'feng-shui-compass',

  akashicRecords: 'cosmic-default',
  energyHealing: 'cosmic-default',
  dailyDecisions: 'cosmic-default',
  ziweiDouShu: 'vedic-mandala',
  bazi: 'iching-hexagram',
};

export function resolveMysticalShareCardTheme(toolSlug: string): MysticalShareCardTheme {
  const key = SLUG_TO_ORNAMENT[toolSlug] ?? 'cosmic-default';
  return THEMES[key];
}
