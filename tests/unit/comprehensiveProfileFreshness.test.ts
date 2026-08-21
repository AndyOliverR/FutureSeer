import {
  getComprehensiveProfileFreshnessMs,
  shouldApplyComprehensiveProfileUpdate,
} from '@/lib/comprehensiveProfileFreshness';
import { calculateProfileDataHash } from '@/lib/firebase';

describe('comprehensiveProfileFreshness', () => {
  it('prefers newer lastProgressAt over unchanged metadata.generatedAt', () => {
    const generatedAt = '2026-07-01T12:00:00.000Z';
    const base = {
      metadata: { generatedAt },
      lastProgressAt: Date.parse(generatedAt),
    };
    const progressed = {
      metadata: { generatedAt },
      lastProgressAt: Date.parse(generatedAt) + 60_000,
      toolStatus: {
        vedic: { state: 'ready', updatedAt: Date.parse(generatedAt) + 60_000 },
      },
    };

    const baseMs = getComprehensiveProfileFreshnessMs(base);
    const progressedMs = getComprehensiveProfileFreshnessMs(progressed);
    expect(progressedMs).toBeGreaterThan(baseMs);
    expect(shouldApplyComprehensiveProfileUpdate(progressed, baseMs)).toBe(true);
    expect(shouldApplyComprehensiveProfileUpdate(base, progressedMs)).toBe(false);
  });

  it('applies when no prior freshness marker exists', () => {
    expect(
      shouldApplyComprehensiveProfileUpdate(
        { metadata: { generatedAt: '2026-07-01T12:00:00.000Z' } },
        null,
      ),
    ).toBe(true);
  });

  it('skips equal freshness to avoid thrashing', () => {
    const data = {
      metadata: { generatedAt: '2026-07-01T12:00:00.000Z' },
      lastProgressAt: 1_720_000_000_000,
    };
    const ms = getComprehensiveProfileFreshnessMs(data);
    expect(shouldApplyComprehensiveProfileUpdate(data, ms)).toBe(false);
  });
});

describe('calculateProfileDataHash coordinates', () => {
  const base = {
    birthDate: '1990-01-15',
    birthTime: '10:30',
    birthPlace: 'Kolkata, India',
    fullName: 'Test User',
  };

  it('changes when birthLatitude/birthLongitude change without place string change', () => {
    const withoutCoords = calculateProfileDataHash(base);
    const withCoords = calculateProfileDataHash({
      ...base,
      birthLatitude: 22.5726,
      birthLongitude: 88.3639,
    });
    const movedCoords = calculateProfileDataHash({
      ...base,
      birthLatitude: 28.6139,
      birthLongitude: 77.209,
    });
    expect(withCoords).not.toBe(withoutCoords);
    expect(movedCoords).not.toBe(withCoords);
  });

  it('uses latitude/longitude aliases when birth* coords are absent', () => {
    const viaBirth = calculateProfileDataHash({
      ...base,
      birthLatitude: 19.076,
      birthLongitude: 72.8777,
    });
    const viaAlias = calculateProfileDataHash({
      ...base,
      latitude: 19.076,
      longitude: 72.8777,
    });
    expect(viaAlias).toBe(viaBirth);
  });

  it('keeps stable hash when coordinates are absent (undefined omitted)', () => {
    const a = calculateProfileDataHash(base);
    const b = calculateProfileDataHash({ ...base });
    expect(a).toBe(b);
  });
});
