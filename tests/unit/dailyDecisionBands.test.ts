import {
  actionBandLabel,
  scoreToActionBand,
} from '@/lib/dailyDecisionBands';

describe('dailyDecisionBands', () => {
  it('maps scores to action bands', () => {
    expect(scoreToActionBand(85)).toBe('favorable');
    expect(scoreToActionBand(70)).toBe('neutral');
    expect(scoreToActionBand(40)).toBe('observe');
  });

  it('returns human labels without percentages', () => {
    expect(actionBandLabel('favorable')).toBe('Favorable window');
    expect(actionBandLabel('neutral')).toBe('Small step');
    expect(actionBandLabel('observe')).toBe('Observe');
  });
});
