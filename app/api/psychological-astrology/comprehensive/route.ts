import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAICompletion } from '@/lib/aiGateway';
import {
  buildPsychologicalReportSystemPrompt,
  buildProfileContext,
} from '@/lib/psychologicalSeerPrompts';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface PsychologicalComprehensiveRequest {
  userId: string;
  userProfile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    birthLatitude?: number;
    birthLongitude?: number;
    displayName?: string;
    fullName?: string;
    gender?: string;
    relationshipStatus?: string;
  };
  chartData?: {
    planets?: any[];
    houses?: any[];
    aspects?: any[];
  };
  birthData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude?: number;
    longitude?: number;
  };
}

function formatChartContext(planets: any[], houses: any[], aspects: any[]): string {
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
  const aspectsText = (aspects || [])
    .slice(0, 20)
    .map(
      (a) =>
        `${a.planet1 || 'Planet1'} ${a.type || 'aspect'} ${a.planet2 || 'Planet2'} (${a.orb?.toFixed?.(2) ?? 'N/A'}° orb)`
    )
    .join('\n');
  return `PLANETS:\n${planetsText || 'None'}\n\nHOUSES:\n${housesText || 'None'}\n\nASPECTS:\n${aspectsText || 'None'}`;
}

function parsePsychologicalResponse(response: string): Record<string, unknown> {
  const trimmed = response.trim();
  let jsonStr = trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlock?.[1]) jsonStr = codeBlock[1];
  else {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match?.[0]) jsonStr = match[0];
  }
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    // Truncation repair: try closing the object
    const repaired = jsonStr.trim();
    if (!repaired.endsWith('}')) {
      const withClose = repaired.replace(/,?\s*$/, '}');
      try {
        return JSON.parse(withClose) as Record<string, unknown>;
      } catch {
        // Ignore
      }
      try {
        return JSON.parse(`${repaired}}`) as Record<string, unknown>;
      } catch {
        // Ignore
      }
    }
    throw new SyntaxError('Psychological report JSON parse failed');
  }
}

function firstSentence(str: unknown): string {
  if (typeof str !== 'string' || !str.trim()) return '';
  const trimmed = str.trim();
  const dot = trimmed.indexOf('.');
  return dot > 0 ? trimmed.slice(0, dot + 1).trim() : trimmed;
}

function stringOrEmpty(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

function executiveStr(eo: unknown, key: string): string {
  if (!eo || typeof eo !== 'object') return '';
  const v = (eo as Record<string, unknown>)[key];
  return typeof v === 'string' ? v : '';
}

function normalizeAnalysis(parsed: Record<string, unknown>): Record<string, unknown> {
  const exec = parsed.executive_overview;
  const out: Record<string, unknown> = {
    executive_overview:
      exec && typeof exec === 'object'
        ? {
            core_personality_pattern: executiveStr(exec, 'core_personality_pattern'),
            dominant_drives: executiveStr(exec, 'dominant_drives'),
            primary_inner_conflict: executiveStr(exec, 'primary_inner_conflict'),
            core_developmental_task: executiveStr(exec, 'core_developmental_task'),
            identity_summary: executiveStr(exec, 'identity_summary'),
          }
        : undefined,
    personality_structure: stringOrEmpty(parsed.personality_structure),
    ego_development: stringOrEmpty(parsed.ego_development),
    emotional_patterning: stringOrEmpty(parsed.emotional_patterning),
    shadow_projection: stringOrEmpty(parsed.shadow_projection),
    cognitive_style: stringOrEmpty(parsed.cognitive_style),
    conflict_defense: stringOrEmpty(parsed.conflict_defense),
    relationship_psychology: stringOrEmpty(parsed.relationship_psychology),
    life_themes: stringOrEmpty(parsed.life_themes),
    life_path: stringOrEmpty(parsed.life_path),
    inner_dynamics: stringOrEmpty(parsed.inner_dynamics),
    integration_growth_plan: stringOrEmpty(parsed.integration_growth_plan),
    core_identity_pattern:
      stringOrEmpty(parsed.core_identity_pattern) ||
      executiveStr(exec, 'identity_summary') ||
      firstSentence(parsed.personality_structure),
    emotional_signature:
      stringOrEmpty(parsed.emotional_signature) ||
      firstSentence(parsed.emotional_patterning),
    defense_mechanisms: Array.isArray(parsed.defense_mechanisms)
      ? parsed.defense_mechanisms.filter((x): x is string => typeof x === 'string')
      : [],
    shadow_theme:
      stringOrEmpty(parsed.shadow_theme) || firstSentence(parsed.shadow_projection),
    relationship_pattern:
      stringOrEmpty(parsed.relationship_pattern) ||
      firstSentence(parsed.relationship_psychology),
    growth_focus:
      stringOrEmpty(parsed.growth_focus) || firstSentence(parsed.life_themes) || firstSentence(parsed.life_path),
    integration_guidance:
      stringOrEmpty(parsed.integration_guidance) ||
      firstSentence(parsed.integration_growth_plan),
  };
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body: PsychologicalComprehensiveRequest = await request.json();
    const { userId, userProfile, chartData: bodyChartData, birthData: bodyBirthData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    let planets: any[] = [];
    let houses: any[] = [];
    let aspects: any[] = [];

    if (bodyChartData?.planets?.length) {
      planets = bodyChartData.planets;
      houses = bodyChartData.houses || [];
      aspects = bodyChartData.aspects || [];
    } else {
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
          { success: false, error: 'Missing chartData or birthData/userProfile with birth date and place' },
          { status: 400 }
        );
      }

      const westernRes = await universalOccultService.calculateWesternChart(birthData, {
        houseSystem: 'placidus',
        includeAspects: true,
      });
      const data = westernRes?.data ?? westernRes;
      planets = data?.planets ?? [];
      houses = data?.houses ?? [];
      aspects = data?.aspects ?? [];
    }

    if (!planets.length) {
      return NextResponse.json(
        { success: false, error: 'No planetary chart data available' },
        { status: 400 }
      );
    }

    const chartContext = formatChartContext(planets, houses, aspects);
    const profileContext = buildProfileContext(userProfile ?? undefined);
    const systemPrompt = buildPsychologicalReportSystemPrompt(chartContext, profileContext);

    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert in Psychological Astrology. Respond only with a single valid JSON object, no other text.',
        },
        { role: 'user', content: systemPrompt },
      ],
      temperature: 0.6,
      maxTokens: 3600,
      responseFormat: { type: 'json_object' },
    });

    const content = result.content || '';
    let comprehensiveAnalysis: Record<string, unknown>;

    try {
      const parsed = parsePsychologicalResponse(content);
      comprehensiveAnalysis = normalizeAnalysis(parsed);
    } catch (parseErr) {
      const contentLen = content.length;
      const snippet = content.slice(0, 200).replace(/\n/g, ' ');
      devLog.warn('[Psychological comprehensive] Using fallback: parse/normalize failed', { contentLen, snippet: snippet.length > 0 ? `${snippet}…` : '(empty)', error: parseErr instanceof Error ? parseErr.message : String(parseErr) }, 'psychological-comprehensive');
      const sunPlanet = planets.find((p: any) => p.name?.toLowerCase() === 'sun');
      const moonPlanet = planets.find((p: any) => p.name?.toLowerCase() === 'moon');
      const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
      const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
      comprehensiveAnalysis = {
        core_identity_pattern: `General pattern (Sun in ${sunSign}, Moon in ${moonSign})—full chart analysis unavailable`,
        emotional_signature: 'Reflective; full chart needed for precise signature.',
        defense_mechanisms: ['Generalizing cautiously—complete chart data unavailable'],
        shadow_theme: 'Integration of conscious and unconscious aspects.',
        relationship_pattern: 'Patterns become clearer with full chart analysis.',
        growth_focus: 'Focus on emotional awareness and boundary clarity.',
        integration_guidance: 'Acknowledge emotional needs rather than suppress them.',
      };
    }

    if (adminDb) {
      try {
        await adminDb
          .collection('users')
          .doc(userId)
          .collection('psychologicalAstrologyReports')
          .doc('comprehensive')
          .set(
            {
              comprehensiveAnalysis,
              timestamp: Date.now(),
            },
            { merge: true }
          );
      } catch (e) {
        devLog.warn('Psychological report cache write failed:', e, 'route');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    devLog.error('Psychological comprehensive API error:', err, 'route');
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to generate psychological report' },
      { status: 500 }
    );
  }
}
