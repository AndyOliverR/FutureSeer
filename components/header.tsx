import Link from "next/link"
import { TopNavBar } from "./TopNavBar"

export function Header() {
  return (
    <header className="w-screen relative left-1/2 -translate-x-1/2 max-w-[100vw] box-border overflow-x-hidden">
      <TopNavBar />
    </header>
  )
} 