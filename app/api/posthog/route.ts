import { NextRequest, NextResponse } from 'next/server'
import { PostHog } from 'posthog-node'

const client = new PostHog(
  process.env.POSTHOG_API_KEY || '',
  { host: 'https://app.posthog.com' }
)

export async function POST(request: NextRequest) {
  try {
    const { event, userId, properties } = await request.json()

    await client.capture({
      distinctId: userId,
      event: event,
      properties: properties || {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PostHog API error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
