import {
  extractFailedToolSummaries,
  formatPartialGenerationHeadline,
} from '@/lib/generationFailureUx';
import { humanizePipelineSlug } from '@/lib/toolSlugLabels';

describe('humanizePipelineSlug', () => {
  it('splits camelCase pipeline slugs', () => {
    expect(humanizePipelineSlug('esotericAstrology')).toBe('Esoteric Astrology');
    expect(humanizePipelineSlug('vedic')).toBe('Vedic');
  });
});

describe('extractFailedToolSummaries', () => {
  it('returns failed tools from toolStatus map', () => {
    const profile = {
      toolStatus: {
        tarot: { state: 'ready' },
        runes: { state: 'failed', error: 'Timeout' },
      },
      runes: { status: 'failed', error: 'Timeout' },
    };
    const failed = extractFailedToolSummaries(profile);
    expect(failed.map((f) => f.slug)).toEqual(['runes']);
    expect(failed[0].label).toBe('Runes');
    expect(failed[0].error).toBe('Timeout');
  });

  it('ignores pending tools', () => {
    const profile = {
      toolStatus: {
        iching: { state: 'pending' },
      },
    };
    expect(extractFailedToolSummaries(profile)).toEqual([]);
  });
});

describe('formatPartialGenerationHeadline', () => {
  it('pluralizes failed count', () => {
    expect(formatPartialGenerationHeadline(1)).toBe('One report did not finish');
    expect(formatPartialGenerationHeadline(3)).toBe('3 reports did not finish');
  });
});
