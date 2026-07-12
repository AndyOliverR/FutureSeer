import {
  buildInitialToolQueue,
  buildToolIdempotencyKey,
  isToolReportReadyForHash,
  selectIncompleteToolSlugs,
  selectRunnableToolSlugs,
  selectTerminalFailedToolSlugs,
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

  it('keeps backoff-blocked tools incomplete instead of treating the queue as drained', () => {
    const profileHash = 'h1';
    const now = Date.now();
    const queue = buildInitialToolQueue({}, profileHash, now);
    queue.western = {
      ...queue.western,
      status: 'pending',
      attempts: 1,
      nextRetryAt: now + 60_000,
    };

    expect(selectRunnableToolSlugs(queue, {}, profileHash, now)).not.toContain('western');
    expect(selectIncompleteToolSlugs({}, profileHash)).toContain('western');
  });

  it('identifies terminal failed tools as incomplete so they cannot finalize as completed', () => {
    const profileHash = 'h1';
    const queue = buildInitialToolQueue({}, profileHash);
    queue.tarot = {
      ...queue.tarot,
      status: 'failed',
      attempts: queue.tarot.maxAttempts,
      nextRetryAt: null,
    };

    expect(selectRunnableToolSlugs(queue, {}, profileHash)).not.toContain('tarot');
    expect(selectTerminalFailedToolSlugs(queue, {}, profileHash)).toContain('tarot');
    expect(selectIncompleteToolSlugs({}, profileHash)).toContain('tarot');
  });
});
