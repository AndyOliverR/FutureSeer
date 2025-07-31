"use client"

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

export function AnalyticsInitializer() {
  useEffect(() => {
    // Initialize analytics
    analytics.init()
    
    // Track page view on route change
    const handleRouteChange = () => {
      analytics.trackPageView()
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    // Track initial page view
    analytics.trackPageView()

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  return null
} 