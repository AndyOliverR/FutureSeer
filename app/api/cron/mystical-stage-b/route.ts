/**
 * Cron: resume stale or queued mystical profile Stage B jobs (per-tool queue drain).
 * Auth: Authorization: Bearer <CRON_SECRET>
 *
 * Must return quickly — each user's work runs in /api/internal/mystical-stage-b/process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import { scheduleStageBContinuation } from '@/lib/mysticalStageBQueue';

const STAGE_B_HEARTBEAT_STALE_MS = 45_000;
/** Max parallel worker kicks per cron tick (each runs in its own serverless invocation). */
const MAX_USERS_PER_RUN = 6;

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = process.env.CRON_SECRET;
  return !!secret && !!token && token === secret;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
  let triggered = 0;
  let skipped = 0;

  try {
    const snap = await adminDb
      .collection('generationJobs')
      .where('status', 'in', ['queued', 'failed', 'stale_running', 'failed_terminal'])
      .limit(40)
      .get();

    // Also surface workers stuck in `running` with a dead/missing heartbeat.
    const runningSnap = await adminDb
      .collection('generationJobs')
      .where('status', '==', 'running')
      .limit(20)
      .get();

    const candidates: string[] = [];
    for (const doc of snap.docs) {
      const data = doc.data() as {
        nextRetryAt?: number;
        lastHeartbeatAt?: number;
        status?: string;
      };
      if (typeof data.nextRetryAt === 'number' && data.nextRetryAt > now) continue;
      if (data.status === 'stale_running' || data.status === 'failed_terminal') {
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
    for (const doc of runningSnap.docs) {
      const data = doc.data() as { lastHeartbeatAt?: number };
      const lastHeartbeatAt = Number(data.lastHeartbeatAt ?? 0);
      const stale =
        lastHeartbeatAt <= 0 || now - lastHeartbeatAt > STAGE_B_HEARTBEAT_STALE_MS;
      if (stale && !candidates.includes(doc.id)) {
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
      after(() => {
        void scheduleStageBContinuation(uid);
      });
      triggered += 1;
    }

    return NextResponse.json({
      triggered,
      skipped,
      scanned: snap.size + runningSnap.size,
    });
  } catch (err) {
    devLog.error('[cron/mystical-stage-b] failed', err, 'route');
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
