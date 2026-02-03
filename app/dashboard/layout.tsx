import type { Metadata } from "next";
import { TopNavBar } from "@/components/TopNavBar";

export const metadata: Metadata = {
  title: "Dashboard - FutureSeer",
  description: "Your personalized FutureSeer dashboard. Track readings, view insights, and explore mystical guidance powered by AI.",
  keywords: "dashboard, readings, insights, mystical guidance, astrology, divination",
  robots: "noindex, nofollow", // Dashboard is private, don't index
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavBar />
      {children}
    </>
  );
}
