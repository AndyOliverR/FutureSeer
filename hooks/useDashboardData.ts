import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { getAskHistory, getNotes } from '@/lib/firebase';

export type RetentionSnapshot = {
  currentStreak: number;
  lastActiveAt: number | null;
  loopCompletedToday: boolean;
  trialDaysLeft: number | null;
  nudgeStage: 'active' | 'at_risk' | 'reactivation' | 'trial_ending';
};

function getStreakDays(timestamps: number[]): number {
  if (!timestamps.length) return 0;
  const days = timestamps.map(ts => new Date(ts).toDateString());
  const uniqueDays = Array.from(new Set(days)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function useDashboardData() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [askHistory, setAskHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setAskHistory([]);
      setNotes([]);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      getAskHistory(user.uid),
      getNotes(user.uid),
    ])
      .then(([history, notes]) => {
        setAskHistory(history);
        setNotes(notes);
      })
      .catch((err) => {
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Compute stats
  const totalReadings = askHistory.length;
  const notesCount = notes.length;
  const remedies = askHistory.flatMap((h) => h.remedies || []);
  const activeRemedies = Array.from(new Set(remedies.map((r) => r.name || JSON.stringify(r)))).length;
  const streakDays = getStreakDays(askHistory.map((h) => h.timestamp));
  const accuracy = '94%'; // Placeholder, replace with real logic if available
  const lastActiveAt = askHistory.length > 0 ? Math.max(...askHistory.map((h) => h.timestamp)) : null;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const daysSinceLastActivity = lastActiveAt ? Math.floor((now - lastActiveAt) / dayMs) : Number.POSITIVE_INFINITY;
  const trialEndsAtRaw = (userProfile as { trialEndsAt?: number } | null)?.trialEndsAt;
  const trialDaysLeft =
    typeof trialEndsAtRaw === 'number' ? Math.max(0, Math.ceil((trialEndsAtRaw - now) / dayMs)) : null;
  const loopCompletedToday = daysSinceLastActivity === 0;
  const nudgeStage: RetentionSnapshot['nudgeStage'] =
    trialDaysLeft !== null && trialDaysLeft <= 3
      ? 'trial_ending'
      : daysSinceLastActivity <= 0
        ? 'active'
        : daysSinceLastActivity <= 1
          ? 'at_risk'
          : 'reactivation';
  const retentionSnapshot: RetentionSnapshot = {
    currentStreak: streakDays,
    lastActiveAt,
    loopCompletedToday,
    trialDaysLeft,
    nudgeStage,
  };

  // Recent activity: last 5 from askHistory and notes
  const recentActivity = [
    ...askHistory.map((h) => ({
      type: 'ask',
      time: h.timestamp,
      action: `Asked: ${h.question.substring(0, 40)}${h.question.length > 40 ? '…' : ''}`,
      result: h.aiSummary ? 'AI Insight' : '',
    })),
    ...notes.map((n) => ({
      type: 'note',
      time: n.updatedAt || n.createdAt,
      action: `Note: ${n.title.substring(0, 40)}${n.title.length > 40 ? '…' : ''}`,
      result: '',
    })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      timeAgo: timeAgo(item.time),
    }));

  function timeAgo(ts: number) {
    const now = Date.now();
    const diff = Math.floor((now - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return {
    loading,
    error,
    userProfile,
    totalReadings,
    activeRemedies,
    streakDays,
    accuracy,
    notesCount,
    recentActivity,
    retentionSnapshot,
  };
} 