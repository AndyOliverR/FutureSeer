import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { authorizeVedicInterpretationRequest } from '@/lib/vedicInterpretationsRouteGuard';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handlePanchanga(request: NextRequest) {
  try {
    const gate = await authorizeVedicInterpretationRequest(request, 'vedic-interpretations-panchanga');
    if (!gate.ok) return gate.response;

    const { panchangaData, chartData } = gate.body;
    const userId = gate.userId;

    if (!chartData || !panchangaData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generatePanchangaInsight(
      panchangaData,
      chartData,
      userId
    );

    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('Panchanga interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handlePanchanga, rateLimiters.ai, 'vedic_interpretations_panchanga_post');
