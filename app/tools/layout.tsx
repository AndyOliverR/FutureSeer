import type { Metadata } from "next";
import { ToolsLayoutClient } from "./ToolsLayoutClient";

export const metadata: Metadata = {
  title: "Tools - FutureSeer",
  description: "Explore FutureSeer's comprehensive collection of mystical and divination tools including astrology, tarot, numerology, and more.",
  keywords: "mystical tools, astrology, tarot, numerology, divination, spiritual tools",
  robots: "index, follow",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <ToolsLayoutClient>{children}</ToolsLayoutClient>;
}
