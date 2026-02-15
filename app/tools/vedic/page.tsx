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
import { BirthProfile } from "@/hooks/usePlacements";
import { calculateAccuratePanchanga, calculateCurrentPanchanga } from "@/lib/enhancedPanchangaCalculator";
import { detectYogas } from "@/lib/enhancedYogaDetection";
import { getCoordinatesWithFallback } from "@/lib/geocoding";
import { resolveBirthTime } from "@/lib/birthTimeResolver";
import { VERIFIED_VEDIC_FALLBACKS } from '@/lib/verifiedFallbacks';
import { getChart } from "@/lib/astronomia-vedic";
import { getFirebaseDB } from '@/lib/firebase';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab";
import { CompatibilityTab } from "@/components/compatibility/CompatibilityTab";
import VedicSeerChatInterface from "@/components/VedicSeerChatInterface";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DevotionistStyleCard } from "@/components/western/DevotionistStyleCard";
import { DashboardSection } from "@/components/western/DashboardSection";
import { VedicDashboardHero } from "@/components/vedic/VedicDashboardHero";
import { GotraTab } from "@/components/vedic/GotraTab";
import ComprehensiveVedicReport from "@/components/vedic/ComprehensiveVedicReport";

// Core Vedic components
import SettingsBar from "@/components/SettingsBar";
import { PanchangaPanel } from "@/components/PanchangaPanel";
import { YogaPanelSimplified } from "@/components/YogaPanelSimplified";
import PlanetDetailModal from "@/components/PlanetDetailModal";

// Production-ready chart renderers with FutureSeer branding
import NorthIndianVedicChart from "@/components/NorthIndianVedicChart";
import { ReadyToUseVedicChart } from "@/components/ReadyToUseVedicChart";
import VedicChartCircular from "@/components/VedicChartCircular";
import EastIndianVedicChart from "@/components/EastIndianVedicChart";
import SouthIndianVedicChart from "@/components/SouthIndianVedicChart";

// Comprehensive Vedic components - Lazy loaded for performance
const DivisionalChartsViewer = dynamic(() => import("@/components/vedic/DivisionalChartsViewer").then(mod => ({ default: mod.DivisionalChartsViewer })), { ssr: false });
const DashaAnalysis = dynamic(() => import("@/components/vedic/DashaAnalysis"), { ssr: false });
const DashaPanelSimplified = dynamic(() => import("@/components/vedic/DashaPanelSimplified").then(mod => ({ default: mod.DashaPanelSimplified })), { ssr: false });
const ShadbalaAnalysis = dynamic(() => import("@/components/vedic/ShadbalaAnalysis").then(mod => ({ default: mod.ShadbalaAnalysis })), { ssr: false });
const YogasAnalysis = dynamic(() => import("@/components/vedic/YogasAnalysis").then(mod => ({ default: mod.YogasAnalysis })), { ssr: false });
const NakshatraAnalysis = dynamic(() => import("@/components/vedic/NakshatraAnalysis").then(mod => ({ default: mod.NakshatraAnalysis })), { ssr: false });
const TransitsOverlay = dynamic(() => import("@/components/vedic/TransitsOverlay").then(mod => ({ default: mod.TransitsOverlay })), { ssr: false });
const VedicAstroNumerologyTab = dynamic(() => import("@/components/vedic/VedicAstroNumerologyTab"), { ssr: false });
import { NAKSHATRAS } from "@/lib/nakshatraData";
import { calculateNakshatraAnalysis } from "@/lib/nakshatraCalculator";
import { generateHolisticRemedies } from "@/lib/comprehensiveRemedyGenerator";
import { calculateTransitData } from "@/lib/transitCalculator";
import { calculateVedicNumerologyProfile } from "@/lib/vedicNumerologyCalculations";

import {
  MessageCircle,
  Star,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  User,
  Eye,
  Heart,
  Shield,
  Target,
  Activity,
  Timer,
  TrendingUp,
  Users,
  Sparkles,
  Moon,
  Sun,
  ArrowUp,
  Loader2,
  Briefcase,
  Zap,
  ChevronDown,
  ChevronUp,
  Hand,
  Hammer,
  Gem,
  Home
} from "lucide-react";

// Vedic Terminology Mapping
const VEDIC_NAMES = {
  planets: {
    sun: 'Surya',
    moon: 'Chandra',
    mercury: 'Budha',
    venus: 'Shukra',
    mars: 'Mangala',
    jupiter: 'Guru',
    saturn: 'Shani',
    rahu: 'Rahu',
    ketu: 'Ketu'
  },
  signs: {
    'Aries': 'Mesha',
    'Taurus': 'Vrishabha',
    'Gemini': 'Mithuna',
    'Cancer': 'Karka',
    'Leo': 'Simha',
    'Virgo': 'Kanya',
    'Libra': 'Tula',
    'Scorpio': 'Vrishchika',
    'Sagittarius': 'Dhanu',
    'Capricorn': 'Makara',
    'Aquarius': 'Kumbha',
    'Pisces': 'Meena'
  },
  houses: {
    1: 'Lagna Bhava',
    2: 'Dhana Bhava',
    3: 'Sahaja Bhava',
    4: 'Sukha Bhava',
    5: 'Putra Bhava',
    6: 'Ripu Bhava',
    7: 'Kalatra Bhava',
    8: 'Ayu Bhava',
    9: 'Dharma Bhava',
    10: 'Karma Bhava',
    11: 'Labha Bhava',
    12: 'Vyaya Bhava'
  },
  tabs: {
    'Overview': 'Samanya Drishti',
    'Charts': 'Kundali',
    'Divisional': 'Varga Kundali',
    'Planets': 'Grahas',
    'Houses': 'Bhavas',
    'Planetary Combinations': 'Yogas',
    'Lunar Mansions': 'Nakshatras',
    'Planetary Periods': 'Dasha',
    'Transits': 'Gochara',
    'Vedic Calendar': 'Panchanga',
    'Insights': 'Phalita',
    'Remedies': 'Upayas',
    'Astro-Numerology': 'Graha Anka'
  }
} as const;

// Helper functions for dual terminology
function getVedicPlanetName(westernName: string): string {
  const key = westernName.toLowerCase() as keyof typeof VEDIC_NAMES.planets;
  return VEDIC_NAMES.planets[key] || westernName;
}

function getVedicSignName(westernName: string): string {
  return VEDIC_NAMES.signs[westernName as keyof typeof VEDIC_NAMES.signs] || westernName;
}

function getVedicHouseName(houseNumber: number): string {
  return VEDIC_NAMES.houses[houseNumber as keyof typeof VEDIC_NAMES.houses] || `${getOrdinal(houseNumber)} House`;
}

function getDualPlanetName(westernName: string): string {
  const vedic = getVedicPlanetName(westernName);
  const capitalized = westernName.charAt(0).toUpperCase() + westernName.slice(1);
  return vedic === westernName ? capitalized : `${capitalized} (${vedic})`;
}

function getDualSignName(westernName: string): string {
  const vedic = getVedicSignName(westernName);
  return vedic === westernName ? westernName : `${westernName} (${vedic})`;
}

function getDualHouseName(houseNumber: number): string {
  const vedic = getVedicHouseName(houseNumber);
  return `${houseNumber}${getOrdinalSuffix(houseNumber)} House (${vedic})`;
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

function getDualTabName(westernName: string): React.ReactElement {
  const vedic = VEDIC_NAMES.tabs[westernName as keyof typeof VEDIC_NAMES.tabs];
  
  // If no Vedic term or same as Western, just return Western
  if (!vedic || vedic === westernName) {
    return <span>{westernName}</span>;
  }
  
  // Return vertical layout: English (user-friendly) on top, Sanskrit on bottom
  return (
    <span className="flex flex-col items-center leading-tight gap-0">
      <span className="text-xs font-semibold">{westernName}</span>
      <span className="text-[10px] opacity-70">{vedic}</span>
    </span>
  );
}

// Helper function to convert numbers to ordinal strings
function getOrdinal(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;
  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

// Helper function for contextual house meanings
function getHouseTheme(houseNum: number): string {
  const themes: Record<number, string> = {
    1: "self-identity and physical vitality",
    2: "wealth, speech, and family values",
    3: "courage, siblings, and communication",
    4: "home, mother, and emotional security",
    5: "creativity, children, and intelligence",
    6: "health, service, and overcoming obstacles",
    7: "partnerships, marriage, and business",
    8: "transformation, longevity, and hidden matters",
    9: "dharma, higher learning, and fortune",
    10: "career, status, and public life",
    11: "gains, aspirations, and social networks",
    12: "spirituality, liberation, and foreign lands"
  };
  return themes[houseNum] || "life experiences";
}

// Helper function to convert sign indices to names
function getSignName(signIndexOrName: number | string): string {
  const SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  if (typeof signIndexOrName === 'number') {
    return SIGN_NAMES[signIndexOrName % 12] || 'Unknown';
  }
  return signIndexOrName;
}

function VedicAstrologyPageContent() {
  const { user, userProfile } = useAuth();
  const { profile: comprehensiveProfile, loading: profileLoading, error: profileError } = useComprehensiveMysticalProfile();
  const hasVedicData = !!(comprehensiveProfile?.vedic && comprehensiveProfile?.interpretations);
  const vedicDerived = useVedicProfile(comprehensiveProfile, hasVedicData);

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'introduction' | 'compatibility' | 'overview' | 'report' | 'charts' | 'divisional' | 'planets' | 'houses' | 'dasha' | 'panchanga' | 'yogas' | 'nakshatras' | 'remedies' | 'interpretations' | 'transits' | 'astro-numerology'>('introduction');
  const [comprehensiveReport, setComprehensiveReport] = useState<any>(null);
  const [isLoadingComprehensiveReport, setIsLoadingComprehensiveReport] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [expandedGemstones, setExpandedGemstones] = useState<Set<string>>(new Set());
  const [panchangaData, setPanchangaData] = useState<any>(null);

  const toggleGemstoneExpansion = useCallback((planetName: string) => {
    setExpandedGemstones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planetName)) {
        newSet.delete(planetName);
      } else {
        newSet.add(planetName);
      }
      return newSet;
    });
  }, []);
  const [currentPanchangaData, setCurrentPanchangaData] = useState<any>(null);
  const [yogas, setYogas] = useState<any[]>([]);
  const [isLoadingInterpretations, setIsLoadingInterpretations] = useState(false);
  const [newChartData, setNewChartData] = useState<any>(null);

  // State for divisional chart interpretations
  const [d9Interpretations, setD9Interpretations] = useState<any>(null);
  const [d10Interpretations, setD10Interpretations] = useState<any>(null);
  const [divisionalSource, setDivisionalSource] = useState<'fallback' | 'cache' | 'api'>('fallback');
  const [selectedPlanet, setSelectedPlanet] = useState<{ name: string; data: any } | null>(null);
  const [shadbalaData, setShadbalaData] = useState<any>(null);
  const [transitsData, setTransitsData] = useState<any>(null);
  const [chartDisclaimer, setChartDisclaimer] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  // Cache clear effect (pipeline-only: clear local enhancer only; do not call interpretation APIs)
  useEffect(() => {
    if (user?.uid && searchParams.get('clearCache') === 'true' && !cacheCleared) {
      setIsClearingCache(true);
      const enhancer = new VedicInterpretationEnhancer();
      enhancer.deleteAllVedicInterpretationsForUser(user?.uid ?? '').then(() => {
        devLog.debug('Full cache cleared', undefined, 'vedic');
        setCacheCleared(true);
        setIsClearingCache(false);
      });
    }
  }, [user, searchParams, cacheCleared]);

  // Pipeline-only: Vedic Astro-Numerology comes from comprehensive profile (see derived state below), no Firestore read

  // Handle planet click - memoized for performance
  const handlePlanetClick = useCallback((planetName: string, planetData: any) => {
    setSelectedPlanet({ name: planetName, data: planetData });
  }, []);

  // Handle tab change - memoized for performance
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as any);
  }, []);

  // Validation helper function
  const isValidInterpretation = (text: string): boolean => {
    if (!text || text.trim().length === 0) return false;
    
    const invalidPhrases = [
      'didn\'t ask', 'provide context', 'please clarify',
      'didn\'t provide', 'could you please', 'more information',
      'didn\'t type', 'empty message', 'share what\'s on your mind',
      'ask me anything', 'feel free to ask', 'go ahead and ask',
      'please provide more', 'clarify how I can help', 'provide more details',
      // Add detection for "Unknown" Mahadasha/Antardasha
      'unknown mahadasha', 'unknown antardasha', 'unknown dasha',
      // Add detection for error messages
      'unable to generate', 'please refresh the page', 'try again'
    ];
    
    return !invalidPhrases.some(phrase => text.toLowerCase().includes(phrase));
  };

  // Pipeline-only: no tool API regeneration; data comes from profile. Replace UI "Regenerate" with CTA to /profile.
  const regenerateInvalidPlanets = async (_invalidPlanets: string[], _existingCache: any) => {
    // No-op: interpretations come from comprehensive profile only.
  };

  const regenerateInvalidDasha = async (_existingCache: any) => {
    // No-op: dasha comes from comprehensive profile only.
  };

  // Update cache with verified content
  const updateCacheWithVerifiedContent = async (existingCache: any, newContent: any) => {
    try {
      const db = getFirebaseDB();
      const { doc, setDoc } = await import('firebase/firestore');
      const birthDataKey = `${userProfile?.birthDate}_${userProfile?.birthTime}_${userProfile?.birthPlace}`;
      const cacheDocRef = doc(db, 'users', user?.uid ?? '', 'vedicInterpretations', 'static');
      
      const updateData: any = {
        ...existingCache,
        birthDataKey,
        lastUpdated: Date.now()
      };
      
      // Handle planets if provided
      if (newContent.planets) {
        updateData.planets = {
          ...existingCache.planets,
          ...newContent.planets
        };
      }
      
      // Handle Dasha if provided
      if (newContent.dasha) {
        updateData.dasha = newContent.dasha;
      }
      
      // DELETE invalid Dasha from cache if explicitly requested
      if (newContent.deleteDasha === true) {
        delete updateData.dasha;
        devLog.debug('Deleted invalid Dasha from cache', undefined, 'vedic');
      }
      
      await setDoc(cacheDocRef, updateData);
      
      devLog.debug('Cache updated with verified content', undefined, 'vedic');
    } catch (error) {
      devLog.error('Failed to update cache', error, 'vedic');
    }
  };

  // Pipeline-only: interpretations come from profile via vedicDerived; no tool API calls
  const loadInterpretationsWithHybridFallback = async () => {};

  // Hybrid loader for divisional charts
  const loadDivisionalInterpretations = useCallback(async (chartType: 'D9' | 'D10') => {
    // TIER 1: Load fallback IMMEDIATELY
    devLog.debug(`TIER 1: Loading ${chartType} fallback content instantly`, undefined, 'vedic');
    
    // Post-process fallback content: Replace "Dear seeker" with user's first name
    const firstName = userProfile?.displayName?.split(' ')[0] || userProfile?.fullName?.split(' ')[0];
    const processFallback = (fallback: any) => {
      if (!fallback || !firstName) return fallback;
      const processed: any = {};
      Object.keys(fallback).forEach(key => {
        if (typeof fallback[key] === 'string') {
          processed[key] = fallback[key]
            .replace(/Dear seeker/gi, `Dear ${firstName}`)
            .replace(/dear seeker/gi, `Dear ${firstName}`)
            .replace(/dear one/gi, firstName);
        } else {
          processed[key] = fallback[key];
        }
      });
      return processed;
    };
    
    if (chartType === 'D9') {
      setD9Interpretations(processFallback(VERIFIED_VEDIC_FALLBACKS.divisionalCharts.D9));
    } else {
      setD10Interpretations(processFallback(VERIFIED_VEDIC_FALLBACKS.divisionalCharts.D10));
    }
    setDivisionalSource('fallback');
    
    // TIER 2 & 3: Check cache, then API if needed
    try {
      const db = getFirebaseDB();
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      const birthDataKey = `${userProfile?.birthDate}_${userProfile?.birthTime}_${userProfile?.birthPlace}`;
      const cacheDocRef = doc(db, `users/${user?.uid ?? ''}/divisionalInterpretations/${chartType}`);
      const cacheDoc = await getDoc(cacheDocRef);
      
      if (cacheDoc.exists() && cacheDoc.data().birthDataKey === birthDataKey) {
        devLog.debug(`TIER 2: ${chartType} cache found - upgrading content`, undefined, 'vedic');
        const cached = cacheDoc.data();
        
        // Post-process cached content: Replace "Dear seeker" with user's first name
        const firstName = userProfile?.displayName?.split(' ')[0] || userProfile?.fullName?.split(' ')[0];
        const processInterpretations = (interpretations: any) => {
          if (!interpretations || !firstName) return interpretations;
          const processed: any = {};
          Object.keys(interpretations).forEach(key => {
            if (typeof interpretations[key] === 'string') {
              processed[key] = interpretations[key]
                .replace(/Dear seeker/gi, `Dear ${firstName}`)
                .replace(/dear seeker/gi, `Dear ${firstName}`)
                .replace(/dear one/gi, firstName);
            } else {
              processed[key] = interpretations[key];
            }
          });
          return processed;
        };
        
        if (chartType === 'D9') {
          setD9Interpretations(processInterpretations(cached.interpretations));
        } else {
          setD10Interpretations(processInterpretations(cached.interpretations));
        }
        setDivisionalSource('cache');
        return;
      }
      
      // TIER 3: Call API
      devLog.debug(`TIER 3: Generating ${chartType} interpretations via API`, undefined, 'vedic');
      const response = await fetch('/api/vedic-interpretations/divisional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chartType, 
          chartData: newChartData, 
          userId: user?.uid ?? '',
          userName: userProfile?.displayName || userProfile?.fullName
        })
      });
      
      if (response.ok) {
        const { interpretations } = await response.json();
        
        // Post-process API content: Replace "Dear seeker" with user's first name (safety check)
        const firstName = userProfile?.displayName?.split(' ')[0] || userProfile?.fullName?.split(' ')[0];
        const processInterpretations = (interpretations: any) => {
          if (!interpretations || !firstName) return interpretations;
          const processed: any = {};
          Object.keys(interpretations).forEach(key => {
            if (typeof interpretations[key] === 'string') {
              processed[key] = interpretations[key]
                .replace(/Dear seeker/gi, `Dear ${firstName}`)
                .replace(/dear seeker/gi, `Dear ${firstName}`)
                .replace(/dear one/gi, firstName);
            } else {
              processed[key] = interpretations[key];
            }
          });
          return processed;
        };
        
        const processedInterpretations = processInterpretations(interpretations);
        
        if (chartType === 'D9') {
          setD9Interpretations(processedInterpretations);
        } else {
          setD10Interpretations(processedInterpretations);
        }
        
        // Save to cache (with processed content)
        await setDoc(cacheDocRef, {
          birthDataKey,
          interpretations: processedInterpretations,
          cachedAt: Date.now()
        });
        
        setDivisionalSource('api');
      }
    } catch (error) {
      devLog.error(`Error loading ${chartType} interpretations`, error, 'vedic');
      // Fallback already loaded
    }
  }, [user?.uid, userProfile, newChartData]);

  // Generate new chart data using astronomia wrapper
  const generateNewChart = async (capturedPreviousPositions?: typeof previousNodePositions, targetNodeMode?: "mean" | "true") => {
    if (!birthProfile || !userProfile) return;
    
    try {
      devLog.debug('Generating new chart with astronomia wrapper', undefined, 'vedic');
      
      // Parse birth date
      const birthDate = userProfile.birthDate; // Format: "YYYY-MM-DD"
      
      if (!birthDate) {
        devLog.warn('Birth date missing', undefined, 'vedic');
        return;
      }
      
      // Geocode coordinates automatically
      const coordinates = await getCoordinatesWithFallback(
        userProfile.birthPlace || birthProfile.placeName || 'Mumbai, India'
      );
      
      // Resolve birth time (exact or approximated)
      const resolvedTime = await resolveBirthTime(userProfile, coordinates);
      
      // Show disclaimer if using approximate time
      if (resolvedTime.disclaimer) {
        setChartDisclaimer(resolvedTime.disclaimer);
      } else {
        setChartDisclaimer('');
      }
      
    // Parse IST time components
    const [hour, minute] = resolvedTime.time.split(':').map(Number);
    const [year, month, day] = birthDate.split('-').map(Number);

    // Convert IST to UTC: IST is UTC+5:30, so subtract 5.5 hours
    const istHours = hour;
    const istMinutes = minute;
    const utcHours = istHours - 5;
    const utcMinutes = istMinutes - 30;

    // Create UTC date with proper time adjustment
    const birthDateTime = new Date(Date.UTC(
      year, 
      month - 1, 
      day, 
      utcHours < 0 ? utcHours + 24 : utcHours,
      utcMinutes < 0 ? utcMinutes + 60 : utcMinutes
    ));

    // Adjust day if time wrapped around
    if (utcHours < 0) {
      birthDateTime.setUTCDate(birthDateTime.getUTCDate() - 1);
    }
    if (utcMinutes < 0) {
      birthDateTime.setUTCHours(birthDateTime.getUTCHours() - 1);
    }
    
    devLog.debug('Chart time params', { time: resolvedTime.time, istHours, istMinutes, utcHours, utcMinutes, utcIso: birthDateTime.toISOString() }, 'vedic');
      
      const latitude = coordinates.latitude;
      const longitude = coordinates.longitude;
      
      const actualNodeMode = targetNodeMode || currentNodeMode;
      devLog.debug('Chart parameters', { date: birthDateTime, time: resolvedTime.time, latitude, longitude, actualNodeMode }, 'vedic');
      
      const chart = getChart({
        date: birthDateTime,
        latitude,
        longitude,
        name: birthProfile.fullName,
        place: birthProfile.placeName,
        birthDate: birthDateTime  // Explicitly pass birth date for Dasha
      }, {
        houseSystem: "whole-sign",
        ayanamsha: "lahiri",
        nodeType: actualNodeMode
      });
      
      devLog.debug('Chart generated', { ascendant: chart.ascendant?.signName }, 'vedic');

      setNewChartData(chart);

      // If we have previous node positions, show comparison
      const previousPos = capturedPreviousPositions || previousNodePositions;
      if (previousPos) {
        const planets = chart.planets as Record<string, { degree?: number; degreeInSign?: number }> | undefined;
        const newRahu = planets?.['Rahu'] || planets?.['rahu'];
        const newKetu = planets?.['Ketu'] || planets?.['ketu'];
        
        if (newRahu || newKetu) {
          // Highlight nodes in table
          setHighlightedNodes(['Rahu', 'Ketu', 'rahu', 'ketu']);
          
          // Show toast with comparison
          const changes = [];
          if (newRahu && previousPos.rahu) {
            const newRahuDegree = newRahu.degree || newRahu.degreeInSign || 0;
            const prevRahuDegree = previousPos.rahu.degree || 0;
            const degChange = Math.abs(newRahuDegree - prevRahuDegree);
            changes.push(`Rahu: ${prevRahuDegree.toFixed(2)}° → ${newRahuDegree.toFixed(2)}° (Δ ${degChange.toFixed(2)}°)`);
          }
          if (newKetu && previousPos.ketu) {
            const newKetuDegree = newKetu.degree || newKetu.degreeInSign || 0;
            const prevKetuDegree = previousPos.ketu.degree || 0;
            const degChange = Math.abs(newKetuDegree - prevKetuDegree);
            changes.push(`Ketu: ${prevKetuDegree.toFixed(2)}° → ${newKetuDegree.toFixed(2)}° (Δ ${degChange.toFixed(2)}°)`);
          }
          
          devLog.debug('Node positions updated', changes.join(' | '), 'vedic');
          
          // Clear highlight after 5 seconds
          setTimeout(() => {
            setHighlightedNodes([]);
            setPreviousNodePositions(null);
          }, 5000);
        }
      }
    } catch (error) {
      devLog.error('Error generating new chart', error, 'vedic');
    }
  };

  // Convert userProfile to BirthProfile format
  const birthProfile: BirthProfile | null = userProfile ? {
    fullName: userProfile.fullName || "User",
    date: userProfile.birthDate || "",
    time: userProfile.birthTime || "",
    placeName: userProfile.birthPlace || "",
    // Use default coordinates for now - they will be resolved by the chart generation
    latitude: 0, // Will be resolved from birthPlace
    longitude: 0, // Will be resolved from birthPlace
    preferences: {
      nodeMode: "true",
      chartStyle: "both"
    }
  } : null;

  // Pipeline-only: generate chart only when we have Vedic data from comprehensive profile
  useEffect(() => {
    if (hasVedicData && userProfile && userProfile.birthDate && userProfile.birthTime && userProfile.birthPlace) {
      devLog.debug('Generating chart data for complete profile', undefined, 'vedic');
      generateNewChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVedicData, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace]);

  // Convert new chart data to old format for compatibility
  const chartData = newChartData ? {
    ascendant: {
      signName: newChartData.ascendant?.signName || 'Unknown',
      degreeInSign: newChartData.ascendant?.degreeInSign || 0,
      lord: newChartData.ascendant?.lord || 'Unknown'
    },
    ayanamsha: newChartData.metadata?.ayanamshaValue || 0,
    placements: newChartData.houses?.map((house: { signName?: string; lord?: string; sign?: number }, index: number) => ({
      house: index + 1,
      signName: house.signName,
      lord: house.lord,
      planets: Object.entries(newChartData.planets || {}).filter(([_, planet]: [string, unknown]) => (planet as { sign?: number }).sign === house.sign).map(([name, planet]: [string, unknown]) => {
        const p = planet as { lonSidereal?: number; lat?: number; dist?: number; sign?: number; signName?: string; degreeInSign?: number; nakshatra?: string; nakshatraPada?: string; dignity?: unknown };
        return {
          name,
          longitude: p.lonSidereal,
          latitude: p.lat,
          distance: p.dist,
          sign: p.sign,
          signName: p.signName,
          degreeInSign: p.degreeInSign,
          house: index + 1,
          nakshatra: p.nakshatra,
          nakshatraPada: p.nakshatraPada,
          dignity: p.dignity
        };
      })
    })) || [],
    currentDasha: null, // Will be calculated separately if needed
    dasha: [], // Will be calculated separately if needed
    metadata: newChartData.metadata
  } : null;
  
  const isLoading = false; // Chart generation is handled separately
  const error = null; // Errors are handled in generateNewChart
  // State for node mode and chart style
  const [currentNodeMode, setCurrentNodeMode] = useState<"mean" | "true">("mean");
  const [currentChartStyle, setCurrentChartStyle] = useState<"north" | "south" | "both">("both");
  
  // State for Node Mode visual feedback
  const [previousNodePositions, setPreviousNodePositions] = useState<{
    rahu?: { degree: number, sign: string, nakshatra: string },
    ketu?: { degree: number, sign: string, nakshatra: string }
  } | null>(null);

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  
  
  const setNodeMode = (mode: "mean" | "true") => {
    devLog.debug('Changing node mode', mode, 'vedic');
    
    // Capture current node positions before change
    let capturedPositions = null;
    if (unifiedChartData?.planets) {
      const rahu = unifiedChartData.planets.find((p: any) => 
        p.name.toLowerCase() === 'rahu' || p.name === 'Rahu'
      );
      const ketu = unifiedChartData.planets.find((p: any) => 
        p.name.toLowerCase() === 'ketu' || p.name === 'Ketu'
      );
      
      if (rahu || ketu) {
        capturedPositions = {
          rahu: rahu ? {
            degree: rahu.degree || rahu.degreeInSign || 0,
            sign: rahu.sign || rahu.signName,
            nakshatra: rahu.nakshatra || ''
          } : undefined,
          ketu: ketu ? {
            degree: ketu.degree || ketu.degreeInSign || 0,
            sign: ketu.sign || ketu.signName,
            nakshatra: ketu.nakshatra || ''
          } : undefined
        };
        setPreviousNodePositions(capturedPositions);
      }
    }
    
    // Update mode FIRST, then regenerate
    setCurrentNodeMode(mode);
    
    // Wait for state to update, then generate with captured positions
    setTimeout(() => {
      generateNewChart(capturedPositions, mode);
    }, 150);
  };
  
  const setChartStyle = (style: "north" | "south" | "both") => {
    devLog.debug('Changing chart style', style, 'vedic');
    setCurrentChartStyle(style);
  };
  
  // Helper function to transform planets for East Indian chart
  const transformPlanetsForChart = (chartData: any) => {
    // Handle both object and array formats
    const planetsData = chartData?.planets;
    
    if (!planetsData) {
      return [];
    }
    
    // If planets is an object (key-value pairs), convert to array
    if (typeof planetsData === 'object' && !Array.isArray(planetsData)) {
      const result = Object.entries(planetsData).map(([name, planet]: [string, any]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),  // Capitalize: sun → Sun
        sign: planet.lonSidereal ? Math.floor(planet.lonSidereal / 30) : (planet.divSign || planet.sign), // Use sidereal sign for D1, divSign for divisional charts
        degreeInSign: planet.degreeInSign || 0,
        isRetrograde: planet.isRetrograde || false
      }));
      return result;
    }
    
    // If planets is already an array, map directly
    if (Array.isArray(planetsData)) {
      const result = planetsData.map((planet: any) => ({
        name: (planet.planet || planet.name).charAt(0).toUpperCase() + (planet.planet || planet.name).slice(1),
        sign: planet.lonSidereal ? Math.floor(planet.lonSidereal / 30) : (planet.divSign || planet.sign), // Use sidereal sign for D1, divSign for divisional charts
        degreeInSign: planet.degreeInSign || 0,
        isRetrograde: planet.isRetrograde || false
      }));
      return result;
    }
    
    return [];
  };
  
  const nodeMode = currentNodeMode;
  const chartStyle = currentChartStyle;

  // Consolidate three data sources into unified structure
  const unifiedChartData = useMemo(() => {
    if (!newChartData) return null;
    
    // Start with astronomia data as base (most reliable)
    const baseData: any = {
      ascendant: {
        ...newChartData.ascendant,
        longitude: newChartData.ascendant.lonSidereal,
        sign: newChartData.ascendant.signName,
        degree: newChartData.ascendant.degreeInSign
      },
      // Convert planets object to array for easier mapping in UI
      planets: newChartData.planets && typeof newChartData.planets === 'object' 
        ? Object.entries(newChartData.planets).map(([name, data]: any) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),  // Capitalize: sun → Sun
            ...data,
            longitude: data.lonSidereal,  // Explicitly map lonSidereal to longitude
            speed: data.speed || 0  // Add speed if not present
          }))
        : [],
      houses: newChartData.houses,
      // ALWAYS use fresh Dasha calculations from newChartData
      // NEVER use vedicDerived.vedicReading.chartData.dasha as it may be stale
      dasha: newChartData.dasha || [],
      currentDasha: newChartData.currentDasha || null,
      divisionalCharts: newChartData.divisionalCharts || {},
      metadata: newChartData.metadata
    };
    
    devLog.debug('Using Dasha from newChartData', newChartData.dasha?.length ? { first: newChartData.dasha[0]?.planet, current: newChartData.currentDasha?.planet } : undefined, 'vedic');
    
    // Enhance with vedicDerived.vedicReading interpretations if available
    if (vedicDerived.vedicReading) {
      baseData.interpretations = vedicDerived.vedicReading.interpretations;
      baseData.remedies = vedicDerived.vedicReading.remedies;
      
      // REMOVED: Do not merge Dasha data from vedicDerived.vedicReading as it may be stale
      // Always use freshly calculated Dasha data from newChartData
      // The calculation is now correct and should not be overwritten
    }
    
    return baseData;
  }, [newChartData, vedicDerived.vedicReading]);

  // Generate comprehensive nakshatra analysis
  const nakshatraAnalysis = useMemo(() => {
    if (!unifiedChartData?.planets) return null;
    
    const planetaryPositions = unifiedChartData.planets.map((p: any) => ({
      planet: p.name,
      longitude: p.longitude,
      speed: p.speed || 0
    }));
    
    return calculateNakshatraAnalysis(planetaryPositions, newChartData?.metadata?.ayanamshaValue || 23.85);
  }, [unifiedChartData, newChartData]);

  // Calculate transit data
  const transitData = useMemo(() => {
    if (!unifiedChartData || !userProfile) return null;
    
    return calculateTransitData(unifiedChartData, {
      birthDate: userProfile.birthDate || '',
      birthTime: userProfile.birthTime || '',
      birthPlace: userProfile.birthPlace || '',
      latitude: unifiedChartData.metadata?.latitude || 0,
      longitude: unifiedChartData.metadata?.longitude || 0
    });
  }, [unifiedChartData, userProfile]);

  // Calculate planetary dignities once and reuse
  const planetaryDignities = useMemo(() => {
    if (!newChartData?.ascendant?.signName || !newChartData?.planets) {
      return {};
    }
    
    // The dignities are already calculated and stored in the chart data
    // This useMemo just ensures we don't recalculate unnecessarily
    const dignities: Record<string, any> = {};
    Object.entries(newChartData.planets).forEach(([name, data]: any) => {
      dignities[name] = {
        sign: data.signName,
        house: data.house,
        dignity: data.dignity,
        strength: data.dignity?.strength
      };
    });
    
    devLog.debug('Planetary Dignities', { ascendant: newChartData.ascendant.signName, dignities }, 'vedic');
    
    return dignities;
  }, [newChartData?.ascendant?.signName, newChartData?.planets]);

  // Calculate Vedic Numerology profile for Ask the Seer
  const vedicNumerologyProfile = useMemo(() => {
    if (!userProfile?.birthDate || !userProfile?.displayName) return null;
    try {
      return calculateVedicNumerologyProfile(userProfile.displayName, userProfile.birthDate);
    } catch (error) {
      devLog.error('Error calculating Vedic numerology', error, 'vedic');
      return null;
    }
  }, [userProfile?.birthDate, userProfile?.displayName]);

  // Check if user has complete birth details (only check fields that exist in UserProfile)
  const hasCompleteDetails = userProfile && 
    userProfile.birthDate && 
    userProfile.birthTime && 
    userProfile.birthPlace;

  // Pipeline-only: Vedic report data derived from profile via useVedicProfile (no local state copy)

  // Calculate Panchanga when chart data is available
  useEffect(() => {
    if (!newChartData || !userProfile || !coordinates) return;
    
    try {
      devLog.debug('Calculating enhanced Panchanga data', undefined, 'vedic');
      
      // Calculate birth Panchanga from newChartData
      const birthPanchanga = calculateAccuratePanchanga(newChartData, {
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime,
        birthPlace: userProfile.birthPlace
      });
      setPanchangaData(birthPanchanga);
      
      // Calculate current Panchanga for today
      const currentPanchanga = calculateCurrentPanchanga(
        userProfile.birthPlace ?? '',
        coordinates.latitude,
        coordinates.longitude
      );
      setCurrentPanchangaData(currentPanchanga);
      
      devLog.debug('Enhanced Panchanga calculated', { hasBirth: !!birthPanchanga, hasCurrent: !!currentPanchanga }, 'vedic');
    } catch (error) {
      devLog.error('Error calculating enhanced Panchanga', error, 'vedic');
    }
  }, [newChartData, userProfile, coordinates]);

  // Pipeline-only: interpretations come from profile.interpretations (see derived state); no loadInterpretationsWithHybridFallback or /api/vedic-interpretations/* on mount

  // Pipeline-only: divisional data from profile when available; no loadDivisionalInterpretations on mount

  if (!user) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-slate-900/50 border-amber-500/50 backdrop-blur-sm m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-xl">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-amber-200 mb-2">Authentication Required</h2>
              <p className="text-slate-300">Please sign in to access your Vedic astrology chart.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Card className="w-full max-w-2xl mx-auto bg-slate-900/50 border-amber-500/50 backdrop-blur-sm m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-xl">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-amber-200 mb-2">Profile Incomplete</h2>
              <p className="text-slate-300 mb-4">
                Please complete your birth details to generate your Vedic astrology chart.
              </p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <a href="/profile-setup">Complete Profile</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pipeline-only: no Vedic data without comprehensive profile
  if (profileLoading) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          <p className="text-slate-300">Loading your mystical profile...</p>
        </div>
      </div>
    );
  }
  if (!comprehensiveProfile || !hasVedicData) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-slate-900/50 border-amber-500/50 backdrop-blur-sm m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-xl">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-amber-200 mb-2">Generate your mystical profile</h2>
              <p className="text-slate-300 mb-4">
                Your Vedic chart and interpretations are generated from your mystical profile. Create or update it to see your chart here.
              </p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <Link href="/profile">Generate your mystical profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ToolReportGuard loading={profileLoading} error={profileError ?? null} toolLabel="Vedic astrology">
    <div className="relative min-h-screen starfield-ultra-sharp">
      
      {/* Node Change Toast */}
      {highlightedNodes.length > 0 && previousNodePositions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 bg-slate-800/50 border-amber-500/50 rounded-2xl p-4 shadow-2xl max-w-md backdrop-blur-md"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-200 mb-1">
                Node Positions Updated
              </h4>
              <div className="text-xs text-slate-300 space-y-1">
                {/* Show Rahu change */}
                {previousNodePositions.rahu && unifiedChartData?.planets && (() => {
                  const newRahu = unifiedChartData.planets.find((p: any) => 
                    p.name.toLowerCase() === 'rahu'
                  );
                  if (newRahu) {
                    const degChange = Math.abs(
                      (newRahu.degree || newRahu.degreeInSign) - previousNodePositions.rahu.degree
                    );
                    return (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-amber-400">Rahu:</span>
                        <span>{previousNodePositions.rahu.degree.toFixed(2)}°</span>
                        <span className="text-amber-400">→</span>
                        <span>{(newRahu.degree || newRahu.degreeInSign).toFixed(2)}°</span>
                        <span className="text-green-400">(Δ {degChange.toFixed(2)}°)</span>
                      </div>
                    );
                  }
                })()}
                
                {/* Show Ketu change */}
                {previousNodePositions.ketu && unifiedChartData?.planets && (() => {
                  const newKetu = unifiedChartData.planets.find((p: any) => 
                    p.name.toLowerCase() === 'ketu'
                  );
                  if (newKetu) {
                    const degChange = Math.abs(
                      (newKetu.degree || newKetu.degreeInSign) - previousNodePositions.ketu.degree
                    );
                    return (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-amber-400">Ketu:</span>
                        <span>{previousNodePositions.ketu.degree.toFixed(2)}°</span>
                        <span className="text-amber-400">→</span>
                        <span>{(newKetu.degree || newKetu.degreeInSign).toFixed(2)}°</span>
                        <span className="text-green-400">(Δ {degChange.toFixed(2)}°)</span>
                      </div>
                    );
                  }
                })()}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Check the Planets tab to see highlighted changes
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-sacred-heading font-semibold mb-6">
              <span className="text-yellow-400">🕉️</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Vedic Astrology</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Ancient wisdom of Jyotish with precise sidereal calculations
            </p>
          </motion.div>
        </div>

        {/* Profile Summary */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="border-2 border-amber-300 hover:border-amber-400 m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition rounded-3xl m3-transition-standard transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-amber-400" />
              <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-amber-400/30 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 text-lg">{userProfile.fullName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-700 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span>{userProfile.birthDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>{userProfile.birthTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-amber-600" />
                          <span>{userProfile.birthPlace}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Settings Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-2 border-amber-300 m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition rounded-3xl overflow-hidden">
            <div className="h-1 bg-amber-400" />
            <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
              <SettingsBar
                nodeMode={nodeMode}
                onNodeModeChange={setNodeMode}
                chartStyle={chartStyle}
                onChartStyleChange={setChartStyle}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <Card className="border-2 border-red-300 m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition rounded-3xl overflow-hidden">
              <div className="h-1 bg-red-400" />
              <CardContent className="bg-gradient-to-br from-red-50 to-rose-50 p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-red-900">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <Card className="border-2 border-amber-300 m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition rounded-3xl overflow-hidden">
              <div className="h-1 bg-amber-400" />
              <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span className="text-amber-900 font-medium">Calculating your chart...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        {(chartData || vedicDerived.vedicReading) && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden min-w-0">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                <TabsTrigger 
                  value="introduction"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span>Introduction</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="compatibility"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span>Compare</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="overview"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Overview</span>
                  <span className="text-[9px] opacity-75">Samanya Drishti</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="report"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Report</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="charts"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Charts</span>
                  <span className="text-[9px] opacity-75">Kundali</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="divisional"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Divisional</span>
                  <span className="text-[9px] opacity-75">Varga Kundali</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="planets"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Planets</span>
                  <span className="text-[9px] opacity-75">Grahas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="houses"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Houses</span>
                  <span className="text-[9px] opacity-75">Bhavas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="yogas"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Planetary Combinations</span>
                  <span className="text-[9px] opacity-75">Yogas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="nakshatras"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Lunar Mansions</span>
                  <span className="text-[9px] opacity-75">Nakshatras</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dasha"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Planetary Periods</span>
                  <span className="text-[9px] opacity-75">Dasha</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="transits"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Transits</span>
                  <span className="text-[9px] opacity-75">Gochara</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="panchanga"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Vedic Calendar</span>
                  <span className="text-[9px] opacity-75">Panchanga</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="interpretations"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Insights</span>
                  <span className="text-[9px] opacity-75">Phalita</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="remedies"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Remedies</span>
                  <span className="text-[9px] opacity-75">Upayas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="astro-numerology"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Astro-Numerology</span>
                  <span className="text-[9px] opacity-75">Graha Anka</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="gotra"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex flex-col items-center justify-center gap-0.5 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <span className="font-semibold">Gotra</span>
                  <span className="text-[9px] opacity-75">Lineage</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ask-seer"
                  className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 m3-elevation-transition rounded-t-lg rounded-b-none px-1 py-0.5 text-xs font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 m3-transition-standard transition-all flex items-center justify-center gap-1 border border-transparent data-[state=inactive]:border-slate-600/50"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span className="font-semibold">Ask the Seer</span>
                </TabsTrigger>
              </TabsList>

              {/* Introduction Tab */}
              <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <ToolIntroductionTab toolSlug="vedic-astrology" />
              </TabsContent>

              {/* Compatibility Tab */}
              <TabsContent value="compatibility" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <CompatibilityTab toolSlug="vedic-astrology" />
              </TabsContent>

              {/* Report Tab */}
              <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <ComprehensiveVedicReport
                  userId={user?.uid}
                  vedicChartData={newChartData}
                  userProfile={userProfile}
                  cachedReport={comprehensiveReport}
                  isLoadingReport={isLoadingComprehensiveReport}
                />
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {/* Vedic Dashboard Hero */}
                {unifiedChartData && (
                  <VedicDashboardHero
                    chartData={unifiedChartData}
                    userProfile={userProfile}
                    chartStyle={chartStyle === 'north' ? 'north-indian' : chartStyle === 'south' ? 'south-indian' : 'north-indian'}
                    vedicReading={vedicDerived.vedicReading}
                  />
                )}

                {chartData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ascendant Info */}
                    <DevotionistStyleCard
                      icon={<Star className="w-5 h-5" />}
                      title="Ascendant"
                      summary="Your rising sign represents your outer personality and how others perceive you"
                      items={[
                        { text: `Sign: ${getDualSignName(chartData.ascendant.signName)}`, highlight: true },
                        { text: `Degree: ${chartData.ascendant.degreeInSign.toFixed(2)}°` },
                        { text: `Ayanamsha: ${chartData.ayanamsha.toFixed(2)}°` }
                      ]}
                      colorScheme="amber"
                    />

                  </div>
                ) : (
                  <DevotionistStyleCard
                    icon={<Sparkles className="w-5 h-5" />}
                    title="Chart Data Loading"
                    summary="Your astrological chart is being calculated..."
                    colorScheme="amber"
                  />
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DevotionistStyleCard
                    icon={<Star className="w-5 h-5" />}
                    title={`${chartData ? chartData.placements.reduce((sum: number, house: { planets: unknown[] }) => sum + house.planets.length, 0) : '9'}`}
                    summary="Planets"
                    colorScheme="amber"
                    variant="callout"
                  />
                  <DevotionistStyleCard
                    icon={<Home className="w-5 h-5" />}
                    title="12"
                    summary="Houses"
                    colorScheme="blue"
                    variant="callout"
                  />
                  <DevotionistStyleCard
                    icon={<Moon className="w-5 h-5" />}
                    title="27"
                    summary="Lunar Mansions"
                    colorScheme="purple"
                    variant="callout"
                  />
                  <DevotionistStyleCard
                    icon={<Clock className="w-5 h-5" />}
                    title="120"
                    summary="Planetary Period Years"
                    colorScheme="cyan"
                    variant="callout"
                  />
                </div>

                {/* Enhanced Overview Interpretation */}
                {unifiedChartData && (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {/* 1. Enhanced Groq Interpretation (if available) */}
                    {vedicDerived.isGeneratingInterpretations && (
                      <DevotionistStyleCard
                        icon={<Loader2 className="w-5 h-5 animate-spin" />}
                        title="Generating Personalized Insights"
                        summary="Analyzing your birth chart to provide personalized Vedic astrology insights..."
                        colorScheme="amber"
                      />
                    )}
                    
                    {/* Display personalized overview from vedicDerived.vedicReading */}
                    {(() => {
                      const personality = vedicDerived.vedicReading?.interpretations?.personality as { overview?: string } | undefined
                      return personality?.overview ? (
                      <div className="space-y-4">
                        <DevotionistStyleCard
                          icon={<Star className="w-5 h-5" />}
                          title="Your Astrological Profile"
                          summary={personality.overview}
                          colorScheme="amber"
                          variant="callout"
                        />
                      </div>
                      ) : null
                    })()}
                    
                    {/* 2. Structured Key Insights */}
                    <DevotionistStyleCard
                      icon={<Sparkles className="w-5 h-5" />}
                      title="Key Insights"
                      items={[
                        ...(unifiedChartData?.ascendant ? [{ text: `Rising Sign: ${getDualSignName(unifiedChartData.ascendant.signName)} (${unifiedChartData.ascendant.degree?.toFixed(2) || '0.00'}°)`, highlight: true }] : []),
                        ...(yogas && yogas.length > 0 ? [{ text: `Special Yogas: ${yogas.length} powerful combinations detected`, type: 'positive' as const }] : []),
                        ...(unifiedChartData?.currentDasha ? [{ text: `Current Period: ${unifiedChartData.currentDasha.planet || unifiedChartData.currentDasha.name} Planetary Period` }] : []),
                        ...(unifiedChartData?.planets && unifiedChartData.planets.length > 0 ? [{ text: `Planetary Strengths: ${unifiedChartData.planets.filter((p: any) => p.dignity?.exalted).length} exalted, ${unifiedChartData.planets.filter((p: any) => p.isRetrograde).length} retrograde` }] : [])
                      ]}
                      colorScheme="blue"
                    />
                  </div>
                )}

              </TabsContent>

              {/* Charts Tab */}
              <TabsContent value="charts" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {(chartData || vedicDerived.vedicReading) ? (
                  <div className="space-y-8">
                    {/* Primary Chart Section */}
                    {/* Chart Disclaimer */}
                    {chartDisclaimer && (
                      <Alert className="bg-amber-50/80 border-2 border-amber-300 mb-6">
                        <AlertTriangle className="h-4 w-4 text-amber-700" />
                        <AlertDescription className="text-slate-800 text-sm font-sacred-body">
                          {chartDisclaimer}
                          
                          {!userProfile?.birthTimeKnown && (
                            <div className="mt-3">
                              <Link href="/profile">
                                <Button size="sm" variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-100">
                                  Update Birth Time Information
                                </Button>
                              </Link>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    <DevotionistStyleCard
                      icon={<Eye className="w-5 h-5" />}
                      title={`${getDualSignName(unifiedChartData?.ascendant?.signName || newChartData?.ascendant?.signName || 'Unknown')} Ascendant Charts`}
                      summary="Your birth chart displayed in different traditional Vedic styles"
                      colorScheme="amber"
                      variant="callout"
                    >
                      {(() => {
                        return (unifiedChartData || newChartData);
                      })() ? (
                        <div className="space-y-8 mt-6">
                          {/* Row 1: North Indian and South Indian Charts */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-slate-800 text-center">
                                North Indian Chart
                              </h3>
                              <div className="flex justify-center items-center w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]">
                                {(() => {
                                  const chartData = unifiedChartData || newChartData;
                                  const transformedPlanets = transformPlanetsForChart(chartData);
                                  const ascLongitude = unifiedChartData?.ascendant?.longitude || newChartData?.ascendant?.lonSidereal;
                                  const ascSign = ascLongitude ? Math.floor(ascLongitude / 30) : 0;
                                  const ascDegree = unifiedChartData?.ascendant?.degree || newChartData?.ascendant?.degreeInSign || 0;
                                  return (
                                    <div className="w-full flex justify-center">
                                      <NorthIndianVedicChart
                                        planets={transformedPlanets}
                                        ascendantSign={ascSign}
                                        ascendantDegree={ascDegree}
                                        chartType="D1"
                                      />
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-slate-800 text-center">South Indian Chart</h3>
                              <div className="flex justify-center items-center w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]">
                                {(() => {
                                  if (coordinates) {
                                    return (
                                      <div className="w-full flex justify-center">
                                        <ReadyToUseVedicChart
                                          name={userProfile.displayName ?? "Vedic Chart"}
                                          birthDate={userProfile.birthDate ?? ''}
                                          birthTime={userProfile.birthTime ?? ''}
                                          birthPlace={userProfile.birthPlace ?? ''}
                                          latitude={coordinates.latitude}
                                          longitude={coordinates.longitude}
                                          chartType="D1"
                                          showBothStyles={false}
                                          chartStyle="south"
                                        />
                                      </div>
                                    );
                                  } else {
                                    const chartData = unifiedChartData || newChartData;
                                    const transformedPlanets = transformPlanetsForChart(chartData);
                                    const ascLongitude = unifiedChartData?.ascendant?.longitude || newChartData?.ascendant?.lonSidereal;
                                    const ascSign = ascLongitude ? Math.floor(ascLongitude / 30) : 0;
                                    const ascDegree = unifiedChartData?.ascendant?.degree || newChartData?.ascendant?.degreeInSign || 0;
                                    return (
                                      <div className="w-full flex justify-center">
                                        <SouthIndianVedicChart
                                          planets={transformedPlanets}
                                          ascendantSign={ascSign}
                                          ascendantDegree={ascDegree}
                                          chartType="D1"
                                        />
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Row 2: East Indian Chart and Nakshatra Wheel */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-slate-800 text-center">
                                East Indian Chart
                              </h3>
                              <div className="flex justify-center items-center w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]">
                                {(() => {
                                  const chartData = unifiedChartData || newChartData;
                                  const transformedPlanets = transformPlanetsForChart(chartData);
                                  const ascLongitude = unifiedChartData?.ascendant?.longitude || newChartData?.ascendant?.lonSidereal;
                                  const ascSign = ascLongitude ? Math.floor(ascLongitude / 30) : 0;
                                  const ascDegree = unifiedChartData?.ascendant?.degree || newChartData?.ascendant?.degreeInSign || 0;
                                  return (
                                    <div className="w-full flex justify-center">
                                      <EastIndianVedicChart
                                        planets={transformedPlanets}
                                        ascendantSign={ascSign}
                                        ascendantDegree={ascDegree}
                                        chartType="D1"
                                      />
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-slate-800 text-center">
                                Nakshatra Wheel
                              </h3>
                              <div className="flex justify-center items-center w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]">
                                {(() => {
                                  // VedicChartCircular needs planets as an object (Record), not array
                                  // Use newChartData directly as it has planets as object, or reconstruct from unifiedChartData
                                  const chartDataForCircular = newChartData || unifiedChartData;
                                  const planetsObject = chartDataForCircular?.planets && typeof chartDataForCircular.planets === 'object' && !Array.isArray(chartDataForCircular.planets)
                                    ? chartDataForCircular.planets
                                    : (unifiedChartData?.planets && Array.isArray(unifiedChartData.planets)
                                      ? unifiedChartData.planets.reduce((acc: any, p: any) => {
                                          const key = p.name?.toLowerCase() || p.planet?.toLowerCase() || '';
                                          if (key) acc[key] = p;
                                          return acc;
                                        }, {})
                                      : (newChartData?.planets || {}));
                                  const circularChartData = {
                                    planets: planetsObject,
                                    ascendant: chartDataForCircular?.ascendant
                                  };
                                  return (
                                    <div className="w-full flex justify-center">
                                      <VedicChartCircular
                                        chart={circularChartData}
                                        name="nakshatra-wheel"
                                        radius={110}
                                        onPlanetClick={handlePlanetClick}
                                      />
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center min-h-[500px] mt-6">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                            <p className="text-slate-600">Generating charts...</p>
                          </div>
                        </div>
                      )}
                    </DevotionistStyleCard>


                    {/* Divisional Charts Section - Simple Grid */}
                    {unifiedChartData?.divisionalCharts && Object.keys(unifiedChartData.divisionalCharts).length > 0 ? (
                      <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                        <DevotionistStyleCard
                          icon={<Sparkles className="w-5 h-5" />}
                          title="Divisional Charts (Vargas)"
                          summary="Specialized charts revealing different aspects of your life"
                          colorScheme="purple"
                          variant="callout"
                        />
                        <div className="space-y-8 bg-white/80 border-2 border-purple-300 rounded-xl p-6">
                          {/* Row 3: D9 and D10 */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* D9 Navamsa */}
                            {unifiedChartData.divisionalCharts.D9 && (
                              <div className="space-y-4">
                                <div className="text-center">
                                  <h3 className="text-lg font-semibold text-slate-800 flex items-center justify-center gap-2">
                                    <span>🏛️</span>
                                    <span>D9 Navamsa</span>
                                  </h3>
                                  <p className="text-sm text-slate-600 mt-1">Marriage & Spirituality</p>
                                </div>
                                <SouthIndianVedicChart
                                  planets={transformPlanetsForChart({
                                    planets: unifiedChartData.divisionalCharts.D9,
                                    chartType: 'D9'
                                  })}
                                  ascendantSign={unifiedChartData.divisionalCharts.D9.ascendant?.divSign || unifiedChartData.ascendant?.sign || 0}
                                  ascendantDegree={unifiedChartData.divisionalCharts.D9.ascendant?.degreeInSign || unifiedChartData.ascendant?.degreeInSign || 0}
                                  chartType="D9"
                                />
                              </div>
                            )}
                            
                            {/* D10 Dasamsa */}
                            {unifiedChartData.divisionalCharts.D10 && (
                              <div className="space-y-4">
                                <div className="text-center">
                                  <h3 className="text-lg font-semibold text-slate-800 flex items-center justify-center gap-2">
                                    <span>👑</span>
                                    <span>D10 Dasamsa</span>
                                  </h3>
                                  <p className="text-sm text-slate-600 mt-1">Career & Profession</p>
                                </div>
                                <SouthIndianVedicChart
                                  planets={transformPlanetsForChart({
                                    planets: unifiedChartData.divisionalCharts.D10,
                                    chartType: 'D10'
                                  })}
                                  ascendantSign={unifiedChartData.divisionalCharts.D10.ascendant?.divSign || unifiedChartData.ascendant?.sign || 0}
                                  ascendantDegree={unifiedChartData.divisionalCharts.D10.ascendant?.degreeInSign || unifiedChartData.ascendant?.degreeInSign || 0}
                                  chartType="D10"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Row 4: D12 and D30 */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* D12 Dwadasamsa */}
                            {unifiedChartData.divisionalCharts.D12 && (
                              <div className="space-y-4">
                                <div className="text-center">
                                  <h3 className="text-lg font-semibold text-slate-800 flex items-center justify-center gap-2">
                                    <span>👨‍👩‍👧‍👦</span>
                                    <span>D12 Dwadasamsa</span>
                                  </h3>
                                  <p className="text-sm text-slate-600 mt-1">Parents & Ancestry</p>
                                </div>
                                <SouthIndianVedicChart
                                  planets={transformPlanetsForChart({
                                    planets: unifiedChartData.divisionalCharts.D12,
                                    chartType: 'D12'
                                  })}
                                  ascendantSign={unifiedChartData.divisionalCharts.D12.ascendant?.divSign || unifiedChartData.ascendant?.sign || 0}
                                  ascendantDegree={unifiedChartData.divisionalCharts.D12.ascendant?.degreeInSign || unifiedChartData.ascendant?.degreeInSign || 0}
                                  chartType="D12"
                                />
                              </div>
                            )}
                            
                            {/* D30 Trimsamsa */}
                            {unifiedChartData.divisionalCharts.D30 && (
                              <div className="space-y-4">
                                <div className="text-center">
                                  <h3 className="text-lg font-semibold text-slate-800 flex items-center justify-center gap-2">
                                    <span>🏥</span>
                                    <span>D30 Trimsamsa</span>
                                  </h3>
                                  <p className="text-sm text-slate-600 mt-1">Health & Physical Body</p>
                                </div>
                                <SouthIndianVedicChart
                                  planets={transformPlanetsForChart({
                                    planets: unifiedChartData.divisionalCharts.D30,
                                    chartType: 'D30'
                                  })}
                                  ascendantSign={unifiedChartData.divisionalCharts.D30.ascendant?.divSign || unifiedChartData.ascendant?.sign || 0}
                                  ascendantDegree={unifiedChartData.divisionalCharts.D30.ascendant?.degreeInSign || unifiedChartData.ascendant?.degreeInSign || 0}
                                  chartType="D30"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <DevotionistStyleCard
                        icon={<Sparkles className="w-5 h-5" />}
                        title="Divisional Charts (Vargas)"
                        summary="Divisional chart data not available"
                        colorScheme="purple"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Chart Data Available</h3>
                    <p className="text-gray-400">Complete your birth details to generate beautiful Vedic charts</p>
                  </div>
                )}
              </TabsContent>

              {/* Planets Tab */}
              <TabsContent value="planets" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {unifiedChartData ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {/* Planetary Positions */}
                    <DevotionistStyleCard
                      icon={<Star className="w-5 h-5" />}
                      title="Planetary Positions"
                      summary="Complete positions of all planets in your birth chart"
                      colorScheme="amber"
                      variant="callout"
                    />
                    <div className="max-w-full overflow-x-auto bg-white/80 border-2 border-amber-300 rounded-xl p-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-amber-300">
                            <th className="text-left text-slate-800 font-semibold py-2">Planet</th>
                            <th className="text-left text-slate-800 font-semibold py-2">Sign</th>
                            <th className="text-left text-slate-800 font-semibold py-2">Degree</th>
                            <th className="text-left text-slate-800 font-semibold py-2">House</th>
                            <th className="text-left text-slate-800 font-semibold py-2">Nakshatra</th>
                            <th className="text-left text-slate-800 font-semibold py-2">Dignity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unifiedChartData.planets?.map((planet: any, index: number) => {
                            const isHighlighted = highlightedNodes.some(name => 
                              planet.name.toLowerCase() === name.toLowerCase()
                            );
                            
                            return (
                              <tr 
                                key={index} 
                                className={`border-b border-amber-200 hover:bg-amber-50 m3-transition-standard transition-all duration-300 ${
                                  isHighlighted ? 'bg-amber-100 ring-2 ring-amber-400' : ''
                                }`}
                              >
                                <td className={`py-2 font-medium ${
                                  isHighlighted ? 'text-amber-800' : 'text-slate-700'
                                }`}>
                                  {getDualPlanetName(planet.name)}
                                  {isHighlighted && (
                                    <span className="ml-2 text-xs text-amber-600">● Updated</span>
                                  )}
                                </td>
                                <td className="text-slate-700 py-2">{getDualSignName(planet.sign || planet.signName)}</td>
                                <td className="text-slate-700 py-2">{planet.degree || planet.degreeInSign}°</td>
                                <td className="text-slate-700 py-2">{planet.house}</td>
                                <td className="text-slate-700 py-2">{planet.nakshatra || 'N/A'}</td>
                                <td className="text-slate-700 py-2">
                                  {planet.dignity ? (
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      planet.dignity.exalted ? 'bg-green-100 text-green-800' :
                                      planet.dignity.debilitated ? 'bg-red-100 text-red-800' :
                                      planet.dignity.ownSign ? 'bg-blue-100 text-blue-800' :
                                      'bg-slate-100 text-slate-600'
                                    }`}>
                                      {planet.dignity.exalted ? 'Exalted' :
                                       planet.dignity.debilitated ? 'Debilitated' :
                                       planet.dignity.ownSign ? 'Own Sign' : 'Neutral'}
                                    </span>
                                  ) : 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Shadbala Analysis */}
                    {shadbalaData && (
                      <ShadbalaAnalysis shadbalaAnalysis={shadbalaData} />
                    )}
                    
                    {/* Enhanced Planetary Interpretations */}
                    <DevotionistStyleCard
                      icon={<Sparkles className="w-5 h-5" />}
                      title="Planetary Insights"
                      summary="Detailed interpretations of each planet's influence in your chart"
                      colorScheme="blue"
                      variant="callout"
                    />
                    <div className="space-y-6 bg-white/80 border-2 border-blue-300 rounded-xl p-6">
                      {unifiedChartData.planets?.map((planet: any, index: number) => {
                        const planetName = planet.name;
                        const enhancedInterpretation = vedicDerived.enhancedPlanets[planetName];
                        
                        const planetItems = [
                          { text: `${getDualSignName(planet.sign || planet.signName)} • ${getOrdinal(planet.house)} House • ${planet.nakshatra}`, highlight: true },
                          ...(vedicDerived.isGeneratingInterpretations ? [{ text: 'Generating insights...' }] : enhancedInterpretation ? [{ text: enhancedInterpretation }] : [
                            { text: `${planetName} in ${getDualSignName(planet.sign || planet.signName)} in the ${getOrdinal(planet.house)} house brings ${getHouseTheme(planet.house)} into your life through ${planetName}'s unique energy.` },
                            { text: `Nakshatra: ${planet.nakshatra} • Dignity: ${planet.dignity?.strength || 'Neutral'} • ${planet.dignity?.exalted ? 'Exalted - Maximum strength' : planet.dignity?.debilitated ? 'Debilitated - Challenges to overcome' : 'Natural expression'}`, type: 'neutral' as const }
                          ])
                        ];
                        
                        return (
                          <DevotionistStyleCard
                            key={index}
                            icon={<Star className="w-4 h-4" />}
                            title={getDualPlanetName(planetName)}
                            items={planetItems}
                            colorScheme="blue"
                          />
                        );
                      })}
                    </div>

                    {/* Planetary Strengths */}
                    <DevotionistStyleCard
                      icon={<Activity className="w-5 h-5" />}
                      title="Planetary Strengths"
                      summary="Strength assessment of each planet in your chart"
                      colorScheme="purple"
                      variant="callout"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 border-2 border-purple-300 rounded-xl p-6">
                      {unifiedChartData.planets?.map((planet: any, index: number) => {
                        const strength = Math.floor(Math.random() * 100) + 1; // Placeholder - would come from Shadbala
                        const strengthLabel = strength >= 80 ? 'Very Strong' : strength >= 60 ? 'Strong' : strength >= 40 ? 'Moderate' : 'Weak';
                        return (
                          <DevotionistStyleCard
                            key={index}
                            icon={<Activity className="w-4 h-4" />}
                            title={planet.name}
                            subtitle={`${strength}% - ${strengthLabel}`}
                            summary={`${strengthLabel} planetary influence`}
                            colorScheme={strength >= 80 ? 'green' : strength >= 60 ? 'blue' : strength >= 40 ? 'orange' : 'cyan'}
                            variant="callout"
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : vedicDerived.vedicReading ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-amber-200">Planetary Positions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-w-full overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left py-2 text-amber-200">Planet</th>
                                <th className="text-left py-2 text-amber-200">Sign</th>
                                <th className="text-left py-2 text-amber-200">Degree</th>
                                <th className="text-left py-2 text-amber-200">House</th>
                                <th className="text-left py-2 text-amber-200">Nakshatra</th>
                                <th className="text-left py-2 text-amber-200">Pada</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(vedicDerived.vedicReading as { chartData?: { planets?: Array<Record<string, unknown>> } })?.chartData?.planets?.map((planet: Record<string, unknown>, index: number) => (
                                <tr key={index} className="border-b border-amber-500/50">
                                  <td className="py-2 text-slate-300">{String(planet.name ?? '')}</td>
                                  <td className="py-2 text-slate-300">{String(planet.sign ?? '')}</td>
                                  <td className="py-2 text-slate-300">{typeof planet.degree === 'number' ? planet.degree.toFixed(2) : ''}°</td>
                                  <td className="py-2 text-slate-300">{String(planet.house ?? '')}</td>
                                  <td className="py-2 text-slate-300">{String(planet.nakshatra ?? '')}</td>
                                  <td className="py-2 text-slate-300">{String(planet.pada ?? '')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-4">🪐</div>
                      <h3 className="text-xl font-semibold text-amber-200 mb-2">Planetary Data Loading</h3>
                      <p className="text-slate-300">Your planetary positions are being calculated...</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Houses Tab */}
              <TabsContent value="houses" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {unifiedChartData ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {/* Enhanced House Interpretations */}
                    <DevotionistStyleCard
                      icon={<Home className="w-5 h-5" />}
                      title="House Insights"
                      summary="Detailed analysis of each house and its influence on different life areas"
                      colorScheme="purple"
                      variant="callout"
                    />
                    <div className="space-y-6 bg-white/80 border-2 border-purple-300 rounded-xl p-6">
                      {unifiedChartData.houses?.map((house: any, index: number) => {
                        const houseNumber = index + 1;
                        const enhancedInterpretation = vedicDerived.enhancedHouses[houseNumber];
                        
                        const houseItems = [
                          { text: `${getDualSignName(house.sign || house.signName)} • Lord: ${getDualPlanetName(house.lord)}`, highlight: true },
                          ...(vedicDerived.isGeneratingInterpretations ? [{ text: 'Generating insights...' }] : enhancedInterpretation ? [{ text: enhancedInterpretation }] : [
                            { text: `The ${getOrdinal(houseNumber)} house in ${getDualSignName(house.sign || house.signName)}, ruled by ${getDualPlanetName(house.lord)}, governs ${getHouseTheme(houseNumber)} in your life.` },
                            { text: `This house's energy is colored by ${getDualSignName(house.sign || house.signName)}'s qualities, influencing how you experience and express this life area.`, type: 'neutral' as const }
                          ])
                        ];
                        
                        return (
                          <DevotionistStyleCard
                            key={index}
                            icon={<Home className="w-4 h-4" />}
                            title={getDualHouseName(houseNumber)}
                            items={houseItems}
                            colorScheme="purple"
                          />
                        );
                      })}
                    </div>

                    {/* Basic House Analysis */}
                    <DevotionistStyleCard
                      icon={<Home className="w-5 h-5" />}
                      title="House Analysis Summary"
                      summary="Quick reference for all 12 houses"
                      colorScheme="blue"
                      variant="callout"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white/80 border-2 border-blue-300 rounded-xl p-6">
                      {unifiedChartData.houses?.map((house: any, index: number) => {
                        const houseItems = [
                          { text: `Sign: ${getDualSignName(house.sign || house.signName)}`, highlight: true },
                          { text: `Lord: ${getDualPlanetName(house.lord)}` },
                          ...(house.degree ? [{ text: `Degree: ${house.degree}°` }] : [])
                        ];
                        return (
                          <DevotionistStyleCard
                            key={index}
                            icon={<Home className="w-4 h-4" />}
                            title={getDualHouseName(index + 1)}
                            items={houseItems}
                            colorScheme="blue"
                            variant="callout"
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : vedicDerived.vedicReading ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <DevotionistStyleCard
                      icon={<Home className="w-5 h-5" />}
                      title="House Analysis"
                      summary="Analysis of all 12 houses in your birth chart"
                      colorScheme="purple"
                      variant="callout"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white/80 border-2 border-purple-300 rounded-xl p-6">
                      {(vedicDerived.vedicReading as { chartData?: { houses?: Array<Record<string, unknown>> } })?.chartData?.houses?.map((house: Record<string, unknown>, index: number) => {
                        const houseItems = [
                          { text: `Sign: ${String(house.sign ?? '')}`, highlight: true },
                          { text: `Lord: ${String(house.lord ?? '')}` },
                          { text: `Degree: ${typeof house.degree === 'number' ? house.degree.toFixed(2) : ''}°` }
                        ];
                        return (
                          <DevotionistStyleCard
                            key={index}
                            icon={<Home className="w-4 h-4" />}
                            title={`House ${String(house.number ?? index + 1)}`}
                            items={houseItems}
                            colorScheme="purple"
                            variant="callout"
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <DevotionistStyleCard
                    icon={<Home className="w-5 h-5" />}
                    title="House Data Loading"
                    summary="Your house cusps and rulers are being calculated..."
                    colorScheme="purple"
                  />
                )}
              </TabsContent>

              {/* Dasha Tab */}
              <TabsContent value="dasha" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {(() => {
                  const dashaData = unifiedChartData?.dasha || [];
                  const currentDasha = unifiedChartData?.currentDasha || null;
                  
                  if (dashaData.length > 0) {
                    return (
                      <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                        {/* Current Dasha Highlight */}
                        {currentDasha && (
                          <div className="space-y-4">
                            <DevotionistStyleCard
                              icon={<Star className="w-6 h-6" />}
                              title={`Current Planetary Period: ${currentDasha.planet || currentDasha.name}`}
                              summary={`You are ${currentDasha.progress?.toFixed(1) || 0}% through this ${currentDasha.duration || 0}-year period`}
                              items={[
                                { text: `Start: ${currentDasha.startDate}`, highlight: true },
                                { text: `End: ${currentDasha.endDate}` },
                                { text: `Duration: ${currentDasha.duration} years` },
                                ...(currentDasha.progress !== undefined ? [{ text: `Progress: ${currentDasha.progress.toFixed(1)}%` }] : [])
                              ]}
                              colorScheme="amber"
                              variant="callout"
                            />
                            {currentDasha.progress !== undefined && (
                              <div className="w-full bg-slate-200 rounded-full h-3">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${currentDasha.progress}%` }}
                                />
                              </div>
                            )}
                            <DevotionistStyleCard
                              icon={<Sparkles className="w-5 h-5" />}
                              title="Period Insights"
                              summary={vedicDerived.isGeneratingInterpretations ? 'Generating insights...' : vedicDerived.enhancedDasha || `Your current ${currentDasha.planet || currentDasha.name} planetary period brings significant themes and opportunities to your life. This planetary influence shapes your experiences and growth during this time.`}
                              colorScheme="blue"
                            />
                          </div>
                        )}
                        
                        {/* Dasha Analysis */}
                        <DashaPanelSimplified 
                          chartData={{
                            currentDasha: unifiedChartData.currentDasha,
                            dasha: unifiedChartData.dasha || []
                          }}
                          birthData={userProfile ? {
                            birthDate: userProfile.birthDate || '',
                            birthTime: userProfile.birthTime || '',
                            birthPlace: userProfile.birthPlace || ''
                          } : undefined}
                        />
                      </div>
                    );
                  }
                  
                  // Fallback UI when no dasha data
                  return (
                    <DevotionistStyleCard
                      icon={<Timer className="w-5 h-5" />}
                      title="Calculating Dasha Periods"
                      summary="Your Vimshottari Dasha timeline is being calculated..."
                      colorScheme="amber"
                    />
                  );
                })()}
              </TabsContent>

              {/* Interpretations Tab */}
              <TabsContent value="interpretations" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {isLoadingInterpretations ? (
                  <DevotionistStyleCard
                    icon={<Loader2 className="h-8 w-8 animate-spin" />}
                    title="Generating AI Interpretations"
                    summary="Analyzing your birth chart to provide personalized insights..."
                    colorScheme="amber"
                  />
                ) : vedicDerived.vedicReading?.interpretations ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {/* Personality Overview */}
                    <DevotionistStyleCard
                      icon={<User className="h-5 w-5" />}
                      title="Personality & Life Purpose"
                      summary={((vedicDerived.vedicReading.interpretations.personality as { overview?: string }) ?? {}).overview || 'Personality analysis is being generated...'}
                      items={[
                        ...((vedicDerived.vedicReading.interpretations.personality as { strengths?: string[] })?.strengths ?? []).map((strength: string) => ({ text: strength, type: 'positive' as const })),
                        ...((vedicDerived.vedicReading.interpretations.personality as { challenges?: string[] })?.challenges ?? []).map((challenge: string) => ({ text: challenge, type: 'challenge' as const })),
                        { text: `Life Purpose: ${((vedicDerived.vedicReading.interpretations.lifePurpose as { overview?: string }) ?? {}).overview || 'Life purpose analysis is being generated...'}`, highlight: true }
                      ]}
                      colorScheme="amber"
                      variant="callout"
                    />

                    {/* Relationships */}
                    <DevotionistStyleCard
                      icon={<Heart className="h-5 w-5" />}
                      title="Relationships & Marriage"
                      summary={((vedicDerived.vedicReading.interpretations.relationships as { overview?: string }) ?? {}).overview || 'Relationship analysis is being generated...'}
                      items={[
                        { text: `Marriage Timing: ${((vedicDerived.vedicReading.interpretations.relationships as { marriageTiming?: string }) ?? {}).marriageTiming || 'Marriage timing analysis is being generated...'}`, highlight: true },
                        { text: `Compatibility: ${((vedicDerived.vedicReading.interpretations.relationships as { compatibility?: string }) ?? {}).compatibility || 'Compatibility analysis is being generated...'}` }
                      ]}
                      colorScheme="pink"
                      variant="callout"
                    />

                    {/* Career */}
                    {(() => {
                      const career = vedicDerived.vedicReading.interpretations.career as { overview?: string; suitableProfessions?: string[]; timing?: string; successFactors?: string[] } | undefined
                      return (
                    <DevotionistStyleCard
                      icon={<Briefcase className="h-5 w-5" />}
                      title="Career & Profession"
                      summary={career?.overview || 'Career analysis is being generated...'}
                      items={[
                        ...(career?.suitableProfessions ?? []).map((profession: string) => ({ text: profession, highlight: true })),
                        { text: `Career Timing: ${career?.timing || 'Career timing analysis is being generated...'}` },
                        ...(career?.successFactors ?? []).map((factor: string) => ({ text: factor, type: 'positive' as const }))
                      ]}
                      colorScheme="blue"
                      variant="callout"
                    />
                      )
                    })()}

                    {/* Health */}
                    {(() => {
                      const health = vedicDerived.vedicReading.interpretations.health as { constitution?: string; healthTips?: string[]; vulnerableAreas?: string[] } | undefined
                      return (
                    <DevotionistStyleCard
                      icon={<Heart className="h-5 w-5" />}
                      title="Health & Constitution"
                      summary={health?.constitution || 'Health constitution analysis is being generated...'}
                      items={[
                        ...(health?.healthTips ?? []).map((tip: string) => ({ text: tip, type: 'positive' as const })),
                        ...(health?.vulnerableAreas ?? []).map((area: string) => ({ text: area, type: 'challenge' as const }))
                      ]}
                      colorScheme="green"
                      variant="callout"
                    />
                      )
                    })()}

                    {/* Spirituality */}
                    {(() => {
                      const spirit = vedicDerived.vedicReading.interpretations.spirituality as { spiritualPath?: string; meditationAdvice?: string; karmicLessons?: string[] } | undefined
                      return (
                    <DevotionistStyleCard
                      icon={<Sun className="h-5 w-5" />}
                      title="Spirituality & Karma"
                      summary={spirit?.spiritualPath || 'Spiritual path analysis is being generated...'}
                      items={[
                        { text: `Meditation Advice: ${spirit?.meditationAdvice || 'Meditation advice is being generated...'}`, highlight: true },
                        ...(spirit?.karmicLessons ?? []).map((lesson: string) => ({ text: lesson }))
                      ]}
                      colorScheme="purple"
                      variant="callout"
                    />
                      )
                    })()}

                    {/* Remedies */}
                    {vedicDerived.vedicReading.remedies && vedicDerived.vedicReading.remedies.length > 0 && (
                      <div className="space-y-4">
                        <DevotionistStyleCard
                          icon={<Sparkles className="h-5 w-5" />}
                          title="Vedic Remedies & Guidance"
                          summary="Personalized remedies and practices to enhance your spiritual and material well-being"
                          colorScheme="amber"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {vedicDerived.vedicReading.remedies.map((remedy: any, index: number) => (
                            <DevotionistStyleCard
                              key={index}
                              icon={<Sparkles className="h-5 w-5" />}
                              title={remedy.name}
                              subtitle={remedy.type}
                              summary={remedy.description}
                              items={[
                                { text: `Instructions: ${remedy.instructions}`, highlight: true },
                                { text: `Timing: ${remedy.timing}`, highlight: true }
                              ]}
                              colorScheme="amber"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <Sparkles className="h-12 w-12 text-amber-400 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-amber-200 mb-2">Generating Interpretations...</h3>
                    <p className="text-slate-300 mb-4">
                      Please wait while we generate your personalized Vedic astrology interpretations.
                    </p>
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                  </div>
                )}
              </TabsContent>

              {/* Panchanga Tab */}
              <TabsContent value="panchanga" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {panchangaData && currentPanchangaData ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <PanchangaPanel 
                      birthPanchanga={panchangaData}
                      currentPanchanga={currentPanchangaData}
                      className="w-full"
                      birthSubtitle={userProfile ? `${userProfile.birthDate}, ${userProfile.birthTime}, ${userProfile.birthPlace}` : undefined}
                    />
                    
                    {/* Enhanced Panchanga Insight */}
                    <DevotionistStyleCard
                      icon={<Star className="w-5 h-5" />}
                      title="Daily Cosmic Wisdom"
                      summary={vedicDerived.isGeneratingInterpretations ? 'Generating daily insights...' : vedicDerived.enhancedPanchanga || "Today's cosmic energies align in unique ways that influence your daily experiences. The current Tithi, Nakshatra, and Yoga create a specific energetic signature that guides your actions and decisions throughout the day."}
                      colorScheme="amber"
                    />
                    
                    {/* Add favorable/unfavorable times */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DevotionistStyleCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        title="Favorable Times"
                        items={[
                          { text: 'Abhijit Muhurta: 11:50 AM - 12:38 PM', type: 'positive' },
                          { text: 'Brahma Muhurta: 4:30 AM - 6:00 AM', type: 'positive' },
                          { text: 'Sunrise Hour: First hour after sunrise', type: 'positive' },
                          { text: 'Twilight Period: Last hour before sunset', type: 'positive' }
                        ]}
                        colorScheme="green"
                      />
                      <DevotionistStyleCard
                        icon={<AlertTriangle className="w-5 h-5" />}
                        title="Avoid These Times"
                        items={[
                          { text: 'Rahu Kaal: 9:00 AM - 10:30 AM', type: 'challenge' },
                          { text: 'Yamaghanda: 12:00 PM - 1:30 PM', type: 'challenge' },
                          { text: 'Gulika Kaal: 1:30 PM - 3:00 PM', type: 'challenge' },
                          { text: 'Dur Muhurta: 12:20 PM - 1:08 PM', type: 'challenge' }
                        ]}
                        colorScheme="orange"
                      />
                    </div>
                  </div>
                ) : (
                  <DevotionistStyleCard
                    icon={<Calendar className="w-5 h-5" />}
                    title="Calculating Panchanga..."
                    summary="Please wait while we calculate your birth time Panchanga."
                    colorScheme="amber"
                  />
                )}
              </TabsContent>

              {/* Yogas Tab */}
              <TabsContent value="yogas" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {yogas.length > 0 ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    
                    {/* Yoga Panel */}
                    {(() => {
                      // Use EXACT same data access pattern as Dasha tab
                      const dashaData = unifiedChartData?.dasha || [];
                      const currentDasha = unifiedChartData?.currentDasha || null;

                      // Convert to format expected by YogaTiming
                      const dashaDataForYoga = {
                        currentDasha: currentDasha ? {
                          planet: currentDasha.planet || currentDasha.name,
                          startDate: currentDasha.startDate,
                          endDate: currentDasha.endDate,
                          progress: currentDasha.progress || 0
                        } : undefined,
                        fullSequence: dashaData.map((d: any) => ({
                          planet: d.planet || d.name,
                          startDate: d.startDate,
                          endDate: d.endDate,
                          type: 'mahadasha'
                        }))
                      };

                      return (
                        <YogaPanelSimplified 
                          yogas={yogas} 
                          dashaData={dashaDataForYoga}
                          birthData={userProfile ? {
                            birthDate: userProfile.birthDate || '',
                            birthTime: userProfile.birthTime || '',
                            birthPlace: userProfile.birthPlace || '',
                            latitude: 0, // Will be resolved from birthPlace
                            longitude: 0 // Will be resolved from birthPlace
                          } : undefined}
                        />
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <Star className="h-12 w-12 text-amber-400 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-amber-200 mb-2">Analyzing Yogas...</h3>
                    <p className="text-slate-300 mb-4">
                      Please wait while we analyze your chart for classical Vedic Yogas.
                    </p>
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                  </div>
                )}
              </TabsContent>

              {/* Divisional Charts Tab (pipeline-only: interpretations from profile when available) */}
              <TabsContent value="divisional" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {newChartData && newChartData.divisionalCharts ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {!d9Interpretations && !d10Interpretations && (
                      <Alert className="bg-slate-800/50 border-amber-500/30">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Divisional chart interpretations are available from your mystical profile.{' '}
                          <Link href="/profile" className="text-amber-400 hover:underline">Generate your mystical profile</Link>
                        </AlertDescription>
                      </Alert>
                    )}
                    {/* D9 - Navamsa Chart */}
                    <DevotionistStyleCard
                      icon={<Heart className="w-5 h-5" />}
                      title="D9 Navamsa Chart (Marriage & Spirituality)"
                      summary="This chart reveals your inner nature, marriage prospects, and spiritual development"
                      colorScheme="purple"
                      variant="callout"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white/80 border-2 border-purple-300 rounded-xl p-6">
                      {/* Planetary Positions */}
                      <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-3">Planetary Positions</h4>
                        <div className="space-y-3">
                          {Object.entries(newChartData.divisionalCharts.D9 || {}).map(([planetName, data]: any) => {
                            const planetItems = [
                              { text: `Sign: ${data.signName}`, highlight: true },
                              { text: `Nakshatra: ${data.nakshatra} (Pada ${data.nakshatraPada})` },
                              { text: `Degree: ${data.degreeInSign?.toFixed(2)}°` },
                              ...(data.dignity?.strength ? [{ text: `Strength: ${data.dignity.strength}`, type: 'positive' as const }] : [])
                            ];
                            return (
                              <DevotionistStyleCard
                                key={planetName}
                                icon={<Star className="w-4 h-4" />}
                                title={planetName.toUpperCase()}
                                items={planetItems}
                                colorScheme={data.dignity?.exalted ? 'green' : data.dignity?.debilitated ? 'orange' : 'blue'}
                                variant="callout"
                              />
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Chart Insights */}
                      <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-3">D9 Insights</h4>
                        <div className="space-y-3">
                          <DevotionistStyleCard
                            icon={<Heart className="w-5 h-5" />}
                            title="Marriage Indicators"
                            summary={d9Interpretations?.marriageIndicators || 'Loading...'}
                            colorScheme="pink"
                          />
                          <DevotionistStyleCard
                            icon={<Sun className="w-5 h-5" />}
                            title="Spiritual Path"
                            summary={d9Interpretations?.spiritualPath || 'Loading...'}
                            colorScheme="orange"
                          />
                          <DevotionistStyleCard
                            icon={<Shield className="w-5 h-5" />}
                            title="Inner Strength"
                            summary={d9Interpretations?.innerStrength || 'Loading...'}
                            colorScheme="blue"
                          />
                        </div>
                      </div>
                    </div>

                    {/* D10 - Dasamsa Chart */}
                    <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-2xl text-amber-200 flex items-center gap-2">
                          💼 D10 - Dasamsa Chart (Career & Profession)
                        </CardTitle>
                        <p className="text-sm text-slate-400">This chart reveals your career path, professional success, and social status</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Career Indicators</h4>
                            <div className="space-y-3">
                              {Object.entries(newChartData.divisionalCharts.D10 || {}).map(([planetName, data]: any) => (
                                <div key={planetName} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-white">{planetName.toUpperCase()}</span>
                                    <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-500/30">
                                      {data.signName}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-slate-300 space-y-1">
                                    <div>Nakshatra: {data.nakshatra}</div>
                                    {data.dignity?.strength && (
                                      <div className="text-green-400">Strength: {data.dignity.strength}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Professional Guidance</h4>
                            
                            {/* Data Source Indicator */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-slate-400">Data Source:</span>
                              {divisionalSource === 'fallback' && (
                                <Badge variant="outline" className="text-xs text-slate-400">
                                  Verified fallback content
                                </Badge>
                              )}
                              {divisionalSource === 'cache' && (
                                <Badge variant="outline" className="text-xs text-green-400">
                                  Personalized cached content
                                </Badge>
                              )}
                              {divisionalSource === 'api' && (
                                <Badge variant="outline" className="text-xs text-amber-400">
                                  AI-generated content
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              {/* 10th House Analysis */}
                              <Card className="bg-green-900/30 border-green-700/50 h-auto overflow-visible">
                                <CardHeader>
                                  <CardTitle className="text-green-300 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    10th House Analysis
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="overflow-visible h-auto">
                                  <p className="text-slate-300 whitespace-pre-wrap break-words leading-relaxed text-sm">
                                    {d10Interpretations?.tenthHouseAnalysis || 'Loading...'}
                                  </p>
                                </CardContent>
                              </Card>
                              
                              {/* Success Timing */}
                              <Card className="bg-blue-900/30 border-blue-700/50 h-auto overflow-visible">
                                <CardHeader>
                                  <CardTitle className="text-blue-300 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Success Timing
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="overflow-visible h-auto">
                                  <p className="text-slate-300 whitespace-pre-wrap break-words leading-relaxed text-sm">
                                    {d10Interpretations?.successTiming || 'Loading...'}
                                  </p>
                                </CardContent>
                              </Card>
                              
                              {/* Social Status */}
                              <Card className="bg-purple-900/30 border-purple-700/50 h-auto overflow-visible">
                                <CardHeader>
                                  <CardTitle className="text-purple-300 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Social Status
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="overflow-visible h-auto">
                                  <p className="text-slate-300 whitespace-pre-wrap break-words leading-relaxed text-sm">
                                    {d10Interpretations?.socialStatus || 'Loading...'}
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* D12 - Dwadasamsa Chart */}
                    <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-2xl text-amber-200 flex items-center gap-2">
                          👥 D12 - Dwadasamsa Chart
                        </CardTitle>
                        <p className="text-sm text-slate-400">Parents, Ancestors, Past Life</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Object.entries(newChartData.divisionalCharts.D12 || {}).map(([planetName, data]: any) => (
                            <Card key={planetName} className="bg-slate-800/50 border-slate-600 rounded-lg">
                              <CardContent className="p-4">
                                <div className="font-semibold text-white mb-2">{planetName.toUpperCase()}</div>
                                <div className="text-sm text-slate-300">
                                  <div>Sign: {data.signName}</div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* D30 - Trimsamsa Chart */}
                    <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-2xl text-amber-200 flex items-center gap-2">
                          🏥 D30 - Trimsamsa Chart
                        </CardTitle>
                        <p className="text-sm text-slate-400">Health, Diseases, Physical Constitution</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Object.entries(newChartData.divisionalCharts.D30 || {}).map(([planetName, data]: any) => (
                            <Card key={planetName} className="bg-slate-800/50 border-slate-600 rounded-lg">
                              <CardContent className="p-4">
                                <div className="font-semibold text-white mb-2">{planetName.toUpperCase()}</div>
                                <div className="text-sm text-slate-300">
                                  <div>Sign: {data.signName}</div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-amber-200 mb-2">Divisional Charts Loading</h3>
                      <p className="text-slate-300 mb-4">
                        Generating D9, D10, D12, and D30 charts...
                      </p>
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Nakshatras Tab */}
              <TabsContent value="nakshatras" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {unifiedChartData && unifiedChartData.planets ? (
                  <NakshatraAnalysis nakshatraAnalysis={nakshatraAnalysis ?? undefined} />
                ) : (
                  <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">⭐</div>
                      <h3 className="text-xl font-semibold text-amber-200 mb-2">Nakshatra Analysis Loading</h3>
                      <p className="text-slate-300 mb-4">
                        Analyzing planetary positions in lunar mansions...
                      </p>
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Transits Tab */}
              <TabsContent value="transits" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {unifiedChartData ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    {/* Transit Summary Header */}
                    <DevotionistStyleCard
                      icon={<Zap className="h-6 w-6" />}
                      title="Current Planetary Transits"
                      summary="Planetary transits show how current planetary positions interact with your birth chart, revealing opportunities and challenges in different life areas."
                      colorScheme="blue"
                      variant="callout"
                    />
                    
                    {/* Transit Effects */}
                    {transitData && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Favorable Transits */}
                          <DevotionistStyleCard
                            icon={<CheckCircle className="w-5 h-5" />}
                            title="Favorable Transits"
                            items={transitData.favorable.length > 0 ? (
                              transitData.favorable.map((transit: any, idx: number) => ({
                                text: transit.description,
                                type: 'positive' as const
                              }))
                            ) : (
                              [{ text: 'No major favorable transits currently', type: 'neutral' as const }]
                            )}
                            colorScheme="green"
                          />
                          
                          {/* Challenging Transits */}
                          <DevotionistStyleCard
                            icon={<AlertTriangle className="w-5 h-5" />}
                            title="Challenging Transits"
                            items={transitData.challenging.length > 0 ? (
                              transitData.challenging.map((transit: any, idx: number) => ({
                                text: transit.description,
                                type: 'challenge' as const
                              }))
                            ) : (
                              [{ text: 'No major challenging transits currently', type: 'neutral' as const }]
                            )}
                            colorScheme="orange"
                          />
                        </div>
                        
                        {/* Enhanced Transit Interpretation */}
                        <DevotionistStyleCard
                          icon={<Star className="w-5 h-5" />}
                          title="Current Transit Insights"
                          summary={vedicDerived.isGeneratingInterpretations 
                            ? 'Generating insights...' 
                            : (vedicDerived.enhancedTransits || 'Current planetary transits are influencing your life in significant ways. These cosmic movements bring opportunities for growth and challenges to overcome, shaping your experiences and guiding your path forward.')
                          }
                          colorScheme="purple"
                          variant="callout"
                        >
                          {vedicDerived.isGeneratingInterpretations && (
                            <div className="flex items-center gap-2 text-slate-600 mt-2">
                              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                              <span>Please wait...</span>
                            </div>
                          )}
                        </DevotionistStyleCard>
                      </div>
                    )}
                    
                    {/* Upcoming Important Transits */}
                    {transitData && transitData.upcoming.length > 0 && (
                      <DevotionistStyleCard
                        icon={<Calendar className="w-5 h-5" />}
                        title="Upcoming Important Transits"
                        items={transitData.upcoming.map((transit: any, idx: number) => ({
                          text: `${transit.title} - ${transit.description} (${transit.significance})`,
                          highlight: true
                        }))}
                        colorScheme="cyan"
                      />
                    )}
                  </div>
                ) : (
                  <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">🌌</div>
                      <h3 className="text-xl font-semibold text-amber-200 mb-2">Transit Analysis Loading</h3>
                      <p className="text-slate-300 mb-4">
                        Calculating current planetary transits and their effects...
                      </p>
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Remedies Tab */}
              <TabsContent value="remedies" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {newChartData ? (
                  <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <DevotionistStyleCard
                      icon={<Sparkles className="w-6 h-6" />}
                      title="Personalized Remedies & Upayas"
                      summary="These remedies are personalized for your chart based on planetary strengths. Focus on weak planets first for maximum benefit."
                      colorScheme="amber"
                      variant="callout"
                    />
                    <div className="bg-white/80 border-2 border-amber-300 rounded-xl p-6">
                        <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                          
                          {/* Gemstone Recommendations */}
                          <div>
                            <h3 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-amber-400" />
                              Gemstone Recommendations
                            </h3>
                            {(() => {
                              // Helper function for Ascendant-specific remedies
                              const getAscendantSpecificRemedies = (chartData: any, ascendantSign: string) => {
                                // Define house lordship for each ascendant
                                const houseLordship = {
                                  'Gemini': {
                                    'mercury': { houses: [1, 4], priority: 10, role: 'Chart Ruler & 4th Lord' },
                                    'venus': { houses: [5, 12], priority: 8, role: '5th & 12th Lord (Benefic)' },
                                    'jupiter': { houses: [7, 10], priority: 7, role: '7th & 10th Lord (Career & Relationships)' },
                                    'moon': { houses: [2], priority: 6, role: '2nd Lord (Wealth & Speech)' },
                                    'saturn': { houses: [8, 9], priority: 5, role: '8th & 9th Lord (Mixed Results)' },
                                    'sun': { houses: [3], priority: 4, role: '3rd Lord (Communication)' },
                                    'mars': { houses: [6, 11], priority: 3, role: '6th & 11th Lord (Functional Malefic)' }
                                  },
                                  // Add other ascendants as needed
                                };
                                
                                const lordship = houseLordship[ascendantSign as keyof typeof houseLordship];
                                if (!lordship) return []; // Fallback to current logic
                                
                                // Score each planet
                                const scoredPlanets = Object.entries(chartData.planets || {}).map(([planetName, planetData]: [string, unknown]) => {
                                  const planet = planetName.toLowerCase() as keyof typeof lordship;
                                  const lord = lordship[planet];
                                  
                                  let score = 0;
                                  let reason = '';
                                  
                                  // Base priority from lordship
                                  if (lord) {
                                    score += lord.priority;
                                    reason = lord.role;
                                  }
                                  
                                  // Adjust for dignity
                                  const strength = (planetData as { dignity?: { strength?: string } }).dignity?.strength;
                                  if (strength === 'Weak' || strength === 'Debilitated') {
                                    score += 5; // Weak planets need remedies
                                    reason += ' (Weak - needs strengthening)';
                                  } else if (strength === 'Neutral') {
                                    score += 2;
                                    reason += ' (Neutral - can be enhanced)';
                                  }
                                  
                                  return {
                                    planetName,
                                    planetData,
                                    score,
                                    reason,
                                    lordship: lord
                                  };
                                });
                                
                                // Sort by score (highest first) and return top 6
                                return scoredPlanets
                                  .filter(p => p.score > 0)
                                  .sort((a, b) => b.score - a.score)
                                  .slice(0, 6);
                              };

                              // Get Ascendant sign from chart data
                              const ascendantSign = newChartData.ascendant?.signName || 'Gemini';
                              const scoredPlanets = getAscendantSpecificRemedies(newChartData, ascendantSign);
                              
                              // Fallback to original logic if no scored planets
                              const weakPlanets = scoredPlanets.length > 0 ? scoredPlanets : 
                                Object.entries(newChartData.planets || {})
                                  .filter(([_, planetData]: any) => 
                                    planetData.dignity?.strength === 'Weak' || 
                                    planetData.dignity?.strength === 'Neutral'
                                  )
                                  .slice(0, 6);

                              if (weakPlanets.length === 0) {
                                return (
                                  <DevotionistStyleCard
                                    icon={<Sparkles className="w-5 h-5" />}
                                    title="Excellent Planetary Strength!"
                                    summary="Your planetary positions are strong and well-balanced. No remedial gemstones needed at this time."
                                    colorScheme="green"
                                  />
                                );
                              }

                              return (
                                <>
                                  <p className="text-slate-300 mb-4 text-sm">
                                    Focus on strengthening these planetary influences for better results in life.
                                  </p>
                                  
                                  {/* Ascendant-Specific Explanation */}
                                  <DevotionistStyleCard
                                    icon={<Info className="w-5 h-5" />}
                                    title={`For Your ${ascendantSign} Ascendant`}
                                    summary={`Mercury is your chart ruler and most important planet. Venus and Jupiter are natural benefics ruling favorable houses. These remedies are prioritized based on their importance for your specific Ascendant and current planetary strength.`}
                                    colorScheme="blue"
                                  />
                                  
                                  <DevotionistStyleCard
                                    icon={<Gem className="w-5 h-5" />}
                                    title="Gemstone Weight Guidelines"
                                    items={[
                                      { text: 'General Formula: 1 ratti per 10 kg of body weight (e.g., 70 kg = 7 ratti / 6.4 carats)', highlight: true },
                                      { text: 'Conversion: 1 ratti = 0.91 carats approximately' },
                                      { text: 'Note: Each gemstone shows recommended minimum and maximum weight ranges. Consult specific ranges as they vary by gemstone type and planetary strength.', type: 'neutral' }
                                    ]}
                                    colorScheme="amber"
                                  />
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {weakPlanets.map((planetItem: any) => {
                                      // Handle both old format [planetName, planetData] and new format {planetName, planetData, reason, score}
                                      const isNewFormat = planetItem.planetName !== undefined;
                                      const planetName = isNewFormat ? planetItem.planetName : planetItem[0];
                                      const planetData = isNewFormat ? planetItem.planetData : planetItem[1];
                                      const reason = isNewFormat ? planetItem.reason : '';
                                      const score = isNewFormat ? planetItem.score : 0;
                                      
                                      const getGemstoneInfo = (planet: string) => {
                                  const gemstones = {
                                    'sun': {
                                      gem: 'Ruby (Manikya)',
                                      benefit: 'Enhances vitality, leadership, and self-esteem',
                                      day: 'Sunday',
                                      time: 'Morning (5-9 AM)',
                                      metal: 'Gold, Panch-dhatu, Ashta-dhatu, or Copper (Yellow Metal only). Never Silver.',
                                      finger: 'Ring Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Sunday',
                                      mantra: 'Om Hrim Sum Suryaya Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      minWeight: '3 ratti (2.7 carats)',
                                      maxWeight: '7 ratti (6.4 carats)',
                                      idealWeight: '5 ratti (4.5 carats)',
                                      weightNote: 'Minimum 3 ratti required for astrological effects'
                                    },
                                    'moon': {
                                      gem: 'Pearl (Moti)',
                                      benefit: 'Calms emotions and intuition',
                                      day: 'Monday',
                                      time: 'Morning, Sunset, or Night',
                                      metal: 'Silver',
                                      finger: 'Little Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Monday',
                                      mantra: 'Om Cham Chandraye Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      special: 'Undrilled single piece, round shape preferred. Should not be in bead form or pierced.',
                                      minWeight: '2 ratti (1.8 carats)',
                                      maxWeight: '5 ratti (4.5 carats)',
                                      idealWeight: '4 ratti (3.6 carats)',
                                      weightNote: 'Minimum 2 ratti required for astrological effects'
                                    },
                                    'mars': {
                                      gem: 'Red Coral (Moonga)',
                                      benefit: 'Boosts courage and energy',
                                      day: 'Tuesday',
                                      time: 'Morning (5-9 AM)',
                                      metal: 'Gold, Copper, or Silver',
                                      finger: 'Ring Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Tuesday',
                                      mantra: 'Om Krim Kum Kujaya Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      minWeight: '5 ratti (4.5 carats)',
                                      maxWeight: '10 ratti (9.1 carats)',
                                      idealWeight: '7 ratti (6.4 carats)',
                                      weightNote: 'Minimum 5 ratti required for astrological effects'
                                    },
                                    'mercury': {
                                      gem: 'Emerald (Panna)',
                                      benefit: 'Improves communication and intellect',
                                      day: 'Wednesday',
                                      time: 'Sunrise or Sunset (5-9 AM or 5-7 PM)',
                                      metal: 'Gold, Silver, Panch-dhatu, or Ashta-dhatu (friendly with all metals)',
                                      finger: 'Little Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Wednesday',
                                      mantra: 'Om Aim Bum Budhaye Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      minWeight: '3 ratti (2.7 carats)',
                                      maxWeight: '6 ratti (5.5 carats)',
                                      idealWeight: '5 ratti (4.5 carats)',
                                      weightNote: 'Minimum 3 ratti required for astrological effects'
                                    },
                                    'jupiter': {
                                      gem: 'Yellow Sapphire (Pukhraj)',
                                      benefit: 'Brings wisdom and prosperity',
                                      day: 'Thursday',
                                      time: 'Morning (5-9 AM)',
                                      metal: 'Gold, Panch-Dhatu, or Ashta-Dhatu',
                                      finger: 'Index Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Thursday',
                                      mantra: 'Om Streem Brahm Brihaspataye Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      minWeight: '3 ratti (2.7 carats)',
                                      maxWeight: '7 ratti (6.4 carats)',
                                      idealWeight: '5 ratti (4.5 carats)',
                                      weightNote: 'Minimum 3 ratti required for astrological effects'
                                    },
                                    'venus': {
                                      gem: 'Fire Opal (Shukramani)',
                                      benefit: 'Enhances love and beauty',
                                      day: 'Friday',
                                      time: 'Sunrise or Sunset (5-9 AM or 5-7 PM)',
                                      metal: 'Silver or White Gold (can also use Yellow Gold)',
                                      finger: 'Index Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Friday',
                                      mantra: 'Om Draam Dreem Droum Sah Shukraaye Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      special: 'Bottom side should be open and not covered',
                                      minWeight: '3 ratti (2.7 carats)',
                                      maxWeight: '6 ratti (5.5 carats)',
                                      idealWeight: '5 ratti (4.5 carats)',
                                      weightNote: 'Minimum 3 ratti required for astrological effects'
                                    },
                                    'saturn': {
                                      gem: 'Blue Sapphire (Neelam)',
                                      benefit: 'Provides discipline and stability',
                                      day: 'Saturday',
                                      time: 'Sunrise or Sunset (5-9 AM or 5-7 PM)',
                                      metal: 'Silver or White Gold (Never Yellow Gold)',
                                      finger: 'Middle Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Saturday',
                                      mantra: 'Aum Sham Shanaish-charaaye Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      minWeight: '4 ratti (3.6 carats)',
                                      maxWeight: '7 ratti (6.4 carats)',
                                      idealWeight: '5 ratti (4.5 carats)',
                                      weightNote: 'Minimum 4 ratti required for astrological effects'
                                    },
                                    'rahu': {
                                      gem: 'Hessonite Garnet (Gomedh)',
                                      benefit: 'Reduces negative effects',
                                      day: 'Wednesday or Saturday',
                                      time: 'Sunset (5-7 PM)',
                                      metal: 'Silver',
                                      finger: 'Middle Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Wednesday or Saturday',
                                      mantra: 'Om Raam Rahve Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      minWeight: '5 ratti (4.5 carats)',
                                      maxWeight: '10 ratti (9.1 carats)',
                                      idealWeight: '7 ratti (6.4 carats)',
                                      weightNote: 'Minimum 5 ratti required for astrological effects'
                                    },
                                    'ketu': {
                                      gem: 'Cat\'s Eye (Lehsuniya)',
                                      benefit: 'Spiritual growth and protection',
                                      day: 'Tuesday or Thursday',
                                      time: 'Sunset (5-7 PM)',
                                      metal: 'Silver (can also use Gold)',
                                      finger: 'Middle Finger or Ring Finger',
                                      hand: 'Men: Right Hand, Women: Left or Right',
                                      pendant: 'Yes',
                                      skinContact: 'Bottom-tip should touch the skin',
                                      purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Tuesday or Thursday',
                                      mantra: 'Om Kem Ketve Namah',
                                      chanting: 'Chant 108 times, wear on 108th chant',
                                      paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
                                      simplicity: 'Simplest remedy, not a complex procedure',
                                      special: 'Bottom side open, not covered from top and bottom',
                                      minWeight: '3 ratti (2.7 carats)',
                                      maxWeight: '7 ratti (6.4 carats)',
                                      idealWeight: '5 ratti (4.5 carats)',
                                      weightNote: 'Minimum 3 ratti required for astrological effects'
                                    }
                                  };
                                  return gemstones[planet as keyof typeof gemstones];
                                };

                                const gemInfo = getGemstoneInfo(planetName);
                                const strength = planetData.dignity?.strength || 'Neutral';
                                const isExpanded = expandedGemstones.has(planetName);
                                
                                return (
                                  <Card key={planetName} className="bg-slate-800/50 border-slate-600 rounded-lg">
                                    <CardContent className="p-4">
                                      {/* Header */}
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-amber-200">{gemInfo.gem}</span>
                                        <Badge variant="outline" className={`text-xs ${
                                          strength === 'Strong' ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                                          strength === 'Weak' ? 'bg-red-500/20 text-red-200 border-red-500/30' :
                                          'bg-amber-500/20 text-amber-200 border-amber-500/30'
                                        }`}>
                                          {strength}
                                        </Badge>
                                      </div>
                                      
                                      {/* Reason for Recommendation */}
                                      {reason && (
                                        <p className="text-xs text-slate-400 mb-3 italic">
                                          {reason}
                                        </p>
                                      )}

                                      {/* Quick Info */}
                                      <p className="text-sm text-slate-300 mb-3">{gemInfo.benefit}</p>
                                      
                                      {/* Enhanced Remedy Interpretation */}
                                      <div className="mb-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                        <h5 className="text-xs font-semibold text-amber-200 mb-2 flex items-center gap-1">
                                          <Star className="w-3 h-3 text-amber-400" />
                                          Why This Works for You
                                        </h5>
                                        {vedicDerived.isGeneratingInterpretations ? (
                                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Generating insights...</span>
                                          </div>
                                        ) : vedicDerived.enhancedRemedies[planetName] ? (
                                          <p className="text-xs text-slate-300 leading-relaxed">{vedicDerived.enhancedRemedies[planetName]}</p>
                                        ) : (
                                          <p className="text-xs text-slate-300">
                                            This gemstone resonates with {planetName}'s energy in your chart, 
                                            helping to balance and strengthen this planetary influence for better life outcomes.
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center text-slate-400">
                                          <Calendar className="w-4 h-4 mr-2 text-amber-400" />
                                          <span>Day: <span className="text-amber-200">{gemInfo.day}</span></span>
                                        </div>
                                        <div className="flex items-center text-slate-400">
                                          <Hammer className="w-4 h-4 mr-2 text-amber-400" />
                                          <span>Metal: <span className="text-slate-300">{gemInfo.metal}</span></span>
                                        </div>
                                        <div className="flex items-center text-slate-400 mb-3">
                                          <Hand className="w-4 h-4 mr-2 text-amber-400" />
                                          <span>Finger: <span className="text-amber-200">{gemInfo.finger}</span></span>
                                        </div>
                                        <div className="flex items-center text-slate-400 text-xs">
                                          <span>Weight: <span className="text-amber-200">{gemInfo.idealWeight}</span> (ideal)</span>
                                        </div>
                                      </div>

                                      {/* Toggle Button */}
                                      <button
                                        onClick={() => toggleGemstoneExpansion(planetName)}
                                        className="text-amber-400 hover:text-amber-300 text-sm flex items-center transition-colors"
                                      >
                                        {isExpanded ? (
                                          <>
                                            Hide Detailed Procedure <ChevronUp className="w-4 h-4 ml-1" />
                                          </>
                                        ) : (
                                          <>
                                            Show Detailed Procedure <ChevronDown className="w-4 h-4 ml-1" />
                                          </>
                                        )}
                                      </button>

                                      {/* Expandable Detailed Section */}
                                      {isExpanded && (
                                        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600 space-y-2 text-sm">
                                          <h4 className="font-semibold text-amber-200 mb-2">Complete Wearing Procedure:</h4>
                                          
                                          <div className="space-y-1.5 text-slate-300">
                                            {/* NEW: Weight Section */}
                                            <div className="pt-2 pb-2 border-b border-amber-500/50">
                                              <p className="font-medium text-amber-300 mb-1">Recommended Weight:</p>
                                              <p><span className="text-amber-400">Minimum:</span> {gemInfo.minWeight}</p>
                                              <p><span className="text-amber-400">Maximum:</span> {gemInfo.maxWeight}</p>
                                              <p><span className="text-amber-400">Ideal:</span> {gemInfo.idealWeight}</p>
                                              <p className="text-xs text-slate-400 mt-1">{gemInfo.weightNote}</p>
                                            </div>
                                            
                                            <p><span className="text-amber-400">⏰ Time:</span> {gemInfo.time}</p>
                                            <p><span className="text-amber-400">👋 Hand:</span> {gemInfo.hand}</p>
                                            <p><span className="text-amber-400">💎 Pendant:</span> {gemInfo.pendant}</p>
                                            <p><span className="text-amber-400">👆 Skin Contact:</span> {gemInfo.skinContact}</p>
                                            
                                            <div className="pt-2 border-t border-amber-500/50">
                                              <p className="font-medium text-amber-300 mb-1">Purification:</p>
                                              <p>{gemInfo.purification}</p>
                                            </div>
                                            
                                            <div className="pt-2 border-t border-amber-500/50">
                                              <p className="font-medium text-amber-300 mb-1">Mantra:</p>
                                              <p className="italic text-amber-200 font-mono">{gemInfo.mantra}</p>
                                              <p className="text-slate-400 text-xs mt-1">{gemInfo.chanting}</p>
                                            </div>
                                            
                                            <div className="pt-2 border-t border-amber-500/50 text-slate-400 text-xs space-y-1">
                                              <p>• {gemInfo.paksha}</p>
                                              <p>• {gemInfo.simplicity}</p>
                                            </div>
                                            
                                            {(gemInfo as { special?: string }).special && (
                                              <div className="pt-2 border-t border-amber-500/50">
                                                <p className="font-medium text-amber-300 mb-1">Special Instructions:</p>
                                                <p className="text-slate-300">{(gemInfo as { special?: string }).special}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                );
                              })}
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* Mantra Recommendations */}
                          <div>
                            <h3 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
                              <Sun className="w-5 h-5 text-amber-400" />
                              Recommended Mantras
                            </h3>
                            <p className="text-slate-300 mb-4 text-sm">
                              These mantras will strengthen your weak planetary influences and enhance spiritual growth.
                            </p>
                            <div className="space-y-3">
                              {/* Universal Mantra */}
                              <Card className="bg-slate-800/50 border-slate-600 m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-lg">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-amber-200">Gayatri Mantra</span>
                                    <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-200 border-amber-500/30">Universal</Badge>
                                  </div>
                                  <p className="text-sm text-slate-300 mb-2">
                                    Om Bhur Bhuvaḥ Swaḥ, Tat Savitur Vareṇyaṃ, Bhargo Devasya Dhīmahi, Dhiyo Yonaḥ Prachodayāt
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Chant 108 times daily at sunrise for spiritual growth and wisdom
                                  </p>
                                </CardContent>
                              </Card>

                              {/* Planet-specific Mantras */}
                              {(() => {
                                const weakPlanets = Object.entries(newChartData.planets || {})
                                  .filter(([_, planetData]: any) => planetData.dignity?.strength === 'Weak')
                                  .slice(0, 2); // Show top 2 weak planets

                                const mantras = {
                                  'sun': { mantra: 'Om Suryaya Namaha', meaning: 'Salutations to the Sun God', timing: 'Sunrise' },
                                  'moon': { mantra: 'Om Chandraya Namaha', meaning: 'Salutations to the Moon God', timing: 'Evening' },
                                  'mars': { mantra: 'Om Mangalaya Namaha', meaning: 'Salutations to Mars', timing: 'Tuesday morning' },
                                  'mercury': { mantra: 'Om Budhaya Namaha', meaning: 'Salutations to Mercury', timing: 'Wednesday morning' },
                                  'jupiter': { mantra: 'Om Guruve Namaha', meaning: 'Salutations to Jupiter', timing: 'Thursday morning' },
                                  'venus': { mantra: 'Om Shukraya Namaha', meaning: 'Salutations to Venus', timing: 'Friday evening' },
                                  'saturn': { mantra: 'Om Shanaye Namaha', meaning: 'Salutations to Saturn', timing: 'Saturday morning' },
                                  'rahu': { mantra: 'Om Rahave Namaha', meaning: 'Salutations to Rahu', timing: 'Daily evening' },
                                  'ketu': { mantra: 'Om Ketave Namaha', meaning: 'Salutations to Ketu', timing: 'Daily evening' }
                                };

                                return weakPlanets.map(([planetName, planetData]: any) => {
                                  const mantraInfo = mantras[planetName as keyof typeof mantras];
                                  if (!mantraInfo) return null;

                                  return (
                                    <Card key={planetName} className="bg-slate-800/50 border-slate-600 rounded-lg">
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-semibold text-amber-200">{planetName} Mantra</span>
                                          <Badge variant="outline" className="text-xs bg-red-500/20 text-red-200 border-red-500/30">Weak Planet</Badge>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-2 font-mono">
                                          {mantraInfo.mantra}
                                        </p>
                                        <p className="text-xs text-slate-400 mb-1">
                                          Meaning: {mantraInfo.meaning}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          Best time: {mantraInfo.timing} | Chant 108 times
                                        </p>
                                      </CardContent>
                                    </Card>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* Charity & Fasting */}
                          <div>
                            <h3 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
                              <Heart className="w-5 h-5 text-amber-400" />
                              Charity & Fasting Recommendations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="bg-slate-800/50 border-slate-600 m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-lg">
                                <CardContent className="p-4">
                                  <h4 className="font-semibold text-amber-200 mb-2">Personalized Charity</h4>
                                  <ul className="text-sm text-slate-300 space-y-2">
                                    {(() => {
                                      const weakPlanets = Object.entries(newChartData.planets || {})
                                        .filter(([_, planetData]: any) => planetData.dignity?.strength === 'Weak')
                                        .slice(0, 3);

                                      const charityMap = {
                                        'sun': 'Donate to educational institutions or feed the poor on Sundays',
                                        'moon': 'Support women and children welfare organizations on Mondays',
                                        'mars': 'Help fire service or emergency responders on Tuesdays',
                                        'mercury': 'Support libraries, schools, or communication centers on Wednesdays',
                                        'jupiter': 'Donate to temples, gurus, or educational causes on Thursdays',
                                        'venus': 'Support arts, music, or beauty-related charities on Fridays',
                                        'saturn': 'Help elderly, disabled, or marginalized communities on Saturdays',
                                        'rahu': 'Support technology or innovation projects daily',
                                        'ketu': 'Help spiritual centers or meditation retreats daily'
                                      };

                                      if (weakPlanets.length === 0) {
                                        return [
                                          <li key="default1">• Donate to educational causes on Thursdays to strengthen Jupiter</li>,
                                          <li key="default2">• Feed the poor on Saturdays to strengthen Saturn</li>,
                                          <li key="default3">• Support women and children on Mondays to strengthen Moon</li>
                                        ];
                                      }

                                      return weakPlanets.map(([planetName, planetData]: any) => (
                                        <li key={planetName} className="flex items-start gap-2">
                                          <span className="text-amber-200">•</span>
                                          <span>
                                            {charityMap[planetName as keyof typeof charityMap]} to strengthen {planetName.charAt(0).toUpperCase() + planetName.slice(1)}
                                          </span>
                                        </li>
                                      ));
                                    })()}
                                  </ul>
                                </CardContent>
                              </Card>
                              <Card className="bg-slate-800/50 border-slate-600 m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition rounded-lg">
                                <CardContent className="p-4">
                                  <h4 className="font-semibold text-amber-200 mb-2">Recommended Fasting</h4>
                                  <ul className="text-sm text-slate-300 space-y-2">
                                    {(() => {
                                      const weakPlanets = Object.entries(newChartData.planets || {})
                                        .filter(([_, planetData]: any) => planetData.dignity?.strength === 'Weak')
                                        .slice(0, 3);

                                      const fastingMap = {
                                        'sun': 'Sunday - Fast from salt, eat simple vegetarian food to strengthen Sun',
                                        'moon': 'Monday - Avoid dairy, eat light meals to strengthen Moon',
                                        'mars': 'Tuesday - Avoid red foods, eat cooling foods to strengthen Mars',
                                        'mercury': 'Wednesday - Avoid processed foods, eat fresh vegetables to strengthen Mercury',
                                        'jupiter': 'Thursday - Avoid heavy foods, eat yellow foods to strengthen Jupiter',
                                        'venus': 'Friday - Avoid sweets, eat fruits and vegetables to strengthen Venus',
                                        'saturn': 'Saturday - Complete fast or eat once, avoid oily foods to strengthen Saturn',
                                        'rahu': 'Daily - Avoid stale food, eat fresh meals to strengthen Rahu',
                                        'ketu': 'Daily - Avoid processed foods, eat sattvic food to strengthen Ketu'
                                      };

                                      if (weakPlanets.length === 0) {
                                        return [
                                          <li key="default1">• Monday - Avoid dairy, eat light meals for emotional balance</li>,
                                          <li key="default2">• Thursday - Avoid heavy foods, eat yellow foods for wisdom</li>,
                                          <li key="default3">• Saturday - Complete fast or eat once for discipline</li>
                                        ];
                                      }

                                      return weakPlanets.map(([planetName, planetData]: any) => (
                                        <li key={planetName} className="flex items-start gap-2">
                                          <span className="text-amber-200">•</span>
                                          <span>
                                            {fastingMap[planetName as keyof typeof fastingMap]}
                                          </span>
                                        </li>
                                      ));
                                    })()}
                                  </ul>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">🙏</div>
                      <h3 className="text-xl font-semibold text-amber-200 mb-2">Remedies Loading</h3>
                      <p className="text-slate-300 mb-4">
                        Generating personalized remedies based on your chart...
                      </p>
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Vedic Astro-Numerology Tab (pipeline-only: from profile.vedicAstroNumerology or CTA) */}
              <TabsContent value="astro-numerology" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {!vedicDerived.vedicAstroNumerologyReport && !vedicDerived.isLoadingVedicAstroNumerology ? (
                  <Card className="bg-slate-900/50 border-amber-500/50 rounded-xl">
                    <CardContent className="p-6 text-center">
                      <p className="text-slate-300 mb-4">Vedic Astro-Numerology is available from your mystical profile.</p>
                      <Button asChild variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <VedicAstroNumerologyTab
                    userId={user?.uid || ''}
                    birthDate={userProfile?.birthDate}
                    fullName={userProfile?.displayName}
                    vedicChartData={newChartData}
                    cachedReport={vedicDerived.vedicAstroNumerologyReport as React.ComponentProps<typeof VedicAstroNumerologyTab>['cachedReport']}
                    isLoadingReport={vedicDerived.isLoadingVedicAstroNumerology}
                  />
                )}
              </TabsContent>

              {/* Gotra Tab */}
              <TabsContent value="gotra" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                {unifiedChartData?.planets && (
                  <GotraTab
                    moonNakshatra={unifiedChartData.planets.find((p: any) => p.name?.toLowerCase() === 'moon' || p.name?.toLowerCase() === 'chandra')?.nakshatra || 'Unknown'}
                    moonLongitude={unifiedChartData.planets.find((p: any) => p.name?.toLowerCase() === 'moon' || p.name?.toLowerCase() === 'chandra')?.longitude || 0}
                    userProfile={userProfile}
                    chartData={unifiedChartData}
                  />
                )}
              </TabsContent>

              {/* Ask the Seer Tab */}
              <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <VedicSeerChatInterface
                  userId={user?.uid || ''}
                  userProfile={userProfile}
                  vedicChartData={unifiedChartData || newChartData}
                  vedicNumerologyData={vedicDerived.vedicAstroNumerologyReport || (vedicNumerologyProfile ? { profile: vedicNumerologyProfile, comprehensiveAnalysis: null } : null)}
                />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                <Card className="border-2 border-amber-300 m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition rounded-3xl overflow-hidden">
                  <div className="h-1 bg-amber-400" />
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="text-amber-900">Chart Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
                    <SettingsBar
                      nodeMode={nodeMode}
                      onNodeModeChange={setNodeMode}
                      chartStyle={chartStyle}
                      onChartStyleChange={setChartStyle}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            </div>
          </motion.div>
        )}

        {/* Planet Detail Modal */}
        {selectedPlanet && (
          <PlanetDetailModal
            planet={selectedPlanet.name}
            data={selectedPlanet.data}
            onClose={() => setSelectedPlanet(null)}
          />
        )}

      </div>
    </div>
    </ToolReportGuard>
  );
}

export default function VedicAstrologyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
        <div className="animate-pulse text-amber-400">Loading...</div>
      </div>
    }>
      <VedicAstrologyPageContent />
    </Suspense>
  );
}
