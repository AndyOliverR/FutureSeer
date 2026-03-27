import type { NextRequest } from "next/server"

const PROJECT_ID = "famous-infinity-444905-m3"
const SITE_KEY = "REDACTED_RECAPTCHA_SITE_KEY"

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get("host") ?? request.nextUrl.hostname ?? ""
  return host.startsWith("localhost") || host.startsWith("127.0.0.1")
}

/**
 * Verifies a reCAPTCHA Enterprise token (same rules as /api/auth/verify-captcha).
 */
export async function verifyRecaptchaEnterpriseToken(
  request: NextRequest,
  token: string | undefined,
  action: string
): Promise<{ ok: boolean; reason?: string }> {
  const nodeEnv = process.env.NODE_ENV as string | undefined
  if (isLocalhost(request) || nodeEnv === "development") {
    return { ok: true }
  }
  if (!token) {
    return { ok: false, reason: "missing_token" }
  }

  const apiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY
  if (!apiKey) {
    if (nodeEnv === "development") {
      return { ok: true }
    }
    return { ok: false, reason: "server_config" as const }
  }

  const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${apiKey}`

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        token,
        siteKey: SITE_KEY,
        expectedAction: action || "LOGIN",
      },
    }),
  })

  const data = (await response.json()) as {
    tokenProperties?: { valid?: boolean; invalidReason?: string }
    riskAnalysis?: { score?: number }
  }

  if (data.tokenProperties?.valid && (data.riskAnalysis?.score ?? 0) >= 0.5) {
    return { ok: true }
  }
  if (nodeEnv === "development") {
    return { ok: true }
  }
  return {
    ok: false,
    reason: data.tokenProperties?.invalidReason || "low_score",
  }
}
