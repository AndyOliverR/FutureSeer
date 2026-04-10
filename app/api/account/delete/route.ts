import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { rateLimiters } from '@/lib/rateLimit';
import { checkRateLimitWithOptionalFirestore } from '@/lib/rateLimitFirestore';
import { deleteUserAccount } from '@/lib/server/deleteUserAccount';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  const auth = await verifyUserRequest(request, 'account-delete');
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const delLimit = await checkRateLimitWithOptionalFirestore(
    rateLimiters.accountDeletion,
    'account_delete',
    auth.uid,
  );
  if (!delLimit.allowed) {
    return NextResponse.json(
      { error: rateLimiters.accountDeletion.getErrorMessage() },
      { status: 429 },
    );
  }

  let body: { confirm?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body */
  }
  if (body.confirm !== true) {
    return NextResponse.json(
      { error: 'Send JSON body { "confirm": true } to permanently delete your account.' },
      { status: 400 },
    );
  }

  const result = await deleteUserAccount(auth.uid);
  if (!result.ok) {
    devLog.error('[account/delete]', result.error, 'route');
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
