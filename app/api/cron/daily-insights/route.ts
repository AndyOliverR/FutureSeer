import { NextRequest, NextResponse } from 'next/server';
import { FieldPath } from 'firebase-admin/firestore';
import { devLog } from '@/lib/devLogger';
import { adminDb, getDocument } from '@/lib/firebase-admin';
import { sendDailyInsightEmail } from '@/lib/notificationEmail';
import {
  buildDailyInsightForEmail,
  parseDailyInsightsBatchSize,
  resolveRetentionNudgeStage,
  shouldSendDailyInsightToday,
  todayInsightDateKey,
  userWantsDailyInsightEmail,
} from '@/lib/cronDailyInsights';

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = process.env.CRON_SECRET;
  return !!secret && !!token && token === secret;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return new NextResponse(JSON.stringify({ error: 'Not available in static export' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!adminDb) {
    devLog.error('Cron daily-insights: adminDb not available', undefined, 'route');
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  const batchSize = parseDailyInsightsBatchSize(process.env.DAILY_INSIGHTS_BATCH_SIZE);
  const cursor = request.nextUrl.searchParams.get('cursor')?.trim() || null;
  const dateKey = todayInsightDateKey();
  const now = Date.now();

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let lastDocId: string | null = null;

  try {
    let query = adminDb.collection('users').orderBy(FieldPath.documentId()).limit(batchSize);
    if (cursor) {
      const cursorSnap = await adminDb.collection('users').doc(cursor).get();
      if (cursorSnap.exists) {
        query = query.startAfter(cursorSnap);
      }
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return NextResponse.json({ sent, failed, skipped, nextCursor: null, hasMore: false, dateKey });
    }

    for (const doc of snapshot.docs) {
      lastDocId = doc.id;
      const profile = doc.data() as {
        email?: string;
        displayName?: string;
        lastActiveAt?: number;
        trialEndsAt?: number;
        notificationsEnabled?: boolean;
        notificationPreferences?: { dailyInsights?: boolean };
        mysticalProfileGenerated?: boolean;
        dailyInsightEmailSentAt?: string;
      };

      if (!userWantsDailyInsightEmail(profile)) {
        skipped++;
        continue;
      }
      if (!shouldSendDailyInsightToday(profile, dateKey)) {
        skipped++;
        continue;
      }

      const email = profile.email!.trim();
      const { nudgeStage, trialDaysLeft } = resolveRetentionNudgeStage(profile, now);

      let insight;
      if (profile.mysticalProfileGenerated) {
        try {
          const comprehensive = await getDocument('comprehensiveMysticalProfiles', doc.id);
          insight = buildDailyInsightForEmail(comprehensive, profile.displayName);
        } catch (e) {
          devLog.warn('[cron daily-insights] profile fetch failed', { uid: doc.id, e }, 'route');
          insight = buildDailyInsightForEmail(null, profile.displayName);
        }
      } else {
        insight = buildDailyInsightForEmail(null, profile.displayName);
      }

      const ok = await sendDailyInsightEmail(email, profile.displayName, {
        nudgeStage,
        trialDaysLeft,
        insight,
      });

      if (ok) {
        sent++;
        try {
          await adminDb.collection('users').doc(doc.id).set(
            { dailyInsightEmailSentAt: dateKey, updatedAt: now },
            { merge: true },
          );
        } catch (e) {
          devLog.warn('[cron daily-insights] sentAt write failed', { uid: doc.id, e }, 'route');
        }
      } else {
        failed++;
      }
    }

    const hasMore = snapshot.size >= batchSize;
    return NextResponse.json({
      sent,
      failed,
      skipped,
      nextCursor: hasMore ? lastDocId : null,
      hasMore,
      dateKey,
      batchSize,
    });
  } catch (err) {
    devLog.error('Cron daily-insights error:', err, 'route');
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
