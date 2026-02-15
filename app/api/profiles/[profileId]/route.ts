import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger';
import { profileManager } from '@/lib/services/profileManager'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ profileId: '_' }]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { profileId } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const profile = await profileManager.getAdditionalProfile(userId, profileId)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    devLog.error('Error fetching profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params
    const body = await request.json()
    const { userId, ...updates } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const profile = await profileManager.updateAdditionalProfile(userId, profileId, updates)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    devLog.error('Error updating profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const success = await profileManager.deleteAdditionalProfile(userId, profileId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    devLog.error('Error deleting profile:', error, 'route')
    return NextResponse.json(
      { error: error.message || 'Failed to delete profile' },
      { status: 500 }
    )
  }
}

