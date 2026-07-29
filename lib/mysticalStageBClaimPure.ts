/**
 * Pure Stage B claim ownership helpers (no Firebase / server-only).
 */

export type StageBJobClaimFields = {
  claimId?: string | null;
  status?: string | null;
};

/** Thrown when a Stage B worker loses ownership mid-flight (stale reclaim). */
export class StageBClaimLostError extends Error {
  readonly uid: string;
  readonly claimId: string;

  constructor(uid: string, claimId: string) {
    super(`Stage B claim lost for ${uid}`);
    this.name = 'StageBClaimLostError';
    this.uid = uid;
    this.claimId = claimId;
  }
}

/**
 * Active ownership: same claimId and still `running`.
 * After reclaim, claimId changes; after finalize/fail, status leaves `running`.
 */
export function isActiveStageBClaim(
  job: StageBJobClaimFields | null | undefined,
  claimId: string,
): boolean {
  if (!job || !claimId) return false;
  return job.claimId === claimId && job.status === 'running';
}

export function isStageBClaimLostError(error: unknown): error is StageBClaimLostError {
  return error instanceof StageBClaimLostError;
}
