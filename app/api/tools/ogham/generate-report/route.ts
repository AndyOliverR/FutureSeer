/**
 * Ogham Report Generation API
 * Generates comprehensive personalized Ogham reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { oghamIntelligence } from '@/lib/oghamIntelligence'
import { isProfileComplete, UserProfile } from '@/lib/firebase'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userProfile: providedProfile } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Use provided profile or require it
    const userProfile = providedProfile as UserProfile | null

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile is required' },
        { status: 400 }
      )
    }

    // Check profile completion
    if (!isProfileComplete(userProfile)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Complete birth profile required. Please complete your profile first.',
          missingFields: ['birthDate', 'birthTime', 'birthPlace']
        },
        { status: 400 }
      )
    }

    devLog.info('🔮 Generating Ogham report for user:', userId, 'ogham')

    // Generate comprehensive Ogham reading
    const report = await oghamIntelligence.generateReading(userId, userProfile)

    devLog.info('✅ Ogham report generated successfully', undefined, 'ogham')

    return NextResponse.json({
      success: true,
      data: {
        report,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('❌ Error generating Ogham report:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

