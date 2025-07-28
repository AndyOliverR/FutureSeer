import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.superadmin) {
      return NextResponse.json({ error: 'Only superadmins can list users' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const pageToken = searchParams.get('pageToken') || undefined;
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const email = searchParams.get('email') || undefined;

    let users = [];
    let nextPageToken: string | undefined = undefined;

    if (email) {
      // Search by email
      try {
        const user = await admin.auth().getUserByEmail(email);
        users = [{
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          claims: user.customClaims || {},
        }];
        nextPageToken = undefined;
      } catch (e) {
        users = [];
        nextPageToken = undefined;
      }
    } else {
      // Paginated list
      const result = await admin.auth().listUsers(pageSize, pageToken);
      users = result.users.map((user) => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        claims: user.customClaims || {},
      }));
      nextPageToken = result.pageToken;
    }

    return NextResponse.json({ users, nextPageToken });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 