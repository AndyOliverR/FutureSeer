"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Wrench, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Seer", href: "/ask-the-seer", icon: Sparkles },
  { name: "Community", href: "/community", icon: Users },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[var(--m3-surface-container-high)] border-t border-[var(--m3-outline-variant)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 min-w-0"
            >
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute top-0 w-14 h-8 bg-amber-500/20 rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>

                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive ? "text-amber-500" : "text-slate-400"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium mt-1 transition-colors duration-200 truncate w-full text-center",
                    isActive ? "text-amber-500" : "text-slate-400"
                  )}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
