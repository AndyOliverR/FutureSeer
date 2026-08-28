/**
 * Integration tests: /api/community/connections
 * Unauthenticated callers must not read private messages or impersonate senders/recipients.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockQueryGet = jest.fn();
const mockDocGet = jest.fn();
const mockDocSet = jest.fn();
const mockDocUpdate = jest.fn();

function chainableQuery() {
  const query = {
    where: jest.fn(() => query),
    orderBy: jest.fn(() => query),
    get: mockQueryGet,
  };
  return query;
}

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: (requested: unknown, authUid: string) =>
    typeof requested === 'string' && requested.trim() === authUid ? requested.trim() : null,
}));

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => {
      const query = chainableQuery();
      return {
        where: query.where,
        orderBy: query.orderBy,
        get: mockQueryGet,
        doc: (id?: string) => ({
          id: id || 'conn-new',
          get: mockDocGet,
          set: mockDocSet,
          update: mockDocUpdate,
        }),
      };
    },
  },
}));

import { GET, POST } from '@/app/api/community/connections/route';
import { PATCH } from '@/app/api/community/connections/[id]/route';

describe('community connections auth', () => {
  const victimUid = 'victim-uid';
  const attackerUid = 'attacker-uid';
  const privateMessage = 'Let us talk about my birth chart privately';

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryGet.mockResolvedValue({ empty: true, docs: [] });
    mockDocSet.mockResolvedValue(undefined);
    mockDocUpdate.mockResolvedValue(undefined);
    mockDocGet.mockResolvedValue({
      exists: true,
      id: 'conn-1',
      data: () => ({
        fromUserId: attackerUid,
        fromUserName: 'Attacker',
        toUserId: victimUid,
        toUserName: 'Victim',
        topic: 'Chart reading',
        message: privateMessage,
        status: 'pending',
        createdAt: { toDate: () => new Date('2026-08-01T00:00:00.000Z') },
      }),
    });
  });

  function jsonHeaders(authHeader: boolean): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = 'Bearer test-token';
    return headers;
  }

  async function postConnection(
    body: Record<string, unknown>,
    authHeader = true,
  ): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/community/connections', {
      method: 'POST',
      headers: jsonHeaders(authHeader),
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  async function getConnections(
    userId: string,
    authHeader = true,
    type = 'all',
  ): Promise<Response> {
    const req = new NextRequest(
      `http://localhost:3000/api/community/connections?userId=${userId}&type=${type}`,
      {
        method: 'GET',
        headers: jsonHeaders(authHeader),
      },
    );
    return GET(req) as Promise<Response>;
  }

  async function patchConnection(
    body: Record<string, unknown>,
    authHeader = true,
  ): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/community/connections/conn-1', {
      method: 'PATCH',
      headers: jsonHeaders(authHeader),
      body: JSON.stringify(body),
    });
    return PATCH(req, { params: Promise.resolve({ id: 'conn-1' }) }) as Promise<Response>;
  }

  const validPostBody = {
    fromUserId: victimUid,
    fromUserName: 'Impostor',
    toUserId: attackerUid,
    toUserName: 'Target',
    topic: 'Hello',
    message: 'Forged request',
  };

  describe('GET', () => {
    it('returns 401 and does not query when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await getConnections(victimUid, false);

      expect(res.status).toBe(401);
      expect(mockQueryGet).not.toHaveBeenCalled();
    });

    it('returns 403 and does not leak another user private messages', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await getConnections(victimUid);

      expect(res.status).toBe(403);
      expect(mockQueryGet).not.toHaveBeenCalled();
    });

    it('returns the authenticated user connections when userId matches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: victimUid });
      mockQueryGet.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'conn-1',
            data: () => ({
              fromUserId: attackerUid,
              fromUserName: 'Attacker',
              toUserId: victimUid,
              toUserName: 'Victim',
              topic: 'Chart reading',
              message: privateMessage,
              status: 'pending',
              createdAt: { toDate: () => new Date('2026-08-01T00:00:00.000Z') },
            }),
          },
        ],
      });

      const res = await getConnections(victimUid, true, 'incoming');
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.requests).toHaveLength(1);
      expect(body.requests[0].message).toBe(privateMessage);
    });
  });

  describe('POST', () => {
    it('returns 401 and does not write when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await postConnection(validPostBody, false);

      expect(res.status).toBe(401);
      expect(mockDocSet).not.toHaveBeenCalled();
    });

    it('returns 403 and does not send as another user when fromUserId mismatches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await postConnection(validPostBody);

      expect(res.status).toBe(403);
      expect(mockDocSet).not.toHaveBeenCalled();
    });

    it('creates a request when fromUserId matches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await postConnection({
        fromUserId: attackerUid,
        fromUserName: 'Attacker',
        toUserId: victimUid,
        toUserName: 'Victim',
        topic: 'Hello',
        message: 'Want to connect',
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockDocSet).toHaveBeenCalledTimes(1);
      const stored = mockDocSet.mock.calls[0][0] as Record<string, unknown>;
      expect(stored.fromUserId).toBe(attackerUid);
      expect(stored.toUserId).toBe(victimUid);
    });
  });

  describe('PATCH', () => {
    it('returns 401 and does not update when Authorization is missing', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

      const res = await patchConnection({ action: 'accept', userId: victimUid }, false);

      expect(res.status).toBe(401);
      expect(mockDocUpdate).not.toHaveBeenCalled();
    });

    it('returns 403 and does not accept as another user when userId mismatches the token', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: attackerUid });

      const res = await patchConnection({ action: 'accept', userId: victimUid });

      expect(res.status).toBe(403);
      expect(mockDocUpdate).not.toHaveBeenCalled();
    });

    it('accepts when the authenticated user is the recipient', async () => {
      mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: victimUid });

      const res = await patchConnection({ action: 'accept', userId: victimUid });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockDocUpdate).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate.mock.calls[0][0]).toEqual(
        expect.objectContaining({ status: 'accepted' }),
      );
    });
  });
});
