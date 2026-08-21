import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { authorizeVedicInterpretationRequest } from '@/lib/vedicInterpretationsRouteGuard';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handleTransits(request: NextRequest) {
  try {
    const gate = await authorizeVedicInterpretationRequest(request, 'vedic-interpretations-transits');
    if (!gate.ok) return gate.response;

    const { transitData, chartData } = gate.body;
    const userId = gate.userId;

    if (!chartData || !transitData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generateTransitInterpretation(
      transitData,
      chartData,
      userId
    );

    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('Transit interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleTransits, rateLimiters.ai, 'vedic_interpretations_transits_post');
