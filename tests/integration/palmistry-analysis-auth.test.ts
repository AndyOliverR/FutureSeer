/**
 * Palmistry vision analysis must not be an unauthenticated paid proxy (Groq vision).
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockRunPalmVisionAnalysis = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/palmistry/runPalmVisionAnalysis', () => ({
  runPalmVisionAnalysis: (...args: unknown[]) => mockRunPalmVisionAnalysis(...args),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

// Import after mocks
import { POST } from '@/app/api/tools/palmistry/analysis/route';

const sampleData = {
  lines: {
    lifeLine: {
      length: 'long',
      depth: 'clear',
      quality: 'straight',
      breaks: [],
      interpretation: 'ok',
    },
    heartLine: {
      length: 'medium',
      depth: 'clear',
      quality: 'straight',
      breaks: [],
      interpretation: 'ok',
    },
    headLine: {
      length: 'medium',
      depth: 'clear',
      quality: 'straight',
      breaks: [],
      interpretation: 'ok',
    },
    fateLine: { presence: false, interpretation: 'absent' },
  },
  mounts: {
    jupiter: { prominence: 'normal', interpretation: 'ok' },
    saturn: { prominence: 'normal', interpretation: 'ok' },
    apollo: { prominence: 'normal', interpretation: 'ok' },
    mercury: { prominence: 'normal', interpretation: 'ok' },
    mars: { prominence: 'normal', interpretation: 'ok' },
    venus: { prominence: 'normal', interpretation: 'ok' },
    moon: { prominence: 'normal', interpretation: 'ok' },
  },
  handShape: { type: 'earth', characteristics: [], interpretation: 'ok' },
  fingers: {
    thumb: {
      length: 'medium',
      thickness: 'medium',
      flexibility: 'normal',
      interpretation: 'ok',
    },
    index: {
      length: 'medium',
      thickness: 'medium',
      flexibility: 'normal',
      interpretation: 'ok',
    },
    middle: {
      length: 'medium',
      thickness: 'medium',
      flexibility: 'normal',
      interpretation: 'ok',
    },
    ring: {
      length: 'medium',
      thickness: 'medium',
      flexibility: 'normal',
      interpretation: 'ok',
    },
    pinky: {
      length: 'medium',
      thickness: 'medium',
      flexibility: 'normal',
      interpretation: 'ok',
    },
  },
  markings: {},
};

describe('POST /api/tools/palmistry/analysis auth', () => {
  const originalGroq = process.env.GROQ_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-groq-key';
    mockRunPalmVisionAnalysis.mockResolvedValue({
      data: sampleData,
      degraded: false,
      source: 'llm',
    });
  });

  afterAll(() => {
    if (originalGroq === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalGroq;
  });

  it('rejects missing Authorization without calling Groq vision', async () => {
    const req = new NextRequest('http://localhost/api/tools/palmistry/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'https://example.com/palm.jpg' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRunPalmVisionAnalysis).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token without calling Groq vision', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/tools/palmistry/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify({ imageUrl: 'https://example.com/palm.jpg' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRunPalmVisionAnalysis).not.toHaveBeenCalled();
  });

  it('rejects disallowed image URL schemes without calling Groq vision', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/tools/palmistry/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({ imageUrl: 'file:///etc/passwd' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockRunPalmVisionAnalysis).not.toHaveBeenCalled();
  });

  it('allows owned auth and runs palm vision analysis', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });

    const req = new NextRequest('http://localhost/api/tools/palmistry/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({ imageUrl: 'https://example.com/palm.jpg' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.lines.lifeLine.length).toBe('long');
    expect(mockRunPalmVisionAnalysis).toHaveBeenCalledTimes(1);
    expect(mockRunPalmVisionAnalysis).toHaveBeenCalledWith('https://example.com/palm.jpg');
  });
});
