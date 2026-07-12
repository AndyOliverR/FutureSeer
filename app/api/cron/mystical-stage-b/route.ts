/**
 * Cron: resume stale or queued mystical profile Stage B jobs (per-tool queue drain).
 * Auth: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import {
  isStageBWorkerSkipped,
  runStageBWorkerForUser,
  scheduleStageBContinuation,
} from '@/lib/mysticalStageBQueue';

const STAGE_B_HEARTBEAT_STALE_MS = 45_000;
const MAX_USERS_PER_RUN = 8;

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = process.env.CRON_SECRET;
  return !!secret && !!token && token === secret;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  const now = Date.now();
  let processed = 0;
  let skipped = 0;
  let continued = 0;

  try {
    const snap = await adminDb
      .collection('generationJobs')
      .where('status', 'in', ['queued', 'failed', 'stale_running', 'running'])
      .limit(40)
      .get();

    const candidates: string[] = [];
    for (const doc of snap.docs) {
      const data = doc.data() as {
        nextRetryAt?: number;
        lastHeartbeatAt?: number;
        status?: string;
      };
      if (typeof data.nextRetryAt === 'number' && data.nextRetryAt > now) continue;
      if (
        data.status === 'running' &&
        typeof data.lastHeartbeatAt === 'number' &&
        now - data.lastHeartbeatAt > STAGE_B_HEARTBEAT_STALE_MS
      ) {
        candidates.push(doc.id);
        continue;
      }
      if (data.status === 'stale_running') {
        candidates.push(doc.id);
        continue;
      }
      if (
        data.status === 'queued' ||
        (data.status === 'failed' && (data.nextRetryAt == null || data.nextRetryAt <= now))
      ) {
        candidates.push(doc.id);
      }
    }

    for (const uid of candidates.slice(0, MAX_USERS_PER_RUN)) {
      const job = (await adminDb.collection('generationJobs').doc(uid).get()).data() as
        | { lastHeartbeatAt?: number; status?: string }
        | undefined;
      if (
        job?.status === 'running' &&
        typeof job.lastHeartbeatAt === 'number' &&
        now - job.lastHeartbeatAt < STAGE_B_HEARTBEAT_STALE_MS
      ) {
        skipped += 1;
        continue;
      }
      const outcome = await runStageBWorkerForUser(uid);
      if (isStageBWorkerSkipped(outcome)) {
        skipped += 1;
        continue;
      }
      processed += 1;
      if (!outcome.done) {
        continued += 1;
        await scheduleStageBContinuation(uid);
      }
    }

    return NextResponse.json({ processed, skipped, continued, scanned: snap.size });
  } catch (err) {
    devLog.error('[cron/mystical-stage-b] failed', err, 'route');
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
