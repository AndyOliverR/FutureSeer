import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';
import type { ErrorSeverity } from '@/lib/errorLogging';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';

interface IncomingClientErrorBody {
  severity?: ErrorSeverity;
  area?: string;
  action?: string;
  message?: string;
  route?: string;
  browser?: string;
  meta?: Record<string, unknown>;
}

function truncate(value: unknown, max = 800): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (value.length <= max) return value;
  return value.slice(0, max) + '…';
}

function getEnvironment(): 'production' | 'preview' | 'development' | 'unknown' {
  const env =
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV;
  if (env === 'production' || env === 'preview' || env === 'development') {
    return env;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as IncomingClientErrorBody;
    const { area, action, message } = body;
    if (!area || !action || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const authHeader = request.headers.get('Authorization');
      const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (idToken) {
        const decoded = await getAuth().verifyIdToken(idToken);
        userId = decoded.uid;
      }
    } catch {
      // If token is invalid, we still record the error but without userId
    }

    const event = {
      timestamp: new Date().toISOString(),
      environment: getEnvironment(),
      severity: body.severity || ('error' as ErrorSeverity),
      source: 'client' as const,
      area,
      action,
      message: truncate(message, 800) || 'Unknown error',
      userId,
      route: truncate(body.route, 400),
      browser: truncate(body.browser, 512),
      meta: body.meta && typeof body.meta === 'object' ? body.meta : undefined,
    };

    if (adminDb) {
      await adminDb.collection('errorEvents').add(event);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    devLog.error('[log-client-error] Failed to record client error', err, 'log-client-error');
    return NextResponse.json({ error: 'Failed to record error' }, { status: 500 });
  }
}

