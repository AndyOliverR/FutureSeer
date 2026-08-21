/**
 * Integration: referral apply/generate auth gates.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockApplyReferralCredit = jest.fn();
const mockGenerateReferralCode = jest.fn(() => 'FUTURE_ABC12');
const mockUserGet = jest.fn();
const mockUserSet = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
  adminDb: {},
  isAdminAvailable: () => true,
}));

jest.mock('@/lib/adminConfig', () => ({
  isAdminDecoded: (decoded: { admin?: boolean; superadmin?: boolean }) =>
    decoded.admin === true || decoded.superadmin === true,
}));

jest.mock('@/lib/referralUtils', () => ({
  applyReferralCredit: (...args: unknown[]) => mockApplyReferralCredit(...args),
  generateReferralCode: (...args: unknown[]) => mockGenerateReferralCode(...args),
  validateReferralCode: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: () => ({
    collection: () => ({
      doc: () => ({
        get: mockUserGet,
        set: mockUserSet,
      }),
    }),
  }),
}));

describe('Referral API auth gates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyReferralCredit.mockResolvedValue(undefined);
    mockUserGet.mockResolvedValue({ data: () => ({}) });
    mockUserSet.mockResolvedValue(undefined);
  });

  describe('POST /api/referrals/apply', () => {
    it('rejects unauthenticated free-month minting', async () => {
      const { POST } = await import('@/app/api/referrals/apply/route');
      const req = new NextRequest('http://localhost/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerId: 'victim-uid' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      expect(mockApplyReferralCredit).not.toHaveBeenCalled();
    });

    it('rejects non-admin authenticated callers', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-1', email: 'u@example.com' });
      const { POST } = await import('@/app/api/referrals/apply/route');
      const req = new NextRequest('http://localhost/api/referrals/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-token',
        },
        body: JSON.stringify({ referrerId: 'victim-uid' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      expect(mockApplyReferralCredit).not.toHaveBeenCalled();
    });

    it('allows admin to award a free month', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'admin-1',
        email: 'admin@example.com',
        admin: true,
      });
      const { POST } = await import('@/app/api/referrals/apply/route');
      const req = new NextRequest('http://localhost/api/referrals/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({ referrerId: 'referrer-uid' }),
      });

      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockApplyReferralCredit).toHaveBeenCalledWith('referrer-uid');
    });
  });

  describe('POST /api/referrals/generate', () => {
    it('rejects missing Authorization', async () => {
      const { POST } = await import('@/app/api/referrals/generate/route');
      const req = new NextRequest('http://localhost/api/referrals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'victim-uid' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      expect(mockUserSet).not.toHaveBeenCalled();
    });

    it('rejects UID mismatch (IDOR write)', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'attacker', email: 'a@example.com' });
      const { POST } = await import('@/app/api/referrals/generate/route');
      const req = new NextRequest('http://localhost/api/referrals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer attacker-token',
        },
        body: JSON.stringify({ userId: 'victim-uid' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      expect(mockUserSet).not.toHaveBeenCalled();
    });

    it('generates a code for the authenticated owner', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'owner-1', email: 'o@example.com' });
      const { POST } = await import('@/app/api/referrals/generate/route');
      const req = new NextRequest('http://localhost/api/referrals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer owner-token',
        },
        body: JSON.stringify({ userId: 'owner-1' }),
      });

      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.referralCode).toBe('FUTURE_ABC12');
      expect(mockGenerateReferralCode).toHaveBeenCalledWith('owner-1');
      expect(mockUserSet).toHaveBeenCalled();
    });
  });

  describe('GET /api/referrals/validate', () => {
    it('does not leak referrer userId on valid codes', async () => {
      const { validateReferralCode } = jest.requireMock('@/lib/referralUtils') as {
        validateReferralCode: jest.Mock;
      };
      validateReferralCode.mockResolvedValue({ valid: true, userId: 'secret-referrer' });

      const { GET } = await import('@/app/api/referrals/validate/route');
      const req = new NextRequest('http://localhost/api/referrals/validate?code=FUTURE_ABC12');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.userId).toBeUndefined();
    });
  });
});
