import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function GET(req: NextRequest) {
  try {
    // Verify superadmin
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.superadmin) {
      return NextResponse.json({ error: 'Only superadmins can export user data' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json'; // 'json' or 'csv'
    const pageSize = parseInt(searchParams.get('pageSize') || '1000', 10);

    // Fetch all users (in batches if needed)
    let allUsers: any[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const result = await admin.auth().listUsers(pageSize, nextPageToken);
      const users = result.users.map((user) => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime,
        claims: user.customClaims || {},
        providers: user.providerData.map(p => p.providerId),
      }));
      allUsers.push(...users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['UID', 'Email', 'Display Name', 'Email Verified', 'Disabled', 'Created At', 'Last Sign In', 'Claims', 'Providers'];
      const csvRows = [headers.join(',')];
      
      allUsers.forEach(user => {
        const row = [
          user.uid,
          user.email || '',
          user.displayName || '',
          user.emailVerified ? 'Yes' : 'No',
          user.disabled ? 'Yes' : 'No',
          user.createdAt || '',
          user.lastSignIn || '',
          JSON.stringify(user.claims),
          user.providers.join(';'),
        ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
        csvRows.push(row);
      });

      const csvContent = csvRows.join('\n');
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Return JSON
      return NextResponse.json({ 
        success: true, 
        users: allUsers,
        totalCount: allUsers.length,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 