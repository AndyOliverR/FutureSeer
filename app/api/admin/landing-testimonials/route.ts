import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';

export const dynamic = 'force-dynamic';

const COLLECTION = 'landingTestimonials';

function mapDoc(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    kind: data.kind ?? 'hope',
    rating: data.rating ?? null,
    experienceText: data.experienceText ?? '',
    topic: data.topic ?? 'other',
    displayName: data.displayName ?? '',
    roleLabel: data.roleLabel ?? '',
    sharePublicly: Boolean(data.sharePublicly),
    status: data.status ?? 'pending',
    submittedAt: data.submittedAt?.toMillis?.() ?? null,
    approvedAt: data.approvedAt?.toMillis?.() ?? null,
  };
}

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!isAdminDecoded(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

/** GET pending + recent approved landing testimonials. */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  const statusFilter = request.nextUrl.searchParams.get('status') || 'pending';
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50', 10), 100);

  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('status', '==', statusFilter)
    .limit(limit)
    .get();

  const items = snapshot.docs.map((doc) => mapDoc(doc.id, doc.data()));
  items.sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0));

  return NextResponse.json({ success: true, items });
}

/** PATCH approve or reject a testimonial. */
export async function PATCH(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  const id = typeof record?.id === 'string' ? record.id.trim() : '';
  const action = record?.action;

  if (!id || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'id and action (approve|reject) required' }, { status: 400 });
  }

  const ref = adminDb.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (action === 'approve') {
    await ref.update({
      status: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: admin.uid,
    });
  } else {
    await ref.update({
      status: 'rejected',
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: admin.uid,
    });
  }

  return NextResponse.json({ success: true });
}
