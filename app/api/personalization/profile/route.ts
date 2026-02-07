import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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

    // Use the correct Firestore methods based on environment
    let userDoc;
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      // Admin SDK uses db.collection().doc() or db.doc()
      const userRef = db.collection('users').doc(userId);
      userDoc = await userRef.get();
    } else {
      // Client-side: Use Client SDK
      const { doc, getDoc } = require('firebase/firestore');
      userDoc = await getDoc(doc(db, 'users', userId));
    }
    
    if (!userDoc.exists) {
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

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Use the correct Firestore methods based on environment
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      // Admin SDK uses db.collection().doc() and .update()
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        advancedProfile,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Client-side: Use Client SDK
      const { doc, updateDoc } = require('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        advancedProfile,
        updatedAt: new Date().toISOString()
      });
    }

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

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Use the correct Firestore methods based on environment
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        advancedProfile: {
          ...advancedProfile,
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      // Client-side: Use Client SDK
      const { doc, updateDoc } = require('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        advancedProfile: {
          ...advancedProfile,
          updatedAt: new Date().toISOString()
        }
      });
    }

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