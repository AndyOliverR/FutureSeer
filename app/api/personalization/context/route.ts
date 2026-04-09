import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  try {
    const auth = await verifyUserRequest(request, 'personalization-context');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const context = body?.context;

    if (!userId || !context) {
      return NextResponse.json(
        { error: 'User ID and context data are required' },
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

    const { doc, updateDoc } = await import('firebase/firestore');
    const userRef = doc(db, 'users', userId);
    
    // Update user's current context
    await updateDoc(userRef, {
      currentContext: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Context updated successfully'
    });

  } catch (error) {
    devLog.error('Error updating context:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to update context' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-context');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = resolveOwnedUserId(searchParams.get('userId'), auth.uid);

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
    const currentContext = userData.currentContext || {};
    const contextHistory = userData.contextHistory || [];

    return NextResponse.json({
      success: true,
      currentContext,
      contextHistory
    });

  } catch (error) {
    devLog.error('Error fetching context:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'personalization-context');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = resolveOwnedUserId(body?.userId, auth.uid);
    const contextUpdate = body?.contextUpdate;

    if (!userId || !contextUpdate) {
      return NextResponse.json(
        { error: 'User ID and context update are required' },
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

    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentContext = userData.currentContext || {};
    const contextHistory = userData.contextHistory || [];

    // Update current context
    const updatedContext = {
      ...currentContext,
      ...contextUpdate,
      timestamp: new Date().toISOString()
    };

    // Add to history (keep last 10 entries)
    const newHistory = [
      updatedContext,
      ...contextHistory.slice(0, 9)
    ];

    await updateDoc(userRef, {
      currentContext: updatedContext,
      contextHistory: newHistory
    });

    return NextResponse.json({
      success: true,
      message: 'Context updated and history saved',
      currentContext: updatedContext
    });

  } catch (error) {
    devLog.error('Error updating context:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to update context' },
      { status: 500 }
    );
  }
} 