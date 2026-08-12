/**
 * Energy-healing analysis must not be an unauthenticated paid proxy (Groq).
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockRunEnergyHealingAnalysis = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/energyHealing/runEnergyHealingAnalysis', () => ({
  runEnergyHealingAnalysis: (...args: unknown[]) => mockRunEnergyHealingAnalysis(...args),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

// Import after mocks
import { POST } from '@/app/api/tools/energy-healing/analysis/route';

describe('POST /api/tools/energy-healing/analysis auth', () => {
  const originalGroq = process.env.GROQ_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-groq-key';
    mockRunEnergyHealingAnalysis.mockResolvedValue({
      data: {
        overallBalance: 70,
        recommendations: ['Grounding'],
      },
      degraded: false,
      source: 'llm',
    });
  });

  afterAll(() => {
    if (originalGroq === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalGroq;
  });

  it('rejects missing Authorization without calling Groq', async () => {
    const req = new NextRequest('http://localhost/api/tools/energy-healing/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'chakra',
        userProfile: { birthDate: '1990-01-01', birthPlace: 'Mumbai' },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRunEnergyHealingAnalysis).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token without calling Groq', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/tools/energy-healing/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify({
        method: 'aura',
        userProfile: { birthDate: '1990-01-01', birthPlace: 'Mumbai' },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRunEnergyHealingAnalysis).not.toHaveBeenCalled();
  });

  it('rejects missing method without calling Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/tools/energy-healing/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        userProfile: { birthDate: '1990-01-01', birthPlace: 'Mumbai' },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockRunEnergyHealingAnalysis).not.toHaveBeenCalled();
  });

  it('allows owned auth and runs energy healing analysis', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });

    const req = new NextRequest('http://localhost/api/tools/energy-healing/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        method: 'crystal',
        userProfile: { birthDate: '1990-01-01', birthPlace: 'Mumbai' },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.overallBalance).toBe(70);
    expect(mockRunEnergyHealingAnalysis).toHaveBeenCalledTimes(1);
    expect(mockRunEnergyHealingAnalysis).toHaveBeenCalledWith({
      method: 'crystal',
      userProfile: { birthDate: '1990-01-01', birthPlace: 'Mumbai' },
      question: undefined,
    });
  });
});
