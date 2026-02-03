import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayClient, cancelSubscription } from '@/lib/razorpay';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, userId } = body;

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Missing subscription ID or user ID' },
        { status: 400 }
      );
    }

    // Cancel Razorpay subscription
    await cancelSubscription(subscriptionId, false); // Cancel immediately

    // Update Firestore
    const db = getFirebaseDB();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscriptionStatus: 'cancelled',
      subscriptionCancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
