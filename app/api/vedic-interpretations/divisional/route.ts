import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { getUserProfile } from '@/lib/firebase';
import { authorizeVedicInterpretationRequest } from '@/lib/vedicInterpretationsRouteGuard';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handleDivisional(request: NextRequest) {
  try {
    const gate = await authorizeVedicInterpretationRequest(request, 'vedic-interpretations-divisional');
    if (!gate.ok) return gate.response;

    const { chartType, chartData } = gate.body;
    const userId = gate.userId;

    if (!chartType || !chartData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Owned userId only — never load another user's profile for personalization.
    let userName: string | undefined;
    try {
      const userProfile = await getUserProfile(userId);
      userName = userProfile?.displayName || userProfile?.fullName;
    } catch (error) {
      devLog.warn('Could not fetch user profile for personalization:', error, 'route');
      // Continue without userName - will use "you" instead
    }

    const enhancer = new VedicInterpretationEnhancer();

    let interpretations: Record<string, string> = {};

    if (chartType === 'D9') {
      interpretations = {
        marriageIndicators: await enhancer.generateDivisionalInsight(
          'D9', 'marriageIndicators', chartData, userId, userName
        ),
        spiritualPath: await enhancer.generateDivisionalInsight(
          'D9', 'spiritualPath', chartData, userId, userName
        ),
        innerStrength: await enhancer.generateDivisionalInsight(
          'D9', 'innerStrength', chartData, userId, userName
        )
      };
    } else if (chartType === 'D10') {
      interpretations = {
        tenthHouseAnalysis: await enhancer.generateDivisionalInsight(
          'D10', 'tenthHouseAnalysis', chartData, userId, userName
        ),
        successTiming: await enhancer.generateDivisionalInsight(
          'D10', 'successTiming', chartData, userId, userName
        ),
        socialStatus: await enhancer.generateDivisionalInsight(
          'D10', 'socialStatus', chartData, userId, userName
        )
      };
    }

    return NextResponse.json({ interpretations });
  } catch (error) {
    devLog.error('Error generating divisional interpretations:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretations' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleDivisional, rateLimiters.ai, 'vedic_interpretations_divisional_post');
