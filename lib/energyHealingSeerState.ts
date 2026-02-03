/**
 * Energy & Healing Seer State and Slice.
 * Rule: Energy & Healing supports balance and awareness; it does not diagnose or cure.
 */

export interface EnergyState {
  chakra_state: Record<string, string>;
  aura_quality?: string;
  dominant_issue?: string;
  energy_level?: string;
  blockages?: string[];
  primary_crystal?: string;
}

export type EnergyQuestionType =
  | 'balance'
  | 'imbalance'
  | 'centers'
  | 'practices'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing analysis. */
export const ENERGY_REFUSAL_DATA_PHRASE =
  'Energy insights require an energy analysis. Run a chakra, aura, or energy balance analysis first.';

/** Refusal phrase for medical/mental health questions. */
export const ENERGY_REFUSAL_MEDICAL_PHRASE =
  'This concern requires professional medical or mental-health support.';

/** Mandatory disclaimer for every response. */
export const ENERGY_MANDATORY_DISCLAIMER =
  'These insights are based on traditional energy-healing beliefs and are not a substitute for medical advice, diagnosis, or treatment.';

const CHAKRA_NAME_TO_KEY: Record<string, string> = {
  'Root Chakra': 'root',
  'Sacral Chakra': 'sacral',
  'Solar Plexus Chakra': 'solar_plexus',
  'Heart Chakra': 'heart',
  'Throat Chakra': 'throat',
  'Third Eye Chakra': 'third_eye',
  'Crown Chakra': 'crown',
};

const DEFAULT_CHAKRA_STATE: Record<string, string> = {
  root: 'unknown',
  sacral: 'unknown',
  solar_plexus: 'unknown',
  heart: 'unknown',
  throat: 'unknown',
  third_eye: 'unknown',
  crown: 'unknown',
};

function mapChakraNameToKey(name: string): string {
  return CHAKRA_NAME_TO_KEY[name] ?? name.toLowerCase().replace(/\s+/g, '_');
}

function mapAuraHealthToQuality(health: string): string {
  const lower = String(health || '').toLowerCase();
  if (lower === 'excellent') return 'excellent';
  if (lower === 'good') return 'good';
  if (lower === 'fair') return 'fair';
  if (lower === 'needs_attention') return 'needs_attention';
  return lower || 'unknown';
}

/**
 * Build EnergyState from EnergyHealingAnalysis.
 * Requires at least chakraAnalysis OR (auraReading AND energyBalance).
 */
export function buildEnergyState(analysis: any): EnergyState {
  if (!analysis) {
    throw new Error(ENERGY_REFUSAL_DATA_PHRASE);
  }

  const hasChakra = !!analysis.chakraAnalysis?.chakras?.length;
  const hasAura = !!analysis.auraReading;
  const hasEnergy = !!analysis.energyBalance;

  if (!hasChakra && !(hasAura && hasEnergy)) {
    throw new Error(ENERGY_REFUSAL_DATA_PHRASE);
  }

  const chakra_state: Record<string, string> = { ...DEFAULT_CHAKRA_STATE };

  if (hasChakra) {
    for (const chakra of analysis.chakraAnalysis.chakras) {
      const key = mapChakraNameToKey(chakra.name);
      const status = chakra.status || 'unknown';
      if (key && status) {
        chakra_state[key] = status;
      }
    }
  }

  let aura_quality: string | undefined;
  if (analysis.auraReading?.overallHealth) {
    aura_quality = mapAuraHealthToQuality(analysis.auraReading.overallHealth);
  }

  let energy_level: string | undefined;
  if (analysis.reikiAnalysis?.energyLevel) {
    energy_level = String(analysis.reikiAnalysis.energyLevel).toLowerCase();
  } else if (analysis.energyBalance?.energyFlow) {
    const flow = String(analysis.energyBalance.energyFlow).toLowerCase();
    if (flow === 'excellent' || flow === 'good') energy_level = 'high';
    else if (flow === 'needs_attention') energy_level = 'medium';
    else if (flow === 'blocked') energy_level = 'low';
  }

  let dominant_issue: string | undefined;
  const primaryIssues = analysis.chakraAnalysis?.primaryIssues;
  const blockages =
    analysis.reikiAnalysis?.blockages ||
    analysis.energyBalance?.blockages ||
    [];
  if (Array.isArray(primaryIssues) && primaryIssues.length > 0) {
    dominant_issue = primaryIssues.join(', ');
  } else if (blockages.length > 0) {
    dominant_issue = blockages.join(', ');
  } else if (energy_level === 'low') {
    dominant_issue = 'depletion';
  } else if (energy_level === 'high') {
    dominant_issue = 'stress';
  }

  const mergedBlockages = [
    ...(analysis.reikiAnalysis?.blockages || []),
    ...(analysis.energyBalance?.blockages || []),
  ].filter(Boolean);
  const blockagesList =
    mergedBlockages.length > 0 ? [...new Set(mergedBlockages)] : undefined;

  const primary_crystal = analysis.crystalRecommendation?.primaryCrystal;

  return {
    chakra_state,
    aura_quality,
    dominant_issue,
    energy_level,
    blockages: blockagesList,
    primary_crystal,
  };
}

/**
 * Classify Energy & Healing question.
 * Refuse: medical, mental health crisis, treatment override, outcome/timing.
 * Valid: balance, grounding, centers, practices.
 */
export function classifyEnergyQuestion(question: string): EnergyQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal patterns - medical
  if (
    /\b(illness|disease|diagnosis|diagnose|cure|heal me|will this heal|medical|doctor|physician|medication|medicine|supplement|dosage|dose|treatment (for|of)|symptoms?|condition\b)/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal patterns - mental health crisis
  if (
    /\b(crisis|suicid|emergency|self-harm|hurt myself|mental health (treatment|professional)|therapist|psychiatrist)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal patterns - treatment override
  if (
    /\b(should I stop (treatment|taking|my)|replace my (treatment|medicine|medication)|instead of (my |medical ))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal patterns - outcome/timing
  if (
    /\b(how fast|how long until|when will I (heal|recover|get better)|will this (heal|cure|fix) me|guarantee|promise)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Valid question types
  if (
    /\b(where (is|are) (my )?energy (imbalanced|blocked)|imbalanced|imbalance|balance my chakras|restore balance)\b/.test(
      lower
    )
  ) {
    return 'balance';
  }
  if (
    /\b(grounded|grounding|feel more grounded|what should I focus on to feel)\b/.test(
      lower
    )
  ) {
    return 'imbalance';
  }
  if (
    /\b(which (energy )?center|chakra needs (support|attention|work)|energy center)\b/.test(
      lower
    )
  ) {
    return 'centers';
  }
  if (
    /\b(practices (help|to)|what practices|restore balance|breathwork|meditation|grounding (practice|exercise))\b/.test(
      lower
    )
  ) {
    return 'practices';
  }

  // General energy questions
  if (
    /\b(chakra|aura|reiki|crystal|energy (balance|flow|healing|center))\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Energy & Healing.
 * Enforces balance/awareness only. No diagnosis or cure. Mandatory disclaimer.
 */
export function getEnergySliceForQuestionType(
  questionType: EnergyQuestionType,
  state: EnergyState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${ENERGY_REFUSAL_MEDICAL_PHRASE}" Do not diagnose, prescribe, or advise on medical or mental-health matters. Energy insights reflect balance and awareness, not medical conclusions.`;
  }

  const chakraEntries = Object.entries(state.chakra_state)
    .filter(([, v]) => v && v !== 'unknown')
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const stateBlock = `
ENERGY STATE (use this only):
- Chakra state:
${chakraEntries || '  (no chakra data)'}
${state.aura_quality ? `- Aura quality: ${state.aura_quality}` : ''}
${state.dominant_issue ? `- Dominant issue: ${state.dominant_issue}` : ''}
${state.energy_level ? `- Energy level: ${state.energy_level}` : ''}
${state.blockages?.length ? `- Blockages: ${state.blockages.join(', ')}` : ''}
${state.primary_crystal ? `- Primary crystal: ${state.primary_crystal}` : ''}
`.trim();

  const chakraBlock = `
CHAKRA LOGIC (functions, not conditions):
- Chakras represent energy functions, not health conditions.
- Imbalance types: underactive = depletion; overactive = stress/overdrive; blocked = suppression.
- Always say: "This suggests an energy pattern, not a health condition."
- Never name diseases or diagnose.
`.trim();

  const auraBlock = `
AURA LOGIC (state, not destiny):
- Aura observations indicate current vitality, emotional load, stress residue.
- They describe current state; temporary and changeable.
- No permanent labels.
`.trim();

  const reikiCrystalBlock = `
REIKI & CRYSTAL LOGIC (support only):
- Reiki is complementary; supports relaxation and regulation; does not target disease.
- Allowed: "supports relaxation", "encourages balance".
- Never: "heals", "removes illness", "cures".
- Crystals are symbolic support tools for focus and intention, not cure.
- Frame crystals as "supportive focus aids".
`.trim();

  const guidanceBlock = `
GUIDANCE OUTPUT (strictly limited):
- Allowed: grounding practices, breathwork, meditation focus, gentle routines, awareness prompts.
- Forbidden: medical advice, supplements, dosages, therapy replacement.
`.trim();

  const framingBlock = `
ANSWER FRAMING:
- Describe energy patterns, not conditions.
- Offer gentle, supportive practices only.
- Avoid outcomes, cures, timelines.
- No "heals", "cures", "diagnosis" language.
`.trim();

  const disclaimerBlock = `
MANDATORY DISCLAIMER (include in every response):
You MUST end or incorporate this in your answer: "${ENERGY_MANDATORY_DISCLAIMER}"
No exceptions.
`.trim();

  const permanentRule = `
PERMANENT RULE:
Energy & Healing supports balance and self-regulation, not medical action or outcomes.
`.trim();

  return `${stateBlock}

${chakraBlock}

${auraBlock}

${reikiCrystalBlock}

${guidanceBlock}

${framingBlock}

${disclaimerBlock}

${permanentRule}`;
}
