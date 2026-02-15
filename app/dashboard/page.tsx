"use client"

import React, { useMemo, useState, useEffect } from "react"
import { devLog } from '@/lib/devLogger';
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState"
import { useAuth } from "@/hooks/use-auth"
import { useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile"
import { useDashboardProfile } from "@/hooks/useDashboardProfile"
import { UserMenuDropdown } from '@/components/UserMenuDropdown'
import { Loader2 } from "lucide-react"
import { ToolSnippetCard } from "@/components/dashboard/ToolSnippetCard"
import { extractToolSnippets } from "@/lib/dashboardDataExtractor"
import { PaymentMethodCapture } from "@/components/PaymentMethodCapture"
import { updateUserProfile } from "@/lib/firebase"
import { RETURNING_USER_WITH_REPORTS_DESTINATION, hasRequiredProfileSetup, PROFILE_SETUP_PATH } from "@/lib/authRouting"

const HeroWelcome = dynamic(() => import("@/components/dashboard/HeroWelcome").then(mod => ({ default: mod.HeroWelcome })), {
  loading: () => <div className="w-full h-32 rounded-2xl backdrop-blur-md bg-[var(--m3-surface-container-lowest)] border border-[var(--m3-outline-variant)] animate-pulse" />
})

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading, refreshProfile, isAdmin, isSuperadmin } = useAuth()
  const router = useRouter()
  const [paymentGateDismissed, setPaymentGateDismissed] = useState(false)
  const { profile, loading: profileLoading, hasProfile } = useComprehensiveMysticalProfile()
  const mergedProfile = useDashboardProfile(user?.uid ?? undefined, profile)

  // Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [authLoading, user, router])

  // Redirect to profile-setup until required fields (birthDate, birthPlace) are complete
  useEffect(() => {
    if (!authLoading && user && !hasRequiredProfileSetup(userProfile)) {
      router.replace(PROFILE_SETUP_PATH)
    }
  }, [authLoading, user, userProfile, router])

  // Get user's first name for personalized experience
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0] || fullName
  }
  
  const fullName = userProfile?.displayName || user?.displayName || "Seeker"
  const userName = getFirstName(fullName)
  const userEmail = user?.email || undefined
  const userPhotoURL = userProfile?.photoURL || user?.photoURL || undefined

  // Calculate real lunar phase and dominant element from birth chart
  const cosmicData = useMemo(() => {
    if (!profile?.vedic) {
      return {
        lunarPhase: "Waxing Crescent",
        dominantElement: "Water"
      }
    }

    // Calculate lunar phase from Moon position
    const calculateLunarPhase = () => {
      const moonPlanet = profile.vedic.planets?.find((p: any) => p.name === 'Moon')
      if (!moonPlanet) return "Waxing Crescent"

      const moonDegree = moonPlanet.longitude || 0
      // Simplified lunar phase calculation based on Moon's position
      const phase = Math.floor(moonDegree / 30)
      const phases = [
        "New Moon", "Waxing Crescent", "First Quarter", 
        "Waxing Gibbous", "Full Moon", "Waning Gibbous",
        "Last Quarter", "Waning Crescent"
      ]
      return phases[phase % 8] || "Waxing Crescent"
    }

    // Calculate dominant element from planetary positions
    const calculateDominantElement = () => {
      const planets = profile.vedic.planets || []
      const elementCount: Record<string, number> = {
        Fire: 0,
        Earth: 0,
        Air: 0,
        Water: 0
      }

      // Element mapping based on zodiac signs
      const signElements: Record<number, string> = {
        0: 'Fire', 1: 'Earth', 2: 'Air', 3: 'Water',
        4: 'Fire', 5: 'Earth', 6: 'Air', 7: 'Water',
        8: 'Fire', 9: 'Earth', 10: 'Air', 11: 'Water'
      }

      planets.forEach((planet: any) => {
        if (planet.sign !== undefined) {
          const element = signElements[planet.sign]
          if (element) {
            elementCount[element]++
          }
        }
      })

      // Find dominant element
      let maxCount = 0
      let dominant = "Water"
      Object.entries(elementCount).forEach(([element, count]) => {
        if (count > maxCount) {
          maxCount = count
          dominant = element
        }
      })

      return dominant
    }

    return {
      lunarPhase: calculateLunarPhase(),
      dominantElement: calculateDominantElement()
    }
  }, [profile])

  // Extract tool snippets from merged profile (base + Western, Tarot, Astro-Numerology caches)
  const toolSnippets = useMemo(() => {
    return extractToolSnippets(mergedProfile ?? profile)
  }, [mergedProfile, profile])

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
        <div className="wrapper">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-[var(--m3-primary)] mb-4" />
              <p className="text-[var(--m3-on-surface-variant)] font-light">Loading your sacred profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Guard: redirect when auth is resolved and user is missing
  if (!user) {
    return null
  }

  // Guard: do not render dashboard until profile setup is complete (effect above redirects)
  if (!hasRequiredProfileSetup(userProfile)) {
    return null
  }

  // RBI: First-signin payment capture — show blocking overlay if user has no payment method (skip admins)
  const needPaymentCapture =
    user &&
    userProfile &&
    !userProfile.paymentMethodId &&
    !isAdmin &&
    !isSuperadmin &&
    !paymentGateDismissed

  if (needPaymentCapture) {
    const userCountry = (userProfile?.country as string) || 'IN'
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center starfield-ultra-sharp bg-slate-950/95 backdrop-blur-sm p-4 pt-16 overflow-y-auto">
        <div className="w-full max-w-lg">
          <PaymentMethodCapture
            selectedPlan="power-user-trial"
            userEmail={user.email || ''}
            userName={fullName}
            userCountry={userCountry}
            onPaymentMethodCaptured={async (paymentMethodId, subscriptionId) => {
              try {
                const trialEndDate = Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000)
                await updateUserProfile(user.uid, {
                  paymentMethodId,
                  subscriptionId: subscriptionId ?? undefined,
                  subscriptionStatus: 'trial',
                  selectedPlan: 'power-user-trial',
                  trialEndDate,
                })
                await refreshProfile()
                setPaymentGateDismissed(true)
              } catch (e) {
                devLog.error('Failed to save payment to profile:', e, 'page')
              }
            }}
            onError={(msg) => devLog.error('Payment capture error:', msg, 'page')}
          />
        </div>
      </div>
    )
  }

  // Returning user with reports: redirect to canonical default (Ask the Seer)
  if (userProfile?.mysticalProfileGenerated === true) {
    router.replace(RETURNING_USER_WITH_REPORTS_DESTINATION)
    return null
  }

  // Empty state - no profile generated yet
  if (!hasProfile) {
    return (
      <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp pt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6">
          {/* Free-floating Avatar */}
          <motion.div 
            className="absolute top-20 left-4 z-[100]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl rounded-2xl p-2.5 border border-[var(--m3-outline-variant)] m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition m3-transition-standard m3-gpu-accelerated">
              <UserMenuDropdown 
                userName={userName}
                userEmail={userEmail}
                userPhotoURL={userPhotoURL}
              />
            </div>
          </motion.div>

          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.6, delay: 0.2 }}
          >
            <HeroWelcome
              userName={userName}
              lunarPhase="Waxing Crescent"
              dominantElement="Water"
            />
          </motion.div>
          <DashboardEmptyState userName={userName} />
        </div>
      </div>
    )
  }

  // Main dashboard with comprehensive mystical profile
  return (
    <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp sacred-geometry-bg pt-16">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6">
        {/* Free-floating Avatar above everything */}
        <motion.div 
          className="absolute top-20 left-4 z-[100]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0, 0, 0.2, 1], duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-2.5 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
            <UserMenuDropdown 
              userName={userName}
              userEmail={userEmail}
              userPhotoURL={userPhotoURL}
            />
          </div>
        </motion.div>

        {/* Hero Welcome (without avatar) */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0, 0, 0.2, 1], duration: 0.6, delay: 0.2 }}
        >
          <HeroWelcome
            userName={userName}
            lunarPhase={cosmicData.lunarPhase}
            dominantElement={cosmicData.dominantElement}
          />
        </motion.div>

        {/* Tool Snippets Grid - Main Dashboard Content */}
        {toolSnippets.length > 0 ? (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.6, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {toolSnippets.map((snippet, index) => (
                <ToolSnippetCard
                  key={snippet.toolSlug}
                  toolName={snippet.toolName}
                  toolSlug={snippet.toolSlug}
                  icon={snippet.icon}
                  metric={snippet.metric}
                  metricLabel={snippet.metricLabel}
                  insight={snippet.insight}
                  href={snippet.href}
                  colorScheme={snippet.colorScheme}
                  priority={index}
                  iconClassName={snippet.iconClassName}
                />
              ))}
            </div>
          </motion.div>
        ) : profile && (
          <motion.div 
            className="mb-8 p-6 rounded-lg bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.6, delay: 0.3 }}
          >
            <p className="text-[var(--m3-on-surface-variant)] text-center m3-body-medium">
              Loading tool insights... If this persists, please refresh the page.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  )
}
