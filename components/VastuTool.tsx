'use client';

import { useState } from 'react';
import { useVastu } from '@/hooks/use-vastu';
import { VastuReading } from '@/lib/vastuIntelligence';
import { motion } from 'framer-motion';
import { 
  Home, 
  Compass, 
  Map, 
  Lightbulb, 
  BookOpen, 
  Star,
  Activity,
  Gem,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export function VastuTool() {
  const { vastuData, loading, error, refreshVastuData } = useVastu();
  const [activeSection, setActiveSection] = useState<'analysis' | 'remedies' | 'coaching'>('analysis');
  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: 'residential' as 'residential' | 'commercial' | 'office',
    plotShape: 'square' as 'square' | 'rectangular' | 'irregular',
    entranceDirection: 'north',
    rooms: {
      bedroom: true,
      kitchen: true,
      livingRoom: true,
      bathroom: true,
      study: false,
      dining: false,
      prayer: false,
      storage: false
    }
  });

  const handleAnalyze = async () => {
    await refreshVastuData(propertyDetails);
  };

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
        <h3 className="text-red-300 font-semibold mb-2">Error Loading Vastu Data</h3>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => handleAnalyze()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">🏠 Vastu Shastra Analysis</h2>
        <p className="text-slate-300">
          Ancient Indian science of architecture and space harmony
        </p>
      </div>

      {/* Property Input Form */}
      {!vastuData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Property Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Property Type</label>
              <select
                value={propertyDetails.propertyType}
                onChange={(e) => setPropertyDetails(prev => ({ ...prev, propertyType: e.target.value as any }))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="office">Office</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Plot Shape</label>
              <select
                value={propertyDetails.plotShape}
                onChange={(e) => setPropertyDetails(prev => ({ ...prev, plotShape: e.target.value as any }))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="square">Square</option>
                <option value="rectangular">Rectangular</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Entrance Direction</label>
              <select
                value={propertyDetails.entranceDirection}
                onChange={(e) => setPropertyDetails(prev => ({ ...prev, entranceDirection: e.target.value }))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="northeast">Northeast</option>
                <option value="northwest">Northwest</option>
                <option value="southeast">Southeast</option>
                <option value="southwest">Southwest</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-3">Rooms</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(propertyDetails.rooms).map(([room, hasRoom]) => (
                <label key={room} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasRoom}
                    onChange={(e) => setPropertyDetails(prev => ({
                      ...prev,
                      rooms: { ...prev.rooms, [room]: e.target.checked }
                    }))}
                    className="rounded border-slate-600 bg-slate-700/50 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-slate-300 text-sm capitalize">{room.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleAnalyze}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🏠 Analyze Vastu
            </button>
          </div>
        </motion.div>
      )}

      {vastuData && (
        <>
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Vastu Score</h3>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-purple-500 mb-4">
                <span className="text-2xl font-bold text-white">{vastuData.overallScore}</span>
              </div>
              <p className="text-slate-300">
                {vastuData.overallScore >= 80 ? 'Excellent Vastu harmony' :
                 vastuData.overallScore >= 60 ? 'Good Vastu balance' :
                 vastuData.overallScore >= 40 ? 'Moderate Vastu issues' :
                 'Significant Vastu corrections needed'}
              </p>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
            {[
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
            {activeSection === 'analysis' && <VastuAnalysisSection vastuData={vastuData} />}
            {activeSection === 'remedies' && <VastuRemediesSection vastuData={vastuData} />}
            {activeSection === 'coaching' && <VastuCoachingSection vastuData={vastuData} />}
          </div>
        </>
      )}
    </div>
  );
}

function VastuAnalysisSection({ vastuData }: { vastuData: VastuReading }) {
  return (
    <div className="space-y-6">
      {/* Directions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Compass className="w-5 h-5 mr-2 text-purple-400" />
          Directional Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vastuData.directions.map((direction) => (
            <div
              key={direction.name}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{direction.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  direction.strength === 'strong' ? 'bg-green-600 text-white' :
                  direction.strength === 'moderate' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {direction.strength}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Element:</span>
                  <span className="text-white">{direction.element}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deity:</span>
                  <span className="text-white">{direction.deity}</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  {direction.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rooms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Home className="w-5 h-5 mr-2 text-purple-400" />
          Room Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vastuData.rooms.map((room) => (
            <div
              key={room.name}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{room.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  room.status === 'optimal' ? 'bg-green-600 text-white' :
                  room.status === 'good' ? 'bg-blue-600 text-white' :
                  room.status === 'warning' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {room.status}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ideal:</span>
                  <span className="text-white">{room.idealDirection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current:</span>
                  <span className="text-white">{room.currentDirection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Score:</span>
                  <span className="text-white">{room.energyScore}%</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  {room.recommendations[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Doshas */}
      {vastuData.doshas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-400" />
            Vastu Doshas
          </h3>
          <div className="space-y-4">
            {vastuData.doshas.map((dosha, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white capitalize">{dosha.type} Dosha</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    dosha.priority === 'high' ? 'bg-red-600 text-white' :
                    dosha.priority === 'medium' ? 'bg-yellow-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {dosha.priority} priority
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

      {/* Energy Flows */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-400" />
          Energy Flow Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vastuData.energyFlows.map((flow) => (
            <div
              key={flow.direction}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{flow.direction}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  flow.flow === 'positive' ? 'bg-green-600 text-white' :
                  flow.flow === 'neutral' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {flow.flow}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Element:</span>
                  <span className="text-white">{flow.element}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Strength:</span>
                  <span className="text-white">{flow.strength}%</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  {flow.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function VastuRemediesSection({ vastuData }: { vastuData: VastuReading }) {
  return (
    <div className="space-y-6">
      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-400" />
          Priority Recommendations
        </h3>
        <div className="space-y-4">
          {vastuData.recommendations
            .sort((a, b) => a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0)
            .map((rec, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{rec.title}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-600 text-white' :
                  rec.priority === 'medium' ? 'bg-yellow-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {rec.priority} priority
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-3">{rec.description}</p>
              <div className="text-slate-400 text-xs mb-2">
                <strong>Timeline:</strong> {rec.timeline}
              </div>
              <div className="text-slate-400 text-xs">
                <strong>Expected Benefits:</strong> {rec.expectedBenefits.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Remedies by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Gem className="w-5 h-5 mr-2 text-purple-400" />
          Remedies by Category
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Structural Remedies */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">🏗️ Structural Remedies</h4>
            <div className="space-y-2">
              {vastuData.remedies.structural.map((remedy, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{remedy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Elemental Remedies */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">🌪️ Elemental Remedies</h4>
            <div className="space-y-2">
              {vastuData.remedies.elemental.map((remedy, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{remedy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Directional Remedies */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">🧭 Directional Remedies</h4>
            <div className="space-y-2">
              {vastuData.remedies.directional.map((remedy, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{remedy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lifestyle Remedies */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">🌱 Lifestyle Remedies</h4>
            <div className="space-y-2">
              {vastuData.remedies.lifestyle.map((remedy, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{remedy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function VastuCoachingSection({ vastuData }: { vastuData: VastuReading }) {
  return (
    <div className="space-y-6">
      {/* Current Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-400" />
          Current Focus
        </h3>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <p className="text-white leading-relaxed">{vastuData.coaching.currentFocus}</p>
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
          {vastuData.coaching.recommendations.map((recommendation, index) => (
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
          <Star className="w-5 h-5 mr-2 text-purple-400" />
          Daily Affirmations
        </h3>
        <div className="space-y-3">
          {vastuData.coaching.affirmations.map((affirmation, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-yellow-400 mt-0.5" />
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
          <Zap className="w-5 h-5 mr-2 text-purple-400" />
          Next Steps
        </h3>
        <div className="space-y-3">
          {vastuData.coaching.nextSteps.map((step, index) => (
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