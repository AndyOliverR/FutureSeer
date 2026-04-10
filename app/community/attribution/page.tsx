"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { devLog } from '@/lib/devLogger';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Users, Star, Heart, Share2, MessageCircle, UserPlus, Send, X, Flame, Crown, Sparkles, Plus, Bell, CalendarClock } from 'lucide-react';
import { DiscussionCard } from '@/components/community/DiscussionCard';
import { DiscussionForm } from '@/components/community/DiscussionForm';
import { GuestDiscussionForm } from '@/components/community/GuestDiscussionForm';
import { AttributionLeaderboard } from '@/components/AttributionLeaderboard';
import { RecaptchaScript } from '@/components/RecaptchaScript';
import { useToast } from '@/components/ui/use-toast';
interface UserContribution {
  id: string;
  type: 'feedback' | 'suggestion' | 'bug-report' | 'feature-request';
  title: string;
  description: string;
  status: 'implemented' | 'in-progress' | 'under-review' | 'declined';
  impact: 'high' | 'medium' | 'low';
  date: string;
  implementedDate?: string;
  upvotes: number;
  downvotes: number;
  comments: number;
}

interface ReferralStats {
  totalInvites: number;
  successfulSignups: number;
  pendingInvites: number;
  lastInviteDate?: string;
}

interface CommunityMember {
  id: string;
  name: string;
  contributions: number;
  impact: number;
  joinDate: string;
  lastActive: string;
  interests: string[];
  isOnline: boolean;
  karma: number;
  flair: string;
  badges: string[];
  level: 'Novice' | 'Apprentice' | 'Adept' | 'Master' | 'Grandmaster';
  streak: number;
  reputation: 'Respected' | 'Trusted' | 'Legendary' | 'Mystical';
  hideStats?: boolean;
}

interface DiscussionComment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface ConnectionRequestItem {
  id: string;
  fromUserName: string;
  toUserName: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  type: 'incoming' | 'outgoing';
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  date: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  category: 'astrology' | 'tarot' | 'numerology' | 'palmistry' | 'dream-analysis' | 'angel-numbers' | 'vedic' | 'western' | 'kabbalah' | 'iching' | 'runes' | 'lenormand' | 'geomancy' | 'horary' | 'synastry' | 'medical' | 'financial' | 'bazi' | 'kp' | 'vaastu' | 'face-reading' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'archived';
  isHot: boolean;
  isSticky: boolean;
  adminNotes?: string;
  actionRequired?: boolean;
}


interface UserAttribution {
  contributions: UserContribution[];
  referralStats: ReferralStats;
  totalImpact: number;
  thankYouMessages: string[];
}

export default function CommunityAttributionPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [attribution, setAttribution] = useState<UserAttribution | null>(null);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [discussionThreads, setDiscussionThreads] = useState<DiscussionThread[]>([]);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [connectionRequest, setConnectionRequest] = useState({ topic: '', message: '' });
  const [activeTab, setActiveTab] = useState<'members' | 'discussions' | 'requests' | 'contributions'>('members');
  const [loading, setLoading] = useState(true);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [showGuestDiscussionForm, setShowGuestDiscussionForm] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [discussionSort, setDiscussionSort] = useState<'createdAt' | 'lastActivityAt' | 'upvotes'>('lastActivityAt');
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [threadComments, setThreadComments] = useState<DiscussionComment[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [pendingIncomingCount, setPendingIncomingCount] = useState(0);
  const [newDiscussionCount, setNewDiscussionCount] = useState(0);

  const LOAD_TIMEOUT_MS = 10000; // Don't block the page forever if a request hangs

  const loadGuestDiscussions = async () => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      setLoading(true);
      setActiveTab('discussions');
      timeoutId = setTimeout(() => {
        setLoading(false);
        devLog.warn('Guest community load timed out.', undefined, 'page');
      }, LOAD_TIMEOUT_MS);

      const discussionsRes = await fetch(`/api/community/discussions?status=active&limit=20&sortBy=${discussionSort}`);
      if (!discussionsRes.ok) throw new Error('discussions fetch failed');
      const data = await discussionsRes.json();
      if (data.success && Array.isArray(data.discussions)) {
        setDiscussionThreads(data.discussions.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          title: d.title as string,
          content: d.content as string,
          author: d.authorName as string,
          authorId: d.authorId as string,
          date: d.createdAt as string,
          upvotes: (d.upvotes as number) || 0,
          downvotes: (d.downvotes as number) || 0,
          comments: (d.commentCount as number) || 0,
          category: d.category as DiscussionThread['category'],
          priority: (d.priority as DiscussionThread['priority']) || 'medium',
          status: d.status as DiscussionThread['status'],
          isHot: Boolean(d.isHot),
          isSticky: Boolean(d.isSticky),
        })));
      } else {
        setDiscussionThreads([]);
      }
      setCommunityMembers([]);
      setAttribution(null);
    } catch (error) {
      devLog.error('Error loading guest discussions:', error, 'page');
      toast({
        title: 'Error',
        description: 'Could not load discussions',
        variant: 'destructive',
      });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const loadCommunityData = async () => {
    if (!user?.uid) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      setLoading(true);
      timeoutId = setTimeout(() => {
        setLoading(false);
        devLog.warn('Community data load timed out; showing partial data.', undefined, 'page');
      }, LOAD_TIMEOUT_MS);

      const uid = user.uid;
      const displayName = user.displayName || user.email || 'Anonymous';

      // Run auto-join, members, discussions, and attribution in parallel (wait for slowest, not sum)
      const autoJoinPromise = fetch('/api/community/members/auto-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          userName: displayName,
          email: user.email || null,
          photoURL: user.photoURL || null,
          joinDate: user.metadata?.creationTime || new Date().toISOString(),
        }),
      }).catch((err) => {
        devLog.error('Error auto-joining community:', err, 'page');
        return { __failed: true as const };
      });

      const membersPromise = fetch('/api/community/members?limit=50').then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        return data.success ? data.members : null;
      }).catch(() => null);

      const discussionsPromise = fetch(`/api/community/discussions?status=active&limit=20&sortBy=${discussionSort}`).then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        return data.success ? data.discussions : null;
      }).catch(() => null);

      const attributionPromise = fetch(`/api/community/attribution/${uid}`).then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        return data.success && data.attribution ? data.attribution : null;
      }).catch((err) => {
        devLog.error('Error loading user attribution:', err, 'page');
        return null;
      });

      const requestsPromise = fetch(`/api/community/connections?userId=${uid}&type=incoming`)
        .then(async (r) => {
          if (!r.ok) return null;
          const data = await r.json();
          return data.success ? data.requests : null;
        })
        .catch(() => null);

      const [autoJoinResult, membersData, discussionsData, attributionData, incomingRequests] = await Promise.all([
        autoJoinPromise,
        membersPromise,
        discussionsPromise,
        attributionPromise,
        requestsPromise,
      ]);

      // Surface auto-join failures to the user
      if (autoJoinResult && typeof autoJoinResult === 'object' && '__failed' in autoJoinResult && (autoJoinResult as { __failed?: boolean }).__failed) {
        toast({ title: "Community", description: "Could not join community automatically. Some features may be limited.", variant: "destructive" });
      }

      // Notify if some community sections failed to load
      const failedSections: string[] = [];
      if (!membersData) failedSections.push('members');
      if (!discussionsData) failedSections.push('discussions');
      if (failedSections.length > 0) {
        toast({ title: "Partial load", description: `Could not load ${failedSections.join(' and ')}. Pull to refresh to try again.` });
      }

      if (membersData?.length) {
        setCommunityMembers(membersData.map((m: Record<string, unknown>) => ({
          id: String(m.userId ?? m.id ?? ''),
          name: String(m.name ?? ''),
          contributions: Number(m.contributions) || 0,
          impact: Number(m.karma) || 0,
          joinDate: String(m.joinDate ?? ''),
          lastActive: String(m.lastActive ?? ''),
          interests: Array.isArray(m.interests) ? m.interests as string[] : [],
          isOnline: Boolean(m.isOnline),
          karma: Number(m.karma) || 0,
          flair: String(m.flair ?? ''),
          badges: Array.isArray(m.badges) ? m.badges as string[] : [],
          level: (m.level as CommunityMember['level']) || 'Novice',
          streak: Number(m.streak) || 0,
          reputation: (m.reputation as CommunityMember['reputation']) || 'Respected',
          hideStats: m.hideStats === true,
        })));
      }

      if (discussionsData?.length) {
        const lastSeenIso = localStorage.getItem('community_last_seen_discussion_at');
        const lastSeenMs = lastSeenIso ? new Date(lastSeenIso).getTime() : 0;
        const unseen = discussionsData.filter((d: Record<string, unknown>) => {
          const createdAt = new Date(String(d.createdAt ?? '')).getTime();
          return createdAt > lastSeenMs;
        }).length;
        setNewDiscussionCount(unseen);
        if (!lastSeenIso) {
          localStorage.setItem('community_last_seen_discussion_at', new Date().toISOString());
        }

        setDiscussionThreads(discussionsData.map((d: Record<string, unknown>) => ({
          id: String(d.id ?? ''),
          title: String(d.title ?? ''),
          content: String(d.content ?? ''),
          author: String(d.authorName ?? ''),
          authorId: String(d.authorId ?? ''),
          date: String(d.createdAt ?? ''),
          upvotes: Number(d.upvotes) || 0,
          downvotes: Number(d.downvotes) || 0,
          comments: Number(d.commentCount) || 0,
          category: d.category as DiscussionThread['category'],
          priority: (d.priority as DiscussionThread['priority']) || 'medium',
          status: d.status as DiscussionThread['status'],
          isHot: Boolean(d.isHot),
          isSticky: Boolean(d.isSticky),
        })));

        // Load user votes in background so we don't block first paint
        const votePromises = discussionsData.map(async (d: Record<string, unknown>) => {
          try {
            const voteResponse = await fetch(`/api/community/votes?userId=${uid}&discussionId=${String(d.id ?? '')}`);
            if (!voteResponse.ok) return null;
            const voteData = await voteResponse.json();
            if (voteData.success && voteData.hasVoted) {
              return { discussionId: String(d.id ?? ''), voteType: voteData.voteType as 'up' | 'down' };
            }
          } catch {
            return null;
          }
          return null;
        });
        Promise.all(votePromises).then((votes) => {
          const votesMap: Record<string, 'up' | 'down'> = {};
          votes.forEach((vote) => {
            if (vote) votesMap[vote.discussionId] = vote.voteType;
          });
          setUserVotes(votesMap);
        });
      }

      if (Array.isArray(incomingRequests)) {
        const mappedRequests = incomingRequests.map((request: Record<string, unknown>) => ({
          id: String(request.id ?? ''),
          fromUserName: String(request.fromUserName ?? ''),
          toUserName: String(request.toUserName ?? ''),
          topic: String(request.topic ?? ''),
          message: String(request.message ?? ''),
          status: (request.status as ConnectionRequestItem['status']) || 'pending',
          type: (request.type as ConnectionRequestItem['type']) || 'incoming',
          createdAt: String(request.createdAt ?? ''),
        }));
        setConnectionRequests(mappedRequests);
        setPendingIncomingCount(mappedRequests.filter((r) => r.type === 'incoming' && r.status === 'pending').length);
      } else {
        setConnectionRequests([]);
        setPendingIncomingCount(0);
      }

      if (attributionData) {
        setAttribution({
          contributions: attributionData.contributions || [],
          referralStats: attributionData.referralStats || {
            totalInvites: 0,
            successfulSignups: 0,
            pendingInvites: 0,
          },
          totalImpact: attributionData.totalImpact || 0,
          thankYouMessages: attributionData.thankYouMessages || [
            "Thank you for helping make FutureSeer better! ✨",
            "Your feedback directly improved the user experience 🌟",
            "You're part of our mystical community's growth 🔮"
          ]
        });
      } else {
        setAttribution({
          contributions: [],
          referralStats: { totalInvites: 0, successfulSignups: 0, pendingInvites: 0 },
          totalImpact: 0,
          thankYouMessages: [
            "Welcome to the FutureSeer community! 🌟",
            "Your contributions make a difference ✨",
            "Together we build the future of mystical insights 🔮"
          ]
        });
      }

      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    } catch (error) {
      devLog.error('Error loading community data:', error, 'page');
      if (timeoutId) clearTimeout(timeoutId);
      toast({
        title: "Error",
        description: "Failed to load community data",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user?.uid) {
      void loadCommunityData();
    } else {
      void loadGuestDiscussions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when auth gate or user id changes
  }, [user?.uid, authLoading, discussionSort]);

  useEffect(() => {
    if (!user?.uid || authLoading) return;
    const interval = setInterval(() => {
      void loadCommunityData();
    }, 45000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep polling tied to auth identity only
  }, [user?.uid, authLoading]);

  const openThread = async (threadId: string) => {
    setThreadLoading(true);
    try {
      const response = await fetch(`/api/community/discussions/${threadId}`);
      if (!response.ok) throw new Error('Failed to load thread');
      const data = await response.json();
      if (!data.success) throw new Error('Failed to load thread');
      setSelectedThread({
        id: String(data.discussion.id ?? ''),
        title: String(data.discussion.title ?? ''),
        content: String(data.discussion.content ?? ''),
        author: String(data.discussion.authorName ?? ''),
        authorId: String(data.discussion.authorId ?? ''),
        date: String(data.discussion.createdAt ?? ''),
        upvotes: Number(data.discussion.upvotes) || 0,
        downvotes: Number(data.discussion.downvotes) || 0,
        comments: Number(data.discussion.commentCount) || 0,
        category: data.discussion.category as DiscussionThread['category'],
        priority: (data.discussion.priority as DiscussionThread['priority']) || 'medium',
        status: data.discussion.status as DiscussionThread['status'],
        isHot: Boolean(data.discussion.isHot),
        isSticky: Boolean(data.discussion.isSticky),
      });
      setThreadComments(
        (data.comments ?? []).map((c: Record<string, unknown>) => ({
          id: String(c.id ?? ''),
          content: String(c.content ?? ''),
          authorName: String(c.authorName ?? ''),
          createdAt: String(c.createdAt ?? ''),
        }))
      );
    } catch (error) {
      devLog.error('Error loading thread details:', error, 'page');
      toast({ title: 'Error', description: 'Could not load thread details', variant: 'destructive' });
    } finally {
      setThreadLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!selectedThread || !newComment.trim() || !user?.uid) return;
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussionId: selectedThread.id,
          content: newComment.trim(),
          userId: user.uid,
          authorName: user.displayName || user.email || 'Anonymous',
        }),
      });
      if (!response.ok) throw new Error('Failed to post reply');
      setNewComment('');
      await openThread(selectedThread.id);
      await loadCommunityData();
    } catch (error) {
      devLog.error('Error creating comment:', error, 'page');
      toast({ title: 'Error', description: 'Could not post your reply', variant: 'destructive' });
    }
  };

  const refreshConnectionRequests = async () => {
    if (!user?.uid) return;
    setRequestsLoading(true);
    try {
      const response = await fetch(`/api/community/connections?userId=${user.uid}&type=all`);
      if (!response.ok) throw new Error('Failed to load requests');
      const data = await response.json();
      const requests = (data.requests ?? []).map((request: Record<string, unknown>) => ({
        id: String(request.id ?? ''),
        fromUserName: String(request.fromUserName ?? ''),
        toUserName: String(request.toUserName ?? ''),
        topic: String(request.topic ?? ''),
        message: String(request.message ?? ''),
        status: (request.status as ConnectionRequestItem['status']) || 'pending',
        type: (request.type as ConnectionRequestItem['type']) || 'incoming',
        createdAt: String(request.createdAt ?? ''),
      }));
      setConnectionRequests(requests);
      setPendingIncomingCount(requests.filter((r: ConnectionRequestItem) => r.type === 'incoming' && r.status === 'pending').length);
    } catch (error) {
      devLog.error('Error loading connection requests:', error, 'page');
      toast({ title: 'Error', description: 'Could not load connection requests', variant: 'destructive' });
    } finally {
      setRequestsLoading(false);
    }
  };

  const respondToConnectionRequest = async (requestId: string, action: 'accept' | 'decline') => {
    if (!user?.uid) return;
    try {
      const response = await fetch(`/api/community/connections/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: user.uid }),
      });
      if (!response.ok) throw new Error('Failed to update request');
      await refreshConnectionRequests();
      toast({
        title: action === 'accept' ? 'Connection accepted' : 'Connection declined',
        description: action === 'accept' ? 'You are now connected.' : 'Request declined.',
      });
    } catch (error) {
      devLog.error('Error responding to connection request:', error, 'page');
      toast({ title: 'Error', description: 'Could not update request', variant: 'destructive' });
    }
  };

  const handleConnectionRequest = (member: CommunityMember) => {
    setSelectedMember(member);
    setShowConnectionModal(true);
  };

  const sendConnectionRequest = async () => {
    if (!user?.uid || !selectedMember) return;

    if (!connectionRequest.topic.trim() || !connectionRequest.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both topic and message",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/community/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user.uid,
          fromUserName: user.displayName || user.email || 'Anonymous',
          toUserId: selectedMember.id,
          toUserName: selectedMember.name,
          topic: connectionRequest.topic.trim(),
          message: connectionRequest.message.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send connection request');
      }

      toast({
        title: "Connection Request Sent! 📤",
        description: `Your request has been sent to ${selectedMember.name}`,
      });

      setShowConnectionModal(false);
      setConnectionRequest({ topic: '', message: '' });
      setSelectedMember(null);
    } catch (error: unknown) {
      devLog.error('Error sending connection request:', error, 'page');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send connection request",
        variant: "destructive"
      });
    }
  };

  const handleVote = async (threadId: string, voteType: 'up' | 'down') => {
    if (!user?.uid) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to vote",
        variant: "destructive"
      });
      return;
    }

    try {
      const currentVote = userVotes[threadId] ?? null;
      let upvoteDelta = 0;
      let downvoteDelta = 0;

      if (currentVote === voteType) {
        upvoteDelta = voteType === 'up' ? -1 : 0;
        downvoteDelta = voteType === 'down' ? -1 : 0;
      } else if (currentVote) {
        upvoteDelta = voteType === 'up' ? 1 : -1;
        downvoteDelta = voteType === 'down' ? 1 : -1;
      } else {
        upvoteDelta = voteType === 'up' ? 1 : 0;
        downvoteDelta = voteType === 'down' ? 1 : 0;
      }

      setDiscussionThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                upvotes: Math.max(0, thread.upvotes + upvoteDelta),
                downvotes: Math.max(0, thread.downvotes + downvoteDelta),
              }
            : thread
        )
      );

      setUserVotes((prev) => {
        const next = { ...prev };
        const cur = prev[threadId];
        if (cur === voteType) {
          delete next[threadId];
        } else {
          next[threadId] = voteType;
        }
        return next;
      });

      // Send vote to API
      const response = await fetch('/api/community/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          discussionId: threadId,
          voteType,
        }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        loadCommunityData();
        throw new Error('Failed to record vote');
      }

      const result = await response.json();
      if (result.success) {
        // Update user votes
        if (result.voted) {
          setUserVotes(prev => ({ ...prev, [threadId]: voteType }));
        } else {
          setUserVotes(prev => {
            const updated = { ...prev };
            delete updated[threadId];
            return updated;
          });
        }
      }
    } catch (error) {
      devLog.error('Error voting:', error, 'page');
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive"
      });
      // Reload to get correct state
      loadCommunityData();
    }
  };

  const handleCreateDiscussion = async (data: {
    title: string;
    content: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    if (!user?.uid) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to create a discussion",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user.uid,
          authorName: user.displayName || user.email || 'Anonymous',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create discussion');
      }

      toast({
        title: "Discussion Created! 🎉",
        description: "Your discussion has been posted to the community",
      });

      setShowDiscussionForm(false);
      await loadCommunityData();
    } catch (error: unknown) {
      devLog.error('Error creating discussion:', error, 'page');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create discussion",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleCreateGuestDiscussion = async (data: {
    title: string;
    content: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    authorName: string;
    captchaToken?: string;
  }) => {
    try {
      const response = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestPost: true,
          title: data.title,
          content: data.content,
          category: data.category,
          priority: data.priority,
          authorName: data.authorName,
          captchaToken: data.captchaToken,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Failed to create discussion');
      }

      toast({
        title: "Posted",
        description: "Your discussion is live. Sign in for full community features.",
      });

      setShowGuestDiscussionForm(false);
      await loadGuestDiscussions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create discussion";
      devLog.error('Error creating guest discussion:', error, 'page');
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800 border-green-500/40';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-500/40';
      case 'under-review': return 'bg-amber-100 text-amber-800 border-amber-500/40';
      case 'declined': return 'bg-red-100 text-red-800 border-red-500/40';
      default: return 'bg-slate-100 text-slate-700 border-slate-500/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-amber-700';
      case 'low': return 'text-green-700';
      default: return 'text-slate-700';
    }
  };

  const getReputationIcon = (reputation: string) => {
    switch (reputation) {
      case 'Mystical': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'Legendary': return <Flame className="w-4 h-4 text-red-600" />;
      case 'Trusted': return <Star className="w-4 h-4 text-amber-600" />;
      case 'Respected': return <Sparkles className="w-4 h-4 text-blue-600" />;
      default: return <Star className="w-4 h-4 text-slate-600" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="starfield-ultra-sharp min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">Loading your mystical community...</p>
        </div>
      </div>
    );
  }

  const isGuest = !user?.uid;

  return (
    <>
      <RecaptchaScript />
      <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-8">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Mystical Community
          </h1>
          <p className="text-white text-base sm:text-lg">
            Ask better questions, share insights, and build your mystical circle.
          </p>
          {!isGuest ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-slate-900/60 px-4 py-2 text-amber-200 text-sm">
              <Bell className="w-4 h-4 text-amber-300" />
              <span>{pendingIncomingCount} pending requests</span>
              <span className="text-amber-400/70">|</span>
              <span>{newDiscussionCount} new discussions</span>
            </div>
          ) : null}
        </div>

        {isGuest ? (
          <Card className="mb-6 bg-slate-900/70 border-amber-500/25">
            <CardContent className="p-4 sm:p-5 text-sm text-amber-100/90">
              You are browsing public discussions.{" "}
              <Link href="/signin?redirect=/community/attribution" className="text-amber-400 font-medium underline underline-offset-2">
                Sign in
              </Link>{" "}
              to vote, reply, manage requests, and unlock full community features.
            </CardContent>
          </Card>
        ) : null}

        {/* Stats Overview — signed-in only (guest stats would be empty or misleading) */}
        {!isGuest ? (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-amber-50/80 border-2 border-amber-300 shadow-sm">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-amber-700 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-amber-800">
                {attribution?.totalImpact || 0}
              </h3>
              <p className="text-slate-700 text-sm font-medium">Total Impact Score</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/80 border-2 border-blue-300 shadow-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-700 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-blue-800">
                {attribution?.referralStats?.successfulSignups ?? 0}
              </h3>
              <p className="text-slate-700 text-sm font-medium">Successful Referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50/80 border-2 border-purple-300 shadow-sm">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-purple-700 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-purple-800">
                {(attribution?.contributions ?? []).filter(c => c.status === 'implemented').length}
              </h3>
              <p className="text-slate-700 text-sm font-medium">Implemented Suggestions</p>
            </CardContent>
          </Card>

          <Card className="bg-pink-50/80 border-2 border-pink-300 shadow-sm">
            <CardContent className="p-6 text-center">
              <Flame className="w-8 h-8 text-pink-700 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-pink-800">
                {communityMembers.length || 0}
              </h3>
              <p className="text-slate-700 text-sm font-medium">Active Members</p>
            </CardContent>
          </Card>
        </div>
        ) : null}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-transparent p-0 mb-8">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('members')}
            className={`flex-1 min-w-[140px] transition-all duration-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium relative overflow-hidden active:scale-[0.98] ${
              activeTab === 'members'
                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md'
                : 'text-amber-200 hover:text-amber-100 hover:bg-slate-800/30'
            }`}
          >
            <Users className={`w-4 h-4 mr-2 ${activeTab === 'members' ? 'text-amber-900' : 'text-amber-200'}`} />
            Community Members
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveTab('discussions');
              setNewDiscussionCount(0);
              localStorage.setItem('community_last_seen_discussion_at', new Date().toISOString());
            }}
            className={`flex-1 min-w-[140px] transition-all duration-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium relative overflow-hidden active:scale-[0.98] ${
              activeTab === 'discussions'
                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md'
                : 'text-amber-200 hover:text-amber-100 hover:bg-slate-800/30'
            }`}
          >
            <MessageCircle className={`w-4 h-4 mr-2 ${activeTab === 'discussions' ? 'text-amber-900' : 'text-amber-200'}`} />
            Discussions
            {!isGuest && newDiscussionCount > 0 ? (
              <Badge className="ml-2 bg-amber-500 text-slate-900">{newDiscussionCount}</Badge>
            ) : null}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveTab('requests');
              void refreshConnectionRequests();
            }}
            className={`flex-1 min-w-[140px] transition-all duration-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium relative overflow-hidden active:scale-[0.98] ${
              activeTab === 'requests'
                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md'
                : 'text-amber-200 hover:text-amber-100 hover:bg-slate-800/30'
            }`}
          >
            <Bell className={`w-4 h-4 mr-2 ${activeTab === 'requests' ? 'text-amber-900' : 'text-amber-200'}`} />
            Requests
            {!isGuest && pendingIncomingCount > 0 ? (
              <Badge className="ml-2 bg-amber-500 text-slate-900">{pendingIncomingCount}</Badge>
            ) : null}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('contributions')}
            className={`flex-1 min-w-[140px] transition-all duration-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium relative overflow-hidden active:scale-[0.98] ${
              activeTab === 'contributions'
                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md'
                : 'text-amber-200 hover:text-amber-100 hover:bg-slate-800/30'
            }`}
          >
            <Star className={`w-4 h-4 mr-2 ${activeTab === 'contributions' ? 'text-amber-900' : 'text-amber-200'}`} />
            Your Contributions
          </Button>
        </div>

        {/* Community Members Tab */}
        {activeTab === 'members' && isGuest && (
          <Card className="bg-blue-50/80 border-2 border-blue-300 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2 font-bold">
                <Users className="w-5 h-5 text-blue-700" />
                Community Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 text-sm mb-4">
                Member profiles and connections are available after you sign in.
              </p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                <Link href="/signin?redirect=/community/attribution">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'members' && !isGuest && (
          <Card className="bg-blue-50/80 border-2 border-blue-300 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2 font-bold">
                <Users className="w-5 h-5 text-blue-700" />
                Community Members
              </CardTitle>
              <p className="text-slate-700 text-sm">
                Connect with fellow mystics. Personal details are protected for privacy.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {communityMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-blue-100/60 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {member.name.charAt(0)}
                        </div>
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">{member.name}</h4>
                          {getReputationIcon(member.reputation)}
                          <Badge variant="outline" className="text-xs bg-amber-100 border-amber-400/50 text-amber-800">
                            {member.flair}
                          </Badge>
                        </div>
                        {!member.hideStats && (
                          <>
                            <div className="flex items-center gap-4 text-sm mb-1">
                              <span className="text-slate-700 font-medium">Karma: <span className="text-amber-700">{member.karma.toLocaleString()}</span></span>
                              <span className="text-slate-700">Level: <span className="font-semibold text-slate-800">{member.level}</span></span>
                              <span className="text-slate-700">Streak: <span className="text-orange-700 font-semibold">{member.streak}</span> days</span>
                            </div>
                            <div className="flex gap-2">
                              {member.badges.slice(0, 2).map((badge, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-purple-100/80 border-purple-400/40 text-purple-800">
                                  {badge}
                                </Badge>
                              ))}
                              {member.badges.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-blue-100/80 border-blue-400/40 text-blue-800">
                                  +{member.badges.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConnectionRequest(member)}
                      className="bg-amber-100 border border-amber-500/50 text-amber-800 hover:bg-amber-200/80"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <div className="mb-8">
            <Card className="bg-purple-50/80 border-2 border-purple-300 shadow-sm mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-purple-800 flex items-center gap-2 font-bold">
                      <MessageCircle className="w-5 h-5 text-purple-700" />
                      Community Discussions
                    </CardTitle>
                    <p className="text-slate-700 text-sm mt-1">
                      Follow live conversations, jump into threads, and help others with practical insight.
                    </p>
                  </div>
                  {user && (
                    <Button
                      onClick={() => {
                        setShowGuestDiscussionForm(false);
                        setShowDiscussionForm(!showDiscussionForm);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Discussion
                    </Button>
                  )}
                  {isGuest && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDiscussionForm(false);
                        setShowGuestDiscussionForm(!showGuestDiscussionForm);
                      }}
                      className="border-amber-500/50 text-amber-100 active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post as guest
                    </Button>
                  )}
                </div>
              </CardHeader>
              {showDiscussionForm && user && (
                <CardContent className="pt-0">
                  <DiscussionForm
                    onSubmit={handleCreateDiscussion}
                    onCancel={() => setShowDiscussionForm(false)}
                  />
                </CardContent>
              )}
              {showGuestDiscussionForm && isGuest && (
                <CardContent className="pt-0">
                  <GuestDiscussionForm
                    onSubmit={handleCreateGuestDiscussion}
                    onCancel={() => setShowGuestDiscussionForm(false)}
                  />
                </CardContent>
              )}
            </Card>

            <Card className="bg-purple-50/80 border-2 border-purple-300 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={discussionSort === 'lastActivityAt' ? 'default' : 'outline'}
                    onClick={() => setDiscussionSort('lastActivityAt')}
                    className={discussionSort === 'lastActivityAt' ? 'bg-purple-700 text-white active:scale-[0.98]' : 'border-purple-300 text-purple-800 active:scale-[0.98]'}
                  >
                    Hot now
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={discussionSort === 'createdAt' ? 'default' : 'outline'}
                    onClick={() => setDiscussionSort('createdAt')}
                    className={discussionSort === 'createdAt' ? 'bg-purple-700 text-white active:scale-[0.98]' : 'border-purple-300 text-purple-800 active:scale-[0.98]'}
                  >
                    Newest
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={discussionSort === 'upvotes' ? 'default' : 'outline'}
                    onClick={() => setDiscussionSort('upvotes')}
                    className={discussionSort === 'upvotes' ? 'bg-purple-700 text-white active:scale-[0.98]' : 'border-purple-300 text-purple-800 active:scale-[0.98]'}
                  >
                    Top voted
                  </Button>
                </div>
                <div className="space-y-4">
                  {discussionThreads.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-purple-700 mx-auto mb-4" />
                      <p className="text-slate-700">No discussions yet. Be the first to start one!</p>
                    </div>
                  ) : (
                    discussionThreads.map((thread) => (
                      <DiscussionCard
                        key={thread.id}
                        discussion={thread}
                        onVote={handleVote}
                        userVote={userVotes[thread.id] || null}
                        onOpenThread={openThread}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50/80 border-2 border-indigo-300 shadow-sm mt-4">
              <CardHeader>
                <CardTitle className="text-indigo-800 flex items-center gap-2 font-bold">
                  <MessageCircle className="w-5 h-5 text-indigo-700" />
                  Thread Detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                {threadLoading ? (
                  <p className="text-slate-700 text-sm">Loading thread...</p>
                ) : selectedThread ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-100/60">
                      <h3 className="font-semibold text-indigo-900 mb-2">{selectedThread.title}</h3>
                      <p className="text-slate-700 text-sm mb-2">{selectedThread.content}</p>
                      <p className="text-xs text-slate-600">
                        by {selectedThread.author} on {new Date(selectedThread.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {threadComments.length === 0 ? (
                        <p className="text-sm text-slate-700">No replies yet. Be the first to respond.</p>
                      ) : (
                        threadComments.map((comment) => (
                          <div key={comment.id} className="rounded-lg border border-indigo-200 bg-white/80 p-3">
                            <p className="text-sm text-slate-800">{comment.content}</p>
                            <p className="text-xs text-slate-600 mt-1">
                              {comment.authorName} • {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    {user?.uid ? (
                      <div className="space-y-2">
                        <Textarea
                          value={newComment}
                          onChange={(event) => setNewComment(event.target.value)}
                          placeholder="Reply to this thread..."
                          className="bg-white/80 border-2 border-indigo-300 text-slate-900 placeholder:text-slate-400"
                          rows={3}
                        />
                        <div className="hidden sm:flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setNewComment('')}
                            className="border-indigo-300 text-indigo-800"
                            disabled={!newComment.trim()}
                          >
                            Clear
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCreateComment}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                            disabled={!newComment.trim()}
                          >
                            Post Reply
                          </Button>
                        </div>
                        <div className="sm:hidden sticky bottom-0 z-10 -mx-2 px-2 py-2 bg-indigo-50/95 border-t border-indigo-200 backdrop-blur supports-[backdrop-filter]:bg-indigo-50/80">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setNewComment('')}
                              className="flex-1 border-indigo-300 text-indigo-800 active:scale-[0.98]"
                              disabled={!newComment.trim()}
                            >
                              Clear
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCreateComment}
                              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white active:scale-[0.98]"
                              disabled={!newComment.trim()}
                            >
                              Post Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-700">
                        Sign in to reply to discussions.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-700">Pick any discussion and tap "Open thread" to read and reply in one flow.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'requests' && isGuest && (
          <Card className="bg-blue-50/80 border-2 border-blue-300 shadow-sm mb-8">
            <CardContent className="pt-6">
              <p className="text-slate-700 text-sm mb-4">Sign in to manage incoming and outgoing connection requests.</p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                <Link href="/signin?redirect=/community/attribution">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'requests' && !isGuest && (
          <Card className="bg-cyan-50/80 border-2 border-cyan-300 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-cyan-800 flex items-center gap-2 font-bold">
                <Bell className="w-5 h-5 text-cyan-700" />
                Connection Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <p className="text-sm text-slate-700">Loading requests...</p>
              ) : connectionRequests.length === 0 ? (
                <p className="text-sm text-slate-700">No requests yet. Your incoming and outgoing requests will appear here.</p>
              ) : (
                <div className="space-y-3">
                  {connectionRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-cyan-200 bg-cyan-100/70 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {request.type === 'incoming' ? `${request.fromUserName} wants to connect` : `Request to ${request.toUserName}`}
                        </p>
                        <Badge className="bg-white text-cyan-800 border border-cyan-300">{request.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-1"><span className="font-medium">Topic:</span> {request.topic}</p>
                      <p className="text-sm text-slate-700 mb-3">{request.message}</p>
                      <p className="text-xs text-slate-600 mb-3">{new Date(request.createdAt).toLocaleString()}</p>
                      {request.type === 'incoming' && request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => respondToConnectionRequest(request.id, 'accept')} className="bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]">
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => respondToConnectionRequest(request.id, 'decline')} className="active:scale-[0.98]">
                            Decline
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && isGuest && (
          <Card className="bg-amber-50/80 border-2 border-amber-300 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2 font-bold">
                <Star className="w-5 h-5 text-amber-700" />
                Your Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 text-sm mb-4">
                Sign in to see your feedback history, referrals, and impact.
              </p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                <Link href="/signin?redirect=/community/attribution">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'contributions' && !isGuest && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-amber-50/80 border-2 border-amber-300 shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center gap-2 font-bold">
                  <Star className="w-5 h-5 text-amber-700" />
                  Your Contributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attribution?.contributions.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                      <p className="text-slate-700 mb-2">No contributions yet</p>
                      <p className="text-slate-700 text-sm">Start contributing to see your impact!</p>
                    </div>
                  ) : (
                    attribution?.contributions.map((contribution) => (
                      <div key={contribution.id} className="p-4 bg-amber-100/60 rounded-lg border-2 border-amber-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-amber-900">{contribution.title}</h4>
                          <Badge className={getStatusColor(contribution.status)}>
                            {contribution.status}
                          </Badge>
                        </div>
                        <p className="text-slate-700 text-sm mb-3">{contribution.description}</p>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-slate-700">Impact: <span className={getImpactColor(contribution.impact)}>{contribution.impact}</span></span>
                          <span className="text-slate-700">{new Date(contribution.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="text-green-700 font-medium">👍 {contribution.upvotes}</span>
                          <span className="text-red-700 font-medium">👎 {contribution.downvotes}</span>
                          <span className="text-blue-700 font-medium">💬 {contribution.comments}</span>
                        </div>
                        {contribution.implementedDate && (
                          <div className="mt-2 text-xs text-green-700">
                            ✅ Implemented on {new Date(contribution.implementedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50/80 border-2 border-blue-300 shadow-sm">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2 font-bold">
                  <Share2 className="w-5 h-5 text-blue-700" />
                  Referral Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-100/60 rounded-lg border-2 border-blue-200">
                      <h4 className="text-2xl font-bold text-blue-800">{attribution?.referralStats.totalInvites}</h4>
                      <p className="text-slate-700 text-sm font-medium">Total Invites</p>
                    </div>
                    <div className="text-center p-4 bg-blue-100/60 rounded-lg border-2 border-blue-200">
                      <h4 className="text-2xl font-bold text-green-800">{attribution?.referralStats.successfulSignups}</h4>
                      <p className="text-slate-700 text-sm font-medium">Successful Signups</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-100/60 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-amber-900 mb-2">Recent Activity</h4>
                    <p className="text-slate-700 text-sm">
                      Last invite: <span className="text-cyan-700 font-medium">{attribution?.referralStats.lastInviteDate ? 
                        new Date(attribution.referralStats.lastInviteDate).toLocaleDateString() : 
                        'No recent activity'}</span>
                    </p>
                    <p className="text-slate-700 text-sm">
                      Pending invites: <span className="text-purple-700 font-medium">{attribution?.referralStats.pendingInvites}</span>
                    </p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share FutureSeer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Thank you */}
        {!isGuest ? (
          <AttributionLeaderboard
            title="Community Karma Leaderboard"
            subtitle="Track top contributors and your path to the next level."
            showKarmaDelta
          />
        ) : null}

        {!isGuest ? (
          <Card className="bg-slate-900/70 border-amber-500/30 shadow-sm mt-8">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2 font-bold">
                <CalendarClock className="w-5 h-5 text-amber-300" />
                Retention + KPI Checklist (2 weeks)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-100/90 space-y-2">
              <p>Daily nudge: reply to one active thread to keep your streak moving.</p>
              <p>Track D1 return rate for community visitors.</p>
              <p>Track comments per active user.</p>
              <p>Track percentage of users with 2+ actions per session.</p>
              <p>Track connection request acceptance rate.</p>
            </CardContent>
          </Card>
        ) : null}

        <Card className="bg-pink-50/80 border-2 border-pink-300 shadow-sm mt-8 mb-8">
          <CardHeader>
            <CardTitle className="text-pink-800 flex items-center gap-2 font-bold">
              <Heart className="w-5 h-5 text-pink-700" />
              Thank you
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Thank you for being part of the FutureSeer community. Your contributions and presence here mean a lot.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connection Request Modal */}
      {showConnectionModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-blue-50/80 border-2 border-blue-300 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-blue-800 flex items-center gap-2 font-bold">
                <UserPlus className="w-5 h-5 text-blue-700" />
                Connect with {selectedMember.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConnectionModal(false)}
                className="text-gray-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-100/60 rounded-lg border-2 border-blue-200">
                <p className="text-slate-700 text-sm mb-2">
                  <strong className="text-cyan-700">Privacy Note:</strong> Your personal details will only be shared if {selectedMember.name} accepts your request.
                </p>
                <div className="text-xs text-slate-700">
                  <p>• Your message will be sent privately</p>
                  <p>• {selectedMember.name} can choose to accept or decline</p>
                  <p>• Contact details are only shared upon mutual agreement</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-blue-700 mb-2 block">
                  Topic of Interest *
                </label>
                <Input
                  value={connectionRequest.topic}
                  onChange={(e) => setConnectionRequest({ ...connectionRequest, topic: e.target.value })}
                  placeholder="e.g., Vedic Astrology, Tarot Reading, etc."
                  className="bg-white/80 border-2 border-blue-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-blue-700 mb-2 block">
                  Message *
                </label>
                <Textarea
                  value={connectionRequest.message}
                  onChange={(e) => setConnectionRequest({ ...connectionRequest, message: e.target.value })}
                  placeholder="Introduce yourself and explain why you'd like to connect..."
                  className="bg-white/80 border-2 border-blue-300 text-slate-900 placeholder:text-slate-400"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConnectionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendConnectionRequest}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </>
  );
} 