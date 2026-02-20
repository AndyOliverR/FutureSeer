"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { calculateNakshatraAnalysis } from '@/lib/nakshatraCalculator';
import { NAKSHATRAS } from '@/lib/nakshatraData';
import { 
  Star, 
  Moon, 
  Sun, 
  Zap,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  Heart,
  Target,
  AlertCircle,
  BookOpen,
  Gem,
  TrendingUp,
  BarChart3,
  Users,
  Activity
} from 'lucide-react'

interface PlanetaryNakshatra {
  planet: string;
  longitude: number;
  nakshatra: {
    id: number;
    name: string;
    englishName: string;
    lord: string;
    symbol: string;
    deity: string;
    element: string;
    quality: string;
    caste: string;
    sex: string;
    nature: string;
    characteristics: string[];
    personality: string[];
    career: string[];
    health: string[];
    relationships: string[];
    strengths: string[];
    weaknesses: string[];
    remedies: string[];
    degrees: {
      start: number;
      end: number;
    };
    pada: {
      1: string;
      2: string;
      3: string;
      4: string;
    };
  };
  pada: number;
  padaSign: string;
  nakshatraLord: string;
  isRetrograde: boolean;
  degreeInNakshatra: number;
  minuteInNakshatra: number;
}

interface NakshatraAnalysis {
  planetaryNakshatras: PlanetaryNakshatra[];
  moonNakshatra: PlanetaryNakshatra;
  sunNakshatra: PlanetaryNakshatra;
  ascendantNakshatra: PlanetaryNakshatra;
  nakshatraSummary: {
    totalNakshatras: number;
    uniqueNakshatras: number;
    mostFrequentNakshatra: string;
    nakshatraDistribution: { [key: string]: number };
  };
  nakshatraInsights: {
    dominantElement: string;
    dominantQuality: string;
    dominantCaste: string;
    dominantNature: string;
  };
}

interface NakshatraAnalysisProps {
  nakshatraAnalysis?: NakshatraAnalysis;
  chartData?: any; // Fallback
  className?: string;
}

const PLANET_ICONS: { [key: string]: any } = {
  'Sun': Sun,
  'Moon': Moon,
  'Mercury': Zap,
  'Venus': Heart,
  'Mars': Target,
  'Jupiter': Shield,
  'Saturn': Gem,
  'Uranus': Sparkles,
  'Neptune': Eye,
  'Pluto': BookOpen,
  'Ascendant': Star,
  'Mean Node': Star,
  'True Node': Star
};

const ELEMENT_COLORS: { [key: string]: string } = {
  'Fire': 'from-orange-500 to-red-500',
  'Earth': 'from-green-500 to-yellow-500',
  'Air': 'from-cyan-500 to-purple-500',
  'Water': 'from-blue-500 to-cyan-500'
};

const QUALITY_COLORS: { [key: string]: string } = {
  'Dhruva (Fixed)': 'from-green-500 to-emerald-500',
  'Chara (Movable)': 'from-blue-500 to-cyan-500',
  'Ubhaya (Dual)': 'from-purple-500 to-pink-500'
};

export function NakshatraAnalysis({ nakshatraAnalysis, chartData, className = "" }: NakshatraAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'planets' | 'insights'>('overview');

  // Calculate analysis with fallback
  const analysis = useMemo(() => {
    if (nakshatraAnalysis) return nakshatraAnalysis;
    
    // Fallback: calculate from chartData if available
    if (chartData?.planets) {
      const planetaryPositions = chartData.planets.map((p: any) => ({
        planet: p.name,
        longitude: p.longitude,
        speed: p.speed || 0
      }));
      return calculateNakshatraAnalysis(planetaryPositions);
    }
    
    return null;
  }, [nakshatraAnalysis, chartData]);

  // Safety check for missing or malformed data
  if (!analysis) {
    return (
      <DevotionistStyleCard
        icon={<AlertCircle className="w-5 h-5" />}
        title="Lunar Mansions Analysis Unavailable"
        summary="Unable to load lunar mansions analysis data at this time"
        colorScheme="amber"
      />
    );
  }

  const moonNakshatraData = NAKSHATRAS.find(n => n.englishName === analysis.moonNakshatra?.nakshatra?.englishName);
  const sunNakshatraData = NAKSHATRAS.find(n => n.englishName === analysis.sunNakshatra?.nakshatra?.englishName);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Birth Star Hero Section */}
      <DevotionistStyleCard
        icon={<Star className="w-6 h-6" />}
        title={`Birth Star: ${analysis.moonNakshatra?.nakshatra?.englishName || 'Unknown'}`}
        subtitle={moonNakshatraData?.name || 'Janma Nakshatra'}
        items={[
          { text: `Lord: ${moonNakshatraData?.lord || 'N/A'}`, highlight: true },
          { text: `Symbol: ${moonNakshatraData?.symbol || 'N/A'}` },
          { text: `Deity: ${moonNakshatraData?.deity || 'N/A'}` },
          { text: `Pada: ${analysis.moonNakshatra?.pada || 'N/A'}` }
        ]}
        colorScheme="amber"
        variant="callout"
      />

      {/* Tabbed Analysis */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-500 data-[state=active]:text-slate-900">
            Overview
          </TabsTrigger>
          <TabsTrigger value="planets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-500 data-[state=active]:text-slate-900">
            All Planets
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-500 data-[state=active]:text-slate-900">
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Check if Sun and Moon are in the same Nakshatra */}
          {analysis.sunNakshatra?.nakshatra?.englishName === analysis.moonNakshatra?.nakshatra?.englishName ? (
            /* Single Card when both are in same Nakshatra */
            <DevotionistStyleCard
              icon={<Star className="w-5 h-5" />}
              title={`Sun & Moon in ${analysis.moonNakshatra?.nakshatra?.englishName} Lunar Mansion`}
              summary={`Both Sun and Moon are positioned in the same Lunar Mansion (${analysis.moonNakshatra?.nakshatra?.englishName}). This creates a powerful conjunction where solar and lunar energies merge.`}
              items={[
                ...(moonNakshatraData?.characteristics.slice(0, 3).map((char) => ({ text: char, type: 'neutral' as const })) || []),
                ...(moonNakshatraData?.remedies.slice(0, 2).map((remedy) => ({ text: remedy, type: 'positive' as const })) || [])
              ]}
              colorScheme="amber"
              variant="callout"
            />
          ) : (
            /* Two separate cards when in different Nakshatras */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Moon Nakshatra Card */}
              <DevotionistStyleCard
                icon={<Moon className="w-5 h-5" />}
                title={`Moon Lunar Mansion: ${analysis.moonNakshatra?.nakshatra?.englishName}`}
                summary={`Your Moon is in the ${analysis.moonNakshatra?.nakshatra?.englishName} Lunar Mansion, influencing your emotional nature and inner self.`}
                items={[
                  ...(moonNakshatraData?.characteristics.slice(0, 3).map((char) => ({ text: char, type: 'neutral' as const })) || []),
                  ...(moonNakshatraData?.remedies.slice(0, 2).map((remedy) => ({ text: remedy, type: 'positive' as const })) || [])
                ]}
                colorScheme="purple"
              />

              {/* Sun Nakshatra Card */}
              <DevotionistStyleCard
                icon={<Sun className="w-5 h-5" />}
                title={`Sun Lunar Mansion: ${analysis.sunNakshatra?.nakshatra?.englishName}`}
                summary={`Your Sun is in the ${analysis.sunNakshatra?.nakshatra?.englishName} Lunar Mansion, shaping your core identity and life purpose.`}
                items={[
                  ...(sunNakshatraData?.characteristics.slice(0, 3).map((char) => ({ text: char, type: 'neutral' as const })) || []),
                  ...(sunNakshatraData?.remedies.slice(0, 2).map((remedy) => ({ text: remedy, type: 'positive' as const })) || [])
                ]}
                colorScheme="amber"
              />
            </div>
          )}
        </TabsContent>

        {/* All Planets Tab */}
        <TabsContent value="planets" className="space-y-6">
          <DevotionistStyleCard
            icon={<Star className="w-5 h-5" />}
            title="All Planetary Lunar Mansions"
            summary="Complete overview of all planets and their positions in the 27 Lunar Mansions"
            colorScheme="amber"
            variant="callout"
          />
          <div className="bg-white/80 border-2 border-amber-300 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.planetaryNakshatras.map((planetaryNakshatra, index) => {
                  const PlanetIcon = PLANET_ICONS[planetaryNakshatra.planet] || Star;
                  const nakshatraData = NAKSHATRAS.find(n => n.englishName === planetaryNakshatra.nakshatra.englishName);
                  
                  return (
                    <Card key={index} className="bg-slate-800 border-slate-700 hover:border-white/20 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                              <PlanetIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-white">{planetaryNakshatra.planet}</CardTitle>
                              <p className="text-sm text-slate-300">in {planetaryNakshatra.nakshatra.englishName}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs text-amber-400">
                            {planetaryNakshatra.nakshatra.englishName}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs">Lord</p>
                            <p className="text-white font-semibold">{planetaryNakshatra.nakshatra.lord}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Pada</p>
                            <p className="text-white font-semibold">{planetaryNakshatra.pada}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Symbol</p>
                            <p className="text-white font-semibold">{planetaryNakshatra.nakshatra.symbol}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Deity</p>
                            <p className="text-white font-semibold">{planetaryNakshatra.nakshatra.deity}</p>
                          </div>
                        </div>
                        
                        {nakshatraData && (
                          <div className="pt-3 border-t border-slate-600">
                            <p className="text-xs text-slate-300">
                              {nakshatraData.characteristics.slice(0, 4).join(', ')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Dominant Patterns */}
          <DevotionistStyleCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Dominant Patterns"
            summary="Your chart's nakshatra emphasis by element, quality, caste, and nature"
            items={[
              { text: `Element: ${analysis.nakshatraInsights?.dominantElement || '—'}`, highlight: true },
              { text: `Quality: ${analysis.nakshatraInsights?.dominantQuality?.split(' ')[0] || '—'}` },
              { text: `Caste: ${analysis.nakshatraInsights?.dominantCaste || '—'}` },
              { text: `Nature: ${analysis.nakshatraInsights?.dominantNature || '—'}` }
            ]}
            colorScheme="amber"
            variant="callout"
          />

          {/* Nakshatra Distribution */}
          <DevotionistStyleCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Nakshatra Distribution"
            summary="Planets per lunar mansion"
            colorScheme="blue"
            variant="callout"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysis.nakshatraSummary?.nakshatraDistribution || {}).map(([nakshatra, count]) => (
              <DevotionistStyleCard
                key={nakshatra}
                icon={<Star className="w-4 h-4" />}
                title={nakshatra}
                summary={`${count} planet${count !== 1 ? 's' : ''}`}
                colorScheme="blue"
                variant="default"
              />
            ))}
          </div>

          {/* Nakshatra Summary */}
          <DevotionistStyleCard
            icon={<Activity className="w-5 h-5" />}
            title="Nakshatra Summary"
            summary="Overview of your lunar mansion placements"
            items={[
              { text: `Total planets: ${analysis.nakshatraSummary?.totalNakshatras ?? 0}`, highlight: true },
              { text: `Unique nakshatras: ${analysis.nakshatraSummary?.uniqueNakshatras ?? 0}` },
              { text: `Most frequent: ${analysis.nakshatraSummary?.mostFrequentNakshatra || '—'}` },
              { text: `Nakshatra types: ${Object.keys(analysis.nakshatraSummary?.nakshatraDistribution || {}).length}` }
            ]}
            colorScheme="purple"
            variant="callout"
          />

          {/* Moon Nakshatra - Life Path Insights */}
          <DevotionistStyleCard
            icon={<Moon className="w-5 h-5" />}
            title={`Moon in ${analysis.moonNakshatra?.nakshatra?.englishName || '—'} — Life Path Insights`}
            summary="Emotional nature and life direction from your birth nakshatra"
            colorScheme="purple"
            variant="callout"
          />
          {moonNakshatraData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DevotionistStyleCard
                icon={<Target className="w-4 h-4" />}
                title="Career & Profession"
                items={moonNakshatraData.career.map((text) => ({ text, type: 'neutral' as const }))}
                colorScheme="blue"
                variant="default"
              />
              <DevotionistStyleCard
                icon={<Activity className="w-4 h-4" />}
                title="Health & Wellness"
                items={moonNakshatraData.health.map((text) => ({ text, type: 'neutral' as const }))}
                colorScheme="green"
                variant="default"
              />
              <DevotionistStyleCard
                icon={<Shield className="w-4 h-4" />}
                title="Strengths"
                items={moonNakshatraData.strengths.map((text) => ({ text, type: 'positive' as const }))}
                colorScheme="green"
                variant="default"
              />
              <DevotionistStyleCard
                icon={<Users className="w-4 h-4" />}
                title="Relationships"
                items={moonNakshatraData.relationships.map((text) => ({ text, type: 'neutral' as const }))}
                colorScheme="pink"
                variant="default"
              />
            </div>
          )}

          {/* Sun Nakshatra - Core Identity Insights (when different from Moon) */}
          {analysis.sunNakshatra?.nakshatra?.englishName !== analysis.moonNakshatra?.nakshatra?.englishName && sunNakshatraData && (
            <>
              <DevotionistStyleCard
                icon={<Sun className="w-5 h-5" />}
                title={`Sun in ${analysis.sunNakshatra?.nakshatra?.englishName} — Core Identity Insights`}
                summary="Core identity and life purpose from your Sun's nakshatra"
                colorScheme="amber"
                variant="callout"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DevotionistStyleCard
                  icon={<Target className="w-4 h-4" />}
                  title="Career & Profession"
                  items={sunNakshatraData.career.map((text) => ({ text, type: 'neutral' as const }))}
                  colorScheme="blue"
                  variant="default"
                />
                <DevotionistStyleCard
                  icon={<Activity className="w-4 h-4" />}
                  title="Health & Wellness"
                  items={sunNakshatraData.health.map((text) => ({ text, type: 'neutral' as const }))}
                  colorScheme="green"
                  variant="default"
                />
                <DevotionistStyleCard
                  icon={<Shield className="w-4 h-4" />}
                  title="Strengths"
                  items={sunNakshatraData.strengths.map((text) => ({ text, type: 'positive' as const }))}
                  colorScheme="green"
                  variant="default"
                />
                <DevotionistStyleCard
                  icon={<Users className="w-4 h-4" />}
                  title="Relationships"
                  items={sunNakshatraData.relationships.map((text) => ({ text, type: 'neutral' as const }))}
                  colorScheme="pink"
                  variant="default"
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}