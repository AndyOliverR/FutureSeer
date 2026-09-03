/**
 * Integration-style unit tests for report readiness contract.
 * @jest-environment node
 */

import {
  classifyToolReportState,
  isReadyToolReport,
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

  it('treats generationIdempotencyKey mismatches as pending when a current hash is given', () => {
    const profile = {
      vedic: { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'hash-new' },
      western: { planets: [{ name: 'Moon' }], generationIdempotencyKey: 'hash-old' },
      tarot: { profile: { birthCard: { name: 'The Fool' } } },
    } as Record<string, unknown>;
    const summary = summarizeToolReadiness(profile, ALL_TOOL_SLUGS, 'hash-new');
    expect(summary.pendingToolSlugs).not.toContain('vedic');
    expect(summary.pendingToolSlugs).toContain('western');
    expect(summary.pendingToolSlugs).not.toContain('tarot');
    expect(summary.allReportsReady).toBe(false);
  });

  it('does not treat missing keys as stale when summarizing for a current hash', () => {
    const slugs = ['dreamSymbols', 'ogham'] as const;
    const keyed = {
      dreamSymbols: { reading: 'ok', generationIdempotencyKey: 'hash-1' },
      ogham: { reading: 'ok', generationIdempotencyKey: 'hash-1' },
    };
    const unkeyed = {
      dreamSymbols: { reading: 'ok' },
      ogham: { reading: 'ok' },
    };
    expect(summarizeToolReadiness(keyed, slugs, 'hash-1').allReportsReady).toBe(true);
    expect(summarizeToolReadiness(unkeyed, slugs, 'hash-1').allReportsReady).toBe(true);
    expect(summarizeToolReadiness(keyed, slugs, 'hash-2').allReportsReady).toBe(false);
  });
});
