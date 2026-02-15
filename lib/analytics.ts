import posthog from 'posthog-js'
import { devLog } from '@/lib/devLogger';

// Track if PostHog is actually enabled and initialized
let isPostHogEnabled = false

// Initialize PostHog only if API key is provided
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  try {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: false,
      enable_recording_console_log: false,
    })
    isPostHogEnabled = true
  } catch (error) {
    devLog.warn('Failed to initialize PostHog analytics:', error, 'analytics')
    isPostHogEnabled = false
  }
}

// Analytics Events
export const ANALYTICS_EVENTS = {
  // User Journey
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_PROFILE_COMPLETED: 'user_profile_completed',
  USER_SUBSCRIBED: 'user_subscribed',
  
  // Tool Usage
  TOOL_ACCESSED: 'tool_accessed',
  TOOL_ANALYSIS_COMPLETED: 'tool_analysis_completed',
  TOOL_SHARED: 'tool_shared',
  
  // Feature Usage
  ASK_THE_SEER_USED: 'ask_the_seer_used',
  DAILY_GUIDANCE_VIEWED: 'daily_guidance_viewed',
  REMEDIES_VIEWED: 'remedies_viewed',
  COMMUNITY_ACCESSED: 'community_accessed',
  HERO_CTA_CLICKED: 'hero_cta_clicked',
  
  // Engagement
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  SETTINGS_UPDATED: 'settings_updated',
  THEME_CHANGED: 'theme_changed',
  
  // Conversion
  PRICING_VIEWED: 'pricing_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  PAYMENT_COMPLETED: 'payment_completed',
  
  // Error Tracking
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  
  // Performance
  PAGE_LOADED: 'page_loaded',
  TOOL_LOAD_TIME: 'tool_load_time',
} as const

// Analytics Properties
export const ANALYTICS_PROPERTIES = {
  // Tool Properties
  TOOL_NAME: 'tool_name',
  TOOL_CATEGORY: 'tool_category',
  ANALYSIS_TYPE: 'analysis_type',
  RESULT_QUALITY: 'result_quality',
  
  // User Properties
  USER_TYPE: 'user_type',
  SUBSCRIPTION_TIER: 'subscription_tier',
  EXPERIENCE_LEVEL: 'experience_level',
  LOCATION: 'location',
  
  // Session Properties
  SESSION_DURATION: 'session_duration',
  PAGES_VIEWED: 'pages_viewed',
  TOOLS_USED: 'tools_used',
  
  // Technical Properties
  DEVICE_TYPE: 'device_type',
  BROWSER: 'browser',
  SCREEN_SIZE: 'screen_size',
  CONNECTION_SPEED: 'connection_speed',
  PAGE_NAME: 'page_name',
} as const

// Analytics Service
export class AnalyticsService {
  private static instance: AnalyticsService
  private isInitialized = false

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    this.isInitialized = true
    this.trackPageView()
    
    // Track session start
    this.trackEvent(ANALYTICS_EVENTS.PAGE_LOADED, {
      [ANALYTICS_PROPERTIES.PAGE_NAME]: window.location.pathname,
      [ANALYTICS_PROPERTIES.DEVICE_TYPE]: this.getDeviceType(),
      [ANALYTICS_PROPERTIES.BROWSER]: this.getBrowser(),
      [ANALYTICS_PROPERTIES.SCREEN_SIZE]: `${window.screen.width}x${window.screen.height}`,
    })
  }

  // Core tracking methods
  trackEvent(event: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined' || !isPostHogEnabled || !posthog) return
    
    try {
      posthog.capture(event, {
        timestamp: new Date().toISOString(),
        source: 'futureseer_client',
        ...properties,
      })
    } catch (error) {
      // Silently fail if PostHog is not available
      if (process.env.NODE_ENV === 'development') {
        devLog.debug('Analytics tracking skipped:', error)
      }
    }
  }

  trackPageView(pageName?: string) {
    const page = pageName || window.location.pathname
    this.trackEvent(ANALYTICS_EVENTS.PAGE_LOADED, {
      [ANALYTICS_PROPERTIES.PAGE_NAME]: page,
    })
  }

  identifyUser(userId: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined' || !isPostHogEnabled || !posthog) return
    
    try {
      posthog.identify(userId, {
        timestamp: new Date().toISOString(),
        ...properties,
      })
    } catch (error) {
      // Silently fail if PostHog is not available
      if (process.env.NODE_ENV === 'development') {
        devLog.debug('User identification skipped:', error)
      }
    }
  }

  // User journey tracking
  trackSignUp(method: string, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.USER_SIGNED_UP, {
      signup_method: method,
      ...properties,
    })
  }

  trackSignIn(method: string, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.USER_SIGNED_IN, {
      signin_method: method,
      ...properties,
    })
  }

  trackProfileCompletion(completionPercentage: number, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.USER_PROFILE_COMPLETED, {
      completion_percentage: completionPercentage,
      ...properties,
    })
  }

  // Tool usage tracking
  trackToolAccess(toolName: string, toolCategory: string, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.TOOL_ACCESSED, {
      [ANALYTICS_PROPERTIES.TOOL_NAME]: toolName,
      [ANALYTICS_PROPERTIES.TOOL_CATEGORY]: toolCategory,
      ...properties,
    })
  }

  trackToolAnalysis(toolName: string, analysisType: string, resultQuality: number, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.TOOL_ANALYSIS_COMPLETED, {
      [ANALYTICS_PROPERTIES.TOOL_NAME]: toolName,
      [ANALYTICS_PROPERTIES.ANALYSIS_TYPE]: analysisType,
      [ANALYTICS_PROPERTIES.RESULT_QUALITY]: resultQuality,
      ...properties,
    })
  }

  // Feature usage tracking
  trackAskTheSeer(questionType: string, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.ASK_THE_SEER_USED, {
      question_type: questionType,
      ...properties,
    })
  }

  trackDailyGuidance(guidanceType: string, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.DAILY_GUIDANCE_VIEWED, {
      guidance_type: guidanceType,
      ...properties,
    })
  }

  // Conversion tracking
  trackPricingView(tier: string, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.PRICING_VIEWED, {
      pricing_tier: tier,
      ...properties,
    })
  }

  trackSubscriptionStart(tier: string, amount: number, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, {
      subscription_tier: tier,
      amount: amount,
      ...properties,
    })
  }

  // Error tracking
  trackError(errorType: string, errorMessage: string, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_type: errorType,
      error_message: errorMessage,
      ...properties,
    })
  }

  trackApiError(apiEndpoint: string, statusCode: number, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.API_ERROR, {
      api_endpoint: apiEndpoint,
      status_code: statusCode,
      ...properties,
    })
  }

  // Performance tracking
  trackLoadTime(toolName: string, loadTime: number, properties?: Record<string, any>) {
    this.trackEvent(ANALYTICS_EVENTS.TOOL_LOAD_TIME, {
      [ANALYTICS_PROPERTIES.TOOL_NAME]: toolName,
      load_time_ms: loadTime,
      ...properties,
    })
  }

  // Utility methods
  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|phone/.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance()

// React Hook for easy usage
export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackToolAccess: analytics.trackToolAccess.bind(analytics),
    trackToolAnalysis: analytics.trackToolAnalysis.bind(analytics),
    trackAskTheSeer: analytics.trackAskTheSeer.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackLoadTime: analytics.trackLoadTime.bind(analytics),
  }
} 