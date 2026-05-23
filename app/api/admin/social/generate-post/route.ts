import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminApiAuth';
import { generateSocialPostCopy } from '@/lib/growth/generateSocialPostCopy';
import { getSocialPostTemplate } from '@/lib/growth/socialPostTemplates';

export const dynamic = 'force-dynamic';

const MAX_OPTIONAL_FIELD_CHARS = 800;

function trimOptional(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

/**
 * POST /api/admin/social/generate-post
 * Admin-only: generate social post copy from a template (no auto-publish).
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }

  const auth = await verifyAdminRequest(request, 'admin/social/generate-post');
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
  const templateId = typeof record?.templateId === 'string' ? record.templateId.trim() : '';
  if (!templateId || !getSocialPostTemplate(templateId)) {
    return NextResponse.json({ error: 'Invalid or missing templateId' }, { status: 400 });
  }

  const result = await generateSocialPostCopy(
    {
      templateId,
      capabilityBullet: trimOptional(record?.capabilityBullet, MAX_OPTIONAL_FIELD_CHARS),
      mythTopic: trimOptional(record?.mythTopic, MAX_OPTIONAL_FIELD_CHARS),
      customNote: trimOptional(record?.customNote, MAX_OPTIONAL_FIELD_CHARS),
    },
    auth.uid,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ success: true, copy: result.copy });
}
