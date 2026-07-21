import {
  completeTerminalFailureSummaries,
  extractFailedToolSummaries,
  formatPartialGenerationHeadline,
  resolveTerminalGenerationFailureState,
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

describe('resolveTerminalGenerationFailureState', () => {
  it('keeps transient failures pending while generation is running', () => {
    expect(
      resolveTerminalGenerationFailureState({
        profileStatus: 'running',
        pendingToolSlugs: ['tarot', 'runes'],
        failedToolSlugs: ['runes'],
      }),
    ).toEqual({
      isTerminalFailure: false,
      activePendingToolSlugs: ['tarot', 'runes'],
      terminalFailedToolSlugs: [],
    });
  });

  it.each(['completed', 'failed'])(
    'separates failed tools from active work after the pipeline is %s',
    (profileStatus) => {
      expect(
        resolveTerminalGenerationFailureState({
          profileStatus,
          pendingToolSlugs: ['tarot', 'runes'],
          failedToolSlugs: ['runes'],
        }),
      ).toEqual({
        isTerminalFailure: true,
        activePendingToolSlugs: [],
        terminalFailedToolSlugs: ['runes', 'tarot'],
      });
    },
  );

  it('recognizes false completion when pending reports have lost their failure payloads', () => {
    expect(
      resolveTerminalGenerationFailureState({
        profileStatus: 'completed',
        pendingToolSlugs: ['faceReading'],
        failedToolSlugs: [],
      }),
    ).toEqual({
      isTerminalFailure: true,
      activePendingToolSlugs: [],
      terminalFailedToolSlugs: ['faceReading'],
    });
  });

  it('does not trust stale completed profile state while tool retries remain', () => {
    expect(
      resolveTerminalGenerationFailureState({
        profileStatus: 'completed',
        pendingToolSlugs: ['runes'],
        failedToolSlugs: ['runes'],
        toolTasks: {
          runes: { status: 'failed', attempts: 1, maxAttempts: 3 },
        },
      }),
    ).toEqual({
      isTerminalFailure: false,
      activePendingToolSlugs: ['runes'],
      terminalFailedToolSlugs: [],
    });
  });
});

describe('completeTerminalFailureSummaries', () => {
  it('preserves known errors and labels terminal slugs with missing payloads', () => {
    expect(
      completeTerminalFailureSummaries(
        [{ slug: 'runes', label: 'Runes', error: 'Timeout' }],
        ['runes', 'faceReading'],
      ),
    ).toEqual([
      { slug: 'runes', label: 'Runes', error: 'Timeout' },
      { slug: 'faceReading', label: 'Face Reading', error: null },
    ]);
  });
});
