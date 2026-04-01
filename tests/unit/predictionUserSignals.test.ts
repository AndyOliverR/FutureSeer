/**
 * @jest-environment node
 */
jest.mock('@/lib/firebase', () => ({
  getUserActivity: jest.fn(),
}));

import { getUserActivity } from '@/lib/firebase';
import { buildMarkovUserBehaviorSignals } from '@/lib/predictionUserSignals';
import { normalizeMarkovProbabilityMap } from '@/lib/predictiveAlgorithms';

describe('normalizeMarkovProbabilityMap', () => {
  it('scales positive masses so values sum to 1', () => {
    const input = new Map([
      ['a', 0.2],
      ['b', 0.8],
    ]);
    const out = normalizeMarkovProbabilityMap(input);
    let sum = 0;
    out.forEach((v) => {
      sum += v;
    });
    expect(sum).toBeCloseTo(1);
    expect(out.get('a')).toBeCloseTo(0.2);
    expect(out.get('b')).toBeCloseTo(0.8);
  });

  it('uses uniform distribution when total mass is zero but states exist', () => {
    const input = new Map([
      ['x', 0],
      ['y', 0],
    ]);
    const out = normalizeMarkovProbabilityMap(input);
    expect(out.get('x')).toBeCloseTo(0.5);
    expect(out.get('y')).toBeCloseTo(0.5);
  });

  it('returns an empty map when input has no keys', () => {
    const out = normalizeMarkovProbabilityMap(new Map());
    expect(out.size).toBe(0);
  });
});

describe('buildMarkovUserBehaviorSignals', () => {
  beforeEach(() => {
    (getUserActivity as jest.Mock).mockResolvedValue([]);
  });

  it('includes theme and keyword-derived focus tokens', async () => {
    const tokens = await buildMarkovUserBehaviorSignals({
      userId: 'test-uid',
      question: 'When will my career improve and love life stabilize?',
      questionType: 'career',
    });
    expect(tokens).toContain('theme:career');
    expect(tokens).toContain('focus:career');
    expect(tokens).toContain('focus:relationship');
  });

  it('adds recent_tool tokens from Firestore activity slugs', async () => {
    (getUserActivity as jest.Mock).mockResolvedValue([
      { toolSlug: 'tarot' },
      { type: 'tool:vedic' },
    ]);
    const tokens = await buildMarkovUserBehaviorSignals({
      userId: 'test-uid',
      question: 'General guidance please',
      questionType: 'general',
    });
    expect(tokens).toContain('theme:general');
    expect(tokens).toContain('recent_tool:tarot');
    expect(tokens).toContain('recent_tool:vedic');
  });

  it('adds session thread hints from recent exchanges', async () => {
    const tokens = await buildMarkovUserBehaviorSignals({
      userId: 'test-uid',
      question: 'Follow up on that',
      questionType: 'general',
      recentExchanges: [{ question: 'Career and marriage timing last week' }],
    });
    expect(tokens.some((t) => t.startsWith('session:'))).toBe(true);
  });
});
