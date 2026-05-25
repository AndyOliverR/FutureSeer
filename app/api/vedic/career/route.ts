import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getVedicReportDoc } from '@/lib/vedic/vedicReportFirestore';
import {
  buildVedicCareerDeterministicFallback,
  buildVedicCareerPrompt,
  extractPersistedCareerAnalysis,
  mapVedicCareerParsed,
  readVedicCareerCache,
  VEDIC_CAREER_CACHE_DOC_ID,
  VEDIC_CAREER_REPORT_SCHEMA_VERSION,
  type VedicCareerAnalysis,
} from '@/lib/vedic/vedicCareerReport';
import { generateVedicFocusedReport } from '@/lib/vedic/generateVedicFocusedReport';
import type { ChartDataInput } from '@/lib/vedic/vedicChartContext';
import type { VedicBirthProfile } from '@/lib/vedic/vedicReportFirestore';

interface CareerRequest {
  userId: string;
  vedicChartData?: ChartDataInput;
  userProfile?: VedicBirthProfile & { currentRole?: string; skills?: string };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CareerRequest;
    const { userId, vedicChartData, userProfile } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    if (!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete birth data (date, time, place) is required' },
        { status: 400 },
      );
    }

    const inline = extractPersistedCareerAnalysis(vedicChartData);
    if (inline) {
      return NextResponse.json({
        success: true,
        data: { careerAnalysis: inline, timestamp: Date.now() },
      });
    }

    const profileDoc = await getVedicReportDoc(['users'], userId);
    if (profileDoc?.exists()) {
      const userDoc = profileDoc.data();
      const mysticalProfile = userDoc?.mysticalProfile as Record<string, unknown> | undefined;
      const persisted =
        extractPersistedCareerAnalysis(mysticalProfile) ?? extractPersistedCareerAnalysis(userDoc);
      if (persisted) {
        return NextResponse.json({
          success: true,
          data: { careerAnalysis: persisted, timestamp: Date.now() },
        });
      }
    }

    const cached = await readVedicCareerCache(userId, userProfile);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: { careerAnalysis: cached, timestamp: Date.now() },
      });
    }

    const { analysis, source } = await generateVedicFocusedReport<VedicCareerAnalysis>({
      kind: 'career',
      label: 'vedic-career',
      cacheDocId: VEDIC_CAREER_CACHE_DOC_ID,
      schemaVersion: VEDIC_CAREER_REPORT_SCHEMA_VERSION,
      userId,
      userProfile,
      vedicChartData,
      buildPrompt: buildVedicCareerPrompt,
      mapParsed: mapVedicCareerParsed,
      buildDeterministic: buildVedicCareerDeterministicFallback,
      analysisKey: 'careerAnalysis',
      readCache: readVedicCareerCache,
    });

    devLog.info(`✅ Vedic career report (${source}) for user:`, userId, 'vedic');

    return NextResponse.json({
      success: true,
      data: { careerAnalysis: analysis, timestamp: Date.now(), source },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate career report';
    devLog.error('❌ Vedic career report error:', error, 'vedic');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
