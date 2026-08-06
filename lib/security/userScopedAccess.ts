import type { UserAuthResult } from '@/lib/userApiAuth';
import { resolveOwnedUserId } from '@/lib/security/ownership';

export type UserScopedAccessDecision =
  | { kind: 'owned'; userId: string }
  | { kind: 'stateless' }
  | { kind: 'forbidden' }
  | { kind: 'unauthorized' };

/**
 * Decide whether a request may read user-scoped Firestore profile/cache data.
 *
 * - Owned Firebase UID → full profile/cache access
 * - Missing token → stateless generation (Stage B / orchestrator body payload only)
 * - Invalid token → reject
 * - Mismatched UID → forbid (prevents authenticated IDOR)
 */
export function decideUserScopedAccess(
  requestedUserId: string,
  auth: UserAuthResult,
): UserScopedAccessDecision {
  if (!auth.ok) {
    if (auth.reason === 'invalid_token') return { kind: 'unauthorized' };
    return { kind: 'stateless' };
  }
  const owned = resolveOwnedUserId(requestedUserId, auth.uid);
  if (!owned) return { kind: 'forbidden' };
  return { kind: 'owned', userId: owned };
}
