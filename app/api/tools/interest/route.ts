import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger'
import { adminDb } from '@/lib/firebase-admin'

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

    const timestamp = body.timestamp || new Date().toISOString()
    
    if (adminDb) {
      await adminDb.collection('toolInterests').add({
        techniqueName: String(body.techniqueName).trim(),
        techniqueSlug: String(body.techniqueSlug).trim(),
        email: body.email ? String(body.email).trim() : undefined,
        message: body.message ? String(body.message).trim() : undefined,
        userId: body.userId || undefined,
        createdAt: new Date(),
      })
    }
    
    devLog.info('✨ Tool Interest Received:', {
      techniqueName: body.techniqueName,
      techniqueSlug: body.techniqueSlug,
      email: body.email || 'Not provided',
      userId: body.userId || 'Anonymous',
      message: body.message || 'No message',
      timestamp: timestamp,
      url: request.headers.get('referer') || 'Unknown'
    }, 'tools')
    
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

