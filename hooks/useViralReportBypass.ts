'use client'

import { useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { isNoChargeSubscriptionEmailClient } from '@/lib/subscriptionConfig'

/**
 * Skip viral teaser/blur/share when:
 * - Staff / comp / no-charge emails, or
 * - Paid subscription (`subscriptionStatus === 'active'`), or
 * - `noChargeAccount` (gateway skip / sponsored).
 *
 * Trial users (`subscriptionStatus === 'trial'`) do not bypass — teaser reports until they subscribe or use share-unlock.
 */
export function useViralReportBypass(): boolean {
  const { isSuperadmin, isAdmin, isSpecialUser, user, userProfile } = useAuth()
  return useMemo(() => {
    if (
      isSuperadmin ||
      isAdmin ||
      isSpecialUser ||
      isNoChargeSubscriptionEmailClient(user?.email ?? null)
    ) {
      return true
    }
    if (userProfile?.noChargeAccount) return true
    if (userProfile?.subscriptionStatus === 'active') return true
    return false
  }, [
    isSuperadmin,
    isAdmin,
    isSpecialUser,
    user?.email,
    userProfile?.noChargeAccount,
    userProfile?.subscriptionStatus,
  ])
}
