import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

/**
 * GET /api/admin/tool-interest
 * Returns tool interest submissions for admin review. Requires admin or superadmin.
 * Header: Authorization: Bearer <Firebase ID token>
 */
export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let decoded: { uid: string; email?: string; [key: string]: unknown };
    try {
      decoded = await getAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const isAdmin = decoded.admin === true || decoded.superadmin === true;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    const snapshot = await adminDb
      .collection('toolInterests')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const submissions = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toMillis?.() ?? (typeof data.createdAt === 'number' ? data.createdAt : null) ?? (data.createdAt instanceof Date ? data.createdAt.getTime() : null);
      return {
        id: doc.id,
        techniqueName: data.techniqueName ?? '',
        techniqueSlug: data.techniqueSlug ?? '',
        email: data.email ?? undefined,
        message: data.message ?? undefined,
        userId: data.userId ?? undefined,
        createdAt,
      };
    });

    return NextResponse.json({ success: true, submissions });
  } catch (err) {
    console.error('Admin tool-interest API error:', err);
    return NextResponse.json({ error: 'Failed to fetch tool interest' }, { status: 500 });
  }
}
