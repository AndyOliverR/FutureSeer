import { NextRequest, NextResponse } from 'next/server';
import { logServerError } from '@/lib/serverErrorLogging';

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get('host') ?? request.nextUrl.hostname ?? '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export async function POST(request: NextRequest) {
  const nodeEnv = process.env.NODE_ENV as string | undefined;
  try {
    // Skip reCAPTCHA for local dev so it works without adding localhost to reCAPTCHA settings
    if (isLocalhost(request) || nodeEnv === 'development') {
      return NextResponse.json({ success: true, score: 1.0, message: 'Local dev bypass' });
    }

    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const apiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY;
    const projectID = "famous-infinity-444905-m3";
    const siteKey = "REDACTED_RECAPTCHA_SITE_KEY";

    if (!apiKey) {
      console.error('Missing RECAPTCHA_ENTERPRISE_API_KEY in environment variables');
      // In dev, we might want to skip verification if the key is missing
      if (nodeEnv === 'development') {
        return NextResponse.json({ success: true, score: 1.0, message: 'Dev mode bypass' });
      }
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          token: token,
          siteKey: siteKey,
          expectedAction: action || 'LOGIN',
        },
      }),
    });

    const data = await response.json();

    // reCAPTCHA Enterprise returns a risk score (0.0 to 1.0)
    // 1.0 is very likely a human, 0.0 is very likely a bot.
    if (data.tokenProperties?.valid && data.riskAnalysis?.score >= 0.5) {
      return NextResponse.json({
        success: true,
        score: data.riskAnalysis.score
      });
    }
    // In development, allow through when captcha fails (e.g. localhost not in allowed domains)
    if (nodeEnv === 'development') {
      return NextResponse.json({ success: true, score: 0.5, message: 'Dev bypass (captcha failed)' });
    }
    return NextResponse.json({
      success: false,
      error: 'Security check failed',
      reason: data.tokenProperties?.invalidReason || 'Low score'
    }, { status: 403 });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    try {
      await logServerError({
        area: 'auth',
        action: 'verify_captcha',
        message: error instanceof Error ? error.message : 'Unknown reCAPTCHA error',
        route: request.nextUrl.pathname,
      });
    } catch {
      // ignore logging failures
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
