import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [{ userId: '_' }]
}

// GET - Fetch user contributions from communityContributions collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    let contributionsSnapshot;
    try {
      contributionsSnapshot = await db.collection('communityContributions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (error: any) {
      // Handle missing index error gracefully
      if (error.code === 9 || error.message?.includes('index')) {
        devLog.warn('Query index missing, falling back to basic query', undefined, 'community');
        // Fallback: query without orderBy
        contributionsSnapshot = await db.collection('communityContributions')
          .where('userId', '==', userId)
          .get();

        // Sort in memory by createdAt descending
        contributionsSnapshot.docs.sort((a: any, b: any) => {
          const aDate = a.data().createdAt?.toDate?.()?.getTime() || a.data().createdAt || 0;
          const bDate = b.data().createdAt?.toDate?.()?.getTime() || b.data().createdAt || 0;
          return bDate - aDate;
        });
      } else {
        throw error;
      }
    }

    const contributions = contributionsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || 'suggestion',
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'under-review',
        impact: data.impact || 'medium',
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        comments: data.comments || 0,
        date: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        implementedDate: data.implementedDate?.toDate?.()?.toISOString() || data.implementedDate || null,
      };
    });

    // Calculate total impact score
    const impactScore = contributions.reduce((total: number, contribution: any) => {
      let contributionScore = contribution.upvotes * getImpactWeight(contribution.impact);

      // Bonus for implemented contributions
      if (contribution.status === 'implemented') {
        contributionScore += 50;
      }

      return total + contributionScore;
    }, 0);

    const implementedCount = contributions.filter((c: any) => c.status === 'implemented').length;

    return NextResponse.json({
      success: true,
      contributions,
      impactScore,
      implementedCount,
      totalContributions: contributions.length,
    });
  } catch (error: any) {
    devLog.error('Error fetching user contributions:', error, 'community');
    return NextResponse.json({ error: error.message || 'Failed to fetch user contributions' }, { status: 500 });
  }
}

// Helper function to get impact weight for calculating impact score
function getImpactWeight(impact: 'high' | 'medium' | 'low'): number {
  switch (impact) {
    case 'high': return 10;
    case 'medium': return 5;
    case 'low': return 2;
    default: return 5;
  }
}

