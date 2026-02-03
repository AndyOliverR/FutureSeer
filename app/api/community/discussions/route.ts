import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { getAuth } from 'firebase-admin/auth';
import { 
  calculateKarmaForAction, 
  calculateMemberStatsUpdate,
  isHotDiscussion 
} from '@/lib/firestore/communityHelpers';
import { devLog } from '@/lib/devLogger';

interface DiscussionData {
  title: string;
  content: string;
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// GET - Fetch discussions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, upvotes, lastActivityAt
    const limit = parseInt(searchParams.get('limit') || '20');
    const lastDocId = searchParams.get('lastDocId');
    const status = searchParams.get('status') || 'active';

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      let query = db.collection('communityDiscussions');
      
      // Try to apply status filter, but handle missing index gracefully
      try {
        if (status) {
          query = query.where('status', '==', status);
        }
      } catch (error) {
        // If index is missing, skip status filter
        devLog.warn('Status filter skipped - index may be missing:', error, 'community');
      }

      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }

      // Apply sorting
      if (sortBy === 'upvotes') {
        query = query.orderBy('upvotes', 'desc');
      } else if (sortBy === 'lastActivityAt') {
        query = query.orderBy('lastActivityAt', 'desc');
      } else {
        query = query.orderBy('createdAt', 'desc');
      }

      // Apply pagination
      if (lastDocId) {
        const lastDoc = await db.collection('communityDiscussions').doc(lastDocId).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      query = query.limit(limit);

      let snapshot;
      try {
        snapshot = await query.get();
      } catch (error: any) {
        // Handle missing index error gracefully
        if (error.code === 9 || error.message?.includes('index')) {
          devLog.warn('Query index missing, falling back to basic query', undefined, 'community');
          // Fallback: query without status filter
          let fallbackQuery = db.collection('communityDiscussions');
          
          if (category && category !== 'all') {
            fallbackQuery = fallbackQuery.where('category', '==', category);
          }
          
          if (sortBy === 'createdAt' || !sortBy) {
            fallbackQuery = fallbackQuery.orderBy('createdAt', 'desc');
          } else if (sortBy === 'upvotes') {
            fallbackQuery = fallbackQuery.orderBy('upvotes', 'desc');
          } else {
            fallbackQuery = fallbackQuery.orderBy('createdAt', 'desc');
          }
          
          fallbackQuery = fallbackQuery.limit(limit);
          snapshot = await fallbackQuery.get();
          
          // Filter by status in memory if needed
          const docs = snapshot.docs.filter(doc => {
            if (status && status !== 'all') {
              return doc.data().status === status;
            }
            return true;
          });
          
          // Create a mock snapshot with filtered docs
          snapshot = {
            docs,
            empty: docs.length === 0,
            size: docs.length,
          } as any;
        } else {
          throw error;
        }
      }
      const discussions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        lastActivityAt: doc.data().lastActivityAt?.toDate?.()?.toISOString() || doc.data().lastActivityAt,
      }));

      return NextResponse.json({
        success: true,
        discussions,
        hasMore: snapshot.docs.length === limit,
        lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch discussions' }, { status: 500 });
  }
}

// POST - Create new discussion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, priority = 'medium', userId, authorName } = body;

    if (!title || !content || !category || !userId || !authorName) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, category, userId, authorName' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'astrology', 'tarot', 'numerology', 'palmistry', 'dream-analysis', 
      'angel-numbers', 'vedic', 'western', 'kabbalah', 'iching', 'runes', 
      'lenormand', 'geomancy', 'horary', 'synastry', 'medical', 'financial', 
      'mundane', 'bazi', 'kp', 'vaastu', 'face-reading', 'general'
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const now = new Date();
      
      // Create discussion document
      const discussionRef = db.collection('communityDiscussions').doc();
      const discussionData = {
        title,
        content,
        authorId: userId,
        authorName,
        category,
        priority,
        status: 'active',
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        isHot: false,
        isSticky: false,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
      };

      await discussionRef.set(discussionData);

      // Update member stats (karma, contributions)
      await updateMemberStats(db, userId, 'createDiscussion');

      // Update or create member profile if needed
      await ensureMemberProfile(db, userId, authorName);

      // Update community stats
      await updateCommunityStats(db, { discussions: 1 });

      return NextResponse.json({
        success: true,
        discussion: {
          id: discussionRef.id,
          ...discussionData,
          createdAt: discussionData.createdAt.toISOString(),
          updatedAt: discussionData.updatedAt.toISOString(),
          lastActivityAt: discussionData.lastActivityAt.toISOString(),
        },
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error creating discussion:', error);
    return NextResponse.json({ error: error.message || 'Failed to create discussion' }, { status: 500 });
  }
}

// Helper function to update member stats
async function updateMemberStats(db: any, userId: string, action: 'createDiscussion' | 'createComment' | 'receiveUpvote' | 'receiveDownvote') {
  try {
    const memberRef = db.collection('communityMembers').doc(userId);
    const memberDoc = await memberRef.get();

    if (memberDoc.exists) {
      const memberData = memberDoc.data();
      const statsUpdate = calculateMemberStatsUpdate(
        {
          karma: memberData.karma || 0,
          contributions: memberData.contributions || 0,
          lastActive: memberData.lastActive || new Date(),
          streak: memberData.streak || 0,
        },
        action,
        memberData.lastActive
      );

      const karmaChange = calculateKarmaForAction(action);
      const newKarma = Math.max(0, (memberData.karma || 0) + karmaChange);
      const newContributions = (action === 'createDiscussion' || action === 'createComment')
        ? (memberData.contributions || 0) + 1
        : (memberData.contributions || 0);

      await memberRef.update({
        karma: newKarma,
        contributions: newContributions,
        lastActive: new Date(),
        streak: statsUpdate.streak,
      });
    } else {
      // Create new member profile
      const karmaChange = calculateKarmaForAction(action);
      await memberRef.set({
        userId,
        karma: Math.max(0, karmaChange),
        contributions: (action === 'createDiscussion' || action === 'createComment') ? 1 : 0,
        lastActive: new Date(),
        streak: 1,
        joinDate: new Date(),
        badges: [],
        reputation: 'Respected',
        interests: [],
        flair: '',
      });
    }
  } catch (error) {
    console.error('Error updating member stats:', error);
    // Don't throw - stats update failure shouldn't break discussion creation
  }
}

// Helper function to ensure member profile exists
async function ensureMemberProfile(db: any, userId: string, authorName: string) {
  try {
    const memberRef = db.collection('communityMembers').doc(userId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      await memberRef.set({
        userId,
        name: authorName,
        karma: 0,
        contributions: 0,
        lastActive: new Date(),
        streak: 0,
        joinDate: new Date(),
        badges: [],
        reputation: 'Respected',
        interests: [],
        flair: '',
      });
    } else {
      // Update name if provided
      const memberData = memberDoc.data();
      if (authorName && memberData.name !== authorName) {
        await memberRef.update({ name: authorName });
      }
    }
  } catch (error) {
    console.error('Error ensuring member profile:', error);
  }
}

// Helper function to update community stats
async function updateCommunityStats(db: any, updates: { members?: number; discussions?: number; comments?: number }) {
  try {
    const statsRef = db.collection('communityStats').doc('main');
    const statsDoc = await statsRef.get();

    const now = new Date();
    if (statsDoc.exists) {
      const statsData = statsDoc.data();
      await statsRef.update({
        totalMembers: statsData.totalMembers + (updates.members || 0),
        totalDiscussions: statsData.totalDiscussions + (updates.discussions || 0),
        totalComments: statsData.totalComments + (updates.comments || 0),
        lastUpdated: now,
      });
    } else {
      await statsRef.set({
        totalMembers: updates.members || 0,
        totalDiscussions: updates.discussions || 0,
        totalComments: updates.comments || 0,
        activeToday: 0,
        activeThisWeek: 0,
        lastUpdated: now,
      });
    }
  } catch (error) {
    console.error('Error updating community stats:', error);
  }
}

