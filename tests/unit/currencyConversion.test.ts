import { convertSmallestUnitToInrPaise, convertToUsdCents } from '@/lib/currencyConversion';

describe('currencyConversion', () => {
  it('convertToUsdCents maps AED fils to at least 100 cents', () => {
    const cents = convertToUsdCents(3999, 'AED');
    expect(cents).toBeGreaterThanOrEqual(100);
  });

  it('convertSmallestUnitToInrPaise returns at least 100 paise for AED trial amount', () => {
    const paise = convertSmallestUnitToInrPaise(3999, 'AED');
    expect(paise).toBeGreaterThanOrEqual(100);
    expect(Number.isInteger(paise)).toBe(true);
  });
});
