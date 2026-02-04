import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';
import { refundPayment } from '@/lib/razorpay';
import { writeAuditLog } from '@/lib/adminAudit';

async function verifyAdmin(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const isAdmin = decoded.admin === true || decoded.superadmin === true;
    if (!isAdmin) return null;
    return { uid: decoded.uid, email: decoded.email as string | undefined };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, amount, reason } = body;
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId required' }, { status: 400 });
    }

    await refundPayment(paymentId, amount ? Number(amount) : undefined);
    await writeAuditLog({
      actorUid: auth.uid,
      actorEmail: auth.email,
      action: 'refund',
      details: { paymentId, amount, reason },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin refund error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to process refund' },
      { status: 500 }
    );
  }
}
