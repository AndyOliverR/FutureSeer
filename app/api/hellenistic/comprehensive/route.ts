import { NextRequest, NextResponse } from 'next/server';
import { getIntelligentHellenisticAstrologyData } from '@/lib/hellenisticAstrologyIntelligence';
import { devLog } from '@/lib/devLogger';
import { normalizeBirthTime } from '@/lib/birthTimeUtils';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { decideUserScopedAccess } from '@/lib/security/userScopedAccess';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface HellenisticComprehensiveRequest {
  userId: string;
  userProfile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    birthLatitude?: number;
    birthLongitude?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HellenisticComprehensiveRequest;
    const { userId, userProfile } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const auth = await verifyUserRequest(request, 'hellenistic-comprehensive');
    const access = decideUserScopedAccess(userId, auth);
    let useCache = false;
    switch (access.kind) {
      case 'unauthorized':
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      case 'forbidden':
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      case 'owned':
        useCache = true;
        break;
      case 'stateless':
        useCache = false;
        break;
      default: {
        const _exhaustive: never = access;
        return NextResponse.json(
          { success: false, error: `Unhandled access: ${String(_exhaustive)}` },
          { status: 403 },
        );
      }
    }

    const birthDate = userProfile?.birthDate ?? '';
    const birthTime = normalizeBirthTime(userProfile?.birthTime ?? '12:00:00');
    const birthPlace = userProfile?.birthPlace ?? '';
    const lat = Number(userProfile?.birthLatitude);
    const lon = Number(userProfile?.birthLongitude);
    const latitude = Number.isFinite(lat) ? lat : 0;
    const longitude = Number.isFinite(lon) ? lon : 0;

    if (!birthDate || !birthPlace) {
      return NextResponse.json(
        { success: false, error: 'Birth date and place are required' },
        { status: 400 }
      );
    }

    devLog.debug('Hellenistic comprehensive: generating reading for user', userId);

    const reading = await getIntelligentHellenisticAstrologyData(
      userId,
      birthDate,
      birthTime,
      birthPlace,
      latitude,
      longitude,
      { useCache }
    );

    // Ensure response is JSON-serializable (e.g. Date -> string)
    const data = JSON.parse(JSON.stringify(reading));
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Hellenistic reading failed';
    const stack = err instanceof Error ? err.stack : undefined;
    if (process.env.NODE_ENV === 'development' && stack) {
      console.error('[hellenistic/comprehensive]', msg, stack);
    }
    devLog.warn('Hellenistic comprehensive API error:', msg, 'hellenistic-comprehensive');
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
