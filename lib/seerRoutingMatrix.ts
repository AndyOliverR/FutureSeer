/**
 * Deterministic routing matrix: intent dimension + object → primary/secondary tools.
 * Overrides loose semantic guessing so relocation uses location/outcome tools, not personality.
 */

export type IntentDimension = 'outcome' | 'timing' | 'location' | 'alignment' | 'obstacles' | null;

export type RoutingObject =
  | 'relocation'
  | 'career'
  | 'relationship'
  | 'purpose'
  | 'health'
  | 'decision'
  | 'timing'
  | 'family'
  | 'general';

export interface ToolCluster {
  primary: string[];
  secondary: string[];
}

/** Detect intent dimension from question text (outcome, timing, location, alignment, obstacles). */
function detectDimension(question: string): IntentDimension {
  const q = question.toLowerCase().trim();
  if (/\b(favorable|succeed|work|will (it|i)|success|outcome|result)\b/i.test(q)) return 'outcome';
  if (/\b(when|period|best time|right time|delay|year|month|launch|release)\b/i.test(q)) return 'timing';
  if (/\b(where|country|city|place|location|move|abroad|which (country|city|place))\b/i.test(q)) return 'location';
  if (/\b(suit|support|fit|align|aligned|suitable|right (place|location))\b/i.test(q)) return 'alignment';
  if (/\b(obstacles?|blocks?|challenges?|difficult)\b/i.test(q)) return 'obstacles';
  return null;
}

/** Matrix: (object, dimension) -> primary + secondary system names. */
type DimensionKey = Exclude<IntentDimension, null> | 'null';
const ROUTING_MATRIX: Record<RoutingObject, Partial<Record<DimensionKey, ToolCluster>>> = {
  relocation: {
    outcome: {
      primary: ['Astrocartography', 'KP Astrology'],
      secondary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods'],
    },
    timing: {
      primary: ['Vedic Dashas', 'Dasha Periods', 'Planetary Transits'],
      secondary: ['KP Astrology'],
    },
    location: {
      primary: ['Astrocartography'],
      secondary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods'],
    },
    alignment: {
      primary: ['Astrocartography', 'Vedic Astrology'],
      secondary: ['Western Astrology'],
    },
    obstacles: {
      primary: ['KP Astrology', 'Vedic Astrology'],
      secondary: ['Vedic Dashas', 'Dasha Periods'],
    },
    null: {
      primary: ['Astrocartography', 'KP Astrology'],
      secondary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods'],
    },
  },
  career: {
    outcome: { primary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods'], secondary: ['Numerology'] },
    timing: { primary: ['Vedic Dashas', 'Dasha Periods', 'Planetary Transits'], secondary: ['Numerology'] },
    null: { primary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods'], secondary: ['Western Astrology', 'Numerology'] },
  },
  relationship: {
    null: { primary: ['Tarot'], secondary: ['Western Astrology'] },
  },
  purpose: {
    null: { primary: ['Kabbalistic Numerology'], secondary: ['Western Astrology'] },
  },
  health: {
    null: { primary: ['Vedic Astrology'], secondary: ['Western Astrology'] },
  },
  decision: {
    null: { primary: ['I Ching', 'Tarot'], secondary: ['Geomancy', 'Sortilege'] },
  },
  timing: {
    null: { primary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods', 'Planetary Transits'], secondary: ['KP Astrology'] },
  },
  family: {
    null: { primary: ['Vedic Astrology', 'Tarot'], secondary: ['Numerology'] },
  },
  general: {
    null: { primary: ['Vedic Astrology', 'Western Astrology'], secondary: [] },
  },
};

/** Default cluster when object has no entry (fallback to generic). */
const DEFAULT_CLUSTER: ToolCluster = {
  primary: ['Vedic Astrology', 'Western Astrology'],
  secondary: [],
};

/**
 * Returns primary and secondary tool names for the given object (and optional question for dimension).
 * Used by the engine to prefer location/outcome/timing tools for relocation instead of personality.
 */
export function getToolClusterForIntent(
  object: string,
  question?: string
): ToolCluster {
  const key = object.trim().toLowerCase() as RoutingObject;
  const entry = ROUTING_MATRIX[key];
  if (!entry) return DEFAULT_CLUSTER;

  const dimension: IntentDimension = question ? detectDimension(question) : null;
  const dimKey: DimensionKey = dimension ?? 'null';
  const cluster = entry[dimKey];
  if (!cluster) return DEFAULT_CLUSTER;

  return {
    primary: cluster.primary ?? [],
    secondary: cluster.secondary ?? [],
  };
}
