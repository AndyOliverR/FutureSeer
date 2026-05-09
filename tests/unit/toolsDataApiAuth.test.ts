/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetDocument = jest.fn();

jest.mock('@/lib/userApiAuth', () => {
  return {
    verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
    resolveOwnedUserId: (requestedUserId: unknown, authUid: string) =>
      typeof requestedUserId === 'string' && requestedUserId === authUid ? requestedUserId : null,
  };
});

jest.mock('@/lib/firebase-admin', () => ({
  isAdminAvailable: jest.fn(() => true),
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
}));

jest.mock('@/lib/consoleLogger', () => ({
  log: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { GET, POST } from '@/app/api/tools/data/route';

describe('/api/tools/data ownership checks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: 'owner-uid' });
    mockGetDocument.mockResolvedValue({
      tarot: { cards: ['The Star'] },
      lastUpdated: 123,
      dataQuality: 'high',
      source: 'test',
    });
  });

  it('rejects unauthenticated GET requests before reading profile data', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });
    const request = new NextRequest('http://localhost/api/tools/data?userId=owner-uid&toolName=tarot');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(mockGetDocument).not.toHaveBeenCalled();
  });

  it('rejects GET requests for a different user id', async () => {
    const request = new NextRequest('http://localhost/api/tools/data?userId=victim-uid&toolName=tarot', {
      headers: { Authorization: 'Bearer token' },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(mockGetDocument).not.toHaveBeenCalled();
  });

  it('allows GET requests for the authenticated user id', async () => {
    const request = new NextRequest('http://localhost/api/tools/data?userId=owner-uid&toolName=tarot', {
      headers: { Authorization: 'Bearer token' },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ cards: ['The Star'] });
    expect(mockGetDocument).toHaveBeenCalledWith('comprehensiveMysticalProfiles', 'owner-uid');
  });

  it('rejects POST requests for a different user id', async () => {
    const request = new NextRequest('http://localhost/api/tools/data', {
      method: 'POST',
      headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'victim-uid' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(mockGetDocument).not.toHaveBeenCalled();
  });
});
