'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { saveUserActivity } from '@/lib/firebase'

/**
 * Records a page_view or tool_open activity when the user lands on a key route.
 * Call once per page/layout; records at most once per mount for the current path.
 */
export function useActivityLogger() {
  const pathname = usePathname()
  const { user } = useAuth()
  const loggedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user?.uid || !pathname) return
    if (loggedRef.current === pathname) return
    loggedRef.current = pathname

    const path = pathname as string
    if (path.startsWith('/tools/')) {
      const toolSlug = path.split('/').filter(Boolean)[1]
      if (toolSlug) {
        saveUserActivity(user.uid, 'tool_open', { toolSlug }).catch(() => {})
      }
    } else if (
      ['/', '/dashboard', '/history', '/ask-the-seer', '/seer', '/profile', '/settings', '/tools', '/pricing'].includes(path)
    ) {
      saveUserActivity(user.uid, 'page_view', { path }).catch(() => {})
    }
  }, [user?.uid, pathname])
}
