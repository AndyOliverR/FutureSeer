import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { authorizeVedicInterpretationRequest } from '@/lib/vedicInterpretationsRouteGuard';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handleDasha(request: NextRequest) {
  try {
    const gate = await authorizeVedicInterpretationRequest(request, 'vedic-interpretations-dasha');
    if (!gate.ok) return gate.response;

    const { dashaData, chartData } = gate.body;
    const userId = gate.userId;

    if (!chartData || !dashaData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generateDashaInterpretation(
      dashaData,
      chartData,
      userId
    );

    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('Dasha interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleDasha, rateLimiters.ai, 'vedic_interpretations_dasha_post');
