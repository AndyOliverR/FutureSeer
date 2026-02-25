/**
 * POST /api/profile/generate-mystical
 *
 * ONE-TIME, ATOMIC profile generation.
 * 1. Lock profile generation
 * 2. Run ALL tools (no exceptions)
 * 3. Store each tool's output separately
 * 4. Build Master Seer Database
 * 5. Unlock chat
 *
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDocument, setDocument, batchSetDocuments, isAdminAvailable } from '@/lib/firebase-admin';
import { generateAllReports } from '@/lib/reportGenerationService';
import { ALL_TOOL_SLUGS } from '@/lib/profileGenerationOrchestrator';
import type { UserProfile } from '@/lib/firebase';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
import { calculateProfileDataHash } from '@/lib/firebase';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for all tools

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Fetch user profile
    const userDoc = await getDocument('users', uid);
    if (!userDoc) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userProfile = userDoc as Record<string, unknown>;
    const birthDate = (userProfile.birthDate ?? userProfile.birth_date) as string | undefined;
    const birthPlace = (userProfile.birthPlace ?? userProfile.birth_place) as string | undefined;
    if (!birthDate || !String(birthDate).trim() || !birthPlace || !String(birthPlace).trim()) {
      return NextResponse.json(
        { error: 'Please complete your profile (birth date and place required)' },
        { status: 400 }
      );
    }

    // Idempotent guard: already generated with same data — do not re-run tools
    // Unless stored comprehensive profile is missing any tool report (e.g. new tool added after first run)
    const hashMatches =
      userProfile.mysticalProfileGenerated === true &&
      userProfile.profileDataHash != null &&
      userProfile.profileDataHash !== '' &&
      userProfile.profileDataHash === calculateProfileDataHash(userProfile);

    if (hashMatches) {
      const stored = await getDocument('comprehensiveMysticalProfiles', uid);
      const storedProfile = (stored || {}) as Record<string, unknown>;
      const missingSlugs = ALL_TOOL_SLUGS.filter((slug) => {
        const value = storedProfile[slug];
        // Consider missing if key absent or placeholder (no real report)
        if (value == null) return true;
        if (typeof value === 'object' && (value as { placeholder?: boolean }).placeholder === true) return true;
        return false;
      });
      if (missingSlugs.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Profile already generated.',
          alreadyGenerated: true,
        });
      }
      devLog.info(
        `[generate-mystical] Re-running pipeline to backfill missing tools: ${missingSlugs.join(', ')}`,
        'generate-mystical'
      );
    }

    // Ensure profile has uid and camelCase birth fields for orchestrator
    const profileWithUid = {
      ...userProfile,
      uid,
      birthDate: birthDate ?? userProfile.birthDate,
      birthPlace: birthPlace ?? userProfile.birthPlace,
    };

    // Full-only regeneration: no partial runs. Edited-profile flow requires full pipeline only.
    const result = await generateAllReports(uid, profileWithUid as UserProfile);

    if (!result.success && result.systemsUsed.length === 0) {
      return NextResponse.json(
        { error: 'Profile generation failed. Vedic chart could not be generated.' },
        { status: 500 }
      );
    }

    // Store comprehensive profile
    if (!isAdminAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const cleanData = (obj: any): any => {
      if (obj === null || obj === undefined) return null;
      if (typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(cleanData);
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = cleanData(value);
        }
      }
      return cleaned;
    };

    const toStore = cleanData(result.comprehensiveProfile);
    // Omit duplicate toolReports so we stay under Firestore 1 MiB limit; each tool is already at top-level (vedic, western, scrying, etc.)
    delete (toStore as Record<string, unknown>).toolReports;

    // Preserve existing real tool reports when this run produced a placeholder (e.g. BaZi API failed on re-run)
    const storedBeforeWrite = await getDocument('comprehensiveMysticalProfiles', uid);
    const storedProfile = (storedBeforeWrite || {}) as Record<string, unknown>;
    for (const slug of ALL_TOOL_SLUGS) {
      const newVal = (toStore as Record<string, unknown>)[slug];
      const existingVal = storedProfile[slug];
      const newIsPlaceholder =
        newVal != null &&
        typeof newVal === 'object' &&
        (newVal as { placeholder?: boolean }).placeholder === true;
      const existingIsRealReport =
        existingVal != null &&
        typeof existingVal === 'object' &&
        (existingVal as { placeholder?: boolean }).placeholder !== true;
      if (newIsPlaceholder && existingIsRealReport) {
        (toStore as Record<string, unknown>)[slug] = existingVal;
        devLog.info(`[generate-mystical] Preserved existing real report for tool: ${slug}`, 'generate-mystical');
      }
    }

    const newHash = calculateProfileDataHash(userProfile);
    const batchSuccess = await batchSetDocuments([
      { collection: 'comprehensiveMysticalProfiles', docId: uid, data: toStore },
      {
        collection: 'users',
        docId: uid,
        data: {
          mysticalProfileGenerated: true,
          mysticalProfileGeneratedAt: Date.now(),
          profileDataHash: newHash,
          profileStatus: 'completed',
          updatedAt: Date.now(),
        },
      },
      {
        collection: 'seerMaster',
        docId: uid,
        data: {
          ...result.seerMaster,
          userId: uid,
          generatedAt: new Date().toISOString(),
          systemsUsed: result.systemsUsed,
        },
      },
    ]);

    if (!batchSuccess) {
      return NextResponse.json({ error: 'Failed to save profile data. Please try again.' }, { status: 500 });
    }

    // Invalidate divination cache
    clearCachedDivinationData(uid);

    return NextResponse.json({
      success: true,
      systemsUsed: result.systemsUsed,
      failedTools: result.failedTools,
      message: 'Mystical profile generated successfully. All tools have run.',
      comprehensiveProfile: toStore,
    });
  } catch (err) {
    devLog.error('Profile generate-mystical API error', err, 'generate-mystical');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate mystical profile' },
      { status: 500 }
    );
  }
}
