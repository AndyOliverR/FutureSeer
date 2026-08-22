import type { ChartTokenOverrides } from './schema';

export const defaultChartTokens: Required<ChartTokenOverrides> = {
  background: '#ffffff',
  ringStroke: '#3b82f6',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  accent: '#2563eb',
};

export const chartSystemTokens: Record<string, ChartTokenOverrides> = {
  western: {
    background: '#ffffff',
    ringStroke: '#3b82f6',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#2563eb',
  },
  vedic: {
    background: '#ffffff',
    ringStroke: '#3b82f6',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#2563eb',
  },
  nakshatra: {
    background: '#ffffff',
    ringStroke: '#64748b',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#2563eb',
  },
  kp: {
    background: '#ffffff',
    ringStroke: '#1e40af',
    textPrimary: '#111827',
    textSecondary: '#64748b',
    accent: '#2563eb',
  },
  numerology: {
    background: '#ffffff',
    ringStroke: '#7c3aed',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    accent: '#8b5cf6',
  },
  vastu: {
    background: '#ffffff',
    ringStroke: '#0369a1',
    textPrimary: '#111827',
    textSecondary: '#64748b',
    accent: '#0ea5e9',
  },
  fengshui: {
    background: '#ffffff',
    ringStroke: '#0f766e',
    textPrimary: '#111827',
    textSecondary: '#64748b',
    accent: '#14b8a6',
  },
};

export interface ChartVisualSpec {
  baseFont: number;
  pointFont: number;
  ringStrokeWidth: number;
  secondaryStrokeWidth: number;
}

const defaultVisualSpec: ChartVisualSpec = {
  baseFont: 12,
  pointFont: 11,
  ringStrokeWidth: 1.4,
  secondaryStrokeWidth: 1.0,
}

const visualSpecBySystem: Record<string, Partial<ChartVisualSpec>> = {
  western: { baseFont: 12, pointFont: 11, ringStrokeWidth: 1.6, secondaryStrokeWidth: 1.1 },
  vedic: { baseFont: 12, pointFont: 11, ringStrokeWidth: 1.5, secondaryStrokeWidth: 1.0 },
  nakshatra: { baseFont: 11, pointFont: 12, ringStrokeWidth: 1.4, secondaryStrokeWidth: 0.95 },
}

export function getChartTokens(system: string, overrides?: ChartTokenOverrides): Required<ChartTokenOverrides> {
  return {
    ...defaultChartTokens,
    ...(chartSystemTokens[system] ?? {}),
    ...(overrides ?? {}),
  };
}

export function getChartVisualSpec(system: string): ChartVisualSpec {
  return {
    ...defaultVisualSpec,
    ...(visualSpecBySystem[system] ?? {}),
  };
}

