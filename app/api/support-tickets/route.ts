import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';
const ADMIN_EMAILS = ['andyrozario@hotmail.com', 'andyoliverrozario2@gmail.com'];

async function verifyAuth(request: NextRequest): Promise<{ uid: string; email?: string; isAdmin: boolean } | null> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return null;

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const isAdmin =
      decoded.admin === true ||
      decoded.superadmin === true ||
      (decoded.email && ADMIN_EMAILS.includes(decoded.email as string));
    return {
      uid: decoded.uid,
      email: decoded.email as string | undefined,
      isAdmin: !!isAdmin,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { type, subject, message, userName } = body;

    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: 'type, subject, and message are required' },
        { status: 400 }
      );
    }

    const validTypes = ['support', 'legal', 'privacy', 'dpo', 'billing'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const docRef = await adminDb.collection('supportTickets').add({
      userId: auth.uid,
      userEmail: auth.email || '',
      userName: typeof userName === 'string' ? userName.trim() : '',
      type: type.trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: 'open',
      response: '',
      respondedAt: null,
      respondedBy: null,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      ticketId: docRef.id,
      message: 'Your query has been submitted. You can track it in My Tickets.',
    });
  } catch (err) {
    console.error('Support tickets POST error:', err);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get('mine') === 'true';

    if (auth.isAdmin && !mine) {
      const snapshot = await adminDb
        .collection('supportTickets')
        .orderBy('createdAt', 'desc')
        .limit(200)
        .get();

      const tickets = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          userId: d.userId,
          userEmail: d.userEmail,
          userName: d.userName,
          type: d.type,
          subject: d.subject,
          message: d.message,
          status: d.status,
          response: d.response || '',
          respondedAt: d.respondedAt?.toMillis?.() ?? null,
          respondedBy: d.respondedBy ?? null,
          createdAt: d.createdAt?.toMillis?.() ?? Date.now(),
        };
      });

      return NextResponse.json({ success: true, tickets, admin: true });
    }

    const snapshot = await adminDb
      .collection('supportTickets')
      .where('userId', '==', auth.uid)
      .limit(100)
      .get();

    const tickets = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          userId: d.userId,
          userEmail: d.userEmail,
          userName: d.userName,
          type: d.type,
          subject: d.subject,
          message: d.message,
          status: d.status,
          response: d.response || '',
          respondedAt: d.respondedAt?.toMillis?.() ?? null,
          respondedBy: d.respondedBy ?? null,
          createdAt: d.createdAt?.toMillis?.() ?? Date.now(),
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ success: true, tickets });
  } catch (err) {
    console.error('Support tickets GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
