/**
 * Ogham Report Display Component
 * Comprehensive report renderer with all sections
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModalPortal } from '@/components/ui/ModalPortal'
import { OghamReport } from '@/lib/ogham/oghamReportGenerator'
import OghamNameDisplay from './OghamNameDisplay'
import OghamStave from './OghamStave'
import { 
  TreePine, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Target, 
  Moon,
  Sun,
  Leaf,
  Star
} from 'lucide-react'

interface OghamReportDisplayProps {
  report: OghamReport
  isLoading?: boolean
}

export default function OghamReportDisplay({ 
  report,
  isLoading = false 
}: OghamReportDisplayProps) {
  const [selectedLetter, setSelectedLetter] = useState<any>(null)

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-200 shadow-lg rounded-3xl">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-700">Generating your Ogham reading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-900">
            <Sparkles className="w-5 h-5" />
            Your Ogham Reading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose max-w-none">
            <p className="text-slate-700 leading-relaxed">
              {report.overview.summary}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg border-2 border-cyan-200">
            <p className="text-cyan-900 italic leading-relaxed">
              {report.overview.personalMessage}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {report.overview.keyInsights.map((insight, index) => (
              <Badge 
                key={index}
                className="bg-cyan-100 text-cyan-900 border-2 border-cyan-300"
              >
                {insight}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Sections */}
      <Tabs defaultValue="name" className="space-y-4">
        <TabsList className="flex w-full bg-transparent p-0 gap-2">
          <TabsTrigger 
            value="name" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-50 data-[state=active]:to-sky-50 data-[state=active]:text-cyan-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
          >
            Name
          </TabsTrigger>
          <TabsTrigger 
            value="birth-tree" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-50 data-[state=active]:to-sky-50 data-[state=active]:text-cyan-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
          >
            Birth Tree
          </TabsTrigger>
          <TabsTrigger 
            value="guidance" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-50 data-[state=active]:to-sky-50 data-[state=active]:text-cyan-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
          >
            Guidance
          </TabsTrigger>
          <TabsTrigger 
            value="wisdom" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-50 data-[state=active]:to-sky-50 data-[state=active]:text-cyan-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
          >
            Celtic Wisdom
          </TabsTrigger>
          <TabsTrigger 
            value="all-letters" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-50 data-[state=active]:to-sky-50 data-[state=active]:text-cyan-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
          >
            All Letters
          </TabsTrigger>
        </TabsList>

        {/* Name Analysis Tab */}
        <TabsContent value="name">
          <OghamNameDisplay 
            nameAnalysis={report.nameAnalysis}
            onLetterClick={setSelectedLetter}
          />
        </TabsContent>

        {/* Birth Tree Tab */}
        <TabsContent value="birth-tree">
          <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-900">
                <TreePine className="w-5 h-5" />
                Your Birth Tree: {report.birthTree.birthTree.tree}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <OghamStave 
                  letter={report.birthTree.birthTree} 
                  size="lg"
                  showDetails={true}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-cyan-900 font-semibold mb-2">Tree Meaning</h3>
                  <p className="text-slate-700">{report.birthTree.treeMeaning}</p>
                </div>

                <div>
                  <h3 className="text-cyan-900 font-semibold mb-2">Your Connection</h3>
                  <p className="text-slate-700">{report.birthTree.personalConnection}</p>
                </div>

                <div>
                  <h3 className="text-cyan-900 font-semibold mb-2">Life Path</h3>
                  <p className="text-slate-700">{report.birthTree.lifePath}</p>
                </div>

                {report.birthTree.seasonalInfluence && (
                  <div>
                    <h3 className="text-cyan-900 font-semibold mb-2">Seasonal Influence</h3>
                    <p className="text-slate-700">{report.birthTree.seasonalInfluence}</p>
                  </div>
                )}

                <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                  <h4 className="text-cyan-900 font-semibold mb-2">Celtic Lore</h4>
                  <p className="text-slate-700 text-sm">{report.birthTree.birthTree.celticLore}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {report.birthTree.birthTree.personalTraits.map((trait, index) => (
                    <Badge 
                      key={index}
                      className="bg-cyan-100 text-cyan-900 border-2 border-cyan-300"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guidance Tab */}
        <TabsContent value="guidance">
          <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-900">
                <Target className="w-5 h-5" />
                Life Guidance from the Trees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg border-2 border-cyan-200">
                <p className="text-cyan-900 leading-relaxed">{report.guidance.current}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-cyan-900 font-semibold mb-3 flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Spiritual Guidance
                  </h3>
                  <ul className="space-y-2">
                    {report.guidance.spiritual.map((item, index) => (
                      <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                        <Sparkles className="w-3 h-3 text-cyan-700 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-cyan-900 font-semibold mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Practical Guidance
                  </h3>
                  <ul className="space-y-2">
                    {report.guidance.practical.map((item, index) => (
                      <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                        <Leaf className="w-3 h-3 text-cyan-700 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-cyan-900 font-semibold mb-3">Life Areas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                    <h4 className="text-cyan-900 text-sm font-semibold mb-1">Career</h4>
                    <p className="text-slate-700 text-sm">{report.guidance.lifeAreas.career}</p>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                    <h4 className="text-cyan-900 text-sm font-semibold mb-1">Relationships</h4>
                    <p className="text-slate-700 text-sm">{report.guidance.lifeAreas.relationships}</p>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                    <h4 className="text-cyan-900 text-sm font-semibold mb-1">Health</h4>
                    <p className="text-slate-700 text-sm">{report.guidance.lifeAreas.health}</p>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                    <h4 className="text-cyan-900 text-sm font-semibold mb-1">Spirituality</h4>
                    <p className="text-slate-700 text-sm">{report.guidance.lifeAreas.spirituality}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-cyan-900 font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Affirmations
                </h3>
                <div className="space-y-2">
                  {report.guidance.affirmations.map((affirmation, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-cyan-50 rounded-lg border-2 border-cyan-200"
                    >
                      <p className="text-cyan-900 text-sm italic">{affirmation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Celtic Wisdom Tab */}
        <TabsContent value="wisdom">
          <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-900">
                <BookOpen className="w-5 h-5" />
                Celtic Wisdom & Traditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  {report.celticWisdom.overview}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-cyan-900 font-semibold mb-3">Traditions</h3>
                  <ul className="space-y-2">
                    {report.celticWisdom.traditions.map((item, index) => (
                      <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                        <Sparkles className="w-3 h-3 text-cyan-700 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-cyan-900 font-semibold mb-3">Connections</h3>
                  <ul className="space-y-2">
                    {report.celticWisdom.connections.map((item, index) => (
                      <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                        <Heart className="w-3 h-3 text-cyan-700 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-cyan-900 font-semibold mb-3">Practices</h3>
                  <ul className="space-y-2">
                    {report.celticWisdom.practices.map((item, index) => (
                      <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                        <TreePine className="w-3 h-3 text-cyan-700 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Letters Tab */}
        <TabsContent value="all-letters">
          <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-900">
                <TreePine className="w-5 h-5" />
                All 20 Ogham Letters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-6">{report.allLetters.overview}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {report.allLetters.letters.map((letter, index) => (
                  <motion.div
                    key={letter.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <OghamStave
                      letter={letter}
                      size="sm"
                      onClick={() => setSelectedLetter(letter)}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Letter Detail Modal */}
      <ModalPortal open={!!selectedLetter}>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-200 shadow-lg rounded-3xl p-6 max-w-2xl max-w-[90vw] max-h-[min(90dvh,90vh)] overflow-y-auto z-[10001]"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-cyan-900 min-w-0">
                  {selectedLetter.tree} - {selectedLetter.name}
                </h2>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 shrink-0"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-cyan-900 font-semibold mb-2">Meaning</h3>
                <p className="text-slate-700">{selectedLetter.meaning}</p>
              </div>
              <div>
                <h3 className="text-cyan-900 font-semibold mb-2">Symbolism</h3>
                <p className="text-slate-700">{selectedLetter.symbolism}</p>
              </div>
              <div>
                <h3 className="text-cyan-900 font-semibold mb-2">Celtic Lore</h3>
                <p className="text-slate-700">{selectedLetter.celticLore}</p>
              </div>
              <div>
                <h3 className="text-cyan-900 font-semibold mb-2">Divinatory Meaning</h3>
                <p className="text-slate-700">{selectedLetter.divinatoryMeaning}</p>
              </div>
              <div>
                <h3 className="text-cyan-900 font-semibold mb-2">Personal Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedLetter.personalTraits.map((trait: string, index: number) => (
                    <Badge key={index} className="bg-cyan-100 text-cyan-900 border-2 border-cyan-300">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </ModalPortal>
    </div>
  )
}

