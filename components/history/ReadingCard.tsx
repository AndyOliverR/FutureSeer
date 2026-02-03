"use client"

import { motion } from "framer-motion"
import { AskHistory } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Eye, Calendar, TrendingUp, Heart, Briefcase, Activity, Plane, Sparkles } from "lucide-react"

interface ReadingCardProps {
  reading: AskHistory
  index: number
  onViewDetails: (reading: AskHistory) => void
  getQuestionType: (question: string) => string
  getTypeColor: (type: string) => { bg: string; text: string; border: string }
  formatDate: (timestamp: number) => string
}

export function ReadingCard({
  reading,
  index,
  onViewDetails,
  getQuestionType,
  getTypeColor,
  formatDate
}: ReadingCardProps) {
  const type = getQuestionType(reading.question)
  const colors = getTypeColor(type)
  const confidence = reading.symbolicData?.confidence || 75

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'love': return <Heart className="w-4 h-4" />
      case 'career': return <Briefcase className="w-4 h-4" />
      case 'health': return <Activity className="w-4 h-4" />
      case 'travel': return <Plane className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={`${colors.bg} ${colors.text} border-0 m3-label-small`}>
                  {getTypeIcon(type)}
                  <span className="ml-1">{type}</span>
                </Badge>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm">{confidence}%</span>
                </div>
              </div>
              <CardTitle className="text-lg font-semibold text-amber-400 font-serif leading-relaxed">
                {reading.question}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(reading.timestamp)}
                </div>
                {reading.symbolicData?.elementalInfluence && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {reading.symbolicData.elementalInfluence}
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => onViewDetails(reading)}
              variant="outlined"
              size="sm"
              className="border border-amber-500/30 hover:border-amber-500/50 text-amber-400 hover:bg-slate-800/50 text-sm transition-all duration-300"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
            {reading.aiSummary}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
