"use client"

import { useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { analytics } from '@/lib/analytics'

export function AnalyticsInitializer() {
  useEffect(() => {
    try {
      // Initialize analytics
      analytics.init()
      
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