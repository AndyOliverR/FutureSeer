import { NextRequest, NextResponse } from 'next/server';
import { trichakraIntelligence, UserProfile as TrichakraUserProfile } from '@/lib/trichakraIntelligence';
import type { UserProfile } from '@/lib/firebase';
import { loadOwnedUserProfile } from '@/lib/security/loadOwnedUserProfile';
import { devLog } from '@/lib/devLogger';
import { normalizeBirthTime } from '@/lib/birthTimeUtils';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, birthData, userProfile: customProfile } = body;

    let userProfileFromDb: TrichakraUserProfile | null = null;

    const overlay = (customProfile || birthData) as
      | (TrichakraUserProfile & { birthLatitude?: number; birthLongitude?: number })
      | null;

    // Firestore enrichment requires ownership. Stage B may send body profile without a token.
    if (userId) {
      const loaded = await loadOwnedUserProfile(request, userId, 'trichakra-method');
      if (loaded.ok) {
        const profile: UserProfile = loaded.profile;
        userProfileFromDb = {
          fullName: profile.fullName,
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          birthPlace: profile.birthPlace,
          latitude: profile.birthLatitude,
          longitude: profile.birthLongitude
        };
      } else if (!overlay) {
        // No body birth payload — cannot proceed without owned profile.
        return NextResponse.json(
          { success: false, error: loaded.error },
          { status: loaded.status },
        );
      }
      // If overlay exists and auth is missing/mismatched, continue with body payload only
      // so Stage B generation stays recoverable without Admin profile IDOR.
    }

    const finalProfile: TrichakraUserProfile | null =
      userProfileFromDb && overlay
        ? {
            ...userProfileFromDb,
            ...overlay,
            fullName: overlay.fullName ?? userProfileFromDb.fullName,
            birthDate: overlay.birthDate ?? userProfileFromDb.birthDate,
            birthTime: overlay.birthTime ?? userProfileFromDb.birthTime,
            birthPlace: overlay.birthPlace ?? userProfileFromDb.birthPlace,
            latitude:
              overlay.latitude ??
              overlay.birthLatitude ??
              userProfileFromDb.latitude,
            longitude:
              overlay.longitude ??
              overlay.birthLongitude ??
              userProfileFromDb.longitude,
          }
        : overlay || userProfileFromDb || null;

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

    const src = finalProfile as TrichakraUserProfile & {
      birthLatitude?: number;
      birthLongitude?: number;
    };
    const normalizedProfile: TrichakraUserProfile = {
      ...src,
      birthTime: normalizeBirthTime(finalProfile.birthTime),
      latitude: src.latitude ?? src.birthLatitude,
      longitude: src.longitude ?? src.birthLongitude,
    };

    devLog.info('🕉️ Generating Trichakra analysis for user:', userId || 'anonymous', 'trichakra-method');
    devLog.debug('🕉️ Birth data:', {
      birthDate: normalizedProfile.birthDate,
      birthTime: normalizedProfile.birthTime,
      birthPlace: normalizedProfile.birthPlace,
      latitude: normalizedProfile.latitude ?? null,
      longitude: normalizedProfile.longitude ?? null,
    }, 'trichakra-method');

    // Generate Trichakra analysis
    const analysis = await trichakraIntelligence.generateTrichakraRemedies(normalizedProfile);

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
    devLog.error('❌ Error generating Trichakra analysis:', error, 'route');
    
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

    const loaded = await loadOwnedUserProfile(request, userId, 'trichakra-method');
    if (!loaded.ok) {
      return NextResponse.json(
        { success: false, error: loaded.error },
        { status: loaded.status },
      );
    }

    devLog.info('🕉️ Fetching Trichakra analysis for user:', loaded.userId, 'trichakra-method');

    const profile = loaded.profile;

    // Check if profile is complete
    if (!profile.birthDate || !profile.birthTime || !profile.birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Complete profile (birth date, time, and place) is required for Trichakra analysis' },
        { status: 400 }
      );
    }

    // Prepare user profile
    const userProfile: TrichakraUserProfile = {
      fullName: profile.fullName,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      birthPlace: profile.birthPlace,
      latitude: profile.birthLatitude,
      longitude: profile.birthLongitude
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
    devLog.error('❌ Error fetching Trichakra analysis:', error, 'route');
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch Trichakra analysis' 
      },
      { status: 500 }
    );
  }
}
