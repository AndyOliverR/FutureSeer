import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const advancedProfile = userData.advancedProfile || {};

    return NextResponse.json({
      success: true,
      advancedProfile
    });

  } catch (error) {
    console.error('Error fetching advanced profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advanced profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, advancedProfile } = body;

    if (!userId || !advancedProfile) {
      return NextResponse.json(
        { error: 'User ID and advanced profile data are required' },
        { status: 400 }
      );
    }

    const userRef = doc(db, 'users', userId);
    
    // Update the user document with advanced profile data
    await updateDoc(userRef, {
      advancedProfile,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Advanced profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating advanced profile:', error);
    return NextResponse.json(
      { error: 'Failed to update advanced profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, advancedProfile } = body;

    if (!userId || !advancedProfile) {
      return NextResponse.json(
        { error: 'User ID and advanced profile data are required' },
        { status: 400 }
      );
    }

    const userRef = doc(db, 'users', userId);
    
    // Merge the advanced profile data with existing data
    await updateDoc(userRef, {
      advancedProfile: {
        ...advancedProfile,
        updatedAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Advanced profile merged successfully'
    });

  } catch (error) {
    console.error('Error merging advanced profile:', error);
    return NextResponse.json(
      { error: 'Failed to merge advanced profile' },
      { status: 500 }
    );
  }
} 