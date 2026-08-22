/**
 * Integration-style unit tests for report readiness contract.
 * @jest-environment node
 */

import {
  classifyToolReportState,
  isCurrentReadyToolReport,
  isReadyToolReport,
  reportMatchesProfileHash,
  summarizeToolReadiness,
  ALL_TOOL_SLUGS,
} from '@/lib/toolReportReadiness';

describe('Report readiness contract', () => {
  it('classifies placeholder and failed states correctly', () => {
    expect(classifyToolReportState({ placeholder: true })).toBe('placeholder');
    expect(classifyToolReportState({ placeholder: true, pending: true })).toBe('placeholder');
    expect(classifyToolReportState({ status: 'failed', error: 'x' })).toBe('failed');
    expect(classifyToolReportState({})).toBe('pending');
    expect(classifyToolReportState({ reading: 'ok' })).toBe('ready');
    expect(isReadyToolReport({ reading: 'ok' })).toBe(true);
    expect(isReadyToolReport({ placeholder: true })).toBe(false);
  });

  it('treats a mismatched generationIdempotencyKey as stale but keeps unkeyed legacy reports', () => {
    expect(reportMatchesProfileHash({ planets: [{ name: 'Sun' }] }, 'hash-new')).toBe(true);
    expect(
      reportMatchesProfileHash(
        { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'hash-new' },
        'hash-new',
      ),
    ).toBe(true);
    expect(
      reportMatchesProfileHash(
        { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'hash-old' },
        'hash-new',
      ),
    ).toBe(false);
    expect(isCurrentReadyToolReport({ planets: [{ name: 'Sun' }] }, 'hash-new', 'vedic')).toBe(true);
    expect(
      isCurrentReadyToolReport(
        { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'hash-old' },
        'hash-new',
        'vedic',
      ),
    ).toBe(false);
  });

  it('rejects meta-only and reason-only shells as pending', () => {
    expect(
      classifyToolReportState({
        generationIdempotencyKey: 'abc',
        generatedAt: '2026-01-01',
      }),
    ).toBe('pending');
    expect(classifyToolReportState({ reason: 'unavailable' })).toBe('pending');
    expect(classifyToolReportState({ error: 'boom', message: 'x' })).toBe('pending');
  });

  it('requires display markers for core tools (vedic / tarot / western)', () => {
    expect(classifyToolReportState({ note: 'thin shell' }, 'vedic')).toBe('pending');
    expect(classifyToolReportState({ planets: [{ name: 'Sun' }] }, 'vedic')).toBe('ready');
    expect(
      classifyToolReportState({ comprehensiveAnalysis: { overview: 'ok' } }, 'vedic'),
    ).toBe('ready');
    expect(classifyToolReportState({ note: 'thin' }, 'tarot')).toBe('pending');
    expect(classifyToolReportState({ profile: { birthCard: { name: 'Fool' } } }, 'tarot')).toBe(
      'ready',
    );
    expect(classifyToolReportState({ sunSign: 'Aries' }, 'western')).toBe('ready');
  });

  it('summarizes pending slugs and ready count', () => {
    const profile = {
      vedic: { reading: 'ready' },
      western: { placeholder: true },
      toolReports: {
        numerology: { data: { status: 'failed', error: 'bad' } },
      },
    } as Record<string, unknown>;
    const summary = summarizeToolReadiness(profile, ALL_TOOL_SLUGS);
    // vedic with only `reading` fails vedic display markers → pending
    expect(summary.readyToolsCount).toBe(0);
    expect(summary.pendingToolSlugs).toContain('vedic');
    expect(summary.pendingToolSlugs).toContain('western');
    expect(summary.pendingToolSlugs).toContain('numerology');
    expect(summary.allReportsReady).toBe(false);
  });

  it('treats top-level ready report as ready even when legacy toolReports fallback is pending', () => {
    const profile = {
      western: { planets: [{ name: 'Sun' }] },
      toolReports: {
        western: { data: { placeholder: true } },
      },
    } as Record<string, unknown>;
    const summary = summarizeToolReadiness(profile, ALL_TOOL_SLUGS);
    expect(summary.pendingToolSlugs).not.toContain('western');
    expect(summary.readyToolsCount).toBeGreaterThanOrEqual(1);
  });

  it('treats baseline input-dependent payloads as ready (not placeholder)', () => {
    const profile = {
      synastry: { baselineReady: true, requiresNextStep: true, reading: 'ready' },
      horary: { baselineReady: true, requiresNextStep: true, reading: 'ready' },
      angelNumbers: { baselineReady: true, requiresNextStep: true, reading: 'ready' },
      kabbalisticNumerology: { baselineReady: true, requiresNextStep: true, overview: 'ready' },
      nameAnalysis: { baselineReady: true, requiresNextStep: true, analysis: { primaryTheme: 'identity' } },
      vastu: { baselineReady: true, requiresNextStep: true, reading: 'ready' },
    } as Record<string, unknown>;
    const summary = summarizeToolReadiness(profile, ALL_TOOL_SLUGS);
    expect(summary.pendingToolSlugs).not.toContain('synastry');
    expect(summary.pendingToolSlugs).not.toContain('horary');
    expect(summary.pendingToolSlugs).not.toContain('angelNumbers');
    expect(summary.pendingToolSlugs).not.toContain('kabbalisticNumerology');
    expect(summary.pendingToolSlugs).not.toContain('nameAnalysis');
    expect(summary.pendingToolSlugs).not.toContain('vastu');
  });
});
