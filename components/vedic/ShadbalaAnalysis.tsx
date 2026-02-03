"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Sun,
  Moon,
  Target,
  Heart,
  Shield,
  Gem,
  Zap,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Compass,
  Clock,
  Move,
  Zap as Natural,
  Eye
} from 'lucide-react'

interface PlanetaryStrength {
  planet: string;
  totalStrength: number;
  sthanaBala: number; // Positional strength
  digBala: number; // Directional strength
  kalaBala: number; // Temporal strength
  chesthaBala: number; // Motional strength
  naisargikaBala: number; // Natural strength
  drikBala: number; // Aspectual strength
  strengthLevel: 'weak' | 'moderate' | 'strong' | 'very_strong';
  isExalted: boolean;
  isDebilitated: boolean;
  isOwnSign: boolean;
}

interface ShadbalaAnalysis {
  planetaryStrengths: PlanetaryStrength[];
  strongestPlanet: string;
  weakestPlanet: string;
  averageStrength: number;
  strengthDistribution: {
    weak: number;
    moderate: number;
    strong: number;
    very_strong: number;
  };
  insights: {
    dominantStrengths: string[];
    recommendations: string[];
    warnings: string[];
  };
}

interface ShadbalaAnalysisProps {
  shadbalaAnalysis: ShadbalaAnalysis;
  className?: string;
}

const PLANET_ICONS: { [key: string]: any } = {
  'Sun': Sun,
  'Moon': Moon,
  'Mars': Target,
  'Mercury': Zap,
  'Jupiter': Shield,
  'Venus': Heart,
  'Saturn': Gem,
  'Rahu': Sparkles,
  'Ketu': Star
};

const PLANET_COLORS: { [key: string]: string } = {
  'Sun': 'from-yellow-500 to-orange-500',
  'Moon': 'from-blue-500 to-cyan-500',
  'Mars': 'from-red-500 to-pink-500',
  'Mercury': 'from-green-500 to-emerald-500',
  'Jupiter': 'from-purple-500 to-indigo-500',
  'Venus': 'from-pink-500 to-rose-500',
  'Saturn': 'from-gray-500 to-slate-500',
  'Rahu': 'from-indigo-500 to-purple-500',
  'Ketu': 'from-violet-500 to-purple-500'
};

const STRENGTH_COLORS: { [key: string]: string } = {
  'weak': 'text-red-400',
  'moderate': 'text-yellow-400',
  'strong': 'text-green-400',
  'very_strong': 'text-blue-400'
};

const STRENGTH_BG_COLORS: { [key: string]: string } = {
  'weak': 'bg-red-500/20',
  'moderate': 'bg-yellow-500/20',
  'strong': 'bg-green-500/20',
  'very_strong': 'bg-blue-500/20'
};

export function ShadbalaAnalysis({ shadbalaAnalysis, className = "" }: ShadbalaAnalysisProps) {
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'insights'>('overview');

  const togglePlanetExpansion = (planetName: string) => {
    setExpandedPlanet(expandedPlanet === planetName ? null : planetName);
  };

  const getStrengthPercentage = (strength: number) => {
    return Math.min(Math.max((strength / 100) * 100, 0), 100);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{shadbalaAnalysis.planetaryStrengths.length}</p>
            <p className="text-xs text-gray-400">Planets Analyzed</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold text-white">{shadbalaAnalysis.strongestPlanet}</p>
            <p className="text-xs text-gray-400">Strongest Planet</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold text-white">{shadbalaAnalysis.weakestPlanet}</p>
            <p className="text-xs text-gray-400">Weakest Planet</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{Math.round(shadbalaAnalysis.averageStrength)}</p>
            <p className="text-xs text-gray-400">Average Strength</p>
          </CardContent>
        </Card>
      </div>

      {/* Strength Distribution */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Strength Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(shadbalaAnalysis.strengthDistribution).map(([level, count]) => (
              <div key={level} className={`p-4 rounded-lg ${STRENGTH_BG_COLORS[level]}`}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className={`text-sm font-semibold ${STRENGTH_COLORS[level]} capitalize`}>
                    {level.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planetary Strengths Overview */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" />
            Planetary Strengths Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shadbalaAnalysis.planetaryStrengths.map((planet) => {
              const PlanetIcon = PLANET_ICONS[planet.planet];
              const strengthPercentage = getStrengthPercentage(planet.totalStrength);
              
              return (
                <div key={planet.planet} className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${PLANET_COLORS[planet.planet]} rounded-full flex items-center justify-center`}>
                    <PlanetIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{planet.planet}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${STRENGTH_COLORS[planet.strengthLevel]}`}>
                          {planet.strengthLevel.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-400">{Math.round(planet.totalStrength)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 bg-gradient-to-r ${PLANET_COLORS[planet.planet]} rounded-full transition-all duration-300`}
                        style={{ width: `${strengthPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailed = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Detailed Shadbala Analysis</h3>
      {shadbalaAnalysis.planetaryStrengths.map((planet) => {
        const PlanetIcon = PLANET_ICONS[planet.planet];
        const isExpanded = expandedPlanet === planet.planet;
        
        return (
          <motion.div
            key={planet.planet}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${PLANET_COLORS[planet.planet]} rounded-full flex items-center justify-center`}>
                      <PlanetIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{planet.planet}</CardTitle>
                      <p className="text-sm text-gray-300">
                        Total Strength: {Math.round(planet.totalStrength)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-sm ${STRENGTH_COLORS[planet.strengthLevel]}`}
                    >
                      {planet.strengthLevel.replace('_', ' ')}
                    </Badge>
                    <div className="flex gap-1">
                      {planet.isExalted && <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-xs">Exalted</Badge>}
                      {planet.isDebilitated && <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-xs">Debilitated</Badge>}
                      {planet.isOwnSign && <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-xs">Own Sign</Badge>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePlanetExpansion(planet.planet)}
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Six Strengths */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/5 rounded">
                    <Activity className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Sthana Bala</p>
                    <p className="text-sm font-semibold text-white">{Math.round(planet.sthanaBala)}</p>
                    <p className="text-xs text-gray-300">Positional</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <Compass className="w-5 h-5 text-green-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Dig Bala</p>
                    <p className="text-sm font-semibold text-white">{Math.round(planet.digBala)}</p>
                    <p className="text-xs text-gray-300">Directional</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Kala Bala</p>
                    <p className="text-sm font-semibold text-white">{Math.round(planet.kalaBala)}</p>
                    <p className="text-xs text-gray-300">Temporal</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <Move className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Chestha Bala</p>
                    <p className="text-sm font-semibold text-white">{Math.round(planet.chesthaBala)}</p>
                    <p className="text-xs text-gray-300">Motional</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <Natural className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Naisargika Bala</p>
                    <p className="text-sm font-semibold text-white">{Math.round(planet.naisargikaBala)}</p>
                    <p className="text-xs text-gray-300">Natural</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <Eye className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-1">Drik Bala</p>
                    <p className="text-sm font-semibold text-white">{Math.round(planet.drikBala)}</p>
                    <p className="text-xs text-gray-300">Aspectual</p>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10 pt-4"
                    >
                      <div className="space-y-4">
                        {/* Strength Bars */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3">Individual Strengths</h4>
                          <div className="space-y-3">
                            {[
                              { name: 'Sthana Bala', value: planet.sthanaBala, icon: Activity, color: 'blue' },
                              { name: 'Dig Bala', value: planet.digBala, icon: Compass, color: 'green' },
                              { name: 'Kala Bala', value: planet.kalaBala, icon: Clock, color: 'purple' },
                              { name: 'Chestha Bala', value: planet.chesthaBala, icon: Move, color: 'orange' },
                              { name: 'Naisargika Bala', value: planet.naisargikaBala, icon: Natural, color: 'yellow' },
                              { name: 'Drik Bala', value: planet.drikBala, icon: Eye, color: 'pink' }
                            ].map((strength, index) => {
                              const Icon = strength.icon;
                              const percentage = getStrengthPercentage(strength.value);
                              
                              return (
                                <div key={index} className="flex items-center gap-3">
                                  <Icon className={`w-4 h-4 text-${strength.color}-400`} />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-white text-sm">{strength.name}</span>
                                      <span className="text-gray-400 text-xs">{Math.round(strength.value)}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                      <div 
                                        className={`h-1.5 bg-gradient-to-r from-${strength.color}-500 to-${strength.color}-400 rounded-full transition-all duration-300`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Shadbala Insights</h3>
      
      {/* Dominant Strengths */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Dominant Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shadbalaAnalysis.insights.dominantStrengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-white text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-400" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shadbalaAnalysis.insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-500/10 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-white text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shadbalaAnalysis.insights.warnings.map((warning, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-red-500/10 rounded">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-white text-sm">{warning}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl gold-glow flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Shadbala Analysis
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl ${activeTab === 'overview' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('detailed')}
              className={`rounded-xl ${activeTab === 'detailed' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Detailed
            </Button>
            <Button
              variant={activeTab === 'insights' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('insights')}
              className={`rounded-xl ${activeTab === 'insights' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Insights
            </Button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'detailed' && renderDetailed()}
              {activeTab === 'insights' && renderInsights()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShadbalaAnalysis;
