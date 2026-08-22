import type { UnifiedChartData, ChartTokenOverrides } from './schema';

export interface GroqStyleVariant {
  id: string;
  label: string;
  tokens: ChartTokenOverrides;
}

export const GROQ_STYLE_VARIANTS: GroqStyleVariant[] = [
  {
    id: 'auric-night',
    label: 'Auric Night',
    tokens: { background: '#ffffff', ringStroke: '#3b82f6', textPrimary: '#0f172a', textSecondary: '#64748b', accent: '#2563eb' },
  },
  {
    id: 'ivory-manuscript',
    label: 'Ivory Manuscript',
    tokens: { background: '#ffffff', ringStroke: '#3b82f6', textPrimary: '#0f172a', textSecondary: '#64748b', accent: '#2563eb' },
  },
];

export function applyGroqStyleVariant(chart: UnifiedChartData, variantId?: string): UnifiedChartData {
  const variant = GROQ_STYLE_VARIANTS.find((item) => item.id === variantId) ?? GROQ_STYLE_VARIANTS[0];
  return {
    ...chart,
    tokens: {
      ...(chart.tokens ?? {}),
      ...(variant?.tokens ?? {}),
    },
    metadata: {
      ...(chart.metadata ?? {}),
      groqVisualVariant: variant?.id ?? null,
      groqVisualOnly: true,
      geometryAuthoritative: true,
    },
  };
}

export function validateGeometryIntegrity(authoritative: UnifiedChartData, candidate: UnifiedChartData): boolean {
  if (authoritative.layout !== candidate.layout) return false;
  if (authoritative.points.length !== candidate.points.length) return false;
  if (authoritative.houses.length !== candidate.houses.length) return false;

  for (let i = 0; i < authoritative.points.length; i += 1) {
    if (Math.abs(authoritative.points[i].longitude - candidate.points[i].longitude) > 0.0001) return false;
  }
  return true;
}

