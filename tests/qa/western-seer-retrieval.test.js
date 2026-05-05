/**
 * Western Seer retrieval: intent → section mapping and chunk formatting.
 * Validates getSectionsForIntent and formatChunksForPrompt (no API calls).
 */

jest.mock('@/lib/firebase-admin', () => ({ adminDb: null }));
jest.mock('@/lib/userSubcollectionFirestore', () => ({
  userSubdocGet: jest.fn(),
}));

const { getSectionsForIntent, formatChunksForPrompt } = require('@/lib/westernSeerRetrieval');

describe('Western Seer retrieval', () => {
  let consoleErrorSpy;
  let consoleInfoSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  describe('getSectionsForIntent', () => {
    test('career returns career, sun, timing', () => {
      expect(getSectionsForIntent('career')).toEqual(['career', 'sun', 'timing']);
    });
    test('relationships returns relationships, moon, personality, timing', () => {
      expect(getSectionsForIntent('relationships')).toEqual(['relationships', 'moon', 'personality', 'timing']);
    });
    test('timing returns timing, general', () => {
      expect(getSectionsForIntent('timing')).toEqual(['timing', 'general']);
    });
    test('health returns health, moon, general', () => {
      expect(getSectionsForIntent('health')).toEqual(['health', 'moon', 'general']);
    });
    test('personality returns personality, sun, moon, ascendant', () => {
      expect(getSectionsForIntent('personality')).toEqual(['personality', 'sun', 'moon', 'ascendant']);
    });
    test('general returns general, personality', () => {
      expect(getSectionsForIntent('general')).toEqual(['general', 'personality']);
    });
    test('unknown intent falls back to general, personality', () => {
      expect(getSectionsForIntent('unknown_type')).toEqual(['general', 'personality']);
    });
  });

  describe('formatChunksForPrompt', () => {
    const mockChunks = {
      sun: { sign: 'Leo', house: 10, meaning: 'Sun in Leo in the 10th house suggests strong career focus.' },
      moon: { sign: 'Pisces', house: 6, meaning: 'Moon in Pisces in the 6th house indicates sensitivity in daily routines.' },
      ascendant: { sign: 'Cancer', meaning: 'Cancer Rising gives a nurturing first impression.' },
      career: { summary: 'Career themes from 10th house and Saturn.', indicators: ['Sun 10th', 'Saturn aspect'] },
      relationships: { summary: 'Partnership themes from 7th house.', indicators: ['Venus square Mars', '7th house'] },
      personality: { summary: 'Big Three overview.', indicators: ['Sun', 'Moon', 'Ascendant'] },
      health: { summary: '6th and 8th house themes.', indicators: ['6th house', 'Mars'] },
      timing: { summary: 'Current transits and key dates.', indicators: ['current transits'] },
      general: { summary: 'Chart overview.', chartOverview: 'Overall chart themes.', indicators: ['chart overview'] }
    };

    test('formats placement chunks (sun, moon, ascendant) with ## header and meaning', () => {
      const out = formatChunksForPrompt(mockChunks, ['sun', 'moon']);
      expect(out).toContain('## sun');
      expect(out).toContain('Leo');
      expect(out).toContain('House 10');
      expect(out).toContain('Sun in Leo');
      expect(out).toContain('## moon');
      expect(out).toContain('Pisces');
      expect(out).toContain('Moon in Pisces');
    });

    test('formats section chunks (career, relationships) with summary and indicators', () => {
      const out = formatChunksForPrompt(mockChunks, ['career', 'relationships']);
      expect(out).toContain('## career');
      expect(out).toContain('Career themes from 10th house');
      expect(out).toContain('Indicators: Sun 10th, Saturn aspect');
      expect(out).toContain('## relationships');
      expect(out).toContain('Partnership themes');
      expect(out).toContain('Venus square Mars');
    });

    test('deduplicates chunk keys', () => {
      const out = formatChunksForPrompt(mockChunks, ['general', 'personality', 'general']);
      const count = (out.match(/## general/g) || []).length;
      expect(count).toBe(1);
    });

    test('returns empty string when no keys match', () => {
      const out = formatChunksForPrompt(mockChunks, []);
      expect(out.trim()).toBe('');
    });
  });
});
