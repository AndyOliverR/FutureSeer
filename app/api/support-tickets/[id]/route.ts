import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['andyrozario@hotmail.com', 'andyoliverrozario2@gmail.com'];

async function verifyAdmin(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return null;

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const isAdmin =
      decoded.admin === true ||
      decoded.superadmin === true ||
      (decoded.email && ADMIN_EMAILS.includes(decoded.email as string));
    if (!isAdmin) return null;
    return { uid: decoded.uid, email: decoded.email as string | undefined };
  } catch {
    return null;
  }
}

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ id: '_' }]
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { response } = body;

    if (typeof response !== 'string' || !response.trim()) {
      return NextResponse.json({ error: 'response is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const docRef = adminDb.collection('supportTickets').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await docRef.update({
      response: response.trim(),
      status: 'responded',
      respondedAt: new Date(),
      respondedBy: auth.uid,
    });

    return NextResponse.json({ success: true, message: 'Response submitted' });
  } catch (err) {
    console.error('Support tickets PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
