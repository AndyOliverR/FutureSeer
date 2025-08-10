"use client"

import { useEffect } from 'react'
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
          console.warn('Failed to track page view:', error)
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
      console.warn('Failed to initialize analytics:', error)
    }
  }, [])

  return null
} 