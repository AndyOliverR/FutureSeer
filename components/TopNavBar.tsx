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
        
                 {/* Hamburger menu */}
                             <button
            className="hamburger-button flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span 
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'rotate-45 translate-y-1.5' : 'mb-1'}`}
              style={{ backgroundColor: 'white', height: '2px', width: '24px' }}
            ></span>
            <span 
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'opacity-0' : 'mb-1'}`}
              style={{ backgroundColor: 'white', height: '2px', width: '24px' }}
            ></span>
            <span 
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMenu ? '-rotate-45 -translate-y-1.5' : ''}`}
              style={{ backgroundColor: 'white', height: '2px', width: '24px' }}
            ></span>
          </button>
        
                 {/* Navigation Menu - Floating in space */}
         {showMenu && (
           <div
             key={`menu-${showMenu}`}
             ref={menuRef}
             className="hamburger-menu absolute right-0 top-12 flex flex-col items-end z-[9999]"
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
                                                   {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xl text-white hover:text-yellow-300 transition-all duration-300 p-1 hover:scale-110"
                  onClick={closeMenu}
                  tabIndex={0}
                  aria-label={link.name}
                  style={{ 
                    transition: 'all 0.3s cubic-bezier(.4,2,.6,1)', 
                    animationDelay: `${idx * 50}ms`,
                    animation: 'floatIn 0.5s ease-out forwards'
                  }}
                >
                  <span>{link.icon}</span>
                </Link>
              ))}
          </div>
        )}
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