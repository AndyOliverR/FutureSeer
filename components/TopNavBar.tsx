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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Add keyboard support for closing menu
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  const toggleMenu = () => {
    console.log('Toggle menu clicked, current state:', showMenu);
    setShowMenu(prev => {
      const newState = !prev;
      console.log('New menu state:', newState);
      return newState;
    });
  };

  const closeMenu = () => {
    console.log('Closing menu');
    setShowMenu(false);
  };

  return (
    <nav className="w-full bg-slate-950/90 border-b border-yellow-700/20 shadow-lg px-4 py-2 flex items-center justify-between z-50 sticky top-0">
      <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent tracking-wide hover:scale-105 transition-transform">
        FutureSeer
      </Link>
      <div className="flex items-center gap-4">
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
          className="hamburger-button flex flex-col justify-center items-center w-10 h-10 focus:outline-none border-0 bg-transparent p-0 m-0"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          style={{ border: 'none', outline: 'none' }}
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'rotate-45 translate-y-1.5' : 'mb-1'}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'opacity-0' : 'mb-1'}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMenu ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
        
        {/* Navigation Menu - No Borders */}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-4 top-16 flex flex-col items-center z-50 bg-slate-900/95 backdrop-blur-sm rounded-lg p-4 shadow-xl"
            style={{ gap: '1.5rem', transformOrigin: 'top right' }}
          >
            {navLinks.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl text-yellow-200 hover:text-yellow-400 transition-all duration-200 p-2 hover:scale-110"
                onClick={closeMenu}
                tabIndex={0}
                aria-label={link.name}
                style={{ 
                  transition: 'all 0.3s cubic-bezier(.4,2,.6,1)', 
                  animationDelay: `${idx * 40}ms`,
                  animation: 'slideInFromTop 0.3s ease-out forwards'
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
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Override any button styling that might cause borders */
        button {
          border: none !important;
          outline: none !important;
          background: transparent !important;
        }
        
        /* Specific styling for hamburger button */
        .hamburger-button {
          border: none !important;
          outline: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </nav>
  );
}