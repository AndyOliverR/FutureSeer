"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ShareAppModal } from "./ShareAppModal";

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "History", href: "/history", icon: "📜" },
  { name: "Profile", href: "/profile", icon: "👤" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
  { name: "Tools", href: "/tools", icon: "🧰" },
  { name: "Pricing", href: "/pricing", icon: "💰" },
  { name: "Remedies", href: "/remedies", icon: "💎" },
  { name: "The Seer", href: "/seer", icon: "🔮" },
  { name: "Community", href: "/community/attribution", icon: "🏆" },
  { name: "Admin", href: "/admin/community-management", icon: "👑" },
];

export function TopNavBar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    console.log('Toggle menu clicked, current state:', showMenu);
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    console.log('Closing menu');
    setShowMenu(false);
  };

  return (
    <nav className="w-full bg-slate-950/90 border-b border-yellow-700/20 shadow-lg px-4 py-2 flex items-center justify-between z-50 sticky top-0 relative">
      <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent tracking-wide hover:scale-105 transition-transform">
        FutureSeer
      </Link>
      <div className="flex items-center gap-4 relative">
        {/* Mystical Share Button - Just Crystal Ball */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center justify-center w-10 h-10 text-2xl hover:scale-110 transition-all duration-200"
          aria-label="Share FutureSeer"
          title="Share FutureSeer"
        >
          <span>🔮</span>
        </button>
        
        {/* Hamburger menu removed - using HamburgerMenu component instead */}
      </div>
      
      {/* Share App Modal */}
      <ShareAppModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />
      
      <style jsx>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* COMPLETELY REMOVE ALL BORDERS AND FOCUS STYLES */
        * {
          --tw-ring-color: transparent !important;
          --tw-ring-offset-color: transparent !important;
          --tw-ring-offset-width: 0 !important;
          --tw-ring-width: 0 !important;
        }
        
        /* Remove ALL button styling EXCEPT hamburger button */
        button:not(.hamburger-button), button:focus:not(.hamburger-button), button:hover:not(.hamburger-button), button:active:not(.hamburger-button), button:focus-visible:not(.hamburger-button) {
          border: none !important;
          outline: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          ring: none !important;
          ring-width: 0 !important;
          ring-color: transparent !important;
        }
        
                 /* Specific styling for hamburger button - floating without background */
         .hamburger-button {
           border: none !important;
           outline: none !important;
           background: transparent !important;
           box-shadow: none !important;
           padding: 6px !important;
           margin: 0 !important;
           min-height: 40px !important;
           min-width: 40px !important;
           display: flex !important;
           align-items: center !important;
           justify-content: center !important;
           border-radius: 0 !important;
           position: relative !important;
           z-index: 1000 !important;
         }
         
         /* Ensure hamburger lines are visible */
         .hamburger-button span {
           background-color: white !important;
           height: 2px !important;
           width: 24px !important;
           display: block !important;
           margin: 2px 0 !important;
           transition: all 0.3s ease !important;
         }
        
        /* Remove ALL focus styles from everything */
        *:focus, *:focus-visible, *:focus-within {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          ring: none !important;
          ring-width: 0 !important;
          ring-color: transparent !important;
        }
        
        /* Specific menu styling to remove any borders */
        div[ref] {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </nav>
  );
}