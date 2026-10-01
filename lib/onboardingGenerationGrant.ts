/**
 * Whether POST /api/profile/generate-mystical may skip profile_regen billing.
 *
 * The first full Generate is free. `users.mysticalProfileGenerated` is client-writable,
 * so a server lock that already committed natal charts also ends the free grant.
 * A failed natal attempt (status/phase `failed`, no freeOnboardingConsumed) stays free to retry.
 */

export type OnboardingGenerationLock = {
  status?: unknown;
  phase?: unknown;
  freeOnboardingConsumed?: unknown;
};

const COMMITTED_LOCK_STATUSES = new Set(['completed', 'running', 'started']);
const COMMITTED_LOCK_PHASES = new Set(['completed', 'catalog', 'natal', 'stageB']);

export function isFirstOnboardingFreeGrant(
  mysticalProfileGenerated: unknown,
  lock: OnboardingGenerationLock | null | undefined,
): boolean {
  if (mysticalProfileGenerated === true) return false;
  if (lock?.freeOnboardingConsumed === true) return false;

  const status = typeof lock?.status === 'string' ? lock.status : '';
  const phase = typeof lock?.phase === 'string' ? lock.phase : '';
  if (status === 'failed' || phase === 'failed') return true;
  if (COMMITTED_LOCK_STATUSES.has(status) || COMMITTED_LOCK_PHASES.has(phase)) return false;
  return true;
}
