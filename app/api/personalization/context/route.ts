import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, context } = body;

    if (!userId || !context) {
      return NextResponse.json(
        { error: 'User ID and context data are required' },
        { status: 400 }
      );
    }

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
    console.error('Error updating context:', error);
    return NextResponse.json(
      { error: 'Failed to update context' },
      { status: 500 }
    );
  }
}

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
    const currentContext = userData.currentContext || {};
    const contextHistory = userData.contextHistory || [];

    return NextResponse.json({
      success: true,
      currentContext,
      contextHistory
    });

  } catch (error) {
    console.error('Error fetching context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, contextUpdate } = body;

    if (!userId || !contextUpdate) {
      return NextResponse.json(
        { error: 'User ID and context update are required' },
        { status: 400 }
      );
    }

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
    console.error('Error updating context:', error);
    return NextResponse.json(
      { error: 'Failed to update context' },
      { status: 500 }
    );
  }
} 