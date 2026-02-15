/**
 * Face Reading Seer State and Slice Selector.
 * Physiognomic trait system: tendencies and capacities, not fate or events.
 * Rule: Face reading reflects how energy is expressed, not what the future will deliver.
 */

import type { FaceReadingAnalysis, FacialFeature } from '@/lib/faceReadingIntelligence';

export type ZoneLevel = 'dominant' | 'balanced' | 'moderate' | 'weak';

export interface FaceReadingState {
  face_shape: string;
  three_zones: {
    upper: ZoneLevel;
    middle: ZoneLevel;
    lower: ZoneLevel;
  };
  features: {
    forehead?: string;
    eyes?: string;
    nose?: string;
    mouth?: string;
    jaw?: string;
  };
  symmetry: string;
  skin_tone: string;
  vitality: string;
  age_group: string;
}

export type FaceReadingQuestionType =
  | 'personality_traits'
  | 'strengths_challenges'
  | 'career_inclination'
  | 'relationship_style'
  | 'stress_imbalance'
  | 'three_zones'
  | 'general'
  | 'refusal';

const UPPER_TYPES: FacialFeature['type'][] = ['forehead', 'eyebrows', 'ears'];
const MIDDLE_TYPES: FacialFeature['type'][] = ['eyes', 'nose', 'cheeks'];
const LOWER_TYPES: FacialFeature['type'][] = ['mouth', 'chin', 'jawline', 'lips'];

function energyToZoneLevel(avgEnergy: number): ZoneLevel {
  if (avgEnergy >= 8) return 'dominant';
  if (avgEnergy >= 6.5) return 'balanced';
  if (avgEnergy >= 5) return 'moderate';
  return 'weak';
}

function featureNameToShortLabel(name: string, type: string): string {
  const n = name.toLowerCase();
  if (type === 'forehead') {
    if (n.includes('broad') || n.includes('wide')) return 'broad';
    if (n.includes('high')) return 'high';
    return 'balanced';
  }
  if (type === 'eyes') {
    if (n.includes('large') || n.includes('round') || n.includes('bright')) return 'bright';
    if (n.includes('deep') || n.includes('almond')) return 'expressive';
    if (n.includes('small')) return 'focused';
    return 'bright';
  }
  if (type === 'nose') {
    if (n.includes('roman') || n.includes('prominent') || n.includes('strong')) return 'prominent';
    if (n.includes('straight')) return 'balanced';
    if (n.includes('button') || n.includes('small')) return 'refined';
    return 'balanced';
  }
  if (type === 'mouth' || type === 'lips') {
    if (n.includes('wide') || n.includes('full')) return 'expressive';
    if (n.includes('straight') || n.includes('balanced')) return 'balanced';
    return 'balanced';
  }
  if (type === 'chin' || type === 'jawline') {
    if (n.includes('strong') || n.includes('square')) return 'strong';
    if (n.includes('round') || n.includes('soft')) return 'soft';
    if (n.includes('pointed')) return 'defined';
    return 'moderate';
  }
  return 'balanced';
}

/**
 * Build FaceReadingState from FaceReadingAnalysis.
 * Requires analysis.faceShape; throws if missing.
 */
export function buildFaceReadingState(analysis: FaceReadingAnalysis): FaceReadingState {
  if (!analysis?.faceShape) {
    throw new Error('Face reading requires analysis with face shape.');
  }

  const features = analysis.features || [];
  const faceShapeRaw = analysis.faceShape;
  const face_shape = faceShapeRaw.includes(' - ')
    ? faceShapeRaw.split(' - ')[0].toLowerCase().trim()
    : faceShapeRaw.toLowerCase().trim();

  const upperFeatures = features.filter((f) => UPPER_TYPES.includes(f.type));
  const middleFeatures = features.filter((f) => MIDDLE_TYPES.includes(f.type));
  const lowerFeatures = features.filter((f) => LOWER_TYPES.includes(f.type));

  const avgEnergy = (arr: FacialFeature[]) =>
    arr.length ? arr.reduce((s, f) => s + f.energy, 0) / arr.length : 5;
  const three_zones = {
    upper: energyToZoneLevel(avgEnergy(upperFeatures)),
    middle: energyToZoneLevel(avgEnergy(middleFeatures)),
    lower: energyToZoneLevel(avgEnergy(lowerFeatures)),
  };

  const getFeature = (type: FacialFeature['type']) =>
    features.find((f) => f.type === type);
  const featuresMap: FaceReadingState['features'] = {};
  const fForehead = getFeature('forehead');
  if (fForehead) featuresMap.forehead = featureNameToShortLabel(fForehead.name, 'forehead');
  const fEyes = getFeature('eyes');
  if (fEyes) featuresMap.eyes = featureNameToShortLabel(fEyes.name, 'eyes');
  const fNose = getFeature('nose');
  if (fNose) featuresMap.nose = featureNameToShortLabel(fNose.name, 'nose');
  const fMouth = getFeature('mouth') || getFeature('lips');
  if (fMouth) featuresMap.mouth = featureNameToShortLabel(fMouth.name, fMouth.type);
  const fJaw = getFeature('jawline') || getFeature('chin');
  if (fJaw) featuresMap.jaw = featureNameToShortLabel(fJaw.name, fJaw.type);

  const energyScore = analysis.energyScore ?? 50;
  const vitality = energyScore >= 70 ? 'high' : energyScore >= 40 ? 'moderate' : 'calm';
  const age = analysis.age ?? 30;
  const age_group = age < 18 ? 'youth' : age < 45 ? 'adult' : 'mature';

  return {
    face_shape,
    three_zones,
    features: featuresMap,
    symmetry: 'moderate',
    skin_tone: 'clear',
    vitality,
    age_group,
  };
}

/**
 * Classify Face Reading question. Refusal for event prediction, health diagnosis, moral judgment, definitive outcomes.
 */
export function classifyFaceReadingQuestion(question: string): FaceReadingQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(when will i (get rich|marry|succeed|find love)|will i (marry|get rich|succeed)|how long will i live|when (will|do) i (get|find)|what (year|date|time) (will|do))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(diagnos|disease|illness|health (problem|issue|condition)|medical|sick|cure|treatment)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(good (person|moral)|bad (person|moral)|worthy|unworthy|evil|sin|judge (me|my))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(definitely (will|won't)|certain to|destined to|fate (is|says)|future (is|will be) (certain|fixed))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /\b(personality|temperament|character|traits? (does my face|do i have)|what (kind of person|am i like))\b/.test(
      lower
    )
  ) {
    return 'personality_traits';
  }
  if (
    /\b(strengths?|weaknesses?|challenges?|growth areas?|what (am i good at|are my (strengths|challenges)))\b/.test(
      lower
    )
  ) {
    return 'strengths_challenges';
  }
  if (
    /\b(career|job|work|profession|vocation|career (inclination|aptitude|suit)|what (career|job) (suits|fits))\b/.test(
      lower
    ) &&
    !/\b(will i succeed|when will i get (promoted|hired))\b/.test(lower)
  ) {
    return 'career_inclination';
  }
  if (
    /\b(relationship|partner|love (style|tendency)|how (do i relate|am i in relationships)|communication style)\b/.test(
      lower
    ) &&
    !/\b(will i (find|meet)|when will i (marry|find love))\b/.test(lower)
  ) {
    return 'relationship_style';
  }
  if (
    /\b(stress|imbalance|balance|tension|fatigue|vitality|energy (level|balance)|how (can i balance|do my (zones|features) balance))\b/.test(
      lower
    )
  ) {
    return 'stress_imbalance';
  }
  if (
    /\b(three zones?|upper (zone|forehead)|middle (zone|eyes|nose)|lower (zone|mouth|jaw)|zones? (influence|mean|affect))\b/.test(
      lower
    )
  ) {
    return 'three_zones';
  }

  return 'general';
}

/**
 * Build slice for system prompt: three zones, feature hierarchy, symmetry/vitality as states, permanent rule, contradiction resolver.
 */
export function getFaceReadingSliceForQuestionType(
  questionType: FaceReadingQuestionType,
  state: FaceReadingState,
  _analysis: FaceReadingAnalysis
): string {
  if (questionType === 'refusal') {
    return 'Refuse with: "Face reading reflects tendencies, not predictions." or "Face reading cannot determine this with certainty."';
  }

  const zoneBlock = `
THREE ZONES (anchor all analysis here):
- Upper (forehead): Thinking, learning, early life → ${state.three_zones.upper}
- Middle (eyes/nose): Career, action, middle life → ${state.three_zones.middle}
- Lower (mouth/jaw): Stability, relationships, later life → ${state.three_zones.lower}
Dominant zone = dominant life focus; weak zone = developmental challenge; balanced = adaptability.
`.trim();

  const featureBlock = `
FEATURE HIERARCHY (face shape wins over minor details):
- Face shape: ${state.face_shape}
- Forehead: ${state.features.forehead ?? '—'}
- Eyes: ${state.features.eyes ?? '—'}
- Nose: ${state.features.nose ?? '—'}
- Mouth: ${state.features.mouth ?? '—'}
- Jaw: ${state.features.jaw ?? '—'}
`.trim();

  const stateBlock = `
SYMMETRY & VITALITY (describe as current states, not permanent judgments):
- Symmetry: ${state.symmetry} → consistency/balance or tension/uneven development
- Vitality: ${state.vitality} → current energy; dullness may indicate fatigue or stress
- Age group: ${state.age_group}
`.trim();

  const disciplineNote = `
DISCIPLINE (non-negotiable):
- Face reading describes tendencies and capacities, not fate or events.
- Anchor conclusions in three zones. Apply feature hierarchy: face shape > zone dominance > major features > minor details.
- Resolve contradictions explicitly (e.g. dominant middle + soft jaw → "strong drive balanced by cooperative approach").
- Speak in tendencies only. Refuse timing/outcome predictions. Emphasize current state vs permanent destiny.
- Permanent rule: Face reading reflects how energy is expressed, not what the future will deliver.
`.trim();

  const featureKeys = ['forehead', 'eyes', 'nose', 'mouth', 'jaw'] as const;
  const presentCount = featureKeys.filter((k) => state.features[k] != null && state.features[k] !== '').length;
  const partialCaveat = presentCount < 2
    ? '\n\nFacial data is partial; generalize cautiously and do not exaggerate.'
    : '';

  return `${zoneBlock}

${featureBlock}

${stateBlock}

${disciplineNote}${partialCaveat}`;
}
