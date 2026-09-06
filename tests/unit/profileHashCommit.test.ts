import {
  isCommittedProfileHash,
  natalReportsMatchProfileHash,
} from '@/lib/profileHashCommit';

describe('isCommittedProfileHash', () => {
  it('allows persist when no committed hash exists yet', () => {
    expect(isCommittedProfileHash(undefined, 'h2')).toBe(true);
    expect(isCommittedProfileHash('', 'h2')).toBe(true);
    expect(isCommittedProfileHash(null, 'h2')).toBe(true);
  });

  it('allows persist when live hash matches the committed hash', () => {
    expect(isCommittedProfileHash('h1', 'h1')).toBe(true);
  });

  it('refuses persist after birth fields change without Generate', () => {
    expect(isCommittedProfileHash('h1', 'h2')).toBe(false);
  });
});

describe('natalReportsMatchProfileHash', () => {
  it('treats missing or legacy natal reports as compatible', () => {
    expect(natalReportsMatchProfileHash({}, 'h2')).toBe(true);
    expect(
      natalReportsMatchProfileHash(
        { vedic: { planets: [{ name: 'Sun' }] }, western: { planets: [{ name: 'Moon' }] } },
        'h2',
      ),
    ).toBe(true);
  });

  it('rejects when stored natal keys belong to a previous hash', () => {
    expect(
      natalReportsMatchProfileHash(
        {
          vedic: { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'h1' },
          western: { planets: [{ name: 'Moon' }], generationIdempotencyKey: 'h1' },
        },
        'h2',
      ),
    ).toBe(false);
  });

  it('allows a persist that is rewriting the mismatched natal slugs', () => {
    expect(
      natalReportsMatchProfileHash(
        {
          vedic: { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'h1' },
          western: { planets: [{ name: 'Moon' }], generationIdempotencyKey: 'h1' },
        },
        'h2',
        ['vedic', 'western'],
      ),
    ).toBe(true);
  });
});
