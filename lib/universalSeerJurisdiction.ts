/**
 * Domain Jurisdiction Matrix for Universal Ask the Seer.
 * Prime Law: No system may answer outside its epistemic jurisdiction.
 * Static, hard-coded, immutable.
 */

/** Jurisdiction tags: what each system is allowed to answer. */
export type JurisdictionTag =
  | 'timing'
  | 'identity'
  | 'expression'
  | 'karmic'
  | 'life-structure'
  | 'name-vibration'
  | 'soul-lesson'
  | 'guidance'
  | 'situational'
  | 'structural'
  | 'symbolic'
  | 'literal'
  | 'confirmation'
  | 'alignment'
  | 'relationship'
  | 'health'
  | 'financial'
  | 'spatial'
  | 'directional'
  | 'relocation'
  | 'collective'
  | 'general';

/** Tool key must match SeerAggregator tool keys. */
export type ToolKey = string;

export interface ToolJurisdiction {
  tool: ToolKey;
  answersWhat: JurisdictionTag[];
}

/** Static Domain Jurisdiction Matrix. Do not compute from user data. */
export const DOMAIN_JURISDICTION_MATRIX: ToolJurisdiction[] = [
  { tool: 'vedic', answersWhat: ['timing', 'identity', 'karmic', 'life-structure', 'relationship', 'health', 'financial', 'general'] },
  { tool: 'western', answersWhat: ['timing', 'identity', 'life-structure', 'relationship', 'general'] },
  { tool: 'tarot', answersWhat: ['guidance', 'symbolic', 'situational', 'relationship', 'general'] },
  { tool: 'numerology', answersWhat: ['identity', 'expression', 'name-vibration', 'timing', 'general'] },
  { tool: 'kabbalistic', answersWhat: ['soul-lesson', 'identity', 'name-vibration', 'expression', 'general'] },
  { tool: 'nameAnalysis', answersWhat: ['expression', 'name-vibration', 'identity', 'general'] },
  { tool: 'lenormand', answersWhat: ['situational', 'literal', 'guidance', 'general'] },
  { tool: 'iching', answersWhat: ['guidance', 'symbolic', 'situational', 'timing', 'general'] },
  { tool: 'kp', answersWhat: ['timing', 'guidance', 'situational', 'general'] },
  { tool: 'palmistry', answersWhat: ['identity', 'expression', 'guidance', 'general'] },
  { tool: 'geomancy', answersWhat: ['guidance', 'structural', 'situational', 'general'] },
  { tool: 'financial', answersWhat: ['financial', 'timing', 'structural', 'general'] },
  { tool: 'medical', answersWhat: ['health', 'structural', 'general'] },
  { tool: 'navaratna', answersWhat: ['timing', 'structural', 'alignment', 'general'] },
  { tool: 'dreamSymbols', answersWhat: ['symbolic', 'identity', 'guidance', 'general'] },
  { tool: 'faceReading', answersWhat: ['identity', 'expression', 'general'] },
  { tool: 'fengShui', answersWhat: ['spatial', 'directional', 'alignment', 'general'] },
  { tool: 'vastu', answersWhat: ['spatial', 'directional', 'structural', 'general'] },
  { tool: 'humanDesign', answersWhat: ['identity', 'structural', 'alignment', 'general'] },
  { tool: 'ogham', answersWhat: ['identity', 'symbolic', 'guidance', 'general'] },
  { tool: 'trichakra', answersWhat: ['identity', 'symbolic', 'guidance', 'general'] },
  { tool: 'sortilege', answersWhat: ['confirmation', 'alignment', 'directional', 'general'] },
  { tool: 'pendulum', answersWhat: ['confirmation', 'alignment', 'general'] },
  { tool: 'energyHealing', answersWhat: ['health', 'guidance', 'general'] },
  { tool: 'akashicRecords', answersWhat: ['soul-lesson', 'identity', 'guidance', 'general'] },
  { tool: 'astrocartography', answersWhat: ['spatial', 'relocation', 'alignment', 'general'] },
];

/** Intent -> jurisdiction tags that are relevant for that intent. */
const INTENT_TO_JURISDICTIONS: Record<string, JurisdictionTag[]> = {
  decision: ['guidance', 'situational', 'alignment', 'confirmation', 'general'],
  identity: ['identity', 'expression', 'name-vibration', 'soul-lesson', 'karmic', 'general'],
  purpose: ['karmic', 'soul-lesson', 'identity', 'life-structure', 'general'], // no timing; exclude Panchanga for purpose
  timing: ['timing', 'life-structure', 'general'],
  alignment: ['alignment', 'confirmation', 'directional', 'general'],
  confirmation: ['confirmation', 'alignment', 'general'],
  family: ['relationship', 'life-structure', 'guidance', 'situational', 'spatial', 'general'],
  relocation: ['spatial', 'relocation', 'timing', 'life-structure', 'general'],
  'truth-seeking': ['general', 'guidance', 'identity', 'timing', 'relationship', 'symbolic', 'situational'],
  health: ['health', 'guidance', 'general'],
  world_events: ['collective', 'guidance', 'general'],
  symbolic: ['symbolic', 'guidance', 'general'],
  general: ['general', 'guidance', 'identity', 'timing', 'relationship', 'health', 'financial', 'symbolic', 'situational'],
};

/**
 * Returns tool keys that are allowed to answer for the given intent (and optionally scope).
 * Used by Domain Activation Filter: only these tools may be called.
 */
export function getDomainsRequired(
  intent: string,
  _scope?: string
): ToolKey[] {
  const tags = INTENT_TO_JURISDICTIONS[intent] ?? INTENT_TO_JURISDICTIONS.general;
  const tools: ToolKey[] = [];
  for (const row of DOMAIN_JURISDICTION_MATRIX) {
    const hasOverlap = row.answersWhat.some((t) => tags.includes(t));
    if (hasOverlap) {
      tools.push(row.tool);
    }
  }
  return tools.length > 0 ? tools : DOMAIN_JURISDICTION_MATRIX.map((r) => r.tool);
}

/** All tool keys that have a jurisdiction (for intersection with available profile). */
export function getAllToolKeys(): ToolKey[] {
  return DOMAIN_JURISDICTION_MATRIX.map((r) => r.tool);
}
