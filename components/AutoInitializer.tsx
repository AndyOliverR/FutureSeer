"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function AutoInitializer() {
  const { user, loading } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const [needsRefresh, setNeedsRefresh] = useState(false)

  useEffect(() => {
    // Check if this is the first load
    const isFirstLoad = !sessionStorage.getItem('appInitialized')
    
    if (isFirstLoad) {
      // Mark as initialized
      sessionStorage.setItem('appInitialized', 'true')
      
      // Check if Firebase is available
      const checkFirebase = () => {
        try {
          // Try to access Firebase
          if (typeof window !== 'undefined' && (window as any).firebase) {
            setIsInitialized(true)
            console.log('✅ Firebase detected, app ready')
          } else {
            // If Firebase isn't ready, trigger a refresh after a short delay
            console.log('⚠️ Firebase not ready, refreshing...')
            setTimeout(() => {
              setNeedsRefresh(true)
              window.location.reload()
            }, 1000)
          }
        } catch (error) {
          // If there's an error, refresh once
          if (!sessionStorage.getItem('hasRefreshed')) {
            sessionStorage.setItem('hasRefreshed', 'true')
            console.log('⚠️ Firebase error, refreshing once...')
            setTimeout(() => {
              window.location.reload()
            }, 500)
          }
        }
      }

      // Check Firebase after a short delay
      setTimeout(checkFirebase, 500)
    } else {
      setIsInitialized(true)
    }
  }, [])

  // Register service worker for better caching and refresh handling
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('⚠️ Service Worker registration failed:', error)
        })
    }
  }, [])

  // Show loading state while initializing
  if (!isInitialized && needsRefresh) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200 font-serif text-lg">Initializing FutureSeer...</p>
          <p className="text-amber-300/60 text-sm mt-2">Please wait while we set up your mystical experience</p>
        </div>
      </div>
    )
  }

  return null
} 