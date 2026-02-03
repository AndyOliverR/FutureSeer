"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { BibliomancyReading, SacredTextType } from '@/lib/bibliomancyIntelligence'
import { 
  BookOpen, 
  Sparkles, 
  Eye, 
  Target, 
  Heart, 
  Lightbulb,
  Shield,
  AlertTriangle,
  Star,
  Quote
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PassageCard from './PassageCard'
import LifeAreaGuidance from './LifeAreaGuidance'

interface BibliomancyReportProps {
  reading: BibliomancyReading
}

const textNames: Record<SacredTextType, string> = {
  'bible': 'Bible',
  'quran': 'Quran',
  'bhagavad-gita': 'Bhagavad Gita',
  'torah': 'Torah',
  'hafez': 'Divan of Hafez'
}

const textIcons: Record<SacredTextType, string> = {
  'bible': '📖',
  'quran': '☪️',
  'bhagavad-gita': '🕉️',
  'torah': '✡️',
  'hafez': '🌹'
}

export default function BibliomancyReport({ reading }: BibliomancyReportProps) {
  const textType = reading.textType || 'bible'
  const textName = textNames[textType]
  const textIcon = textIcons[textType]

  return (
    <div className="space-y-6">
      {/* Text Type Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <Badge className="bg-amber-200 text-amber-900 border-amber-300 px-4 py-2 text-sm">
          <span className="mr-2">{textIcon}</span>
          {textName}
        </Badge>
      </motion.div>

      {/* Divine Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-600" />
              Divine Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed text-lg">{reading.divineMessage.overview}</p>
            </div>
            
            {reading.divineMessage.keyInsights && reading.divineMessage.keyInsights.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {reading.divineMessage.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <Star className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reading.divineMessage.personalMessage && (
              <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mt-4">
                <p className="text-amber-900 leading-relaxed italic">
                  {reading.divineMessage.personalMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Passages */}
      {reading.selectedPassages && reading.selectedPassages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Quote className="h-6 w-6 text-amber-600" />
                Selected Passages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reading.selectedPassages.map((passage, idx) => (
                  <PassageCard key={idx} passage={passage} index={idx} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Life Area Guidance */}
      {reading.lifeAreaGuidance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Target className="h-6 w-6 text-amber-600" />
                Life Area Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <LifeAreaGuidance lifeAreaGuidance={reading.lifeAreaGuidance} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Symbolic Meanings */}
      {reading.symbolicMeanings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Eye className="h-6 w-6 text-amber-600" />
                Symbolic Meanings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {reading.symbolicMeanings.themes && reading.symbolicMeanings.themes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {reading.symbolicMeanings.themes.map((theme, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="bg-amber-200 text-amber-900 border-amber-300"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {reading.symbolicMeanings.symbols && reading.symbolicMeanings.symbols.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Symbols</h4>
                  <div className="flex flex-wrap gap-2">
                    {reading.symbolicMeanings.symbols.map((symbol, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="bg-purple-200 text-purple-900 border-purple-300"
                      >
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {reading.symbolicMeanings.numbers && reading.symbolicMeanings.numbers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Numbers</h4>
                  <div className="flex flex-wrap gap-2">
                    {reading.symbolicMeanings.numbers.map((number, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="bg-blue-200 text-blue-900 border-blue-300"
                      >
                        {number}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Practical Applications */}
      {reading.practicalApplications && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-amber-600" />
                Practical Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {reading.practicalApplications.actions && reading.practicalApplications.actions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Actions</h4>
                  <ul className="space-y-2">
                    {reading.practicalApplications.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <Target className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reading.practicalApplications.affirmations && reading.practicalApplications.affirmations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Affirmations</h4>
                  <ul className="space-y-2">
                    {reading.practicalApplications.affirmations.map((affirmation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 italic">
                        <Star className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                        <span>"{affirmation}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reading.practicalApplications.practices && reading.practicalApplications.practices.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Practices</h4>
                  <ul className="space-y-2">
                    {reading.practicalApplications.practices.map((practice, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <Heart className="h-4 w-4 text-pink-600 mt-1 flex-shrink-0" />
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Spiritual Insights */}
      {reading.spiritualInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-600" />
                Spiritual Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {reading.spiritualInsights.current && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Current</h4>
                  <p className="text-slate-700 leading-relaxed">{reading.spiritualInsights.current}</p>
                </div>
              )}

              {reading.spiritualInsights.future && reading.spiritualInsights.future.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Future</h4>
                  <ul className="space-y-2">
                    {reading.spiritualInsights.future.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <Star className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reading.spiritualInsights.warnings && reading.spiritualInsights.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </h4>
                  <ul className="space-y-2">
                    {reading.spiritualInsights.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Question Reading */}
      {reading.questionReading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Heart className="h-6 w-6 text-amber-600" />
                Question Reading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <h4 className="text-sm font-semibold text-amber-700 mb-2">Your Question</h4>
                <p className="text-slate-800 italic">"{reading.questionReading.question}"</p>
              </div>
              <PassageCard passage={reading.questionReading.passage} />
              {reading.questionReading.interpretation && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Interpretation</h4>
                  <p className="text-slate-700 leading-relaxed">{reading.questionReading.interpretation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

