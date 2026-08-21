/**
 * Client-safe tool report readiness helpers.
 * Keep this module free of server-only / Firebase Admin / AI gateway imports
 * so client components (e.g. app/tools/page.tsx) can import without pulling
 * the profile generation orchestrator graph into the browser bundle.
 */

export type ReportReadinessState = 'ready' | 'pending' | 'failed' | 'placeholder';

/** Keys that do not count as report content for unlock / readiness. */
const REPORT_META_KEYS = new Set([
  'generationIdempotencyKey',
  'generatedAt',
  'updatedAt',
  '_usage',
  'usage',
  'status',
]);

/**
 * Per-tool markers that a tool page actually renders.
 * Tools without an entry use the generic substance check only.
 */
const TOOL_DISPLAY_MARKERS: Partial<Record<string, readonly string[]>> = {
  vedic: ['comprehensiveAnalysis', 'planets', 'houses', 'chart', 'lagna', 'rasiChart', 'D1', 'grahas'],
  western: ['planets', 'houses', 'chart', 'sunSign', 'ascendant', 'reading', 'signs', 'aspects', 'natal'],
  tarot: ['profileCards', 'combinedAnalysis', 'birthCard', 'cards', 'profile'],
  numerology: ['lifePathNumber', 'lifePath', 'numbers', 'reading', 'overview', 'coreNumbers', 'destinyNumber'],
  kp: ['planets', 'chart', 'cusps', 'houses', 'reading', 'subLords'],
  hellenistic: ['planets', 'chart', 'reading', 'lots', 'sect', 'sects'],
  iching: ['hexagram', 'hexagrams', 'reading', 'lines', 'primary'],
  runes: ['runes', 'drawn', 'reading', 'spread'],
  bazi: ['pillars', 'dayMaster', 'reading', 'chart', 'fourPillars'],
  humanDesign: ['type', 'profile', 'authority', 'centers', 'gates', 'reading'],
};

function isPresentMarkerValue(value: unknown): boolean {
  if (value == null || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length === 0
  ) {
    return false;
  }
  return true;
}

function nestedHasDisplayMarker(rec: Record<string, unknown>, markers: readonly string[]): boolean {
  for (const marker of markers) {
    if (isPresentMarkerValue(rec[marker])) return true;
  }
  for (const wrap of ['data', 'profile', 'chart', 'report', 'analysis'] as const) {
    const inner = rec[wrap];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const nested = inner as Record<string, unknown>;
      for (const marker of markers) {
        if (isPresentMarkerValue(nested[marker])) return true;
      }
    }
  }
  return false;
}

/**
 * True when a stored report has enough content for the tool UI (not meta-only / error shell).
 * Input-dependent baselines with requiresNextStep remain displayable by design.
 */
export function hasDisplayableReportSubstance(
  report: Record<string, unknown>,
  toolSlug?: string,
): boolean {
  if (report.baselineReady === true && report.requiresNextStep === true) return true;

  const substanceKeys = Object.keys(report).filter((key) => !REPORT_META_KEYS.has(key));
  if (substanceKeys.length === 0) return false;
  if (substanceKeys.every((key) => key === 'reason' || key === 'error' || key === 'message')) {
    return false;
  }

  if (toolSlug) {
    const markers = TOOL_DISPLAY_MARKERS[toolSlug];
    if (markers && markers.length > 0) {
      return nestedHasDisplayMarker(report, markers);
    }
  }
  return true;
}

export function classifyToolReportState(report: unknown, toolSlug?: string): ReportReadinessState {
  if (report == null) return 'pending';
  if (typeof report !== 'object') return 'ready';
  const rec = report as Record<string, unknown>;
  if (rec.status === 'failed') return 'failed';
  if (rec.placeholder === true) return 'placeholder';
  if (Object.keys(rec).length === 0) return 'pending';
  if (!hasDisplayableReportSubstance(rec, toolSlug)) return 'pending';
  return 'ready';
}

export function isReadyToolReport(report: unknown, toolSlug?: string): boolean {
  return classifyToolReportState(report, toolSlug) === 'ready';
}

/** Catalog slugs. Generate commits natal charts; other tools run on visit. */
export const ALL_TOOL_SLUGS = [
  // Highest-priority unlocks first (critical user wow path)
  'vedic',
  'western',
  'hellenistic',
  'esotericAstrology',
  'kabbalisticAstrology',
  'astrocartography',
  'psychologicalAstrology',
  'synastry',
  'financialAstrology',
  'hermeticAstrology',
  'shamanicAstrology',
  'mundaneAstrology',
  'horary',
  'medicalAstrology',
  'tarot',
  'scrying',
  'bibliomancy',
  'iching',
  'runes',
  'pendulum',
  'lenormand',
  'geomancy',
  'akashicRecords',
  'numerology',
  'angelNumbers',
  'kabbalisticNumerology',
  'nameAnalysis',
  'palmistry',
  'faceReading',
  'dreamSymbols',
  'ziweiDouShu',
  'bazi',
  'fengShui',
  'dailyDecisions',
  'kp',
  'vastu',
  'trichakra',
  'navaratna',
  'humanDesign',
  // Deferred under pressure: allow graceful fallback without blocking critical reports
  'ogham',
  'sortilege',
  'energyHealing',
] as const;

const CORE10_TOOL_SLUGS = [
  'vedic',
  'western',
  'hellenistic',
  'esotericAstrology',
  'kabbalisticAstrology',
  'astrocartography',
  'psychologicalAstrology',
  'synastry',
  'financialAstrology',
  'hermeticAstrology',
] as const;

export function getCoreToolSlugsCore10(): string[] {
  return [...CORE10_TOOL_SLUGS];
}

export function summarizeToolReadiness(
  profile: Record<string, unknown> | null | undefined,
  toolSlugs: readonly string[] = ALL_TOOL_SLUGS,
): { readyToolsCount: number; pendingToolSlugs: string[]; allReportsReady: boolean } {
  if (!profile) {
    return {
      readyToolsCount: 0,
      pendingToolSlugs: [...toolSlugs],
      allReportsReady: false,
    };
  }
  const toolReports = profile.toolReports as Record<string, { data?: unknown }> | undefined;
  let readyToolsCount = 0;
  const pendingToolSlugs: string[] = [];
  for (const slug of toolSlugs) {
    const report = profile[slug] ?? toolReports?.[slug]?.data;
    if (isReadyToolReport(report, slug)) {
      readyToolsCount += 1;
    } else {
      pendingToolSlugs.push(slug);
    }
  }
  return {
    readyToolsCount,
    pendingToolSlugs,
    allReportsReady: pendingToolSlugs.length === 0,
  };
}
