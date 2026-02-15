import { useAstroData } from '@/hooks/useAstroData'
import { devLog } from '@/lib/devLogger';
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Database, Zap, Shield, Brain, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SystemStatus {
  totalCalculations: number
  internalAccuracy: number
  externalUsage: number
  learningOpportunities: number
  lastImprovement: number
  confidence: number
  isLearning: boolean
  efficiency: number
}

export function DataSourceStatus() {
  const { astroData, loading, error } = useAstroData()
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const { getIntelligenceStatus } = await import('@/lib/astroDataService')
        const status = await getIntelligenceStatus()
        setSystemStatus(status)
      } catch (error) {
        devLog.warn('Failed to fetch system status:', error, 'DataSourceStatus')
      }
    }

    fetchSystemStatus()
  }, [])

  if (loading || !astroData) {
    return null
  }

  const getSourceInfo = () => {
    const source = astroData.metadata?.source || 'unknown'
    const isFallback = astroData.metadata?.isFallback || false
    const systemConfidence = astroData.metadata?.systemConfidence || 0.85
    const learningApplied = astroData.metadata?.learningApplied || false

    switch (source) {
      case 'intelligent_system':
        return {
          icon: <Brain className="w-4 h-4" />,
          label: 'AI Intelligence',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          description: 'Powered by our intelligent learning system',
          reliability: 'Very High',
          confidence: systemConfidence,
          learning: learningApplied
        }
      case 'external_with_learning':
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'Learning Mode',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          description: 'External data with internal learning applied',
          reliability: 'High',
          confidence: systemConfidence,
          learning: true
        }
      case 'astroapp':
        return {
          icon: <Database className="w-4 h-4" />,
          label: 'FutureSeer AI',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          description: 'Data from professional astrological API',
          reliability: 'High',
          confidence: 0.9,
          learning: false
        }
      case 'internal_calculations':
        return {
          icon: <Zap className="w-4 h-4" />,
          label: 'Internal Engine',
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          description: 'Calculated using our own astrological engine',
          reliability: 'High',
          confidence: systemConfidence,
          learning: false
        }
      case 'fallback':
        return {
          icon: <Shield className="w-4 h-4" />,
          label: 'Fallback System',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          description: 'Using backup calculations for reliability',
          reliability: 'High',
          confidence: systemConfidence,
          learning: false
        }
      case 'emergency_fallback':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Emergency Mode',
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
          description: 'Basic calculations due to service issues',
          reliability: 'Medium',
          confidence: 0.7,
          learning: false
        }
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Unknown Source',
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          description: 'Data source not specified',
          reliability: 'Unknown',
          confidence: 0.5,
          learning: false
        }
    }
  }

  const sourceInfo = getSourceInfo()

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-amber-400 flex items-center gap-2">
          {sourceInfo.icon}
          AI Intelligence Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={sourceInfo.color}>
            {sourceInfo.label}
          </Badge>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">{sourceInfo.reliability}</span>
          </div>
        </div>
        
        <p className="text-sm text-slate-400">
          {sourceInfo.description}
        </p>
        
        {/* System Confidence */}
        <div className="p-2 bg-slate-700/50 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-300">System Confidence</span>
            <span className="text-xs text-slate-300">{(sourceInfo.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${sourceInfo.confidence * 100}%` }}
            />
          </div>
        </div>
        
        {/* Learning Status */}
        {sourceInfo.learning && (
          <div className="p-2 bg-purple-900/30 border border-purple-500/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">Learning Applied</span>
            </div>
            <p className="text-xs text-purple-200">
              This reading contributed to improving our system's accuracy.
            </p>
          </div>
        )}
        
        {/* System Metrics */}
        {systemStatus && (
          <div className="p-2 bg-slate-700/30 rounded">
            <div className="text-xs text-slate-400 mb-2">System Performance</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-300">Efficiency:</span>
                <span className="text-green-400 ml-1">{(systemStatus.efficiency * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-300">Calculations:</span>
                <span className="text-blue-400 ml-1">{systemStatus.totalCalculations}</span>
              </div>
              <div>
                <span className="text-slate-300">Learning:</span>
                <span className="text-purple-400 ml-1">{systemStatus.learningOpportunities}</span>
              </div>
              <div>
                <span className="text-slate-300">External:</span>
                <span className="text-amber-400 ml-1">{systemStatus.externalUsage}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Self-Reliant Mode */}
        {astroData.metadata?.isFallback && (
          <div className="p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Self-Reliant Mode</span>
            </div>
            <p className="text-xs text-amber-200">
              FutureSeer is operating independently using our intelligent astrological engine. 
              This ensures your readings continue even if external services are unavailable.
            </p>
          </div>
        )}
        
        <div className="text-xs text-slate-500">
          <p>• Last updated: {new Date(astroData.lastFetched).toLocaleString()}</p>
          <p>• Version: {astroData.metadata?.version || '2.0'}</p>
          <p>• AI-powered calculations</p>
        </div>
      </CardContent>
    </Card>
  )
} 