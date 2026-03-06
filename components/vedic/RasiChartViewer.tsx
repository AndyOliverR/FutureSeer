"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Share2, 
  Info,
  Star,
  MapPin,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { ModalPortal } from '@/components/ui/ModalPortal'
import { safeCopyToClipboard } from '@/lib/safeClipboard'
import { VedicChart, VedicPlanetaryPosition, VedicHouse } from '@/lib/firestoreSchemas'
import { getPlanetEmoji, getSignEmoji, formatDegree } from '@/lib/vedicDataNormalizer'
import { devLog } from '@/lib/devLogger'

interface RasiChartViewerProps {
  chart: VedicChart
  planets: VedicPlanetaryPosition[]
  houses: VedicHouse[]
  className?: string
}

export function RasiChartViewer({ 
  chart, 
  planets, 
  houses, 
  className = "" 
}: RasiChartViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showPlanets, setShowPlanets] = useState(true)
  const [showHouses, setShowHouses] = useState(true)
  const [showDegrees, setShowDegrees] = useState(true)
  const [showRetrograde, setShowRetrograde] = useState(true)
  const [showNakshatras, setShowNakshatras] = useState(false)
  const [selectedPlanet, setSelectedPlanet] = useState<VedicPlanetaryPosition | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(600)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 600
      setContainerWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Chart dimensions: responsive to container, cap at 600, floor at 320 for narrow viewports
  const baseSize = Math.min(600, Math.max(320, containerWidth))
  const chartSize = baseSize * zoomLevel

  // Handle zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoomLevel(1)
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Handle planet click
  const handlePlanetClick = (planet: VedicPlanetaryPosition) => {
    setSelectedPlanet(planet)
  }

  // Generate chart SVG
  const generateChartSVG = () => {
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = chartSize * 0.4

    let svg = `
      <svg width="${chartSize}" height="${chartSize}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .chart-text { font-family: Arial, sans-serif; font-size: ${12 * zoomLevel}px; fill: #ffffff; }
            .house-text { font-family: Arial, sans-serif; font-size: ${14 * zoomLevel}px; fill: #ffd700; font-weight: bold; }
            .planet-text { font-family: Arial, sans-serif; font-size: ${10 * zoomLevel}px; fill: #ffffff; }
            .sign-text { font-family: Arial, sans-serif; font-size: ${11 * zoomLevel}px; fill: #ffffff; }
            .degree-text { font-family: Arial, sans-serif; font-size: ${8 * zoomLevel}px; fill: #cccccc; }
            .nakshatra-text { font-family: Arial, sans-serif; font-size: ${7 * zoomLevel}px; fill: #ff6b6b; }
            .retrograde-text { font-family: Arial, sans-serif; font-size: ${8 * zoomLevel}px; fill: #ff4757; font-weight: bold; }
          </style>
        </defs>
        
        <!-- Background -->
        <rect width="${chartSize}" height="${chartSize}" fill="#1a1a2e" stroke="#ffd700" stroke-width="${2 * zoomLevel}"/>
        
        <!-- Title -->
        <text x="${centerX}" y="${30 * zoomLevel}" text-anchor="middle" class="house-text">Rasi Chart (Birth Chart)</text>
    `

    // Draw outer circle
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#ffd700" stroke-width="${2 * zoomLevel}"/>`

    // Draw house divisions
    if (showHouses) {
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30) - 90 // Start from top
        const x1 = centerX + radius * Math.cos(angle * Math.PI / 180)
        const y1 = centerY + radius * Math.sin(angle * Math.PI / 180)
        const x2 = centerX + radius * Math.cos((angle + 30) * Math.PI / 180)
        const y2 = centerY + radius * Math.sin((angle + 30) * Math.PI / 180)

        // House line
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${x1}" y2="${y1}" stroke="#ffd700" stroke-width="${1 * zoomLevel}"/>`
        
        // House number
        const houseAngle = angle + 15
        const houseX = centerX + (radius * 0.7) * Math.cos(houseAngle * Math.PI / 180)
        const houseY = centerY + (radius * 0.7) * Math.sin(houseAngle * Math.PI / 180)
        svg += `<text x="${houseX}" y="${houseY}" text-anchor="middle" class="house-text">${i + 1}</text>`
      }
    }

    // Draw planets
    if (showPlanets) {
      planets.forEach(planet => {
        const planetPosition = getPlanetPosition(planet, centerX, centerY, radius)
        const planetEmoji = getPlanetEmoji(planet.planet)
        const signEmoji = getSignEmoji(planet.sign)
        
        svg += `
          <g>
            <circle cx="${planetPosition.x}" cy="${planetPosition.y}" r="${15 * zoomLevel}" fill="#1a1a2e" stroke="#ffd700" stroke-width="${1 * zoomLevel}"/>
            <text x="${planetPosition.x}" y="${planetPosition.y + 5 * zoomLevel}" text-anchor="middle" class="planet-text">${planetEmoji}</text>
            <text x="${planetPosition.x}" y="${planetPosition.y + 20 * zoomLevel}" text-anchor="middle" class="planet-text">${planet.planet}</text>
        `
        
        if (showDegrees) {
          svg += `<text x="${planetPosition.x}" y="${planetPosition.y + 35 * zoomLevel}" text-anchor="middle" class="degree-text">${formatDegree(planet.degree)}</text>`
        }
        
        if (showRetrograde && planet.isRetrograde) {
          svg += `<text x="${planetPosition.x + 20 * zoomLevel}" y="${planetPosition.y - 10 * zoomLevel}" class="retrograde-text">R</text>`
        }
        
        if (showNakshatras) {
          svg += `<text x="${planetPosition.x}" y="${planetPosition.y + 50 * zoomLevel}" text-anchor="middle" class="nakshatra-text">${planet.nakshatra}</text>`
        }
        
        svg += `</g>`
      })
    }

    svg += '</svg>'
    return svg
  }

  // Get planet position in chart
  const getPlanetPosition = (
    planet: VedicPlanetaryPosition,
    centerX: number,
    centerY: number,
    radius: number
  ): { x: number; y: number } => {
    // Calculate position based on house and degree
    const houseAngle = ((planet.house - 1) * 30) - 90 // Start from top
    const degreeInHouse = planet.degree % 30
    const angle = houseAngle + (degreeInHouse * 30 / 30)
    
    const x = centerX + radius * Math.cos(angle * Math.PI / 180)
    const y = centerY + radius * Math.sin(angle * Math.PI / 180)
    
    return { x, y }
  }

  // Handle download
  const handleDownload = () => {
    const svg = generateChartSVG()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rasi-chart-${new Date().toISOString().split('T')[0]}.svg`
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
          title: 'My Rasi Chart',
          text: 'Check out my Vedic birth chart',
          url: window.location.href
        })
      } catch (error) {
        devLog.error('Error sharing', error, 'RasiChartViewer')
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
              <Star className="w-6 h-6" />
              Rasi Chart Viewer
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-300 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Zoom:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="text-gray-300 hover:text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-white min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="text-gray-300 hover:text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-gray-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
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
                variant={showHouses ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHouses(!showHouses)}
                className="text-xs"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Houses
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
              <Button
                variant={showRetrograde ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRetrograde(!showRetrograde)}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Retrograde
              </Button>
              <Button
                variant={showNakshatras ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNakshatras(!showNakshatras)}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Nakshatras
              </Button>
            </div>
          </div>

          {/* Chart Display */}
          <div ref={containerRef} className="w-full max-w-[600px] mx-auto flex justify-center min-w-0">
            <div
              ref={chartRef}
              className="relative overflow-hidden rounded-lg border border-white/20 shrink-0"
              style={{ width: chartSize, height: chartSize }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: generateChartSVG() }}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Chart Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">Ayanamsa:</span>
                <span className="text-white">{chart.metadata.ayanamsa}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">House System:</span>
                <span className="text-white">{chart.metadata.houseSystem}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">Planets:</span>
                <span className="text-white">{planets.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">Generated:</span>
                <span className="text-white">
                  {new Date(chart.metadata.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planet Details Modal */}
      <ModalPortal open={!!selectedPlanet}>
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
              onClick={() => setSelectedPlanet(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-md w-full max-w-[90vw] max-h-[min(90dvh,90vh)] overflow-y-auto z-[10001]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2 min-w-0">
                    {getPlanetEmoji(selectedPlanet.planet)} {selectedPlanet.planet}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlanet(null)}
                    className="min-w-[44px] min-h-[44px] text-gray-400 hover:text-white shrink-0"
                    aria-label="Close"
                  >
                    ×
                  </Button>
                </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Sign:</span>
                  <span className="text-white">{getSignEmoji(selectedPlanet.sign)} {selectedPlanet.sign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Degree:</span>
                  <span className="text-white">{formatDegree(selectedPlanet.degree)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">House:</span>
                  <span className="text-white">{selectedPlanet.house}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Nakshatra:</span>
                  <span className="text-white">{selectedPlanet.nakshatra}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Nakshatra Lord:</span>
                  <span className="text-white">{selectedPlanet.nakshatraLord}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Retrograde:</span>
                  <span className="text-white">{selectedPlanet.isRetrograde ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Exalted:</span>
                  <span className="text-white">{selectedPlanet.isExalted ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Debilitated:</span>
                  <span className="text-white">{selectedPlanet.isDebilitated ? 'Yes' : 'No'}</span>
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

export default RasiChartViewer

