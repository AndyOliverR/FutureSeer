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
      return NextResponse.json({ error: 'Only superadmins can view audit logs' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // In a real implementation, you would store audit logs in Firestore or a dedicated logging service
    // For now, we'll return a placeholder structure
    const mockAuditLogs = [
      {
        id: '1',
        action: 'updateClaims',
        performedBy: decoded.uid,
        targetUser: 'user123',
        details: { claims: { admin: true } },
        timestamp: new Date().toISOString(),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
      {
        id: '2',
        action: 'impersonate',
        performedBy: decoded.uid,
        targetUser: 'user456',
        details: { impersonatedUser: { email: 'test@example.com' } },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
      {
        id: '3',
        action: 'bulkAction',
        performedBy: decoded.uid,
        targetUser: 'multiple',
        details: { action: 'updateClaims', count: 5, claims: { support: true } },
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    ];

    // Apply filters
    let filteredLogs = mockAuditLogs;
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.targetUser === userId);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit,
      offset,
      hasMore: offset + limit < filteredLogs.length,
    });

  } catch (error: any) {
    console.error('Audit logs error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 