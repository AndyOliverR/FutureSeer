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

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: 'Welcome to FutureSeer!',
    content: 'You\'re joining an innovation experiment to see into your future. Let\'s take a quick tour to get you started, or you can skip and explore on your own.',
    placement: 'center',
  },
  {
    id: 'dashboard',
    target: '[data-onboarding="dashboard"]',
    title: 'Your Cosmic Command Center',
    content: 'This is your dashboard. Here you can track your readings, view insights, access your reading history, and see your personalized cosmic guidance. Everything you need is at your fingertips.',
    placement: 'bottom',
  },
  {
    id: 'tools',
    target: '[data-onboarding="tools"]',
    title: '60+ Divination Tools',
    content: 'Explore our collection of 60+ divination tools. From Vedic astrology to Tarot, Numerology to I Ching - each tool offers unique insights into your future using occult wisdom combined with AI forecasting.',
    placement: 'bottom',
  },
  {
    id: 'ask-seer',
    target: '[data-onboarding="ask-seer"]',
    title: 'Ask the Seer',
    content: 'Ask anything about your future. Our AI seer combines ancient occult wisdom with modern intelligence, hidden data patterns, and predictive analytics to provide genuine glimpses into what lies ahead.',
    placement: 'bottom',
  },
  {
    id: 'profile',
    target: '[data-onboarding="profile"]',
    title: 'Complete Your Profile',
    content: 'Add your birth details for personalized readings and accurate predictions. The more complete your profile, the more precise your future-seeing experience becomes.',
    placement: 'bottom',
  },
  {
    id: 'feedback',
    target: '[data-onboarding="feedback"]',
    title: 'Your Feedback Shapes FutureSeer',
    content: 'Click the feedback button anytime to share suggestions. Your feedback is implemented within 24-48 hours. You\'re part of the innovation team, and your voice matters.',
    placement: 'left',
  },
  {
    id: 'pricing',
    target: '[data-onboarding="pricing"]',
    title: 'Join the Innovation Experiment',
    content: 'Your contribution makes FutureSeer accessible to all. Choose to "Buy Me a Coffee" (monthly), "Treat Me" (quarterly), or "Buy a Festive Hamper" (annual). You\'re not buying a subscription - you\'re supporting innovation.',
    placement: 'bottom',
  },
];
