import { NextRequest, NextResponse } from 'next/server';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';
import { getUserProfile } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { chartType, chartData, userId } = await request.json();
    
    if (!chartType || !chartData || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Fetch user profile to get displayName/firstName
    let userName: string | undefined;
    try {
      const userProfile = await getUserProfile(userId);
      userName = userProfile?.displayName || userProfile?.fullName;
    } catch (error) {
      console.warn('Could not fetch user profile for personalization:', error);
      // Continue without userName - will use "you" instead
    }
    
    const enhancer = new VedicInterpretationEnhancer();
    
    // Generate interpretations based on chart type
    let interpretations: any = {};
    
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
    console.error('Error generating divisional interpretations:', error);
    return NextResponse.json(
      { error: 'Failed to generate interpretations' },
      { status: 500 }
    );
  }
}
