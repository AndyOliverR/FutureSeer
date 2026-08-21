/**
 * POST /api/mundane-astrology/comprehensive
 * Generate mundane astrology report: Aries Ingress + national context + risk scores + narrative.
 * Chart is cast for the user's current residence when set, else birth place (geocoded), not a silent US default.
 *
 * Requires a valid Firebase Bearer token. Stage B calls generateMundaneComprehensive in-process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMundaneComprehensive } from '@/lib/mundane/generateMundaneComprehensive';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { resolveOwnedUserId, verifyUserRequest } from '@/lib/userApiAuth';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RequestBody {
  userId?: string;
  userProfile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    birthLatitude?: number;
    birthLongitude?: number;
    currentLocation?: string;
  };
  birthData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude?: number;
    longitude?: number;
  };
}

async function handleMundaneComprehensiveRequest(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'mundane-comprehensive');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as RequestBody;
    if (body.userId != null && body.userId !== '') {
      const owned = resolveOwnedUserId(body.userId, auth.uid);
      if (!owned) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const result = await generateMundaneComprehensive({
      userProfile: body.userProfile,
      birthData: body.birthData,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis: result.comprehensiveAnalysis,
      },
    });
  } catch (err) {
    devLog.error('Mundane astrology comprehensive error', err, 'mundane-astrology');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Mundane report generation failed' },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(
  handleMundaneComprehensiveRequest,
  rateLimiters.ai,
  'mundane_comprehensive_post',
);
