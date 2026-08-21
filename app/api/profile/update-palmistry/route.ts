/**
 * POST /api/profile/update-palmistry
 *
 * Activation flow: when user uploads palm photo AFTER profile generation,
 * run palmistry analysis and merge into comprehensive profile.
 * Gate: images_uploaded && analysis_complete → status=ready
 *
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDocument, setDocument, isAdminAvailable } from '@/lib/firebase-admin';
import { getServerBaseUrl } from '@/lib/serverBaseUrl';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
import { palmistryImageAnalyzer } from '@/lib/palmistry/palmistryImageAnalyzer';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

    if (!isAdminAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const userDoc = await getDocument('users', uid);
    if (!userDoc || typeof userDoc !== 'object') {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const profile = userDoc as { palmPhotoUrl?: string; birthDate?: string; gender?: string };
    if (!profile.palmPhotoUrl) {
      return NextResponse.json(
        { error: 'No palm photo uploaded. Upload a palm image in your profile first.' },
        { status: 400 }
      );
    }

    const baseUrl = getServerBaseUrl();

    const res = await fetch(`${baseUrl}/api/tools/palmistry/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: profile.palmPhotoUrl,
        dominantHand: 'right',
        gender: profile.gender || 'other',
        age: profile.birthDate
          ? Math.floor(
              (Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            )
          : 30,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errBody.error || `Palm analysis failed: ${res.status}` },
        { status: res.status >= 500 ? 500 : 400 }
      );
    }

    const json = await res.json();
    const aiData = json.data ?? json;
    if (!aiData?.lines || !aiData?.mounts) {
      return NextResponse.json(
        { error: 'Incomplete palm analysis. Try a clearer image.' },
        { status: 400 }
      );
    }

    const dominantHand: 'left' | 'right' = 'right';
    const hand: 'left' | 'right' | 'both' =
      profile.gender === 'female' ? 'left' : profile.gender === 'male' ? 'right' : 'both';
    const age = profile.birthDate
      ? Math.floor(
          (Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        )
      : 30;
    const gender: 'other' | 'male' | 'female' = (profile.gender === 'non-binary' ? 'other' : (profile.gender === 'male' || profile.gender === 'female' ? profile.gender : 'other'));

    const analysis = palmistryImageAnalyzer.formatPalmistryData(aiData, hand, dominantHand, age, gender);

    // Merge only the palmistry key. Do not spread a previously read profile doc —
    // setDocument already merges, and a stale full-document write can clobber
    // concurrent Stage B tool patches under the same comprehensive profile.
    await setDocument('comprehensiveMysticalProfiles', uid, {
      palmistry: {
        palmistryContext: analysis,
        analysis,
      },
    });

    clearCachedDivinationData(uid);

    return NextResponse.json({
      success: true,
      message: 'Palmistry analysis updated. Ask the Seer can now use palmistry for your questions.',
    });
  } catch (err) {
    devLog.error('Update palmistry API error', err, 'update-palmistry');
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to update palmistry',
      },
      { status: 500 }
    );
  }
}
