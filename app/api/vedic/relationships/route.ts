import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getVedicReportDoc } from '@/lib/vedic/vedicReportFirestore';
import type { ChartDataInput } from '@/lib/vedic/vedicChartContext';
import type { VedicBirthProfile } from '@/lib/vedic/vedicReportFirestore';
import { generateVedicFocusedReport } from '@/lib/vedic/generateVedicFocusedReport';
import {
  buildVedicRelationshipDeterministicFallback,
  buildVedicRelationshipPrompt,
  extractPersistedRelationshipAnalysis,
  mapVedicRelationshipParsed,
  readVedicRelationshipCache,
  VEDIC_RELATIONSHIP_CACHE_DOC_ID,
  VEDIC_RELATIONSHIP_REPORT_SCHEMA_VERSION,
  type PartnerContext,
  type VedicRelationshipAnalysis,
} from '@/lib/vedic/vedicRelationshipReport';

interface RelationshipsRequest {
  userId: string;
  vedicChartData?: ChartDataInput;
  userProfile?: VedicBirthProfile;
  partner?: PartnerContext;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as RelationshipsRequest;
    const { userId, vedicChartData, userProfile, partner } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    if (!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete birth data (date, time, place) is required' },
        { status: 400 },
      );
    }

    const inline = extractPersistedRelationshipAnalysis(vedicChartData);
    if (inline) {
      return NextResponse.json({
        success: true,
        data: { relationshipAnalysis: inline, timestamp: Date.now() },
      });
    }

    const profileDoc = await getVedicReportDoc(['users'], userId);
    if (profileDoc?.exists()) {
      const userDoc = profileDoc.data();
      const mysticalProfile = userDoc?.mysticalProfile as Record<string, unknown> | undefined;
      const persisted =
        extractPersistedRelationshipAnalysis(mysticalProfile) ??
        extractPersistedRelationshipAnalysis(userDoc);
      if (persisted) {
        return NextResponse.json({
          success: true,
          data: { relationshipAnalysis: persisted, timestamp: Date.now() },
        });
      }
    }

    const cached = await readVedicRelationshipCache(userId, userProfile);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: { relationshipAnalysis: cached, timestamp: Date.now() },
      });
    }

    const { analysis, source } = await generateVedicFocusedReport<VedicRelationshipAnalysis>({
      kind: 'relationships',
      label: 'vedic-relationships',
      cacheDocId: VEDIC_RELATIONSHIP_CACHE_DOC_ID,
      schemaVersion: VEDIC_RELATIONSHIP_REPORT_SCHEMA_VERSION,
      userId,
      userProfile,
      vedicChartData,
      buildPrompt: (chart, profile) => buildVedicRelationshipPrompt(chart, profile, partner),
      mapParsed: mapVedicRelationshipParsed,
      buildDeterministic: buildVedicRelationshipDeterministicFallback,
      analysisKey: 'relationshipAnalysis',
      readCache: readVedicRelationshipCache,
    });

    devLog.info(`✅ Vedic relationships report (${source}) for user:`, userId, 'vedic');

    return NextResponse.json({
      success: true,
      data: { relationshipAnalysis: analysis, timestamp: Date.now(), source },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate relationships report';
    devLog.error('❌ Vedic relationships report error:', error, 'vedic');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
