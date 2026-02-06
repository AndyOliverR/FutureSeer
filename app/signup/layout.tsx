import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - FutureSeer",
  description: "Join FutureSeer and unlock the secrets of the cosmos with AI-powered mystical insights. Join the Innovation Experiment with personalized readings.",
  keywords: "sign up, create account, FutureSeer, astrology, divination, mystical insights, AI readings",
  openGraph: {
    title: "Sign Up - FutureSeer",
    description: "Join FutureSeer and unlock the secrets of the cosmos with AI-powered mystical insights.",
    type: "website",
    url: "https://futureseer.app/signup",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - FutureSeer",
    description: "Join FutureSeer and unlock the secrets of the cosmos with AI-powered mystical insights.",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
