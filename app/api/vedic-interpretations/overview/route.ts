import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { authorizeVedicInterpretationRequest } from '@/lib/vedicInterpretationsRouteGuard';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

/**
 * Vedic overview interpretations: must not be an unauthenticated paid proxy
 * or allow Admin cache IDOR via body userId.
 */
async function handleOverview(request: NextRequest) {
  try {
    const gate = await authorizeVedicInterpretationRequest(request, 'vedic-interpretations-overview');
    if (!gate.ok) return gate.response;

    const { chartData } = gate.body;
    const userId = gate.userId;

    if (!chartData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generateEnhancedOverview(chartData, userId);

    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('Overview interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleOverview, rateLimiters.ai, 'vedic_interpretations_overview_post');
