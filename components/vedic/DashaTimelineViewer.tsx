"use client"

import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
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
  Share2
} from 'lucide-react'
import { VedicDasha } from '@/lib/firestoreSchemas'
import { getPlanetEmoji } from '@/lib/vedicDataNormalizer'

interface DashaTimelineViewerProps {
  dashas: VedicDasha[]
  className?: string
}

const DASHA_COLORS = {
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

const DASHA_EFFECTS = {
  Sun: { positive: ['Leadership', 'Authority', 'Success'], negative: ['Ego issues', 'Health problems'] },
  Moon: { positive: ['Emotional growth', 'Intuition', 'Popularity'], negative: ['Mood swings', 'Anxiety'] },
  Mars: { positive: ['Energy', 'Courage', 'Achievement'], negative: ['Anger', 'Accidents', 'Conflicts'] },
  Mercury: { positive: ['Communication', 'Learning', 'Business'], negative: ['Nervousness', 'Miscommunication'] },
  Jupiter: { positive: ['Wisdom', 'Growth', 'Good fortune'], negative: ['Overconfidence', 'Excess'] },
  Venus: { positive: ['Love', 'Beauty', 'Art', 'Pleasure'], negative: ['Luxury', 'Indulgence', 'Relationships'] },
  Saturn: { positive: ['Discipline', 'Hard work', 'Long-term gains'], negative: ['Delays', 'Obstacles', 'Depression'] },
  Rahu: { positive: ['Material success', 'Innovation', 'Foreign connections'], negative: ['Illusion', 'Addiction', 'Scandal'] },
  Ketu: { positive: ['Spirituality', 'Detachment', 'Mysticism'], negative: ['Confusion', 'Loss', 'Isolation'] }
}

export function DashaTimelineViewer({ 
  dashas, 
  className = "" 
}: DashaTimelineViewerProps) {
  const [currentDashaIndex, setCurrentDashaIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // milliseconds
  const [selectedDasha, setSelectedDasha] = useState<VedicDasha | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'calendar'>('timeline')

  // Filter dashas by type
  const mahadashas = dashas.filter(d => d.dashaType === 'mahadasha')
  const antardashas = dashas.filter(d => d.dashaType === 'antardasha')
  const pratyantardashas = dashas.filter(d => d.dashaType === 'pratyantardasha')

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && mahadashas.length > 0) {
      interval = setInterval(() => {
        setCurrentDashaIndex(prev => 
          prev === mahadashas.length - 1 ? 0 : prev + 1
        )
      }, playbackSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, mahadashas.length])

  // Find current dasha based on current date
  useEffect(() => {
    const now = new Date()
    const currentDasha = mahadashas.find(dasha => {
      const startDate = new Date(dasha.startDate)
      const endDate = new Date(dasha.endDate)
      return now >= startDate && now <= endDate
    })
    
    if (currentDasha) {
      const index = mahadashas.findIndex(d => d.planet === currentDasha.planet)
      if (index !== -1) {
        setCurrentDashaIndex(index)
      }
    }
  }, [mahadashas])

  const currentDasha = mahadashas[currentDashaIndex]
  const currentAntardashas = antardashas.filter(a => 
    a.startDate >= currentDasha?.startDate && a.endDate <= currentDasha?.endDate
  )

  // Calculate dasha progress
  const getDashaProgress = (dasha: VedicDasha) => {
    const now = new Date()
    const startDate = new Date(dasha.startDate)
    const endDate = new Date(dasha.endDate)
    
    if (now < startDate) return 0
    if (now > endDate) return 100
    
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()
    return (elapsed / totalDuration) * 100
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate duration
  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 365) {
      return `${diffDays} days`
    } else {
      const years = Math.floor(diffDays / 365)
      const months = Math.floor((diffDays % 365) / 30)
      return `${years}y ${months}m`
    }
  }

  // Handle download
  const handleDownload = () => {
    const data = {
      dashas: dashas,
      generatedAt: new Date().toISOString(),
      currentDasha: currentDasha
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dasha-timeline-${new Date().toISOString().split('T')[0]}.json`
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
          title: 'My Dasha Timeline',
          text: `Check out my Vedic dasha timeline - currently in ${currentDasha?.planet} dasha`,
          url: window.location.href
        })
      } catch (error) {
        devLog.debug('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (dashas.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Dasha Data Available</h3>
          <p className="text-gray-300">
            Dasha information will be generated when you create your Vedic report.
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
              <Calendar className="w-6 h-6" />
              Dasha Timeline
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
                variant={viewMode === 'timeline' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('timeline')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Timeline
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="text-xs"
              >
                <Star className="w-3 h-3 mr-1" />
                Calendar
              </Button>
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
                onClick={() => setCurrentDashaIndex(0)}
                className="text-gray-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Dasha Display */}
          {currentDasha && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlanetEmoji(currentDasha.planet)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{currentDasha.planet} Dasha</h3>
                    <p className="text-sm text-gray-300">{currentDasha.duration}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: DASHA_COLORS[currentDasha.planet as keyof typeof DASHA_COLORS] }}
                >
                  {formatDate(currentDasha.startDate)} - {formatDate(currentDasha.endDate)}
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getDashaProgress(currentDasha))}%</span>
                </div>
                <Progress 
                  value={getDashaProgress(currentDasha)} 
                  className="h-2"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '--progress-background': DASHA_COLORS[currentDasha.planet as keyof typeof DASHA_COLORS]
                  } as any}
                />
              </div>
              
              <p className="text-sm text-gray-300">{currentDasha.description}</p>
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDashaIndex(Math.max(0, currentDashaIndex - 1))}
                  disabled={currentDashaIndex === 0}
                  className="text-gray-300 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {mahadashas.map((dasha, index) => (
                    <Button
                      key={dasha.planet}
                      variant={index === currentDashaIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentDashaIndex(index)}
                      className="text-xs"
                      style={{
                        backgroundColor: index === currentDashaIndex ? DASHA_COLORS[dasha.planet as keyof typeof DASHA_COLORS] : undefined,
                        color: index === currentDashaIndex ? '#000' : undefined
                      }}
                    >
                      {getPlanetEmoji(dasha.planet)} {dasha.planet}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDashaIndex(Math.min(mahadashas.length - 1, currentDashaIndex + 1))}
                  disabled={currentDashaIndex === mahadashas.length - 1}
                  className="text-gray-300 hover:text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Dasha Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3">Effects</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">Positive</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {DASHA_EFFECTS[currentDasha?.planet as keyof typeof DASHA_EFFECTS]?.positive.map(effect => (
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
                        {DASHA_EFFECTS[currentDasha?.planet as keyof typeof DASHA_EFFECTS]?.negative.map(effect => (
                          <Badge key={effect} variant="outline" className="text-xs text-red-400">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3">Antardashas</h4>
                  <div className="space-y-2">
                    {currentAntardashas.slice(0, 5).map(antardasha => (
                      <div key={antardasha.planet} className="flex items-center justify-between text-xs">
                        <span className="text-white">{getPlanetEmoji(antardasha.planet)} {antardasha.planet}</span>
                        <span className="text-gray-400">{getDuration(antardasha.startDate, antardasha.endDate)}</span>
                      </div>
                    ))}
                    {currentAntardashas.length > 5 && (
                      <div className="text-xs text-gray-400">
                        +{currentAntardashas.length - 5} more antardashas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {mahadashas.map((dasha, index) => (
                <div
                  key={dasha.planet}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    index === currentDashaIndex 
                      ? 'bg-white/10 border-amber-400' 
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                  onClick={() => setCurrentDashaIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getPlanetEmoji(dasha.planet)}</span>
                      <div>
                        <h4 className="font-semibold text-white">{dasha.planet} Dasha</h4>
                        <p className="text-sm text-gray-300">{dasha.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">
                        {formatDate(dasha.startDate)} - {formatDate(dasha.endDate)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(getDashaProgress(dasha))}% complete
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashaTimelineViewer


