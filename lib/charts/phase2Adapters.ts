import type { UnifiedChartData } from './schema';

function normalizeFiniteNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function adaptKpOverlay(input: { points?: Array<{ id: string; label: string; longitude: number; house?: number }>; title?: string }): UnifiedChartData {
  const orderedPoints = [...(input.points ?? [])]
    .filter((p) => p && typeof p.id === 'string' && typeof p.label === 'string')
    .map((p, index) => ({
      ...p,
      longitude: normalizeFiniteNumber(p.longitude, index * 30),
      house: p.house != null ? normalizeFiniteNumber(p.house, 0) : undefined,
    }))
    .sort((a, b) => a.longitude - b.longitude || a.label.localeCompare(b.label));
  return {
    id: 'kp-overlay',
    title: input.title ?? 'KP Overlay',
    system: 'kp',
    layout: 'vedic-north',
    houses: [],
    points: orderedPoints.map((p) => ({ ...p, shortLabel: p.label.slice(0, 2) })),
    metadata: { overlay: 'kp-cusps-sub-lords' },
  };
}

export function adaptNumerologyMatrix(input: { values?: number[]; title?: string }): UnifiedChartData {
  const values = (input.values ?? []).map((v, index) => normalizeFiniteNumber(v, index + 1));
  return {
    id: 'numerology-matrix',
    title: input.title ?? 'Numerology Matrix',
    system: 'numerology',
    layout: 'grid',
    houses: [],
    points: values.map((v, idx) => ({ id: `n-${idx + 1}`, label: String(v), shortLabel: String(v), longitude: idx * 40 })),
    metadata: { matrix: 'lo-shu' },
  };
}

export function adaptVastuCompass(input: { zones?: string[]; title?: string }): UnifiedChartData {
  const rawZones = input.zones ?? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const zones = rawZones.map((z) => String(z).trim()).filter(Boolean);
  return {
    id: 'vastu-compass',
    title: input.title ?? 'Vastu Compass',
    system: 'vastu',
    layout: 'compass',
    houses: [],
    points: zones.map((z, idx) => ({ id: z.toLowerCase(), label: z, shortLabel: z, longitude: idx * 45 })),
    metadata: { compass: 'vastu-8-zones' },
  };
}

export function adaptFengShuiBagua(input: { sectors?: string[]; title?: string }): UnifiedChartData {
  const rawSectors = input.sectors ?? ['Career', 'Knowledge', 'Family', 'Wealth', 'Center', 'Fame', 'Love', 'Children', 'Helpful'];
  const sectors = rawSectors.map((s) => String(s).trim()).filter(Boolean);
  return {
    id: 'fengshui-bagua',
    title: input.title ?? 'Feng Shui Bagua',
    system: 'fengshui',
    layout: 'grid',
    houses: [],
    points: sectors.map((s, idx) => ({ id: `bagua-${idx}`, label: s, shortLabel: s.slice(0, 2), longitude: idx * 36 })),
    metadata: { bagua: '9-grid' },
  };
}

