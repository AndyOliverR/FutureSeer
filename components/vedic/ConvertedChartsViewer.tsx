"use client"

import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger'
import { safeCopyToClipboard } from '@/lib/safeClipboard'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Grid3X3, 
  Calendar, 
  Zap,
  Eye,
  Download,
  Share2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface ConvertedChart {
  svg: string;
  metadata: any;
  type: string;
  description: string;
}

interface ConvertedChartsData {
  northIndian?: ConvertedChart;
  southIndian?: ConvertedChart;
  nakshatraWheel?: ConvertedChart;
}

interface ConvertedChartsViewerProps {
  westernChartData?: any;
  convertedCharts?: any;
  realAstroAppData?: any;
  className?: string;
}

const CHART_TYPES = [
  { 
    id: 'northIndian', 
    label: 'North Indian Chart', 
    icon: Grid3X3, 
    description: 'Traditional North Indian square format chart',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'southIndian', 
    label: 'South Indian Chart', 
    icon: Star, 
    description: 'Traditional South Indian diamond format chart',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'nakshatraWheel', 
    label: 'Nakshatra Wheel', 
    icon: Calendar, 
    description: 'Nakshatra wheel with 27 lunar mansions',
    color: 'from-purple-500 to-pink-500'
  }
]

export function ConvertedChartsViewer({ 
  westernChartData,
  convertedCharts,
  realAstroAppData,
  className = "" 
}: ConvertedChartsViewerProps) {
  const [activeChart, setActiveChart] = useState('northIndian')
  const [localConvertedCharts, setLocalConvertedCharts] = useState<ConvertedChartsData | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Use real AstroApp converted charts or convert if needed
  useEffect(() => {
    if (convertedCharts) {
      // Use the real AstroApp converted charts
      setLocalConvertedCharts(convertedCharts)
      setIsConverting(false)
      setError(null)
      devLog.debug('✅ Using real AstroApp converted charts:', convertedCharts)
    } else if (westernChartData && !convertedCharts && !isConverting) {
      // Fallback: convert charts if no converted charts provided
      convertCharts()
    }
  }, [westernChartData, convertedCharts])

  const convertCharts = async () => {
    if (!westernChartData) return

    setIsConverting(true)
    setError(null)

    try {
      devLog.debug('🔄 Converting Western chart to Vedic formats...')
      
      const response = await fetch('/api/tools/vedic/convert-charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          westernChartImageData: westernChartData,
          chartTypes: ['northIndian', 'southIndian', 'nakshatraWheel']
        })
      })

      if (!response.ok) {
        throw new Error('Failed to convert charts')
      }

      const result = await response.json()
      
      if (result.success) {
        setLocalConvertedCharts(result.charts)
        devLog.debug('✅ Charts converted successfully:', Object.keys(result.charts))
      } else {
        throw new Error(result.error || 'Chart conversion failed')
      }
    } catch (err) {
      devLog.error('❌ Chart conversion error:', err, 'ConvertedChartsViewer')
      setError(err instanceof Error ? err.message : 'Failed to convert charts')
    } finally {
      setIsConverting(false)
    }
  }

  const handleChartChange = (chartId: string) => {
    setActiveChart(chartId)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleDownload = () => {
    const activeChartData = localConvertedCharts?.[activeChart as keyof ConvertedChartsData]
    if (!activeChartData) return

    const svg = activeChartData.svg
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeChart}-chart-${new Date().toISOString().split('T')[0]}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Vedic Chart',
          text: 'Check out my converted Vedic astrology chart',
          url: window.location.href
        })
      } catch (error) {
        devLog.debug('Error sharing:', error)
      }
    } else {
      await safeCopyToClipboard(window.location.href)
    }
  }

  const renderChartContent = () => {
    const activeChartData = localConvertedCharts?.[activeChart as keyof ConvertedChartsData]
    
    if (isConverting) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
            <p className="text-white font-semibold">Converting Charts...</p>
            <p className="text-slate-400 text-sm mt-2">Generating Vedic chart formats</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white font-semibold">Conversion Failed</p>
            <p className="text-slate-400 text-sm mt-2">{error}</p>
            <Button
              onClick={convertCharts}
              className="mt-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    if (!localConvertedCharts || !activeChartData) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-white font-semibold">No Charts Available</p>
            <p className="text-slate-400 text-sm mt-2">Charts will be generated when Western data is available</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Chart Display */}
        <div className="flex justify-center">
          <div 
            className="relative overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl"
            style={{ 
              borderRadius: '200px',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)'
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: activeChartData.svg }}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Chart Info */}
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300">Type:</span>
              <span className="text-white">{activeChartData.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300">Ayanamsa:</span>
              <span className="text-white">{activeChartData.metadata.ayanamsa}°</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300">Planets:</span>
              <span className="text-white">{activeChartData.metadata.planetsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300">Generated:</span>
              <span className="text-white">
                {new Date(activeChartData.metadata.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gold-glow flex items-center gap-2">
              <Star className="w-6 h-6" />
              Converted Vedic Charts
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-300 hover:text-white rounded-xl"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-gray-300 hover:text-white rounded-xl"
                disabled={!localConvertedCharts}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-gray-300 hover:text-white rounded-xl"
                disabled={!localConvertedCharts}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-300 hover:text-white rounded-xl"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Chart Type Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CHART_TYPES.map((chartType) => {
              const Icon = chartType.icon
              const isActive = activeChart === chartType.id
              const isAvailable = localConvertedCharts?.[chartType.id as keyof ConvertedChartsData]
              
              return (
                <Button
                  key={chartType.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChartChange(chartType.id)}
                  disabled={!isAvailable && !isConverting}
                  className={`flex items-center gap-2 rounded-xl ${
                    isActive 
                      ? `bg-gradient-to-r ${chartType.color} text-white` 
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {chartType.label}
                  {isAvailable && <CheckCircle className="w-3 h-3" />}
                </Button>
              )
            })}
          </div>

          {/* Chart Description */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {CHART_TYPES.find(type => type.id === activeChart)?.label}
                </h3>
                <p className="text-sm text-gray-300">
                  {CHART_TYPES.find(type => type.id === activeChart)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderChartContent()}
            </motion.div>
          </AnimatePresence>

        </CardContent>
      </Card>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-slate-800 border-l border-white/20 z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Chart Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white rounded-xl"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Display Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    High border radius styling
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    FutureSeer branding
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Glow effects
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Chart Types</h4>
                <div className="space-y-2">
                  {CHART_TYPES.map((type) => (
                    <label key={type.id} className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" defaultChecked className="rounded" />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs rounded-xl"
                    onClick={convertCharts}
                    disabled={isConverting}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate Charts
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-xl">
                    Export All Charts
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConvertedChartsViewer
