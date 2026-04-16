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
    background: '#ffffff',
    ringStroke: '#111827',
    textPrimary: '#111827',
    textSecondary: '#475569',
    accent: '#ef4444',
  },
  vedic: {
    background: '#fffdf6',
    ringStroke: '#7c2d12',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    accent: '#b45309',
  },
  nakshatra: {
    background: '#f8fafc',
    ringStroke: '#334155',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#0ea5e9',
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

export function getChartTokens(system: string, overrides?: ChartTokenOverrides): Required<ChartTokenOverrides> {
  return {
    ...defaultChartTokens,
    ...(chartSystemTokens[system] ?? {}),
    ...(overrides ?? {}),
  };
}

