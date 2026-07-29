import {
  StageBClaimLostError,
  isActiveStageBClaim,
  isStageBClaimLostError,
} from '@/lib/mysticalStageBClaim';

describe('isActiveStageBClaim', () => {
  it('requires matching claimId and running status', () => {
    expect(isActiveStageBClaim({ claimId: 'a', status: 'running' }, 'a')).toBe(true);
  });

  it('rejects claim steal (different claimId)', () => {
    expect(isActiveStageBClaim({ claimId: 'b', status: 'running' }, 'a')).toBe(false);
  });

  it('rejects after finalize or fail (status left running)', () => {
    expect(isActiveStageBClaim({ claimId: 'a', status: 'completed' }, 'a')).toBe(false);
    expect(isActiveStageBClaim({ claimId: 'a', status: 'queued' }, 'a')).toBe(false);
    expect(isActiveStageBClaim({ claimId: 'a', status: 'failed' }, 'a')).toBe(false);
  });

  it('rejects missing job or empty claim', () => {
    expect(isActiveStageBClaim(null, 'a')).toBe(false);
    expect(isActiveStageBClaim({ claimId: 'a', status: 'running' }, '')).toBe(false);
    expect(isActiveStageBClaim({ status: 'running' }, 'a')).toBe(false);
  });
});

describe('StageBClaimLostError', () => {
  it('is detected by type guard', () => {
    const err = new StageBClaimLostError('uid1', 'claim1');
    expect(isStageBClaimLostError(err)).toBe(true);
    expect(isStageBClaimLostError(new Error('other'))).toBe(false);
    expect(err.uid).toBe('uid1');
    expect(err.claimId).toBe('claim1');
  });
});
