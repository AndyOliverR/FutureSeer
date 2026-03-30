"use client"

import { useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { analytics } from '@/lib/analytics'
import {
  captureCampaignFromCurrentUrl,
  hasCampaignSignal,
  markCampaignLandingTracked,
  wasCampaignLandingTrackedThisSession,
} from '@/lib/campaignAttribution'

export function AnalyticsInitializer() {
  useEffect(() => {
    try {
      const captured = captureCampaignFromCurrentUrl()

      // Initialize PostHog before campaign events (capture uses posthog).
      analytics.init()

      if (
        hasCampaignSignal(captured) &&
        !wasCampaignLandingTrackedThisSession()
      ) {
        analytics.trackCampaignLandingViewed({
          path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        })
        markCampaignLandingTracked()
      }
      
      // Track page view on route change
      const handleRouteChange = () => {
        try {
          analytics.trackPageView()
        } catch (error) {
          devLog.warn('Failed to track page view:', error, 'AnalyticsInitializer')
        }
      }

      // Listen for route changes
      window.addEventListener('popstate', handleRouteChange)
      
      // Track initial page view
      analytics.trackPageView()

      return () => {
        window.removeEventListener('popstate', handleRouteChange)
      }
    } catch (error) {
      devLog.warn('Failed to initialize analytics:', error, 'AnalyticsInitializer')
    }
  }, [])

  return null
} 