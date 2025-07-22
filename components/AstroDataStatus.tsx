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
      <Card className="bg-slate-800/50 border-slate-600">
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
    <Card className="bg-slate-800/50 border-slate-600">
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
          <Badge variant={isDataFresh ? "default" : "secondary"}>
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
          <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            size="sm"
            variant="outline"
            className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          {needsRefresh && (
            <Badge variant="destructive" className="text-xs">
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