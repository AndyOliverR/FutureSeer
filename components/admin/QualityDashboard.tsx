'use client'

import React, { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { FutureSeerQualityAssurance, QualityMetrics } from '@/lib/futureSeerQualityAssurance'

interface QualityDashboardProps {
  toolName?: string
  data?: any
  autoCheck?: boolean
}

export default function QualityDashboard({ 
  toolName = 'Horary Astrology', 
  data, 
  autoCheck = true 
}: QualityDashboardProps) {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const qualityAssurance = new FutureSeerQualityAssurance()

  useEffect(() => {
    if (autoCheck && data) {
      performQualityCheck()
    }
  }, [data, autoCheck])

  const performQualityCheck = async () => {
    setIsLoading(true)
    try {
      const metrics = await qualityAssurance.checkDivinationToolQuality(toolName, data)
      setQualityMetrics(metrics)
      setLastChecked(new Date())
    } catch (error) {
      devLog.error('Quality check failed:', error, 'QualityDashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-yellow-100'
    if (score >= 70) return 'bg-orange-100'
    return 'bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Running Quality Check...</span>
        </div>
      </div>
    )
  }

  if (!qualityMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Assurance Dashboard</h3>
          <button
            onClick={performQualityCheck}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Run Quality Check
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Quality Assurance Dashboard</h3>
        <div className="text-sm text-gray-500">
          Last checked: {lastChecked?.toLocaleTimeString()}
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-gray-700">Overall Quality Score</h4>
          <span className={`text-2xl font-bold ${getScoreColor(qualityMetrics.overallScore)}`}>
            {qualityMetrics.overallScore.toFixed(1)}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              qualityMetrics.overallScore >= 90 ? 'bg-green-500' :
              qualityMetrics.overallScore >= 80 ? 'bg-yellow-500' :
              qualityMetrics.overallScore >= 70 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${qualityMetrics.overallScore}%` }}
          ></div>
        </div>
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* UI Consistency */}
        <div className={`p-4 rounded-lg ${getScoreBgColor(qualityMetrics.uiConsistency.totalScore)}`}>
          <h5 className="font-semibold text-gray-700 mb-2">UI Consistency</h5>
          <div className={`text-2xl font-bold ${getScoreColor(qualityMetrics.uiConsistency.totalScore)}`}>
            {qualityMetrics.uiConsistency.totalScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Colors, Typography, Spacing
          </div>
        </div>

        {/* Backend Performance */}
        <div className={`p-4 rounded-lg ${getScoreBgColor(qualityMetrics.backendPerformance.totalScore)}`}>
          <h5 className="font-semibold text-gray-700 mb-2">Backend Performance</h5>
          <div className={`text-2xl font-bold ${getScoreColor(qualityMetrics.backendPerformance.totalScore)}`}>
            {qualityMetrics.backendPerformance.totalScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Response Time, Error Rate
          </div>
        </div>

        {/* Data Quality */}
        <div className={`p-4 rounded-lg ${getScoreBgColor(qualityMetrics.dataQuality.totalScore)}`}>
          <h5 className="font-semibold text-gray-700 mb-2">Data Quality</h5>
          <div className={`text-2xl font-bold ${getScoreColor(qualityMetrics.dataQuality.totalScore)}`}>
            {qualityMetrics.dataQuality.totalScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Accuracy, Authenticity
          </div>
        </div>

        {/* User Experience */}
        <div className={`p-4 rounded-lg ${getScoreBgColor(qualityMetrics.userExperience.totalScore)}`}>
          <h5 className="font-semibold text-gray-700 mb-2">User Experience</h5>
          <div className={`text-2xl font-bold ${getScoreColor(qualityMetrics.userExperience.totalScore)}`}>
            {qualityMetrics.userExperience.totalScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Navigation, Loading, Mobile
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      {qualityMetrics.criticalIssues.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-red-600 mb-3">🚨 Critical Issues</h4>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            {qualityMetrics.criticalIssues.map((issue, index) => (
              <div key={index} className="text-red-700 mb-2">
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {qualityMetrics.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-600 mb-3">💡 Recommendations</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {qualityMetrics.recommendations.map((recommendation, index) => (
              <div key={index} className="text-blue-700 mb-2">
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UI Consistency Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-700 mb-3">UI Consistency Details</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Color Scheme</span>
              <span className={`text-sm font-semibold ${getScoreColor(qualityMetrics.uiConsistency.colorScheme.consistencyScore)}`}>
                {qualityMetrics.uiConsistency.colorScheme.consistencyScore.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Typography</span>
              <span className={`text-sm font-semibold ${getScoreColor(qualityMetrics.uiConsistency.typography.score)}`}>
                {qualityMetrics.uiConsistency.typography.score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Spacing</span>
              <span className={`text-sm font-semibold ${getScoreColor(qualityMetrics.uiConsistency.spacing.score)}`}>
                {qualityMetrics.uiConsistency.spacing.score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Components</span>
              <span className={`text-sm font-semibold ${getScoreColor(qualityMetrics.uiConsistency.componentConsistency.score)}`}>
                {qualityMetrics.uiConsistency.componentConsistency.score.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Backend Performance Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-700 mb-3">Backend Performance Details</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className={`text-sm font-semibold ${getScoreColor(qualityMetrics.backendPerformance.responseTime < 3000 ? 100 : 50)}`}>
                {qualityMetrics.backendPerformance.responseTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className={`text-sm font-semibold ${getScoreColor((1 - qualityMetrics.backendPerformance.errorRate) * 100)}`}>
                {(qualityMetrics.backendPerformance.errorRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Data Accuracy</span>
              <span className={`text-sm font-semibold ${getScoreColor(qualityMetrics.backendPerformance.dataAccuracy * 100)}`}>
                {(qualityMetrics.backendPerformance.dataAccuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Engine Reliability</span>
              <span className={`text-sm font-semibold ${getScoreColor(qualityMetrics.backendPerformance.engineReliability * 100)}`}>
                {(qualityMetrics.backendPerformance.engineReliability * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={performQualityCheck}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Re-run Quality Check
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Export Report
        </button>
      </div>
    </div>
  )
}
