import type { NextRequest } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';
import { resolveOwnedUserId } from '@/lib/security/ownership';

export type UserAuthOk = {
  ok: true;
  uid: string;
  email?: string;
};

export type UserAuthFail = {
  ok: false;
  reason: 'missing_token' | 'invalid_token';
};

export type UserAuthResult = UserAuthOk | UserAuthFail;

export async function verifyUserRequest(
  request: NextRequest,
  logTag = 'user-api',
): Promise<UserAuthResult> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    devLog.warn(`[${logTag}] No Bearer token`, 'route');
    return { ok: false, reason: 'missing_token' };
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return { ok: true, uid: decoded.uid, email: decoded.email };
  } catch (err) {
    devLog.warn(`[${logTag}] verifyIdToken failed`, err, 'route');
    return { ok: false, reason: 'invalid_token' };
  }
}

export { resolveOwnedUserId };

