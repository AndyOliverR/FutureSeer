import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import type { AdvancedUserProfile, PersonalizedContext } from '@/lib/advancedPersonalization';
import { generateAdvancedPersonalizedRemedies } from '@/lib/comprehensiveRemedyGenerator';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';
import { userRootDocGet, userRootDocUpdate } from '@/lib/userSubcollectionFirestore';

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const auth = await verifyUserRequest(request, 'personalization-remedies');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const question = body?.question;
    const systemData = body?.systemData;

    if (!userId || !question) {
      return NextResponse.json(
        { error: 'User ID and question are required' },
        { status: 400 }
      );
    }

    const userData = await userRootDocGet(userId);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const advancedProfile = (userData.advancedProfile ?? {}) as AdvancedUserProfile;
    const context = (userData.currentContext ?? {}) as PersonalizedContext;

    // Generate personalized remedies
    const personalizedRemedies = await generateAdvancedPersonalizedRemedies({
      ...systemData,
      userProfile: userData
    }, question, advancedProfile, context);

    await userRootDocUpdate(userId, {
      savedRemedies: personalizedRemedies,
      lastRemedyGeneration: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      remedies: personalizedRemedies
    });

  } catch (error) {
    devLog.error('Error generating remedies:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate remedies' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-remedies');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = resolveOwnedUserId(searchParams.get('userId'), auth.uid);
    const category = searchParams.get('category');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userData = await userRootDocGet(userId);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const rawSaved = userData.savedRemedies;
    const savedRemedies = Array.isArray(rawSaved) ? rawSaved : [];

    // Filter by category if specified
    const filteredRemedies = category
      ? savedRemedies.filter((remedy: { category?: string }) => remedy.category === category)
      : savedRemedies;

    return NextResponse.json({
      success: true,
      remedies: filteredRemedies
    });

  } catch (error) {
    devLog.error('Error fetching remedies:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to fetch remedies' },
      { status: 500 }
    );
  }
}
