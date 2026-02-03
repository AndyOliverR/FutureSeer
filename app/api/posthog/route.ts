import { type NextRequest, NextResponse } from "next/server"
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const { event, properties } = await request.json()

    const posthogKey = process.env.POSTHOG_API_KEY
    const posthogHost = process.env.POSTHOG_HOST || "https://app.posthog.com"

    if (!posthogKey) {
      devLog.warn("[FutureSeer] PostHog API key not configured", undefined, 'posthog')
      return NextResponse.json({ success: false, error: "PostHog not configured" })
    }

    const response = await fetch(`${posthogHost}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${posthogKey}`,
      },
      body: JSON.stringify({
        api_key: posthogKey,
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          source: "futureseer_server",
        },
      }),
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error(`PostHog API error: ${response.status}`)
    }
  } catch (error) {
    console.error("[FutureSeer] PostHog server tracking failed:", error)
    return NextResponse.json({ success: false, error: "Tracking failed" })
  }
}
