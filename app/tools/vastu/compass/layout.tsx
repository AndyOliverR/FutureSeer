import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vastu Compass | 4–45 Field Precision | FutureSeer",
  description:
    "Full-screen Vastu compass with live dial: four cardinals through 45 energy-field sectors (8°), plus 8, 16, and 32 precision.",
}

export default function VastuCompassLayout({ children }: { children: React.ReactNode }) {
  return children
}
