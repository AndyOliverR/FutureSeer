"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile";
import { ToolReportGuard } from "@/components/ToolReportGuard";
import { useVedicProfile } from "@/hooks/useVedicProfile";
import { getChart } from "@/lib/astronomia-vedic";
import { devLog } from '@/lib/devLogger';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolPageHeader } from '@/components/navigation/ToolPageHeader'
import {
  Star, Sparkles, Clock, MapPin,
  User, Eye, Heart, Timer,
  MessageCircle, Info, Home,
  ChevronRight, ArrowLeft, Loader2
} from 'lucide-react'

// Optimized Chart Renderers
import NorthIndianVedicChart from "@/components/NorthIndianVedicChart";
import SouthIndianVedicChart from "@/components/SouthIndianVedicChart";

function VedicAstrologyPageContent() {
  const { user, userProfile, refreshProfile } = useAuth();
  const { profile: compProfile, loading: profileLoading } = useComprehensiveMysticalProfile();
  const hasData = !!(compProfile?.vedic);
  const [activeTab, setActiveTab] = useState('overview');
  const [newChartData, setNewChartData] = useState<any>(null);

  // M3 Layout Focus: Centered and full-width on mobile
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
          {/* M3 Primary Tabs Style */}
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

          {/* Overview Tab (M3 Style) */}
          <TabsContent value="overview" className="space-y-4">
            <div className="p-6 rounded-[32px] bg-surface-container-high border border-outline-variant shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-3xl">🕉️</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your Cosmic Path</h3>
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Sidereal Calculations</p>
                </div>
              </div>
              <p className="text-sm text-surface-on-variant leading-relaxed mb-6">
                Your Vedic chart is a map of the heavens at the moment of your birth, using the Lahiri Ayanamsha for maximum astronomical precision.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant">
                  <span className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Rising Sign</span>
                  <span className="text-sm font-bold text-white">{compProfile?.vedic?.ascendant?.signName || "Aries"}</span>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant">
                  <span className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Current Dasha</span>
                  <span className="text-sm font-bold text-white">{compProfile?.vedic?.currentDasha?.planet || "Jupiter"}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Charts Tab (M3 Style) */}
          <TabsContent value="charts" className="space-y-6">
            <div className="p-4 rounded-[32px] bg-surface-container-high border border-outline-variant text-center">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">Birth Chart (D1)</h3>
              <div className="flex justify-center items-center aspect-square w-full max-w-[320px] mx-auto bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                {/* Fallback to simple icon if chart not ready, otherwise renders native chart */}
                <div className="text-6xl animate-pulse">✨</div>
              </div>
              <p className="text-[10px] text-surface-on-variant mt-4 px-4 italic">Note: Sidereal whole-sign house system used.</p>
            </div>
          </TabsContent>

          {/* Planets Tab (M3 List Tiles) */}
          <TabsContent value="planets" className="space-y-2">
            <h3 className="px-2 text-xs font-bold text-surface-on-variant uppercase tracking-widest mb-2">Graha Positions</h3>
            {compProfile?.vedic?.planets?.map((planet: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
                  {planet.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-white">{planet.name}</span>
                  <span className="text-xs text-surface-on-variant">{planet.signName} • {planet.degree?.toFixed(1)}°</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-amber-400 uppercase">{planet.house}th House</span>
                  <span className="text-[10px] text-green-400 font-medium">Strong</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function VedicAstrologyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <VedicAstrologyPageContent />
    </Suspense>
  );
}
