import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

// Server-side Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for server-side
const getServerFirebaseDB = () => {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return getFirestore(app);
  } catch (error) {
    console.error('Failed to initialize Firebase on server:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = getServerFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      // Return empty advanced profile if user doesn't exist
      return NextResponse.json({
        success: true,
        advancedProfile: {}
      });
    }

    const userData = userDoc.data();
    const advancedProfile = userData.advancedProfile || {};

    return NextResponse.json({
      success: true,
      advancedProfile
    });

  } catch (error) {
    console.error('Error fetching advanced profile:', error);
    // Return empty profile instead of error
    return NextResponse.json({
      success: true,
      advancedProfile: {}
    });
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

    const db = getServerFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
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

    const db = getServerFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
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