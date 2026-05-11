/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockResolveOwnedUserId = jest.fn();
const mockGetDocument = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: (...args: unknown[]) => mockResolveOwnedUserId(...args),
}));

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: null,
  isAdminAvailable: () => true,
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
}));

jest.mock('@/lib/consoleLogger', () => ({
  log: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('/api/tools/data auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function getToolData(userId: string, toolName = 'vedic') {
    const { GET } = await import('@/app/api/tools/data/route');
    const req = new NextRequest(`http://localhost:3000/api/tools/data?userId=${userId}&toolName=${toolName}`, {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
    });
    return GET(req) as Promise<Response>;
  }

  it('does not read reports without a valid Firebase token', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await getToolData('victim');

    expect(res.status).toBe(401);
    expect(mockGetDocument).not.toHaveBeenCalled();
  });

  it('does not read another user report when the token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });
    mockResolveOwnedUserId.mockReturnValueOnce(null);

    const res = await getToolData('victim');

    expect(res.status).toBe(403);
    expect(mockResolveOwnedUserId).toHaveBeenCalledWith('victim', 'attacker');
    expect(mockGetDocument).not.toHaveBeenCalled();
  });

  it('returns only the authenticated user tool report', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'owner' });
    mockResolveOwnedUserId.mockReturnValueOnce('owner');
    mockGetDocument.mockResolvedValueOnce({
      vedic: { chartOverview: 'owned report' },
      lastUpdated: 123,
      dataQuality: 'complete',
      source: 'test',
    });

    const res = await getToolData('owner');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockGetDocument).toHaveBeenCalledWith('comprehensiveMysticalProfiles', 'owner');
    expect(body.data).toEqual({ chartOverview: 'owned report' });
    expect(body.metadata.userId).toBe('owner');
  });
});
