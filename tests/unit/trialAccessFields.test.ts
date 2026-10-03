import { trialAccessFieldsIfMissing } from '@/lib/subscriptionConfig';

describe('trialAccessFieldsIfMissing', () => {
  it('stamps a free trial only when plan and status are missing', () => {
    expect(trialAccessFieldsIfMissing(undefined)).toEqual({
      selectedPlan: 'power-user-trial',
      subscriptionStatus: 'trial',
    });
    expect(trialAccessFieldsIfMissing({})).toEqual({
      selectedPlan: 'power-user-trial',
      subscriptionStatus: 'trial',
    });
    expect(trialAccessFieldsIfMissing({ selectedPlan: '  ', subscriptionStatus: '' })).toEqual({
      selectedPlan: 'power-user-trial',
      subscriptionStatus: 'trial',
    });
  });

  it('does not overwrite an existing plan or subscription status', () => {
    expect(
      trialAccessFieldsIfMissing({
        selectedPlan: 'buy-coffee',
        subscriptionStatus: 'active',
      }),
    ).toEqual({});
    expect(
      trialAccessFieldsIfMissing({
        selectedPlan: 'power-user-trial',
        subscriptionStatus: 'trial',
      }),
    ).toEqual({});
    expect(
      trialAccessFieldsIfMissing({
        selectedPlan: 'buy-coffee',
      }),
    ).toEqual({ subscriptionStatus: 'trial' });
  });
});
