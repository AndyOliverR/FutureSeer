/**
 * Single source for paid-tier feature bullets used on /pricing, signup plan step, and /subscribe.
 * Keep in sync with plan IDs: power-user-trial, buy-coffee, treat-me, festive-hamper.
 */

export const MEMBERSHIP_TIER_FEATURES: Record<
  'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper',
  string[]
> = {
  'power-user-trial': [
    'Teaser previews across tools (full reports unlock with Coffee, Treat, or Hamper)',
    'Your usage helps improve accuracy',
    'Early adopter status',
    'Attribution on leaderboard',
    'Part of the innovation team',
  ],
  'buy-coffee': [
    'Membership supports keeping FutureSeer accessible',
    'Recurring monthly billing',
    'All 60+ divination tools',
    'Unlimited AI readings',
    'Priority AI responses',
    'Community participation',
    'Forever on leaderboard',
  ],
  'treat-me': [
    'Quarterly membership — better value than 3 separate months',
    'Same full access as monthly',
    'All monthly membership benefits',
    '3 months of support in one payment',
    'Early access to new features',
    'Priority support',
  ],
  'festive-hamper': [
    'Annual membership — best value for year-round access',
    'All quarterly benefits',
    '12 months of support in one payment',
    'Family account options',
    'VIP community access',
    'Influence on product roadmap',
  ],
};
