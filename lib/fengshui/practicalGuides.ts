/**
 * Practical Feng Shui guides: principle-based, actionable copy for in-app use.
 * v1 is computed on the client with profile analysis — not persisted to Firestore
 * (no comprehensiveMysticalProfiles schema change).
 */

import type { FengShuiAnalysis } from '@/lib/fengshui/fengShuiService';

export type PracticalGuideCategory = 'wealth' | 'entry' | 'maintenance' | 'drains';

export interface PracticalGuideItem {
  id: string;
  title: string;
  problem?: string;
  remedy: string;
  why: string;
  category: PracticalGuideCategory;
}

/** Shown under practical sections and in Full Report. */
export const PRACTICAL_GUIDE_DISCLAIMER =
  'Traditional Feng Shui is for reflection and environment design only. It is not medical, legal, or financial advice and does not guarantee outcomes.';

export interface FurtherReadingLink {
  label: string;
  href: string;
  note: string;
}

/** Outbound only; verify licenses before embedding text from these sites. */
export const FURTHER_READING_LINKS: FurtherReadingLink[] = [
  {
    label: 'Feng shui (overview)',
    href: 'https://en.wikipedia.org/wiki/Feng_shui',
    note: 'Wikipedia — CC BY-SA; use for your own summaries, not long excerpts.',
  },
  {
    label: 'Bagua',
    href: 'https://en.wikipedia.org/wiki/Bagua',
    note: 'Energy map concepts used in many compass-style approaches.',
  },
  {
    label: 'Wuxing (five elements)',
    href: 'https://en.wikipedia.org/wiki/Wuxing',
    note: 'Wood, fire, earth, metal, water interactions.',
  },
];

export const WEALTH_AT_HOME_ITEMS: PracticalGuideItem[] = [
  {
    id: 'wealth-se-xun',
    title: 'Southeast (Xun) — abundance sector',
    problem: 'In compass Bagua, the Southeast associates with wind/wood and prosperity symbolism.',
    remedy:
      'Keep this sector tidy, well lit, and alive: healthy plants, fresh air, and clear surfaces. If you use a small water feature, keep water clean and movement gentle.',
    why: 'Stagnation and neglect read as blocked flow; care and freshness support a sense of opportunity and growth.',
    category: 'wealth',
  },
  {
    id: 'wealth-stove',
    title: 'Kitchen as nourishment',
    problem: 'A chaotic or dirty kitchen can feel draining regardless of direction.',
    remedy:
      'Keep the stove clean and workable; clear counters; fix leaks and broken appliances. Use the space regularly with intention.',
    why: 'In many schools the kitchen anchors nourishment; practical order here supports daily rhythm and resourcefulness.',
    category: 'wealth',
  },
  {
    id: 'wealth-clutter',
    title: 'Storage and “pending” piles',
    problem: 'Overflowing storage suggests unfinished business.',
    remedy:
      'Declutter one drawer or shelf at a time. Finish or file paperwork; donate what you will not use.',
    why: 'Clear physical channels reduce background stress and make room for new projects.',
    category: 'wealth',
  },
];

export const ENTRY_QI_ITEMS: PracticalGuideItem[] = [
  {
    id: 'entry-clear',
    title: 'Clear the mouth of Qi',
    problem: 'A blocked entrance slows first impressions and daily comings and goings.',
    remedy:
      'Ensure the door opens fully (about 90°). Move shoes, bags, and bikes so nothing traps the swing. Add a mat and good light.',
    why: 'Form School prioritizes how energy and people enter and circulate; congestion at the door reads as resistance.',
    category: 'entry',
  },
  {
    id: 'entry-mirror',
    title: 'Mirror and the front door',
    problem: 'A mirror directly facing the main door is often considered to push Qi back out.',
    remedy:
      'If the mirror faces the door, angle it, move it, or replace with art that welcomes. Mirrors can still brighten side walls or hallways.',
    why: 'You want Qi to enter and settle, not bounce away in a straight line.',
    category: 'entry',
  },
  {
    id: 'entry-light',
    title: 'Brightness and welcome',
    problem: 'Dark or cluttered foyers feel unwelcoming.',
    remedy: 'Layer lighting (ambient + a brighter accent). Fresh paint or a clean door frame lifts the threshold.',
    why: 'Light and clarity at the entry set tone for the whole home.',
    category: 'entry',
  },
];

export const COMMON_ENERGY_DRAINS: PracticalGuideItem[] = [
  {
    id: 'drain-clock',
    title: 'Still or broken clocks',
    problem: 'Non-working clocks can symbolize stuck time for people sensitive to environmental cues.',
    remedy: 'Repair, replace, or remove them. Prefer one reliable clock in shared space.',
    why: 'Moving timepieces reinforce rhythm; silence or wrong time adds low-grade friction.',
    category: 'drains',
  },
  {
    id: 'drain-plants',
    title: 'Neglected or dead plants',
    problem: 'Dried plants read as depleted wood Qi.',
    remedy: 'Revive with light and water, replace, or switch to quality faux greenery if upkeep is hard.',
    why: 'Living plants signal care; decay draws attention to neglect.',
    category: 'drains',
  },
  {
    id: 'drain-shoes',
    title: 'Shoes and clutter behind the door',
    problem: 'Piles behind the door block swing and snag daily flow.',
    remedy: 'Use a slim cabinet, rack to the side, or closed storage just past the entry.',
    why: 'The door path should stay open for safety and psychological ease.',
    category: 'drains',
  },
  {
    id: 'drain-mirrors',
    title: 'Dirty mirrors',
    problem: 'Smudged glass dulls light and feels visually “foggy.”',
    remedy: 'Clean mirrors regularly; consider softer lighting to avoid harsh glare.',
    why: 'Reflection amplifies light; clarity here supports a clearer sense of space.',
    category: 'drains',
  },
  {
    id: 'drain-mail',
    title: 'Old mail and paper stacks',
    problem: 'Paper piles carry a sense of unfinished tasks.',
    remedy: 'Sort weekly: recycle, file, or act. One inbox tray beats many scattered stacks.',
    why: 'Reducing visual open loops lowers ambient stress.',
    category: 'drains',
  },
  {
    id: 'drain-bulbs',
    title: 'Burned-out bulbs',
    problem: 'Dark corners and dead fixtures feel lifeless.',
    remedy: 'Replace bulbs; add a small lamp in chronically dim zones.',
    why: 'Light supports Fire element balance and practical safety.',
    category: 'drains',
  },
  {
    id: 'drain-corners',
    title: 'Cluttered corners',
    problem: 'Corners collect dust and forgotten items; energy can feel trapped.',
    remedy: 'Vacuum corners, clear floor space, use a plant or lamp to soften a sharp stack.',
    why: 'Air and movement improve perceived spaciousness.',
    category: 'drains',
  },
];

export const MAINTENANCE_QUICK_WINS: PracticalGuideItem[] = [
  {
    id: 'maint-leaks',
    title: 'Fix drips and leaks',
    remedy: 'Repair taps and seals promptly.',
    why: 'Water should be intentional, not wasteful; leaks read as draining resources.',
    category: 'maintenance',
  },
  {
    id: 'maint-broken',
    title: 'Repair or remove broken items',
    remedy: 'Fix furniture, hinges, and handles or remove them from active use.',
    why: 'Broken objects draw attention and suggest deferred maintenance.',
    category: 'maintenance',
  },
  {
    id: 'maint-air',
    title: 'Air and scent',
    remedy: 'Open windows when possible; avoid heavy synthetic scents; address mildew.',
    why: 'Fresh air supports health and clear perception of the space.',
    category: 'maintenance',
  },
];

/** Compact lines for the Seer system prompt (topics only, not full copy). */
export const PRACTICAL_GUIDE_SLICE_BULLETS = [
  'Wealth sector care: Southeast/Xun — tidy, light, healthy plants, optional gentle moving water (clean).',
  'Entry: door opens fully; avoid mirror directly facing main door; bright welcome.',
  'Drains to watch: dead plants, broken/still clocks, burned-out bulbs, corner clutter, paper backlog, dirty mirrors, shoes blocking door.',
  'Maintenance: fix leaks, repair or remove broken goods, refresh air.',
]
  .map((line) => `- ${line}`)
  .join('\n');

export function allPracticalGuideItems(): PracticalGuideItem[] {
  return [
    ...WEALTH_AT_HOME_ITEMS,
    ...ENTRY_QI_ITEMS,
    ...COMMON_ENERGY_DRAINS,
    ...MAINTENANCE_QUICK_WINS,
  ];
}

/** Short personalized lines for Full Report / checklist (no promises). */
export function buildPersonalizedWealthLines(analysis: FengShuiAnalysis | null): string[] {
  if (!analysis?.kua) return [];
  const { favorableDirections, element } = analysis.kua;
  return [
    `Southeast (wealth sector in compass Bagua): keep it orderly, well lit, and vibrant — align with Wood element care (healthy plants, growth imagery).`,
    `Your Success direction is ${favorableDirections.success}: a clear, intentional desk or work surface there can support focus and follow-through (Eight Mansions).`,
    `Your personal element is ${element}: use ${analysis.elementAnalysis.colors.slice(0, 2).join(' and ')} accents where they feel natural to support elemental balance.`,
  ];
}

/** One-line checklist strings for the Full Report. */
export function buildPracticalChecklistForReading(analysis: FengShuiAnalysis | null): string[] {
  const lines: string[] = [
    'Entry: door swings freely; shoes and clutter off the swing path; welcoming light.',
    'Southeast sector: decluttered surfaces; healthy plants or fresh energy; no stagnant water.',
    'Replace dead plants and burned-out bulbs; repair or remove broken clocks and fixtures.',
    'Clean mirrors; reduce paper piles with a weekly sort; soften sharp corner stacks.',
    'Kitchen: clean stove, clear counters, working appliances.',
  ];
  if (analysis?.kua) {
    lines.push(
      `Sleep with head toward ${analysis.kua.favorableDirections.health} for rest alignment (Eight Mansions).`,
      `Face ${analysis.kua.favorableDirections.success} when working if layout allows.`
    );
  }
  return lines;
}
