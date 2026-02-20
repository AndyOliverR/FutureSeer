import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes - FutureSeer",
  description: "Manage your mystical notes and insights with FutureSeer.",
  keywords: "mystical notes, spiritual journal, divination notes",
  robots: "noindex, nofollow", // Notes are private, don't index
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
