import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
import { deleteDocument, isAdminAvailable } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

/**
 * POST /api/profile/invalidate-cache
 * Clears server-side divination cache for the authenticated user after profile regenerate.
 * Header: Authorization: Bearer <Firebase ID token>
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    clearCachedDivinationData(uid);
    if (isAdminAvailable()) {
      await deleteDocument('comprehensiveMysticalProfiles', uid);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    devLog.error('Profile invalidate-cache API error', err, 'invalidate-cache');
    return NextResponse.json({ error: 'Failed to invalidate cache' }, { status: 500 });
  }
}
