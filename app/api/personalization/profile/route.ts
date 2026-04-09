import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-profile');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = resolveOwnedUserId(searchParams.get('userId'), auth.uid);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required and must match authenticated user' }, { status: 403 });
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
    devLog.error('Error fetching advanced profile:', error, 'route');
    // Return empty profile instead of error
    return NextResponse.json({
      success: true,
      advancedProfile: {}
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-profile');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const advancedProfile = body?.advancedProfile;

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
    devLog.error('Error updating advanced profile:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to update advanced profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-profile');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const advancedProfile = body?.advancedProfile;

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
    devLog.error('Error merging advanced profile:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to merge advanced profile' },
      { status: 500 }
    );
  }
} 