import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import {
  runEnergyHealingAnalysis,
  type EnergyHealingMethod,
} from '@/lib/energyHealing/runEnergyHealingAnalysis';
import { devLog } from '@/lib/devLogger';

interface EnergyHealingRequest {
  method: EnergyHealingMethod;
  userProfile?: unknown;
  imageUrl?: string;
  question?: string;
}

interface EnergyHealingResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  parsingFailed?: boolean;
  fallbackSource?: string;
}

const ALLOWED_METHODS = new Set<EnergyHealingMethod>([
  'chakra',
  'aura',
  'reiki',
  'crystal',
  'energy',
]);

/**
 * Energy Healing Analysis Endpoint
 *
 * Uses Groq (llama-3.3-70b-versatile) via structured report AI.
 * Requires a signed-in Firebase user — must not be an unauthenticated paid proxy.
 *
 * Trusted server callers (Stage B) should import `runEnergyHealingAnalysis`
 * directly instead of HTTP-looping through this route.
 */
async function handleEnergyHealingAnalysis(request: NextRequest) {
  let method: EnergyHealingMethod | undefined;
  try {
    const auth = await verifyUserRequest(request, 'energy-healing-analysis');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as EnergyHealingRequest | null;
    method =
      body?.method && ALLOWED_METHODS.has(body.method) ? body.method : undefined;
    const userProfile = body?.userProfile;
    const question = typeof body?.question === 'string' ? body.question : undefined;

    if (!method) {
      return NextResponse.json(
        { success: false, error: 'Healing method is required' },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 },
      );
    }

    const resolved = await runEnergyHealingAnalysis({
      method,
      userProfile,
      question,
    });

    const healingData = resolved.data;

    if (method === 'aura') {
      devLog.debug(
        '📊 Aura API response structure:',
        {
          hasLayers: !!healingData.layers,
          layersType: typeof healingData.layers,
          isArray: Array.isArray(healingData.layers),
          layersLength: Array.isArray(healingData.layers) ? healingData.layers.length : 'N/A',
          dominantColor: healingData.dominantColor,
          hasInterpretation: !!healingData.interpretation,
          hasRecommendations: !!healingData.recommendations,
        },
        'energy-healing',
      );
    }

    devLog.info(
      `✅ ${method} analysis completed successfully`,
      { uid: auth.uid },
      'energy-healing',
    );

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes('context_length_exceeded') ||
      message.includes('reduce the length')
    ) {
      devLog.error('❌ Groq API context length exceeded. Prompt too long.', undefined, 'route');
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis request too complex. Please try again or simplify the request.',
        },
        { status: 400 },
      );
    }

    devLog.error(`❌ ${method ?? 'energy-healing'} analysis error:`, error, 'route');
    return NextResponse.json(
      {
        success: false,
        error: message || 'Failed to analyze energy healing',
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(
  handleEnergyHealingAnalysis,
  rateLimiters.ai,
  'energy_healing_analysis_post',
);
