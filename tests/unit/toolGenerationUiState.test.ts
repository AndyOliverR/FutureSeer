import {
  TOOLS_GENERATION_RESUME_POLL_MS,
  isReportGenerationActive,
  resolveReportGenerationState,
  shouldPollGeneration,
} from '@/lib/toolsGenerationState';
import {
  buildToolSlugByPath,
  toolSlugForPath,
} from '@/lib/report-viral/toolSlugToPath';

describe('tools generation UI state', () => {
  it('resolves route paths back to canonical pipeline slugs', () => {
    const byPath = buildToolSlugByPath(['western', 'humanDesign', 'kp', 'hellenistic']);

    expect(toolSlugForPath('western-astrology', byPath)).toBe('western');
    expect(toolSlugForPath('human-design', byPath)).toBe('humanDesign');
    expect(toolSlugForPath('kp-astrology', byPath)).toBe('kp');
    expect(toolSlugForPath('hellenistic-astrology', byPath)).toBe('hellenistic');
  });

  it('treats only pending or running reports as active generation', () => {
    expect(isReportGenerationActive('pending')).toBe(true);
    expect(isReportGenerationActive('running')).toBe(true);
    expect(isReportGenerationActive(undefined)).toBe(true);
    expect(isReportGenerationActive('ready')).toBe(false);
    expect(isReportGenerationActive('failed')).toBe(false);
    expect(isReportGenerationActive('placeholder')).toBe(false);
  });

  it('keeps a retrying queue task active after a report attempt fails', () => {
    expect(resolveReportGenerationState('pending', 'failed')).toBe('pending');
    expect(resolveReportGenerationState('failed', 'failed')).toBe('failed');
  });

  it('checks stalled generation often enough for responsive recovery', () => {
    expect(TOOLS_GENERATION_RESUME_POLL_MS).toBe(15_000);
  });

  it('polls immediately after redirect before the user profile refreshes', () => {
    expect(shouldPollGeneration(true, false)).toBe(true);
    expect(shouldPollGeneration(false, true)).toBe(true);
    expect(shouldPollGeneration(false, false)).toBe(false);
  });
});
