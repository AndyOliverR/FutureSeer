import type { ChartTokenOverrides } from './schema';

export const defaultChartTokens: Required<ChartTokenOverrides> = {
  background: '#0b1220',
  ringStroke: '#e2b659',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  accent: '#f59e0b',
};

export const chartSystemTokens: Record<string, ChartTokenOverrides> = {
  western: {
    background: '#0b1220',
    ringStroke: '#e2b659',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#f59e0b',
  },
  vedic: {
    background: '#0b1220',
    ringStroke: '#e2b659',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#f59e0b',
  },
  nakshatra: {
    background: '#0b1220',
    ringStroke: '#e2b659',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#f59e0b',
  },
  kp: {
    background: '#f8fafc',
    ringStroke: '#1e40af',
    textPrimary: '#111827',
    textSecondary: '#64748b',
    accent: '#2563eb',
  },
  numerology: {
    background: '#f8fafc',
    ringStroke: '#7c3aed',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    accent: '#8b5cf6',
  },
  vastu: {
    background: '#f9fafb',
    ringStroke: '#0369a1',
    textPrimary: '#111827',
    textSecondary: '#64748b',
    accent: '#0ea5e9',
  },
  fengshui: {
    background: '#f9fafb',
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

