"use client";
import Link from "next/link";
import { useState } from "react";
import { ShareAppModal } from "./ShareAppModal";

export function TopNavBar() {
  const [showShareModal, setShowShareModal] = useState(false);

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
      </div>
      
      {/* Share App Modal */}
      <ShareAppModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />
    </nav>
  );
}