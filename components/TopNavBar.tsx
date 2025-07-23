   "use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "History", href: "/history", icon: "📜" },
  { name: "Profile", href: "/profile", icon: "👤" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
  { name: "Tools", href: "/tools", icon: "🧰" },
];

export function TopNavBar() {
  const [showMenu, setShowMenu] = useState(false);
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

  return (
    <nav className="w-full bg-slate-950/90 border-b border-yellow-700/20 shadow-lg px-4 py-2 flex items-center justify-between z-50 sticky top-0">
      <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent tracking-wide hover:scale-105 transition-transform">
        FutureSeer
      </Link>
      <div className="flex items-center gap-4">
        {/* Hamburger menu */}
        <button
          className="flex flex-col justify-center items-center w-10 h-10 rounded hover:bg-yellow-700/10 focus:outline-none"
          onClick={() => setShowMenu((v) => !v)}
          aria-label="Open navigation menu"
        >
          <span className="block w-6 h-0.5 bg-white mb-1 rounded"></span>
          <span className="block w-6 h-0.5 bg-white mb-1 rounded"></span>
          <span className="block w-6 h-0.5 bg-white rounded"></span>
        </button>
        <div
          ref={menuRef}
          className={`absolute right-4 top-16 flex flex-col items-center z-50 transition-all duration-300 ${showMenu ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
          style={{ gap: '1.5rem', transformOrigin: 'top right' }}
        >
          {showMenu && navLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-2xl text-yellow-200 hover:text-yellow-400 transition-colors p-2 bg-transparent border-none shadow-none"
              onClick={() => setShowMenu(false)}
              tabIndex={0}
              aria-label={link.name}
              style={{ transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)', transform: showMenu ? `translateY(0)` : `translateY(-10px)`, transitionDelay: `${idx * 40}ms` }}
            >
              <span>{link.icon}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}