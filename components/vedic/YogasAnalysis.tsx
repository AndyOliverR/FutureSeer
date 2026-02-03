"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Crown,
  DollarSign,
  Shield,
  Zap,
  Heart,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

interface Yoga {
  name: string;
  type: 'raj' | 'dhana' | 'vipareeta' | 'neech_bhanga' | 'panch_mahapurusha' | 'other';
  planets: string[];
  houses: number[];
  effects: string[];
  characteristics: string[];
  predictions: string[];
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  isActive: boolean;
  description: string;
}

interface YogasAnalysis {
  totalYogas: number;
  activeYogas: number;
  yogaTypes: {
    raj: number;
    dhana: number;
    vipareeta: number;
    neech_bhanga: number;
    panch_mahapurusha: number;
    other: number;
  };
  majorYogas: Yoga[];
  allYogas: Yoga[];
  insights: {
    dominantType: string;
    strongestYoga: string;
    recommendations: string[];
    warnings: string[];
  };
}

interface YogasAnalysisProps {
  yogasAnalysis: YogasAnalysis;
  className?: string;
}

const YOGA_TYPE_ICONS: { [key: string]: any } = {
  'raj': Crown,
  'dhana': DollarSign,
  'vipareeta': AlertTriangle,
  'neech_bhanga': Shield,
  'panch_mahapurusha': Star,
  'other': BookOpen
};

const YOGA_TYPE_COLORS: { [key: string]: string } = {
  'raj': 'from-yellow-500 to-orange-500',
  'dhana': 'from-green-500 to-emerald-500',
  'vipareeta': 'from-red-500 to-pink-500',
  'neech_bhanga': 'from-blue-500 to-cyan-500',
  'panch_mahapurusha': 'from-purple-500 to-indigo-500',
  'other': 'from-gray-500 to-slate-500'
};

const STRENGTH_COLORS: { [key: string]: string } = {
  'weak': 'text-red-400',
  'moderate': 'text-yellow-400',
  'strong': 'text-green-400',
  'very_strong': 'text-blue-400'
};

export function YogasAnalysis({ yogasAnalysis, className = "" }: YogasAnalysisProps) {
  const [expandedYoga, setExpandedYoga] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'major' | 'all'>('overview');

  // Safety check for missing or malformed data
  if (!yogasAnalysis || !yogasAnalysis.insights) {
    return (
      <div className={`relative ${className}`}>
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl gold-glow flex items-center gap-2">
              <Star className="w-6 h-6" />
              Yogas Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-white font-semibold">Yogas Analysis Unavailable</p>
              <p className="text-slate-400 text-sm mt-2">Unable to load yoga analysis data at this time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleYogaExpansion = (yogaName: string) => {
    setExpandedYoga(expandedYoga === yogaName ? null : yogaName);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{yogasAnalysis.totalYogas}</p>
            <p className="text-xs text-gray-400">Total Yogas</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{yogasAnalysis.activeYogas}</p>
            <p className="text-xs text-gray-400">Active Yogas</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold text-white">{yogasAnalysis.insights?.dominantType || 'Mixed'}</p>
            <p className="text-xs text-gray-400">Dominant Type</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold text-white">{yogasAnalysis.insights?.strongestYoga || 'No Major Yoga'}</p>
            <p className="text-xs text-gray-400">Strongest Yoga</p>
          </CardContent>
        </Card>
      </div>

      {/* Yoga Types Distribution */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Yoga Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(yogasAnalysis.yogaTypes || {}).map(([type, count]) => {
              const Icon = YOGA_TYPE_ICONS[type];
              return (
                <div key={type} className="flex items-center gap-3 p-3 bg-white/5 rounded">
                  <div className={`w-8 h-8 bg-gradient-to-r ${YOGA_TYPE_COLORS[type]} rounded-full flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white capitalize">
                      {type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-400">{count} yogas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(yogasAnalysis.insights?.recommendations || []).map((recommendation, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(yogasAnalysis.insights?.warnings || []).map((warning, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-500/10 rounded">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm">{warning}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderYogaCard = (yoga: Yoga) => {
    const Icon = YOGA_TYPE_ICONS[yoga.type];
    const isExpanded = expandedYoga === yoga.name;
    
    return (
      <motion.div
        key={yoga.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${YOGA_TYPE_COLORS[yoga.type]} rounded-full flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">{yoga.name}</CardTitle>
                  <p className="text-sm text-gray-300 capitalize">
                    {yoga.type.replace('_', ' ')} Yoga
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${STRENGTH_COLORS[yoga.strength]}`}
                >
                  {yoga.strength.replace('_', ' ')}
                </Badge>
                {yoga.isActive && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-xs">
                    Active
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleYogaExpansion(yoga.name)}
                  className="text-gray-400 hover:text-white"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="mb-4">
              <p className="text-sm text-gray-300">{yoga.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">Planets</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {yoga.planets.map((planet, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {planet}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Houses</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {yoga.houses.map((house, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {house}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Strength</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${STRENGTH_COLORS[yoga.strength]}`}
                >
                  {yoga.strength.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Status</p>
                <Badge 
                  variant={yoga.isActive ? "default" : "outline"}
                  className={yoga.isActive ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}
                >
                  {yoga.isActive ? 'Active' : 'Inactive'}
                </Badge>
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
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Effects</h4>
                      <div className="flex flex-wrap gap-2">
                        {yoga.effects.map((effect, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Characteristics</h4>
                      <div className="flex flex-wrap gap-2">
                        {yoga.characteristics.map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Predictions</h4>
                      <div className="space-y-2">
                        {yoga.predictions.map((prediction, index) => (
                          <p key={index} className="text-sm text-gray-300">• {prediction}</p>
                        ))}
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
  };

  const renderMajorYogas = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Major Yogas</h3>
      {(yogasAnalysis.majorYogas || []).map(renderYogaCard)}
    </div>
  );

  const renderAllYogas = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">All Yogas ({(yogasAnalysis.allYogas || []).length})</h3>
      {(yogasAnalysis.allYogas || []).map(renderYogaCard)}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl gold-glow flex items-center gap-2">
            <Star className="w-6 h-6" />
            Yogas Analysis
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl ${activeTab === 'overview' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'major' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('major')}
              className={`rounded-xl ${activeTab === 'major' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Major Yogas
            </Button>
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl ${activeTab === 'all' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              All Yogas
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
              {activeTab === 'major' && renderMajorYogas()}
              {activeTab === 'all' && renderAllYogas()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default YogasAnalysis;
