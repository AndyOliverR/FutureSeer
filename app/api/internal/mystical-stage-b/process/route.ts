/**
 * Internal worker: drain per-tool Stage B queue for one user.
 * Auth: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { ensureAdminAvailable } from '@/lib/firebase-admin';
import {
  isStageBWorkerSkipped,
  runStageBWorkerForUser,
  scheduleStageBContinuation,
} from '@/lib/mysticalStageBQueue';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function verifyWorkerSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = process.env.CRON_SECRET;
  return !!secret && !!token && token === secret;
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  if (!verifyWorkerSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ensureAdminAvailable('POST /api/internal/mystical-stage-b/process')) {
    return NextResponse.json({ error: 'Admin unavailable' }, { status: 503 });
  }

  let body: { uid?: string };
  try {
    body = (await request.json()) as { uid?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
  if (!uid) {
    return NextResponse.json({ error: 'uid is required' }, { status: 400 });
  }

  try {
    const outcome = await runStageBWorkerForUser(uid);
    if (isStageBWorkerSkipped(outcome)) {
      return NextResponse.json({ success: true, skipped: true, reason: outcome.reason });
    }
    if (!outcome.done) {
      await scheduleStageBContinuation(uid);
    }
    return NextResponse.json({ success: true, ...outcome });
  } catch (err) {
    devLog.error('[mystical-stage-b/process] worker failed', err, 'route');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Worker failed' },
      { status: 500 },
    );
  }
}
