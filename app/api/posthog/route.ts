import { type NextRequest, NextResponse } from "next/server"
import { PostHog } from "posthog-node"

// Initialize PostHog server-side client
let posthog: PostHog | null = null

if (process.env.POSTHOG_API_KEY) {
  posthog = new PostHog(process.env.POSTHOG_API_KEY, {
    host: process.env.POSTHOG_HOST || "https://app.posthog.com",
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!posthog) {
      return NextResponse.json({ error: "PostHog not configured" }, { status: 503 })
    }

    const { event, userId, properties } = await request.json()

    if (!event) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    // Track the event
    posthog.capture({
      distinctId: userId || "anonymous",
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        source: "futureseer-app",
      },
    })

    // Ensure events are sent
    await posthog.shutdown()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PostHog API error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
