/**
 * Vastu 16 zones (22.5° each) and 32 entrance padas (11.25° each).
 * Used for layout dropdowns and compass mapping.
 */

import { VASTU_45_DEVTA_NAMES } from '@/lib/vastu45Fields';

/** Four cardinals only (90° each). North is centered on 0° / 360°, matching 16/32 conventions. */
export function degreesTo4Cardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 315 || normalized < 45) return 'North';
  if (normalized < 135) return 'East';
  if (normalized < 225) return 'South';
  return 'West';
}

/** 16 Vastu zones for room/zone placement. */
export const VASTU_16_ZONES = [
  'North',           // 0° / 360°
  'North-North-East', // 22.5° (NNE)
  'North-East',      // 45°
  'East-of-North-East', // 67.5° (ENE)
  'East',            // 90°
  'East-of-South-East', // 112.5° (ESE)
  'South-East',      // 135°
  'South-of-South-East', // 157.5° (SSE)
  'South',           // 180°
  'South-of-South-West', // 202.5° (SSW)
  'South-West',      // 225°
  'West-of-South-West', // 247.5° (WSW)
  'West',            // 270°
  'West-of-North-West', // 292.5° (WNW)
  'North-West',      // 315°
  'North-of-North-West', // 337.5° (NNW)
] as const;

/** Short traditional associations for 16 zones (cultural / symbolic — not medical advice). */
export const VASTU_16_ZONE_THEMES: Record<(typeof VASTU_16_ZONES)[number], string> = {
  North: 'Wealth / opportunity (traditional)',
  'North-North-East': 'Health / vitality (traditional)',
  'North-East': 'Clarity / wisdom (traditional)',
  'East-of-North-East': 'Recreation / freshness (traditional)',
  East: 'Social connection / movement (traditional)',
  'East-of-South-East': 'Churning / change (traditional)',
  'South-East': 'Energy / fire (traditional)',
  'South-of-South-East': 'Support / assets (traditional)',
  South: 'Rest / authority (traditional)',
  'South-of-South-West': 'Release / letting go (traditional)',
  'South-West': 'Stability / grounding (traditional)',
  'West-of-South-West': 'Waste / elimination (traditional)',
  West: 'Completion / enjoyment (traditional)',
  'West-of-North-West': 'Gain / profit (traditional)',
  'North-West': 'Wind / movement (traditional)',
  'North-of-North-West': 'Depression / low energy (traditional)',
};

/** 32 entrance padas: N1-N8, E1-E8, S1-S8, W1-W8. */
export const VASTU_32_PADA_IDS = [
  'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8',
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8',
  'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8',
] as const;

/** Map degrees (0–360) to 16 Vastu zones. Each zone spans 22.5°. */
export function degreesTo16Zone(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.floor(((normalized + 11.25) % 360) / 22.5);
  return VASTU_16_ZONES[index];
}

/** Map degrees (0–360) to 32 padas. Each pada spans 11.25°. North = 0°, first half of N = 0–11.25, etc. */
export function degreesTo32Pada(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.floor(((normalized + 5.625) % 360) / 11.25);
  return VASTU_32_PADA_IDS[index];
}

/**
 * 45 equal sectors of 8° (angular “Shakti”-style grid). Uses +4° offset so North is centered
 * on 0° (sector spans ~356°–4°). Index 0…44 clockwise from that North slice.
 */
export function degreesTo45FieldIndex(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360;
  return Math.floor(((normalized + 4) % 360) / 8) % 45;
}

/**
 * Devta-style label for the 8° sector at `degrees`. Applies a +1 rotation on the quick-reference
 * name list so the North-centered slice maps to Bhudhar (see vastu45Fields.ts source note).
 */
export function degreesTo45FieldLabel(degrees: number): string {
  const idx = degreesTo45FieldIndex(degrees);
  return VASTU_45_DEVTA_NAMES[(idx + 1) % VASTU_45_DEVTA_NAMES.length];
}

export type VastuCompassMode = '4' | '8' | '16' | '32' | '45';
