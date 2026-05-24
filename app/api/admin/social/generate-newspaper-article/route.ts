import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminApiAuth';
import { generateNewspaperArticleCopy } from '@/lib/growth/generateNewspaperArticleCopy';
import { getNewspaperOutlet } from '@/lib/growth/newspaperOutlets';

export const dynamic = 'force-dynamic';

const MAX_OPTIONAL_FIELD_CHARS = 1200;

function trimOptional(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

/**
 * POST /api/admin/social/generate-newspaper-article
 * Admin-only: generate newspaper/outreach article copy (manual submission).
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  const auth = await verifyAdminRequest(request, 'admin/social/generate-newspaper-article');
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  const outletId = typeof record?.outletId === 'string' ? record.outletId.trim() : '';
  if (!outletId || !getNewspaperOutlet(outletId)) {
    return NextResponse.json({ error: 'Invalid or missing outletId' }, { status: 400 });
  }

  const result = await generateNewspaperArticleCopy(
    {
      outletId,
      topicAngle: trimOptional(record?.topicAngle, MAX_OPTIONAL_FIELD_CHARS),
      locationHook: trimOptional(record?.locationHook, MAX_OPTIONAL_FIELD_CHARS),
      customNote: trimOptional(record?.customNote, MAX_OPTIONAL_FIELD_CHARS),
    },
    auth.uid,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const outlet = getNewspaperOutlet(outletId)!;
  return NextResponse.json({
    success: true,
    copy: result.copy,
    outlet: {
      id: outlet.id,
      label: outlet.label,
      submissionUrl: outlet.submissionUrl,
      submissionLabel: outlet.submissionLabel,
      submissionNotes: outlet.submissionNotes,
    },
  });
}
