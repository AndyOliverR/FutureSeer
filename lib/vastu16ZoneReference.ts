/**
 * Educational 16-zone reference for UI (plot / energy themes).
 * Lineages differ; not medical, legal, or financial advice.
 */

import { VASTU_16_ZONES } from '@/lib/vastuDirections';

export type VastuZoneKey = (typeof VASTU_16_ZONES)[number];

export type Vastu16ZoneRef = {
  /** Short compass label (NNE, etc.) */
  abbrev: string;
  /** Theme line for homeowners (traditional association wording). */
  theme: string;
  /** SVG sector fill (FutureSeer palette — not a copy of external charts). */
  fill: string;
  /** Lighter fill for hover */
  fillMuted: string;
};

export const VASTU_16_ZONE_REFERENCE: Record<VastuZoneKey, Vastu16ZoneRef> = {
  North: {
    abbrev: 'N',
    theme: 'Money and opportunities (traditional)',
    fill: '#0369a1',
    fillMuted: '#0ea5e9',
  },
  'North-North-East': {
    abbrev: 'NNE',
    theme: 'Health and vitality (traditional)',
    fill: '#0284c7',
    fillMuted: '#38bdf8',
  },
  'North-East': {
    abbrev: 'NE',
    theme: 'Clarity, ideas, and vision (traditional)',
    fill: '#0891b2',
    fillMuted: '#22d3ee',
  },
  'East-of-North-East': {
    abbrev: 'ENE',
    theme: 'Recreation and freshness (traditional)',
    fill: '#059669',
    fillMuted: '#34d399',
  },
  East: {
    abbrev: 'E',
    theme: 'Social connections and movement (traditional)',
    fill: '#16a34a',
    fillMuted: '#4ade80',
  },
  'East-of-South-East': {
    abbrev: 'ESE',
    theme: 'Analysis and churning (traditional)',
    fill: '#65a30d',
    fillMuted: '#a3e635',
  },
  'South-East': {
    abbrev: 'SE',
    theme: 'Energy, liquidity, and activity (traditional)',
    fill: '#dc2626',
    fillMuted: '#f87171',
  },
  'South-of-South-East': {
    abbrev: 'SSE',
    theme: 'Confidence and support (traditional)',
    fill: '#b91c1c',
    fillMuted: '#fb7185',
  },
  South: {
    abbrev: 'S',
    theme: 'Rest, visibility, and stability (traditional)',
    fill: '#c2410c',
    fillMuted: '#fb923c',
  },
  'South-of-South-West': {
    abbrev: 'SSW',
    theme: 'Letting go and expenditure (traditional)',
    fill: '#ca8a04',
    fillMuted: '#facc15',
  },
  'South-West': {
    abbrev: 'SW',
    theme: 'Relationships and skills (traditional)',
    fill: '#a16207',
    fillMuted: '#fde047',
  },
  'West-of-South-West': {
    abbrev: 'WSW',
    theme: 'Learning and savings (traditional)',
    fill: '#ca8a04',
    fillMuted: '#fde68a',
  },
  West: {
    abbrev: 'W',
    theme: 'Gains and completion (traditional)',
    fill: '#64748b',
    fillMuted: '#94a3b8',
  },
  'West-of-North-West': {
    abbrev: 'WNW',
    theme: 'Release and detox themes (traditional)',
    fill: '#475569',
    fillMuted: '#cbd5e1',
  },
  'North-West': {
    abbrev: 'NW',
    theme: 'Support and banking themes (traditional)',
    fill: '#475569',
    fillMuted: '#94a3b8',
  },
  'North-of-North-West': {
    abbrev: 'NNW',
    theme: 'Attraction and magnetism themes (traditional)',
    fill: '#075985',
    fillMuted: '#7dd3fc',
  },
};

export const VASTU_REFERENCE_DISCLAIMER =
  'Educational reference only. Schools and teachers differ; this is not medical, legal, or financial advice.';
