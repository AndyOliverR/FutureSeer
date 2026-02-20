/**
 * POST /api/tools/scrying/generate-report
 *
 * Generates a comprehensive scrying (crystal/mirror/water/fire divination) report
 * from user profile. Used by the profile generation pipeline.
 * No external APIs; in-house symbol ontology and context engine only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateScryingReport } from '@/lib/scrying/scryingReportGenerator';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userProfile = body?.userProfile ?? body;
    const fullName =
      userProfile?.fullName ?? userProfile?.full_name ?? userProfile?.displayName ?? '';
    const birthDate =
      userProfile?.birthDate ?? userProfile?.birth_date ?? '';
    const birthTime =
      userProfile?.birthTime ?? userProfile?.birth_time ?? '';
    const birthPlace =
      userProfile?.birthPlace ?? userProfile?.birth_place ?? '';
    const gender = userProfile?.gender ?? '';

    const profileForScrying = {
      fullName: typeof fullName === 'string' ? fullName : '',
      birthDate: typeof birthDate === 'string' ? birthDate : '',
      birthTime: typeof birthTime === 'string' ? birthTime : '',
      birthPlace: typeof birthPlace === 'string' ? birthPlace : '',
      gender: typeof gender === 'string' ? gender : '',
    };

    const report = generateScryingReport(profileForScrying, new Date());

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error('[scrying generate-report]', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to generate scrying report',
      },
      { status: 500 }
    );
  }
}
