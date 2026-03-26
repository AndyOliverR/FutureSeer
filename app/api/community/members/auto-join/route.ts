import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import { getLevelFromKarma, getReputation, calculateBadges } from '@/lib/firestore/communityHelpers';

// POST - Auto-create/update community member profile when user signs in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, email, photoURL, joinDate } = body;

    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName' },
        { status: 400 }
      );
    }

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const memberRef = db.collection('communityMembers').doc(userId);
      const memberDoc = await memberRef.get();

      const now = new Date();
      const userJoinDate = joinDate ? new Date(joinDate) : now;

      const founderUid = process.env.FOUNDER_UID?.trim();
      const founderEmail = process.env.FOUNDER_EMAIL?.trim()?.toLowerCase();
      const userEmailNorm = (email || '').trim().toLowerCase();
      const isFounder = (founderUid && founderUid === userId) || (founderEmail && userEmailNorm && userEmailNorm === founderEmail);

      if (memberDoc.exists) {
        // Update existing member profile
        const memberData = memberDoc.data();
        let karma = memberData!.karma || 0;
        const contributions = memberData!.contributions || 0;
        let streak = memberData!.streak || 0;
        const existingJoinDate = memberData!.joinDate?.toDate?.() || new Date(memberData!.joinDate || userJoinDate);

        // Update profile info; do not overwrite karma/streak/flair for founder
        const updatePayload: Record<string, unknown> = {
          name: userName,
          email: email || null,
          photoURL: photoURL || null,
          lastActive: now,
          joinDate: existingJoinDate < userJoinDate ? existingJoinDate : userJoinDate,
        };
        if (isFounder && karma === 0 && streak === 0) {
          updatePayload.karma = 10000;
          updatePayload.streak = 365;
          updatePayload.flair = 'Founder';
          updatePayload.badges = [...(Array.isArray(memberData!.badges) ? memberData!.badges : []), 'Creator'].filter((b, i, a) => a.indexOf(b) === i);
          karma = 10000;
          streak = 365;
        }
        await memberRef.update(updatePayload);

        return NextResponse.json({
          success: true,
          message: 'Community member profile updated',
          member: {
            id: memberDoc.id,
            userId,
            name: userName,
            karma: isFounder ? 10000 : karma,
            level: isFounder ? 'Grandmaster' : getLevelFromKarma(karma),
            contributions,
            streak: isFounder ? 365 : streak,
          },
        });
      } else {
        // Create new community member profile
        const newMemberData = isFounder
          ? {
              userId,
              name: userName,
              email: email || null,
              photoURL: photoURL || null,
              karma: 10000,
              contributions: 0,
              streak: 365,
              joinDate: userJoinDate,
              lastActive: now,
              badges: ['Creator'],
              reputation: 'Mystical',
              interests: [],
              flair: 'Founder',
            }
          : {
              userId,
              name: userName,
              email: email || null,
              photoURL: photoURL || null,
              karma: 0,
              contributions: 0,
              streak: 0,
              joinDate: userJoinDate,
              lastActive: now,
              badges: [],
              reputation: 'Respected',
              interests: [],
              flair: '',
            };

        await memberRef.set(newMemberData);

        // Update community stats - increment total members
        await updateCommunityStats(db, { members: 1 });

        return NextResponse.json({
          success: true,
          message: 'Community member profile created',
          member: {
            id: memberRef.id,
            ...newMemberData,
            level: isFounder ? 'Grandmaster' : 'Novice',
            joinDate: userJoinDate.toISOString(),
            lastActive: now.toISOString(),
          },
        });
      }
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error auto-joining community member:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to auto-join community member' }, { status: 500 });
  }
}

// Helper function to update community stats
async function updateCommunityStats(db: any, updates: { members?: number }) {
  try {
    const statsRef = db.collection('communityStats').doc('main');
    const statsDoc = await statsRef.get();

    const now = new Date();
    if (statsDoc.exists) {
      const statsData = statsDoc.data();
      await statsRef.update({
        totalMembers: statsData!.totalMembers + (updates.members || 0),
        lastUpdated: now,
      });
    } else {
      await statsRef.set({
        totalMembers: updates.members || 0,
        totalDiscussions: 0,
        totalComments: 0,
        activeToday: 0,
        activeThisWeek: 0,
        lastUpdated: now,
      });
    }
  } catch (error) {
    devLog.error('Error updating community stats:', error, 'route');
  }
}

