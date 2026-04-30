/**
 * Integration-style unit tests for report readiness contract.
 * @jest-environment node
 */

import {
  classifyToolReportState,
  isReadyToolReport,
  summarizeToolReadiness,
  ALL_TOOL_SLUGS,
} from '@/lib/profileGenerationOrchestrator';

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

  it('summarizes pending slugs and ready count', () => {
    const profile = {
      vedic: { reading: 'ready' },
      western: { placeholder: true },
      toolReports: {
        numerology: { data: { status: 'failed', error: 'bad' } },
      },
    } as Record<string, unknown>;
    const summary = summarizeToolReadiness(profile, ALL_TOOL_SLUGS);
    expect(summary.readyToolsCount).toBe(1);
    expect(summary.pendingToolSlugs).toContain('western');
    expect(summary.pendingToolSlugs).toContain('numerology');
    expect(summary.allReportsReady).toBe(false);
  });
});
