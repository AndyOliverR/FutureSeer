import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';

interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
  routedTo?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Route based on subject
    let routedTo = 'support@futureseer.app';
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('legal') || subjectLower.includes('law') || subjectLower.includes('terms')) {
      routedTo = 'legal@futureseer.app';
    } else if (subjectLower.includes('billing') || subjectLower.includes('payment') || subjectLower.includes('refund')) {
      routedTo = 'billing@futureseer.app';
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Create submission document
    const submission: ContactSubmission = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date(),
      routedTo,
    };

    // Store in Firestore (server-side uses Admin SDK)
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      await db.collection('contactSubmissions').add(submission);
    } else {
      // Client-side: Use Client SDK (shouldn't happen in API route, but handle gracefully)
      const { collection, addDoc } = require('firebase/firestore');
      await addDoc(collection(db, 'contactSubmissions'), submission);
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon!',
      routedTo,
    });

  } catch (error) {
    devLog.error('Error submitting contact form:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again later.' },
      { status: 500 }
    );
  }
}

