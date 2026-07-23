import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import type { Query } from 'firebase-admin/firestore';
import { getLevelFromKarma, getReputation, calculateBadges } from '@/lib/firestore/communityHelpers';

export const dynamic = 'force-static'

/** Firestore document shape for communityMembers (data() return type) */
interface CommunityMemberDoc {
  userId?: string;
  email?: string;
  name?: string;
  joinDate?: { toDate?: () => Date } | Date | string | number;
  lastActive?: { toDate?: () => Date } | Date | string | number;
  karma?: number;
  contributions?: number;
  streak?: number;
  badges?: string[];
  interests?: unknown[];
  flair?: string;
}

function toDateSafe(value: CommunityMemberDoc['joinDate']): Date {
  if (value == null) return new Date();
  if (typeof value === 'object' && value !== null && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number);
}

/** Emails for which Karma/Level/Streak are hidden (env only — no hardcoded PII). */
function getHideStatsEmails(): Set<string> {
  const raw =
    process.env.COMMUNITY_HIDE_STATS_EMAILS ||
    process.env.NO_CHARGE_SUBSCRIPTION_EMAILS ||
    process.env.ADMIN_EMAILS ||
    '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

// GET - Fetch member list with stats
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'karma'; // karma, lastActive, contributions
    const limit = parseInt(searchParams.get('limit') || '20');
    const lastDocId = searchParams.get('lastDocId');

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      let query: Query = db.collection('communityMembers');

      // Apply sorting
      if (sortBy === 'lastActive') {
        query = query.orderBy('lastActive', 'desc');
      } else if (sortBy === 'contributions') {
        query = query.orderBy('contributions', 'desc');
      } else {
        query = query.orderBy('karma', 'desc');
      }

      // Apply pagination
      if (lastDocId) {
        const lastDoc = await db.collection('communityMembers').doc(lastDocId).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      query = query.limit(limit);

      const snapshot = await query.get();
      const founderUid = process.env.FOUNDER_UID?.trim();
      const founderEmail = process.env.FOUNDER_EMAIL?.trim()?.toLowerCase();
      const members = snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => {
        const data = doc.data() as CommunityMemberDoc;
        const userId = (data.userId as string) || doc.id;
        const memberEmail = String(data.email ?? '').trim().toLowerCase();
        const karma = Number(data.karma) || 0;
        const contributions = Number(data.contributions) || 0;
        const streak = Number(data.streak) || 0;
        const joinDate = toDateSafe(data.joinDate);
        const isFounderByUid = founderUid && (userId === founderUid || doc.id === founderUid);
        const isFounderByEmail = founderEmail && memberEmail && memberEmail === founderEmail;
        const isFounder = isFounderByUid || isFounderByEmail;
        const hideStats = getHideStatsEmails().has(memberEmail);

        if (isFounder) {
          const existingBadges = Array.isArray(data.badges) ? data.badges : [];
          const badges = existingBadges.includes('Creator') ? existingBadges : [...existingBadges, 'Creator'];
          return {
            id: doc.id,
            userId,
            name: data.name || 'Anonymous',
            karma: 10000,
            level: 'Grandmaster' as const,
            contributions,
            streak: 365,
            joinDate: joinDate.toISOString(),
            lastActive: (data.lastActive != null && typeof (data.lastActive as { toDate?: () => Date }).toDate === 'function'
              ? (data.lastActive as { toDate: () => Date }).toDate().toISOString()
              : data.lastActive != null ? new Date(data.lastActive as string | number).toISOString() : new Date().toISOString()),
            interests: data.interests || [],
            badges,
            reputation: 'Mystical' as const,
            flair: 'Founder',
            isOnline: false,
            hideStats,
          };
        }

        return {
          id: doc.id,
          userId,
          name: (data.name as string) || 'Anonymous',
          karma,
          level: getLevelFromKarma(karma),
          contributions,
          streak,
          joinDate: joinDate.toISOString(),
          lastActive: (data.lastActive != null && typeof (data.lastActive as { toDate?: () => Date }).toDate === 'function'
            ? (data.lastActive as { toDate: () => Date }).toDate().toISOString()
            : data.lastActive != null ? new Date(data.lastActive as string | number).toISOString() : new Date().toISOString()),
          interests: (data.interests as unknown[]) || [],
          badges: (data.badges as string[]) || [],
          reputation: getReputation(karma, contributions, streak),
          flair: (data.flair as string) || '',
          isOnline: false, // TODO: Implement real-time online status
          hideStats,
        };
      });

      // Ensure founder is always in the list when they exist in Firestore (e.g. not in top 50 by karma)
      if (founderUid) {
        const founderInList = members.some((m: { userId: string; id: string }) => m.userId === founderUid || m.id === founderUid);
        if (!founderInList) {
          const founderDoc = await db.collection('communityMembers').doc(founderUid).get();
          if (founderDoc.exists) {
            const data = founderDoc.data() as CommunityMemberDoc;
            const founderEmailFromDoc = String(data.email ?? '').trim().toLowerCase();
            const hideStats = getHideStatsEmails().has(founderEmailFromDoc);
            const joinDate = toDateSafe(data.joinDate);
            const existingBadges = Array.isArray(data.badges) ? data.badges : [];
            const badges = existingBadges.includes('Creator') ? existingBadges : [...existingBadges, 'Creator'];
            const founderMember = {
              id: founderDoc.id,
              userId: (data.userId as string) || founderDoc.id,
              name: (data.name as string) || 'Anonymous',
              karma: 10000,
              level: 'Grandmaster' as const,
              contributions: Number(data.contributions) || 0,
              streak: 365,
              joinDate: joinDate.toISOString(),
              lastActive: (data.lastActive != null && typeof (data.lastActive as { toDate?: () => Date }).toDate === 'function'
                ? (data.lastActive as { toDate: () => Date }).toDate().toISOString()
                : data.lastActive != null ? new Date(data.lastActive as string | number).toISOString() : new Date().toISOString()),
              interests: (data.interests as unknown[]) || [],
              badges,
              reputation: 'Mystical' as const,
              flair: 'Founder',
              isOnline: false,
              hideStats,
            };
            members.unshift(founderMember);
          }
        }
      }

      return NextResponse.json({
        success: true,
        members,
        hasMore: snapshot.docs.length === limit,
        lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error fetching members:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to fetch members' }, { status: 500 });
  }
}

