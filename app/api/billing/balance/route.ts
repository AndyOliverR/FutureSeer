import { NextRequest, NextResponse } from 'next/server';
import { getBillingSnapshot } from '@/lib/billingCreditsServer';
import { verifyUserRequest } from '@/lib/userApiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyUserRequest(request, 'billing-balance');
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snapshot = await getBillingSnapshot(auth.uid);
  return NextResponse.json({ success: true, ...snapshot });
}
