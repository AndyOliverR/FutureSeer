/**
 * @jest-environment node
 */

import { generateHumanDesignReport } from '@/lib/humanDesign/humanDesignReportGenerator';

const mockCreateAICompletion = jest.fn();

jest.mock('@/lib/aiGateway', () => ({
  createAICompletion: (...args: unknown[]) => mockCreateAICompletion(...args),
}));

describe('Human Design report generator provider path', () => {
  let consoleErrorSpy: jest.SpyInstance;

  const chart = {
    type: { id: 'manifestor', name: 'Manifestor', description: 'Initiates', notSelfTheme: 'Anger', strategy: 'Inform' },
    strategy: 'Inform',
    authority: { id: 'emotional', name: 'Emotional Authority', description: 'Wait for clarity' },
    profile: { id: '1/3', name: '1/3', description: 'Investigator/Martyr', role: 'Investigate and test' },
    centers: {
      defined: ['g'],
      undefined: ['sacral'],
      details: {
        g: { name: 'G Center', description: 'Identity center' },
        sacral: { name: 'Sacral', description: 'Work force center' },
      },
    },
    gates: [{ gate: 1, planet: 'Sun' }],
    channels: [{ name: '1-8', description: 'Inspiration channel' }],
    incarnationCross: { name: 'Right Angle Cross', description: 'Purpose path', sunGate: 1, earthGate: 2 },
    definition: { type: 'Single Definition', description: 'Consistent processing' },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('uses aiGateway completion and does not call /api/openai fetch', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch' as never).mockImplementation((() => {
      throw new Error('fetch should not be called');
    }) as never);
    mockCreateAICompletion.mockResolvedValue({
      content: 'overview: You are aligned.\nkey insights: Trust your strategy',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    });

    const report = await generateHumanDesignReport(chart, {
      uid: 'u1',
      fullName: 'Test User',
    } as any);

    expect(mockCreateAICompletion).toHaveBeenCalled();
    expect(report.overview.summary.length).toBeGreaterThan(0);
    fetchSpy.mockRestore();
  });

  it('returns fallback structured report when provider call fails', async () => {
    mockCreateAICompletion.mockRejectedValue(new Error('provider down'));
    const report = await generateHumanDesignReport(chart, { uid: 'u2' } as any);
    expect(report.type.strategy).toBe('Inform');
    expect(report.overview.keyInsights.length).toBeGreaterThan(0);
  });
});

