/**
 * Palm Seer State and Slice Selector.
 * Structured palm morphology; dominance gate; feature hierarchy; trait-based only.
 * Rule: Palmistry describes capacity and inclination, not destiny.
 */

import type { PalmistryAnalysis } from '@/lib/palmistryIntelligence';

export type PalmQuestionType =
  | 'personality_temperament'
  | 'strengths_weaknesses'
  | 'career_aptitude'
  | 'relationship_style'
  | 'refusal'
  | 'general';

export interface PalmState {
  dominant_hand: 'left' | 'right' | null;
  hand_type: 'fire' | 'earth' | 'air' | 'water' | null;
  mounts: Record<string, string>;
  major_lines: {
    life_line?: { depth: string; length?: string; curve?: string; breaks: boolean };
    head_line?: { depth: string; length?: string; curve?: string; breaks: boolean };
    heart_line?: { depth: string; length?: string; curve?: string; breaks: boolean };
  };
  minor_lines: Record<string, string>;
  has_palm_data: boolean;
}

const LINE_NAME_TO_MAJOR: Record<string, keyof PalmState['major_lines']> = {
  'Life Line': 'life_line',
  'Heart Line': 'heart_line',
  'Head Line': 'head_line',
};

const LINE_NAME_TO_MINOR: Record<string, string> = {
  'Fate Line': 'fate_line',
  'Sun Line': 'sun_line',
  'Mercury Line': 'mercury_line',
};

const MOUNT_NAME_TO_KEY: Record<string, string> = {
  'Mount of Venus': 'venus',
  'Mount of Jupiter': 'jupiter',
  'Mount of Saturn': 'saturn',
  'Mount of Apollo': 'apollo',
  'Mount of Mercury': 'mercury',
  'Mount of Luna': 'luna',
  'Mount of Mars': 'mars',
};

function normalizeProminence(p: string): string {
  const lower = (p || '').toLowerCase();
  if (lower === 'normal') return 'average';
  if (lower === 'very-prominent') return 'prominent';
  if (lower === 'flat' || lower === 'average' || lower === 'prominent') return lower;
  return 'average';
}

function qualityToCurve(quality: string): string {
  const lower = (quality || '').toLowerCase();
  if (lower === 'straight') return 'straight';
  if (lower === 'wavy' || lower === 'curved') return 'curved';
  if (lower === 'forked') return 'forked';
  return 'straight';
}

function parseHandType(palmShape: string | undefined, primaryElement: string | undefined): 'fire' | 'earth' | 'air' | 'water' | null {
  const shape = (palmShape || '').toLowerCase();
  if (shape.includes('earth hand')) return 'earth';
  if (shape.includes('air hand')) return 'air';
  if (shape.includes('fire hand')) return 'fire';
  if (shape.includes('water hand')) return 'water';
  if (shape.includes('mixed hand') && primaryElement) {
    const el = primaryElement.toLowerCase();
    if (el === 'fire' || el === 'earth' || el === 'air' || el === 'water') return el as 'fire' | 'earth' | 'air' | 'water';
  }
  if (primaryElement) {
    const el = primaryElement.toLowerCase();
    if (el === 'fire' || el === 'earth' || el === 'air' || el === 'water') return el as 'fire' | 'earth' | 'air' | 'water';
  }
  return null;
}

function lineDepthToProminence(depth: string): string {
  const d = (depth || '').toLowerCase();
  if (d === 'deep') return 'clear';
  if (d === 'clear') return 'moderate';
  if (d === 'faint') return 'faint';
  return 'moderate';
}

/**
 * Build PalmState from PalmistryAnalysis (or minimal state if none).
 */
export function buildPalmState(
  palmistryAnalysis: PalmistryAnalysis | null | undefined,
  _userProfile?: { hand?: string; dominantHand?: string } | null
): PalmState {
  const mounts: Record<string, string> = {};
  const major_lines: PalmState['major_lines'] = {};
  const minor_lines: Record<string, string> = {};

  if (!palmistryAnalysis) {
    let dominant_hand: 'left' | 'right' | null = null;
    if (_userProfile?.dominantHand === 'left' || _userProfile?.hand === 'left') dominant_hand = 'left';
    if (_userProfile?.dominantHand === 'right' || _userProfile?.hand === 'right') dominant_hand = 'right';
    return {
      dominant_hand,
      hand_type: null,
      mounts: {},
      major_lines: {},
      minor_lines: {},
      has_palm_data: false,
    };
  }

  const dominant_hand = palmistryAnalysis.dominantHand ?? null;
  const hand_type = parseHandType(
    palmistryAnalysis.palmShape,
    palmistryAnalysis.elements?.primary
  );

  for (const m of palmistryAnalysis.mounts || []) {
    const key = MOUNT_NAME_TO_KEY[m.name];
    if (key) mounts[key] = normalizeProminence(m.prominence);
  }

  for (const line of palmistryAnalysis.lines || []) {
    const majorKey = LINE_NAME_TO_MAJOR[line.name];
    if (majorKey) {
      major_lines[majorKey] = {
        depth: line.depth || 'clear',
        length: line.length,
        curve: qualityToCurve(line.quality),
        breaks: line.quality === 'broken',
      };
    }
    const minorKey = LINE_NAME_TO_MINOR[line.name];
    if (minorKey) {
      minor_lines[minorKey] = lineDepthToProminence(line.depth);
    }
  }

  return {
    dominant_hand,
    hand_type,
    mounts,
    major_lines,
    minor_lines,
    has_palm_data: true,
  };
}

/**
 * Classify palm question. Returns 'refusal' for timing, outcomes, health, death, guarantees.
 */
export function classifyPalmQuestion(question: string): PalmQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /when\s+will|when\s+is\s+the\s+best\s+time|what\s+year|life\s+phase|favorable\s+period|when\s+do\s+i|when\s+should\s+i|timing|when\s+will\s+i\s+(get|find|meet|marry|have)|will\s+i\s+get\s+married|will\s+i\s+be\s+rich|will\s+i\s+find\s+love|exact\s+outcome|health\s+diagnosis|illness|disease|how\s+long\s+will\s+i\s+live|death|lifespan|guarantee|certain\s+outcome|predict\s+exact/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /personality|temperament|character|nature|how\s+i\s+operate|approach\s+to\s+life/.test(
      lower
    )
  ) {
    return 'personality_temperament';
  }

  if (
    /strengths|weaknesses|strength|weakness|capacities|limits|what\s+am\s+i\s+good\s+at|challenges/.test(
      lower
    )
  ) {
    return 'strengths_weaknesses';
  }

  if (
    /career|job|vocation|aptitude|work|profession|suit\s+me\s+for/.test(lower)
  ) {
    return 'career_aptitude';
  }

  if (
    /relationship\s+style|how\s+i\s+relate|approach\s+to\s+relationships|romantic\s+style|connection/.test(
      lower
    )
  ) {
    return 'relationship_style';
  }

  return 'general';
}

/**
 * Build slice for system prompt: dominance gate + feature priority (hand_type > mounts > major_lines > minor_lines).
 */
export function getPalmSliceForQuestionType(
  _questionType: PalmQuestionType,
  state: PalmState
): string {
  const lines: string[] = [];

  if (state.dominant_hand) {
    lines.push(
      `Hand read: ${state.dominant_hand}. Dominant hand = current expression; non-dominant = innate tendencies.`
    );
  } else {
    lines.push(
      'Partial answer only: dominant hand not specified.'
    );
  }

  if (state.hand_type) {
    lines.push(`hand_type: ${state.hand_type}`);
  } else if (state.has_palm_data) {
    lines.push('hand_type: (not determined)');
  }

  if (Object.keys(state.mounts).length > 0) {
    lines.push('mounts:');
    for (const [k, v] of Object.entries(state.mounts)) {
      lines.push(`  ${k}: ${v}`);
    }
  }

  if (
    state.major_lines.life_line ||
    state.major_lines.head_line ||
    state.major_lines.heart_line
  ) {
    lines.push('major_lines:');
    if (state.major_lines.life_line) {
      const l = state.major_lines.life_line;
      lines.push(
        `  life_line: depth=${l.depth} length=${l.length || '?'} curve=${l.curve || '?'} breaks=${l.breaks}`
      );
    }
    if (state.major_lines.head_line) {
      const l = state.major_lines.head_line;
      lines.push(
        `  head_line: depth=${l.depth} length=${l.length || '?'} curve=${l.curve || '?'} breaks=${l.breaks}`
      );
    }
    if (state.major_lines.heart_line) {
      const l = state.major_lines.heart_line;
      lines.push(
        `  heart_line: depth=${l.depth} length=${l.length || '?'} curve=${l.curve || '?'} breaks=${l.breaks}`
      );
    }
  }

  if (Object.keys(state.minor_lines).length > 0) {
    lines.push('minor_lines:');
    for (const [k, v] of Object.entries(state.minor_lines)) {
      lines.push(`  ${k}: ${v}`);
    }
  }

  if (!state.has_palm_data) {
    lines.push('');
    lines.push(
      'Palm analysis is limited without hand data. This answer reflects general tendencies only.'
    );
  }

  return lines.join('\n');
}
