"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile";
import { ToolReportGuard } from "@/components/ToolReportGuard";
import { ToolPageHeader } from '@/components/navigation/ToolPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab";
import { CompatibilityTab } from "@/components/compatibility/CompatibilityTab";
import ComprehensiveVedicReport, { type ComprehensiveAnalysis } from "@/components/vedic/ComprehensiveVedicReport";
import { DashaPanelSimplified } from "@/components/vedic/DashaPanelSimplified";
import { GotraTab } from "@/components/vedic/GotraTab";
import VedicSeerChatInterface from "@/components/VedicSeerChatInterface";
import { DevotionistStyleCard } from "@/components/western/DevotionistStyleCard";
import {
  Sparkles, ChevronRight, Loader2, MessageCircle, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Optimized Chart Renderers
import NorthIndianVedicChart from "@/components/NorthIndianVedicChart";
import SouthIndianVedicChart from "@/components/SouthIndianVedicChart";
import VedicChartEast from "@/components/EastIndianVedicChart";
import VedicChartCircular from "@/components/VedicChartCircular";
import { getDivisionalCharts } from "@/lib/astronomia-vedic";

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_LORDS: Record<number, string> = { 0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter' };

function signNameToIndex(name: string): number {
  const i = SIGN_NAMES.findIndex((s) => s.toLowerCase() === (name || '').toLowerCase());
  return i >= 0 ? i : 0;
}

function VedicAstrologyPageContent() {
  const { user, userProfile } = useAuth();
  const { profile: compProfile, loading: profileLoading, error: profileError } = useComprehensiveMysticalProfile();
  const [activeTab, setActiveTab] = useState('overview');

  const hasVedicData = !!compProfile?.vedic;

  // Reduced motion (match Western astrology page)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Tab config for web – match Western astrology (value/label)
  const tabsConfig = useMemo(() => [
    { value: 'introduction', label: 'Introduction' },
    { value: 'compatibility', label: 'Compatibility' },
    { value: 'overview', label: 'Overview' },
    { value: 'charts', label: 'Charts' },
    { value: 'planets', label: 'Planets' },
    { value: 'houses', label: 'Houses' },
    { value: 'dasha', label: 'Dasha' },
    { value: 'remedies', label: 'Remedies' },
    { value: 'gotra', label: 'Gotra' },
    { value: 'ask-the-seer', label: 'Ask the Seer' },
  ], []);

  // Page-level Vedic comprehensive report (planetaryAnalysis, houseAnalysis) for Planets/Houses tabs and Overview
  const [vedicComprehensiveReport, setVedicComprehensiveReport] = useState<ComprehensiveAnalysis | null>(null);
  const [loadingVedicComprehensive, setLoadingVedicComprehensive] = useState(false);
  const [vedicComprehensiveError, setVedicComprehensiveError] = useState<string | null>(null);
  const [vedicReportFetchTrigger, setVedicReportFetchTrigger] = useState(0);
  // Prefer page state, then stored profile (from generate-mystical): vedic.comprehensiveAnalysis, toolReports.vedic.data, or top-level
  const effectiveVedicReport =
    vedicComprehensiveReport ??
    ((compProfile as Record<string, unknown> | null)?.vedic as Record<string, unknown> | undefined)?.comprehensiveAnalysis ??
    (compProfile as Record<string, unknown> | null)?.vedicComprehensiveAnalysis ??
    ((compProfile as Record<string, unknown> | null)?.toolReports as Record<string, { data?: Record<string, unknown> }> | undefined)?.vedic?.data?.comprehensiveAnalysis ??
    ((compProfile as Record<string, unknown> | null)?.toolReports as Record<string, { data?: Record<string, unknown> }> | undefined)?.vedic?.data ?? null;

  // Normalize report so Planets/Houses/Remedies always get arrays (API may return different key names or shapes)
  // Single source for tabs: normalized report or raw report (so we always have something when Overview has loaded)
  const reportForTabs = useMemo(() => {
    const r = effectiveVedicReport as Record<string, unknown> | null;
    if (!r) return null;
    return r;
  }, [effectiveVedicReport]);

  const normalizedReport = useMemo(() => {
    const r = effectiveVedicReport as Record<string, unknown> | null;
    if (!r) return null;
    const toPlanetaryArray = (raw: unknown): Array<{ planet: string; analysis: string }> => {
      if (Array.isArray(raw)) {
        return raw.map((x: any) => ({
          planet: String(x?.planet ?? x?.planetName ?? x?.name ?? ''),
          analysis: String(x?.analysis ?? x?.text ?? x?.summary ?? '')
        })).filter((x) => x.planet || x.analysis);
      }
      if (raw && typeof raw === 'object') {
        return Object.entries(raw).map(([planet, val]: [string, any]) => ({
          planet,
          analysis: typeof val === 'string' ? val : String(val?.analysis ?? val?.text ?? val?.summary ?? '')
        })).filter((x) => x.analysis);
      }
      return [];
    };
    const toHouseArray = (raw: unknown): Array<{ house: number; analysis: string }> => {
      if (Array.isArray(raw)) {
        return raw.map((x: any) => ({
          house: Number(x?.house ?? x?.houseNumber ?? x?.number ?? 0),
          analysis: String(x?.analysis ?? x?.text ?? x?.summary ?? '')
        })).filter((x) => x.house >= 1 && x.house <= 12);
      }
      if (raw && typeof raw === 'object') {
        return Object.entries(raw).map(([k, val]: [string, any]) => ({
          house: parseInt(k, 10) || 0,
          analysis: typeof val === 'string' ? val : String(val?.analysis ?? val?.text ?? val?.summary ?? '')
        })).filter((x) => x.house >= 1 && x.house <= 12);
      }
      return [];
    };
    const planetary = toPlanetaryArray(r.planetaryAnalysis ?? (r as any).planetary_analysis);
    const house = toHouseArray(r.houseAnalysis ?? (r as any).house_analysis);
    return {
      ...r,
      chartOverview: r.chartOverview ?? (r as any).chart_overview ?? '',
      planetaryAnalysis: planetary.length ? planetary : (r.planetaryAnalysis as any[]) ?? [],
      houseAnalysis: house.length ? house : (r.houseAnalysis as any[]) ?? [],
      predictiveInsights: r.predictiveInsights ?? (r as any).predictive_insights ?? {},
      challengesAndOpportunities: r.challengesAndOpportunities ?? (r as any).challenges_and_opportunities ?? {}
    };
  }, [effectiveVedicReport]);

  const onVedicReportLoaded = useCallback((report: ComprehensiveAnalysis) => {
    setVedicComprehensiveReport(report);
  }, []);

  const retryVedicComprehensive = useCallback(() => {
    setVedicComprehensiveError(null);
    setVedicReportFetchTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!hasVedicData || !user?.uid || !userProfile?.birthDate || !userProfile?.birthPlace) return;
    if (effectiveVedicReport || loadingVedicComprehensive || vedicComprehensiveError) return;

    const birthTime = userProfile.birthTime || '12:00:00';
    let cancelled = false;
    setLoadingVedicComprehensive(true);
    setVedicComprehensiveError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    fetch('/api/vedic/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        userId: user.uid,
        vedicChartData: compProfile?.vedic,
        userProfile: {
          birthDate: userProfile.birthDate,
          birthTime,
          birthPlace: userProfile.birthPlace,
          fullName: userProfile.fullName || userProfile.displayName,
          displayName: userProfile.displayName,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const report = data?.data?.comprehensiveAnalysis ?? data?.comprehensiveAnalysis ?? data?.data;
        if (data?.success && report && typeof report === 'object') {
          setVedicComprehensiveReport(report);
          setVedicComprehensiveError(null);
        } else {
          setVedicComprehensiveError(data?.error || 'Could not load report. Please try again.');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.name === 'AbortError' ? 'Request timed out. Please try again.' : (err?.message || 'Could not load report. Please try again.');
        setVedicComprehensiveError(message);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (!cancelled) setLoadingVedicComprehensive(false);
      });
    return () => { cancelled = true; controller.abort(); clearTimeout(timeoutId); };
    // Intentionally omit compProfile?.vedic from deps: it is passed in the body when the effect runs, but
    // including it causes the effect to re-run whenever the profile context updates (new object reference),
    // which aborts the in-flight fetch and prevents the report from ever loading.
  }, [hasVedicData, user?.uid, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, effectiveVedicReport, loadingVedicComprehensive, vedicComprehensiveError, vedicReportFetchTrigger]);

  // Helper to safely get sign name from potentially number or object
  const getSignName = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val?.signName) return val.signName;
    if (typeof val === 'object' && val?.sign != null) return SIGN_NAMES[typeof val.sign === 'number' ? val.sign % 12 : signNameToIndex(String(val.sign))] ?? 'Aries';
    return "Aries"; // Fallback
  };

  // Normalized Vedic data: single source of truth for charts, planets, houses
  const normalizedVedic = useMemo(() => {
    const raw = compProfile?.vedic as Record<string, unknown> | undefined;
    if (!raw?.planets || !Array.isArray(raw.planets)) return null;
    const asc = raw.ascendant as any;
    const ascLongitude = typeof asc?.longitude === 'number' ? asc.longitude : (typeof asc === 'number' ? asc : null);
    const ascSign = ascLongitude != null ? Math.floor(ascLongitude / 30) % 12 : (typeof asc?.sign === 'number' ? asc.sign % 12 : signNameToIndex(asc?.signName ?? asc?.sign ?? 'Aries'));
    const ascDegree = ascLongitude != null ? ascLongitude % 30 : (typeof asc?.degree === 'number' ? asc.degree : 0);
    const ascSignName = SIGN_NAMES[ascSign] ?? 'Aries';
    const planets = (raw.planets as any[]).map((p: any) => {
      const lon = typeof p.longitude === 'number' ? p.longitude : (p.lon ?? (p.degree != null ? (signNameToIndex(p.signName ?? p.sign ?? 'Aries') * 30 + (p.degree % 30)) : 0));
      const sign = typeof p.sign === 'number' ? p.sign % 12 : signNameToIndex(p.signName ?? p.sign ?? 'Aries');
      const house = lon != null ? ((Math.floor(lon / 30) - ascSign + 1 + 12) % 12) + 1 : undefined;
      return {
        name: p.name || p.planet || '?',
        sign,
        signName: SIGN_NAMES[sign],
        degreeInSign: p.degreeInSign ?? (typeof p.degree === 'number' ? p.degree % 30 : 0),
        isRetrograde: p.isRetrograde ?? p.retrograde ?? false,
        house,
        longitude: lon,
      };
    });
    const rawHouses = (raw.houses as any[]) ?? [];
    const houses = rawHouses.length >= 12 ? rawHouses.map((h: any, i: number) => {
      const signIdx = h.sign != null ? (typeof h.sign === 'number' ? h.sign % 12 : signNameToIndex(h.sign)) : (ascSign + i) % 12;
      return { houseNumber: h.number ?? h.houseNumber ?? i + 1, signName: h.signName ?? h.sign ?? SIGN_NAMES[signIdx], sign: signIdx, lord: h.lord ?? SIGN_LORDS[signIdx] };
    }) : Array.from({ length: 12 }, (_, i) => ({ houseNumber: i + 1, signName: SIGN_NAMES[(ascSign + i) % 12], sign: (ascSign + i) % 12, lord: SIGN_LORDS[(ascSign + i) % 12] }));
    return { ascendantSign: ascSign, ascendantDegree: ascDegree, ascendantSignName: ascSignName, ascendantLongitude: ascLongitude ?? ascSign * 30 + ascDegree, planets, houses };
  }, [compProfile?.vedic]);

  const defaultPlanets = useMemo(() => [
    { name: 'Sun', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Moon', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Mars', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Mercury', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Jupiter', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Venus', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Saturn', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Rahu', signName: '—', degreeInSign: 0, house: '—' },
    { name: 'Ketu', signName: '—', degreeInSign: 0, house: '—' },
  ], []);
  const defaultHouses = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ houseNumber: i + 1, signName: '—', lord: '—' })), []);

  if (profileLoading) {
    return (
      <div className="min-h-screen p-4 pb-24 md:pb-8 overflow-hidden bg-[var(--m3-surface)] md:bg-transparent">
        <div className="fixed inset-0 -z-10 hidden md:block starfield-ultra-sharp" aria-hidden />
        <div className="relative z-10 max-w-7xl mx-auto py-4 md:py-8">
          <div className="md:hidden px-1">
            <ToolPageHeader toolName="Vedic Astrology" toolSlug="vedic" toolCategory="Astrology" toolDescription="Loading…" />
          </div>
          <div className="hidden md:block text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🕉️</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Vedic Astrology</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">Comprehensive sidereal birth chart analysis and interpretations.</p>
          </div>
          <div className="rounded-2xl border border-[var(--m3-outline-variant)] md:border-amber-500/30 bg-[var(--m3-surface-container)] md:bg-slate-900/80 overflow-hidden p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-6 h-10 bg-slate-800/50 rounded-lg animate-pulse" />
            <div className="flex items-center justify-center min-h-[280px] text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-amber-400 mr-3" />
              <span>Loading your Vedic chart…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToolReportGuard loading={false} error={profileError ?? null} toolLabel="Vedic astrology" hasReport={hasVedicData}>
      <div className="min-h-screen p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24 md:pt-4 md:pb-8 overflow-hidden bg-[var(--m3-surface)] md:bg-transparent">
        <div className="fixed inset-0 -z-10 hidden md:block starfield-ultra-sharp" aria-hidden />
        <div className="relative z-10 max-w-7xl mx-auto py-4 md:py-8">
          {/* Mobile: ToolPageHeader (Material 3) */}
          <div className="md:hidden mb-4">
            <ToolPageHeader
              toolName="Vedic Astrology"
              toolSlug="vedic"
              toolCategory="Astrology"
              toolDescription="Comprehensive sidereal birth chart analysis and interpretations."
            />
          </div>
          {/* Web: Devotionist centered hero (like Western astrology) */}
          <div className="hidden md:block text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🕉️</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Vedic Astrology</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">Comprehensive sidereal birth chart analysis and interpretations.</p>
          </div>
          <div className="rounded-2xl border border-[var(--m3-outline-variant)] md:border-amber-500/30 bg-[var(--m3-surface-container)] md:bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto no-scrollbar md:overflow-x-auto gap-1 sm:gap-2 p-1.5 md:p-2 md:p-3 rounded-2xl md:rounded-none h-auto min-h-0 justify-start mb-4 md:mb-0 border border-[var(--m3-outline-variant)] md:border-0 bg-[var(--m3-surface-container-high)] md:bg-slate-800/50 md:border-b md:border-amber-500/20 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              {tabsConfig.map((tab) => (
                <motion.div
                  key={tab.value}
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }}
                  className="relative shrink-0"
                >
                  <TabsTrigger
                    value={tab.value}
                    className="shrink-0 min-w-[72px] md:min-w-0 h-9 md:h-auto rounded-xl md:rounded-t-lg md:rounded-b-none px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold md:font-medium uppercase md:normal-case tracking-wider md:tracking-normal data-[state=active]:bg-[var(--m3-primary)] data-[state=active]:text-[var(--m3-on-primary)] data-[state=inactive]:text-[var(--m3-on-surface-variant)] md:data-[state=active]:bg-gradient-to-br md:data-[state=active]:from-amber-100 md:data-[state=active]:to-yellow-100 md:data-[state=active]:text-amber-900 md:data-[state=active]:shadow-md md:data-[state=active]:border-b-2 md:data-[state=active]:border-b-amber-400/80 md:data-[state=inactive]:text-slate-200 hover:opacity-90 md:data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border-0 data-[state=inactive]:md:border data-[state=inactive]:md:border-slate-600/50"
                  >
                    {tab.label}
                    {activeTab === tab.value && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 hidden md:block bg-gradient-to-br from-amber-100 to-yellow-100 rounded-t-lg rounded-b-none -z-10"
                        transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>

            <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0"><ToolIntroductionTab toolSlug="vedic-astrology" /></TabsContent>
            <TabsContent value="compatibility" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0"><CompatibilityTab toolSlug="vedic-astrology" /></TabsContent>
            <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {hasVedicData && user?.uid && userProfile ? (
                <ComprehensiveVedicReport
                  userId={user.uid}
                  vedicChartData={compProfile?.vedic}
                  userProfile={userProfile}
                  cachedReport={effectiveVedicReport ?? (compProfile as any)?.vedicComprehensiveAnalysis ?? null}
                  isProfileLoading={profileLoading}
                  isLoadingReport={!effectiveVedicReport && loadingVedicComprehensive}
                  onReportLoaded={onVedicReportLoaded}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/20 rounded-[40px] shadow-2xl">
                    <h3 className="text-3xl font-heading font-light text-amber-400 mb-6 uppercase tracking-widest">Cosmic Overview</h3>
                    <p className="text-slate-300 leading-relaxed font-light text-lg">
                      Your soul's blueprint revealed through the lens of ancient Jyotish wisdom.
                      {(compProfile?.interpretations as any)?.personality?.overview ?? ''}
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
              )}
            </TabsContent>
            <TabsContent value="charts" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {normalizedVedic ? (() => {
                const { ascendantSign, ascendantDegree, planets: normPlanets, ascendantLongitude } = normalizedVedic;
                const chartPlanets = normPlanets.map((p) => ({ name: p.name, sign: p.sign, degreeInSign: p.degreeInSign, isRetrograde: p.isRetrograde }));
                const chartForCircular = {
                  planets: normPlanets.reduce((acc: Record<string, { lonSidereal: number }>, p) => { acc[p.name] = { lonSidereal: p.longitude ?? (p.sign * 30 + p.degreeInSign) }; return acc; }, {}),
                  ascendant: { signIndex: ascendantSign },
                };
                const planetsRecordForDiv = normPlanets.reduce((acc: Record<string, { lonSidereal: number; degreeInSign?: number; nakshatra?: string; nakshatraPada?: number }>, p) => {
                  acc[p.name] = { lonSidereal: p.longitude ?? (p.sign * 30 + p.degreeInSign), degreeInSign: p.degreeInSign }; return acc;
                }, {});
                const divisionalCharts = Object.keys(planetsRecordForDiv).length > 0 ? getDivisionalCharts(planetsRecordForDiv, ascendantLongitude) : null;
                const divLabels: [string, string][] = [['D9', 'Navamsa'], ['D10', 'Dasamsa'], ['D12', 'Dwadasamsa'], ['D30', 'Trimsamsa']];
                return (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-heading text-amber-400 mb-4 uppercase tracking-widest">Birth chart (D1)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="min-w-0 overflow-hidden p-6 bg-slate-900/40 border border-amber-500/20 rounded-3xl">
                          <h4 className="text-sm font-heading text-amber-400/90 mb-3 uppercase tracking-widest">North Indian</h4>
                          <NorthIndianVedicChart planets={chartPlanets} ascendantSign={ascendantSign} ascendantDegree={ascendantDegree} chartType="D1" />
                        </div>
                        <div className="min-w-0 overflow-hidden p-6 bg-slate-900/40 border border-amber-500/20 rounded-3xl">
                          <h4 className="text-sm font-heading text-amber-400/90 mb-3 uppercase tracking-widest">South Indian</h4>
                          <SouthIndianVedicChart planets={chartPlanets} ascendantSign={ascendantSign} ascendantDegree={ascendantDegree} chartType="D1" />
                        </div>
                        <div className="min-w-0 overflow-hidden p-6 bg-slate-900/40 border border-amber-500/20 rounded-3xl">
                          <h4 className="text-sm font-heading text-amber-400/90 mb-3 uppercase tracking-widest">East Indian</h4>
                          <VedicChartEast planets={chartPlanets} ascendantSign={ascendantSign} ascendantDegree={ascendantDegree} chartType="D1" />
                        </div>
                        <div className="min-w-0 overflow-hidden p-6 bg-slate-900/40 border border-amber-500/20 rounded-3xl">
                          <h4 className="text-sm font-heading text-amber-400/90 mb-3 uppercase tracking-widest">Nakshatra Wheel</h4>
                          <VedicChartCircular chart={chartForCircular} />
                        </div>
                      </div>
                    </div>
                    {divisionalCharts && (
                      <div>
                        <h3 className="text-lg font-heading text-amber-400 mb-4 uppercase tracking-widest">Divisional charts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {divLabels.map(([key, label]) => {
                            const div = divisionalCharts[key];
                            if (!div) return null;
                            const divAsc = div.ascendant;
                            const divPlanets = Object.entries(div).filter(([k]) => k !== 'ascendant').map(([planetName, data]: [string, any]) => ({
                              name: planetName,
                              sign: data.divSign ?? data.sign ?? 0,
                              degreeInSign: data.degreeInSign ?? 0,
                              isRetrograde: false,
                            }));
                            return (
                              <div key={key} className="min-w-0 overflow-hidden p-6 bg-slate-900/40 border border-amber-500/20 rounded-3xl">
                                <h4 className="text-sm font-heading text-amber-400/90 mb-3 uppercase tracking-widest">D{key.slice(1)} {label}</h4>
                                <SouthIndianVedicChart
                                  planets={divPlanets}
                                  ascendantSign={divAsc?.divSign ?? 0}
                                  ascendantDegree={divAsc?.degreeInSign ?? 0}
                                  chartType={key}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="p-8 bg-slate-900/40 border border-amber-500/20 rounded-3xl text-center text-slate-400">
                  <p>Generate your mystical profile from the Profile page to see your Vedic charts here.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="planets" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {!effectiveVedicReport && hasVedicData && user?.uid && (
                <div className="p-4 bg-slate-800/50 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {vedicComprehensiveError ? (
                    <>
                      <p className="text-sm text-amber-200/90">{vedicComprehensiveError}</p>
                      <Button size="sm" onClick={retryVedicComprehensive} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white">
                        <RefreshCw className="w-4 h-4 mr-2" /> Try again
                      </Button>
                    </>
                  ) : loadingVedicComprehensive ? (
                    <p className="text-sm text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading report…</p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-400">Load full report to see interpretations.</p>
                      <Button size="sm" onClick={retryVedicComprehensive} className="shrink-0 bg-amber-500/80 hover:bg-amber-500 text-white">
                        Load report
                      </Button>
                    </>
                  )}
                </div>
              )}
              <DevotionistStyleCard icon={<Sparkles className="w-5 h-5" />} title="Graha Positions" colorScheme="amber" variant="callout" className="md:block">
                {(reportForTabs?.chartOverview ?? (reportForTabs as any)?.chart_overview) ? (
                  <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl">
                    <p className="text-sm text-slate-700 leading-relaxed">{String(reportForTabs?.chartOverview ?? (reportForTabs as any)?.chart_overview)}</p>
                  </div>
                ) : (compProfile?.interpretations as any)?.personality?.overview ? (
                  <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl">
                    <p className="text-sm text-slate-700 leading-relaxed">{(compProfile?.interpretations as any)?.personality?.overview}</p>
                    <p className="text-slate-600 text-xs mt-3">Your planetary positions are below. Open the Overview tab for detailed analysis.</p>
                  </div>
                ) : (
                  <p className="mb-4 text-slate-700 text-sm">Your graha (planetary) positions from your Vedic chart are shown below. Open the Overview tab to load the full comprehensive report.</p>
                )}
                <div className="grid gap-4">
                  {((normalizedVedic?.planets ?? compProfile?.vedic?.planets) ?? defaultPlanets).map((planet: any, i: number) => {
                    const planetName = (planet.name ?? planet.planet ?? '?').toString().trim();
                    const analysisArr = normalizedReport?.planetaryAnalysis ?? [];
                    const analysisEntry = analysisArr.find(
                      (a: { planet?: string; analysis?: string }) =>
                        (String(a?.planet ?? '').trim().toLowerCase()) === (planetName || '').toLowerCase()
                    ) ?? (analysisArr[i] ? { analysis: (analysisArr[i] as any).analysis } : null);
                    const analysisText = analysisEntry?.analysis ?? null;
                    return (
                      <div key={i} className="p-6 bg-white/90 border border-amber-200 rounded-2xl space-y-3 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">{(planetName)?.charAt(0) ?? '?'}</div>
                          <div className="flex-1">
                            <span className="block font-heading text-slate-900">{planetName}</span>
                            <span className="text-sm text-slate-600">{planet.signName ?? getSignName(planet)} • {(planet.degreeInSign ?? planet.degree ?? 0).toFixed(1)}°</span>
                          </div>
                          <span className="text-xs font-bold text-amber-700 uppercase">{planet.house ?? '—'}th House</span>
                        </div>
                        {analysisText && (
                          <p className="text-slate-700 text-sm leading-relaxed pt-2 border-t border-amber-100">{analysisText}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!(normalizedVedic?.planets?.length || compProfile?.vedic?.planets?.length) && (
                  <p className="text-slate-600 text-center py-4 text-sm">Generate your profile from the Profile page to see your actual planetary positions.</p>
                )}
              </DevotionistStyleCard>
            </TabsContent>
            <TabsContent value="houses" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {!effectiveVedicReport && hasVedicData && user?.uid && (
                <div className="p-4 bg-slate-800/50 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {vedicComprehensiveError ? (
                    <>
                      <p className="text-sm text-amber-200/90">{vedicComprehensiveError}</p>
                      <Button size="sm" onClick={retryVedicComprehensive} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white">
                        <RefreshCw className="w-4 h-4 mr-2" /> Try again
                      </Button>
                    </>
                  ) : loadingVedicComprehensive ? (
                    <p className="text-sm text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading report…</p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-400">Load full report to see interpretations.</p>
                      <Button size="sm" onClick={retryVedicComprehensive} className="shrink-0 bg-amber-500/80 hover:bg-amber-500 text-white">
                        Load report
                      </Button>
                    </>
                  )}
                </div>
              )}
              <DevotionistStyleCard icon={<Sparkles className="w-5 h-5" />} title="House Positions" colorScheme="amber" variant="callout" className="md:block">
                {(reportForTabs?.chartOverview ?? (reportForTabs as any)?.chart_overview) ? (
                  <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl">
                    <p className="text-sm text-slate-700 leading-relaxed">{String(reportForTabs?.chartOverview ?? (reportForTabs as any)?.chart_overview)}</p>
                  </div>
                ) : (compProfile?.interpretations as any)?.personality?.overview ? (
                  <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl">
                    <p className="text-sm text-slate-700 leading-relaxed">{(compProfile?.interpretations as any)?.personality?.overview}</p>
                    <p className="text-slate-600 text-xs mt-3">Your house positions are below. Open the Overview tab for detailed analysis.</p>
                  </div>
                ) : (
                  <p className="mb-4 text-slate-700 text-sm">Your house positions from your Vedic chart are shown below. Open the Overview tab to load the full comprehensive report.</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {((normalizedVedic?.houses ?? compProfile?.vedic?.houses) ?? defaultHouses).map((h: any, i: number) => {
                    const houseNum = h.houseNumber ?? h.number ?? i + 1;
                    const houseArr = normalizedReport?.houseAnalysis ?? [];
                    const analysisEntry = houseArr.find(
                      (a: { house?: number; analysis?: string }) => Number(a?.house) === Number(houseNum)
                    ) ?? (houseArr[i] ? { analysis: (houseArr[i] as any).analysis } : null);
                    const analysisText = analysisEntry?.analysis ?? null;
                    return (
                      <div key={i} className="p-6 bg-white/90 border border-amber-200 rounded-2xl space-y-2 shadow-sm">
                        <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">House {houseNum}</span>
                        <p className="text-slate-900 font-heading mt-1">{h.signName ?? h.sign ?? '—'}</p>
                        {h.lord && <p className="text-sm text-slate-600">Lord: {h.lord}</p>}
                        {analysisText && (
                          <p className="text-slate-700 text-sm leading-relaxed pt-2 border-t border-amber-100 mt-2">{analysisText}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!(normalizedVedic?.houses?.length || compProfile?.vedic?.houses?.length) && (
                  <p className="text-slate-600 text-center py-4 text-sm">Generate your profile from the Profile page to see your actual house positions.</p>
                )}
              </DevotionistStyleCard>
            </TabsContent>
            <TabsContent value="dasha" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {hasVedicData && compProfile?.vedic?.currentDasha && (compProfile.vedic.currentDasha as any).startDate && (compProfile.vedic.currentDasha as any).endDate ? (
                <DashaPanelSimplified
                  chartData={{
                    currentDasha: compProfile.vedic.currentDasha as any,
                    dasha: (compProfile.vedic.dasha as any[]) ?? [],
                  }}
                  birthData={userProfile?.birthDate ? { birthDate: userProfile.birthDate, birthTime: userProfile.birthTime ?? '', birthPlace: userProfile.birthPlace ?? '' } : undefined}
                />
              ) : hasVedicData && compProfile?.vedic?.currentDasha ? (
                <div className="p-8 bg-slate-900/40 border border-amber-500/20 rounded-3xl">
                  <h3 className="text-xl font-heading text-amber-400 uppercase tracking-widest mb-4">Current Dasha</h3>
                  <p className="text-white text-lg">{(compProfile.vedic.currentDasha as any).planet ?? 'N/A'}</p>
                  <p className="text-slate-400 text-sm mt-2">Generate your full report to see detailed Dasha timeline.</p>
                </div>
              ) : (
                <div className="p-8 bg-slate-900/40 border border-amber-500/20 rounded-3xl text-center text-slate-400">
                  <p>Generate your mystical profile to see Dasha analysis.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="remedies" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {!effectiveVedicReport && hasVedicData && user?.uid && (
                <div className="p-4 bg-slate-800/50 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {vedicComprehensiveError ? (
                    <>
                      <p className="text-sm text-amber-200/90">{vedicComprehensiveError}</p>
                      <Button size="sm" onClick={retryVedicComprehensive} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white">
                        <RefreshCw className="w-4 h-4 mr-2" /> Try again
                      </Button>
                    </>
                  ) : loadingVedicComprehensive ? (
                    <p className="text-sm text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading report…</p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-400">Load full report to see interpretations.</p>
                      <Button size="sm" onClick={retryVedicComprehensive} className="shrink-0 bg-amber-500/80 hover:bg-amber-500 text-white">
                        Load report
                      </Button>
                    </>
                  )}
                </div>
              )}
              <DevotionistStyleCard icon={<Sparkles className="w-5 h-5" />} title="Remedies & Upayas" colorScheme="amber" variant="callout" className="md:block">
                {(() => {
                  const interp = compProfile?.interpretations as Record<string, unknown> | undefined;
                  const report = reportForTabs ?? (effectiveVedicReport as Record<string, unknown>);
                  const remediesRaw = interp?.remedies ?? (interp?.vedic as Record<string, unknown> | undefined)?.remedies ?? (compProfile?.vedic as Record<string, unknown> | undefined)?.remedies ?? report?.remedies;
                  const remedyKeys = ['overview', 'mantras', 'gemstones', 'rituals', 'lifestyle', 'practices'];
                  const hasContent = (obj: Record<string, unknown>) =>
                    remedyKeys.some((k) => {
                      const v = obj[k];
                      if (typeof v === 'string' && (v as string).trim()) return true;
                      if (Array.isArray(v) && v.length > 0) return true;
                      return false;
                    });
                  const chartOv = report?.chartOverview ?? (report as any)?.chart_overview;
                  const insights = report?.predictiveInsights ?? (report as any)?.predictive_insights;
                  const co = report?.challengesAndOpportunities ?? (report as any)?.challenges_and_opportunities;
                  const showReportFallback = (typeof chartOv === 'string' && chartOv.trim()) || (insights as any)?.currentPeriod || (Array.isArray((co as any)?.challenges) && (co as any).challenges.length) || (Array.isArray((co as any)?.opportunities) && (co as any).opportunities.length);
                  if (!remediesRaw) {
                    if (showReportFallback) {
                      const ins = insights as Record<string, string> | undefined;
                      const coData = co as { challenges?: string[]; opportunities?: string[] } | undefined;
                      return (
                        <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
                          {chartOv && <p>{String(chartOv)}</p>}
                          {ins?.currentPeriod && <p><span className="font-semibold text-amber-700">Current period: </span>{ins.currentPeriod}</p>}
                          {coData?.challenges?.length ? <div><span className="font-semibold text-amber-700">Challenges to work on: </span><ul className="list-disc pl-5 mt-1 text-slate-700">{coData.challenges.map((c, i) => <li key={i}>{c}</li>)}</ul></div> : null}
                          {coData?.opportunities?.length ? <div><span className="font-semibold text-amber-700">Opportunities: </span><ul className="list-disc pl-5 mt-1 text-slate-700">{coData.opportunities.map((o, i) => <li key={i}>{o}</li>)}</ul></div> : null}
                        </div>
                      );
                    }
                    const interpOverview = (compProfile?.interpretations as any)?.personality?.overview;
                    if (interpOverview && typeof interpOverview === 'string' && interpOverview.trim()) {
                      return (
                        <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
                          <p>{interpOverview}</p>
                          <p className="text-slate-600 text-sm">Personalized remedies and upayas will appear here after your comprehensive report is loaded from the Overview tab.</p>
                        </div>
                      );
                    }
                    return <p className="text-slate-700">Remedies for your chart appear here after your comprehensive mystical profile is generated. Generate your profile from the Profile page to see personalized upayas and remedies.</p>;
                  }
                  if (Array.isArray(remediesRaw)) {
                    return (
                      <div className="prose prose-slate max-w-none text-slate-700">
                        {remediesRaw.map((r: any, i: number) => <p key={i}>{typeof r === 'string' ? r : r?.text ?? r?.name ?? JSON.stringify(r)}</p>)}
                      </div>
                    );
                  }
                  const remediesObj = remediesRaw as Record<string, unknown>;
                  if (typeof remediesObj !== 'object' || !hasContent(remediesObj)) {
                    if (showReportFallback) {
                      const ins = insights as Record<string, string> | undefined;
                      const coData = co as { challenges?: string[]; opportunities?: string[] } | undefined;
                      return (
                        <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
                          {chartOv && <p>{String(chartOv)}</p>}
                          {ins?.currentPeriod && <p><span className="font-semibold text-amber-700">Current period: </span>{ins.currentPeriod}</p>}
                          {coData?.challenges?.length ? <div><span className="font-semibold text-amber-700">Challenges: </span><ul className="list-disc pl-5 mt-1 text-slate-700">{coData.challenges.map((c, i) => <li key={i}>{c}</li>)}</ul></div> : null}
                          {coData?.opportunities?.length ? <div><span className="font-semibold text-amber-700">Opportunities: </span><ul className="list-disc pl-5 mt-1 text-slate-700">{coData.opportunities.map((o, i) => <li key={i}>{o}</li>)}</ul></div> : null}
                        </div>
                      );
                    }
                    const interpOverview2 = (compProfile?.interpretations as any)?.personality?.overview;
                    if (interpOverview2 && typeof interpOverview2 === 'string' && interpOverview2.trim()) {
                      return (
                        <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
                          <p>{interpOverview2}</p>
                          <p className="text-slate-600 text-sm">Personalized remedies will appear here after your comprehensive report is loaded.</p>
                        </div>
                      );
                    }
                    return <p className="text-slate-700">Remedies for your chart appear here after your comprehensive mystical profile is generated. Generate your profile from the Profile page to see personalized upayas and remedies.</p>;
                  }
                  const sections: { label: string; key: string }[] = [
                    { label: 'Overview', key: 'overview' },
                    { label: 'Mantras', key: 'mantras' },
                    { label: 'Gemstones', key: 'gemstones' },
                    { label: 'Rituals', key: 'rituals' },
                    { label: 'Lifestyle', key: 'lifestyle' },
                    { label: 'Practices', key: 'practices' },
                  ];
                  return (
                    <div className="prose prose-slate max-w-none text-slate-700">
                      {sections.map(({ label, key }) => {
                        const val = remediesObj[key];
                        if (val == null) return null;
                        if (typeof val === 'string' && val.trim()) {
                          return <p key={key} className="mb-4"><span className="font-semibold text-amber-700">{label}: </span>{val}</p>;
                        }
                        if (Array.isArray(val) && val.length > 0) {
                          return (
                            <div key={key} className="mb-4">
                              <span className="font-semibold text-amber-700">{label}:</span>
                              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                                {val.map((item: unknown, i: number) => (
                                  <li key={i}>{typeof item === 'string' ? item : String(item)}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  );
                })()}
              </DevotionistStyleCard>
            </TabsContent>
            <TabsContent value="gotra" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {hasVedicData && userProfile ? (() => {
                const moon = (compProfile?.vedic?.planets as any[])?.find((p: any) => (p.name || p.planet) === 'Moon');
                const moonLongitude = moon?.longitude ?? moon?.degree ?? 0;
                const moonNakshatra = moon?.nakshatra ?? 'Punarvasu';
                return (
                  <GotraTab
                    moonNakshatra={moonNakshatra}
                    moonLongitude={moonLongitude}
                    userProfile={userProfile}
                    chartData={compProfile?.vedic}
                  />
                );
              })() : (
                <div className="p-8 bg-slate-900/40 border border-amber-500/20 rounded-3xl text-center text-slate-400">
                  <p>Generate your profile and ensure birth details are set to see Gotra (lineage) analysis.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {user?.uid && userProfile ? (
                <div className="p-6 bg-slate-900/40 border border-amber-500/20 rounded-3xl min-h-[400px]">
                  <h3 className="text-xl font-heading text-amber-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" /> Ask the Vedic Seer
                  </h3>
                  <VedicSeerChatInterface
                    userId={user.uid}
                    userProfile={userProfile}
                    vedicChartData={compProfile?.vedic ?? undefined}
                  />
                </div>
              ) : (
                <div className="p-8 bg-slate-900/40 border border-amber-500/20 rounded-3xl text-center text-slate-400">
                  <p>Sign in to use Ask the Seer for personalized Vedic guidance.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          </div>
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
