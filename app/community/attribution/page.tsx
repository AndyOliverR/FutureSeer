"use client";

import { useState, useEffect } from 'react';
import { devLog } from '@/lib/devLogger';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Users, Star, Heart, Share2, MessageCircle, UserPlus, Eye, EyeOff, Send, X, ArrowUp, ArrowDown, Award, Flame, Crown, Sparkles, Zap, Moon, Sun, Plus } from 'lucide-react';
import { DiscussionCard } from '@/components/community/DiscussionCard';
import { DiscussionForm } from '@/components/community/DiscussionForm';
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

interface ConnectionRequest {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}

interface UserAttribution {
  contributions: UserContribution[];
  referralStats: ReferralStats;
  totalImpact: number;
  thankYouMessages: string[];
}

export default function CommunityAttributionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attribution, setAttribution] = useState<UserAttribution | null>(null);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [discussionThreads, setDiscussionThreads] = useState<DiscussionThread[]>([]);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [connectionRequest, setConnectionRequest] = useState({ topic: '', message: '' });
  const [activeTab, setActiveTab] = useState<'members' | 'discussions' | 'contributions'>('members');
  const [loading, setLoading] = useState(true);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadCommunityData();
  }, [user]);

  const LOAD_TIMEOUT_MS = 10000; // Don't block the page forever if a request hangs

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
        return null;
      });

      const membersPromise = fetch('/api/community/members?limit=50').then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        return data.success ? data.members : null;
      }).catch(() => null);

      const discussionsPromise = fetch('/api/community/discussions?status=active&limit=20').then(async (r) => {
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

      const [_, membersData, discussionsData, attributionData] = await Promise.all([
        autoJoinPromise,
        membersPromise,
        discussionsPromise,
        attributionPromise,
      ]);

      if (membersData?.length) {
        setCommunityMembers(membersData.map((m: any) => ({
          id: m.userId || m.id,
          name: m.name,
          contributions: m.contributions || 0,
          impact: m.karma || 0,
          joinDate: m.joinDate,
          lastActive: m.lastActive,
          interests: m.interests || [],
          isOnline: m.isOnline || false,
          karma: m.karma || 0,
          flair: m.flair || '',
          badges: m.badges || [],
          level: m.level || 'Novice',
          streak: m.streak || 0,
          reputation: m.reputation || 'Respected',
          hideStats: m.hideStats === true,
        })));
      }

      if (discussionsData?.length) {
        setDiscussionThreads(discussionsData.map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          author: d.authorName,
          authorId: d.authorId,
          date: d.createdAt,
          upvotes: d.upvotes || 0,
          downvotes: d.downvotes || 0,
          comments: d.commentCount || 0,
          category: d.category,
          priority: d.priority || 'medium',
          status: d.status,
          isHot: d.isHot || false,
          isSticky: d.isSticky || false,
        })));

        // Load user votes in background so we don't block first paint
        const votePromises = discussionsData.map(async (d: any) => {
          try {
            const voteResponse = await fetch(`/api/community/votes?userId=${uid}&discussionId=${d.id}`);
            if (!voteResponse.ok) return null;
            const voteData = await voteResponse.json();
            if (voteData.success && voteData.hasVoted) {
              return { discussionId: d.id, voteType: voteData.voteType };
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
    } catch (error: any) {
      devLog.error('Error sending connection request:', error, 'page');
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
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
      // Optimistic update
      setDiscussionThreads(prev => prev.map(thread => {
        if (thread.id === threadId) {
          const currentVote = (thread as any).userVote;
          let upvoteDelta = 0;
          let downvoteDelta = 0;

          if (currentVote === voteType) {
            // Remove vote
            upvoteDelta = voteType === 'up' ? -1 : 0;
            downvoteDelta = voteType === 'down' ? -1 : 0;
            (thread as any).userVote = null;
          } else if (currentVote) {
            // Switch vote
            upvoteDelta = voteType === 'up' ? 1 : -1;
            downvoteDelta = voteType === 'down' ? 1 : -1;
            (thread as any).userVote = voteType;
          } else {
            // New vote
            upvoteDelta = voteType === 'up' ? 1 : 0;
            downvoteDelta = voteType === 'down' ? 1 : 0;
            (thread as any).userVote = voteType;
          }

          return {
            ...thread,
            upvotes: Math.max(0, thread.upvotes + upvoteDelta),
            downvotes: Math.max(0, thread.downvotes + downvoteDelta)
          };
        }
        return thread;
      }));

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
    } catch (error: any) {
      devLog.error('Error creating discussion:', error, 'page');
      toast({
        title: "Error",
        description: error.message || "Failed to create discussion",
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Grandmaster': return 'text-purple-700';
      case 'Master': return 'text-red-700';
      case 'Adept': return 'text-blue-700';
      case 'Apprentice': return 'text-green-700';
      case 'Novice': return 'text-slate-700';
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

  if (loading) {
    return (
      <div className="starfield-ultra-sharp min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">Loading your mystical community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="starfield-ultra-sharp min-h-screen flex items-center justify-center">
        <Card className="w-96 bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-200 mb-2">Join the Community</h2>
            <p className="text-gray-400 mb-4">Sign in to see your contributions and connect with others</p>
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Mystical Community
          </h1>
          <p className="text-white text-lg">
            Connect, share, and grow with fellow mystics
          </p>
        </div>

        {/* Stats Overview */}
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
                {attribution?.referralStats.successfulSignups || 0}
              </h3>
              <p className="text-slate-700 text-sm font-medium">Successful Referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50/80 border-2 border-purple-300 shadow-sm">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-purple-700 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-purple-800">
                {attribution?.contributions.filter(c => c.status === 'implemented').length || 0}
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

        {/* Tabs */}
        <div className="flex space-x-2 bg-transparent p-0 mb-8">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('members')}
            className={`flex-1 transition-all duration-300 rounded-xl px-4 py-2.5 text-sm font-medium relative overflow-hidden ${
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
            onClick={() => setActiveTab('discussions')}
            className={`flex-1 transition-all duration-300 rounded-xl px-4 py-2.5 text-sm font-medium relative overflow-hidden ${
              activeTab === 'discussions'
                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md'
                : 'text-amber-200 hover:text-amber-100 hover:bg-slate-800/30'
            }`}
          >
            <MessageCircle className={`w-4 h-4 mr-2 ${activeTab === 'discussions' ? 'text-amber-900' : 'text-amber-200'}`} />
            Discussions
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('contributions')}
            className={`flex-1 transition-all duration-300 rounded-xl px-4 py-2.5 text-sm font-medium relative overflow-hidden ${
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
        {activeTab === 'members' && (
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
                      Share insights, ask questions, and learn from fellow mystics.
                    </p>
                  </div>
                  {user && (
                    <Button
                      onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Discussion
                    </Button>
                  )}
                </div>
              </CardHeader>
              {showDiscussionForm && (
                <CardContent className="pt-0">
                  <DiscussionForm
                    onSubmit={handleCreateDiscussion}
                    onCancel={() => setShowDiscussionForm(false)}
                  />
                </CardContent>
              )}
            </Card>

            <Card className="bg-purple-50/80 border-2 border-purple-300 shadow-sm">
              <CardContent className="pt-6">
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
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && (
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
  );
} 