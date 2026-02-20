import Link from "next/link"
import { TopNavBar } from "./TopNavBar"

export function Header() {
  return (
    <header className="w-full box-border flex-shrink-0 min-h-[52px]">
      <TopNavBar />
    </header>
  )
} 