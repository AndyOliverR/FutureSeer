/**
 * POST /api/tools/bibliomancy/generate-report
 *
 * Generates a comprehensive bibliomancy report from user profile using local
 * sacred texts (Bible, Quran, Bhagavad Gita, Torah, Hafez). Build-safe;
 * no runtime scraping or external APIs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBibliomancyReport } from '@/lib/bibliomancy/bibliomancyReportGenerator';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userProfile = body?.userProfile ?? body;
    const userId = body?.userId ?? userProfile?.userId ?? userProfile?.uid ?? 'anonymous';
    const fullName =
      userProfile?.fullName ?? userProfile?.full_name ?? userProfile?.displayName ?? '';
    const birthDate =
      userProfile?.birthDate ?? userProfile?.birth_date ?? '';
    const birthTime =
      userProfile?.birthTime ?? userProfile?.birth_time ?? '';
    const birthPlace =
      userProfile?.birthPlace ?? userProfile?.birth_place ?? '';

    const profileForBibliomancy = {
      fullName: typeof fullName === 'string' ? fullName : '',
      birthDate: typeof birthDate === 'string' ? birthDate : '',
      birthTime: typeof birthTime === 'string' ? birthTime : '',
      birthPlace: typeof birthPlace === 'string' ? birthPlace : '',
      userId: typeof userId === 'string' ? userId : 'anonymous',
    };

    const report = generateBibliomancyReport(
      profileForBibliomancy,
      new Date()
    );

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error('[bibliomancy generate-report]', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to generate bibliomancy report',
      },
      { status: 500 }
    );
  }
}
