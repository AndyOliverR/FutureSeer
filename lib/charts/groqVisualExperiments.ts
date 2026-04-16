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
    tokens: { background: '#0b1120', ringStroke: '#eab308', textPrimary: '#f8fafc', textSecondary: '#94a3b8', accent: '#f59e0b' },
  },
  {
    id: 'ivory-manuscript',
    label: 'Ivory Manuscript',
    tokens: { background: '#fffdf7', ringStroke: '#7c2d12', textPrimary: '#1f2937', textSecondary: '#6b7280', accent: '#b45309' },
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

