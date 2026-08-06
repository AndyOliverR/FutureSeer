import type { NextRequest } from 'next/server';
import { getUserProfile, type UserProfile } from '@/lib/firebase';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { decideUserScopedAccess } from '@/lib/security/userScopedAccess';

export type LoadOwnedUserProfileResult =
  | { ok: true; profile: UserProfile; userId: string }
  | { ok: false; status: 401 | 403 | 404; error: string };

/**
 * Load `users/{userId}` via Admin-capable `getUserProfile` only when the caller
 * owns that UID. Prevents unauthenticated / cross-user profile IDORs.
 */
export async function loadOwnedUserProfile(
  request: NextRequest,
  requestedUserId: string,
  logTag: string,
): Promise<LoadOwnedUserProfileResult> {
  const auth = await verifyUserRequest(request, logTag);
  const access = decideUserScopedAccess(requestedUserId, auth);

  if (access.kind === 'unauthorized') {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  if (access.kind === 'forbidden' || access.kind === 'stateless') {
    return {
      ok: false,
      status: access.kind === 'forbidden' ? 403 : 401,
      error:
        access.kind === 'forbidden'
          ? 'Forbidden'
          : 'Authentication required to load a stored user profile',
    };
  }

  const profile = await getUserProfile(access.userId);
  if (!profile) {
    return { ok: false, status: 404, error: 'User profile not found' };
  }
  return { ok: true, profile, userId: access.userId };
}
