import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { authorizeVedicInterpretationRequest } from '@/lib/vedicInterpretationsRouteGuard';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handleHouses(request: NextRequest) {
  try {
    const gate = await authorizeVedicInterpretationRequest(request, 'vedic-interpretations-houses');
    if (!gate.ok) return gate.response;

    const { houseNumber, chartData } = gate.body;
    const userId = gate.userId;

    if (!chartData || houseNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generateHouseInterpretation(
      Number(houseNumber),
      chartData,
      userId
    );

    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('House interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleHouses, rateLimiters.ai, 'vedic_interpretations_houses_post');
