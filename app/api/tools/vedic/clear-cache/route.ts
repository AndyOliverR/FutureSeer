import { NextRequest, NextResponse } from 'next/server'
import { userDataStorage } from '@/lib/userDataStorage'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    devLog.info('Clearing cached Vedic data for user:', userId, 'vedic')

    // Clear the cached data by setting it to null
    await userDataStorage.storeVedicData(userId, null as any)

    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleared successfully' 
    })

  } catch (error) {
    devLog.error('Error clearing cache:', error, 'route')
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
