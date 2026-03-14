"use client";

import React from "react";
import { ToolsLayoutClient } from "@/app/tools/ToolsLayoutClient";
import { ToolsProfileGate } from "@/app/tools/ToolsProfileGate";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#020617] relative overflow-x-hidden">
      {/* Universal Tools Background */}
      <div className="starfield-ultra-sharp fixed inset-0 z-0 pointer-events-none opacity-90" />

      {/* Content wrapper with M3 safe areas. Root layout renders BottomNavBar; visibility via .platform-android .bottom-nav-mobile in globals.css */}
      <main className="relative z-10 w-full min-h-screen pt-[env(safe-area-inset-top)] pb-24 md:pb-12">
        <ToolsProfileGate>
          <ToolsLayoutClient>{children}</ToolsLayoutClient>
        </ToolsProfileGate>
      </main>

      <style jsx global>{`
        /* Global Tool Page Sophistication */
        .glass-card {
          background: rgba(3, 7, 18, 0.75) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(251, 191, 36, 0.15) !important;
          border-radius: 24px !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
        }

        .gold-header {
          font-family: 'Cinzel', serif !important;
          color: #fbbf24 !important;
          text-shadow: 0 0 15px rgba(251, 191, 36, 0.3) !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
        }
      `}</style>
    </div>
  );
}
