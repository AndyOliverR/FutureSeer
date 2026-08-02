import { NextRequest, NextResponse } from 'next/server'
import { userDataStorage } from '@/lib/userDataStorage'
import { devLog } from '@/lib/devLogger'
import { verifyUserRequest } from '@/lib/userApiAuth'
import { resolveOwnedUserId } from '@/lib/security/ownership'

/**
 * Destructive: clears persisted Vedic data for a user.
 * Requires a Firebase ID token whose UID matches body.userId.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'vedic-clear-cache')
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const requestedUserId = body?.userId
    const userId = resolveOwnedUserId(requestedUserId, auth.uid)
    if (!userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    devLog.info('Clearing cached Vedic data for user:', userId, 'vedic')

    await userDataStorage.storeVedicData(userId, null as any)

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
    })
  } catch (error) {
    devLog.error('Error clearing cache:', error, 'route')
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
