/**
 * Maps pipeline tool slug (useToolReport / Firestore) to /tools/[path] segment.
 */
const SLUG_TO_PATH: Record<string, string> = {
  western: 'western-astrology',
  vedic: 'vedic',
  kp: 'kp-astrology',
  hellenistic: 'hellenistic-astrology',
  esotericAstrology: 'esoteric-astrology',
  psychologicalAstrology: 'psychological-astrology',
  shamanicAstrology: 'shamanic-astrology',
  kabbalisticAstrology: 'kabbalistic-astrology',
  hermeticAstrology: 'hermetic-astrology',
  astrocartography: 'astrocartography',
  financialAstrology: 'financial-astrology',
  medicalAstrology: 'medical-astrology',
  mundaneAstrology: 'mundane-astrology',
  ziweiDouShu: 'ziwei-dou-shu',
  bazi: 'bazi',
  fengShui: 'feng-shui',
  'feng-shui': 'feng-shui',
  humanDesign: 'human-design',
  akashicRecords: 'akashic-records',
  dailyDecisions: 'daily-decisions',
  vastu: 'vastu',
  trichakra: 'trichakra-method',
  energyHealing: 'energy-healing',
  navaratna: 'navaratna-planetary-stones',
  faceReading: 'face-reading',
  palmistry: 'palmistry',
  dreamSymbols: 'dream-symbols',
  'dream-symbols': 'dream-symbols',
  astroNumerology: 'western-astrology',
  synastry: 'synastry',
  horary: 'horary-astrology',
  tarot: 'tarot',
  scrying: 'scrying',
  bibliomancy: 'bibliomancy',
  iching: 'iching',
  runes: 'runes',
  pendulum: 'pendulum',
  lenormand: 'lenormand',
  geomancy: 'geomancy',
  sortilege: 'sortilege',
  ogham: 'ogham',
  numerology: 'numerology',
  'angel-numbers': 'angel-numbers',
  angelNumbers: 'angel-numbers',
  kabbalisticNumerology: 'kabbalistic-numerology',
  'kabbalistic-numerology': 'kabbalistic-numerology',
  nameAnalysis: 'name-analysis',
}

export function toolPathForSlug(toolSlug: string): string {
  return SLUG_TO_PATH[toolSlug] ?? toolSlug.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

export function buildToolSlugByPath(toolSlugs: readonly string[]): Record<string, string> {
  return Object.fromEntries(toolSlugs.map((slug) => [toolPathForSlug(slug), slug]));
}

export function toolSlugForPath(pathSlug: string, toolSlugByPath: Readonly<Record<string, string>>): string {
  return toolSlugByPath[pathSlug] ?? pathSlug;
}
