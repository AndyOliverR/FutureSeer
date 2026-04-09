import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { generateAdvancedPersonalizedRemedies } from '@/lib/comprehensiveRemedyGenerator';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

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

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const advancedProfile = userData.advancedProfile || {};
    const context = userData.currentContext || {};

    // Generate personalized remedies
    const personalizedRemedies = await generateAdvancedPersonalizedRemedies({
      ...systemData,
      userProfile: userData
    }, question, advancedProfile, context);

    // Save remedies to user's profile
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'users', userId), {
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

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const savedRemedies = userData.savedRemedies || [];
    
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