'use client'

import { useActivityLogger } from '@/hooks/useActivityLogger'

/**
 * Renders nothing; records page_view / tool_open when user navigates to key routes.
 * Mount inside ClientProviders so auth and pathname are available.
 */
export function ActivityLogger() {
  useActivityLogger()
  return null
}
