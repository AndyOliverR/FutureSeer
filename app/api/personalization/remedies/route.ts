import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { generateAdvancedPersonalizedRemedies } from '@/lib/comprehensiveRemedyGenerator';

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const body = await request.json();
    const { userId, question, systemData } = body;

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
    console.error('Error generating remedies:', error);
    return NextResponse.json(
      { error: 'Failed to generate remedies' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
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
      ? savedRemedies.filter((remedy: any) => remedy.category === category)
      : savedRemedies;

    return NextResponse.json({
      success: true,
      remedies: filteredRemedies
    });

  } catch (error) {
    console.error('Error fetching remedies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remedies' },
      { status: 500 }
    );
  }
} 