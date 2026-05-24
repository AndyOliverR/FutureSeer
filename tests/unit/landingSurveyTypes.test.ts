import {
  parseLandingSurveyTopic,
  parseRating,
  sanitizeSurveyText,
} from '@/lib/landingSurveyTypes';

describe('landingSurveyTypes', () => {
  it('sanitizes and truncates text', () => {
    expect(sanitizeSurveyText('  hello  ', 10)).toBe('hello');
    expect(sanitizeSurveyText('x'.repeat(20), 5)).toBe('xxxxx');
    expect(sanitizeSurveyText(42, 10)).toBe('');
  });

  it('parses topic with fallback', () => {
    expect(parseLandingSurveyTopic('career')).toBe('career');
    expect(parseLandingSurveyTopic('invalid')).toBe('other');
  });

  it('parses rating 1–5 only', () => {
    expect(parseRating(3)).toBe(3);
    expect(parseRating('4')).toBe(4);
    expect(parseRating(0)).toBeNull();
    expect(parseRating(null)).toBeNull();
  });
});

describe('heroCtaVariant', () => {
  it('returns stable labels', async () => {
    const { heroCtaLabel } = await import('@/lib/heroCtaVariant');
    expect(heroCtaLabel('early_access')).toBe('Get Early Access');
    expect(heroCtaLabel('help_shape')).toBe('Help Shape FutureSeer');
  });
});
