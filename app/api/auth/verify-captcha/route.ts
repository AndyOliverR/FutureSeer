import { NextRequest, NextResponse } from "next/server"
import { logServerError } from "@/lib/serverErrorLogging"
import { verifyRecaptchaEnterpriseToken } from "@/lib/recaptcha/verifyEnterpriseCaptcha"

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get("host") ?? request.nextUrl.hostname ?? ""
  return host.startsWith("localhost") || host.startsWith("127.0.0.1")
}

export async function POST(request: NextRequest) {
  const nodeEnv = process.env.NODE_ENV as string | undefined
  try {
    if (isLocalhost(request) || nodeEnv === "development") {
      return NextResponse.json({ success: true, score: 1.0, message: "Local dev bypass" })
    }

    const { token, action } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const result = await verifyRecaptchaEnterpriseToken(request, token, action || "LOGIN")
    if (result.ok) {
      return NextResponse.json({ success: true, score: 1.0 })
    }

    if (result.reason === "server_config") {
      console.error("Missing RECAPTCHA_ENTERPRISE_API_KEY in environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (nodeEnv === "development") {
      return NextResponse.json({ success: true, score: 0.5, message: "Dev bypass (captcha failed)" })
    }
    return NextResponse.json(
      {
        success: false,
        error: "Security check failed",
        reason: result.reason || "Low score",
      },
      { status: 403 }
    )
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    try {
      await logServerError({
        area: "auth",
        action: "verify_captcha",
        message: error instanceof Error ? error.message : "Unknown reCAPTCHA error",
        route: request.nextUrl.pathname,
      })
    } catch {
      // ignore logging failures
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
