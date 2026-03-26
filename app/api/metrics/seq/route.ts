import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { devLog } from '@/lib/devLogger';

const CONTEXT_PROFILE_GEN = 'profile_generation_after';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const score = Number(body?.score);
    const context = typeof body?.context === 'string' ? body.context : CONTEXT_PROFILE_GEN;
    const userId = typeof body?.userId === 'string' ? body.userId : null;

    if (!Number.isInteger(score) || score < 1 || score > 7) {
      return NextResponse.json({ error: 'score must be an integer from 1 to 7' }, { status: 400 });
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const doc = {
      score,
      context,
      userId,
      url: typeof body?.url === 'string' ? body.url : '',
      userAgent: typeof body?.userAgent === 'string' ? body.userAgent : '',
      submittedAt: new Date(),
    };

    await db.collection('seqSubmissions').add(doc);
    devLog.info('SEQ submission recorded', { score, context, hasUserId: !!userId }, 'metrics');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    devLog.error('SEQ API error', e, 'metrics');
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}
