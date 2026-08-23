/**
 * POST /api/vedic-astro-numerology/analysis
 * Vedic astro-numerology narrative. Requires a signed-in Firebase user.
 * Stage B / on-demand generation calls generateVedicAstroNumerologyAnalysis in-process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateVedicAstroNumerologyAnalysis } from '@/lib/vedicAstroNumerology/generateVedicAstroNumerologyAnalysis';
import type { VedicNumerologyProfile } from '@/lib/vedicNumerologyCalculations';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { resolveOwnedUserId, verifyUserRequest } from '@/lib/userApiAuth';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RequestBody {
  userId?: string;
  birthDate?: string;
  fullName?: string;
  moonSign?: string;
  lagnaSign?: string;
  sunSign?: string;
  numerologyProfile?: VedicNumerologyProfile;
}

async function handleVedicAstroNumerologyAnalysis(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'vedic-astro-numerology-analysis');
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

    const result = await generateVedicAstroNumerologyAnalysis({
      userId: auth.uid,
      birthDate: typeof body.birthDate === 'string' ? body.birthDate : '',
      fullName: typeof body.fullName === 'string' ? body.fullName : '',
      moonSign: typeof body.moonSign === 'string' ? body.moonSign : '',
      lagnaSign: typeof body.lagnaSign === 'string' ? body.lagnaSign : '',
      sunSign: typeof body.sunSign === 'string' ? body.sunSign : '',
      numerologyProfile: body.numerologyProfile as VedicNumerologyProfile,
      useCache: true,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    devLog.error('❌ Vedic Astro-Numerology API error:', error, 'vedic-astro-numerology');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Vedic Astro-Numerology analysis',
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(
  handleVedicAstroNumerologyAnalysis,
  rateLimiters.ai,
  'vedic_astro_numerology_analysis_post',
);
