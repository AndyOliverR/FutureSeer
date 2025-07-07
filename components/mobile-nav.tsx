"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function MobileNav() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/daily", label: "Daily", icon: "📅" },
    { href: "/ask", label: "Ask Seer", icon: "🔮" },
    { href: "/tools", label: "Tools", icon: "⚡" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/history", label: "History", icon: "📚" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 glass-card rounded-2xl lg:hidden"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className={`w-5 h-0.5 bg-soft transition-all ${isOpen ? "rotate-45 translate-y-1" : ""}`} />
          <div className={`w-5 h-0.5 bg-soft transition-all mt-1 ${isOpen ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-soft transition-all mt-1 ${isOpen ? "-rotate-45 -translate-y-1" : ""}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden">
          <div className="absolute top-0 right-0 h-full w-80 glass-card p-6">
            {/* User Info */}
            {user && (
              <div className="mb-8 p-4 glass-card rounded-2xl">
                <div className="text-soft font-medium mb-2">Welcome back</div>
                <div className="text-soft/70 text-sm">{user.email}</div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-4 p-4 glass-card rounded-2xl text-soft hover:bg-white/10 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Sign Out */}
            {user && (
              <div className="mt-8 pt-8 border-t border-white/20">
                <button
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-4 p-4 glass-card rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/subscribe"
                  onClick={() => setIsOpen(false)}
                  className="p-3 glass-card rounded-2xl text-center text-soft hover:bg-white/10 transition-colors"
                >
                  <div className="text-lg mb-1">💎</div>
                  <div className="text-xs">Upgrade</div>
                </Link>
                <Link
                  href="/ask"
                  onClick={() => setIsOpen(false)}
                  className="p-3 glass-card rounded-2xl text-center text-soft hover:bg-white/10 transition-colors"
                >
                  <div className="text-lg mb-1">🔮</div>
                  <div className="text-xs">Quick Ask</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 