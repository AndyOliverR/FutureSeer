import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { runStructuredReportAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback, mapStructuredReportRun } from '@/lib/aiFallbackRouter';
import {
  readAdminComprehensiveCache,
  writeAdminComprehensiveCache,
} from '@/lib/adminComprehensiveCache';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { decideUserScopedAccess } from '@/lib/security/userScopedAccess';

type PalmistryValidatedAnalysis = {
  overallReading: string;
  lifePath: string;
  strengths: string[];
  challenges: string[];
  relationships: string;
  career: string;
  health: string;
  timing: {
    currentYear: string;
    nextThreeYears: string;
    opportunities: string[];
    challenges: string[];
  };
  remedies: string[];
  spiritualGuidance: string;
  keyInsights: string[];
};

function validatePalmistryAnalysis(
  comprehensiveAnalysis: Record<string, unknown>,
): PalmistryValidatedAnalysis {
  const timingRaw = comprehensiveAnalysis.timing as Record<string, unknown> | undefined;
  return {
    overallReading:
      (comprehensiveAnalysis.overallReading as string) ||
      'Your palm reveals a unique combination of traits and potential.',
    lifePath:
      (comprehensiveAnalysis.lifePath as string) || 'Your life path is one of growth and discovery.',
    strengths: (comprehensiveAnalysis.strengths as string[]) || [
      'Natural abilities',
      'Inner strength',
      'Adaptability',
    ],
    challenges: (comprehensiveAnalysis.challenges as string[]) || [
      'Areas for growth',
      'Learning opportunities',
    ],
    relationships:
      (comprehensiveAnalysis.relationships as string) ||
      'Your Heart Line indicates a capacity for deep connections.',
    career:
      (comprehensiveAnalysis.career as string) ||
      'Your palm suggests various career paths aligned with your talents.',
    health:
      (comprehensiveAnalysis.health as string) || 'Your Life Line indicates vitality and energy.',
    timing: {
      currentYear:
        (timingRaw?.currentYear as string) || 'Focus on personal growth this year.',
      nextThreeYears:
        (timingRaw?.nextThreeYears as string) ||
        'The coming years bring opportunities for development.',
      opportunities: (timingRaw?.opportunities as string[]) || [
        'Personal growth',
        'New connections',
        'Career advancement',
      ],
      challenges: (timingRaw?.challenges as string[]) || [
        'Patience required',
        'Balance needed',
      ],
    },
    remedies: (comprehensiveAnalysis.remedies as string[]) || [
      'Practice mindfulness',
      'Develop strengths',
      'Address challenges',
    ],
    spiritualGuidance:
      (comprehensiveAnalysis.spiritualGuidance as string) ||
      'Trust in your unique path and inner wisdom.',
    keyInsights: (comprehensiveAnalysis.keyInsights as string[]) || [
      'You have unique gifts',
      'Growth is continuous',
      'Trust your journey',
    ],
  };
}

function buildPalmistryDeterministic(): PalmistryValidatedAnalysis {
  return validatePalmistryAnalysis({});
}

export async function POST(request: NextRequest) {
  try {
    const { userId, palmistryData, userProfile } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!palmistryData) {
      return NextResponse.json(
        { success: false, error: 'Palmistry data is required' },
        { status: 400 }
      );
    }

    const auth = await verifyUserRequest(request, 'palmistry-comprehensive');
    const access = decideUserScopedAccess(userId, auth);
    if (access.kind === 'unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (access.kind === 'forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    const canAccessUserScopedData = access.kind === 'owned';

    if (canAccessUserScopedData) {
      const freshCached = await readAdminComprehensiveCache(userId, 'palmistry-comprehensive', 'latest', {
        maxAgeHours: 24 * 7,
        extract: (d) => (d.analysis as PalmistryValidatedAnalysis) ?? null,
      });
      if (freshCached) {
        devLog.debug('✅ Returning cached comprehensive palmistry analysis');
        return NextResponse.json({
          success: true,
          data: freshCached,
          cached: true,
        });
      }
    }

    devLog.debug('🔮 Generating comprehensive palmistry analysis...');

    // Build comprehensive analysis prompt
    const analysisPrompt = `You are an expert palmist providing a comprehensive palm reading analysis. Analyze the following palm data and provide detailed, insightful interpretations.

Palm Data:
- Hand: ${palmistryData.hand || 'Not specified'}
- Palm Shape: ${palmistryData.palmShape || 'Not specified'}
- Primary Element: ${palmistryData.elements?.primary || 'Not specified'}
- Energy Score: ${palmistryData.energyScore || 0}/100

Lines:
${palmistryData.lines?.map((line: any) => `- ${line.name}: ${line.length} length, ${line.depth} depth, ${line.quality} quality
  Interpretation: ${line.interpretation}`).join('\n') || 'No line data'}

Mounts:
${palmistryData.mounts?.map((mount: any) => `- ${mount.name}: ${mount.prominence} prominence
  Interpretation: ${mount.interpretation}`).join('\n') || 'No mount data'}

Fingers:
${palmistryData.fingers ? Object.entries(palmistryData.fingers).map(([name, data]: [string, any]) => 
  `- ${name}: ${data.length} length, ${data.flexibility} flexibility`).join('\n') : 'No finger data'}

Current Life Phase: ${palmistryData.timing?.currentPhase || 'Not specified'}

Please provide a comprehensive analysis in the following JSON structure:
{
  "overallReading": "A comprehensive 3-4 paragraph overview of the person's palm reading, their core nature, life path, and key characteristics",
  "lifePath": "Detailed analysis of their life journey, purpose, and destiny based on all palm features",
  "strengths": ["List 5-7 key strengths revealed by the palm"],
  "challenges": ["List 5-7 challenges or areas for growth"],
  "relationships": "Detailed analysis of relationship patterns, emotional nature, and love life based on Heart Line and related features",
  "career": "Detailed career guidance based on Head Line, Fate Line, and relevant mounts",
  "health": "Health insights based on Life Line and other relevant indicators",
  "timing": {
    "currentYear": "What to focus on this year based on palm timing",
    "nextThreeYears": "Major themes for the next three years",
    "opportunities": ["List 3-5 upcoming opportunities"],
    "challenges": ["List 3-5 challenges to watch for"]
  },
  "remedies": ["List 5-8 specific remedies, practices, or actions to enhance positive traits and address challenges"],
  "spiritualGuidance": "Spiritual insights and guidance for personal growth",
  "keyInsights": ["List 5-7 most important takeaways from the reading"]
}

Provide only valid JSON in your response.`;

    const resolved = await resolveAiReportWithFallback({
      label: 'palmistry-comprehensive',
      userId,
      tryLlm: async () => {
        const aiRun = await runStructuredReportAI({
          label: 'palmistry-comprehensive',
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert palmist with deep knowledge of palmistry traditions. Provide comprehensive, insightful, and practical guidance. Respond only with valid JSON.',
            },
            { role: 'user', content: analysisPrompt },
          ],
          temperature: 0.7,
          maxTokens: 2000,
          maxAttempts: 3,
        });
        return mapStructuredReportRun(aiRun, validatePalmistryAnalysis);
      },
      readFirestoreCache: () =>
        canAccessUserScopedData
          ? readAdminComprehensiveCache(userId, 'palmistry-comprehensive', 'latest', {
              allowStale: true,
              extract: (d) => (d.analysis as PalmistryValidatedAnalysis) ?? null,
            })
          : Promise.resolve(null),
      buildDeterministic: buildPalmistryDeterministic,
    });

    const validatedAnalysis = resolved.data;

    if (resolved.degraded && resolved.source !== 'llm') {
      return NextResponse.json({
        success: true,
        data: validatedAnalysis,
        cached: resolved.source === 'firestore_cache',
        parsingFailed: resolved.parsingFailed ?? true,
        fallbackSource: resolved.source,
        error:
          resolved.source === 'firestore_cache'
            ? 'Using last saved report; AI narrative refresh failed'
            : 'Failed to parse AI response, using palmistry defaults',
      });
    }

    if (canAccessUserScopedData) {
      await writeAdminComprehensiveCache(userId, 'palmistry-comprehensive', 'latest', {
        analysis: validatedAnalysis,
        palmDataSnapshot: {
          hand: palmistryData.hand,
          palmShape: palmistryData.palmShape,
          energyScore: palmistryData.energyScore,
        },
      });
      devLog.debug('✅ Cached comprehensive palmistry analysis');
    }

    return NextResponse.json({
      success: true,
      data: validatedAnalysis,
      cached: false,
    });

  } catch (error: any) {
    devLog.error('Comprehensive palmistry API error:', error, 'route');
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate comprehensive analysis' 
      },
      { status: 500 }
    );
  }
}
