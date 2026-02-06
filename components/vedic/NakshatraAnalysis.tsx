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
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Dominant Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-xs mb-2">Dominant Element</p>
                  <Badge className={`bg-gradient-to-r ${ELEMENT_COLORS[analysis.nakshatraInsights?.dominantElement] || 'from-gray-500 to-slate-500'} text-white`}>
                    {analysis.nakshatraInsights?.dominantElement || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs mb-2">Dominant Quality</p>
                  <Badge className={`bg-gradient-to-r ${QUALITY_COLORS[analysis.nakshatraInsights?.dominantQuality] || 'from-gray-500 to-slate-500'} text-white`}>
                    {analysis.nakshatraInsights?.dominantQuality?.split(' ')[0] || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs mb-2">Dominant Caste</p>
                  <Badge variant="outline" className="text-white border-amber-400">
                    {analysis.nakshatraInsights?.dominantCaste || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs mb-2">Dominant Nature</p>
                  <Badge variant="outline" className="text-white border-amber-400">
                    {analysis.nakshatraInsights?.dominantNature || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nakshatra Distribution */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Nakshatra Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(analysis.nakshatraSummary?.nakshatraDistribution || {}).map(([nakshatra, count]) => (
                  <div key={nakshatra} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-white text-sm font-medium">{nakshatra}</span>
                    <Badge variant="outline" className="text-amber-400 border-amber-400">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nakshatra Summary */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Nakshatra Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400">{analysis.nakshatraSummary?.totalNakshatras || 0}</div>
                  <div className="text-sm text-slate-400">Total Planets</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{analysis.nakshatraSummary?.uniqueNakshatras || 0}</div>
                  <div className="text-sm text-slate-400">Unique Nakshatras</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{analysis.nakshatraSummary?.mostFrequentNakshatra || 'None'}</div>
                  <div className="text-sm text-slate-400">Most Frequent</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{Object.keys(analysis.nakshatraSummary?.nakshatraDistribution || {}).length}</div>
                  <div className="text-sm text-slate-400">Nakshatra Types</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Life Path Insights for Moon Nakshatra */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Moon in {analysis.moonNakshatra?.nakshatra?.englishName} - Life Path Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {moonNakshatraData && (
                <>
                  <div>
                    <h4 className="text-amber-200 font-semibold mb-2">Career & Profession</h4>
                    <div className="flex flex-wrap gap-2">
                      {moonNakshatraData.career.map((item, idx) => (
                        <Badge key={idx} className="bg-blue-900/50 text-blue-200 border-blue-500/30">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-amber-200 font-semibold mb-2">Health & Wellness</h4>
                    <div className="flex flex-wrap gap-2">
                      {moonNakshatraData.health.map((item, idx) => (
                        <Badge key={idx} className="bg-green-900/50 text-green-200 border-green-500/30">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-amber-200 font-semibold mb-2">Strengths</h4>
                    <div className="flex flex-wrap gap-2">
                      {moonNakshatraData.strengths.map((item, idx) => (
                        <Badge key={idx} className="bg-emerald-900/50 text-emerald-200 border-emerald-500/30">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-amber-200 font-semibold mb-2">Relationships</h4>
                    <div className="flex flex-wrap gap-2">
                      {moonNakshatraData.relationships.map((item, idx) => (
                        <Badge key={idx} className="bg-pink-900/50 text-pink-200 border-pink-500/30">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Detailed Core Identity Insights for Sun Nakshatra if different */}
          {analysis.sunNakshatra?.nakshatra?.englishName !== analysis.moonNakshatra?.nakshatra?.englishName && sunNakshatraData && (
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  Sun in {analysis.sunNakshatra?.nakshatra?.englishName} - Core Identity Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-amber-200 font-semibold mb-2">Career & Profession</h4>
                  <div className="flex flex-wrap gap-2">
                    {sunNakshatraData.career.map((item, idx) => (
                      <Badge key={idx} className="bg-blue-900/50 text-blue-200 border-blue-500/30">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-amber-200 font-semibold mb-2">Health & Wellness</h4>
                  <div className="flex flex-wrap gap-2">
                    {sunNakshatraData.health.map((item, idx) => (
                      <Badge key={idx} className="bg-green-900/50 text-green-200 border-green-500/30">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-amber-200 font-semibold mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {sunNakshatraData.strengths.map((item, idx) => (
                      <Badge key={idx} className="bg-emerald-900/50 text-emerald-200 border-emerald-500/30">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-amber-200 font-semibold mb-2">Relationships</h4>
                  <div className="flex flex-wrap gap-2">
                    {sunNakshatraData.relationships.map((item, idx) => (
                      <Badge key={idx} className="bg-pink-900/50 text-pink-200 border-pink-500/30">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}