import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb, getAuth } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/adminApiAuth';
import { buildAdminUserJourney } from '@/lib/adminUserJourney';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ uid: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  try {
    const auth = await verifyAdminRequest(request, 'admin/users/journey');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { uid } = await context.params;
    const trimmed = uid?.trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'User id required' }, { status: 400 });
    }

    let authUser = null;
    try {
      authUser = await getAuth().getUser(trimmed);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/user-not-found') {
        throw err;
      }
    }

    const journey = await buildAdminUserJourney(adminDb, authUser, trimmed);
    return NextResponse.json(journey);
  } catch (err) {
    devLog.error('[admin/users/journey] failed', err, 'route');
    return NextResponse.json({ error: 'Failed to load user journey' }, { status: 500 });
  }
}
