"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Sun, 
  Moon, 
  Target,
  Heart,
  Brain,
  Zap,
  Compass,
  Loader2,
  Sparkles
} from "lucide-react"
import { useWesternAstrology } from "@/hooks/use-western-astrology"

export const WesternAstrologyTool = () => {
  const { data, loading, error, analyze } = useWesternAstrology()
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    latitude: "",
    longitude: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.birthDate || !formData.birthTime || !formData.birthPlace) {
      return
    }
    
    await analyze({
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthPlace: formData.birthPlace,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-600 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Birth Information
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Birth Date
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Birth Time
              </label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => handleInputChange('birthTime', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Place
            </label>
            <input
              type="text"
              value={formData.birthPlace}
              onChange={(e) => handleInputChange('birthPlace', e.target.value)}
              placeholder="e.g., New York, NY, USA"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="e.g., 40.7128"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Longitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="e.g., -74.0060"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Chart...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Western Astrology Chart
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Results */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500/50 rounded-lg p-4"
        >
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Core Signs */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              Core Signs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">Sun Sign</div>
                <div className="text-lg font-semibold text-white">{data.sunSign}</div>
                <div className="text-xs text-gray-500 mt-1">{data.sunSignDates}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Moon className="w-8 h-8 text-silver-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">Moon Sign</div>
                <div className="text-lg font-semibold text-white">{data.moonSign}</div>
                <div className="text-xs text-gray-500 mt-1">{data.moonSignDates}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Compass className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">Rising Sign</div>
                <div className="text-lg font-semibold text-white">{data.risingSign}</div>
                <div className="text-xs text-gray-500 mt-1">{data.risingSignDates}</div>
              </div>
            </div>
          </div>

          {/* Elemental Balance */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Elemental Balance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="font-semibold text-white">Fire</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{data.elementalBalance.fire}%</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="font-semibold text-white">Earth</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{data.elementalBalance.earth}%</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="font-semibold text-white">Air</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{data.elementalBalance.air}%</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="font-semibold text-white">Water</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{data.elementalBalance.water}%</div>
              </div>
            </div>
          </div>

          {/* Planetary Positions */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Planetary Positions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.planetaryPositions.map((planet, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{planet.name}</span>
                    <span className="text-sm text-gray-400">{planet.sign}</span>
                  </div>
                  <div className="text-sm text-gray-300">{planet.degree}° {planet.sign}</div>
                  <div className="text-xs text-gray-500 mt-1">{planet.house} House</div>
                </div>
              ))}
            </div>
          </div>

          {/* Personality Analysis */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Personality Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Core Personality</h4>
                <p className="text-gray-300">{data.personalityAnalysis.corePersonality}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Strengths</h4>
                <p className="text-gray-300">{data.personalityAnalysis.strengths}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Challenges</h4>
                <p className="text-gray-300">{data.personalityAnalysis.challenges}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Life Path</h4>
                <p className="text-gray-300">{data.personalityAnalysis.lifePath}</p>
              </div>
            </div>
          </div>

          {/* Current Transits */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-400" />
              Current Transits
            </h3>
            <div className="space-y-3">
              {data.currentTransits.map((transit, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{transit.planet} → {transit.aspect}</span>
                    <span className="text-sm text-gray-400">{transit.orb}° orb</span>
                  </div>
                  <p className="text-sm text-gray-300">{transit.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 