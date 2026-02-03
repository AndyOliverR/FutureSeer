import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger'

interface ToolInterestData {
  techniqueName: string
  techniqueSlug: string
  email?: string
  message?: string
  userId?: string
  timestamp?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ToolInterestData = await request.json()
    
    // Validate required fields
    if (!body.techniqueName || !body.techniqueSlug) {
      return NextResponse.json(
        { error: 'Technique name and slug are required' },
        { status: 400 }
      )
    }

    // TODO: In production, you would:
    // 1. Save to your database (Firebase Firestore, PostgreSQL, etc.)
    // 2. Send notification to your team
    // 3. Add user authentication/authorization
    // 4. Track interest metrics for prioritization
    
    const timestamp = body.timestamp || new Date().toISOString()
    
    devLog.info('✨ Tool Interest Received:', {
      techniqueName: body.techniqueName,
      techniqueSlug: body.techniqueSlug,
      email: body.email || 'Not provided',
      userId: body.userId || 'Anonymous',
      message: body.message || 'No message',
      timestamp: timestamp,
      url: request.headers.get('referer') || 'Unknown'
    }, 'tools')

    // For now, we'll just log the interest
    // In production, implement proper storage and notification system
    // Example: await saveToFirestore('tool_interests', { ...body, timestamp })
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your interest! We\'ll notify you when this tool becomes available.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Tool interest submission error:', error)
    
    return NextResponse.json(
      { error: 'Failed to submit interest. Please try again.' },
      { status: 500 }
    )
  }
}

