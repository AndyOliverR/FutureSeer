import { NextRequest, NextResponse } from 'next/server';
import { getAuth, adminDb, getDocument, setDocument } from '@/lib/firebase-admin';
import { isAdminDecoded } from '@/lib/adminConfig';
import { ALL_TOOL_SLUGS, summarizeToolReadiness } from '@/lib/profileGenerationOrchestrator';
import type { UserProfile } from '@/lib/firebase';
import { calculateProfileDataHash } from '@/lib/firebase';
import { tryResumeMysticalStageB } from '@/lib/mysticalStageB';
import { buildInitialToolQueue } from '@/lib/mysticalStageBQueuePure';
import { FieldPath } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return false;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return isAdminDecoded(decoded);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Admin DB unavailable' }, { status: 500 });
  }
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const dryRun = body?.dryRun === true;
  const limitRaw = Number(body?.limit ?? 25);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, Math.floor(limitRaw))) : 25;
  const cursor = typeof body?.cursor === 'string' && body.cursor.trim().length > 0 ? body.cursor.trim() : null;
  const runId = typeof body?.runId === 'string' && body.runId.trim().length > 0 ? body.runId.trim() : `backfill-${Date.now()}`;

  let userQuery = adminDb
    .collection('users')
    .where('mysticalProfileGenerated', '==', true)
    .orderBy(FieldPath.documentId())
    .limit(limit);
  if (cursor) {
    userQuery = userQuery.startAfter(cursor);
  }
  const userSnap = await userQuery.get();

  let scanned = 0;
  let healedFlags = 0;
  let queuedOrResumed = 0;
  const affectedUsers: string[] = [];
  let lastProcessedUid: string | null = null;

  for (const userDoc of userSnap.docs) {
    scanned += 1;
    const uid = userDoc.id;
    lastProcessedUid = uid;
    const user = (userDoc.data() || {}) as Record<string, unknown>;
    const profileDoc = (await getDocument('comprehensiveMysticalProfiles', uid)) as Record<string, unknown> | null;
    const profile = profileDoc ?? {};
    const readiness = summarizeToolReadiness(profile, ALL_TOOL_SLUGS);
    const allReportsReady = readiness.allReportsReady;
    const pendingToolSlugs = readiness.pendingToolSlugs;
    const userAllReportsReady = Boolean(user.allReportsReady);
    const userPending = Array.isArray(user.pendingToolSlugs) ? (user.pendingToolSlugs as unknown[]) : [];
    const userPendingNormalized = userPending.filter((s): s is string => typeof s === 'string').sort();
    const pendingNormalized = [...pendingToolSlugs].sort();
    const pendingMismatch =
      userPendingNormalized.length !== pendingNormalized.length ||
      userPendingNormalized.some((slug, idx) => slug !== pendingNormalized[idx]);
    const needsFlagHeal = userAllReportsReady !== allReportsReady || pendingMismatch;

    if (needsFlagHeal) {
      affectedUsers.push(uid);
      healedFlags += 1;
      if (!dryRun) {
        await setDocument('users', uid, {
          allReportsReady,
          pendingToolSlugs,
          profileStatus: allReportsReady ? 'completed' : 'partial_ready',
          updatedAt: Date.now(),
        });
      }
    }

    if (allReportsReady) continue;
    const hasRequiredProfile =
      typeof user.birthDate === 'string' &&
      user.birthDate.trim().length > 0 &&
      typeof user.birthPlace === 'string' &&
      user.birthPlace.trim().length > 0;
    if (!hasRequiredProfile) continue;

    const generationJob = (await getDocument('generationJobs', uid)) as Record<string, unknown> | null;
    const generationJobStatus = typeof generationJob?.status === 'string' ? generationJob.status : '';
    if (generationJobStatus === 'running') continue;

    queuedOrResumed += 1;
    affectedUsers.push(uid);
    if (dryRun) continue;

    const profileWithUid: UserProfile = {
      ...(user as Partial<UserProfile>),
      uid,
      birthDate: String(user.birthDate ?? ''),
      birthPlace: String(user.birthPlace ?? ''),
      birthTime: String(user.birthTime ?? '12:00:00'),
      displayName: String(user.displayName ?? ''),
      email: String(user.email ?? ''),
      isSubscribed: Boolean(user.isSubscribed),
      isTipped: Boolean(user.isTipped),
      createdAt: Number(user.createdAt ?? Date.now()),
      lastLoginAt: Number(user.lastLoginAt ?? Date.now()),
    };
    const profileHash = calculateProfileDataHash(profileWithUid);
    const now = Date.now();
    const existingComprehensive = ((await getDocument('comprehensiveMysticalProfiles', uid)) ||
      {}) as Record<string, unknown>;
    // Rebuild toolTasks so same-hash backfills can recover terminal-failed tools.
    const rebuiltToolTasks = buildInitialToolQueue(existingComprehensive, profileHash, now);
    await setDocument('generationJobs', uid, {
      uid,
      status: 'queued',
      phase: 'stageB',
      queuedAt: now,
      updatedAt: now,
      attempts: 0,
      maxAttempts: Number(generationJob?.maxAttempts ?? 3),
      nextRetryAt: null,
      runId,
      profileHash,
      profileSnapshot: profileWithUid,
      toolTasks: rebuiltToolTasks,
      queueDrained: false,
    });
    void tryResumeMysticalStageB(uid);
  }

  return NextResponse.json({
    success: true,
    dryRun,
    scanned,
    healedFlags,
    queuedOrResumed,
    runId,
    nextCursor: userSnap.size === limit ? lastProcessedUid : null,
    affectedUsers: [...new Set(affectedUsers)],
  });
}
