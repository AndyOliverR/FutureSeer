/**
 * Ogham Report Generation API
 * Generates comprehensive personalized Ogham reports
 *
 * Requires a signed-in Firebase user — must not be an unauthenticated Groq
 * proxy or Admin Firestore IDOR via body userId (oghamReadings R/W).
 *
 * Trusted server callers (Stage B) should import `oghamIntelligence.generateReading`
 * directly instead of HTTP-looping through this route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { oghamIntelligence } from '@/lib/oghamIntelligence'
import { isProfileComplete, UserProfile } from '@/lib/firebase'
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'
import { devLog } from '@/lib/devLogger'

async function handlePost(request: NextRequest) {
  const auth = await verifyUserRequest(request, 'ogham-generate-report')
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const ownedUserId = resolveOwnedUserId(body.userId, auth.uid)
    if (!ownedUserId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const userProfile = body.userProfile as UserProfile | null

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile is required' },
        { status: 400 },
      )
    }

    if (!isProfileComplete(userProfile)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Complete birth profile required. Please complete your profile first.',
          missingFields: ['birthDate', 'birthTime', 'birthPlace'],
        },
        { status: 400 },
      )
    }

    devLog.info('🔮 Generating Ogham report for user:', ownedUserId, 'ogham')

    const report = await oghamIntelligence.generateReading(ownedUserId, userProfile)

    devLog.info('✅ Ogham report generated successfully', undefined, 'ogham')

    return NextResponse.json({
      success: true,
      data: {
        report,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    devLog.error('❌ Error generating Ogham report:', error, 'route')

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

export const POST = withRateLimit(handlePost, rateLimiters.ai, 'ogham_generate_report_post')

