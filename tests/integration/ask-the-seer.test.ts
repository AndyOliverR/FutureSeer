/**
 * Integration tests: Ask the Seer API
 * Simulates: submitting a question triggers a fresh API call and returns an answer.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockFetch = jest.fn();
const originalFetch = globalThis.fetch;

jest.mock('@/lib/serverBaseUrl', () => ({
  getServerBaseUrl: () => 'http://localhost:3000',
}));

jest.mock('@/lib/consoleLogger', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: jest.fn(async () => ({ ok: true, uid: 'user-123' })),
  resolveOwnedUserId: jest.fn((requested: unknown, authUid: string) =>
    typeof requested === 'string' && requested === authUid ? requested : null
  ),
}));

describe('Ask the Seer API', () => {
  beforeAll(() => {
    globalThis.fetch = mockFetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function postAskTheSeer(body: { userId: string; question: string; conversationHistory?: unknown[]; userProfile?: unknown }) {
    const { POST } = await import('@/app/api/ask-the-seer/route');
    const req = new NextRequest('http://localhost:3000/api/ask-the-seer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  it('returns 400 when userId or question is missing', async () => {
    const res = await postAskTheSeer({ userId: 'user-123', question: '' });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('makes a fresh API call to seer/chat and returns the reply', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Test reply from Seer', thread: [] }),
    });

    const res = await postAskTheSeer({
      userId: 'user-123',
      question: 'What does my chart say about career?',
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.answer).toContain('Test reply from Seer');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/seer/chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.message).toBe('What does my chart say about career?');
    expect(callBody.userId).toBe('user-123');
  });

  it('returns error when seer/chat responds with non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'AI unavailable' }),
    });

    const res = await postAskTheSeer({ userId: 'user-123', question: 'Hello?' });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('rejects when userId does not match authenticated user', async () => {
    const res = await postAskTheSeer({ userId: 'other-user', question: 'Hello?' });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
