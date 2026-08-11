import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { authorizeVedicInterpretationRequest } from '@/lib/vedicInterpretationsRouteGuard';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handlePlanets(request: NextRequest) {
  try {
    const gate = await authorizeVedicInterpretationRequest(request, 'vedic-interpretations-planets');
    if (!gate.ok) return gate.response;

    const { planet, chartData } = gate.body;
    const userId = gate.userId;

    if (!chartData || !planet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generatePlanetaryInterpretation(
      String(planet),
      chartData,
      userId
    );

    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('Planetary interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handlePlanets, rateLimiters.ai, 'vedic_interpretations_planets_post');
