"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Info, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTipJar } from "@/components/TipJarContext";
import { useFeedback } from "@/components/FeedbackContext";
import { useModalOpen } from "@/components/ModalOpenContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareAppModal } from "@/components/ShareAppModal";
import { UserMenuDropdown } from "@/components/UserMenuDropdown";
import { FutureSeerWordmark } from "@/components/brand/FutureSeerWordmark";

const navLinks = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Profile", href: "/profile", icon: "👤" },
  { name: "Mystical Profile", href: "/mystical-profile", icon: "✨" },
  { name: "Tools", href: "/tools", icon: "🧰" },
  { name: "Ask the Seer", href: "/ask-the-seer", icon: "🔮" },
  { name: "Community", href: "/community/attribution", icon: "🏆" },
  { name: "Remedies", href: "/remedies", icon: "💎" },
  { name: "Tip Jar", href: "/tip-jar", icon: "💝", isModal: true },
  { name: "Settings", href: "/settings", icon: "⚙️" },
  { name: "Pricing", href: "/pricing", icon: "💰" },
  { name: "About", href: "/about", icon: "ℹ️" },
  { name: "Terms", href: "/terms", icon: "📄" },
  { name: "Privacy", href: "/privacy", icon: "🔒" },
  // Admin-only entry visible only to isAdmin / isSuperadmin
  { name: "Admin Dashboard", href: "/admin/dashboard", icon: "🛡️", adminOnly: true as const },
];

export function TopNavBar() {
  const router = useRouter();
  const { user, userProfile, isAdmin, isSuperadmin, signOut } = useAuth();
  const { open: openTipJar } = useTipJar();
  const { open: openFeedback } = useFeedback();
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const { registerModal } = useModalOpen();

  useEffect(() => {
    if (showShareModal) return registerModal();
  }, [showShareModal, registerModal]);

  // Prefetch community when menu opens so the chunk can load before the user clicks
  useEffect(() => {
    if (showMenu) router.prefetch("/community/attribution");
  }, [showMenu, router]);

  const visibleNavLinks = navLinks.filter((link) =>
    link.adminOnly ? (isAdmin || isSuperadmin) : true
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowMenu(false); };
    if (showMenu) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showMenu]);

  // Close when tapping/clicking outside the menu panel and hamburger toggle.
  // Uses a delayed `click` listener instead of `pointerdown` to avoid iOS Safari
  // dispatching residual pointer/mouse events from the same tap that opened the menu.
  useEffect(() => {
    if (!showMenu) return;
    let handler: ((e: MouseEvent) => void) | null = null;
    const timerId = window.setTimeout(() => {
      handler = (e: MouseEvent) => {
        const target = e.target as Node | null;
        if (!target) return;
        if (menuRef.current?.contains(target)) return;
        if (menuToggleRef.current?.contains(target)) return;
        setShowMenu(false);
      };
      document.addEventListener("click", handler, true);
    }, 50);
    return () => {
      clearTimeout(timerId);
      if (handler) document.removeEventListener("click", handler, true);
    };
  }, [showMenu]);

  return (
    <>
    <TooltipProvider>
      <nav className="w-full min-w-0 max-w-full overflow-x-clip bg-[var(--m3-surface)]/95 backdrop-blur-xl border-b border-[var(--m3-outline-variant)] pt-[env(safe-area-inset-top)] px-4 flex items-center justify-between z-[100] sticky top-0 left-0 right-0 box-border select-none" role="navigation">
        <FutureSeerWordmark href="/" size="md" className="flex items-center h-14" />

        <div className="flex items-center gap-1">
          {/* About Button - Increased to 48px for Android */}
          <Link
            href="/about"
            className="flex items-center justify-center w-12 h-12 text-amber-400 active:scale-90 transition-transform"
            aria-label="About"
          >
            <Info className="w-6 h-6" />
          </Link>

          {/* Share Button - Increased to 48px for Android */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center w-12 h-12 text-amber-400 active:scale-90 transition-transform"
            aria-label="Share"
          >
            <Share2 className="w-6 h-6" />
          </button>

          {/* User avatar dropdown (Profile, Settings, Sign out) when logged in */}
          {user && (
            <div className="flex items-center shrink-0">
              <UserMenuDropdown
                userName={userProfile?.displayName || user.displayName || user.email?.split("@")[0] || "User"}
                userEmail={user.email ?? undefined}
                userPhotoURL={user.photoURL ?? userProfile?.photoURL ?? undefined}
              />
            </div>
          )}

          {/* Hamburger + panel: panel must sit below the trigger (top-14 vs safe-area used to overlap the row on iPhone). */}
          <div className="relative shrink-0">
          <button
            ref={menuToggleRef}
            type="button"
            data-topnav-menu-toggle
            className="touch-manipulation flex flex-col justify-center items-center w-12 h-12 relative z-10"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-expanded={showMenu}
            aria-haspopup="true"
            aria-label={showMenu ? "Close menu" : "Open menu"}
          >
            <span className={`block w-6 h-0.5 bg-amber-400 transition-all ${showMenu ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></span>
            <span className={`block w-6 h-0.5 bg-amber-400 transition-all ${showMenu ? 'opacity-0' : 'mb-1.5'}`}></span>
            <span className={`block w-6 h-0.5 bg-amber-400 transition-all ${showMenu ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              ref={menuRef}
              className="absolute right-0 top-full z-[10000] mt-2 flex flex-col items-end w-[min(18rem,calc(100vw-2rem))] max-w-[calc(100vw-1rem)] sm:w-[min(20rem,calc(100vw-2.5rem))] md:w-auto bg-surface-container-high border border-outline-variant rounded-2xl p-2 shadow-2xl"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
            >
              {visibleNavLinks.map((link) =>
                link.isModal && link.name === "Tip Jar" ? (
                  <button
                    key={link.href}
                    type="button"
                    className="flex items-center gap-4 w-full text-left px-4 py-3 rounded-xl text-white active:bg-amber-500/20 transition-colors"
                    onClick={() => {
                      setShowMenu(false);
                      openTipJar();
                    }}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="text-sm font-bold">{link.name}</span>
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-onboarding={
                      link.href === "/tools"
                        ? "tools"
                        : link.href === "/ask-the-seer"
                        ? "ask-seer"
                        : link.href === "/profile"
                        ? "profile"
                        : link.href === "/pricing"
                        ? "pricing"
                        : undefined
                    }
                    className="flex items-center gap-4 w-full text-left px-4 py-3 rounded-xl text-white active:bg-amber-500/20 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="text-sm font-bold">{link.name}</span>
                  </Link>
                )
              )}
              <button
                type="button"
                className="flex items-center gap-4 w-full text-left px-4 py-3 rounded-xl text-white active:bg-amber-500/20 transition-colors border-t border-outline-variant mt-1 pt-3"
                onClick={() => {
                  setShowMenu(false);
                  signOut();
                }}
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">Sign out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
      </div>
      </nav>
    </TooltipProvider>
    {showMenu && (
      <div className="fixed inset-0 z-[99] bg-black/25" aria-hidden="true" />
    )}
    <ShareAppModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </>
  );
}
