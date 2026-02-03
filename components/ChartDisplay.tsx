/**
 * Chart Display Component
 * Displays astrological charts with loading states and error handling
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertTriangle, Eye } from 'lucide-react'

interface ChartDisplayProps {
  chartType: string
  name: string
  description: string
  significance: string
  imageUrl: string
}

export function ChartDisplay({ chartType, name, description, significance, imageUrl }: ChartDisplayProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullChart, setShowFullChart] = useState(false)

  useEffect(() => {
    fetchChartData()
  }, [imageUrl])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch chart: ${response.status}`)
      }
      
      // Check if response is SVG (legacy support)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('image/svg')) {
        const svgText = await response.text()
        setChartData({ svg: svgText, type: 'svg' })
      } else {
        // Handle JSON responses from VedAstro API
        const data = await response.json()
        
        // Check if this is a FutureSeer chart response
        if (data.source === 'FutureSeer AI-Powered Mystic' || data.status === 'success' || data.status === 'vedastro_api_unavailable' || data.status === 'vedastro_api_error') {
          // Check if we have real chart image from VedAstro
          if (data.chartImageUrl && data.hasRealChart) {
            setChartData({ 
              ...data, 
              type: 'realChart',
              imageUrl: data.chartImageUrl,
              chartType: chartType,
              name: name,
              description: description,
              significance: significance
            })
          } else {
            setChartData({ 
              ...data, 
              type: 'futureSeer',
              chartType: chartType,
              name: name,
              description: description,
              significance: significance
            })
          }
        } else {
          // Legacy data format
          setChartData(data)
        }
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chart')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchChartData()
  }

  const handleViewFullChart = () => {
    setShowFullChart(!showFullChart)
  }

  return (
    <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
      <CardContent className="p-6">
        {/* Chart Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-medium text-amber-300 text-lg">{name}</h4>
            <p className="text-slate-400 text-sm">{description}</p>
          </div>
          <Badge className="bg-amber-100/20 text-amber-300 border-amber-400/50">
            {chartType}
          </Badge>
        </div>

        {/* Chart Content */}
        <div className="mb-4">
          <div className="p-3 bg-slate-800/30 rounded-lg mb-4">
            <div className="text-amber-300 font-medium text-sm mb-1">Significance:</div>
            <p className="text-slate-300 text-sm">{significance}</p>
          </div>

          {/* Chart Image Container */}
          <div className="relative">
            {loading && (
              <div className="flex items-center justify-center h-48 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm">Loading {name}...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-48 bg-red-900/20 rounded-lg border-2 border-dashed border-red-600">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-300 text-sm mb-2">{error}</p>
                  <Button 
                    onClick={handleRefresh}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {chartData && !loading && !error && (
              <div className="space-y-4">
                {/* Chart Preview */}
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-amber-300 font-medium">Chart Preview</h5>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleViewFullChart}
                        size="sm"
                        variant="outline"
                        className="border-amber-400/50 text-amber-300 hover:bg-amber-500/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {showFullChart ? 'Hide' : 'View'} Full Chart
                      </Button>
                      <Button
                        onClick={handleRefresh}
                        size="sm"
                        variant="outline"
                        className="border-amber-400/50 text-amber-300 hover:bg-amber-500/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Chart Image Display */}
                  {chartData.type === 'svg' ? (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/50">
                      <div 
                        className="w-full h-64 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: chartData.svg }}
                      />
                    </div>
                  ) : chartData.type === 'realChart' ? (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/50">
                      <img 
                        src={chartData.imageUrl} 
                        alt={`${name} Chart`}
                        className="w-full h-64 object-contain rounded-lg"
                        onError={(e) => {
                          console.error('Failed to load chart image:', chartData.imageUrl)
                          e.currentTarget.style.display = 'none'
                          // Fallback to placeholder
                          e.currentTarget.parentElement.innerHTML = `
                            <div class="w-full h-64 flex items-center justify-center bg-slate-800/30 rounded-lg border border-slate-600/50">
                              <div class="text-center">
                                <div class="w-16 h-16 mx-auto mb-2 bg-amber-500/20 rounded-full flex items-center justify-center">
                                  <span class="text-amber-300 text-xl">📊</span>
                                </div>
                                <p class="text-amber-300 text-sm font-medium">${name}</p>
                                <p class="text-slate-400 text-xs">Chart Loading...</p>
                              </div>
                            </div>
                          `
                        }}
                      />
                    </div>
                  ) : chartData.type === 'futureSeer' ? (
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-600/50">
                      <div className="text-center">
                        {/* FutureSeer Chart Display */}
                        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-full flex items-center justify-center border-2 border-amber-400/30">
                          <span className="text-amber-300 text-2xl font-bold">✨</span>
                        </div>
                        
                        <h6 className="text-amber-300 font-medium text-lg mb-2">
                          {chartData.title || name}
                        </h6>
                        
                        <p className="text-slate-300 text-sm mb-3">
                          {chartData.message || description}
                        </p>
                        
                        {/* Status Badge */}
                        <div className="mb-4">
                          <Badge className={`text-xs ${
                            chartData.status === 'success' 
                              ? 'bg-green-100/20 text-green-300 border-green-400/50'
                              : chartData.status === 'vedastro_api_unavailable' || chartData.status === 'vedastro_api_error'
                              ? 'bg-yellow-100/20 text-yellow-300 border-yellow-400/50'
                              : 'bg-amber-100/20 text-amber-300 border-amber-400/50'
                          }`}>
                            {chartData.status === 'success' ? '✅ Chart Ready' : 
                             chartData.status === 'vedastro_api_unavailable' ? '⚠️ Generating Chart' :
                             chartData.status === 'vedastro_api_error' ? '❌ Chart Error' : '🔮 FutureSeer Chart'}
                          </Badge>
                        </div>
                        
                        {/* Minimal Technical Info */}
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>Generated: {chartData.timestamp ? new Date(chartData.timestamp).toLocaleString() : new Date().toLocaleString()}</p>
                          <p>Method: Advanced Vedic Calculations</p>
                        </div>
                        
                        {/* Chart Information */}
                        {chartData.fallbackData && (
                          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                            <p className="text-amber-300 text-sm font-medium mb-2">Chart Details:</p>
                            <p className="text-slate-300 text-xs">{chartData.fallbackData.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-600/50">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center border-2 border-amber-400/30">
                          <span className="text-amber-300 text-2xl font-bold">{chartType}</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">
                          {chartData.chart?.title || name}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {chartData.chart?.description || description}
                        </p>
                        {chartData.generatedAt && (
                          <p className="text-slate-500 text-xs mt-2">
                            Generated: {new Date(chartData.generatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Full Chart Display */}
                  {showFullChart && (
                    <div className="mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-600/50">
                      <h6 className="text-amber-300 font-medium mb-3">Full Chart View</h6>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                        {chartData.type === 'svg' ? (
                          <div 
                            className="w-full flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: chartData.svg }}
                          />
                        ) : chartData.type === 'realChart' ? (
                          <div className="w-full flex items-center justify-center">
                            <img 
                              src={chartData.imageUrl} 
                              alt={`${name} Chart`}
                              className="w-full max-w-md h-auto object-contain rounded-lg"
                              onError={(e) => {
                                console.error('Failed to load full chart image:', chartData.imageUrl)
                                e.currentTarget.style.display = 'none'
                                // Fallback to placeholder
                                e.currentTarget.parentElement.innerHTML = `
                                  <div class="w-full h-48 flex items-center justify-center bg-slate-800/30 rounded-lg border border-slate-600/50">
                                    <div class="text-center">
                                      <div class="w-16 h-16 mx-auto mb-2 bg-amber-500/20 rounded-full flex items-center justify-center">
                                        <span class="text-amber-300 text-xl">📊</span>
                                      </div>
                                      <p class="text-amber-300 text-sm font-medium">${name}</p>
                                      <p class="text-slate-400 text-xs">Chart Loading...</p>
                                    </div>
                                  </div>
                                `
                              }}
                            />
                          </div>
                        ) : chartData.type === 'futureSeer' ? (
                          <div className="text-center text-slate-300">
                            <div className="mb-4">
                              <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-full flex items-center justify-center border-2 border-amber-400/30">
                                <span className="text-amber-300 text-3xl">✨</span>
                              </div>
                              <h6 className="text-amber-300 font-medium text-lg mb-2">
                                {chartData.title || name}
                              </h6>
                              <p className="text-slate-300 text-sm mb-3">
                                {chartData.message || description}
                              </p>
                            </div>
                            
                            {/* Chart Details */}
                            <div className="space-y-3 text-left">
                              {chartData.fallbackData && (
                                <div className="p-3 bg-slate-700/30 rounded-lg">
                                  <p className="text-amber-300 text-sm font-medium">Chart Information:</p>
                                  <p className="text-slate-300 text-xs">{chartData.fallbackData.description}</p>
                                </div>
                              )}
                              
                              <div className="p-3 bg-slate-700/30 rounded-lg">
                                <p className="text-amber-300 text-sm font-medium">Calculation Method:</p>
                                <p className="text-slate-300 text-xs">Advanced Vedic Astrology Calculations</p>
                              </div>
                              
                              <div className="p-3 bg-slate-700/30 rounded-lg">
                                <p className="text-amber-300 text-sm font-medium">Generated By:</p>
                                <p className="text-slate-300 text-xs">FutureSeer AI-Powered Mystic</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-300">
                            <p className="text-sm mb-2">
                              🎨 FutureSeer is generating your detailed {name}...
                            </p>
                            <p className="text-xs text-slate-400">
                              This would display the actual astrological chart image
                            </p>
                            <div className="mt-3">
                              <div className="w-full h-48 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-lg border border-amber-400/20 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-2 bg-amber-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-amber-300 text-xl">📊</span>
                                  </div>
                                  <p className="text-amber-300 text-sm font-medium">{name}</p>
                                  <p className="text-slate-400 text-xs">Interactive Chart</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
