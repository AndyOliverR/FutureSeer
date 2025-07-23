import { useState, useEffect } from 'react'
import { getNumerologySystemStatus } from '@/lib/numerologyIntelligence'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  Brain, 
  TrendingUp, 
  Zap, 
  Shield, 
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface NumerologySystemStatus {
  totalCalculations: number
  internalAccuracy: number
  externalUsage: number
  learningOpportunities: number
  lastImprovement: number
  confidence: number
  isLearning: boolean
  efficiency: number
}

export function NumerologySystemStatus() {
  const [systemStatus, setSystemStatus] = useState<NumerologySystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSystemStatus = async () => {
      try {
        setLoading(true)
        const status = getNumerologySystemStatus()
        setSystemStatus(status)
      } catch (error) {
        console.error('Error loading numerology system status:', error)
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
            <span className="ml-3 text-slate-300">Loading system status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!systemStatus) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Unable to load system status</p>
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
            <Brain className="w-5 h-5" />
            Numerology Intelligence System
          </CardTitle>
          <p className="text-sm text-slate-400">
            Real-time status of your intelligent numerology calculation system.
          </p>
        </CardHeader>
      </Card>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Confidence */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-slate-300">Confidence</span>
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
              System reliability
            </p>
          </CardContent>
        </Card>

        {/* Calculation Efficiency */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-slate-300">Efficiency</span>
            </div>
            <div className={`text-2xl font-bold mb-2 ${getEfficiencyColor(systemStatus.efficiency)}`}>
              {(systemStatus.efficiency * 100).toFixed(1)}%
            </div>
            <Progress 
              value={systemStatus.efficiency * 100} 
              className="h-2"
            />
            <p className="text-xs text-slate-400 mt-1">
              Internal calculations
            </p>
          </CardContent>
        </Card>

        {/* Total Calculations */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Calculations</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {systemStatus.totalCalculations.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              Total calculations performed
            </div>
          </CardContent>
        </Card>

        {/* Learning Status */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-300">Learning</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {systemStatus.learningOpportunities}
            </div>
            <div className="text-xs text-slate-400">
              Learning opportunities
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accuracy Metrics */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Accuracy Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Internal Accuracy</span>
              <Badge className="bg-green-900/30 text-green-400 border-green-500/30">
                {(systemStatus.internalAccuracy * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">External API Usage</span>
              <Badge className="bg-blue-900/30 text-blue-400 border-blue-500/30">
                {systemStatus.externalUsage}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Learning Mode</span>
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

        {/* System Information */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Last Improvement</span>
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
                Intelligent
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Data Source</span>
              <Badge className="bg-green-900/30 text-green-400 border-green-500/30">
                Internal
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Summary */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.confidence >= 0.9 ? 'bg-green-400' : 
                systemStatus.confidence >= 0.7 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium text-slate-300">
                System Status: {
                  systemStatus.confidence >= 0.9 ? 'Optimal' :
                  systemStatus.confidence >= 0.7 ? 'Good' : 'Needs Attention'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">
                {systemStatus.totalCalculations} calculations performed
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 