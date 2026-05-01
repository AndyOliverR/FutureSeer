/**
 * Manual smoke (dev): POST /api/financial-astrology/comprehensive with valid userId + birthData;
 * confirm response includes analystReports, debate, posture, history when Firebase Admin is configured.
 */

jest.mock('@/lib/firebase-admin', () => ({
  isAdminAvailable: () => true,
  getDocument: jest.fn().mockResolvedValue(null),
}));

import { getDocument } from '@/lib/firebase-admin';
import { parseJsonObjectFromLLM } from '@/lib/financialAstrology/multiAgent/jsonParse';
import {
  AnalystReportSchema,
  DebateTurnSchema,
  FinancialPostureSchema,
  MultiAgentResultSchema,
  FinancialHistoryEntrySchema,
} from '@/lib/financialAstrology/multiAgent/schemas';
import { isFinancialMultiAgentEnabled } from '@/lib/financialAstrology/multiAgent/flags';
import {
  attachFinancialAstrologyHistory,
  financialAstrologyNeedsMultiAgentBackfill,
} from '@/lib/financialAstrology/historyMerge';

describe('financialAstrologyMultiAgent jsonParse', () => {
  it('parses JSON object from fenced block', () => {
    const raw = '```json\n{"a":1}\n```';
    expect(parseJsonObjectFromLLM(raw)).toEqual({ a: 1 });
  });

  it('parses bare object', () => {
    expect(parseJsonObjectFromLLM('  {"x":"y"}  ')).toEqual({ x: 'y' });
  });
});

describe('financialAstrologyMultiAgent schemas', () => {
  const analyst = {
    role: 'natalWealth' as const,
    summary: 'Natal chart shows balanced income stability.',
    signals: ['s1', 's2'],
    notableTransits: [] as string[],
    confidence: 0.7,
  };

  it('validates analyst report', () => {
    expect(AnalystReportSchema.parse(analyst)).toMatchObject({ role: 'natalWealth' });
  });

  it('validates debate turn', () => {
    const turn = {
      side: 'bull' as const,
      round: 1,
      citations: ['c1'],
      argument: 'Constructive view based on scores.',
    };
    expect(DebateTurnSchema.parse(turn)).toMatchObject({ side: 'bull' });
  });

  it('validates financial posture', () => {
    const p = {
      rating: 'steady' as const,
      executiveSummary: 'Summary line.',
      thesis: 'Thesis line one. Thesis line two.',
      timeHorizonDays: 60,
      riskBand: 'medium' as const,
    };
    expect(FinancialPostureSchema.parse(p)).toMatchObject({ rating: 'steady' });
  });

  it('validates multi-agent bundle', () => {
    const bundle = {
      analystReports: [
        analyst,
        { ...analyst, role: 'marketCycle' as const },
        { ...analyst, role: 'mundaneCollective' as const },
        { ...analyst, role: 'personalTiming' as const },
      ],
      debate: [
        { side: 'bull' as const, round: 1, citations: [] as string[], argument: 'Bull case.' },
        { side: 'bear' as const, round: 1, citations: [] as string[], argument: 'Bear case.' },
      ],
      posture: {
        rating: 'leanForward' as const,
        executiveSummary: 'Exec.',
        thesis: 'Thesis.',
        timeHorizonDays: 30,
        riskBand: 'low' as const,
      },
      generatedAt: new Date().toISOString(),
    };
    expect(() => MultiAgentResultSchema.parse(bundle)).not.toThrow();
  });

  it('validates history entry', () => {
    const h = {
      generatedAt: '2026-01-01T00:00:00.000Z',
      posture: 'steady' as const,
      executiveSummary: 'Past summary.',
    };
    expect(FinancialHistoryEntrySchema.parse(h)).toMatchObject({ posture: 'steady' });
  });
});

describe('isFinancialMultiAgentEnabled', () => {
  const prev = process.env.FINANCIAL_MULTIAGENT_ENABLED;

  afterEach(() => {
    if (prev === undefined) delete process.env.FINANCIAL_MULTIAGENT_ENABLED;
    else process.env.FINANCIAL_MULTIAGENT_ENABLED = prev;
  });

  it('is false when env is false', () => {
    process.env.FINANCIAL_MULTIAGENT_ENABLED = 'false';
    expect(isFinancialMultiAgentEnabled()).toBe(false);
  });

  it('is true when env unset', () => {
    delete process.env.FINANCIAL_MULTIAGENT_ENABLED;
    expect(isFinancialMultiAgentEnabled()).toBe(true);
  });
});

describe('attachFinancialAstrologyHistory', () => {
  beforeEach(() => {
    (getDocument as jest.Mock).mockResolvedValue(null);
  });

  it('appends history when posture present', async () => {
    const analysis = {
      generatedAt: '2026-05-01T12:00:00.000Z',
      posture: {
        rating: 'steady',
        executiveSummary: 'E',
        thesis: 'T',
        timeHorizonDays: 45,
        riskBand: 'medium',
      },
    };
    const out = await attachFinancialAstrologyHistory('uid1', analysis);
    expect(Array.isArray((out as { history: unknown }).history)).toBe(true);
    expect((out as { history: { length: number } }).history.length).toBe(1);
  });

  it('returns unchanged when no posture', async () => {
    const a = { foo: 1 };
    const out = await attachFinancialAstrologyHistory('uid1', a as Record<string, unknown>);
    expect(out).toEqual(a);
  });
});

describe('financialAstrologyNeedsMultiAgentBackfill', () => {
  it('flags a legacy-only stored report as needing backfill', () => {
    const stored = {
      comprehensiveAnalysis: {
        financialTemperamentProfile: { incomeStabilityScore: 60 },
        wealthHouses: [],
      },
    };
    expect(financialAstrologyNeedsMultiAgentBackfill(stored)).toBe(true);
  });

  it('does not flag when posture is present', () => {
    const stored = {
      comprehensiveAnalysis: {
        financialTemperamentProfile: { incomeStabilityScore: 60 },
        posture: { rating: 'steady' },
      },
    };
    expect(financialAstrologyNeedsMultiAgentBackfill(stored)).toBe(false);
  });

  it('does not flag when diagnostics already recorded (e.g. flag-disabled run)', () => {
    const stored = {
      comprehensiveAnalysis: {
        financialTemperamentProfile: { incomeStabilityScore: 60 },
        multiAgentDiagnostics: { enabled: false, attempted: false, succeeded: false },
      },
    };
    expect(financialAstrologyNeedsMultiAgentBackfill(stored)).toBe(false);
  });

  it('does not flag placeholder reports', () => {
    expect(financialAstrologyNeedsMultiAgentBackfill({ placeholder: true })).toBe(false);
  });

  it('does not flag null / non-object inputs', () => {
    expect(financialAstrologyNeedsMultiAgentBackfill(null)).toBe(false);
    expect(financialAstrologyNeedsMultiAgentBackfill(undefined)).toBe(false);
    expect(financialAstrologyNeedsMultiAgentBackfill('string')).toBe(false);
  });

  it('handles direct-shaped reports without comprehensiveAnalysis wrapper', () => {
    const stored = {
      financialTemperamentProfile: { incomeStabilityScore: 60 },
    };
    expect(financialAstrologyNeedsMultiAgentBackfill(stored)).toBe(true);
  });
});
