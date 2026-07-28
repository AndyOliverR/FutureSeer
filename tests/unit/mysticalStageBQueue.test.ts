import {
  buildInitialToolQueue,
  buildToolIdempotencyKey,
  isToolReportReadyForHash,
  selectIncompleteToolSlugs,
  selectRunnableToolSlugs,
  selectTerminalFailedToolSlugs,
  soonestToolRetryAt,
  TOOL_QUEUE_MAX_ATTEMPTS,
} from '@/lib/mysticalStageBQueuePure';
import { toolReportsFromComprehensiveProfile } from '@/lib/profileGenerationOrchestrator';

describe('mysticalStageBQueue', () => {
  it('buildToolIdempotencyKey combines profile hash and slug', () => {
    expect(buildToolIdempotencyKey('hash123', 'vedic')).toBe('hash123:vedic');
  });

  it('isToolReportReadyForHash requires matching idempotency key', () => {
    const report = { generationIdempotencyKey: 'abc', planets: [{ name: 'Sun' }] };
    expect(isToolReportReadyForHash(report, 'abc', 'vedic')).toBe(true);
    expect(isToolReportReadyForHash(report, 'other', 'vedic')).toBe(false);
  });

  it('selectRunnableToolSlugs skips ready tasks and respects backoff', () => {
    const profileHash = 'h1';
    const profile = {
      vedic: { generationIdempotencyKey: profileHash, planets: [{ name: 'Sun' }] },
    };
    const queue = buildInitialToolQueue(profile, profileHash);
    queue.vedic.status = 'ready';
    queue.western = {
      ...queue.western,
      status: 'pending',
      nextRetryAt: Date.now() + 60_000,
    };
    const runnable = selectRunnableToolSlugs(queue, profile, profileHash);
    expect(runnable).not.toContain('vedic');
    expect(runnable).not.toContain('western');
    expect(runnable.length).toBeGreaterThan(0);
  });

  it('re-queues task marked ready when stored report is not displayable', () => {
    const profileHash = 'h1';
    const profile = {
      vedic: { generationIdempotencyKey: profileHash, note: 'thin shell' },
    };
    const queue = buildInitialToolQueue(profile, profileHash);
    queue.vedic.status = 'ready';
    const runnable = selectRunnableToolSlugs(queue, profile, profileHash);
    expect(runnable).toContain('vedic');
  });

  it('does not treat terminal-failed tools as runnable (empty runnable ≠ drained)', () => {
    const profileHash = 'h1';
    const profile = {
      vedic: { generationIdempotencyKey: profileHash, planets: [{ name: 'Sun' }] },
    };
    const queue = buildInitialToolQueue(profile, profileHash);
    for (const slug of Object.keys(queue)) {
      if (slug === 'vedic') {
        queue[slug].status = 'ready';
        continue;
      }
      queue[slug] = {
        ...queue[slug],
        status: 'failed',
        attempts: TOOL_QUEUE_MAX_ATTEMPTS,
        nextRetryAt: null,
      };
    }

    const runnable = selectRunnableToolSlugs(queue, profile, profileHash);
    const incomplete = selectIncompleteToolSlugs(queue, profile, profileHash);
    const terminalFailed = selectTerminalFailedToolSlugs(queue, profile, profileHash);

    expect(runnable).toEqual([]);
    expect(incomplete).toEqual([]);
    expect(terminalFailed.length).toBeGreaterThan(0);
    expect(terminalFailed).not.toContain('vedic');
    // Bug trigger: old code finalized when runnable.length === 0 even with terminal failures.
    expect(runnable.length === 0 && terminalFailed.length > 0).toBe(true);
  });

  it('keeps backoff-blocked tools in incomplete even when none are runnable', () => {
    const profileHash = 'h1';
    const now = Date.now();
    const profile = {
      vedic: { generationIdempotencyKey: profileHash, planets: [{ name: 'Sun' }] },
    };
    const queue = buildInitialToolQueue(profile, profileHash, now);
    for (const slug of Object.keys(queue)) {
      if (slug === 'vedic') {
        queue[slug].status = 'ready';
        continue;
      }
      queue[slug] = {
        ...queue[slug],
        status: 'pending',
        attempts: 1,
        nextRetryAt: now + 30_000,
      };
    }

    const runnable = selectRunnableToolSlugs(queue, profile, profileHash, now);
    const incomplete = selectIncompleteToolSlugs(queue, profile, profileHash);
    const soonest = soonestToolRetryAt(queue, incomplete, now);

    expect(runnable).toEqual([]);
    expect(incomplete.length).toBeGreaterThan(0);
    expect(soonest).toBe(now + 30_000);
  });

  it('buildInitialToolQueue resets terminal failures when report is missing', () => {
    const profileHash = 'h1';
    const profile = {
      vedic: { generationIdempotencyKey: profileHash, planets: [{ name: 'Sun' }] },
    };
    const rebuilt = buildInitialToolQueue(profile, profileHash);
    expect(rebuilt.vedic.status).toBe('ready');
    expect(rebuilt.western.status).toBe('pending');
    expect(rebuilt.western.attempts).toBe(0);
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
