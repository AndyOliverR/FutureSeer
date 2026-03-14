import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    devLog.warn('[admin/app-settings] No Bearer token', 'route');
    return false;
  }
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!isAdminDecoded(decoded)) {
      devLog.warn('[admin/app-settings] Token valid but not admin', { email: decoded.email ?? '(no email)' }, 'route');
      return false;
    }
    return true;
  } catch (err) {
    devLog.warn('[admin/app-settings] verifyIdToken failed', err, 'route');
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const environment =
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV ||
      'unknown';

    return NextResponse.json({ success: true, environment });
  } catch (err) {
    devLog.error('Admin app-settings GET error:', err, 'route');
    return NextResponse.json({ error: 'Failed to fetch app settings' }, { status: 500 });
  }
}
