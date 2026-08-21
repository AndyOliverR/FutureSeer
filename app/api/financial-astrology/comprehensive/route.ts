import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { callStructuredAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';
import {
  readAdminComprehensiveCache,
  writeAdminComprehensiveCache,
} from '@/lib/adminComprehensiveCache';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { computeNatalWealthProfile } from '@/lib/financialAstrology/natalWealthEngine';
import { computeMarketCycleProfile } from '@/lib/financialAstrology/marketCycleEngine';
import { computeAlignment } from '@/lib/financialAstrology/integrationEngine';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
import {
  buildFinancialReportSystemPrompt,
  getFinancialDisclaimer,
} from '@/lib/financialAstrology/financialAstrologyPrompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface FinancialComprehensiveRequest {
  userId: string;
  userProfile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    birthLatitude?: number;
    birthLongitude?: number;
    displayName?: string;
    fullName?: string;
  };
  birthData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude?: number;
    longitude?: number;
  };
}

function getSignStr(obj: string | { signName?: string } | undefined): string {
  if (!obj) return 'Unknown';
  if (typeof obj === 'string') return obj;
  return (obj as { signName?: string }).signName ?? 'Unknown';
}

function toPlanetInChart(p: any): { name: string; sign?: string | { signName?: string }; house?: number; longitude?: number; degree?: number; isRetrograde?: boolean } {
  return {
    name: p.name,
    sign: p.sign,
    house: p.house != null ? Number(p.house) : undefined,
    longitude: p.longitude,
    degree: p.degree,
    isRetrograde: p.isRetrograde,
  };
}

function toHouseInChart(h: any, idx: number): { number: number; sign?: string | { signName?: string }; cusp?: number; longitude?: number } {
  return {
    number: h.number ?? idx + 1,
    sign: h.sign,
    cusp: h.cusp ?? h.degree,
    longitude: h.longitude,
  };
}

function formatChartContext(planets: any[], houses: any[], aspects: any[]): string {
  const planetsText = (planets || [])
    .map(
      (p) =>
        `${p.name}: ${getSignStr(p.sign)} in House ${p.house ?? 'N/A'} at ${p.degree?.toFixed?.(1) ?? 'N/A'}°`
    )
    .join('\n');
  const housesText = (houses || [])
    .map(
      (h, idx) =>
        `House ${h.number ?? idx + 1}: ${getSignStr(h.sign)} cusp at ${h.degree?.toFixed?.(1) ?? h.cusp ?? 'N/A'}°`
    )
    .join('\n');
  const aspectsText = (aspects || [])
    .slice(0, 15)
    .map(
      (a) =>
        `${a.planet1 || 'Planet1'} ${a.type || 'aspect'} ${a.planet2 || 'Planet2'} (${a.orb?.toFixed?.(2) ?? 'N/A'}° orb)`
    )
    .join('\n');
  return `PLANETS:\n${planetsText || 'None'}\n\nHOUSES:\n${housesText || 'None'}\n\nASPECTS:\n${aspectsText || 'None'}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: FinancialComprehensiveRequest = await request.json();
    const { userId, userProfile, birthData: bodyBirthData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const freshCached = await readAdminComprehensiveCache(userId, 'financialAstrologyReports', 'comprehensive', {
      extract: (d) => (d.comprehensiveAnalysis as Record<string, unknown>) ?? null,
    });
    if (freshCached) {
      return NextResponse.json({
        success: true,
        data: { comprehensiveAnalysis: freshCached, timestamp: Date.now() },
      });
    }

    const birthData: BirthData | null = bodyBirthData
      ? {
          birthDate: bodyBirthData.birthDate,
          birthTime: bodyBirthData.birthTime || '12:00:00',
          birthPlace: bodyBirthData.birthPlace,
          latitude: bodyBirthData.latitude ?? 0,
          longitude: bodyBirthData.longitude ?? 0,
        }
      : userProfile?.birthDate && userProfile?.birthPlace
        ? {
            birthDate: userProfile.birthDate,
            birthTime: userProfile.birthTime || '12:00:00',
            birthPlace: userProfile.birthPlace,
            latitude: userProfile.birthLatitude ?? 0,
            longitude: userProfile.birthLongitude ?? 0,
          }
        : null;

    if (!birthData) {
      return NextResponse.json(
        { success: false, error: 'Missing birthData or userProfile with birth date and place' },
        { status: 400 }
      );
    }

    // Geocode when latitude/longitude are missing so the occult API receives valid coordinates
    let finalBirthData = birthData;
    if ((birthData.latitude === 0 && birthData.longitude === 0) && birthData.birthPlace) {
      try {
        const { geocodePlace } = await import('@/services/geocoding');
        const coords = await geocodePlace(birthData.birthPlace);
        if (coords) {
          finalBirthData = {
            ...birthData,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      } catch (geoErr) {
        devLog.warn('Financial astrology: geocoding failed, using 0,0', geoErr, 'route');
      }
    }

    const westernRes = await universalOccultService.calculateWesternChart(finalBirthData, {
      houseSystem: 'placidus',
      includeAspects: true,
    });
    const data = westernRes?.data ?? westernRes;
    const rawPlanets = data?.planets ?? [];
    const rawHouses = data?.houses ?? [];
    const aspects = data?.aspects ?? [];

    if (!rawPlanets.length) {
      return NextResponse.json(
        { success: false, error: 'No planetary chart data available' },
        { status: 400 }
      );
    }

    const planets = rawPlanets.map(toPlanetInChart);
    const houses = rawHouses.map((h: any, idx: number) => toHouseInChart(h, idx));

    const natalWealth = computeNatalWealthProfile(planets, houses);
    const marketCycle = computeMarketCycleProfile(new Date());
    const alignment = computeAlignment(natalWealth, marketCycle);

    const chartContext = formatChartContext(rawPlanets, rawHouses, aspects);
    const precomputed = { natalWealth, marketCycle, alignment, chartSummary: chartContext };
    const systemPrompt = buildFinancialReportSystemPrompt(chartContext, precomputed);

    const buildDeterministicStrategic = (): Record<string, unknown> => ({
      strategic_recommendations: [
        `Based on your composite score (${alignment.compositeScore}/100) and ${alignment.actionBias} bias: prioritize ${alignment.riskBand}-risk approaches.`,
        natalWealth.temperamentSummary,
        `Market phase: ${marketCycle.currentPhase}. ${alignment.timingWindow}`,
        'Diversification and periodic review are recommended.',
        'Consult a licensed financial advisor for specific decisions.',
      ],
      high_volatility_warnings: marketCycle.volatilityWindows.map(
        (w) => `${w.name}: ${w.description}`,
      ),
      opportunity_windows:
        marketCycle.currentPhase === 'Expansion'
          ? ['Current expansion phase may favor gradual accumulation.']
          : [],
      avoid_periods: marketCycle.volatilityWindows
        .filter((w) => w.severity === 'high')
        .map((w) => w.name + (w.startDate ? ` (${w.startDate}–${w.endDate ?? ''})` : '')),
      wealth_building_strategy: alignment.rationale + natalWealth.temperamentSummary,
      risk_management_tips: [
        'Maintain an emergency fund; avoid over-leveraging.',
        'During high volatility windows, favor review over new commitments.',
        'Align decisions with your financial temperament and risk band.',
      ],
    });

    const mergeStrategicFromParsed = (parsed: Record<string, unknown>): Record<string, unknown> => {
      const base = buildDeterministicStrategic();
      return {
        strategic_recommendations: Array.isArray(parsed.strategic_recommendations)
          ? parsed.strategic_recommendations
          : base.strategic_recommendations,
        high_volatility_warnings: Array.isArray(parsed.high_volatility_warnings)
          ? parsed.high_volatility_warnings
          : base.high_volatility_warnings,
        opportunity_windows: Array.isArray(parsed.opportunity_windows)
          ? parsed.opportunity_windows
          : base.opportunity_windows,
        avoid_periods: Array.isArray(parsed.avoid_periods)
          ? parsed.avoid_periods
          : base.avoid_periods,
        wealth_building_strategy:
          typeof parsed.wealth_building_strategy === 'string'
            ? parsed.wealth_building_strategy
            : (base.wealth_building_strategy as string),
        risk_management_tips: Array.isArray(parsed.risk_management_tips)
          ? parsed.risk_management_tips
          : base.risk_management_tips,
      };
    };

    const strategicResolved = await resolveAiReportWithFallback({
      label: 'financial-comprehensive',
      userId,
      tryLlm: async () => {
        const structured = await callStructuredAI({
          label: 'financial-comprehensive',
          model: GROQ_DEFAULT_TEXT_MODEL,
          userId,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in Financial Astrology. Respond only with a single valid JSON object, no other text. Do not include markdown.',
            },
            { role: 'user', content: systemPrompt },
          ],
          temperature: 0.6,
          maxTokens: 1200,
          responseFormat: { type: 'json_object' },
          maxAttempts: 3,
        });

        if (structured.ok && structured.raw) {
          return {
            data: mergeStrategicFromParsed(structured.raw),
            attempts: structured.attempts,
            failureMode: 'none',
          };
        }
        if (structured.failureMode !== 'none') {
          devLog.warn(
            `financial-comprehensive structured AI: ${structured.failureMode} after ${structured.attempts} attempt(s)`,
            undefined,
            'route',
          );
        }
        return {
          data: null,
          attempts: structured.attempts,
          failureMode: structured.failureMode,
          parsingFailed: true,
        };
      },
      readFirestoreCache: async () => {
        const cached = await readAdminComprehensiveCache(
          userId,
          'financialAstrologyReports',
          'comprehensive',
          {
            allowStale: true,
            extract: (d) => {
              const analysis = d.comprehensiveAnalysis as Record<string, unknown> | undefined;
              const strategic = analysis?.strategicRecommendations as Record<string, unknown> | undefined;
              return strategic ?? null;
            },
          },
        );
        return cached;
      },
      buildDeterministic: buildDeterministicStrategic,
    });

    const strategicSection = strategicResolved.data;

    const comprehensiveAnalysis = {
      financialTemperamentProfile: {
        incomeStabilityScore: natalWealth.incomeStabilityScore,
        speculativeRiskIndex: natalWealth.speculativeRiskIndex,
        longTermAccumulationScore: natalWealth.longTermAccumulationScore,
        liquidityStressIndex: natalWealth.liquidityStressIndex,
        temperamentSummary: natalWealth.temperamentSummary,
      },
      wealthHouses: natalWealth.wealthHouses,
      wealthPlanets: natalWealth.wealthPlanets,
      currentMarketPhase: marketCycle.currentPhase,
      alignmentScore: {
        compositeScore: alignment.compositeScore,
        actionBias: alignment.actionBias,
        riskBand: alignment.riskBand,
        timingWindow: alignment.timingWindow,
        rationale: alignment.rationale,
      },
      volatilityWindows: marketCycle.volatilityWindows,
      climateMap12Months: marketCycle.next12MonthsOverview,
      strategicRecommendations: strategicSection,
      legalDisclaimer: getFinancialDisclaimer(),
      generatedAt: new Date().toISOString(),
    };

    if (strategicResolved.degraded && strategicResolved.source !== 'llm') {
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis,
          timestamp: Date.now(),
          parsingFailed: strategicResolved.parsingFailed ?? true,
          fallbackSource: strategicResolved.source,
          error:
            strategicResolved.source === 'firestore_cache'
              ? 'Using last saved report; AI narrative refresh failed'
              : 'Failed to parse AI response, using chart-based financial guidance',
        },
      });
    }

    await writeAdminComprehensiveCache(userId, 'financialAstrologyReports', 'comprehensive', {
      comprehensiveAnalysis,
    });

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    devLog.error('Financial astrology comprehensive API error:', err, 'route');
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to generate financial astrology report',
      },
      { status: 500 }
    );
  }
}
