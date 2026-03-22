import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminRequest } from '@/lib/adminApiAuth';

export const dynamic = 'force-dynamic';

const TRIAGE_STATUSES = ['open', 'resolved', 'ignored'] as const;
type TriageStatus = (typeof TRIAGE_STATUSES)[number];

function isTriageStatus(v: unknown): v is TriageStatus {
  return typeof v === 'string' && (TRIAGE_STATUSES as readonly string[]).includes(v);
}

const NOTE_MAX = 2000;
const MAX_IDS = 200;

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  try {
    const auth = await verifyAdminRequest(request, 'admin/error-events/bulk');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    const db = adminDb;

    const body = (await request.json().catch(() => ({}))) as {
      ids?: unknown;
      triageStatus?: unknown;
      triageNote?: unknown;
    };

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (body.ids.length > MAX_IDS) {
      return NextResponse.json({ error: `At most ${MAX_IDS} ids per request` }, { status: 400 });
    }
    if (!body.ids.every((id) => typeof id === 'string' && id.length > 0)) {
      return NextResponse.json({ error: 'Each id must be a non-empty string' }, { status: 400 });
    }

    if (!isTriageStatus(body.triageStatus)) {
      return NextResponse.json(
        { error: 'Invalid or missing triageStatus (open | resolved | ignored)' },
        { status: 400 },
      );
    }

    let note: string | undefined;
    if (body.triageNote !== undefined && body.triageNote !== null) {
      if (typeof body.triageNote !== 'string') {
        return NextResponse.json({ error: 'triageNote must be a string' }, { status: 400 });
      }
      note = body.triageNote.trim().slice(0, NOTE_MAX);
    }

    const now = new Date().toISOString();
    const triageUpdatedBy = {
      uid: auth.uid,
      email: auth.email ?? null,
    };

    const update: Record<string, unknown> = {
      triageStatus: body.triageStatus,
      triageUpdatedAt: now,
      triageUpdatedBy,
    };
    if (note !== undefined) {
      update.triageNote = note.length > 0 ? note : '';
    }

    const ids = body.ids as string[];
    const results = await Promise.allSettled(
      ids.map((id) => db.collection('errorEvents').doc(id).update(update)),
    );

    let updated = 0;
    const failed: { id: string; reason: string }[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        updated += 1;
      } else {
        const reason =
          r.reason instanceof Error ? r.reason.message : String(r.reason);
        failed.push({ id: ids[i]!, reason });
      }
    });

    return NextResponse.json({
      success: true,
      triageStatus: body.triageStatus,
      triageUpdatedAt: now,
      updated,
      failed,
    });
  } catch (err) {
    devLog.error('[admin/error-events/bulk] POST error:', err, 'route');
    return NextResponse.json({ error: 'Failed to bulk update events' }, { status: 500 });
  }
}
