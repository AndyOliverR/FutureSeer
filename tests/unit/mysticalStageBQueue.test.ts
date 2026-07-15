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
