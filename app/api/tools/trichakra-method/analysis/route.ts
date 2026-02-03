import { NextRequest, NextResponse } from 'next/server';
import { trichakraIntelligence, UserProfile } from '@/lib/trichakraIntelligence';
import { getUserProfile } from '@/lib/firebase';
import { devLog } from '@/lib/devLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, birthData, userProfile: customProfile } = body;

    let userProfile: UserProfile | null = null;

    // If userId is provided, fetch from database
    if (userId) {
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          userProfile = {
            fullName: profile.fullName,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            birthPlace: profile.birthPlace,
            latitude: profile.latitude,
            longitude: profile.longitude
          };
        }
      } catch (profileError) {
        console.error('⚠️ Failed to fetch user profile:', profileError);
      }
    }

    // Use custom profile if provided, otherwise use fetched profile
    const finalProfile = customProfile || userProfile || birthData;

    if (!finalProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile or birth data is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!finalProfile.birthDate || !finalProfile.birthTime || !finalProfile.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete birth data (date, time, and place) is required for Trichakra analysis' },
        { status: 400 }
      );
    }

    devLog.info('🕉️ Generating Trichakra analysis for user:', userId || 'anonymous', 'trichakra-method');
    devLog.debug('🕉️ Birth data:', {
      birthDate: finalProfile.birthDate,
      birthTime: finalProfile.birthTime,
      birthPlace: finalProfile.birthPlace,
      latitude: finalProfile.latitude,
      longitude: finalProfile.longitude
    }, 'trichakra-method');

    // Generate Trichakra analysis
    const analysis = await trichakraIntelligence.generateTrichakraRemedies(finalProfile);

    devLog.info('✅ Trichakra analysis generated successfully', undefined, 'trichakra-method');

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        metadata: {
          ...analysis.metadata,
          generatedAt: analysis.metadata.generatedAt.toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error generating Trichakra analysis:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate Trichakra analysis',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    devLog.info('🕉️ Fetching Trichakra analysis for user:', userId, 'trichakra-method');

    // Fetch user profile
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if profile is complete
    if (!profile.birthDate || !profile.birthTime || !profile.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete profile (birth date, time, and place) is required for Trichakra analysis' },
        { status: 400 }
      );
    }

    // Prepare user profile
    const userProfile: UserProfile = {
      fullName: profile.fullName,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      birthPlace: profile.birthPlace,
      latitude: profile.latitude,
      longitude: profile.longitude
    };

    // Generate Trichakra analysis (will use cache if available in future)
    const analysis = await trichakraIntelligence.generateTrichakraRemedies(userProfile);

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        metadata: {
          ...analysis.metadata,
          generatedAt: analysis.metadata.generatedAt.toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching Trichakra analysis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch Trichakra analysis' 
      },
      { status: 500 }
    );
  }
}
