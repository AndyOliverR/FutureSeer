/**
 * Ogham Divination Seer State and Slice.
 * Rule: Ogham describes growth conditions, not guaranteed outcomes.
 */

import type { OghamReport } from './ogham/oghamReportGenerator';
import type { OghamLetter } from './ogham/oghamService';

export interface OghamFid {
  name: string;
  tree: string;
  position: string;
}

export interface OghamState {
  question_scope: string;
  draw_type: string;
  feda: OghamFid[];
  growth_phase: string;
  context?: string;
}

export type OghamQuestionType =
  | 'phase'
  | 'support'
  | 'timing_action'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing report. */
export const OGHAM_REFUSAL_DATA_PHRASE =
  'Ogham insights require a reading. Generate your Ogham report first.';

/** Refusal phrase for outcome/timing. */
export const OGHAM_REFUSAL_OUTCOME_PHRASE =
  'Ogham is not designed to predict outcomes or timing.';

/** Infer growth phase from guidance text. */
function inferGrowthPhase(guidanceCurrent: string | undefined): string {
  if (!guidanceCurrent || typeof guidanceCurrent !== 'string') return 'general';
  const lower = guidanceCurrent.toLowerCase();
  if (/\b(begin|start|new|fresh|clearing)\b/.test(lower)) return 'initiation';
  if (/\b(grow|nurture|develop|build|expand)\b/.test(lower)) return 'growth';
  if (/\b(maintain|strengthen|stability|steady)\b/.test(lower)) return 'stability';
  if (/\b(share|fruit|decide|harvest|exchange)\b/.test(lower)) return 'fruition';
  if (/\b(release|let go|end|transition|transform)\b/.test(lower)) return 'release';
  return 'general';
}

/** Map OghamLetter to OghamFid. */
function letterToFid(letter: OghamLetter, position: string): OghamFid {
  return {
    name: letter.name || letter.tree || 'Unknown',
    tree: letter.tree || letter.name || 'Unknown',
    position,
  };
}

/**
 * Build OghamState from OghamReport.
 * Requires report with birthTree.
 */
export function buildOghamState(report: OghamReport | null | undefined): OghamState {
  if (!report) {
    throw new Error(OGHAM_REFUSAL_DATA_PHRASE);
  }

  const birthTree = report.birthTree?.birthTree;
  if (!birthTree) {
    throw new Error(OGHAM_REFUSAL_DATA_PHRASE);
  }

  const feda: OghamFid[] = [];
  feda.push(letterToFid(birthTree, 'present'));

  const primary = report.personalLetters?.primary || [];
  const seen = new Set<string>([birthTree.name || birthTree.tree]);
  for (const letter of primary) {
    const key = letter.name || letter.tree;
    if (key && !seen.has(key)) {
      seen.add(key);
      feda.push(letterToFid(letter, 'support'));
    }
  }

  const draw_type = feda.length > 1 ? 'profile' : 'single_stave';
  const growth_phase = inferGrowthPhase(report.guidance?.current);
  const context = (report.guidance?.current || report.overview?.summary || '').slice(0, 200);

  return {
    question_scope: 'growth',
    draw_type,
    feda,
    growth_phase,
    context: context || undefined,
  };
}

/**
 * Classify Ogham question.
 * Refuse: prediction, timing, outcome guarantees.
 * Valid: phase, support, timing_action (begin/wait/consolidate).
 */
export function classifyOghamQuestion(question: string): OghamQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal
  if (/\b(will this succeed|when will it happen|what will be the result)\b/.test(lower)) {
    return 'refusal';
  }
  if (/\b(predict|outcome|guarantee|definitely (will|won't))\b/.test(lower)) {
    return 'refusal';
  }

  // Valid question types
  if (/\b(what phase is this situation in|phase (of )?this situation)\b/.test(lower)) {
    return 'phase';
  }
  if (/\b(what supports growth (right )?now|supports growth)\b/.test(lower)) {
    return 'support';
  }
  if (/\b(is it time to (begin|wait|consolidate)|time to begin|wait or consolidate)\b/.test(lower)) {
    return 'timing_action';
  }
  if (/\b(what action suits this phase|action suits)\b/.test(lower)) {
    return 'timing_action';
  }

  if (/\b(ogham|celtic|tree|feda|stave|growth|phase)\b/.test(lower)) {
    return 'general';
  }

  return 'general';
}

/** Tree-to-function mapping (spine) */
const TREE_FUNCTION_MAP: Record<string, string> = {
  Beith: 'initiation, clearing',
  Luis: 'protection, focus',
  Fearn: 'guidance, protection',
  Sail: 'intuition, dreams',
  Nion: 'connection, unity',
  Uath: 'purification, boundaries',
  Duir: 'strength, endurance',
  Tinne: 'protection, justice',
  Coll: 'wisdom, inspiration',
  Quert: 'fruition, exchange',
  Muin: 'release, inner work',
  Gort: 'quest, determination',
  'nGéadal': 'direct action, integrity',
  Straif: 'discipline, authority',
  Ruis: 'endings, transition',
  Ailm: 'insight, clarity',
  Onn: 'collective energy',
  Úr: 'dreams, passion',
  Eadhadh: 'endurance, protection',
  Iodhadh: 'closure, transformation',
};

/**
 * Build system prompt slice for Ogham Divination.
 * Enforces tree-to-function, growth-phase logic, position logic.
 */
export function getOghamSliceForQuestionType(
  questionType: OghamQuestionType,
  state: OghamState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${OGHAM_REFUSAL_OUTCOME_PHRASE}" Do not predict outcomes, timing, or guarantees. Ogham reflects natural phases, not results.`;
  }

  const fedaList = state.feda
    .map((f) => `- ${f.name} (${f.tree}): ${f.position}`)
    .join('\n');

  const treeFunctions = state.feda
    .map((f) => {
      const fn = TREE_FUNCTION_MAP[f.name] || f.name;
      return `- ${f.name}/${f.tree}: ${fn}`;
    })
    .join('\n');

  const stateBlock = `
OGHAM STATE (use this only):
- Question scope: ${state.question_scope}
- Draw type: ${state.draw_type}
- Growth phase: ${state.growth_phase}
${state.context ? `- Context: ${state.context}` : ''}
- Feda (tree staves):
${fedaList}
`.trim();

  const treeBlock = `
TREE-TO-FUNCTION MAPPING (spine):
Each fid maps to function + phase, not symbolism. Key mappings:
${treeFunctions}
Describe what supports growth now. No stacking meanings.
`.trim();

  const phaseBlock = `
GROWTH-PHASE LOGIC:
- Initiation: start simply, clear space
- Growth: nurture, be patient
- Stability: maintain, strengthen
- Fruition: share, decide
- Release: let go, reset
- General: balance between phases
No mixed phases without explanation.
`.trim();

  const positionBlock = `
POSITION LOGIC (if multi-stave):
Past = condition formed. Present = active phase. Future = next adjustment (direction, not destiny).
Future is direction, not outcome.
`.trim();

  const framingBlock = `
ACTION FRAMING:
Phase-appropriate guidance only. Say "This phase supports clearing space and beginning gently" not "This will bring success."
Clear, restrained. No prediction.
`.trim();

  const permanentRule = `
PERMANENT RULE:
Ogham guides alignment with natural cycles, not control over results.
`.trim();

  return `${stateBlock}

${treeBlock}

${phaseBlock}

${positionBlock}

${framingBlock}

${permanentRule}`;
}
