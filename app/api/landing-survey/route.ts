import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getClientIdentifier, rateLimiters } from '@/lib/rateLimit';
import { checkRateLimitWithOptionalFirestore } from '@/lib/rateLimitFirestore';
import {
  parseLandingSurveyTopic,
  parseRating,
  sanitizeSurveyText,
  type LandingSurveyKind,
  type PublicLandingTestimonial,
} from '@/lib/landingSurveyTypes';

export const dynamic = 'force-dynamic';

const COLLECTION = 'landingTestimonials';

function docToPublic(id: string, data: FirebaseFirestore.DocumentData): PublicLandingTestimonial | null {
  if (data.status !== 'approved' || !data.sharePublicly || data.kind !== 'testimonial') return null;
  const content = typeof data.experienceText === 'string' ? data.experienceText.trim() : '';
  if (!content) return null;
  const rating = typeof data.rating === 'number' ? data.rating : 5;
  return {
    id,
    rating: Math.min(5, Math.max(1, rating)),
    content,
    displayName:
      typeof data.displayName === 'string' && data.displayName.trim()
        ? data.displayName.trim()
        : 'FutureSeer user',
    roleLabel: typeof data.roleLabel === 'string' ? data.roleLabel.trim() : '',
    topic: parseLandingSurveyTopic(data.topic),
    approvedAt: data.approvedAt?.toMillis?.() ?? null,
  };
}

/** GET — approved public testimonials for the landing page. */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ testimonials: [] });
  }
  if (!adminDb) {
    return NextResponse.json({ testimonials: [] });
  }

  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '9', 10), 12);

  try {
    const snapshot = await adminDb
      .collection(COLLECTION)
      .where('status', '==', 'approved')
      .where('sharePublicly', '==', true)
      .where('kind', '==', 'testimonial')
      .orderBy('approvedAt', 'desc')
      .limit(limit)
      .get();

    const testimonials = snapshot.docs
      .map((doc) => docToPublic(doc.id, doc.data()))
      .filter((t): t is PublicLandingTestimonial => Boolean(t));

    return NextResponse.json({ success: true, testimonials });
  } catch {
    const fallback = await adminDb
      .collection(COLLECTION)
      .where('status', '==', 'approved')
      .limit(limit)
      .get();
    const testimonials = fallback.docs
      .map((doc) => docToPublic(doc.id, doc.data()))
      .filter((t): t is PublicLandingTestimonial => Boolean(t));
    return NextResponse.json({ success: true, testimonials });
  }
}

/** POST — landing survey / testimonial submission. */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 });
  }
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const identifier = getClientIdentifier(request);
  const rate = await checkRateLimitWithOptionalFirestore(
    rateLimiters.api,
    'landing_survey_post',
    identifier,
  );
  if (!rate.allowed) {
    return NextResponse.json({ error: rateLimiters.api.getErrorMessage() }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  const hasUsedProduct = record?.hasUsedProduct === true;
  const kind: LandingSurveyKind = hasUsedProduct ? 'testimonial' : 'hope';
  const experienceText = sanitizeSurveyText(record?.experienceText, 1200);
  const rating = parseRating(record?.rating);
  const topic = parseLandingSurveyTopic(record?.topic);
  const displayName = sanitizeSurveyText(record?.displayName, 80);
  const roleLabel = sanitizeSurveyText(record?.roleLabel, 80);
  const sharePublicly = record?.sharePublicly === true;

  if (experienceText.length < 12) {
    return NextResponse.json({ error: 'Please share at least a sentence or two.' }, { status: 400 });
  }

  if (hasUsedProduct && rating == null) {
    return NextResponse.json({ error: 'Please choose a star rating.' }, { status: 400 });
  }

  if (sharePublicly && !hasUsedProduct) {
    return NextResponse.json(
      { error: 'Public homepage quotes are only for people who have tried FutureSeer.' },
      { status: 400 },
    );
  }

  try {
    const ref = await adminDb.collection(COLLECTION).add({
      kind,
      rating,
      experienceText,
      topic,
      displayName,
      roleLabel,
      sharePublicly: kind === 'testimonial' && sharePublicly,
      status: 'pending',
      submittedAt: FieldValue.serverTimestamp(),
      userId: typeof record?.userId === 'string' ? record.userId : null,
      source: 'landing_survey',
    });

    return NextResponse.json({
      success: true,
      id: ref.id,
      message:
        kind === 'testimonial' && sharePublicly
          ? 'Thank you! We review homepage quotes before publishing—usually within a few days.'
          : 'Thank you! We read every reply.',
    });
  } catch {
    return NextResponse.json({ error: 'Could not save your response. Try again shortly.' }, { status: 500 });
  }
}
