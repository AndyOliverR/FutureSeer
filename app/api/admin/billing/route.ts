import { NextRequest, NextResponse } from 'next/server';
import { getAuth, adminDb } from '@/lib/firebase-admin';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return false;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return decoded.admin === true || decoded.superadmin === true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active | cancelled | all

    const snapshot = await adminDb.collection('users').get();
    const list: Array<{
      uid: string;
      email?: string;
      displayName?: string;
      subscriptionStatus?: string;
      nextBillingDate?: unknown;
      subscriptionId?: string;
      lastPaymentId?: string;
    }> = [];

    for (const d of snapshot.docs) {
      const data = d.data();
      const subStatus = data.subscriptionStatus;
      const subId = data.subscriptionId;
      if (!subStatus && !subId) continue;
      if (status && status !== 'all' && subStatus !== status) continue;

      let email = data.email;
      let displayName = data.displayName;
      try {
        const authUser = await getAuth().getUser(d.id);
        email = authUser.email ?? email;
        displayName = authUser.displayName ?? displayName;
      } catch {
        // keep Firestore values
      }

      list.push({
        uid: d.id,
        email,
        displayName,
        subscriptionStatus: subStatus,
        nextBillingDate: data.nextBillingDate,
        subscriptionId: subId,
        lastPaymentId: data.lastPaymentId,
      });
    }

    list.sort((a, b) => (String(a.subscriptionStatus).localeCompare(String(b.subscriptionStatus))));

    return NextResponse.json({ success: true, subscriptions: list });
  } catch (err) {
    console.error('Admin billing GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}
