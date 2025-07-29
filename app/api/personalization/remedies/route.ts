import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { generateAdvancedPersonalizedRemedies } from '@/lib/comprehensiveRemedyGenerator';

const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, context, question, systemPreferences } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user's advanced profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const advancedProfile = userData.advancedProfile || {};
    const basicProfile = {
      name: userData.name || '',
      birthDate: userData.birthDate || '',
      birthTime: userData.birthTime || '',
      birthLocation: userData.birthLocation || ''
    };

    // Generate personalized remedies
    const personalizedRemedies = await generateAdvancedPersonalizedRemedies({
      userProfile: advancedProfile,
      basicProfile,
      context: context || {},
      question: question || '',
      systemPreferences: systemPreferences || []
    });

    return NextResponse.json({
      success: true,
      remedies: personalizedRemedies,
      profileUsed: {
        advanced: advancedProfile,
        basic: basicProfile
      }
    });

  } catch (error) {
    console.error('Error generating personalized remedies:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized remedies' },
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

    // Fetch user's saved remedies or generate new ones
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const savedRemedies = userData.savedRemedies || [];
    const advancedProfile = userData.advancedProfile || {};

    // Filter by category if specified
    const filteredRemedies = category 
      ? savedRemedies.filter((remedy: any) => remedy.category === category)
      : savedRemedies;

    return NextResponse.json({
      success: true,
      remedies: filteredRemedies,
      profile: advancedProfile
    });

  } catch (error) {
    console.error('Error fetching personalized remedies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized remedies' },
      { status: 500 }
    );
  }
} 