"use client"

import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger'
import { safeCopyToClipboard } from '@/lib/safeClipboard'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp,
  TrendingDown,
  Info,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react'
import { ModalPortal } from '@/components/ui/ModalPortal'
import { VedicPlanetaryPosition } from '@/lib/firestoreSchemas'
import { getPlanetEmoji, getSignEmoji, formatDegree } from '@/lib/vedicDataNormalizer'

interface Transit {
  planet: string
  currentSign: string
  currentDegree: number
  currentHouse: number
  nextSign: string
  nextDegree: number
  nextHouse: number
  transitDate: string
  duration: string
  effects: string[]
  significance: 'positive' | 'negative' | 'neutral'
  intensity: 'low' | 'moderate' | 'high' | 'very_high'
}

interface TransitsOverlayProps {
  natalPlanets: VedicPlanetaryPosition[]
  transits?: any[] // Raw transit data from API
  className?: string
}

const TRANSIT_COLORS = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mars: '#FF4500',
  Mercury: '#32CD32',
  Jupiter: '#4169E1',
  Venus: '#FF69B4',
  Saturn: '#8B4513',
  Rahu: '#800080',
  Ketu: '#2F4F4F'
}

const TRANSIT_EFFECTS = {
  Sun: {
    positive: ['Leadership opportunities', 'Recognition', 'Authority'],
    negative: ['Ego conflicts', 'Health issues', 'Power struggles'],
    neutral: ['Self-expression', 'Identity', 'Vitality']
  },
  Moon: {
    positive: ['Emotional growth', 'Popularity', 'Intuition'],
    negative: ['Mood swings', 'Anxiety', 'Emotional instability'],
    neutral: ['Emotions', 'Mind', 'Public image']
  },
  Mars: {
    positive: ['Energy boost', 'Courage', 'Achievement'],
    negative: ['Anger', 'Accidents', 'Conflicts'],
    neutral: ['Action', 'Motivation', 'Physical energy']
  },
  Mercury: {
    positive: ['Communication', 'Learning', 'Business success'],
    negative: ['Miscommunication', 'Nervousness', 'Technical issues'],
    neutral: ['Communication', 'Learning', 'Travel']
  },
  Jupiter: {
    positive: ['Wisdom', 'Growth', 'Good fortune'],
    negative: ['Overconfidence', 'Excess', 'Legal issues'],
    neutral: ['Expansion', 'Philosophy', 'Higher learning']
  },
  Venus: {
    positive: ['Love', 'Beauty', 'Art', 'Pleasure'],
    negative: ['Luxury', 'Indulgence', 'Relationship issues'],
    neutral: ['Relationships', 'Beauty', 'Art', 'Money']
  },
  Saturn: {
    positive: ['Discipline', 'Hard work', 'Long-term gains'],
    negative: ['Delays', 'Obstacles', 'Depression'],
    neutral: ['Discipline', 'Structure', 'Time']
  },
  Rahu: {
    positive: ['Material success', 'Innovation', 'Foreign connections'],
    negative: ['Illusion', 'Addiction', 'Scandal'],
    neutral: ['Desires', 'Innovation', 'Technology']
  },
  Ketu: {
    positive: ['Spirituality', 'Detachment', 'Mysticism'],
    negative: ['Confusion', 'Loss', 'Isolation'],
    neutral: ['Spirituality', 'Detachment', 'Past life']
  }
}

export function TransitsOverlay({ 
  natalPlanets, 
  transits = [], 
  className = "" 
}: TransitsOverlayProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTransit, setSelectedTransit] = useState<Transit | null>(null)
  const [viewMode, setViewMode] = useState<'current' | 'upcoming' | 'all'>('current')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // milliseconds

  // Process transit data
  const processedTransits: Transit[] = transits.map(transit => ({
    planet: transit.planet || transit.name,
    currentSign: transit.current_sign || transit.sign,
    currentDegree: parseFloat(transit.current_degree || transit.degree || 0),
    currentHouse: parseInt(transit.current_house || transit.house || 1),
    nextSign: transit.next_sign || transit.sign,
    nextDegree: parseFloat(transit.next_degree || transit.degree || 0),
    nextHouse: parseInt(transit.next_house || transit.house || 1),
    transitDate: transit.transit_date || transit.date || new Date().toISOString(),
    duration: transit.duration || 'Unknown',
    effects: transit.effects || [],
    significance: transit.significance || 'neutral',
    intensity: transit.intensity || 'moderate'
  }))

  // Filter transits based on view mode
  const filteredTransits = processedTransits.filter(transit => {
    const transitDate = new Date(transit.transitDate)
    const now = new Date()
    
    switch (viewMode) {
      case 'current':
        return transitDate <= now
      case 'upcoming':
        return transitDate > now
      case 'all':
        return true
      default:
        return true
    }
  })

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDate(prev => {
          const newDate = new Date(prev)
          newDate.setDate(newDate.getDate() + 1)
          return newDate
        })
      }, playbackSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed])

  // Calculate transit progress
  const getTransitProgress = (transit: Transit) => {
    const transitDate = new Date(transit.transitDate)
    const now = new Date()
    
    if (now < transitDate) return 0
    
    // Calculate based on planet's orbital period
    const orbitalPeriods: Record<string, number> = {
      Sun: 365,
      Moon: 28,
      Mars: 687,
      Mercury: 88,
      Jupiter: 4333,
      Venus: 225,
      Saturn: 10759,
      Rahu: 6793,
      Ketu: 6793
    }
    
    const period = orbitalPeriods[transit.planet] || 365
    const elapsed = (now.getTime() - transitDate.getTime()) / (1000 * 60 * 60 * 24)
    const progress = (elapsed / period) * 100
    
    return Math.min(progress, 100)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get significance color
  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      case 'neutral': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  // Get intensity color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'text-gray-400'
      case 'moderate': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'very_high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Handle download
  const handleDownload = () => {
    const data = {
      transits: processedTransits,
      currentDate: currentDate.toISOString(),
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transits-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Transit Analysis',
          text: 'Check out my current planetary transits and their effects',
          url: window.location.href
        })
      } catch (error) {
        devLog.debug('Error sharing:', error)
      }
    } else {
      await safeCopyToClipboard(window.location.href)
    }
  }

  if (processedTransits.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🌌</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Transit Data Available</h3>
          <p className="text-gray-300">
            Transit information will be generated when you create your Vedic report.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gold-glow flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Planetary Transits
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-gray-300 hover:text-white"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-gray-300 hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">View:</span>
              <Button
                variant={viewMode === 'current' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('current')}
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                Current
              </Button>
              <Button
                variant={viewMode === 'upcoming' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('upcoming')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Upcoming
              </Button>
              <Button
                variant={viewMode === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('all')}
                className="text-xs"
              >
                <Star className="w-3 h-3 mr-1" />
                All
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Date:</span>
              <input
                type="date"
                value={currentDate.toISOString().split('T')[0]}
                onChange={(e) => setCurrentDate(new Date(e.target.value))}
                className="bg-white/5 border border-white/20 rounded px-2 py-1 text-white text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Playback:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-gray-300 hover:text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="text-gray-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Date Display */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Current Date</h3>
                  <p className="text-sm text-gray-300">{currentDate.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">
                  {filteredTransits.length} transits
                </div>
                <div className="text-xs text-gray-400">
                  {viewMode} view
                </div>
              </div>
            </div>
          </div>

          {/* Transits List */}
          <div className="space-y-4">
            {filteredTransits.map((transit, index) => (
              <motion.div
                key={`${transit.planet}-${transit.transitDate}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedTransit?.planet === transit.planet && selectedTransit?.transitDate === transit.transitDate
                    ? 'bg-white/10 border-amber-400' 
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                }`}
                onClick={() => setSelectedTransit(transit)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlanetEmoji(transit.planet)}</span>
                    <div>
                      <h4 className="font-semibold text-white">{transit.planet} Transit</h4>
                      <p className="text-sm text-gray-300">
                        {getSignEmoji(transit.currentSign)} {transit.currentSign} → {getSignEmoji(transit.nextSign)} {transit.nextSign}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">
                      {formatDate(transit.transitDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSignificanceColor(transit.significance)}`}
                      >
                        {transit.significance}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getIntensityColor(transit.intensity)}`}
                      >
                        {transit.intensity}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(getTransitProgress(transit))}%</span>
                  </div>
                  <Progress 
                    value={getTransitProgress(transit)} 
                    className="h-2"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '--progress-background': TRANSIT_COLORS[transit.planet as keyof typeof TRANSIT_COLORS]
                    } as any}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">Current Position</h5>
                    <div className="text-sm text-gray-300">
                      <div>Sign: {getSignEmoji(transit.currentSign)} {transit.currentSign}</div>
                      <div>Degree: {formatDegree(transit.currentDegree)}</div>
                      <div>House: {transit.currentHouse}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">Next Position</h5>
                    <div className="text-sm text-gray-300">
                      <div>Sign: {getSignEmoji(transit.nextSign)} {transit.nextSign}</div>
                      <div>Degree: {formatDegree(transit.nextDegree)}</div>
                      <div>House: {transit.nextHouse}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transit Details Modal */}
      <ModalPortal open={!!selectedTransit}>
        <AnimatePresence>
          {selectedTransit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
              onClick={() => setSelectedTransit(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-2xl w-full max-w-[90vw] max-h-[min(90dvh,90vh)] overflow-y-auto z-[10001]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2 min-w-0">
                    {getPlanetEmoji(selectedTransit.planet)} {selectedTransit.planet} Transit
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTransit(null)}
                    className="min-w-[44px] min-h-[44px] text-gray-400 hover:text-white shrink-0"
                    aria-label="Close"
                  >
                    ×
                  </Button>
                </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-2">Current Position</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>Sign: {getSignEmoji(selectedTransit.currentSign)} {selectedTransit.currentSign}</div>
                      <div>Degree: {formatDegree(selectedTransit.currentDegree)}</div>
                      <div>House: {selectedTransit.currentHouse}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-2">Next Position</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>Sign: {getSignEmoji(selectedTransit.nextSign)} {selectedTransit.nextSign}</div>
                      <div>Degree: {formatDegree(selectedTransit.nextDegree)}</div>
                      <div>House: {selectedTransit.nextHouse}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Effects</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">Positive</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {TRANSIT_EFFECTS[selectedTransit.planet as keyof typeof TRANSIT_EFFECTS]?.positive.map(effect => (
                          <Badge key={effect} variant="outline" className="text-xs text-green-400">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400">Challenges</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {TRANSIT_EFFECTS[selectedTransit.planet as keyof typeof TRANSIT_EFFECTS]?.negative.map(effect => (
                          <Badge key={effect} variant="outline" className="text-xs text-red-400">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Transit Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <span className="text-gray-400">Date:</span>
                      <div className="text-white">{formatDate(selectedTransit.transitDate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <div className="text-white">{selectedTransit.duration}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Significance:</span>
                      <div className={`${getSignificanceColor(selectedTransit.significance)}`}>
                        {selectedTransit.significance}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Intensity:</span>
                      <div className={`${getIntensityColor(selectedTransit.intensity)}`}>
                        {selectedTransit.intensity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </div>
  )
}

export default TransitsOverlay


