import type { NextRequest } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';

export type AdminAuthOk = { ok: true; uid: string; email: string | undefined };
export type AdminAuthFail = { ok: false };
export type AdminAuthResult = AdminAuthOk | AdminAuthFail;

/**
 * Verifies Firebase ID token and admin/superadmin custom claims.
 * Used by admin-only API routes (Firestore writes via Admin SDK).
 */
export async function verifyAdminRequest(
  request: NextRequest,
  logTag = 'admin-api',
): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    devLog.warn(`[${logTag}] No Bearer token`, 'route');
    return { ok: false };
  }
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!isAdminDecoded(decoded)) {
      devLog.warn(`[${logTag}] Token valid but not admin`, { email: decoded.email ?? '(no email)' }, 'route');
      return { ok: false };
    }
    return { ok: true, uid: decoded.uid, email: decoded.email };
  } catch (err) {
    devLog.warn(`[${logTag}] verifyIdToken failed`, err, 'route');
    return { ok: false };
  }
}
