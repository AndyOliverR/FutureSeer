'use client';

import { useState } from 'react';
import { useVedic } from '@/hooks/use-vedic';
import { VedicReading } from '@/lib/vedicIntelligence';
import { motion } from 'framer-motion';
import { 
  Planet, 
  Home, 
  Shield, 
  Star, 
  Clock, 
  Heart, 
  Briefcase, 
  Users, 
  Activity,
  Gem,
  BookOpen,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export function VedicTool() {
  const { vedicData, loading, error, refreshVedicData } = useVedic();
  const [activeSection, setActiveSection] = useState<'chart' | 'analysis' | 'remedies' | 'coaching'>('chart');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <h3 className="text-red-300 font-semibold mb-2">Error Loading Vedic Data</h3>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={refreshVedicData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!vedicData) {
    return (
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 text-center">
        <Info className="w-8 h-8 text-slate-400 mx-auto mb-4" />
        <h3 className="text-slate-300 font-semibold mb-2">No Vedic Data Available</h3>
        <p className="text-slate-400">
          Please ensure your birth details are complete in your profile to generate Vedic insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">🕉️ Vedic Astrology Analysis</h2>
        <p className="text-slate-300">
          Ancient wisdom analyzed by AI for modern insights
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
        {[
          { key: 'chart', label: 'Birth Chart', icon: Planet },
          { key: 'analysis', label: 'Analysis', icon: Activity },
          { key: 'remedies', label: 'Remedies', icon: Gem },
          { key: 'coaching', label: 'AI Coach', icon: Sparkles }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeSection === key
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="min-h-96">
        {activeSection === 'chart' && <VedicChartSection vedicData={vedicData} />}
        {activeSection === 'analysis' && <VedicAnalysisSection vedicData={vedicData} />}
        {activeSection === 'remedies' && <VedicRemediesSection vedicData={vedicData} />}
        {activeSection === 'coaching' && <VedicCoachingSection vedicData={vedicData} />}
      </div>
    </div>
  );
}

function VedicChartSection({ vedicData }: { vedicData: VedicReading }) {
  return (
    <div className="space-y-6">
      {/* Planetary Positions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Planet className="w-5 h-5 mr-2 text-purple-400" />
          Planetary Positions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vedicData.planets.map((planet) => (
            <div
              key={planet.name}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{planet.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  planet.strength === 'exalted' ? 'bg-green-600 text-white' :
                  planet.strength === 'own' ? 'bg-blue-600 text-white' :
                  planet.strength === 'debilitated' ? 'bg-red-600 text-white' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {planet.strength}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sign:</span>
                  <span className="text-white">{planet.sign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">House:</span>
                  <span className="text-white">{planet.house}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nakshatra:</span>
                  <span className="text-white">{planet.nakshatra}</span>
                </div>
                {planet.retrograde && (
                  <div className="text-orange-400 text-xs font-medium">Retrograde</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Houses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Home className="w-5 h-5 mr-2 text-purple-400" />
          House Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vedicData.houses.map((house) => (
            <div
              key={house.number}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{house.number}st House</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  house.strength === 'strong' ? 'bg-green-600 text-white' :
                  house.strength === 'moderate' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {house.strength}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sign:</span>
                  <span className="text-white">{house.sign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lord:</span>
                  <span className="text-white">{house.lord}</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  {house.themes.join(', ')}
                </div>
                {house.planets.length > 0 && (
                  <div className="text-purple-400 text-xs mt-1">
                    Planets: {house.planets.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function VedicAnalysisSection({ vedicData }: { vedicData: VedicReading }) {
  return (
    <div className="space-y-6">
      {/* Doshas */}
      {vedicData.doshas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-400" />
            Doshas & Challenges
          </h3>
          <div className="space-y-4">
            {vedicData.doshas.map((dosha, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white capitalize">{dosha.type} Dosha</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    dosha.severity === 'severe' ? 'bg-red-600 text-white' :
                    dosha.severity === 'moderate' ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {dosha.severity}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-3">{dosha.description}</p>
                <div className="text-slate-400 text-xs">
                  <strong>Affected Areas:</strong> {dosha.affectedAreas.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Yogas */}
      {vedicData.yogas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-purple-400" />
            Auspicious Yogas
          </h3>
          <div className="space-y-4">
            {vedicData.yogas.map((yoga, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">{yoga.name} Yoga</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    yoga.strength === 'strong' ? 'bg-green-600 text-white' :
                    yoga.strength === 'moderate' ? 'bg-yellow-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {yoga.strength}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-3">{yoga.description}</p>
                <div className="text-slate-400 text-xs">
                  <strong>Effects:</strong> {yoga.effects.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dasha */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-400" />
          Current Dasha Period
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="font-semibold text-white mb-2">Current Dasha</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Planet:</span>
                <span className="text-white">{vedicData.dasha.current.planet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start:</span>
                <span className="text-white">{vedicData.dasha.current.startDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End:</span>
                <span className="text-white">{vedicData.dasha.current.endDate.toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm mt-3">{vedicData.dasha.current.description}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="font-semibold text-white mb-2">Upcoming Dasha</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Planet:</span>
                <span className="text-white">{vedicData.dasha.upcoming.planet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start:</span>
                <span className="text-white">{vedicData.dasha.upcoming.startDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End:</span>
                <span className="text-white">{vedicData.dasha.upcoming.endDate.toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm mt-3">{vedicData.dasha.upcoming.description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function VedicRemediesSection({ vedicData }: { vedicData: VedicReading }) {
  return (
    <div className="space-y-6">
      {/* Gemstones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Gem className="w-5 h-5 mr-2 text-purple-400" />
          Gemstone Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vedicData.remedies.gemstones.map((gemstone, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-center space-x-3">
                <Gem className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{gemstone}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mantras */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
          Mantras & Chants
        </h3>
        <div className="space-y-3">
          {vedicData.remedies.mantras.map((mantra, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <BookOpen className="w-5 h-5 text-purple-400 mt-0.5" />
                <span className="text-white">{mantra}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rituals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
          Rituals & Practices
        </h3>
        <div className="space-y-3">
          {vedicData.remedies.rituals.map((ritual, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                <span className="text-white">{ritual}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lifestyle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          Lifestyle Recommendations
        </h3>
        <div className="space-y-3">
          {vedicData.remedies.lifestyle.map((item, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-white">{item}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function VedicCoachingSection({ vedicData }: { vedicData: VedicReading }) {
  return (
    <div className="space-y-6">
      {/* Current Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-400" />
          Current Focus
        </h3>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <p className="text-white leading-relaxed">{vedicData.coaching.currentFocus}</p>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          AI Recommendations
        </h3>
        <div className="space-y-3">
          {vedicData.coaching.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-white">{recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Affirmations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-purple-400" />
          Daily Affirmations
        </h3>
        <div className="space-y-3">
          {vedicData.coaching.affirmations.map((affirmation, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-red-400 mt-0.5" />
                <span className="text-white italic">"{affirmation}"</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
          Next Steps
        </h3>
        <div className="space-y-3">
          {vedicData.coaching.nextSteps.map((step, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-white">{step}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 