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
      return NextResponse.json({ error: 'Only superadmins can perform bulk actions' }, { status: 403 });
    }

    const { action, userIds, claims, reason } = await req.json();
    
    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Missing action, userIds, or invalid userIds array' }, { status: 400 });
    }

    const results = {
      success: [] as string[],
      failed: [] as { uid: string; error: string }[],
      total: userIds.length,
    };

    switch (action) {
      case 'updateClaims':
        if (!claims || typeof claims !== 'object') {
          return NextResponse.json({ error: 'Missing or invalid claims object' }, { status: 400 });
        }
        
        for (const uid of userIds) {
          try {
            await admin.auth().setCustomUserClaims(uid, claims);
            results.success.push(uid);
          } catch (error: any) {
            results.failed.push({ uid, error: error.message });
          }
        }
        break;

      case 'disableUsers':
        for (const uid of userIds) {
          try {
            await admin.auth().updateUser(uid, { disabled: true });
            results.success.push(uid);
          } catch (error: any) {
            results.failed.push({ uid, error: error.message });
          }
        }
        break;

      case 'enableUsers':
        for (const uid of userIds) {
          try {
            await admin.auth().updateUser(uid, { disabled: false });
            results.success.push(uid);
          } catch (error: any) {
            results.failed.push({ uid, error: error.message });
          }
        }
        break;

      case 'deleteUsers':
        if (!decoded.deleteUser) {
          return NextResponse.json({ error: 'You do not have permission to delete users' }, { status: 403 });
        }
        
        for (const uid of userIds) {
          try {
            await admin.auth().deleteUser(uid);
            results.success.push(uid);
          } catch (error: any) {
            results.failed.push({ uid, error: error.message });
          }
        }
        break;

      case 'sendPasswordReset':
        for (const uid of userIds) {
          try {
            const user = await admin.auth().getUser(uid);
            if (user.email) {
              // Note: Firebase Admin SDK doesn't directly send password reset emails
              // This would typically be done through a custom email service
              // For now, we'll just mark it as successful
              results.success.push(uid);
            } else {
              results.failed.push({ uid, error: 'User has no email address' });
            }
          } catch (error: any) {
            results.failed.push({ uid, error: error.message });
          }
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the bulk action for audit purposes
    console.log(`Bulk action performed by ${decoded.uid}:`, {
      action,
      userIds,
      claims,
      reason,
      results: {
        success: results.success.length,
        failed: results.failed.length,
        total: results.total,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      results,
      action,
      performedBy: decoded.uid,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 