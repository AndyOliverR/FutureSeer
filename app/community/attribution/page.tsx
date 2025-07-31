"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Users, Star, Heart, Share2, MessageCircle, UserPlus, Eye, EyeOff, Send, X, ArrowUp, ArrowDown, Award, Flame, Crown, Sparkles, Zap, Moon, Sun } from 'lucide-react';
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
}

interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  date: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  category: 'astrology' | 'tarot' | 'numerology' | 'palmistry' | 'dream-analysis' | 'angel-numbers' | 'vedic' | 'western' | 'kabbalah' | 'iching' | 'runes' | 'lenormand' | 'geomancy' | 'horary' | 'synastry' | 'medical' | 'financial' | 'mundane' | 'bazi' | 'kp' | 'vaastu' | 'face-reading' | 'general';
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

  useEffect(() => {
    // Simulate loading user attribution data
    setTimeout(() => {
      setAttribution({
        contributions: [
          {
            id: '1',
            type: 'suggestion',
            title: 'Hamburger Menu Toggle',
            description: 'Make hamburger icon a toggle instead of requiring external click to close',
            status: 'implemented',
            impact: 'high',
            date: '2025-01-15',
            implementedDate: '2025-01-20',
            upvotes: 45,
            downvotes: 2,
            comments: 12
          },
          {
            id: '2',
            type: 'feature-request',
            title: 'User Feedback Attribution',
            description: 'Add attribution system for user contributions',
            status: 'implemented',
            impact: 'high',
            date: '2025-01-10',
            implementedDate: '2025-01-25',
            upvotes: 67,
            downvotes: 1,
            comments: 18
          },
          {
            id: '3',
            type: 'suggestion',
            title: 'Referral Sharing Mechanism',
            description: 'Add share app functionality with tracking',
            status: 'in-progress',
            impact: 'medium',
            date: '2025-01-12',
            upvotes: 23,
            downvotes: 3,
            comments: 8
          }
        ],
        referralStats: {
          totalInvites: 5,
          successfulSignups: 3,
          pendingInvites: 2,
          lastInviteDate: '2025-01-18'
        },
        totalImpact: 8,
        thankYouMessages: [
          "Thank you for helping make FutureSeer better! ✨",
          "Your feedback directly improved the user experience 🌟",
          "You're part of our mystical community's growth 🔮"
        ]
      });

      // Simulate community members data with Reddit-inspired features
      setCommunityMembers([
        {
          id: '1',
          name: 'Sarah Johnson',
          contributions: 12,
          impact: 15,
          joinDate: '2024-11-15',
          lastActive: '2025-01-25',
          interests: ['Astrology', 'Tarot', 'Numerology'],
          isOnline: true,
          karma: 2847,
          flair: '🔮 Tarot Master',
          badges: ['Early Adopter', 'Helpful', 'Verified Mystic'],
          level: 'Master',
          streak: 15,
          reputation: 'Legendary'
        },
        {
          id: '2',
          name: 'Mike Chen',
          contributions: 8,
          impact: 12,
          joinDate: '2024-12-01',
          lastActive: '2025-01-24',
          interests: ['Vedic Astrology', 'Palmistry'],
          isOnline: false,
          karma: 1567,
          flair: '🌙 Vedic Sage',
          badges: ['Contributor', 'Knowledgeable'],
          level: 'Adept',
          streak: 8,
          reputation: 'Trusted'
        },
        {
          id: '3',
          name: 'Emma Davis',
          contributions: 15,
          impact: 20,
          joinDate: '2024-10-20',
          lastActive: '2025-01-25',
          interests: ['Western Astrology', 'Dream Analysis'],
          isOnline: true,
          karma: 3421,
          flair: '⭐ Astrology Expert',
          badges: ['Top Contributor', 'Community Pillar', 'Mystical Guide'],
          level: 'Grandmaster',
          streak: 23,
          reputation: 'Mystical'
        },
        {
          id: '4',
          name: 'Alex Rodriguez',
          contributions: 6,
          impact: 9,
          joinDate: '2024-12-10',
          lastActive: '2025-01-23',
          interests: ['Kabbalah', 'Angel Numbers'],
          isOnline: false,
          karma: 892,
          flair: '✨ Kabbalah Student',
          badges: ['Newcomer', 'Curious'],
          level: 'Apprentice',
          streak: 5,
          reputation: 'Respected'
        },
        {
          id: '5',
          name: 'Priya Patel',
          contributions: 18,
          impact: 25,
          joinDate: '2024-09-15',
          lastActive: '2025-01-25',
          interests: ['Vedic Astrology', 'Gemstones', 'Mantras'],
          isOnline: true,
          karma: 4123,
          flair: '💎 Gemstone Guru',
          badges: ['Founding Member', 'Wisdom Keeper', 'Mystical Elder'],
          level: 'Grandmaster',
          streak: 31,
          reputation: 'Mystical'
        }
      ]);

      // Simulate discussion threads focused on FutureSeer tools
      setDiscussionThreads([
        {
          id: '1',
          title: 'Vedic Astrology predictions accuracy - Career guidance success stories',
          content: 'I\'ve been using the Vedic Astrology tool and it predicted my career change with incredible accuracy. The planetary positions analysis was spot-on! Anyone else have similar experiences with career guidance?',
          author: 'Emma Davis',
          authorId: '3',
          date: '2025-01-25',
          upvotes: 156,
          downvotes: 3,
          comments: 42,
          category: 'vedic',
          priority: 'high',
          status: 'active',
          isHot: true,
          isSticky: false,
          actionRequired: true,
          adminNotes: 'High engagement - consider adding more Vedic career guidance features'
        },
        {
          id: '2',
          title: 'Tarot Reading Tips: How to interpret FutureSeer\'s AI-generated spreads',
          content: 'As a tarot master, I wanted to share tips for interpreting FutureSeer\'s AI-generated tarot spreads. The key is to focus on your intention and trust your intuition while using the AI insights...',
          author: 'Sarah Johnson',
          authorId: '1',
          date: '2025-01-24',
          upvotes: 89,
          downvotes: 1,
          comments: 23,
          category: 'tarot',
          priority: 'medium',
          status: 'active',
          isHot: false,
          isSticky: true
        },
        {
          id: '3',
          title: 'Numerology vs Angel Numbers: Which FutureSeer tool gives better insights?',
          content: 'I\'ve been comparing the Numerology tool with Angel Numbers. Both are fascinating but serve different purposes. Numerology gives deeper life path insights while Angel Numbers provide daily guidance...',
          author: 'Alex Rodriguez',
          authorId: '4',
          date: '2025-01-23',
          upvotes: 67,
          downvotes: 2,
          comments: 18,
          category: 'numerology',
          priority: 'medium',
          status: 'active',
          isHot: false,
          isSticky: false
        },
        {
          id: '4',
          title: 'Palmistry Reading Accuracy - Lines interpretation feedback',
          content: 'The palmistry tool is amazing! The AI correctly identified my life line and heart line patterns. Has anyone else found the palm reading feature to be accurate?',
          author: 'Priya Patel',
          authorId: '5',
          date: '2025-01-22',
          upvotes: 45,
          downvotes: 1,
          comments: 12,
          category: 'palmistry',
          priority: 'low',
          status: 'active',
          isHot: false,
          isSticky: false
        },
        {
          id: '5',
          title: 'Dream Analysis Tool: Symbol interpretation accuracy',
          content: 'The dream analysis feature helped me understand recurring symbols in my dreams. The AI interpretation was surprisingly accurate and provided deep psychological insights...',
          author: 'Mike Chen',
          authorId: '2',
          date: '2025-01-21',
          upvotes: 34,
          downvotes: 0,
          comments: 8,
          category: 'dream-analysis',
          priority: 'low',
          status: 'active',
          isHot: false,
          isSticky: false
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleConnectionRequest = (member: CommunityMember) => {
    setSelectedMember(member);
    setShowConnectionModal(true);
  };

  const sendConnectionRequest = () => {
    if (!connectionRequest.topic.trim() || !connectionRequest.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both topic and message",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Connection Request Sent! 📤",
      description: `Your request has been sent to ${selectedMember?.name}`,
    });

    setShowConnectionModal(false);
    setConnectionRequest({ topic: '', message: '' });
    setSelectedMember(null);
  };

  const handleVote = (threadId: string, voteType: 'up' | 'down') => {
    setDiscussionThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          upvotes: voteType === 'up' ? thread.upvotes + 1 : thread.upvotes,
          downvotes: voteType === 'down' ? thread.downvotes + 1 : thread.downvotes
        };
      }
      return thread;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'under-review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'declined': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Grandmaster': return 'text-purple-400';
      case 'Master': return 'text-red-400';
      case 'Adept': return 'text-blue-400';
      case 'Apprentice': return 'text-green-400';
      case 'Novice': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getReputationIcon = (reputation: string) => {
    switch (reputation) {
      case 'Mystical': return <Crown className="w-4 h-4 text-purple-400" />;
      case 'Legendary': return <Flame className="w-4 h-4 text-red-400" />;
      case 'Trusted': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'Respected': return <Sparkles className="w-4 h-4 text-blue-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">Loading your mystical community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Mystical Community
          </h1>
          <p className="text-gray-400 text-lg">
            Connect, share, and grow with fellow mystics
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-amber-200">{attribution?.totalImpact}</h3>
              <p className="text-gray-400">Total Impact Score</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-blue-200">{attribution?.referralStats.successfulSignups}</h3>
              <p className="text-gray-400">Successful Referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-purple-200">{attribution?.contributions.filter(c => c.status === 'implemented').length}</h3>
              <p className="text-gray-400">Implemented Suggestions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <Flame className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-red-200">{communityMembers.length}</h3>
              <p className="text-gray-400">Active Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 mb-8">
          <Button
            variant={activeTab === 'members' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('members')}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Community Members
          </Button>
          <Button
            variant={activeTab === 'discussions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('discussions')}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Discussions
          </Button>
          <Button
            variant={activeTab === 'contributions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('contributions')}
            className="flex-1"
          >
            <Star className="w-4 h-4 mr-2" />
            Your Contributions
          </Button>
        </div>

        {/* Community Members Tab */}
        {activeTab === 'members' && (
          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Members
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Connect with fellow mystics. Personal details are protected for privacy.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {communityMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
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
                          <h4 className="font-semibold text-amber-200">{member.name}</h4>
                          {getReputationIcon(member.reputation)}
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30">
                            {member.flair}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-1">
                          <span>Karma: {member.karma.toLocaleString()}</span>
                          <span className={getLevelColor(member.level)}>Level: {member.level}</span>
                          <span>Streak: {member.streak} days</span>
                        </div>
                        <div className="flex gap-2">
                          {member.badges.slice(0, 2).map((badge, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-slate-700/50">
                              {badge}
                            </Badge>
                          ))}
                          {member.badges.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-slate-700/50">
                              +{member.badges.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConnectionRequest(member)}
                      className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-200 hover:from-amber-500/30 hover:to-yellow-500/30"
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
          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Community Discussions
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Share insights, ask questions, and learn from fellow mystics.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discussionThreads.map((thread) => (
                  <div key={thread.id} className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    {/* Voting */}
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(thread.id, 'up')}
                        className="text-gray-400 hover:text-green-400"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-semibold text-amber-200">{thread.upvotes - thread.downvotes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(thread.id, 'down')}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-amber-200">{thread.title}</h3>
                        {thread.isHot && <Flame className="w-4 h-4 text-red-400" />}
                        {thread.isSticky && <Award className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{thread.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>by {thread.author}</span>
                          <span>{new Date(thread.date).toLocaleDateString()}</span>
                          <span>{thread.comments} comments</span>
                        </div>
                                                 <div className="flex gap-1">
                           <Badge variant="outline" className="text-xs bg-slate-700/50">
                             {thread.category}
                           </Badge>
                           <Badge variant="outline" className={`text-xs ${
                             thread.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                             thread.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                             thread.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                             'bg-green-500/20 text-green-400 border-green-500/30'
                           }`}>
                             {thread.priority}
                           </Badge>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Your Contributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attribution?.contributions.map((contribution) => (
                    <div key={contribution.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-amber-200">{contribution.title}</h4>
                        <Badge className={getStatusColor(contribution.status)}>
                          {contribution.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{contribution.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Impact: <span className={getImpactColor(contribution.impact)}>{contribution.impact}</span></span>
                        <span>{new Date(contribution.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>👍 {contribution.upvotes}</span>
                        <span>👎 {contribution.downvotes}</span>
                        <span>💬 {contribution.comments}</span>
                      </div>
                      {contribution.implementedDate && (
                        <div className="mt-2 text-xs text-green-400">
                          ✅ Implemented on {new Date(contribution.implementedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Referral Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <h4 className="text-2xl font-bold text-blue-200">{attribution?.referralStats.totalInvites}</h4>
                      <p className="text-gray-400 text-sm">Total Invites</p>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <h4 className="text-2xl font-bold text-green-200">{attribution?.referralStats.successfulSignups}</h4>
                      <p className="text-gray-400 text-sm">Successful Signups</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-amber-200 mb-2">Recent Activity</h4>
                    <p className="text-gray-400 text-sm">
                      Last invite: {attribution?.referralStats.lastInviteDate ? 
                        new Date(attribution.referralStats.lastInviteDate).toLocaleDateString() : 
                        'No recent activity'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Pending invites: {attribution?.referralStats.pendingInvites}
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

        {/* Thank You Messages */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Thank You Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attribution?.thankYouMessages.map((message, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-amber-400" />
                  <p className="text-gray-300">{message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Request Modal */}
      {showConnectionModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-900/95 backdrop-blur-sm border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Connect with {selectedMember.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConnectionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Privacy Note:</strong> Your personal details will only be shared if {selectedMember.name} accepts your request.
                </p>
                <div className="text-xs text-gray-400">
                  <p>• Your message will be sent privately</p>
                  <p>• {selectedMember.name} can choose to accept or decline</p>
                  <p>• Contact details are only shared upon mutual agreement</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Topic of Interest *
                </label>
                <Input
                  value={connectionRequest.topic}
                  onChange={(e) => setConnectionRequest({ ...connectionRequest, topic: e.target.value })}
                  placeholder="e.g., Vedic Astrology, Tarot Reading, etc."
                  className="bg-slate-800/50 border-slate-600 text-gray-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Message *
                </label>
                <Textarea
                  value={connectionRequest.message}
                  onChange={(e) => setConnectionRequest({ ...connectionRequest, message: e.target.value })}
                  placeholder="Introduce yourself and explain why you'd like to connect..."
                  className="bg-slate-800/50 border-slate-600 text-gray-300"
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