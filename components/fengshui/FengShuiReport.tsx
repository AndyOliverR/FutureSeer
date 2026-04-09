"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { FengShuiReading } from '@/lib/fengshui/fengShuiIntelligence'
import { FileText, Sparkles, CheckCircle, Clock, Coins, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface FengShuiReportProps {
  reading: FengShuiReading
}

export default function FengShuiReport({ reading }: FengShuiReportProps) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-amber-700" />
              <h3 className="text-2xl font-bold text-amber-900">Feng Shui Overview</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">{reading.overview}</p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Kua Summary */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-amber-700" />
              <h3 className="text-xl font-bold text-amber-900">Kua Number Analysis</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">{reading.kuaSummary}</p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Element Summary */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-amber-700" />
              <h3 className="text-xl font-bold text-amber-900">Element Analysis</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">{reading.elementSummary}</p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Bagua Recommendations */}
      {Object.keys(reading.baguaRecommendations).length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-amber-900 mb-4">Bagua Area Recommendations</h3>
              <div className="space-y-4">
                {Object.entries(reading.baguaRecommendations).map(([area, recommendations]) => (
                  <div key={area} className="border-b border-amber-200 pb-3 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-amber-900 mb-2">{area}</h4>
                    <ul className="space-y-1">
                      {recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Wealth & home checklist (practical guides) */}
      {reading.wealthTips.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-6 h-6 text-amber-700" />
                <h3 className="text-xl font-bold text-amber-900">Wealth & abundance pointers</h3>
              </div>
              <ul className="space-y-2">
                {reading.wealthTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </CardContent>
        </Card>
      )}

      {reading.practicalChecklist.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-6 h-6 text-amber-700" />
                <h3 className="text-xl font-bold text-amber-900">Home checklist</h3>
              </div>
              <ul className="space-y-2">
                {reading.practicalChecklist.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* General Recommendations */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-amber-900 mb-4">General Recommendations</h3>
            <ul className="space-y-2">
              {reading.generalRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </CardContent>
      </Card>

      {/* Timing Advice */}
      {reading.timingAdvice.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-amber-700" />
                <h3 className="text-xl font-bold text-amber-900">Timing Advice</h3>
              </div>
              <ul className="space-y-2">
                {reading.timingAdvice.map((advice, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

