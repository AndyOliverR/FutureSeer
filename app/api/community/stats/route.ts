import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { calculateCommunityStats } from '@/lib/firestore/communityHelpers';

export const dynamic = 'force-static'

// GET - Fetch aggregate community statistics
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const statsRef = db.collection('communityStats').doc('main');
      const statsDoc = await statsRef.get();

      let stats;

      if (statsDoc.exists) {
        const statsData = statsDoc.data();
        stats = {
          totalMembers: statsData!.totalMembers || 0,
          totalDiscussions: statsData!.totalDiscussions || 0,
          totalComments: statsData!.totalComments || 0,
          activeToday: statsData!.activeToday || 0,
          activeThisWeek: statsData!.activeThisWeek || 0,
          lastUpdated: statsData!.lastUpdated?.toDate?.()?.toISOString() || statsData!.lastUpdated || new Date().toISOString(),
        };

        // Calculate active today and this week
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Count active members today
        const activeTodayQuery = db.collection('communityMembers')
          .where('lastActive', '>=', today);
        const activeTodaySnapshot = await activeTodayQuery.get();
        const activeToday = activeTodaySnapshot.size;

        // Count active members this week
        const activeWeekQuery = db.collection('communityMembers')
          .where('lastActive', '>=', weekAgo);
        const activeWeekSnapshot = await activeWeekQuery.get();
        const activeThisWeek = activeWeekSnapshot.size;

        // Update stats if they've changed
        if (activeToday !== stats.activeToday || activeThisWeek !== stats.activeThisWeek) {
          await statsRef.update({
            activeToday,
            activeThisWeek,
            lastUpdated: now,
          });
          stats.activeToday = activeToday;
          stats.activeThisWeek = activeThisWeek;
        }
      } else {
        // Initialize stats if they don't exist
        const membersSnapshot = await db.collection('communityMembers').get();
        const discussionsSnapshot = await db.collection('communityDiscussions').get();

        // Count comments (need to check all discussions)
        let totalComments = 0;
        const discussions = await discussionsSnapshot.docs;
        for (const discussionDoc of discussions.slice(0, 100)) {
          const commentsSnapshot = await discussionDoc.ref.collection('comments').get();
          totalComments += commentsSnapshot.size;
        }

        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Count active members
        const activeTodayQuery = db.collection('communityMembers')
          .where('lastActive', '>=', today);
        const activeTodaySnapshot = await activeTodayQuery.get();
        const activeToday = activeTodaySnapshot.size;

        const activeWeekQuery = db.collection('communityMembers')
          .where('lastActive', '>=', weekAgo);
        const activeWeekSnapshot = await activeWeekQuery.get();
        const activeThisWeek = activeWeekSnapshot.size;

        stats = {
          totalMembers: membersSnapshot.size,
          totalDiscussions: discussionsSnapshot.size,
          totalComments,
          activeToday,
          activeThisWeek,
          lastUpdated: now.toISOString(),
        };

        await statsRef.set({
          ...stats,
          lastUpdated: now,
        });
      }

      return NextResponse.json({
        success: true,
        stats,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch community stats' }, { status: 500 });
  }
}

