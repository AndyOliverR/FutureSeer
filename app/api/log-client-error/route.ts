import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import type { ErrorSeverity } from '@/lib/errorLogging';
import { getErrorEventEnvironment, writeErrorEventToFirestore } from '@/lib/errorEvents';
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

function normalizeSeverity(v: unknown): ErrorSeverity {
  if (v === 'error' || v === 'warning' || v === 'info') return v;
  return 'error';
}

function truncate(value: unknown, max = 800): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (value.length <= max) return value;
  return value.slice(0, max) + '…';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as IncomingClientErrorBody;
    const { area, action, message } = body;
    if (!area || !action || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let userId: string | null = null;
    let meta: Record<string, unknown> | undefined =
      body.meta && typeof body.meta === 'object' ? { ...body.meta } : undefined;
    try {
      const authHeader = request.headers.get('Authorization');
      const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (idToken) {
        const decoded = await getAuth().verifyIdToken(idToken);
        userId = decoded.uid;
        if (!meta) meta = {};
        const email =
          typeof decoded.email === 'string' && decoded.email.trim()
            ? decoded.email.trim()
            : undefined;
        const name =
          typeof decoded.name === 'string' && decoded.name.trim()
            ? decoded.name.trim()
            : undefined;
        if (email && meta.userEmail == null) meta.userEmail = email;
        if (name && meta.userDisplayName == null) meta.userDisplayName = name;
      }
    } catch {
      // If token is invalid, we still record the error but without userId
    }

    await writeErrorEventToFirestore({
      timestamp: new Date().toISOString(),
      environment: getErrorEventEnvironment(),
      severity: normalizeSeverity(body.severity),
      source: 'client',
      area,
      action,
      message: truncate(message, 800) || 'Unknown error',
      userId,
      route: truncate(body.route, 400),
      browser: truncate(body.browser, 512),
      meta,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    devLog.error('[log-client-error] Failed to record client error', err, 'log-client-error');
    return NextResponse.json({ error: 'Failed to record error' }, { status: 500 });
  }
}

