import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { adminDb } from '@/lib/firebase-admin'

async function parseAuth(request: NextRequest): Promise<{ uid: string } | { error: NextResponse }> {
  const authHeader = request.headers.get('Authorization')
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) {
    return { error: NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 }) }
  }
  try {
    const decoded = await getAuth().verifyIdToken(idToken)
    return { uid: decoded.uid }
  } catch {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) }
  }
}

/**
 * GET /api/activity
 * Server-side read of userActivity via Admin (bypasses client Firestore rules).
 * Returns UserActivityItem[] for the authenticated user.
 * Header: Authorization: Bearer <Firebase ID token>
 * If the userActivity composite index is not yet deployed/built, returns 200 with []
 * and X-Activity-Index-Pending: true so the client can use its fallback (e.g. getUserActivity).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await parseAuth(request)
    if ('error' in auth) return auth.error
    const { uid } = auth

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const snapshot = await adminDb
      .collection('userActivity')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get()

    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))

    return NextResponse.json(items)
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: number | string }).code : undefined
    const msg = err instanceof Error ? err.message : String(err)
    const isIndexRequired = code === 9 || code === 'failed-precondition' || msg.includes('index')
    if (isIndexRequired) {
      const res = NextResponse.json([])
      res.headers.set('X-Activity-Index-Pending', 'true')
      return res
    }
    console.error('Activity GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}

/**
 * POST /api/activity
 * Server-side write to userActivity using Firebase Admin (bypasses client Firestore rules).
 * Body: { type: string, payload?: Record<string, unknown> }
 * Header: Authorization: Bearer <Firebase ID token>
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await parseAuth(request)
    if ('error' in auth) return auth.error
    const { uid } = auth

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const { type, payload } = body
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid type' }, { status: 400 })
    }

    const docRef = await adminDb.collection('userActivity').add({
      uid,
      type,
      timestamp: Date.now(),
      ...(payload && typeof payload === 'object' && { payload }),
    })

    return NextResponse.json({ success: true, id: docRef.id })
  } catch (err) {
    console.error('Activity API error:', err)
    return NextResponse.json({ error: 'Failed to save activity' }, { status: 500 })
  }
}
