import { useState } from 'react'
import { useAstroData } from '@/hooks/useAstroData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, AlertCircle, Clock, Star } from 'lucide-react'

export function AstroDataStatus() {
  const { 
    astroData, 
    loading, 
    error, 
    hasValidBirthDetails, 
    isDataFresh, 
    needsRefresh, 
    refreshData, 
    lastFetched 
  } = useAstroData()
  
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
    } catch (error) {
      console.error('Error refreshing astro data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const formatLastFetched = (timestamp: number | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }

  if (!hasValidBirthDetails) {
    return (
      <Card className="bg-slate-800/50 border-slate-600 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Astrological Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Birth details required for astrological readings</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Please add your birth date and place in your profile settings to enable comprehensive astrological insights.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-amber-400 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Astrological Data Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            ) : astroData ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-slate-300">
              {loading ? 'Loading...' : astroData ? 'Data Available' : 'No Data'}
            </span>
          </div>
          <Badge 
            variant={isDataFresh ? "default" : "secondary"}
            className={isDataFresh ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}
          >
            {isDataFresh ? 'Fresh' : 'Stale'}
          </Badge>
        </div>

        {/* Data Info */}
        {astroData && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Sun Sign:</span>
              <span className="text-amber-300 ml-2">{astroData.sunSign}</span>
            </div>
            <div>
              <span className="text-slate-400">Moon Sign:</span>
              <span className="text-amber-300 ml-2">{astroData.moonSign}</span>
            </div>
            <div>
              <span className="text-slate-400">Rising Sign:</span>
              <span className="text-amber-300 ml-2">{astroData.risingSign}</span>
            </div>
            <div>
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-amber-300 ml-2">{formatLastFetched(lastFetched)}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600/20 to-yellow-500/20 border border-amber-400/30 px-4 py-2 hover:from-amber-500/30 hover:to-yellow-400/30 hover:border-amber-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center gap-2 text-amber-200 group-hover:text-amber-100 transition-colors">
              <RefreshCw className={`w-4 h-4 transition-transform group-hover:scale-110 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-serif font-medium text-sm">
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </span>
            </div>
          </button>
          
          {needsRefresh && (
            <Badge 
              variant="destructive" 
              className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              Update Recommended
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-slate-400">
          <p>• Data is cached for 24 hours to minimize API calls</p>
          <p>• Refresh manually if you need the latest planetary positions</p>
          <p>• All readings use your comprehensive astrological profile</p>
        </div>
      </CardContent>
    </Card>
  )
} 