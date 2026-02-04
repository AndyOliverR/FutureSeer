"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareAppModal } from "./ShareAppModal";
import { Share2, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navLinks = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "History", href: "/history", icon: "📜" },
  { name: "Profile", href: "/profile", icon: "👤" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
  { name: "Tools", href: "/tools", icon: "🧰" },
  { name: "Pricing", href: "/pricing", icon: "💰" },
  { name: "About", href: "/about", icon: "ℹ️" },
  { name: "Remedies", href: "/remedies", icon: "💎" },
  { name: "Ask the Seer", href: "/ask-the-seer", icon: "🔮" },
  { name: "Community", href: "/community", icon: "🏆" },
  { name: "Admin Dashboard", href: "/admin/dashboard", icon: "👑" },
  { name: "Admin", href: "/admin/community-management", icon: "🛡️" },
  { name: "Support Desk", href: "/admin/support", icon: "📋" },
  { name: "Feedback", href: "/admin/feedback", icon: "💬" },
];

export function TopNavBar() {
  const { isAdmin, isSuperadmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const visibleNavLinks = navLinks.filter(
    (link) =>
      (link.name !== "Admin Dashboard" && link.name !== "Admin" && link.name !== "Support Desk" && link.name !== "Feedback") ||
      isAdmin ||
      isSuperadmin
  );

  // Removed click outside handler - menu only closes on hamburger button click

  // Keyboard support
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
    <TooltipProvider>
      <nav className="bg-[var(--m3-surface)] backdrop-blur-xl border-b border-[var(--m3-outline-variant)] py-2 flex items-center justify-between z-[100] sticky top-0 left-0 right-0" role="navigation" aria-label="Main navigation" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', paddingLeft: '1rem', paddingRight: 'max(1rem, calc(1rem + 17px))', boxSizing: 'border-box' }}>
        <Link 
          href="/" 
          className="futureseer-logo text-2xl font-semibold tracking-wide hover:scale-105 transition-transform text-amber-400 relative z-[101] flex items-center h-10 focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 rounded"
          aria-label="FutureSeer - Home"
        >
          FutureSeer
        </Link>
        <div className="flex items-center gap-4 relative z-[101]">
          {/* About Button with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/about"
                className="flex items-center justify-center w-10 h-10 hover:scale-110 transition-all duration-200 text-amber-400 text-[var(--m3-primary)] hover:text-[var(--m3-primary)]/80 relative z-[102] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 rounded"
                aria-label="Learn about FutureSeer"
              >
                <Info className="w-5 h-5 text-current" />
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-[var(--m3-surface-container-high)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)]">
              <p>About FutureSeer</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Share Button with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <button
                  ref={shareButtonRef}
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center w-10 h-10 hover:scale-110 transition-all duration-200 text-amber-400 text-[var(--m3-primary)] hover:text-[var(--m3-primary)]/80 relative z-[102] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 rounded"
                  aria-label="Share FutureSeer with others"
                >
                  <Share2 className="w-5 h-5 text-current" />
                </button>
                
                {/* Share Popup - Positioned near share button */}
                {showShareModal && (
                  <ShareAppModal 
                    isOpen={showShareModal} 
                    onClose={() => setShowShareModal(false)}
                    buttonRef={shareButtonRef as React.RefObject<HTMLButtonElement>}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[var(--m3-surface-container-high)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)]">
              <p>Share FutureSeer</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Hamburger menu with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="hamburger-button flex flex-col justify-center items-center w-10 h-10 relative z-[102] focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 rounded m3-ripple m3-button-bounce m3-transition-standard hover:m3-elevation-1 will-change-transform"
                onClick={toggleMenu}
                aria-label={showMenu ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={showMenu}
                aria-controls="main-navigation-menu"
                style={{ opacity: 1, visibility: 'visible' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
            <motion.span 
              className={`block w-6 h-0.5 bg-[var(--m3-primary)] m3-transition-standard ${showMenu ? 'rotate-45 translate-y-1.5' : 'mb-1'}`}
              style={{ backgroundColor: 'var(--m3-primary)', height: '2px', width: '24px', opacity: 1, visibility: 'visible' }}
              aria-hidden="true"
              animate={showMenu ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ ease: [0.2, 0, 0, 1], duration: 0.3 }}
            ></motion.span>
            <motion.span 
              className={`block w-6 h-0.5 bg-[var(--m3-primary)] m3-transition-standard ${showMenu ? 'opacity-0' : 'mb-1'}`}
              style={{ backgroundColor: 'var(--m3-primary)', height: '2px', width: '24px' }}
              aria-hidden="true"
              animate={showMenu ? { opacity: 0 } : { opacity: 1 }}
              transition={{ ease: [0.2, 0, 0, 1], duration: 0.3 }}
            ></motion.span>
            <motion.span 
              className={`block w-6 h-0.5 bg-[var(--m3-primary)] m3-transition-standard ${showMenu ? '-rotate-45 -translate-y-1.5' : ''}`}
              style={{ backgroundColor: 'var(--m3-primary)', height: '2px', width: '24px', opacity: 1, visibility: 'visible' }}
              aria-hidden="true"
              animate={showMenu ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ ease: [0.2, 0, 0, 1], duration: 0.3 }}
            ></motion.span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent className="bg-[var(--m3-surface-container-high)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)]">
              <p>{showMenu ? "Close menu" : "Open menu"}</p>
            </TooltipContent>
          </Tooltip>
        
        {/* Navigation Menu - Floating in space */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              key={`menu-${showMenu}`}
              ref={menuRef}
              id="main-navigation-menu"
              role="menu"
              className="hamburger-menu nav-menu-scroll absolute right-0 top-12 flex flex-col items-end z-[9999] bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)] rounded-lg p-2 m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition m3-gpu-accelerated min-w-[240px] max-h-[min(90vh,36rem)] overflow-y-auto overflow-x-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, ease: [0, 0, 0.2, 1] }}
              style={{ 
                gap: '0.75rem', 
                minWidth: '200px',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
                padding: '0.5rem',
                paddingRight: '0'
              }}
            >
              {visibleNavLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{ 
                    delay: idx * 0.05,
                    ease: [0, 0, 0.2, 1],
                    duration: 0.3
                  }}
                >
                  <Link
                    href={link.href}
                    role="menuitem"
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] m3-transition-standard focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 will-change-transform m3-body-medium active:bg-[var(--m3-primary-container)]/80"
                    onClick={closeMenu}
                    tabIndex={0}
                    aria-label={`Navigate to ${link.name}`}
                  >
                    <span aria-hidden="true" className="text-xl">{link.icon}</span>
                    <span className="m3-label-large">{link.name}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx>{`
        /* Keep focus styles for accessibility - Use visible amber outline */
        nav a:focus-visible,
        nav button:focus-visible {
          outline: 2px solid #fbbf24 !important;
          outline-offset: 2px !important;
          border-radius: 4px !important;
        }
        
        /* Remove default focus ring but keep our custom one */
        nav * {
          --tw-ring-color: transparent !important;
          --tw-ring-offset-color: transparent !important;
          --tw-ring-offset-width: 0 !important;
          --tw-ring-width: 0 !important;
        }
        
        /* Button styling - Remove default borders but keep accessibility */
        nav button:not(.hamburger-button) {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Specific styling for hamburger button - floating without background */
        .hamburger-button {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 6px !important;
          margin: 0 !important;
          min-height: 40px !important;
          min-width: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 4px !important;
          position: relative !important;
          z-index: 1000 !important;
        }
         
         /* Ensure hamburger lines are visible - Amber color for better contrast */
         .hamburger-button span {
           background-color: #fbbf24 !important; /* Amber for better visibility */
           height: 2px !important; /* Changed from 3px to match Lucide icons */
           width: 24px !important;
           display: block !important;
           margin: 2px 0 !important; /* Changed from 3px for tighter spacing */
         }
         
         /* Hover state for better discoverability */
         .hamburger-button:hover span {
           background-color: #fcd34d !important; /* Lighter amber on hover */
         }
        
        /* Menu styling */
        nav div[ref] {
          border: none !important;
          box-shadow: none !important;
        }

        /* Hide scrollbar on nav menu but keep scroll (wheel, touch, keyboard) */
        :global(.nav-menu-scroll) {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        :global(.nav-menu-scroll)::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </nav>
    </TooltipProvider>
    </>
  );
}