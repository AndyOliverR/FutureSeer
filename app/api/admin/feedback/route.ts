import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

/**
 * GET /api/admin/feedback
 * Returns feedback submissions for admin review. Requires admin or superadmin.
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
      .collection('feedbackSubmissions')
      .orderBy('submittedAt', 'desc')
      .limit(limit)
      .get();

    const submissions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        rating: data.rating,
        feedback: data.feedback || '',
        url: data.url,
        userAgent: data.userAgent,
        userId: data.userId ?? null,
        timestamp: data.timestamp?.toMillis?.() ?? data.timestamp,
        submittedAt: data.submittedAt?.toMillis?.() ?? data.submittedAt,
        screenshots: data.screenshots || [],
        screenshotCount: data.screenshotCount ?? 0,
      };
    });

    return NextResponse.json({ success: true, submissions });
  } catch (err) {
    devLog.error('Admin feedback API error:', err, 'route');
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
