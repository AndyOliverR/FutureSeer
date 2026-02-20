import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support - FutureSeer",
  description: "Get help and support for FutureSeer. Find answers, contact us, and explore our resources.",
  keywords: "support, help, FAQ, contact, customer service",
  robots: "index, follow",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
