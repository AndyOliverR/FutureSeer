import type { NextRequest } from "next/server";

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get("host") ?? request.nextUrl.hostname ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

function parseMinScore(raw: string | undefined, fallback: number): number {
  if (raw == null || raw === "") return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function minScoreForAction(action: string, fallback: number): number {
  const byAction: Record<string, string | undefined> = {
    LOGIN: process.env.RECAPTCHA_MIN_SCORE_LOGIN,
    SIGNUP: process.env.RECAPTCHA_MIN_SCORE_SIGNUP,
    COMMUNITY_DISCUSSION: process.env.RECAPTCHA_MIN_SCORE_COMMUNITY,
    COMMUNITY_COMMENT: process.env.RECAPTCHA_MIN_SCORE_COMMUNITY,
  };
  const specific = byAction[action];
  if (specific != null && specific !== "") {
    return parseMinScore(specific, fallback);
  }
  return parseMinScore(process.env.RECAPTCHA_MIN_SCORE, fallback);
}

/**
 * Verifies a reCAPTCHA Enterprise token (same rules as /api/auth/verify-captcha).
 */
export async function verifyRecaptchaEnterpriseToken(
  request: NextRequest,
  token: string | undefined,
  action: string
): Promise<{ ok: boolean; reason?: string }> {
  const nodeEnv = process.env.NODE_ENV as string | undefined;
  if (isLocalhost(request) || nodeEnv === "development") {
    return { ok: true };
  }

  if (!token) {
    return { ok: false, reason: "missing_token" };
  }

  const apiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY;
  const projectId =
    process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!apiKey || !projectId || !siteKey) {
    return { ok: false, reason: "server_config" as const };
  }

  const minScore = minScoreForAction(action, 0.5);
  const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        token,
        siteKey,
        expectedAction: action || "LOGIN",
      },
    }),
  });

  const data = (await response.json()) as {
    tokenProperties?: { valid?: boolean; invalidReason?: string; action?: string };
    riskAnalysis?: { score?: number };
  };

  const score = data.riskAnalysis?.score ?? 0;
  const valid = data.tokenProperties?.valid === true;
  if (valid && score >= minScore) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: data.tokenProperties?.invalidReason || "low_score",
  };
}
