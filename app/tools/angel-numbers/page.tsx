"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useAngelNumbersData } from "@/hooks/use-angel-numbers-data"
import { ToolIntroductionTab } from "@/components/ToolIntroductionTab"
import { AngelNumbersCoachInterface } from "@/components/AngelNumbersCoachInterface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AngelNumbersLookup } from "@/components/angel-numbers/AngelNumbersLookup"
import { AngelNumbersAnalysis } from "@/components/angel-numbers/AngelNumbersAnalysis"
import { ANGEL_NUMBERS_CONSTANTS, MATERIAL3_EASING } from "@/components/angel-numbers/constants"
import { lookupAngelNumber } from "@/lib/angelNumbersLookup"

export default function AngelNumbersPage() {
  const {
    angelNumbersData,
    loading,
    error,
    refresh,
    clearCache
  } = useAngelNumbersData()

  const [activeTab, setActiveTab] = useState<'introduction' | 'lookup' | 'analysis' | 'ask-the-seer'>('introduction')
  const [lastLookupResult, setLastLookupResult] = useState<ReturnType<typeof lookupAngelNumber> | null>(null)

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'introduction' | 'lookup' | 'analysis' | 'ask-the-seer')
  }, [])

  const handleLookupComplete = useCallback((result: ReturnType<typeof lookupAngelNumber>) => {
    setLastLookupResult(result)
  }, [])

  return (
    <div className="starfield-ultra-sharp min-h-screen p-4 pt-4 overflow-hidden">
      {/* Softening overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/30 to-slate-900/40 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">👼</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Angel Numbers</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">
            Divine messages from the angels through sacred number sequences
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 gap-2">
            <TabsTrigger 
              value="introduction" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all duration-300 flex items-center justify-center"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="lookup" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all duration-300 flex items-center justify-center"
            >
              Number Lookup
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all duration-300 flex items-center justify-center"
            >
              Your Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="ask-the-seer" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all duration-300 flex items-center justify-center"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <TabsContent value="introduction" className="space-y-6 mt-6">
            <ToolIntroductionTab toolSlug="angel-numbers" />
          </TabsContent>

          {/* Number Lookup Tab */}
          <TabsContent value="lookup" className="space-y-6 mt-6">
            <AngelNumbersLookup onLookupComplete={handleLookupComplete} />
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 mt-6">
            {angelNumbersData ? (
              <AngelNumbersAnalysis
                angelNumbersData={angelNumbersData}
                loading={loading}
                error={error}
                onRefresh={refresh}
                onClearCache={clearCache}
              />
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: MATERIAL3_EASING.decelerated }}
                    className="text-6xl mb-6"
                  >
                    👼
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-amber-900 mb-4">
                    {ANGEL_NUMBERS_CONSTANTS.MESSAGES.READY_FOR_GUIDANCE}
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    {ANGEL_NUMBERS_CONSTANTS.MESSAGES.CLICK_REFRESH}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95, y: 0 }}
                    onClick={refresh}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                  >
                    {ANGEL_NUMBERS_CONSTANTS.BUTTONS.GET_ANGEL_NUMBERS}
                  </motion.button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Ask the Seer Tab */}
          <TabsContent value="ask-the-seer" className="space-y-6 mt-6">
            <AngelNumbersCoachInterface
              observedNumber={
                lastLookupResult?.originalInput != null
                  ? String(lastLookupResult.originalInput)
                  : undefined
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
