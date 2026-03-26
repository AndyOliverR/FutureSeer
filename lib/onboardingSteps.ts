export interface OnboardingStep {
  id: string;
  target: string; // CSS selector or element ID
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Copy aligned with docs/AUTH_AND_ROUTING_FLOW.md:
 * - New users: sign-up → /profile-setup → complete → /profile → generate mystical profile → /ask-the-seer
 * - Returning users with reports often land on /ask-the-seer or /dashboard per auth routing
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: 'Welcome to FutureSeer',
    content:
      'You have dozens of divination tools in one place, each following its own tradition. Take this short tour, or skip and explore—your profile and saved readings stay in your account.',
    placement: 'center',
  },
  {
    id: 'dashboard',
    target: '[data-onboarding="dashboard"]',
    title: 'Your hub',
    content:
      'From here you can open tools, review guidance, and jump back to what matters. If you already generated your mystical profile, you may arrive on Ask the Seer instead—same account, different entry point.',
    placement: 'bottom',
  },
  {
    id: 'tools',
    target: '[data-onboarding="tools"]',
    title: '50+ divination tools',
    content:
      'Each tool has its own methodology—Vedic and Western astrology, Tarot, numerology, I Ching, and more. Open a tool to read your generated report and use that tool’s Ask the Seer for domain-specific questions.',
    placement: 'bottom',
  },
  {
    id: 'ask-seer',
    target: '[data-onboarding="ask-seer"]',
    title: 'Ask the Seer',
    content:
      'The main Seer weaves insights across your stored reports. Tool pages have their own experts (e.g. Tarot, Vedic) so answers stay faithful to each system.',
    placement: 'bottom',
  },
  {
    id: 'profile',
    target: '[data-onboarding="profile"]',
    title: 'Profile and generation',
    content:
      'New accounts complete Profile Setup first, then Cosmic Profile (/profile). When you tap Generate mystical profile, all tools build reports together; afterward you are taken to Ask the Seer. Edit birth details here anytime—saved data drives every reading.',
    placement: 'bottom',
  },
  {
    id: 'feedback',
    target: '[data-onboarding="feedback"]',
    title: 'Feedback',
    content:
      'Share bugs or ideas from the feedback control when you see it. We read submissions regularly—timelines vary by complexity.',
    placement: 'left',
  },
  {
    id: 'pricing',
    target: '[data-onboarding="pricing"]',
    title: 'Support the project',
    content:
      'Contribution tiers help keep FutureSeer running. Pick what fits you on the pricing page.',
    placement: 'bottom',
  },
];
