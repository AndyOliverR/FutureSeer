import type { Metadata } from "next";
import { TopNavBar } from "@/components/TopNavBar";

export const metadata: Metadata = {
  title: "History - FutureSeer",
  description: "Review your past readings and cosmic insights from FutureSeer's AI-powered mystical guidance.",
  keywords: "reading history, mystical insights, past readings, astrology history",
  robots: "noindex, nofollow", // History is private, don't index
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavBar />
      {children}
    </>
  );
}
