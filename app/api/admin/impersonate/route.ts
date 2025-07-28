import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(req: NextRequest) {
  try {
    // Verify superadmin
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.superadmin) {
      return NextResponse.json({ error: 'Only superadmins can impersonate users' }, { status: 403 });
    }

    const { targetUid } = await req.json();
    if (!targetUid) {
      return NextResponse.json({ error: 'Missing targetUid' }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await admin.auth().getUser(targetUid);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Create a custom token for the target user
    // This token will be valid for 1 hour and can be used to sign in as that user
    const customToken = await admin.auth().createCustomToken(targetUid, {
      impersonatedBy: decoded.uid,
      impersonatedAt: Date.now(),
    });

    return NextResponse.json({ 
      success: true, 
      customToken,
      targetUser: {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
      }
    });
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 