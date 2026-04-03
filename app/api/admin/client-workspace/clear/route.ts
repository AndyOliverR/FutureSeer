/**
 * POST /api/admin/client-workspace/clear
 * Clears consultant workspace data for allowlisted accounts (God/Mary):
 * client profile fields on users/{uid}, comprehensive mystical output, seer master, generation lock.
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, deleteDocument, isAdminAvailable } from '@/lib/firebase-admin';
import { getClientWorkspaceEmails } from '@/lib/clientWorkspace';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
import { devLog } from '@/lib/devLogger';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let uid: string;
    let email: string | undefined;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
      email = decoded.email;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const allowed = getClientWorkspaceEmails();
    if (!email || !allowed.includes(email.trim().toLowerCase())) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    if (!isAdminAvailable() || !adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const del = FieldValue.delete();

    await userRef.update({
      displayName: del,
      fullName: del,
      gender: del,
      birthDate: del,
      birthTime: del,
      birthTimeKnown: del,
      birthTimePeriod: del,
      birthTimeNote: del,
      birthPlace: del,
      currentLocation: del,
      birthLatitude: del,
      birthLongitude: del,
      facePhotoUrl: del,
      palmPhotoUrl: del,
      mysticalProfileGenerated: del,
      mysticalProfileGeneratedAt: del,
      profileDataHash: del,
      profileStatus: del,
      profileEditCount: del,
      profileEditPeriodStart: del,
      updatedAt: Date.now(),
    });

    await deleteDocument('comprehensiveMysticalProfiles', uid);
    await deleteDocument('seerMaster', uid);
    await deleteDocument('generationLocks', uid);

    clearCachedDivinationData(uid);

    devLog.info('[client-workspace/clear] Cleared workspace', { uid, email }, 'route');

    return NextResponse.json({ success: true });
  } catch (err) {
    devLog.error('client-workspace/clear error', err, 'route');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to clear workspace' },
      { status: 500 }
    );
  }
}
