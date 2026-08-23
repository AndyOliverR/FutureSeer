/**
 * POST /api/astro-numerology/analysis
 * Western astro-numerology narrative. Requires a signed-in Firebase user.
 * Stage B / on-demand generation calls generateAstroNumerologyAnalysis in-process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAstroNumerologyAnalysis } from '@/lib/astroNumerology/generateAstroNumerologyAnalysis';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { resolveOwnedUserId, verifyUserRequest } from '@/lib/userApiAuth';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RequestBody {
  userId?: string;
  birthDate?: string;
  fullName?: string;
  sunSign?: string;
}

async function handleAstroNumerologyAnalysis(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'astro-numerology-analysis');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as RequestBody;
    if (body.userId != null && body.userId !== '') {
      const owned = resolveOwnedUserId(body.userId, auth.uid);
      if (!owned) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const result = await generateAstroNumerologyAnalysis({
      userId: auth.uid,
      birthDate: typeof body.birthDate === 'string' ? body.birthDate : '',
      fullName: typeof body.fullName === 'string' ? body.fullName : '',
      sunSign: typeof body.sunSign === 'string' ? body.sunSign : undefined,
      useCache: true,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    devLog.error('❌ Astro-Numerology API error:', error, 'astro-numerology');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Astro-Numerology analysis',
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(
  handleAstroNumerologyAnalysis,
  rateLimiters.ai,
  'astro_numerology_analysis_post',
);
