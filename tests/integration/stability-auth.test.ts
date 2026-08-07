/**
 * Stability image API must not be an unauthenticated paid-proxy.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockFetch = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

// Import after mocks
import { POST } from '@/app/api/stability/route';

describe('POST /api/stability auth', () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.STABILITY_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STABILITY_API_KEY = 'test-stability-key';
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalKey === undefined) {
      delete process.env.STABILITY_API_KEY;
    } else {
      process.env.STABILITY_API_KEY = originalKey;
    }
  });

  it('rejects missing Authorization without calling Stability', async () => {
    const req = new NextRequest('http://localhost/api/stability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'cosmic orb' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token without calling Stability', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/stability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify({ prompt: 'cosmic orb' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('allows owned auth and proxies to Stability', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ artifacts: [{ base64: 'abc123' }] }),
    });

    const req = new NextRequest('http://localhost/api/stability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({ prompt: 'cosmic orb' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.imageUrl).toContain('data:image/png;base64,abc123');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(String(mockFetch.mock.calls[0][0])).toContain('api.stability.ai');
  });
});
