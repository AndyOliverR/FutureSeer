import { ALL_TOOL_SLUGS } from '@/lib/toolReportReadiness';
import { buildStaleCatalogClearPatch } from '@/lib/staleCatalogReports';

describe('buildStaleCatalogClearPatch', () => {
  it('nulls catalog reports whose generation key does not match the new hash', () => {
    const patch = buildStaleCatalogClearPatch(
      {
        profileDataHash: 'new-hash',
        vedic: { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'old-hash' },
        tarot: { cards: [{ name: 'The Fool' }], generationIdempotencyKey: 'old-hash' },
        interpretations: { personality: { overview: 'old' } },
        seerMaster: { core_identity: ['old'] },
        toolStatus: {
          tarot: { state: 'ready', generatedAt: 1 },
        },
      },
      'new-hash',
      ['vedic', 'western'],
      1_700_000_000_000,
    );

    expect(patch).not.toBeNull();
    expect(patch?.vedic).toBeUndefined();
    expect(patch?.tarot).toBeNull();
    expect(patch?.interpretations).toBeNull();
    expect(patch?.seerMaster).toBeNull();
    expect(patch?.toolStatus).toEqual(
      expect.objectContaining({
        tarot: expect.objectContaining({ state: 'pending', updatedAt: 1_700_000_000_000 }),
      }),
    );
  });

  it('keeps reports already stamped with the new hash', () => {
    const patch = buildStaleCatalogClearPatch(
      {
        tarot: { cards: [{ name: 'The Magician' }], generationIdempotencyKey: 'new-hash' },
      },
      'new-hash',
    );
    expect(patch?.tarot).toBeUndefined();
  });

  it('returns null when there is nothing to clear', () => {
    expect(buildStaleCatalogClearPatch({}, 'new-hash')).toBeNull();
  });

  it('drops nested toolReports entries that do not match the new hash', () => {
    const patch = buildStaleCatalogClearPatch(
      {
        toolReports: {
          numerology: { data: { lifePathNumber: 7, generationIdempotencyKey: 'old-hash' } },
          western: { data: { sunSign: 'Leo', generationIdempotencyKey: 'new-hash' } },
        },
      },
      'new-hash',
      ['western'],
    );
    expect(patch?.toolReports).toEqual({
      western: { data: { sunSign: 'Leo', generationIdempotencyKey: 'new-hash' } },
    });
    expect(ALL_TOOL_SLUGS).toContain('numerology');
  });
});
