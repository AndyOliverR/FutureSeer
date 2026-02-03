/**
 * Vastu 16 zones (22.5° each) and 32 entrance padas (11.25° each).
 * Used for layout dropdowns and compass mapping.
 */

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
