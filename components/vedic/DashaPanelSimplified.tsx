"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { 
  Clock, 
  Star, 
  Sun, 
  Moon, 
  Zap,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Crown,
  AlertCircle
} from 'lucide-react'
import { DashaTimeline } from './DashaTimeline'
import { getPlanetInfluence, getPlanetGradient } from '@/lib/dashaInfluences'

interface DashaPanelSimplifiedProps {
  chartData: {
    currentDasha: {
      planet: string;
      startDate: string;
      endDate: string;
      progress?: number;
      antardashas?: Array<{
        planet: string;
        startDate: string;
        endDate: string;
        progress?: number;
      }>;
    };
    dasha: Array<{
      planet: string;
      startDate: string;
      endDate: string;
      duration?: number;
    }>;
  };
  birthData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  };
}

const PLANET_ICONS: { [key: string]: any } = {
  'Sun': Sun,
  'Moon': Moon,
  'Mars': Zap,
  'Mercury': Star,
  'Jupiter': Star,
  'Venus': Star,
  'Saturn': Clock,
  'Rahu': Star,
  'Ketu': Star
};

function getPlanetIcon(planet: string, size: 'sm' | 'md' = 'md') {
  const Icon = PLANET_ICONS[planet] || Star;
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return <Icon className={`${iconSize} text-white`} />;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function DashaPanelSimplified({ chartData, birthData }: DashaPanelSimplifiedProps) {
  const [expandedDasha, setExpandedDasha] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'timeline' | 'insights'>('current');

  // Calculate progress for current dasha
  const currentProgress = useMemo(() => {
    if (!chartData.currentDasha) return 0;
    const start = new Date(chartData.currentDasha.startDate).getTime();
    const end = new Date(chartData.currentDasha.endDate).getTime();
    const now = Date.now();
    return Math.round(((now - start) / (end - start)) * 100);
  }, [chartData.currentDasha]);

  const toggleExpanded = (dashaName: string) => {
    setExpandedDasha(expandedDasha === dashaName ? null : dashaName);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <DevotionistStyleCard
        icon={<Crown className="h-6 w-6" />}
        title="Vimshottari Dasha System"
        summary="Your planetary periods and their influence on life events."
        colorScheme="blue"
      />

      {/* Current Mahadasha Hero Section */}
      <div className="space-y-4">
        <div>
          <DevotionistStyleCard
            icon={getPlanetIcon(chartData.currentDasha.planet)}
            title={`${chartData.currentDasha.planet} Planetary Period`}
            subtitle={`${formatDate(chartData.currentDasha.startDate)} - ${formatDate(chartData.currentDasha.endDate)}`}
            summary={`You are ${currentProgress}% through this period.`}
            colorScheme="amber"
          />
          {/* Progress Bar */}
          <div className="mt-4 space-y-2 bg-white/80 rounded-lg p-4 border-2 border-amber-300">
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Influences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DevotionistStyleCard
            icon={<Star className="h-5 w-5" />}
            title={getPlanetInfluence(chartData.currentDasha.planet).focus.title}
            summary={getPlanetInfluence(chartData.currentDasha.planet).focus.description}
            colorScheme="blue"
          />
          <DevotionistStyleCard
            icon={<TrendingUp className="h-5 w-5" />}
            title={getPlanetInfluence(chartData.currentDasha.planet).opportunities.title}
            summary={getPlanetInfluence(chartData.currentDasha.planet).opportunities.description}
            colorScheme="green"
          />
          <DevotionistStyleCard
            icon={<AlertCircle className="h-5 w-5" />}
            title={getPlanetInfluence(chartData.currentDasha.planet).challenges.title}
            summary={getPlanetInfluence(chartData.currentDasha.planet).challenges.description}
            colorScheme="orange"
          />
        </div>

        {/* How to Maximize This Period */}
        {getPlanetInfluence(chartData.currentDasha.planet).benefitGuidance && (
          <DevotionistStyleCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="How to Maximize This Period"
            summary={getPlanetInfluence(chartData.currentDasha.planet).benefitGuidance}
            colorScheme="purple"
          />
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="current" className="text-slate-300">Current Period</TabsTrigger>
          <TabsTrigger value="timeline" className="text-slate-300">Full Timeline</TabsTrigger>
          <TabsTrigger value="insights" className="text-slate-300">Insights</TabsTrigger>
        </TabsList>

        {/* Current Period Tab - Antardashas */}
        <TabsContent value="current" className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Antardashas (Sub-Periods)</h3>
          {chartData.currentDasha.antardashas?.map((antardasha, idx) => (
            <div key={idx}>
              <DevotionistStyleCard
                icon={getPlanetIcon(antardasha.planet, 'sm')}
                title={`${antardasha.planet} Antardasha`}
                subtitle={`${formatDate(antardasha.startDate)} - ${formatDate(antardasha.endDate)}`}
                summary={antardasha.progress && antardasha.progress > 0 ? `Active - ${antardasha.progress}% complete` : 'Upcoming'}
                colorScheme={antardasha.progress && antardasha.progress > 0 ? 'amber' : 'blue'}
              />
              {antardasha.progress && antardasha.progress > 0 && (
                <div className="mt-2 bg-white/80 rounded-lg p-3 border-2 border-amber-300">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full"
                      style={{ width: `${antardasha.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <DashaTimeline dashas={chartData.dasha} currentDate={new Date()} />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div>
            <DevotionistStyleCard
              icon={<Star className="h-5 w-5" />}
              title="Dasha Insights"
              summary="Comprehensive insights about your current and upcoming planetary periods."
              colorScheme="purple"
            />
            {/* Remedies Section */}
            <div className="mt-4 bg-white/80 rounded-lg p-4 border-2 border-purple-300">
              <h4 className="text-slate-800 font-medium mb-3">Recommended Remedies</h4>
              <div className="flex flex-wrap gap-2">
                {getPlanetInfluence(chartData.currentDasha.planet).remedies.map((remedy, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-700 border-purple-300">
                    {remedy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

