/**
 * Integration tests: POST /api/profile/invalidate-cache
 * Profile Save must not wipe stored catalog reports.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockClearCachedDivinationData = jest.fn();
const mockDeleteDocument = jest.fn();
const mockIsAdminAvailable = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/universalDataAggregator', () => ({
  clearCachedDivinationData: (...args: unknown[]) => mockClearCachedDivinationData(...args),
}));

jest.mock('@/lib/firebase-admin', () => ({
  deleteDocument: (...args: unknown[]) => mockDeleteDocument(...args),
  isAdminAvailable: (...args: unknown[]) => mockIsAdminAvailable(...args),
}));

import { POST } from '@/app/api/profile/invalidate-cache/route';

describe('invalidate-cache API', () => {
  const uid = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({ uid });
    mockIsAdminAvailable.mockReturnValue(true);
    mockDeleteDocument.mockResolvedValue(true);
  });

  async function callInvalidate(authHeader?: string): Promise<Response> {
    const headers: Record<string, string> = {};
    if (authHeader !== undefined) {
      headers.Authorization = authHeader;
    }
    const req = new NextRequest('http://localhost:3000/api/profile/invalidate-cache', {
      method: 'POST',
      headers,
    });
    return POST(req) as Promise<Response>;
  }

  it('returns 401 when the Bearer token is missing', async () => {
    const res = await callInvalidate();
    expect(res.status).toBe(401);
    expect(mockClearCachedDivinationData).not.toHaveBeenCalled();
    expect(mockDeleteDocument).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('invalid'));
    const res = await callInvalidate('Bearer bad');
    expect(res.status).toBe(401);
    expect(mockClearCachedDivinationData).not.toHaveBeenCalled();
    expect(mockDeleteDocument).not.toHaveBeenCalled();
  });

  it('clears in-memory cache and does not delete stored mystical reports', async () => {
    const res = await callInvalidate('Bearer good');
    const body = (await res.json()) as { success?: boolean };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockClearCachedDivinationData).toHaveBeenCalledWith(uid);
    expect(mockDeleteDocument).not.toHaveBeenCalled();
  });
});
