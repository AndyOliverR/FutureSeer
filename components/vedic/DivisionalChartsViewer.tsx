"use client"

import { useState } from 'react'
import { devLog } from '@/lib/devLogger';
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Download, 
  Share2, 
  Info,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Calendar,
  Clock,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react'
import { SouthIndianVedicChart } from '@/components/SouthIndianVedicChart'
import { VedicChart, VedicPlanetaryPosition } from '@/lib/firestoreSchemas'
import { getPlanetEmoji, getSignEmoji, formatDegree } from '@/lib/vedicDataNormalizer'
import { safeCopyToClipboard } from '@/lib/safeClipboard'

interface DivisionalChartsViewerProps {
  charts: VedicChart[]
  planets: VedicPlanetaryPosition[]
  className?: string
}

const DIVISIONAL_CHART_INFO: Record<string, any> = {
  // Uppercase with D prefix
  'D9': {
    name: 'D9 Navamsa',
    division: '9th Division',
    description: 'Shows spiritual inclinations, marriage, and inner nature',
    significance: 'Marriage, spirituality, inner self',
    icon: '🏛️'
  },
  'D10': {
    name: 'D10 Dasamsa',
    division: '10th Division',
    description: 'Shows career, profession, and social status',
    significance: 'Career, profession, social status',
    icon: '👑'
  },
  'D12': {
    name: 'D12 Dwadasamsa',
    division: '12th Division',
    description: 'Shows parents, ancestors, and past life influences',
    significance: 'Parents, ancestors, past life',
    icon: '👨‍👩‍👧‍👦'
  },
  'D30': {
    name: 'D30 Trimsamsa',
    division: '30th Division',
    description: 'Shows health, diseases, and physical constitution',
    significance: 'Health, diseases, physical body',
    icon: '🏥'
  },
  // Lowercase names as fallback
  'navamsa': {
    name: 'D9 Navamsa',
    division: '9th Division',
    description: 'Shows spiritual inclinations, marriage, and inner nature',
    significance: 'Marriage, spirituality, inner self',
    icon: '🏛️'
  },
  'dasamsa': {
    name: 'D10 Dasamsa',
    division: '10th Division',
    description: 'Shows career, profession, and social status',
    significance: 'Career, profession, social status',
    icon: '👑'
  },
  'dwadasamsa': {
    name: 'D12 Dwadasamsa',
    division: '12th Division',
    description: 'Shows parents, ancestors, and past life influences',
    significance: 'Parents, ancestors, past life',
    icon: '👨‍👩‍👧‍👦'
  },
  'trimsamsa': {
    name: 'D30 Trimsamsa',
    division: '30th Division',
    description: 'Shows health, diseases, and physical constitution',
    significance: 'Health, diseases, physical body',
    icon: '🏥'
  }
}

export function DivisionalChartsViewer({ 
  charts, 
  planets, 
  className = "" 
}: DivisionalChartsViewerProps) {
  const [currentChartIndex, setCurrentChartIndex] = useState(0)
  const [showPlanets, setShowPlanets] = useState(true)
  const [showDegrees, setShowDegrees] = useState(false)
  const [selectedChart, setSelectedChart] = useState<VedicChart | null>(null)

  // Filter divisional charts (exclude rasi)
  const divisionalCharts = charts.filter(chart => chart.chartType !== 'rasi')

  if (divisionalCharts.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Divisional Charts Available</h3>
          <p className="text-gray-300">
            Divisional charts will be generated when you create your Vedic report.
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentChart = divisionalCharts[currentChartIndex]

  // Add logging to see actual chartType
  devLog.debug('📊 Current chart:', currentChart)
  devLog.debug('📊 Chart type:', currentChart?.chartType)
  devLog.debug('📊 Available keys:', Object.keys(DIVISIONAL_CHART_INFO))

  const chartInfo = DIVISIONAL_CHART_INFO[currentChart?.chartType as keyof typeof DIVISIONAL_CHART_INFO] || {
    name: currentChart?.chartType || 'Divisional Chart',
    division: 'Divisional Chart',
    description: 'Divisional chart analysis',
    significance: 'Specific life area analysis',
    icon: '📊'
  }

  // Add fallback for undefined chartInfo
  if (!DIVISIONAL_CHART_INFO[currentChart?.chartType as keyof typeof DIVISIONAL_CHART_INFO]) {
    devLog.warn('⚠️ No chart info found for chartType:', currentChart?.chartType, 'DivisionalChartsViewer')
  }

  // Sign name to index (0-11) for South Indian chart
  const SIGN_INDEX: Record<string, number> = {
    Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
    Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
  };

  // Convert chart data for South Indian chart visualization
  const getChartForVisualization = (chart: VedicChart) => {
    // Transform planets to match SouthIndianVedicChart props format (sign must be number 0-11)
    const planets = chart.planets?.map((planet: VedicPlanetaryPosition) => {
      const signNum = typeof planet.sign === 'number'
        ? planet.sign
        : SIGN_INDEX[String(planet.sign).trim()] ?? 0;
      return {
        name: planet.planet.toLowerCase(),
        sign: signNum,
        degreeInSign: planet.degreeInSign || 0,
        isRetrograde: planet.dignity?.includes('R') || false
      };
    }) || [];

  return {
    planets,
    ascendantSign: chart.ascendant?.sign ?? 0,
    chartType: chart.chartType?.toUpperCase() || 'D1'  // Add safety check with fallback
  };
  };

  // Navigation functions
  const goToPrevious = () => {
    setCurrentChartIndex(prev => 
      prev === 0 ? divisionalCharts.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentChartIndex(prev => 
      prev === divisionalCharts.length - 1 ? 0 : prev + 1
    )
  }

  // Generate chart SVG
  const generateChartSVG = (chart: VedicChart) => {
    const size = 500
    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.4

    let svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .chart-text { font-family: Arial, sans-serif; font-size: 12px; fill: #0f172a; }
            .house-text { font-family: Arial, sans-serif; font-size: 14px; fill: #1e40af; font-weight: bold; }
            .planet-text { font-family: Arial, sans-serif; font-size: 10px; fill: #0f172a; }
            .degree-text { font-family: Arial, sans-serif; font-size: 8px; fill: #64748b; }
          </style>
        </defs>
        
        <!-- Background -->
        <rect width="${size}" height="${size}" fill="#ffffff" stroke="#3b82f6" stroke-width="2"/>
        
        <!-- Title -->
        <text x="${centerX}" y="30" text-anchor="middle" class="house-text">${chartInfo.name} Chart</text>
    `

    // Draw outer circle
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#3b82f6" stroke-width="2"/>`

    // Draw house divisions based on chart type
    const houseCount = getHouseCountForChart(chart.chartType)
    const angleStep = 360 / houseCount

    for (let i = 0; i < houseCount; i++) {
      const angle = (i * angleStep) - 90 // Start from top
      const x1 = centerX + radius * Math.cos(angle * Math.PI / 180)
      const y1 = centerY + radius * Math.sin(angle * Math.PI / 180)

      // House line
      svg += `<line x1="${centerX}" y1="${centerY}" x2="${x1}" y2="${y1}" stroke="#3b82f6" stroke-width="1"/>`
      
      // House number
      const houseAngle = angle + (angleStep / 2)
      const houseX = centerX + (radius * 0.7) * Math.cos(houseAngle * Math.PI / 180)
      const houseY = centerY + (radius * 0.7) * Math.sin(houseAngle * Math.PI / 180)
      svg += `<text x="${houseX}" y="${houseY}" text-anchor="middle" class="house-text">${i + 1}</text>`
    }

    // Draw planets if available
    if (showPlanets && chart.planets && chart.planets.length > 0) {
      chart.planets.forEach(planet => {
        const planetPosition = getPlanetPosition(planet, centerX, centerY, radius, houseCount)
        const planetEmoji = getPlanetEmoji(planet.planet)
        
        svg += `
          <g>
            <circle cx="${planetPosition.x}" cy="${planetPosition.y}" r="12" fill="#ffffff" stroke="#3b82f6" stroke-width="1"/>
            <text x="${planetPosition.x}" y="${planetPosition.y + 4}" text-anchor="middle" class="planet-text">${planetEmoji}</text>
            <text x="${planetPosition.x}" y="${planetPosition.y + 18}" text-anchor="middle" class="planet-text">${planet.planet}</text>
        `
        
        if (showDegrees) {
          svg += `<text x="${planetPosition.x}" y="${planetPosition.y + 32}" text-anchor="middle" class="degree-text">${formatDegree(planet.degree)}</text>`
        }
        
        svg += `</g>`
      })
    }

    svg += '</svg>'
    return svg
  }

  // Get house count for different chart types
  const getHouseCountForChart = (chartType: string): number => {
    switch (chartType) {
      case 'navamsa': return 9
      case 'dasamsa': return 10
      case 'dwadasamsa': return 12
      case 'trimsamsa': return 30
      default: return 12
    }
  }

  // Get planet position in chart
  const getPlanetPosition = (
    planet: VedicPlanetaryPosition,
    centerX: number,
    centerY: number,
    radius: number,
    houseCount: number
  ): { x: number; y: number } => {
    const houseAngle = ((planet.house - 1) * (360 / houseCount)) - 90
    const degreeInHouse = planet.degree % (360 / houseCount)
    const angle = houseAngle + (degreeInHouse * (360 / houseCount) / (360 / houseCount))
    
    const x = centerX + radius * Math.cos(angle * Math.PI / 180)
    const y = centerY + radius * Math.sin(angle * Math.PI / 180)
    
    return { x, y }
  }

  // Handle download
  const handleDownload = () => {
    const svg = generateChartSVG(currentChart)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentChart.chartType}-chart-${new Date().toISOString().split('T')[0]}.svg`
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
          title: `My ${chartInfo.name} Chart`,
          text: `Check out my Vedic ${chartInfo.name} chart`,
          url: window.location.href
        })
      } catch (error) {
        devLog.debug('Error sharing:', error)
      }
    } else {
      await safeCopyToClipboard(window.location.href)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gold-glow flex items-center gap-2">
              <Grid3X3 className="w-6 h-6" />
              Divisional Charts
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
          {/* Chart Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              className="text-gray-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {divisionalCharts.map((chart, index) => (
                <Button
                  key={chart.chartType}
                  variant={index === currentChartIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentChartIndex(index)}
                  className="text-xs"
                >
                  {DIVISIONAL_CHART_INFO[chart.chartType as keyof typeof DIVISIONAL_CHART_INFO]?.icon} {chart.chartType}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              className="text-gray-300 hover:text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Chart Info */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{chartInfo.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-white">{chartInfo.name}</h3>
                <p className="text-sm text-gray-300">{chartInfo.division}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-2">{chartInfo.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Significance:</span>
              <Badge variant="outline" className="text-xs">
                {chartInfo.significance}
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-300">Display:</span>
            <Button
              variant={showPlanets ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPlanets(!showPlanets)}
              className="text-xs"
            >
              <Star className="w-3 h-3 mr-1" />
              Planets
            </Button>
            <Button
              variant={showDegrees ? "default" : "outline"}
              size="sm"
              onClick={() => setShowDegrees(!showDegrees)}
              className="text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              Degrees
            </Button>
          </div>

          {/* Chart Display */}
          <div className="space-y-6">
            {/* SVG Chart */}
            <div className="flex justify-center">
              <div className="relative overflow-hidden rounded-lg border border-white/20">
                <div
                  dangerouslySetInnerHTML={{ __html: generateChartSVG(currentChart) }}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* South Indian Chart Component */}
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                {(() => {
                  const chartData = getChartForVisualization(currentChart);
                  return (
                    <SouthIndianVedicChart
                      planets={chartData.planets}
                      ascendantSign={chartData.ascendantSign}
                      chartType={chartData.chartType}
                    />
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Chart Details */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">Chart Type:</span>
                <span className="text-white">{chartInfo.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">Division:</span>
                <span className="text-white">{chartInfo.division}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">Houses:</span>
                <span className="text-white">{getHouseCountForChart(currentChart.chartType)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">Generated:</span>
                <span className="text-white">
                  {currentChart.metadata?.generatedAt 
                    ? new Date(currentChart.metadata.generatedAt).toLocaleDateString()
                    : 'Just now'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DivisionalChartsViewer


