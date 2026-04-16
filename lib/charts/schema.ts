export type ChartSystem =
  | 'western'
  | 'vedic'
  | 'kp'
  | 'nakshatra'
  | 'numerology'
  | 'vastu'
  | 'fengshui';

export type ChartLayout =
  | 'western-wheel'
  | 'vedic-north'
  | 'vedic-south'
  | 'nakshatra-wheel'
  | 'grid'
  | 'compass';

export interface ChartPoint {
  id: string;
  label: string;
  shortLabel?: string;
  longitude: number;
  latitude?: number;
  signIndex?: number;
  signName?: string;
  degreeInSign?: number;
  house?: number;
  isRetrograde?: boolean;
  meta?: Record<string, unknown>;
}

export interface ChartHouse {
  number: number;
  cuspLongitude: number;
  signIndex?: number;
  signName?: string;
  label?: string;
}

export interface ChartAspect {
  fromId: string;
  toId: string;
  type: string;
  orb?: number;
  strength?: number;
  influence?: 'harmonious' | 'challenging' | 'neutral';
}

export interface ChartTokenOverrides {
  background?: string;
  ringStroke?: string;
  textPrimary?: string;
  textSecondary?: string;
  accent?: string;
}

export interface UnifiedChartData {
  id: string;
  title: string;
  system: ChartSystem;
  layout: ChartLayout;
  points: ChartPoint[];
  houses: ChartHouse[];
  aspects?: ChartAspect[];
  metadata?: Record<string, unknown>;
  tokens?: ChartTokenOverrides;
}

