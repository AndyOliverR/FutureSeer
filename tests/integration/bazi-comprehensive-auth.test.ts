/**
 * BaZi comprehensive must not be an unauthenticated paid proxy (4× Groq)
 * and must not allow Admin cache IDOR via body userId.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockCallTextAI = jest.fn();
const mockGetFirebaseDB = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/aiStructuredOutput', () => ({
  callTextAI: (...args: unknown[]) => mockCallTextAI(...args),
}));

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: () => mockGetFirebaseDB(),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

// Import after mocks
import { POST } from '@/app/api/bazi/comprehensive/route';

const pillar = {
  heavenlyStem: { name: 'Jia', element: 'Wood' },
  earthlyBranch: { name: 'Zi', element: 'Water' },
};

const sampleReading = {
  dayMaster: { name: 'Jia', element: 'Wood', yinYang: 'Yang' },
  chart: {
    yearPillar: pillar,
    monthPillar: pillar,
    dayPillar: pillar,
    hourPillar: pillar,
    dayMaster: { name: 'Jia', element: 'Wood' },
  },
  elements: { wood: 30, fire: 20, earth: 15, metal: 20, water: 15 },
  luckCycles: [
    { element: 'Fire', animal: 'Horse', startAge: 20, endAge: 30 },
    { element: 'Earth', animal: 'Goat', startAge: 30, endAge: 40 },
    { element: 'Metal', animal: 'Monkey', startAge: 40, endAge: 50 },
  ],
  personality: { strengths: ['focus'] },
  career: { suitablePaths: ['engineering'] },
  wealth: { wealthPattern: 'steady' },
  favorable: {
    elements: ['Water'],
    colors: ['black'],
    directions: ['north'],
  },
};

function makeBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    reading: sampleReading,
    userProfile: { birthDate: '1990-01-01', birthTime: '12:00', displayName: 'Seeker' },
    ...overrides,
  };
}

describe('POST /api/bazi/comprehensive auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFirebaseDB.mockReturnValue(null);
    mockCallTextAI.mockResolvedValue({
      content: 'Generated BaZi insight.',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    });
  });

  it('rejects missing Authorization without calling Groq or reading cache', async () => {
    const req = new NextRequest('http://localhost/api/bazi/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeBody()),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockCallTextAI).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
    expect(mockGetFirebaseDB).not.toHaveBeenCalled();
  });

  it('rejects invalid token without calling Groq', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/bazi/comprehensive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify(makeBody()),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockCallTextAI).not.toHaveBeenCalled();
    expect(mockGetFirebaseDB).not.toHaveBeenCalled();
  });

  it('rejects userId mismatch (cache IDOR) without calling Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/bazi/comprehensive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeBody({ userId: 'victim-uid' })),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockCallTextAI).not.toHaveBeenCalled();
    expect(mockGetFirebaseDB).not.toHaveBeenCalled();
  });

  it('allows owned auth and generates comprehensive analysis', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/bazi/comprehensive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeBody()),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.chartOverview).toContain('Generated BaZi insight');
    expect(mockCallTextAI).toHaveBeenCalledTimes(4);
  });
});
