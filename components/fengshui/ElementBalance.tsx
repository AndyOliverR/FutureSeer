"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ElementAnalysis } from '@/lib/fengshui/fengShuiService'
import { Sparkles, TrendingUp, TrendingDown, Palette, Box, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ElementBalanceProps {
  elementAnalysis: ElementAnalysis
}

const ELEMENT_ICONS: Record<string, string> = {
  'Wood': '🌳',
  'Fire': '🔥',
  'Earth': '🏔️',
  'Metal': '⚔️',
  'Water': '💧'
}

const ELEMENT_COLORS: Record<string, string> = {
  'Wood': 'from-green-700 to-green-500',
  'Fire': 'from-red-600 to-orange-500',
  'Earth': 'from-amber-700 to-yellow-500',
  'Metal': 'from-slate-400 to-slate-200',
  'Water': 'from-blue-900 to-blue-600'
}

export default function ElementBalance({ elementAnalysis }: ElementBalanceProps) {
  return (
    <div className="space-y-6">
      {/* Primary Element */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-5xl bg-gradient-to-br ${ELEMENT_COLORS[elementAnalysis.primaryElement]} p-4 rounded-xl`}>
                {ELEMENT_ICONS[elementAnalysis.primaryElement] || '✨'}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-amber-900">
                  {elementAnalysis.primaryElement} Element
                </h3>
                <p className="text-slate-700 mt-1">{elementAnalysis.elementDescription}</p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Element Cycles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Generating Cycle */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-700" />
                <h4 className="font-semibold text-green-900">Generating Cycle</h4>
              </div>
              <p className="text-sm text-slate-700 mb-3">
                These elements enhance your {elementAnalysis.primaryElement} energy:
              </p>
              <div className="space-y-2">
                {elementAnalysis.generatingCycle.map((element, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded bg-green-100 border border-green-300"
                  >
                    <span className="text-2xl">{ELEMENT_ICONS[element] || '✨'}</span>
                    <span className="text-green-900 font-medium">{element}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Destructive Cycle */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-700" />
                <h4 className="font-semibold text-red-900">Destructive Cycle</h4>
              </div>
              <p className="text-sm text-slate-700 mb-3">
                Minimize these elements to avoid weakening your energy:
              </p>
              <div className="space-y-2">
                {elementAnalysis.destructiveCycle.map((element, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded bg-red-100 border border-red-300"
                  >
                    <span className="text-2xl">{ELEMENT_ICONS[element] || '✨'}</span>
                    <span className="text-red-900 font-medium">{element}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>

      {/* Balancing Recommendations */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-700" />
              Balancing Recommendations
            </h4>
            <ul className="space-y-2">
              {elementAnalysis.balancingRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <Sparkles className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </CardContent>
      </Card>

      {/* Colors, Materials, Objects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Colors */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-amber-700" />
                <h4 className="font-semibold text-amber-900">Colors</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {elementAnalysis.colors.map((color, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded bg-white/95 text-slate-900 border border-slate-300"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Materials */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Box className="w-5 h-5 text-amber-700" />
                <h4 className="font-semibold text-amber-900">Materials</h4>
              </div>
              <ul className="space-y-1 text-sm text-slate-700">
                {elementAnalysis.materials.map((material, i) => (
                  <li key={i}>• {material}</li>
                ))}
              </ul>
            </motion.div>
          </CardContent>
        </Card>

        {/* Objects */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h4 className="font-semibold text-amber-900">Objects</h4>
              </div>
              <ul className="space-y-1 text-sm text-slate-700">
                {elementAnalysis.objects.map((object, i) => (
                  <li key={i}>• {object}</li>
                ))}
              </ul>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

