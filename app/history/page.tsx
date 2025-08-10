"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useHistory } from "@/hooks/useHistory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Calendar, 
  Star, 
  Eye, 
  BookOpen, 
  ArrowLeft, 
  Clock,
  Sparkles,
  TrendingUp,
  Heart,
  Briefcase,
  Activity,
  Plane
} from "lucide-react"

export default function HistoryPage() {
  const { 
    history, 
    filteredHistory, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType, 
    getQuestionType, 
    formatDate, 
    getTypeColor 
  } = useHistory()
  
  const router = useRouter()
  const [selectedReading, setSelectedReading] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  const filterOptions = [
    { value: "all", label: "All Readings", icon: BookOpen },
    { value: "love", label: "Love & Relationships", icon: Heart },
    { value: "career", label: "Career & Money", icon: Briefcase },
    { value: "health", label: "Health & Wellness", icon: Activity },
    { value: "travel", label: "Travel & Adventure", icon: Plane },
  ]

  const handleViewDetails = (reading: any) => {
    setSelectedReading(reading)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedReading(null)
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'love': return <Heart className="w-4 h-4" />
      case 'career': return <Briefcase className="w-4 h-4" />
      case 'health': return <Activity className="w-4 h-4" />
      case 'travel': return <Plane className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="text-6xl mb-6"
          >
            🔮
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-amber-200 font-serif text-lg"
          >
            Loading your mystical journey...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fixed bg-center bg-no-repeat overflow-hidden"
         style={{ 
           backgroundImage: "url('/assets/bg/starfield.avif')",
           backgroundSize: "cover",
           imageRendering: "crisp-edges"
         } as React.CSSProperties}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif">Back to Dashboard</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4">
              Your Mystical Journey
            </h1>
            <p className="text-slate-300 font-serif text-lg">
              Review your past readings and cosmic insights
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 text-center card-glow rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-xl font-serif text-amber-200">{history.length}</div>
              <div className="text-sm text-slate-300">Total Readings</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 text-center card-glow rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-xl font-serif text-amber-200">
                {history.length > 0 
                  ? Math.round(history.reduce((sum, item) => sum + (item.symbolicData?.confidence || 75), 0) / history.length)
                  : 0}%
              </div>
              <div className="text-sm text-slate-300">Avg Confidence</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 text-center card-glow rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-xl font-serif text-amber-200">
                {history.filter(item => {
                  const daysAgo = (Date.now() - item.timestamp) / (1000 * 60 * 60 * 24)
                  return daysAgo <= 7
                }).length}
              </div>
              <div className="text-sm text-slate-300">This Week</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 text-center card-glow rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">🔮</div>
              <div className="text-xl font-serif text-amber-200">
                {history.length > 0 ? formatDate(history[0].timestamp) : "N/A"}
              </div>
              <div className="text-sm text-slate-300">Last Reading</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 card-glow rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search your readings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow rounded-xl"
                  />
                </div>
                
                {/* Filter */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {filterOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = filterType === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                        className={`group relative overflow-hidden whitespace-nowrap px-4 py-2.5 rounded-xl font-serif font-medium text-sm transition-all duration-300 backdrop-blur-sm ${
                          isActive 
                            ? "bg-gradient-to-r from-amber-600/30 to-yellow-500/30 border border-amber-400/50 text-amber-100 shadow-lg shadow-amber-500/20" 
                            : "bg-gradient-to-r from-slate-700/20 to-slate-600/20 border border-slate-600/40 text-slate-300 hover:from-slate-600/30 hover:to-slate-500/30 hover:border-slate-500/60 hover:text-slate-200"
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                        <div className="relative flex items-center justify-center gap-2">
                          <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-amber-200' : 'text-slate-400 group-hover:text-slate-300'
                          }`} />
                          <span className="transition-transform group-hover:scale-105">{option.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-center font-serif"
          >
            {error}
          </motion.div>
        )}

        {/* Readings List */}
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                🔮
              </motion.div>
              <p className="text-amber-200 font-serif text-lg mb-4">
                {searchTerm || filterType !== "all" ? "No readings found" : "No readings yet"}
              </p>
              <p className="text-slate-300 font-serif mb-8">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Start your mystical journey by asking the seer a question"
                }
              </p>
              {!searchTerm && filterType === "all" && (
                <Link href="/ask">
                  <button className="group relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600/20 to-yellow-500/20 border border-amber-400/30 text-amber-200 font-serif font-semibold text-lg hover:from-amber-500/30 hover:to-yellow-400/30 hover:border-amber-400/50 hover:text-amber-100 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-amber-500/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span className="text-2xl">🔮</span>
                      <span className="transition-transform group-hover:scale-105">Ask the Seer</span>
                    </div>
                  </button>
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {filteredHistory.map((reading, index) => {
                const type = getQuestionType(reading.question)
                const colors = getTypeColor(type)
                const confidence = reading.symbolicData?.confidence || 75
                
                return (
                  <motion.div
                    key={reading.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <Card className={`backdrop-blur-md bg-slate-900/40 border ${colors.border} shadow-xl card-glow rounded-2xl`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`${colors.bg} ${colors.text} border-0 font-serif`}>
                                {getTypeIcon(type)}
                                <span className="ml-1">{type}</span>
                              </Badge>
                              <div className="flex items-center gap-1 text-amber-300">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-serif">{confidence}%</span>
                              </div>
                            </div>
                            <CardTitle className="text-amber-200 font-serif text-lg leading-relaxed">
                              {reading.question}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm font-serif">
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
                            onClick={() => handleViewDetails(reading)}
                            variant="outline"
                            size="sm"
                            className="border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 font-serif text-sm leading-relaxed line-clamp-3">
                          {reading.aiSummary}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading Details Modal */}
        <AnimatePresence>
          {showDetails && selectedReading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <Card className="backdrop-blur-md bg-slate-900/90 border border-slate-700/50 shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-amber-200 font-serif text-xl">
                        Reading Details
                      </CardTitle>
                      <Button
                        onClick={handleCloseDetails}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800/30"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question */}
                    <div>
                      <h3 className="text-amber-200 font-serif font-semibold mb-2">Your Question</h3>
                      <p className="text-slate-300 font-serif text-lg">{selectedReading.question}</p>
                    </div>

                    {/* Astrological Data */}
                    {selectedReading.scientificData && (
                      <div>
                        <h3 className="text-amber-200 font-serif font-semibold mb-3">Astrological Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-xl">
                            <div className="text-slate-400 text-sm font-serif">Sun Sign</div>
                            <div className="text-amber-200 font-serif">{selectedReading.scientificData.sun_sign}</div>
                          </div>
                          <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-xl">
                            <div className="text-slate-400 text-sm font-serif">Moon Sign</div>
                            <div className="text-amber-200 font-serif">{selectedReading.scientificData.moon_sign}</div>
                          </div>
                          <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-xl">
                            <div className="text-slate-400 text-sm font-serif">Rising Sign</div>
                            <div className="text-amber-200 font-serif">{selectedReading.scientificData.rising_sign}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Symbolic Data */}
                    {selectedReading.symbolicData && (
                      <div>
                        <h3 className="text-amber-200 font-serif font-semibold mb-3">Symbolic Elements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-xl">
                            <div className="text-slate-400 text-sm font-serif">Primary Symbol</div>
                            <div className="text-amber-200 font-serif">{selectedReading.symbolicData.primarySymbol}</div>
                          </div>
                          <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-xl">
                            <div className="text-slate-400 text-sm font-serif">Elemental Influence</div>
                            <div className="text-amber-200 font-serif">{selectedReading.symbolicData.elementalInfluence}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Insight */}
                    <div>
                      <h3 className="text-amber-200 font-serif font-semibold mb-3">Seer's Insight</h3>
                                              <div className="p-4 bg-slate-800/30 border border-slate-600 rounded-xl">
                        <p className="text-slate-300 font-serif leading-relaxed whitespace-pre-line">
                          {selectedReading.aiSummary}
                        </p>
                      </div>
                    </div>

                    {/* Remedies */}
                    {selectedReading.remedies && selectedReading.remedies.length > 0 && (
                      <div>
                        <h3 className="text-amber-200 font-serif font-semibold mb-3">Recommended Remedies</h3>
                        <div className="space-y-3">
                          {selectedReading.remedies.map((remedy: any, index: number) => (
                            <div key={index} className="p-3 bg-slate-800/30 border border-slate-600 rounded-xl">
                              <div className="text-amber-200 font-serif font-semibold">{remedy.title}</div>
                              <div className="text-slate-300 font-serif text-sm">{remedy.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="text-slate-400 text-sm font-serif">
                        <Clock className="inline w-4 h-4 mr-1" />
                        {formatDate(selectedReading.timestamp)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-amber-300 text-sm font-serif">
                          Confidence: {selectedReading.symbolicData?.confidence || 75}%
                        </div>
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                            style={{ width: `${selectedReading.symbolicData?.confidence || 75}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
