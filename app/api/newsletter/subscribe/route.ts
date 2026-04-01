import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';

interface NewsletterSubscription {
  email: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing subscription (prevent duplicates)
    let existingSubscription = null;
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const snapshot = await db.collection('newsletterSubscriptions')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        existingSubscription = snapshot.docs[0].data();
      }
    } else {
      // Client-side: Use Client SDK (shouldn't happen in API route, but handle gracefully)
      const q = query(
        collection(db, 'newsletterSubscriptions'),
        where('email', '==', normalizedEmail),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        existingSubscription = snapshot.docs[0].data();
      }
    }

    // If already subscribed and active, return success
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        alreadySubscribed: true,
      });
    }

    // Create or update subscription
    const subscription: NewsletterSubscription = {
      email: normalizedEmail,
      subscribedAt: existingSubscription?.subscribedAt || new Date(),
      status: 'active',
    };

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      if (existingSubscription) {
        // Update existing subscription
        const snapshot = await db.collection('newsletterSubscriptions')
          .where('email', '==', normalizedEmail)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update(subscription);
        }
      } else {
        // Create new subscription
        await db.collection('newsletterSubscriptions').add(subscription);
      }
    } else {
      // Client-side: Use Client SDK (shouldn't happen in API route, but handle gracefully)
      const q = query(
        collection(db, 'newsletterSubscriptions'),
        where('email', '==', normalizedEmail),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, {
          email: subscription.email,
          subscribedAt: subscription.subscribedAt,
          status: subscription.status,
        });
      } else {
        await addDoc(collection(db, 'newsletterSubscriptions'), subscription);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    });

  } catch (error) {
    devLog.error('Error subscribing to newsletter:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

