"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile";
import { ToolReportGuard } from "@/components/ToolReportGuard";
import { ToolPageHeader } from '@/components/navigation/ToolPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab";
import { CompatibilityTab } from "@/components/compatibility/CompatibilityTab";
import {
  Sparkles, ChevronRight, Loader2
} from 'lucide-react'

// Optimized Chart Renderers
import NorthIndianVedicChart from "@/components/NorthIndianVedicChart";
import SouthIndianVedicChart from "@/components/SouthIndianVedicChart";

function VedicAstrologyPageContent() {
  const { userProfile } = useAuth();
  const { profile: compProfile, loading: profileLoading, error: profileError } = useComprehensiveMysticalProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsAndroid(/Android/i.test(navigator.userAgent));
  }, []);

  const hasVedicData = !!compProfile?.vedic;

  // Helper to safely get sign name from potentially number or object
  const getSignName = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val?.signName) return val.signName;
    return "Aries"; // Fallback
  };

  if (isAndroid) {
    return (
      <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-24 overflow-x-hidden">
        <div className="px-4">
          <ToolPageHeader
            toolName="Vedic Astrology"
            toolSlug="vedic"
            toolCategory="Astrology"
            toolDescription="Ancient wisdom of Jyotish with precise sidereal calculations."
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full overflow-x-auto no-scrollbar bg-surface-container-high rounded-2xl p-1 mb-6 gap-1 border border-outline-variant">
              {['Overview', 'Charts', 'Planets', 'Houses', 'Dasha', 'Remedies'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="flex-1 min-w-[100px] h-10 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-lg text-xs font-bold transition-all uppercase tracking-widest"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="p-6 rounded-[32px] bg-surface-container-high border border-outline-variant shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-3xl shadow-inner">🕉️</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Your Cosmic Path</h3>
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-widest leading-none">Sidereal calculations</p>
                  </div>
                </div>
                <p className="text-sm text-surface-on-variant leading-relaxed mb-6 font-normal">
                  Your Vedic chart is a map of the heavens at the moment of your birth, using the Lahiri Ayanamsha for maximum precision.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant">
                    <span className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Rising Sign</span>
                    <span className="text-sm font-bold text-white">{getSignName(compProfile?.vedic?.ascendant)}</span>
                  </div>
                  <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant">
                    <span className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Dasha</span>
                    <span className="text-sm font-bold text-white">{compProfile?.vedic?.currentDasha?.planet || "Jupiter"}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <div className="p-4 rounded-[32px] bg-surface-container-high border border-outline-variant text-center shadow-xl">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">Birth Chart (D1)</h3>
                <div className="flex justify-center items-center aspect-square w-full max-w-[320px] mx-auto bg-black/20 rounded-2xl border border-outline-variant shadow-inner">
                  <div className="text-6xl animate-pulse">✨</div>
                </div>
                <p className="text-[10px] text-surface-on-variant mt-4 px-4 font-medium opacity-60">NOTE: SIDEREAL WHOLE-SIGN HOUSE SYSTEM</p>
              </div>
            </TabsContent>

            <TabsContent value="planets" className="space-y-2">
              <h3 className="px-2 text-xs font-bold text-surface-on-variant uppercase tracking-widest mb-2 opacity-70">Graha Positions</h3>
              {compProfile?.vedic?.planets?.map((planet: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 active:bg-surface-container-high transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold shadow-sm">
                    {planet.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold text-white text-sm">{planet.name}</span>
                    <span className="text-xs text-surface-on-variant font-medium">{getSignName(planet)} • {planet.degree?.toFixed(1)}°</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-tighter">{planet.house}th House</span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // WEB VERSION (RESTORING FULL COMPLEX UI)
  return (
    <ToolReportGuard loading={profileLoading} error={profileError ?? null} toolLabel="Vedic astrology">
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <ToolPageHeader
            toolName="Vedic Astrology"
            toolSlug="vedic"
            toolCategory="Astrology"
            toolDescription="Comprehensive sidereal birth chart analysis and interpretations."
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-1 mb-8">
              {['Introduction', 'Compatibility', 'Overview', 'Charts', 'Planets', 'Houses', 'Dasha', 'Remedies'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 rounded-xl px-6 py-2 transition-all font-heading uppercase tracking-widest text-xs"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="introduction"><ToolIntroductionTab toolSlug="vedic" /></TabsContent>
            <TabsContent value="compatibility"><CompatibilityTab toolSlug="vedic" /></TabsContent>
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/20 rounded-[40px] shadow-2xl">
                  <h3 className="text-3xl font-heading font-light text-amber-400 mb-6 uppercase tracking-widest">Cosmic Overview</h3>
                  <p className="text-slate-300 leading-relaxed font-light text-lg">
                    Your soul's blueprint revealed through the lens of ancient Jyotish wisdom.
                    {compProfile?.interpretations?.personality?.overview}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">Ascendant</span>
                    <span className="text-2xl font-heading text-white">{getSignName(compProfile?.vedic?.ascendant)}</span>
                  </div>
                  <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">Mahadasha</span>
                    <span className="text-2xl font-heading text-white">{compProfile?.vedic?.currentDasha?.planet || "N/A"}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolReportGuard>
  );
}

export default function VedicAstrologyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <VedicAstrologyPageContent />
    </Suspense>
  );
}
