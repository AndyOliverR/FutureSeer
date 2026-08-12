/**
 * Shared energy-healing analysis (Groq structured report).
 * Used by the authenticated HTTP route and trusted server callers
 * (Stage B orchestrator) so internal generation does not depend on
 * an open public proxy.
 */

import { runStructuredReportAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback, mapStructuredReportRun } from '@/lib/aiFallbackRouter';
import { extractUserContext, buildContextString } from '@/lib/energyHealing/userProfileExtractor';
import { getAllDivinationData } from '@/lib/universalDataAggregator';
import { devLog } from '@/lib/devLogger';

export type EnergyHealingMethod = 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy';

export type EnergyHealingAnalysisInput = {
  method: EnergyHealingMethod;
  userProfile?: unknown;
  question?: string;
};

const ASTRO_CONTEXT_TTL_MS = 30_000;
const astroContextCache = new Map<string, { data: unknown; expiresAt: number }>();
const astroContextInFlight = new Map<string, Promise<unknown>>();

function buildAstroContextKey(userProfile: Record<string, unknown> | null | undefined): string {
  return [
    String(userProfile?.uid ?? userProfile?.id ?? userProfile?.userId ?? ''),
    String(userProfile?.birthDate ?? ''),
    String(userProfile?.birthTime ?? ''),
    String(userProfile?.birthPlace ?? ''),
    String(userProfile?.birthLatitude ?? userProfile?.latitude ?? ''),
    String(userProfile?.birthLongitude ?? userProfile?.longitude ?? ''),
  ].join('|');
}

async function getAstroDataWithDedupe(userProfile: Record<string, unknown> | null | undefined): Promise<unknown> {
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

function buildBasePrompt(method: EnergyHealingMethod): string {
  switch (method) {
    case 'chakra':
      return `Analyze 7 chakras for energy healing. Return JSON only:

CHAKRAS: root, sacral, solarPlexus, heart, throat, thirdEye, crown
Each: balance (0-100), status (balanced/overactive/underactive/blocked), interpretation

OVERALL: overallBalance (0-100), recommendations[]

Use brief interpretations. Return JSON.`;
    case 'aura':
      return `Analyze aura layers for personalized energy reading. Return JSON with detailed interpretations.

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
    case 'reiki':
      return `Analyze Reiki energy. Return JSON only:

ENERGY: energyLevel (high/medium/low), blockages[], recommendedSymbols[], treatmentAreas[], interpretation, recommendations[]

Use brief interpretations. Return JSON.`;
    case 'crystal':
      return `Recommend crystals for energy healing. Return JSON only:

CRYSTALS: array of {name, priority (high/medium/low), reason}
PRIMARY: primaryCrystal name
INTERPRETATION: brief explanation
RECOMMENDATIONS: array of usage tips

Return JSON.`;
    case 'energy':
      return `Analyze overall energy balance. Return JSON only:

BALANCE: overallBalance (0-100), chakraBalance (0-100), auraHealth (0-100)
FLOW: energyFlow (excellent/good/needs_attention/blocked)
BLOCKAGES: array of blockage descriptions
RECOMMENDATIONS: array of balancing techniques
TECHNIQUES: array of recommended practices

Return JSON.`;
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export async function runEnergyHealingAnalysis(input: EnergyHealingAnalysisInput) {
  const { method, question } = input;
  const userProfile =
    input.userProfile && typeof input.userProfile === 'object'
      ? (input.userProfile as Record<string, unknown>)
      : undefined;

  let astroData: unknown = null;
  try {
    astroData = await getAstroDataWithDedupe(userProfile);
  } catch (error) {
    devLog.warn('⚠️ Could not fetch astrological data, using minimal context:', error, 'energy-healing');
  }

  const userContext = extractUserContext(userProfile, astroData);
  const personalizedContext = buildContextString(userContext, method);
  const questionSuffix =
    typeof question === 'string' && question.trim()
      ? `\nQuestion focus: ${question.trim().slice(0, 500)}`
      : '';

  devLog.info(
    `✨ Analyzing ${method} with personalized context for ${userContext.age}-year-old ${userContext.gender}`,
    undefined,
    'energy-healing',
  );

  const analysisPrompt = `${buildBasePrompt(method)}\n\nUser Context: ${personalizedContext}${questionSuffix}`;
  const promptLength = analysisPrompt.length;
  devLog.debug(
    `📏 Prompt length: ${promptLength} characters (~${Math.ceil(promptLength / 4)} tokens)`,
    undefined,
    'energy-healing',
  );

  const buildEnergyHealingDeterministic = (): Record<string, unknown> => ({
    interpretation:
      'Energy analysis is temporarily unavailable. Chart-based context was still applied where possible.',
    recommendations: ['Try again in a moment', 'Ground with breath and gentle movement'],
  });

  return resolveAiReportWithFallback({
    label: `energy-healing-${method}`,
    tryLlm: async () => {
      const aiRun = await runStructuredReportAI({
        label: `energy-healing-${method}`,
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        maxTokens: method === 'aura' ? 800 : 500,
        maxAttempts: 3,
      });
      return mapStructuredReportRun(aiRun, (parsed) => parsed);
    },
    buildDeterministic: buildEnergyHealingDeterministic,
  });
}
