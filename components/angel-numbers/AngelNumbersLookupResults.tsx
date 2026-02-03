"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { lookupAngelNumber } from "@/lib/angelNumbersLookup"
import { Sparkles, Heart, Zap, Star } from "lucide-react"
import { MATERIAL3_EASING } from "./constants"

interface AngelNumbersLookupResultsProps {
  result: ReturnType<typeof lookupAngelNumber>
}

export function AngelNumbersLookupResults({ result }: AngelNumbersLookupResultsProps) {
  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: MATERIAL3_EASING.decelerated
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Number Display */}
      <motion.div
        variants={itemVariants}
        className="text-center p-6 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-300 rounded-2xl hover:shadow-lg transition-shadow duration-300"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-5xl font-bold bg-gradient-to-b from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent mb-2"
        >
          {result.number}
        </motion.div>
        {!result.isExactMatch && result.matchedNumber && (
          <p className="text-slate-600 text-sm mt-2">
            Interpreted from {result.originalInput} → {result.matchedNumber}
          </p>
        )}
      </motion.div>

      {/* Primary Meaning */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-purple-300">
          <CardContent className="p-4">
            <h4 className="text-purple-900 font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Primary Meaning
            </h4>
            <p className="text-slate-700 text-lg">{result.primaryMeaning}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Spiritual Message */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-blue-300">
          <CardContent className="p-4">
            <h4 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Spiritual Message
            </h4>
            <p className="text-slate-700 leading-relaxed">{result.spiritualMessage}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Guidance */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-green-300">
          <CardContent className="p-4">
            <h4 className="text-green-900 font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Guidance
            </h4>
            <p className="text-slate-700 leading-relaxed">{result.guidance}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Keywords */}
      {result.keywords.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-amber-300">
            <CardContent className="p-4">
              <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="px-3 py-1 bg-amber-500/20 text-amber-700 border border-amber-300 rounded-full text-sm font-medium cursor-default"
                  >
                    {keyword}
                  </motion.span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Info */}
      {(result.chakraAssociation || result.element || result.biblicalReference) && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {result.chakraAssociation && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-purple-300">
              <CardContent className="p-3">
                <div className="text-xs text-purple-600 mb-1 font-medium">Chakra</div>
                <div className="text-purple-900 font-semibold">{result.chakraAssociation}</div>
              </CardContent>
            </Card>
          )}
          {result.element && (
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-cyan-300">
              <CardContent className="p-3">
                <div className="text-xs text-cyan-600 mb-1 font-medium">Element</div>
                <div className="text-cyan-900 font-semibold">{result.element}</div>
              </CardContent>
            </Card>
          )}
          {result.biblicalReference && (
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl md:col-span-3 hover:shadow-lg transition-all duration-300 hover:border-pink-300">
              <CardContent className="p-3">
                <div className="text-xs text-pink-600 mb-1 font-medium">Biblical Reference</div>
                <div className="text-pink-900 text-sm">{result.biblicalReference}</div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
