"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Star, 
  Sun, 
  Moon, 
  Zap,
  TrendingUp,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface DashaAnalysisProps {
  dashaAnalysis: {
    currentDasha?: {
      planet: string;
      start_date: string;
      end_date: string;
      remaining_days?: number;
      influence: string;
    };
    dashaForecast?: Array<{
      period: string;
      dasha: string;
      focus_area: string;
      likely_events: string;
      remedies: string;
      start_date: string;
      end_date: string;
      progress: number;
    }>;
  };
}

const PLANET_COLORS: { [key: string]: string } = {
  'Sun': 'from-yellow-500 to-orange-500',
  'Moon': 'from-slate-400 to-slate-600',
  'Mars': 'from-red-500 to-red-700',
  'Mercury': 'from-green-500 to-green-700',
  'Jupiter': 'from-blue-500 to-blue-700',
  'Venus': 'from-pink-500 to-pink-700',
  'Saturn': 'from-gray-500 to-gray-700',
  'Rahu': 'from-purple-500 to-purple-700',
  'Ketu': 'from-indigo-500 to-indigo-700'
};

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

export default function DashaAnalysis({ dashaAnalysis }: DashaAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'insights'>('current');
  const [expandedDasha, setExpandedDasha] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const renderCurrentDasha = () => {
    // Safety check for currentDasha data
    if (!dashaAnalysis?.currentDasha?.planet) {
      return (
        <div className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Current Dasha</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Dasha information is not available at this time.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentDasha = dashaAnalysis.currentDasha;
    const progress = calculateProgress(currentDasha.start_date, currentDasha.end_date);

    return (
      <div className="space-y-6">
        {/* Current Dasha Card */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${PLANET_COLORS[currentDasha.planet]} rounded-full flex items-center justify-center`}>
                  {(() => {
                    const PlanetIcon = PLANET_ICONS[currentDasha.planet];
                    return <PlanetIcon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-xl text-white">
                    {currentDasha.planet} Dasha
                  </CardTitle>
                  <p className="text-slate-300">
                    {formatDate(currentDasha.start_date)} - {formatDate(currentDasha.end_date)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-amber-400 border-amber-400">
                {progress}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Progress</span>
                  <span className="text-amber-400">{progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Influence Description */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Current Influence
                </h4>
                <p className="text-slate-300">{currentDasha.influence}</p>
              </div>

              {/* Timing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Started
                  </h4>
                  <p className="text-slate-300">{formatDate(currentDasha.start_date)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    Ends
                  </h4>
                  <p className="text-slate-300">{formatDate(currentDasha.end_date)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUpcomingDashas = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Upcoming Dashas</h3>
      {dashaAnalysis.dashaForecast && dashaAnalysis.dashaForecast.length > 0 ? (
        dashaAnalysis.dashaForecast.map((dasha: any, index: number) => (
          <Card key={index} className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{dasha.dasha || dasha.planet}</h4>
                    <p className="text-sm text-gray-300">{dasha.focus_area || 'General influence'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">
                    {dasha.start_date ? new Date(dasha.start_date).toLocaleDateString() : 'TBD'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {dasha.end_date ? new Date(dasha.end_date).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <p className="text-slate-300">No upcoming dasha information available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Dasha Insights</h3>
      <Card className="glass-card border-white/10">
        <CardContent className="p-4">
          <p className="text-slate-300">
            Dasha insights provide deep understanding of planetary periods and their influence on your life journey.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            Dasha Analysis
          </CardTitle>
          <p className="text-slate-300">
            Explore your planetary periods and their influence on your life
          </p>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('current')}
              className={`rounded-xl ${activeTab === 'current' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Current Dasha
            </Button>
            <Button
              variant={activeTab === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('upcoming')}
              className={`rounded-xl ${activeTab === 'upcoming' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Upcoming Dashas
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
              {activeTab === 'current' && renderCurrentDasha()}
              {activeTab === 'upcoming' && renderUpcomingDashas()}
              {activeTab === 'insights' && renderInsights()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
