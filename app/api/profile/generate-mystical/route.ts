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
import { getDocument, setDocument, isAdminAvailable } from '@/lib/firebase-admin';
import { generateAllReports } from '@/lib/reportGenerationService';
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

    const userProfile = userDoc as any;
    if (!userProfile.birthDate || !userProfile.birthPlace) {
      return NextResponse.json(
        { error: 'Please complete your profile (birth date and place required)' },
        { status: 400 }
      );
    }

    // Idempotent guard: already generated with same data — do not re-run tools
    if (
      userProfile.mysticalProfileGenerated === true &&
      userProfile.profileDataHash != null &&
      userProfile.profileDataHash !== '' &&
      userProfile.profileDataHash === calculateProfileDataHash(userProfile)
    ) {
      return NextResponse.json({
        success: true,
        message: 'Profile already generated.',
        alreadyGenerated: true,
      });
    }

    // Ensure profile has uid for orchestrator
    const profileWithUid = { ...userProfile, uid };

    // Full-only regeneration: no partial runs. Edited-profile flow requires full pipeline only.
    const result = await generateAllReports(uid, profileWithUid);

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

    await setDocument('comprehensiveMysticalProfiles', uid, toStore);

    // Mark profile as generated
    const newHash = calculateProfileDataHash(userProfile);
    await setDocument('users', uid, {
      mysticalProfileGenerated: true,
      mysticalProfileGeneratedAt: Date.now(),
      profileDataHash: newHash,
      profileStatus: 'completed',
      updatedAt: Date.now(),
    });

    // Store seer_master for Main Ask the Seer
    await setDocument('seerMaster', uid, {
      ...result.seerMaster,
      userId: uid,
      generatedAt: new Date().toISOString(),
      systemsUsed: result.systemsUsed,
    });

    // Invalidate divination cache
    clearCachedDivinationData(uid);

    return NextResponse.json({
      success: true,
      systemsUsed: result.systemsUsed,
      failedTools: result.failedTools,
      message: 'Mystical profile generated successfully. All tools have run.',
    });
  } catch (err) {
    devLog.error('Profile generate-mystical API error', err, 'generate-mystical');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate mystical profile' },
      { status: 500 }
    );
  }
}
