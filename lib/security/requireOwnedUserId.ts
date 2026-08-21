import type { NextRequest } from 'next/server';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { decideUserScopedAccess } from '@/lib/security/userScopedAccess';

export type RequireOwnedUserIdResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Require a Firebase ID token whose UID matches `requestedUserId`.
 * Use for routes that always need ownership (GET by userId, Admin writes).
 */
export async function requireOwnedUserId(
  request: NextRequest,
  requestedUserId: string,
  logTag: string,
): Promise<RequireOwnedUserIdResult> {
  const auth = await verifyUserRequest(request, logTag);
  const access = decideUserScopedAccess(requestedUserId, auth);

  if (access.kind === 'owned') {
    return { ok: true, userId: access.userId };
  }
  if (access.kind === 'forbidden') {
    return { ok: false, status: 403, error: 'Forbidden' };
  }
  return { ok: false, status: 401, error: 'Unauthorized' };
}

/**
 * True when the caller owns `requestedUserId`. Missing/invalid tokens → false
 * (callers should skip optional persistence rather than fail the whole request).
 */
export async function isOwnedUserRequest(
  request: NextRequest,
  requestedUserId: string,
  logTag: string,
): Promise<boolean> {
  const auth = await verifyUserRequest(request, logTag);
  return decideUserScopedAccess(requestedUserId, auth).kind === 'owned';
}
