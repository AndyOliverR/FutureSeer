import {
  buildInitialToolQueue,
  buildToolIdempotencyKey,
  isToolReportReadyForHash,
  selectRunnableToolSlugs,
} from '@/lib/mysticalStageBQueuePure';
import { toolReportsFromComprehensiveProfile } from '@/lib/profileGenerationOrchestrator';

describe('mysticalStageBQueue', () => {
  it('buildToolIdempotencyKey combines profile hash and slug', () => {
    expect(buildToolIdempotencyKey('hash123', 'vedic')).toBe('hash123:vedic');
  });

  it('isToolReportReadyForHash requires matching idempotency key', () => {
    const report = { generationIdempotencyKey: 'abc', planets: [] };
    expect(isToolReportReadyForHash(report, 'abc')).toBe(true);
    expect(isToolReportReadyForHash(report, 'other')).toBe(false);
  });

  it('selectRunnableToolSlugs skips ready tasks and respects backoff', () => {
    const profileHash = 'h1';
    const queue = buildInitialToolQueue(
      {
        vedic: { generationIdempotencyKey: profileHash, planets: [{ name: 'Sun' }] },
      },
      profileHash,
    );
    queue.vedic.status = 'ready';
    queue.western = {
      ...queue.western,
      status: 'pending',
      nextRetryAt: Date.now() + 60_000,
    };
    const runnable = selectRunnableToolSlugs(queue, {}, profileHash);
    expect(runnable).not.toContain('vedic');
    expect(runnable).not.toContain('western');
    expect(runnable.length).toBeGreaterThan(0);
  });
});

describe('toolReportsFromComprehensiveProfile', () => {
  it('reads ready tools from top-level profile fields', () => {
    const reports = toolReportsFromComprehensiveProfile({
      vedic: { generationIdempotencyKey: 'h1', planets: [{ name: 'Sun' }] },
    });
    expect(reports.vedic?.status).toBe('success');
    expect(reports.vedic?.data).toMatchObject({ planets: [{ name: 'Sun' }] });
  });

  it('reads ready tools stored only under profile.toolReports', () => {
    const reports = toolReportsFromComprehensiveProfile({
      toolReports: {
        tarot: {
          status: 'success',
          generatedAt: '2026-01-01T00:00:00.000Z',
          data: { cards: ['The Fool'] },
        },
      },
    });
    expect(reports.tarot?.status).toBe('success');
    expect(reports.tarot?.data).toMatchObject({ cards: ['The Fool'] });
    expect(reports.tarot?.generatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
