import { NextRequest, NextResponse } from 'next/server';
import { runStructuredReportAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback, mapStructuredReportRun } from '@/lib/aiFallbackRouter';
import { parseLlmJsonRecord } from '@/lib/aiStructuredOutputParse';
import { extractUserContext, buildContextString } from '@/lib/energyHealing/userProfileExtractor';
import { getAllDivinationData } from '@/lib/universalDataAggregator';
import { devLog } from '@/lib/devLogger';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';

interface EnergyHealingRequest {
  method: 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy';
  userProfile: any;
  imageUrl?: string;
  question?: string;
}

interface EnergyHealingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function extractJsonPayload(rawText: string): string | null {
  const text = rawText.trim();
  if (!text) return null;

  // Direct JSON payload.
  if (text.startsWith('{') && text.endsWith('}')) return text;

  // Common markdown fence variants.
  const fencedMatch =
    text.match(/```json\s*([\s\S]*?)\s*```/i) ||
    text.match(/```\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const fencedJson = fencedMatch[1].trim();
    if (fencedJson.startsWith('{') && fencedJson.endsWith('}')) return fencedJson;
  }

  // Last resort: grab largest object-like region.
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return null;
}

const ASTRO_CONTEXT_TTL_MS = 30_000;
const astroContextCache = new Map<string, { data: unknown; expiresAt: number }>();
const astroContextInFlight = new Map<string, Promise<unknown>>();

function buildAstroContextKey(userProfile: any): string {
  return [
    String(userProfile?.uid ?? userProfile?.id ?? userProfile?.userId ?? ''),
    String(userProfile?.birthDate ?? ''),
    String(userProfile?.birthTime ?? ''),
    String(userProfile?.birthPlace ?? ''),
    String(userProfile?.birthLatitude ?? userProfile?.latitude ?? ''),
    String(userProfile?.birthLongitude ?? userProfile?.longitude ?? ''),
  ].join('|');
}

async function getAstroDataWithDedupe(userProfile: any): Promise<unknown> {
  if (!userProfile?.birthPlace || !userProfile?.birthDate) return null;
  const cacheKey = buildAstroContextKey(userProfile);
  const now = Date.now();
  const cached = astroContextCache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.data;

  const existing = astroContextInFlight.get(cacheKey);
  if (existing) return existing;

  const req = getAllDivinationData(userProfile)
    .then((data) => {
      astroContextCache.set(cacheKey, { data, expiresAt: Date.now() + ASTRO_CONTEXT_TTL_MS });
      return data;
    })
    .catch(() => null)
    .finally(() => {
      astroContextInFlight.delete(cacheKey);
    });

  astroContextInFlight.set(cacheKey, req);
  return req;
}

export async function POST(request: NextRequest) {
  let method: EnergyHealingRequest['method'] | undefined;
  try {
    const body: EnergyHealingRequest = await request.json();
    method = body.method;
    const { userProfile, imageUrl, question } = body;

    if (!method) {
      return NextResponse.json(
        { success: false, error: 'Healing method is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Extract user context for personalization
    let astroData = null;
    try {
      astroData = await getAstroDataWithDedupe(userProfile);
    } catch (error) {
      devLog.warn('⚠️ Could not fetch astrological data, using minimal context:', error, 'energy-healing');
    }

    const userContext = extractUserContext(userProfile, astroData);
    const personalizedContext = buildContextString(userContext, method);

    devLog.info(`✨ Analyzing ${method} with personalized context for ${userContext.age}-year-old ${userContext.gender}`, undefined, 'energy-healing');

    // Build concise prompt based on method
    let basePrompt = '';
    
    switch (method) {
      case 'chakra':
        basePrompt = `Analyze 7 chakras for energy healing. Return JSON only:

CHAKRAS: root, sacral, solarPlexus, heart, throat, thirdEye, crown
Each: balance (0-100), status (balanced/overactive/underactive/blocked), interpretation

OVERALL: overallBalance (0-100), recommendations[]

Use brief interpretations. Return JSON.`;
        break;
        
      case 'aura':
        basePrompt = `Analyze aura layers for personalized energy reading. Return JSON with detailed interpretations.

Required JSON structure:
{
  "layers": [
    {
      "name": "Physical Layer",
      "color": "blue|green|purple|yellow|red|orange|white|pink",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation based on user profile"
    },
    {
      "name": "Etheric Layer",
      "color": "blue|green|gray|yellow|red",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation"
    },
    {
      "name": "Emotional Layer",
      "color": "pink|red|orange|yellow|blue|green|purple|brown|gray",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation"
    },
    {
      "name": "Mental Layer",
      "color": "yellow|blue|green|orange|purple|gray|brown",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation"
    }
  ],
  "dominantColor": "primary color",
  "interpretation": "Comprehensive personalized aura interpretation considering astrological influences and user profile",
  "recommendations": ["Specific personalized recommendation 1", "Specific personalized recommendation 2", "Specific personalized recommendation 3"]
}

Provide detailed, personalized interpretations for each layer based on the user's astrological profile and characteristics. Return JSON only.`;
        break;
        
      case 'reiki':
        basePrompt = `Analyze Reiki energy. Return JSON only:

ENERGY: energyLevel (high/medium/low), blockages[], recommendedSymbols[], treatmentAreas[], interpretation, recommendations[]

Use brief interpretations. Return JSON.`;
        break;
        
      case 'crystal':
        basePrompt = `Recommend crystals for energy healing. Return JSON only:

CRYSTALS: array of {name, priority (high/medium/low), reason}
PRIMARY: primaryCrystal name
INTERPRETATION: brief explanation
RECOMMENDATIONS: array of usage tips

Return JSON.`;
        break;
        
      case 'energy':
        basePrompt = `Analyze overall energy balance. Return JSON only:

BALANCE: overallBalance (0-100), chakraBalance (0-100), auraHealth (0-100)
FLOW: energyFlow (excellent/good/needs_attention/blocked)
BLOCKAGES: array of blockage descriptions
RECOMMENDATIONS: array of balancing techniques
TECHNIQUES: array of recommended practices

Return JSON.`;
        break;
    }

    // Append personalized context to prompt
    const analysisPrompt = `${basePrompt}\n\nUser Context: ${personalizedContext}`;

    // Log prompt length for debugging
    const promptLength = analysisPrompt.length;
    devLog.debug(`📏 Prompt length: ${promptLength} characters (~${Math.ceil(promptLength / 4)} tokens)`, undefined, 'energy-healing');

    const buildEnergyHealingDeterministic = (): Record<string, unknown> => ({
      interpretation: 'Energy analysis is temporarily unavailable. Chart-based context was still applied where possible.',
      recommendations: ['Try again in a moment', 'Ground with breath and gentle movement'],
    });

    const resolved = await resolveAiReportWithFallback({
      label: `energy-healing-${method}`,
      tryLlm: async () => {
        const aiRun = await runStructuredReportAI({
          label: `energy-healing-${method}`,
          model: GROQ_DEFAULT_TEXT_MODEL,
          messages: [{ role: 'user', content: analysisPrompt }],
          temperature: 0.3,
          maxTokens: method === 'aura' ? 800 : 500,
          maxAttempts: 3,
        });
        return mapStructuredReportRun(aiRun, (parsed) => parsed);
      },
      buildDeterministic: buildEnergyHealingDeterministic,
    });

    const healingData = resolved.data;

    if (method === 'aura') {
      devLog.debug('📊 Aura API response structure:', {
        hasLayers: !!healingData.layers,
        layersType: typeof healingData.layers,
        isArray: Array.isArray(healingData.layers),
        layersLength: Array.isArray(healingData.layers) ? healingData.layers.length : 'N/A',
        dominantColor: healingData.dominantColor,
        hasInterpretation: !!healingData.interpretation,
        hasRecommendations: !!healingData.recommendations,
      }, 'energy-healing');
    }

    devLog.info(`✅ ${method} analysis completed successfully`, undefined, 'energy-healing');

    return NextResponse.json({
      success: true,
      data: healingData,
      ...(resolved.degraded && resolved.source !== 'llm'
        ? {
            parsingFailed: resolved.parsingFailed ?? true,
            fallbackSource: resolved.source,
            error: 'Failed to parse AI response, using minimal energy-healing fallback',
          }
        : {}),
    } as EnergyHealingResponse);

  } catch (error: any) {
    // Check for context length errors specifically
    if (error.message?.includes('context_length_exceeded') || 
        error.message?.includes('reduce the length')) {
      devLog.error('❌ Groq API context length exceeded. Prompt too long.', undefined, 'route');
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis request too complex. Please try again or simplify the request.'
        },
        { status: 400 }
      );
    }
    
    devLog.error(`❌ ${method ?? 'energy-healing'} analysis error:`, error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze energy healing'
      },
      { status: 500 }
    );
  }
}
