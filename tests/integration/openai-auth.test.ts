/**
 * Legacy OpenAI prediction API must not be an unauthenticated paid-proxy.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockCallTextAI = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/aiStructuredOutput', () => ({
  callTextAI: (...args: unknown[]) => mockCallTextAI(...args),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

// Import after mocks
import { POST } from '@/app/api/openai/route';

describe('POST /api/openai auth', () => {
  const originalOpenAI = process.env.OPENAI_API_KEY;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'sk-test-openai-key-long-enough';
    process.env.AI_GATEWAY_API_KEY = 'gateway-test';
    mockCallTextAI.mockResolvedValue({
      content: 'The cosmos answers.',
      usage: { totalTokens: 42 },
    });
  });

  afterAll(() => {
    if (originalOpenAI === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAI;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY;
    else process.env.AI_GATEWAY_API_KEY = originalGateway;
  });

  it('rejects missing Authorization without calling the model', async () => {
    const req = new NextRequest('http://localhost/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What awaits me?' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockCallTextAI).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token without calling the model', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify({ question: 'What awaits me?' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockCallTextAI).not.toHaveBeenCalled();
  });

  it('allows owned auth and generates a prediction', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });

    const req = new NextRequest('http://localhost/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        question: 'What awaits me?',
        astroData: { sun_sign: 'Leo' },
        symbolicData: { primarySymbol: 'Sun' },
        userId: 'attacker-uid',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.prediction).toBe('The cosmos answers.');
    expect(mockCallTextAI).toHaveBeenCalledTimes(1);
    expect(mockCallTextAI.mock.calls[0][0]).toMatchObject({
      label: 'openai-legacy-route',
      model: 'gpt-4',
    });
  });
});
