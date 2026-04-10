'use client'

import React, { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';

interface QualityMetrics {
  overallScore: number
  uiConsistency: number
  backendPerformance: number
  dataQuality: number
  userExperience: number
  criticalIssues: string[]
  recommendations: string[]
}

interface QualityMonitorProps {
  toolName: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function QualityMonitor({ 
  toolName, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: QualityMonitorProps) {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchQualityMetrics = async () => {
    try {
      // This would typically fetch from your quality API endpoint
      // For now, we'll simulate the data
      const mockMetrics: QualityMetrics = {
        overallScore: 87.5,
        uiConsistency: 92.0,
        backendPerformance: 85.0,
        dataQuality: 88.0,
        userExperience: 89.0,
        criticalIssues: [],
        recommendations: [
          '🎨 Improve color consistency - ensure darkest blue and golden yellow are used consistently',
          '⚡ Optimize response time - target under 3 seconds'
        ]
      }
      
      setQualityMetrics(mockMetrics)
      setLastUpdate(new Date())
    } catch (error) {
      devLog.error('Failed to fetch quality metrics:', error, 'QualityMonitor')
    }
  }

  useEffect(() => {
    void fetchQualityMetrics()

    if (!autoRefresh) {
      return
    }

    const interval = setInterval(() => {
      void fetchQualityMetrics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-yellow-500'
    if (score >= 70) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (!qualityMetrics) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-3 rounded-full shadow-lg transition-colors mb-2 ${
          qualityMetrics.overallScore >= 90 ? 'bg-green-600 hover:bg-green-700' :
          qualityMetrics.overallScore >= 80 ? 'bg-yellow-600 hover:bg-yellow-700' :
          qualityMetrics.overallScore >= 70 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'
        } text-white`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Quality Panel */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Quality Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overall Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Overall Score</span>
              <span className={`text-lg font-bold ${getScoreColor(qualityMetrics.overallScore)}`}>
                {qualityMetrics.overallScore.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(qualityMetrics.overallScore)}`}
                style={{ width: `${qualityMetrics.overallScore}%` }}
              ></div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">UI Consistency</span>
              <span className={getScoreColor(qualityMetrics.uiConsistency)}>
                {qualityMetrics.uiConsistency.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Backend Performance</span>
              <span className={getScoreColor(qualityMetrics.backendPerformance)}>
                {qualityMetrics.backendPerformance.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Data Quality</span>
              <span className={getScoreColor(qualityMetrics.dataQuality)}>
                {qualityMetrics.dataQuality.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">User Experience</span>
              <span className={getScoreColor(qualityMetrics.userExperience)}>
                {qualityMetrics.userExperience.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Critical Issues */}
          {qualityMetrics.criticalIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-600 mb-2">Critical Issues</h4>
              <div className="bg-red-50 border border-red-200 rounded p-2">
                {qualityMetrics.criticalIssues.map((issue, index) => (
                  <div key={index} className="text-xs text-red-700 mb-1">
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {qualityMetrics.recommendations.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-blue-600 mb-2">Recommendations</h4>
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                {qualityMetrics.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="text-xs text-blue-700 mb-1">
                    {rec}
                  </div>
                ))}
                {qualityMetrics.recommendations.length > 2 && (
                  <div className="text-xs text-blue-600">
                    +{qualityMetrics.recommendations.length - 2} more...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Update */}
          {lastUpdate && (
            <div className="text-xs text-gray-500 text-center">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
