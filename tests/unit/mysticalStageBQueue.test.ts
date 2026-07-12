import {
  buildInitialToolQueue,
  buildToolIdempotencyKey,
  isToolReportReadyForHash,
  selectRunnableToolSlugs,
} from '@/lib/mysticalStageBQueuePure';

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
