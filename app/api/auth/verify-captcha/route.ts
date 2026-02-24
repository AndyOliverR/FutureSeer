import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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
      if (process.env.NODE_ENV === 'development') {
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
    } else {
      return NextResponse.json({
        success: false,
        error: 'Security check failed',
        reason: data.tokenProperties?.invalidReason || 'Low score'
      }, { status: 403 });
    }

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
