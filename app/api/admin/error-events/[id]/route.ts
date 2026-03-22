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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  try {
    const auth = await verifyAdminRequest(request, 'admin/error-events/[id]');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      triageStatus?: unknown;
      triageNote?: unknown;
    };

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

    const ref = adminDb.collection('errorEvents').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const update: Record<string, unknown> = {
      triageStatus: body.triageStatus,
      triageUpdatedAt: now,
      triageUpdatedBy: {
        uid: auth.uid,
        email: auth.email ?? null,
      },
    };
    if (note !== undefined) {
      update.triageNote = note.length > 0 ? note : '';
    }

    await ref.update(update);

    return NextResponse.json({
      success: true,
      id,
      triageStatus: body.triageStatus,
      triageNote: note !== undefined ? note : undefined,
      triageUpdatedAt: now,
      triageUpdatedBy: update.triageUpdatedBy,
    });
  } catch (err) {
    devLog.error('[admin/error-events/[id]] PATCH error:', err, 'route');
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
