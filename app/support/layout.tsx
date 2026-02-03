import type { Metadata } from "next";
import { TopNavBar } from "@/components/TopNavBar";

export const metadata: Metadata = {
  title: "Support - FutureSeer",
  description: "Get help and support for FutureSeer. Find answers, contact us, and explore our resources.",
  keywords: "support, help, FAQ, contact, customer service",
  robots: "index, follow",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavBar />
      {children}
    </>
  );
}
