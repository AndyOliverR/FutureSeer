import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendDailyInsightEmail } from '@/lib/notificationEmail';

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = process.env.CRON_SECRET;
  return !!secret && !!token && token === secret;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!adminDb) {
    console.error('Cron daily-insights: adminDb not available');
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  try {
    const snapshot = await adminDb.collection('users').get();

    for (const doc of snapshot.docs) {
      const profile = doc.data() as {
        email?: string;
        displayName?: string;
        notificationsEnabled?: boolean;
        notificationPreferences?: {
          dailyInsights?: boolean;
        };
      };

      const email = profile.email?.trim();
      if (!email) continue;
      if (profile.notificationsEnabled === false) continue;
      if (profile.notificationPreferences?.dailyInsights !== true) continue;

      const ok = await sendDailyInsightEmail(email, profile.displayName);
      if (ok) sent++;
      else failed++;
    }

    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error('Cron daily-insights error:', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
