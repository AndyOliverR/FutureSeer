"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { lookupAngelNumber, isValidAngelNumberInput } from "@/lib/angelNumbersLookup"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, AlertCircle } from "lucide-react"
import { AngelNumbersLookupResults } from "./AngelNumbersLookupResults"
import { ANGEL_NUMBERS_CONSTANTS, MATERIAL3_EASING } from "./constants"

interface AngelNumbersLookupProps {
  onLookupComplete?: (result: ReturnType<typeof lookupAngelNumber>) => void
}

export function AngelNumbersLookup({ onLookupComplete }: AngelNumbersLookupProps) {
  const [lookupInput, setLookupInput] = useState("")
  const [lookupResult, setLookupResult] = useState<ReturnType<typeof lookupAngelNumber> | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)

  // Memoize validation
  const isValidInput = useMemo(() => {
    return lookupInput.trim() && isValidAngelNumberInput(lookupInput)
  }, [lookupInput])

  // Handle lookup with Material 3 animations
  const handleLookup = useCallback(() => {
    setLookupError(null)
    setLookupResult(null)

    if (!lookupInput.trim()) {
      setLookupError(ANGEL_NUMBERS_CONSTANTS.ERRORS.EMPTY_INPUT)
      return
    }

    if (!isValidAngelNumberInput(lookupInput)) {
      setLookupError(ANGEL_NUMBERS_CONSTANTS.ERRORS.INVALID_INPUT)
      return
    }

    const result = lookupAngelNumber(lookupInput)
    if (result) {
      setLookupResult(result)
      onLookupComplete?.(result)
    } else {
      setLookupError(ANGEL_NUMBERS_CONSTANTS.ERRORS.INTERPRETATION_FAILED)
    }
  }, [lookupInput, onLookupComplete])

  // Clear lookup
  const clearLookup = useCallback(() => {
    setLookupInput("")
    setLookupResult(null)
    setLookupError(null)
  }, [])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLookupInput(e.target.value)
    setLookupError(null)
  }, [])

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleLookup()
    }
  }, [handleLookup])

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: MATERIAL3_EASING.decelerated }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amber-200/60 rounded-full p-3"
          >
            <Search className="w-6 h-6 text-amber-700" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-semibold text-amber-900">{ANGEL_NUMBERS_CONSTANTS.SECTIONS.SIMPLE_LOOKUP}</h2>
            <p className="text-slate-700">
              Enter any number you've been seeing to discover its angelic message instantly
            </p>
          </div>
        </motion.div>

        {/* Input Section */}
        <div className="mb-6">
          <div className="flex gap-3 mb-3">
            <Input
              type="text"
              placeholder={ANGEL_NUMBERS_CONSTANTS.PLACEHOLDERS.LOOKUP_INPUT}
              value={lookupInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white border-2 border-amber-300 text-slate-800 placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500/30 rounded-xl transition-all duration-200"
            />
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              onClick={handleLookup}
              disabled={!isValidInput}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="px-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">{ANGEL_NUMBERS_CONSTANTS.BUTTONS.LOOKUP}</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            {lookupInput && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95, y: 0 }}
                onClick={clearLookup}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="px-4 bg-white border-2 border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-all duration-300"
              >
                {ANGEL_NUMBERS_CONSTANTS.BUTTONS.CLEAR}
              </motion.button>
            )}
          </div>
          <p className="text-xs text-slate-600">
            💡 Examples: {ANGEL_NUMBERS_CONSTANTS.LOOKUP_EXAMPLES}
          </p>
          {lookupError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {lookupError}
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        {lookupResult && (
          <AngelNumbersLookupResults result={lookupResult} />
        )}

        {/* Empty State */}
        {!lookupResult && !lookupError && (
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: MATERIAL3_EASING.decelerated }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔢</div>
            <h4 className="text-xl font-semibold text-amber-900 mb-2">{ANGEL_NUMBERS_CONSTANTS.MESSAGES.READY_TO_DISCOVER}</h4>
            <p className="text-slate-700">
              {ANGEL_NUMBERS_CONSTANTS.MESSAGES.ENTER_NUMBER}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
