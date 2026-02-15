/**
 * QA Test Matrix for Seer Routing, State, and Response Contract
 *
 * Covers failure cases described in the clean architecture plan:
 * - Intent routing (gemstone vs mudra, clarification)
 * - Remedy sub-intent block (mudra blocks gemstones)
 * - Response contract (no tool dumps, no exploration spam)
 * - Session state (consumed dates, exclusion)
 */

const { routeIntent, shouldAskClarification } = require('@/lib/seerIntentRouter');
const { validateSeerResponse, enforceResponseContract } = require('@/lib/seerResponseValidator');
const { hashAnswer, extractDatesFromText, shouldExcludeDate } = require('@/lib/seerSessionState');

describe('Seer Intent Router', () => {

  describe('Remedy routing', () => {
    test('"What remedies will work for me?" should ask clarification (generic)', () => {
      const result = routeIntent('What remedies will work for me?');
      expect(result.intent).toBe('remedies');
      expect(result.subIntent).toBeNull();
      expect(result.clarificationQuestion).toBeDefined();
      expect(shouldAskClarification(result)).toBe(true);
    });

    test('"mudra" should block gemstones', () => {
      const result = routeIntent('Which mudras should I practice?');
      expect(result.intent).toBe('remedies');
      expect(result.subIntent).toBe('mudras');
      expect(result.blockedRemedyTypes).toContain('gemstones');
      expect(shouldAskClarification(result)).toBe(false);
    });

    test('"color" should block gemstones', () => {
      const result = routeIntent('What colours support my chart?');
      expect(result.intent).toBe('remedies');
      expect(result.subIntent).toBe('colors');
      expect(result.blockedRemedyTypes).toContain('gemstones');
    });

    test('"gemstone" should NOT block gemstones', () => {
      const result = routeIntent('What gemstones suit me?');
      expect(result.intent).toBe('remedies');
      expect(result.subIntent).toBe('gemstones');
      expect(result.blockedRemedyTypes || []).not.toContain('gemstones');
    });

    test('"remedies will work" should route to remedies (not career)', () => {
      const result = routeIntent('What remedies will work for me?');
      expect(result.intent).toBe('remedies');
      expect(result.intent).not.toBe('career');
    });
  });

  describe('Intent routing', () => {
    test('"What is my life purpose?" → purpose', () => {
      const result = routeIntent('What is my life purpose?');
      expect(result.intent).toBe('purpose');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('"When should I launch?" → timing', () => {
      const result = routeIntent('When should I launch?');
      expect(result.intent).toBe('timing');
    });

    test('"Which option is better?" → decision', () => {
      const result = routeIntent('Which option is better for me?');
      expect(result.intent).toBe('decision');
    });

    test('"vague question" should ask clarification', () => {
      const result = routeIntent('blah blah');
      expect(result.intent).toBe('general');
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.clarificationQuestion).toBeDefined();
    });
  });
});

describe('Seer Response Validator', () => {

  describe('Contract violations', () => {
    test('should reject "would you like to explore"', () => {
      const ans = 'Your chart suggests February. Would you like to explore more dates?';
      const result = validateSeerResponse(ans);
      expect(result.valid).toBe(false);
      expect(result.violation).toContain('exploration');
      expect(result.sanitized).toBeDefined();
    });

    test('should reject tool dump (Vedic: ... Western: ...)', () => {
      const ans = 'Here is the analysis:\n- Vedic: February is good\n- Western: Mars supports\n- Numerology: 5 is lucky';
      const result = validateSeerResponse(ans);
      expect(result.valid).toBe(false);
      expect(result.violation).toContain('tool');
    });

    test('should reject confidence dump', () => {
      const ans = 'February 15 is favorable. Confidence score: 85%. Reliability band: 80-90%.';
      const result = validateSeerResponse(ans);
      expect(result.valid).toBe(false);
    });

    test('should accept clean answer', () => {
      const ans = 'February 15 is favorable for your launch. Your current dasha supports initiation. Consider a soft launch first.';
      const result = validateSeerResponse(ans);
      expect(result.valid).toBe(true);
    });

    test('enforceResponseContract returns sanitized when invalid', () => {
      const bad = 'Answer. Would you like to explore more?';
      const out = enforceResponseContract(bad);
      expect(out).not.toContain('Would you like to explore');
    });
  });
});

describe('Seer Session State', () => {

  describe('hashAnswer', () => {
    test('same text produces same hash', () => {
      const a = hashAnswer('February 15 is favorable.');
      const b = hashAnswer('February 15 is favorable.');
      expect(a).toBe(b);
    });

    test('different text produces different hash', () => {
      const a = hashAnswer('February 15 is favorable.');
      const b = hashAnswer('March 20 is better.');
      expect(a).not.toBe(b);
    });
  });

  describe('extractDatesFromText', () => {
    test('extracts YYYY-MM-DD', () => {
      const dates = extractDatesFromText('Launch on 2026-02-15 or 2026-03-20');
      expect(dates).toContain('2026-02-15');
      expect(dates).toContain('2026-03-20');
    });

    test('deduplicates', () => {
      const dates = extractDatesFromText('2026-02-15 and 2026-02-15');
      expect(dates).toHaveLength(1);
    });
  });

  describe('shouldExcludeDate', () => {
    test('consumed date is excluded', () => {
      expect(shouldExcludeDate('2026-02-15', ['2026-02-15', '2026-03-20'])).toBe(true);
    });

    test('non-consumed date is not excluded', () => {
      expect(shouldExcludeDate('2026-04-10', ['2026-02-15'])).toBe(false);
    });
  });
});
