// Community helper functions for karma, levels, badges, and hot discussions

export type Level = 'Novice' | 'Apprentice' | 'Adept' | 'Master' | 'Grandmaster';
export type Badge = 'Early Adopter' | 'Helpful' | 'Verified Mystic' | 'Contributor' | 'Knowledgeable' | 'Newcomer' | 'Curious' | 'Top Contributor' | 'Community Pillar' | 'Mystical Guide' | 'Founding Member' | 'Wisdom Keeper' | 'Mystical Elder';

export interface KarmaChange {
  amount: number;
  reason: string;
}

/**
 * Calculate karma for different actions
 */
export function calculateKarmaForAction(action: 'createDiscussion' | 'createComment' | 'receiveUpvote' | 'receiveDownvote' | 'dailyStreak'): number {
  const karmaValues: Record<string, number> = {
    createDiscussion: 10,
    createComment: 5,
    receiveUpvote: 1,
    receiveDownvote: -1,
    dailyStreak: 5,
  };
  return karmaValues[action] || 0;
}

/**
 * Determine user level based on karma
 */
export function getLevelFromKarma(karma: number): Level {
  if (karma >= 2500) return 'Grandmaster';
  if (karma >= 1000) return 'Master';
  if (karma >= 500) return 'Adept';
  if (karma >= 100) return 'Apprentice';
  return 'Novice';
}

/**
 * Calculate reputation based on karma and activity
 */
export function getReputation(karma: number, contributions: number, streak: number): 'Respected' | 'Trusted' | 'Legendary' | 'Mystical' {
  if (karma >= 4000 && contributions >= 50 && streak >= 30) return 'Mystical';
  if (karma >= 2500 && contributions >= 30) return 'Legendary';
  if (karma >= 1000 && contributions >= 15) return 'Trusted';
  return 'Respected';
}

/**
 * Award badges based on user milestones
 */
export function calculateBadges(
  karma: number,
  contributions: number,
  joinDate: string,
  commentsCount: number,
  discussionsCount: number,
  upvotesReceived: number
): Badge[] {
  const badges: Badge[] = [];
  const joinDateObj = new Date(joinDate);
  const daysSinceJoin = Math.floor((Date.now() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24));

  // Early adopter - joined in first 30 days of community launch
  // For now, we'll use first 90 days as proxy
  if (daysSinceJoin <= 90) {
    badges.push('Early Adopter');
  }

  // First contribution
  if (contributions > 0 && !badges.includes('Newcomer')) {
    badges.push('Newcomer');
  }

  // Helpful - received many upvotes
  if (upvotesReceived >= 50) {
    badges.push('Helpful');
  }

  // Contributor - created multiple discussions
  if (discussionsCount >= 5) {
    badges.push('Contributor');
  }

  // Knowledgeable - many helpful comments
  if (commentsCount >= 20) {
    badges.push('Knowledgeable');
  }

  // Top Contributor - high karma and contributions
  if (karma >= 2000 && contributions >= 20) {
    badges.push('Top Contributor');
  }

  // Community Pillar - sustained high activity
  if (karma >= 3000 && contributions >= 30) {
    badges.push('Community Pillar');
  }

  // Mystical Guide - highest tier
  if (karma >= 4000) {
    badges.push('Mystical Guide');
  }

  // Founding Member - very early join
  if (daysSinceJoin >= 180) {
    badges.push('Founding Member');
  }

  // Wisdom Keeper - very high karma
  if (karma >= 5000) {
    badges.push('Wisdom Keeper');
  }

  // Mystical Elder - highest achievement
  if (karma >= 6000 && contributions >= 50) {
    badges.push('Mystical Elder');
  }

  // Verified Mystic - high karma with consistent activity
  if (karma >= 1500 && contributions >= 15 && commentsCount >= 30) {
    badges.push('Verified Mystic');
  }

  // Curious - asking questions (low karma but active)
  if (contributions >= 3 && karma < 100) {
    badges.push('Curious');
  }

  return badges;
}

/**
 * Check if discussion should be marked as "hot"
 * Hot = high activity (comments + votes) in last 24 hours
 */
export function isHotDiscussion(
  createdAt: Date,
  lastActivityAt: Date,
  commentCount: number,
  upvotes: number,
  downvotes: number
): boolean {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Recent discussion with activity in last 24h
  if (lastActivityAt > twentyFourHoursAgo) {
    const totalActivity = commentCount + upvotes + downvotes;
    // Hot if more than 10 total interactions in 24h
    if (totalActivity >= 10) {
      return true;
    }
  }
  
  // Or if very recent with high engagement
  if (createdAt > twentyFourHoursAgo && (upvotes - downvotes) >= 20) {
    return true;
  }
  
  return false;
}

/**
 * Update member stats after an action
 */
export interface MemberStatsUpdate {
  karma: number;
  contributions: number;
  lastActive: Date;
  streak?: number;
}

export function calculateMemberStatsUpdate(
  currentStats: {
    karma: number;
    contributions: number;
    lastActive: Date | string;
    streak?: number;
  },
  action: 'createDiscussion' | 'createComment' | 'receiveUpvote' | 'receiveDownvote',
  previousLastActive?: Date | string
): MemberStatsUpdate {
  const lastActive = previousLastActive ? new Date(previousLastActive) : new Date(currentStats.lastActive);
  const now = new Date();
  
  // Calculate streak - increment if last active was yesterday or today
  let streak = currentStats.streak || 0;
  const lastActiveDate = new Date(lastActive);
  lastActiveDate.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastActiveDate.getTime() === today.getTime()) {
    // Already active today, maintain streak
  } else if (lastActiveDate.getTime() === yesterday.getTime()) {
    // Last active yesterday, increment streak
    streak += 1;
  } else {
    // Streak broken, reset to 1
    streak = 1;
  }
  
  // Calculate karma change
  const karmaChange = calculateKarmaForAction(action);
  const newKarma = Math.max(0, currentStats.karma + karmaChange);
  
  // Increment contributions for creation actions
  const newContributions = (action === 'createDiscussion' || action === 'createComment')
    ? currentStats.contributions + 1
    : currentStats.contributions;
  
  return {
    karma: newKarma,
    contributions: newContributions,
    lastActive: now,
    streak,
  };
}

/**
 * Aggregate community statistics
 */
export interface CommunityStats {
  totalMembers: number;
  totalDiscussions: number;
  totalComments: number;
  activeToday: number;
  activeThisWeek: number;
  lastUpdated: Date;
}

export function calculateCommunityStats(
  members: Array<{ lastActive: Date | string }>,
  discussions: Array<{ createdAt: Date | string }>,
  comments: Array<{ createdAt: Date | string }>
): CommunityStats {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const activeToday = members.filter(m => {
    const lastActive = new Date(m.lastActive);
    return lastActive >= today;
  }).length;
  
  const activeThisWeek = members.filter(m => {
    const lastActive = new Date(m.lastActive);
    return lastActive >= weekAgo;
  }).length;
  
  return {
    totalMembers: members.length,
    totalDiscussions: discussions.length,
    totalComments: comments.length,
    activeToday,
    activeThisWeek,
    lastUpdated: now,
  };
}

