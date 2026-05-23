/**
 * @jest-environment node
 */

import {
  allocateTokenBudget,
  estimateTokens,
  truncateToTokenBudget,
} from '@/lib/aiTokenBudget';

describe('aiTokenBudget', () => {
  it('estimateTokens uses chars/4 ceiling', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcde')).toBe(2);
  });

  it('truncateToTokenBudget caps text', () => {
    const long = 'x'.repeat(100);
    const { text, truncated } = truncateToTokenBudget(long, 5);
    expect(truncated).toBe(true);
    expect(text.length).toBeLessThan(long.length);
    expect(text).toContain('truncated');
  });

  it('allocateTokenBudget keeps high-priority chunks first', () => {
    const result = allocateTokenBudget(
      [
        { id: 'low', priority: 10, text: 'y'.repeat(400) },
        { id: 'high', priority: 0, text: 'important chart data' },
      ],
      10,
    );
    expect(result.chunks.some((c) => c.id === 'high')).toBe(true);
    const lowKept = result.chunks.find((c) => c.id === 'low');
    expect(lowKept === undefined || lowKept.truncated).toBe(true);
  });

  it('allocateTokenBudget truncates priority-0 instead of dropping', () => {
    const result = allocateTokenBudget(
      [{ id: 'must', priority: 0, text: 'z'.repeat(10_000) }],
      20,
    );
    expect(result.chunks).toHaveLength(1);
    expect(result.chunks[0]?.truncated).toBe(true);
    expect(result.droppedIds).toHaveLength(0);
  });
});
