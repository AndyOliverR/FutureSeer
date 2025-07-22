import { useState, useEffect } from 'react'
import { getAngelNumbersSystemStatus } from '@/lib/angelNumbersIntelligence'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Zap, 
  Shield, 
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Feather
} from 'lucide-react'

interface AngelNumbersSystemStatus {
  totalCalculations: number
  internalAccuracy: number
  externalUsage: number
  learningOpportunities: number
  lastImprovement: number
  confidence: number
  isLearning: boolean
  efficiency: number
}

export function AngelNumbersSystemStatus() {
  const [systemStatus, setSystemStatus] = useState<AngelNumbersSystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSystemStatus = async () => {
      try {
        setLoading(true)
        const status = getAngelNumbersSystemStatus()
        setSystemStatus(status)
      } catch (error) {
        console.error('Error loading angel numbers system status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSystemStatus()
    const interval = setInterval(loadSystemStatus, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-slate-300">Receiving divine guidance...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!systemStatus) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Unable to receive divine guidance</p>
        </CardContent>
      </Card>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="w-4 h-4" />
    if (confidence >= 0.7) return <AlertCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.9) return 'text-green-400'
    if (efficiency >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Feather className="w-5 h-5" />
            Angel Numbers Intelligence System
          </CardTitle>
          <p className="text-sm text-slate-400">
            Real-time status of your divine angel numbers calculation system.
          </p>
        </CardHeader>
      </Card>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Divine Confidence */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-slate-300">Divine Confidence</span>
              </div>
              {getConfidenceIcon(systemStatus.confidence)}
            </div>
            <div className={`text-2xl font-bold mb-2 ${getConfidenceColor(systemStatus.confidence)}`}>
              {(systemStatus.confidence * 100).toFixed(1)}%
            </div>
            <Progress 
              value={systemStatus.confidence * 100} 
              className="h-2"
            />
            <p className="text-xs text-slate-400 mt-1">
              Divine guidance reliability
            </p>
          </CardContent>
        </Card>

        {/* Spiritual Efficiency */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-slate-300">Spiritual Efficiency</span>
            </div>
            <div className={`text-2xl font-bold mb-2 ${getEfficiencyColor(systemStatus.efficiency)}`}>
              {(systemStatus.efficiency * 100).toFixed(1)}%
            </div>
            <Progress 
              value={systemStatus.efficiency * 100} 
              className="h-2"
            />
            <p className="text-xs text-slate-400 mt-1">
              Divine calculations
            </p>
          </CardContent>
        </Card>

        {/* Angelic Calculations */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Divine Messages</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {systemStatus.totalCalculations.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              Angelic calculations performed
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Learning */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-300">Divine Learning</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {systemStatus.learningOpportunities}
            </div>
            <div className="text-xs text-slate-400">
              Spiritual growth opportunities
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Divine Accuracy Metrics */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Divine Accuracy Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Divine Accuracy</span>
              <Badge className="bg-green-900/30 text-green-400 border-green-500/30">
                {(systemStatus.internalAccuracy * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">External Divine Usage</span>
              <Badge className="bg-blue-900/30 text-blue-400 border-blue-500/30">
                {systemStatus.externalUsage}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Spiritual Learning Mode</span>
              <Badge className={`${
                systemStatus.isLearning 
                  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                  : 'bg-slate-900/30 text-slate-400 border-slate-500/30'
              }`}>
                {systemStatus.isLearning ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Divine System Information */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Divine System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Last Divine Improvement</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {new Date(systemStatus.lastImprovement).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Calculation Method</span>
              <Badge className="bg-purple-900/30 text-purple-400 border-purple-500/30">
                Divine Intelligence
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Divine Source</span>
              <Badge className="bg-green-900/30 text-green-400 border-green-500/30">
                Angelic
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Divine Status Summary */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.confidence >= 0.9 ? 'bg-green-400' : 
                systemStatus.confidence >= 0.7 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium text-slate-300">
                Divine Status: {
                  systemStatus.confidence >= 0.9 ? 'Divinely Blessed' :
                  systemStatus.confidence >= 0.7 ? 'Spiritually Connected' : 'Needs Divine Attention'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">
                {systemStatus.totalCalculations} divine messages received
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 