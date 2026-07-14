"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Orbit, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home, ariaLabel: "Home" },
  {
    name: "Occult",
    href: "/tools",
    icon: Orbit,
    ariaLabel: "Occult / Divination tools",
  },
  { name: "Seer", href: "/ask-the-seer", icon: Sparkles, ariaLabel: "Ask the Seer" },
  { name: "Community", href: "/community/attribution", icon: Users, ariaLabel: "Community" },
  { name: "Profile", href: "/profile", icon: User, ariaLabel: "Profile" },
];

function getDataMobileOS(): string {
  if (typeof document === "undefined") return "desktop";
  return document.documentElement.getAttribute("data-mobile-os") || "desktop";
}

function getUseKonstaIOS(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-design-system") === "konsta-ios";
}

export function BottomNavBar() {
  const pathname = usePathname();
  const [mobileOS, setMobileOS] = useState(getDataMobileOS);
  const [useKonstaIOS, setUseKonstaIOS] = useState(getUseKonstaIOS);
  const isIOS = mobileOS === "ios" || useKonstaIOS;

  useEffect(() => {
    const sync = () => {
      setMobileOS(getDataMobileOS());
      setUseKonstaIOS(getUseKonstaIOS());
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mobile-os", "data-design-system"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={cn(
        "bottom-nav-mobile md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-[max(12px,env(safe-area-inset-bottom))]",
        isIOS ? "bottom-nav-ios" : "bg-[var(--m3-surface-container-high)] border-t border-[var(--m3-outline-variant)]"
      )}
    >
      <div className="flex w-full items-center justify-between min-h-[64px] px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.ariaLabel}
              title={item.ariaLabel}
              data-onboarding={
                item.href === "/tools"
                  ? "tools"
                  : item.href === "/ask-the-seer"
                  ? "ask-seer"
                  : item.href === "/profile"
                  ? "profile"
                  : undefined
              }
              className="fs-touch-target flex flex-col items-center justify-center flex-1 min-w-0 h-full group"
            >
              <div className="relative flex flex-col items-center justify-center">
                {!isIOS && isActive && (
                  <div
                    className="absolute -top-1 w-12 h-8 bg-amber-500/20 rounded-full -z-10 transition-opacity duration-200"
                    aria-hidden
                  />
                )}

                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive ? "text-amber-500" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium mt-1 transition-colors duration-200 truncate w-full text-center",
                    isActive ? "text-amber-500" : "text-slate-400 group-hover:text-slate-200"
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
