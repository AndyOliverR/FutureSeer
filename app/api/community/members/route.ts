import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { getLevelFromKarma, getReputation, calculateBadges } from '@/lib/firestore/communityHelpers';

// GET - Fetch member list with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'karma'; // karma, lastActive, contributions
    const limit = parseInt(searchParams.get('limit') || '20');
    const lastDocId = searchParams.get('lastDocId');

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      let query = db.collection('communityMembers');

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
        const data = doc.data();
        const userId = data.userId || doc.id;
        const memberEmail = (data.email || '').trim().toLowerCase();
        const karma = data.karma || 0;
        const contributions = data.contributions || 0;
        const streak = data.streak || 0;
        const joinDate = data.joinDate?.toDate?.() || new Date(data.joinDate || Date.now());
        const isFounderByUid = founderUid && (userId === founderUid || doc.id === founderUid);
        const isFounderByEmail = founderEmail && memberEmail && memberEmail === founderEmail;
        const isFounder = isFounderByUid || isFounderByEmail;

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
            lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive || new Date().toISOString(),
            interests: data.interests || [],
            badges,
            reputation: 'Mystical' as const,
            flair: 'Founder',
            isOnline: false,
          };
        }

        return {
          id: doc.id,
          userId,
          name: data.name || 'Anonymous',
          karma,
          level: getLevelFromKarma(karma),
          contributions,
          streak,
          joinDate: joinDate.toISOString(),
          lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive || new Date().toISOString(),
          interests: data.interests || [],
          badges: data.badges || [],
          reputation: getReputation(karma, contributions, streak),
          flair: data.flair || '',
          isOnline: false, // TODO: Implement real-time online status
        };
      });

      // Ensure founder is always in the list when they exist in Firestore (e.g. not in top 50 by karma)
      if (founderUid) {
        const founderInList = members.some((m: { userId: string; id: string }) => m.userId === founderUid || m.id === founderUid);
        if (!founderInList) {
          const founderDoc = await db.collection('communityMembers').doc(founderUid).get();
          if (founderDoc.exists) {
            const data = founderDoc.data()!;
            const joinDate = data.joinDate?.toDate?.() || new Date(data.joinDate || Date.now());
            const existingBadges = Array.isArray(data.badges) ? data.badges : [];
            const badges = existingBadges.includes('Creator') ? existingBadges : [...existingBadges, 'Creator'];
            const founderMember = {
              id: founderDoc.id,
              userId: data.userId || founderDoc.id,
              name: data.name || 'Anonymous',
              karma: 10000,
              level: 'Grandmaster' as const,
              contributions: data.contributions || 0,
              streak: 365,
              joinDate: joinDate.toISOString(),
              lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive || new Date().toISOString(),
              interests: data.interests || [],
              badges,
              reputation: 'Mystical' as const,
              flair: 'Founder',
              isOnline: false,
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
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch members' }, { status: 500 });
  }
}

