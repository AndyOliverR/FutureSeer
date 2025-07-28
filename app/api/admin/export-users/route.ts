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
    const fields = searchParams.get('fields')?.split(',') || [
      'uid', 'email', 'displayName', 'emailVerified', 'disabled', 
      'createdAt', 'lastSignIn', 'claims', 'providers'
    ];

    // Fetch all users (in batches if needed)
    let allUsers: any[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const result = await admin.auth().listUsers(pageSize, nextPageToken);
      const users = result.users.map((user) => {
        const userData: any = {};
        
        if (fields.includes('uid')) userData.uid = user.uid;
        if (fields.includes('email')) userData.email = user.email;
        if (fields.includes('displayName')) userData.displayName = user.displayName;
        if (fields.includes('emailVerified')) userData.emailVerified = user.emailVerified;
        if (fields.includes('disabled')) userData.disabled = user.disabled;
        if (fields.includes('createdAt')) userData.createdAt = user.metadata.creationTime;
        if (fields.includes('lastSignIn')) userData.lastSignIn = user.metadata.lastSignInTime;
        if (fields.includes('claims')) userData.claims = user.customClaims || {};
        if (fields.includes('providers')) userData.providers = user.providerData.map(p => p.providerId);
        if (fields.includes('phoneNumber')) userData.phoneNumber = user.phoneNumber;
        if (fields.includes('photoURL')) userData.photoURL = user.photoURL;
        if (fields.includes('tenantId')) userData.tenantId = user.tenantId;
        
        return userData;
      });
      allUsers.push(...users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    if (format === 'csv') {
      // Convert to CSV with selected fields
      const csvHeaders = fields.map(field => field.charAt(0).toUpperCase() + field.slice(1));
      const csvRows = [csvHeaders.join(',')];
      
      allUsers.forEach(user => {
        const row = fields.map(field => {
          let value = user[field];
          if (field === 'claims') {
            value = JSON.stringify(value);
          } else if (field === 'providers') {
            value = Array.isArray(value) ? value.join(';') : value;
          } else if (field === 'emailVerified' || field === 'disabled') {
            value = value ? 'Yes' : 'No';
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',');
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
        fields: fields,
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 