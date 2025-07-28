import { NextRequest, NextResponse } from 'next/server'

interface FeedbackData {
  type: 'suggestion' | 'bug' | 'feature' | 'general'
  title: string
  description: string
  screenshot: string | null
  userAgent: string
  url: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackData = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // TODO: In production, you would:
    // 1. Save to your database (Firebase, PostgreSQL, etc.)
    // 2. Send notification to your team
    // 3. Store screenshot in cloud storage (AWS S3, Firebase Storage, etc.)
    // 4. Add user authentication/authorization
    
    console.log('📝 Feedback Received:', {
      type: body.type,
      title: body.title,
      description: body.description,
      url: body.url,
      timestamp: body.timestamp,
      hasScreenshot: !!body.screenshot,
      userAgent: body.userAgent
    })

    // For now, we'll just log the feedback
    // In production, implement proper storage and notification system
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback received successfully! We\'ll review it soon.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Feedback submission error:', error)
    
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    )
  }
} 