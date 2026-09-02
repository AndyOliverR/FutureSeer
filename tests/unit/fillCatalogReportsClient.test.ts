/**
 * @jest-environment node
 */

import { fillRemainingCatalogReports } from '@/lib/fillCatalogReportsClient';
import { selectRunnableCatalogSlugs } from '@/lib/catalogBatchSelection';

describe('selectRunnableCatalogSlugs', () => {
  it('skips slugs that already failed three times', () => {
    const { batch, exhausted } = selectRunnableCatalogSlugs(
      ['hellenistic', 'tarot', 'numerology'],
      {
        hellenistic: { state: 'failed', attempts: 3 },
      },
      2,
    );
    expect(exhausted).toEqual(['hellenistic']);
    expect(batch).toEqual(['tarot', 'numerology']);
  });
});

describe('fillRemainingCatalogReports', () => {
  it('retries a 500 then succeeds', async () => {
    let calls = 0;
    const fetchImpl = jest.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return new Response(JSON.stringify({ error: 'temporary' }), { status: 500 });
      }
      return new Response(
        JSON.stringify({
          allReportsReady: true,
          catalogFillComplete: true,
          readyToolsCount: 42,
          totalTools: 42,
          pendingToolSlugs: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    const progress: Array<{ readyToolsCount: number }> = [];
    const result = await fillRemainingCatalogReports({
      getToken: async () => 'token',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: async () => undefined,
      onProgress: (p) => progress.push(p),
    });
    expect(calls).toBe(2);
    expect(result.allReportsReady).toBe(true);
    expect(progress[0]?.readyToolsCount).toBe(42);
  });

  it('waits on 429 then continues', async () => {
    let calls = 0;
    const fetchImpl = jest.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return new Response(JSON.stringify({ error: 'slow down', retryAfter: 1 }), {
          status: 429,
          headers: { 'Retry-After': '1' },
        });
      }
      return new Response(
        JSON.stringify({
          allReportsReady: true,
          catalogFillComplete: true,
          readyToolsCount: 42,
          totalTools: 42,
          pendingToolSlugs: [],
        }),
        { status: 200 },
      );
    });
    const result = await fillRemainingCatalogReports({
      getToken: async () => 'token',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: async () => undefined,
    });
    expect(calls).toBe(2);
    expect(result.catalogFillComplete).toBe(true);
  });
});
