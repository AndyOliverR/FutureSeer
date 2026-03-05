/**
 * POST /api/astrocartography/comprehensive
 * Generate comprehensive astrocartography report from birth data.
 * Uses Western chart context; report emphasizes location-based activation, not prediction.
 */

import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAICompletion } from '@/lib/aiGateway';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { adminDb } from '@/lib/firebase-admin';
import { REPORT_VOICE_RULE } from '@/lib/reportVoiceRule';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface AstrocartographyComprehensiveRequest {
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

function formatChartContextForAstro(planets: any[], houses: any[]): string {
  const planetsText = (planets || [])
    .map(
      (p) =>
        `${p.name}: ${p.sign?.signName || p.sign} in House ${p.house ?? 'N/A'} at ${p.degree?.toFixed?.(1) ?? 'N/A'}°`
    )
    .join('\n');
  const housesText = (houses || [])
    .map(
      (h, idx) =>
        `House ${h.number ?? idx + 1}: ${h.sign?.signName || h.sign} cusp at ${h.degree?.toFixed?.(1) ?? 'N/A'}°`
    )
    .join('\n');
  return `PLANETS:\n${planetsText || 'None'}\n\nHOUSES:\n${housesText || 'None'}`;
}

function buildCover(
  _userProfile: AstrocartographyComprehensiveRequest['userProfile'],
  birthData: BirthData
): Record<string, string> {
  return {
    reportFor: 'you',
    birthDate: birthData.birthDate,
    birthTime: birthData.birthTime || '',
    birthPlace: birthData.birthPlace,
    calculationNote: 'Tropical zodiac, Placidus houses.',
  };
}

function buildAstrocartographyReportPrompt(chartContext: string): string {
  return `${REPORT_VOICE_RULE}

You are an expert in Astrocartography (location-based astrology). Generate a comprehensive, simple-to-understand report based on the birth chart below. Use a "zoom-in" structure: global view → specific lines → personal meaning.

CRITICAL: Astrocartography shows WHERE certain energies ACTIVATE, not what will happen. Use language of activation and influence, never guarantees or predictions.

BIRTH CHART CONTEXT:
${chartContext}

Respond with a single JSON object (no markdown, no code fence) with exactly these keys. All string values should be concise and user-friendly.

1. "overview" (string): 2–4 sentences on how your chart translates to geographic activation—key angles (MC, IC, ASC, DSC) and what they mean for place. Address the reader as "you". Emphasize activation, not outcomes.

2. "keyPlanetaryLines" (array of objects): Each object has "angle" (string: "MC" | "IC" | "ASC" | "DSC"), "planet" (string), "theme" (string). Describe 4–8 key line themes based on the chart (e.g. Jupiter MC: career expansion; Venus ASC: social harmony). Focus on what each line ACTIVATES.

3. "themesByRegion" (string): 2–3 paragraphs on general regional themes—e.g. where career, love, or retreat energies tend to be stronger based on the angles. Keep it general; no exact predictions.

4. "relocationGuidance" (string): 2–3 paragraphs of practical guidance for using astrocartography when considering a move or travel. Emphasize that locations activate energies; success still depends on effort and context. No guarantees.

5. "howToReadMap" (string): Plain-language explanation of how to read an astrocartography map—line colors/labels, crossings, and what closely spaced lines mean (intensity). Non-jargon, 2–4 sentences.

6. "angleExplanations" (string): Short definitions. ASC = self & identity (how you feel/look); DSC = relationships & others (who you meet); MC = career & public image (how the world sees you); IC = home & family (private life/roots). One line per angle is enough.

7. "planetaryKey" (string): Brief meaning per planet in one short phrase each: Sun (vitality, identity), Moon (emotions, roots), Mercury (communication, learning), Venus (love, aesthetics), Mars (assertion, courage), Jupiter (expansion, luck), Saturn (structure, discipline), Uranus (change, innovation), Neptune (imagination, dissolution), Pluto (transformation). Format as a short paragraph or bullet-friendly list.

8. "orbOfInfluence" (string): One sentence stating that influence is typically strong within about 300–500 miles (approx. 450–800 km) of a line.

9. "bestPlacesSummary" (string): Short bullet-friendly summary: "Best for Career," "Best for Love/Relationships," "Best for Spiritual Growth," and "Approach with Caution" (or similar), based on this chart. 2–4 bullets per category if possible.

10. "locationHighlights" (array of objects): Optional. Each object has "regionOrCity" (string), "line" (string, e.g. "Sun on MC"), "interpretation" (string). 3–6 example locations with one-line interpretations (e.g. "New York: Sun on MC – career visibility, less privacy"). If no specific cities fit the chart, use general regions.

11. "crossLineDynamics" (string): 1–2 paragraphs on where your lines cluster or cross, and how overlapping energies blend or create tension. Address the reader as "you". Activation language only.

12. "practicalScenarios" (string): Use cases in 1–2 paragraphs: relocation for career, travel for emotional reset, places that support relationship building, zones that challenge identity growth. Actionable but not deterministic.

13. "limitations" (string): 1–2 sentences: this is interpretive, not deterministic; local culture, economics, and personal choice matter. Grounding note.

14. "summarySnapshot" (string): One-page bullet summary—best geographic zones for career, best for relationships, regions to approach cautiously. Concise bullets only.`;
}

function parseReportResponse(content: string): Record<string, unknown> {
  const trimmed = content.trim();
  let jsonStr = trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlock?.[1]) jsonStr = codeBlock[1];
  else {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match?.[0]) jsonStr = match[0];
  }
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(jsonStr) as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: AstrocartographyComprehensiveRequest = await request.json();
    const { userId, userProfile, birthData: bodyBirthData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
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

    const westernRes = await universalOccultService.calculateWesternChart(birthData, {
      houseSystem: 'placidus',
      includeAspects: true,
    });
    const data = westernRes?.data ?? westernRes;
    const planets = data?.planets ?? [];
    const houses = data?.houses ?? [];

    if (!planets.length) {
      return NextResponse.json(
        { success: false, error: 'No planetary chart data available' },
        { status: 400 }
      );
    }

    const chartContext = formatChartContextForAstro(planets, houses);
    const systemPrompt = buildAstrocartographyReportPrompt(chartContext);

    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert in Astrocartography. Respond only with a single valid JSON object, no other text.' },
        { role: 'user', content: systemPrompt },
      ],
      temperature: 0.5,
      maxTokens: 3600,
      responseFormat: { type: 'json_object' },
    });

    const content = result.content || '';
    let comprehensiveAnalysis: Record<string, unknown>;
    const cover = buildCover(userProfile ?? undefined, birthData);

    try {
      comprehensiveAnalysis = parseReportResponse(content);
      Object.assign(comprehensiveAnalysis, { cover });
    } catch {
      const sunPlanet = planets.find((p: any) => p.name?.toLowerCase() === 'sun');
      const moonPlanet = planets.find((p: any) => p.name?.toLowerCase() === 'moon');
      const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
      const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
      comprehensiveAnalysis = {
        cover,
        overview: `Your chart (Sun in ${sunSign}, Moon in ${moonSign}) suggests different planetary energies are emphasized in different parts of the world. Astrocartography maps where MC, IC, ASC, and DSC lines fall—these indicate where career, home, identity, and relationship themes are activated. This is about activation of energies, not guaranteed outcomes.`,
        keyPlanetaryLines: [
          { angle: 'MC', planet: 'Sun', theme: 'Career and visibility activation' },
          { angle: 'IC', planet: 'Moon', theme: 'Home and roots activation' },
          { angle: 'ASC', planet: 'Venus', theme: 'Social and relational activation' },
          { angle: 'DSC', planet: 'Mars', theme: 'Partnership and action activation' },
        ],
        themesByRegion: 'Regional themes depend on where your planetary lines cross the globe. General guidance: consider which life area you want to emphasize (career, home, relationships) and use astrocartography as one input among many when choosing where to live or travel.',
        relocationGuidance: 'Use astrocartography to understand where certain energies are stronger for you. It does not guarantee success or replace practical planning. When relocating, combine this insight with career, family, and financial considerations.',
        limitations: 'This report is interpretive, not deterministic. Local culture, economics, and personal choice also shape your experience in any location.',
      };
    }

    if (adminDb) {
      try {
        await adminDb
          .collection('users')
          .doc(userId)
          .collection('astrocartographyReports')
          .doc('comprehensive')
          .set(
            {
              comprehensiveAnalysis,
              timestamp: Date.now(),
            },
            { merge: true }
          );
      } catch (e) {
        devLog.warn('Astrocartography report cache write failed:', e, 'route');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis,
        timestamp: Date.now(),
      },
      _usage: result.usage,
    });
  } catch (err) {
    devLog.error('Astrocartography comprehensive API error:', err, 'route');
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to generate astrocartography report' },
      { status: 500 }
    );
  }
}
