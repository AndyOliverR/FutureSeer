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
    <div className="min-h-screen w-full min-w-0 max-w-full bg-[#020617] relative overflow-x-hidden">
      {/* Universal Tools Background */}
      <div className="starfield-ultra-sharp fixed inset-0 z-0 pointer-events-none opacity-90" />

      {/* Content wrapper with M3 safe areas. Root layout renders BottomNavBar; visibility via .platform-android .bottom-nav-mobile in globals.css */}
      <div className="relative z-10 w-full min-w-0 max-w-full min-h-screen pt-[env(safe-area-inset-top)] pb-24 md:pb-12 overflow-x-hidden">
        <ToolsProfileGate>
          <ToolsLayoutClient>
            <div className="w-full min-w-0 max-w-full">{children}</div>
          </ToolsLayoutClient>
        </ToolsProfileGate>
        <div className="mx-auto mt-4 px-4 md:px-6 max-w-7xl">
          <p className="text-[11px] md:text-xs text-slate-300/80 border border-amber-400/20 rounded-md bg-slate-900/35 px-3 py-2">
            FutureSeer reports and tool narratives are proprietary compiled content. Reuse requires visible attribution to
            {" "}
            <span className="font-medium text-amber-300">futureseer.app</span>.
          </p>
        </div>
      </div>

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
