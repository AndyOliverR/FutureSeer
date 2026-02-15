"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useKabbalisticNumerology } from "@/hooks/use-kabbalistic-numerology"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { DevotionistStyleCard } from "@/components/western/DevotionistStyleCard"
import {
  Hash,
  Info,
  AlertTriangle,
  RefreshCw,
  User,
  Calendar,
  Sparkles,
  Star,
  Target,
  Heart,
  Brain,
  BookOpen,
  Compass,
  TrendingUp,
  Zap,
  MessageCircle
} from "lucide-react"
import { NumberDisplay } from "@/components/kabbalistic/NumberDisplay"
import { HebrewLetterGrid } from "@/components/kabbalistic/HebrewLetterGrid"
import { GematriaVisualization } from "@/components/kabbalistic/GematriaVisualization"
import { KabbalisticNumerologyCoachInterface } from "@/components/KabbalisticNumerologyCoachInterface"

type TabId = "overview" | "gematria" | "soul" | "destiny" | "personality" | "hebrew" | "guidance" | "ask-the-seer"

export default function KabbalisticNumerologyPage() {
  const { user, userProfile } = useAuth()
  const { analysis, isLoading, error, refetch, hasRequiredDetails } = useKabbalisticNumerology()
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  const stateCardClass = "bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 rounded-2xl shadow-lg"
  const stateTitleClass = "m3-headline-small text-purple-900 mb-2"
  const stateBodyClass = "m3-body-medium text-slate-700 mb-4"
  const stateErrorTitleClass = "m3-headline-small text-red-700 mb-2"
  const stateErrorBodyClass = "m3-body-medium text-red-600 mb-4"

  // Loading state
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className={`${stateCardClass} p-8 max-w-md mx-auto overflow-hidden`}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className={stateBodyClass}>Calculating your Kabbalistic Numerology...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className={`${stateCardClass} p-6 text-center max-w-2xl mx-auto overflow-hidden`}>
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className={stateErrorTitleClass}>Error Loading Kabbalistic Data</h3>
            <p className={stateErrorBodyClass}>{error}</p>
            <Button onClick={refetch} className="bg-purple-500 hover:bg-purple-600 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Profile incomplete state
  if (!hasRequiredDetails) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className={`${stateCardClass} p-6 text-center max-w-2xl mx-auto overflow-hidden`}>
            <Info className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className={stateTitleClass}>Complete Your Profile</h3>
            <p className={stateBodyClass}>
              Please complete your name and birth date in your profile to generate your Kabbalistic Numerology report.
            </p>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No data state (shouldn't happen with auto-gen, but just in case)
  if (!analysis) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 starfield-ultra-sharp" />
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className={`${stateCardClass} p-6 text-center max-w-2xl mx-auto overflow-hidden`}>
            <Info className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className={stateTitleClass}>Preparing Your Kabbalistic Analysis</h3>
            <p className={stateBodyClass}>We&apos;re generating your Kabbalistic Numerology report automatically.</p>
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabConfig = [
    { id: "overview" as const, label: "Overview", icon: Hash },
    { id: "gematria" as const, label: "Gematria", icon: Sparkles },
    { id: "soul" as const, label: "Soul", icon: Heart },
    { id: "destiny" as const, label: "Destiny", icon: Target },
    { id: "personality" as const, label: "Personality", icon: Brain },
    { id: "hebrew" as const, label: "Hebrew", icon: BookOpen },
    { id: "guidance" as const, label: "Guidance", icon: Compass },
    { id: "ask-the-seer" as const, label: "Ask the Seer", icon: MessageCircle },
  ]

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "var(--starfield-image)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundColor: "#030711",
          imageRendering: "-webkit-optimize-contrast",
        }}
      />
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header: plain h1 + subtitle, no container (match Numerology / Angel Numbers) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold gold-glow mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl" role="img" aria-hidden>🪬</span>
            Kabbalistic Numerology
          </h1>
          <p className="m3-body-large text-slate-300 leading-relaxed">
            Hebrew mystical numerology revealing soul, destiny, and divine patterns
          </p>
        </motion.div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            {tabConfig.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="shrink-0 devotionist-tab-trigger flex items-center gap-2 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0"
            >
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 rounded-2xl shadow-lg p-6 overflow-hidden">
                  <h3 className="m3-headline-small text-purple-900 mb-4">Kabbalistic Overview</h3>
                  <p className="m3-body-large text-slate-700 leading-relaxed mb-0">
                    {analysis.overview || "Your Kabbalistic Numerology analysis is being prepared. Please wait a moment or click Regenerate to refresh."}
                  </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <NumberDisplay
                    number={analysis.soulNumber}
                    label="Soul Number"
                    description="Inner Essence"
                    size="md"
                    delay={0.1}
                    colorScheme="purple"
                  />
                  <NumberDisplay
                    number={analysis.destinyNumber}
                    label="Destiny Number"
                    description="Life Path"
                    size="md"
                    delay={0.2}
                    colorScheme="cyan"
                  />
                  <NumberDisplay
                    number={analysis.personalityNumber}
                    label="Personality Number"
                    description="Outer Expression"
                    size="md"
                    delay={0.3}
                    colorScheme="amber"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DevotionistStyleCard
                    colorScheme="purple"
                    icon={<Star className="w-5 h-5" />}
                    title="Name Gematria"
                    subtitle={String(analysis.nameValue)}
                    summary={analysis.nameMeaning}
                  />
                  <DevotionistStyleCard
                    colorScheme="cyan"
                    icon={<Calendar className="w-5 h-5" />}
                    title="Birth Date Value"
                    subtitle={String(analysis.birthValue)}
                    summary={analysis.birthMeaning}
                  />
                </div>
              </div>
            )}

            {activeTab === "gematria" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 rounded-2xl shadow-lg p-6 overflow-hidden">
                  <h3 className="m3-headline-small text-purple-900 mb-4">Gematria Analysis</h3>
                  <p className="m3-body-large text-slate-700 leading-relaxed mb-0">{analysis.gematria}</p>
                </Card>

                {analysis.hebrewLetters && analysis.hebrewLetters.length > 0 && (
                  <GematriaVisualization
                    name={userProfile?.fullName || userProfile?.displayName || user?.displayName || ""}
                    nameValue={analysis.nameValue}
                    birthValue={analysis.birthValue}
                    letters={analysis.hebrewLetters}
                    variant="light"
                  />
                )}
              </div>
            )}

            {activeTab === "soul" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 rounded-2xl shadow-lg p-6 overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="m3-display-large text-purple-900">{analysis.soulNumber}</div>
                    <div>
                      <h4 className="m3-title-large text-purple-900 mb-2">Soul Number: {analysis.soulNumber}</h4>
                      <p className="m3-body-medium text-slate-700">Your inner essence and spiritual gifts</p>
                    </div>
                  </div>
                  <p className="m3-body-large text-slate-700 leading-relaxed mb-0">{analysis.soulDescription}</p>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DevotionistStyleCard
                    colorScheme="green"
                    icon={<TrendingUp className="w-5 h-5" />}
                    title="Strengths"
                    items={analysis.soulStrengths?.map((text) => ({ text, type: "positive" as const })) ?? []}
                  />
                  <DevotionistStyleCard
                    colorScheme="orange"
                    icon={<AlertTriangle className="w-5 h-5" />}
                    title="Challenges"
                    items={analysis.soulChallenges?.map((text) => ({ text, type: "challenge" as const })) ?? []}
                  />
                </div>
              </div>
            )}

            {activeTab === "destiny" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border-2 border-cyan-200 rounded-2xl shadow-lg p-6 overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="m3-display-large text-cyan-900">{analysis.destinyNumber}</div>
                    <div>
                      <h4 className="m3-title-large text-cyan-900 mb-2">Destiny Number: {analysis.destinyNumber}</h4>
                      <p className="m3-body-medium text-slate-700">Your life path and purpose</p>
                    </div>
                  </div>
                  <p className="m3-body-large text-slate-700 leading-relaxed mb-0">{analysis.destinyDescription}</p>
                </Card>
                <div className="space-y-4">
                  <DevotionistStyleCard
                    colorScheme="cyan"
                    icon={<Target className="w-5 h-5" />}
                    title="Life Purpose"
                    summary={analysis.lifePurpose}
                  />
                  <DevotionistStyleCard
                    colorScheme="blue"
                    icon={<TrendingUp className="w-5 h-5" />}
                    title="Career Paths"
                    items={analysis.careerPaths?.map((text) => ({ text })) ?? []}
                  />
                </div>
              </div>
            )}

            {activeTab === "personality" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg p-6 overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="m3-display-large text-amber-900">{analysis.personalityNumber}</div>
                    <div>
                      <h4 className="m3-title-large text-amber-900 mb-2">Personality Number: {analysis.personalityNumber}</h4>
                      <p className="m3-body-medium text-slate-700">How others perceive you</p>
                    </div>
                  </div>
                  <p className="m3-body-large text-slate-700 leading-relaxed mb-0">{analysis.personalityDescription}</p>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DevotionistStyleCard
                    colorScheme="purple"
                    icon={<Brain className="w-5 h-5" />}
                    title="Core Traits"
                    items={analysis.personalityTraits?.map((text) => ({ text })) ?? []}
                  />
                  <DevotionistStyleCard
                    colorScheme="pink"
                    icon={<Sparkles className="w-5 h-5" />}
                    title="Expression Modes"
                    items={analysis.expressionModes?.map((text) => ({ text })) ?? []}
                  />
                </div>
              </div>
            )}

            {activeTab === "hebrew" && (
              <div className="space-y-6">
                <h3 className="m3-headline-small text-slate-200 mb-6">Hebrew Letter Analysis</h3>
                {analysis.hebrewLetters && analysis.hebrewLetters.length > 0 ? (
                  <HebrewLetterGrid letters={analysis.hebrewLetters} variant="light" />
                ) : (
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg overflow-hidden">
                    <div className="text-center">
                      <p className="m3-body-medium text-slate-700">No Hebrew letters available</p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "guidance" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-lg p-6 overflow-hidden">
                  <h3 className="m3-headline-small text-cyan-900 mb-4">Spiritual Guidance</h3>
                  <p className="m3-body-large text-slate-700 leading-relaxed mb-0">{analysis.guidance}</p>
                </Card>
                <div className="space-y-6">
                  <h4 className="m3-title-large text-slate-200 mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    Recommendations
                  </h4>
                  {analysis.recommendations && analysis.recommendations.length > 0 ? (
                    analysis.recommendations.map((rec, index) => {
                      const recommendation = typeof rec === "string"
                        ? { title: rec, description: "", instructions: [] as string[], benefits: [] as string[] }
                        : rec
                      const instructionsAsItems = recommendation.instructions?.map((text) => ({ text })) ?? []
                      const schemes: Array<"purple" | "cyan" | "green" | "pink"> = ["purple", "cyan", "green", "pink"]
                      const colorScheme = schemes[index % schemes.length]
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <DevotionistStyleCard
                            variant="callout"
                            colorScheme={colorScheme}
                            icon={<Sparkles className="w-5 h-5" />}
                            title={recommendation.title}
                            summary={recommendation.description || undefined}
                            items={instructionsAsItems}
                          >
                            {recommendation.benefits && recommendation.benefits.length > 0 && (
                              <div className="mt-3">
                                <h6 className="m3-label-medium text-slate-800 mb-2 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Benefits:
                                </h6>
                                <div className="flex flex-wrap gap-2">
                                  {recommendation.benefits.map((benefit, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-amber-200/80 border border-amber-400/50 rounded-lg m3-label-small text-amber-900"
                                    >
                                      {benefit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </DevotionistStyleCard>
                        </motion.div>
                      )
                    })
                  ) : (
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg overflow-hidden">
                      <div className="text-center">
                        <p className="m3-body-medium text-slate-700">No recommendations available. Click &quot;Regenerate&quot; to generate your Kabbalistic analysis.</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ask-the-seer" && (
              <div className="space-y-6">
                <h3 className="m3-headline-small flex items-center gap-3 text-slate-200 mb-6">
                  <Brain className="w-8 h-8 text-cyan-400" />
                  Ask the Seer
                </h3>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-lg p-6 overflow-hidden max-w-2xl mx-auto">
                  <p className="m3-body-large text-slate-700 leading-relaxed mb-0 text-center">
                    Ask me anything about your Kabbalistic Numerology analysis. I&apos;ll provide personalized answers based on your soul number, destiny number, Hebrew letters, and Gematria values.
                  </p>
                </Card>
                <KabbalisticNumerologyCoachInterface analysis={analysis} variant="light" userProfile={userProfile} />
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
        </div>
      </div>
    </div>
  )
}
