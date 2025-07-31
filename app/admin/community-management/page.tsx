"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users, MessageCircle, Star, Zap, Filter, Search, Flag, Archive, Pin, Crown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

interface CommunityStats {
  totalDiscussions: number;
  activeDiscussions: number;
  criticalIssues: number;
  highPriorityRequests: number;
  averageEngagement: number;
  topCategories: { category: string; count: number }[];
}

export default function CommunityManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState<DiscussionThread[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionThread | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionData, setActionData] = useState({ priority: '', status: '', notes: '', action: '' });
  const [filters, setFilters] = useState({ category: '', priority: '', status: '', search: '' });
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const mockDiscussions: DiscussionThread[] = [
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
      ];

      setDiscussions(mockDiscussions);
      setFilteredDiscussions(mockDiscussions);

      setStats({
        totalDiscussions: mockDiscussions.length,
        activeDiscussions: mockDiscussions.filter(d => d.status === 'active').length,
        criticalIssues: mockDiscussions.filter(d => d.priority === 'critical').length,
        highPriorityRequests: mockDiscussions.filter(d => d.priority === 'high').length,
        averageEngagement: Math.round(mockDiscussions.reduce((acc, d) => acc + d.upvotes + d.comments, 0) / mockDiscussions.length),
        topCategories: [
          { category: 'vedic', count: 1 },
          { category: 'tarot', count: 1 },
          { category: 'numerology', count: 1 },
          { category: 'palmistry', count: 1 },
          { category: 'dream-analysis', count: 1 }
        ]
      });

      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = discussions;

    if (filters.category) {
      filtered = filtered.filter(d => d.category === filters.category);
    }
    if (filters.priority) {
      filtered = filtered.filter(d => d.priority === filters.priority);
    }
    if (filters.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.content.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.author.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredDiscussions(filtered);
  }, [discussions, filters]);

  const handleAction = (discussion: DiscussionThread) => {
    setSelectedDiscussion(discussion);
    setActionData({
      priority: discussion.priority,
      status: discussion.status,
      notes: discussion.adminNotes || '',
      action: ''
    });
    setShowActionModal(true);
  };

  const saveAction = () => {
    if (!selectedDiscussion) return;

    setDiscussions(prev => prev.map(d => {
      if (d.id === selectedDiscussion.id) {
        return {
          ...d,
          priority: actionData.priority as any,
          status: actionData.status as any,
          adminNotes: actionData.notes,
          actionRequired: actionData.action === 'resolve' ? false : d.actionRequired
        };
      }
      return d;
    }));

    toast({
      title: "Action Saved! ✅",
      description: `Updated discussion: ${selectedDiscussion.title}`,
    });

    setShowActionModal(false);
    setSelectedDiscussion(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">Loading community management dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user?.isSuperadmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Card className="w-96 bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-200 mb-2">Admin Access Required</h2>
            <p className="text-gray-400 mb-4">You need superadmin privileges to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Community Management Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor discussions, prioritize actions, and manage community engagement
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-blue-200">{stats?.totalDiscussions}</h3>
              <p className="text-gray-400">Total Discussions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-red-200">{stats?.criticalIssues}</h3>
              <p className="text-gray-400">Critical Issues</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-200">{stats?.averageEngagement}</h3>
              <p className="text-gray-400">Avg Engagement</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-purple-200">{stats?.activeDiscussions}</h3>
              <p className="text-gray-400">Active Discussions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search discussions..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="vedic">Vedic Astrology</SelectItem>
                    <SelectItem value="tarot">Tarot</SelectItem>
                    <SelectItem value="numerology">Numerology</SelectItem>
                    <SelectItem value="palmistry">Palmistry</SelectItem>
                    <SelectItem value="dream-analysis">Dream Analysis</SelectItem>
                    <SelectItem value="angel-numbers">Angel Numbers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussions List */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Community Discussions ({filteredDiscussions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDiscussions.map((discussion) => (
                <div key={discussion.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-amber-200">{discussion.title}</h3>
                        {discussion.isHot && <TrendingUp className="w-4 h-4 text-red-400" />}
                        {discussion.isSticky && <Pin className="w-4 h-4 text-yellow-400" />}
                        {discussion.actionRequired && <Flag className="w-4 h-4 text-orange-400" />}
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{discussion.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span>by {discussion.author}</span>
                        <span>{new Date(discussion.date).toLocaleDateString()}</span>
                        <span>👍 {discussion.upvotes}</span>
                        <span>👎 {discussion.downvotes}</span>
                        <span>💬 {discussion.comments}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs bg-slate-700/50">
                          {discussion.category}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(discussion.priority)}`}>
                          {discussion.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(discussion.status)}`}>
                          {discussion.status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAction(discussion)}
                      className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-200 hover:from-amber-500/30 hover:to-yellow-500/30"
                      size="sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Take Action
                    </Button>
                  </div>
                  {discussion.adminNotes && (
                    <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-xs text-amber-300 font-medium mb-1">Admin Notes:</p>
                      <p className="text-xs text-amber-200">{discussion.adminNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedDiscussion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Take Action: {selectedDiscussion.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                  <Select value={actionData.priority} onValueChange={(value) => setActionData({ ...actionData, priority: value })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Status</label>
                  <Select value={actionData.status} onValueChange={(value) => setActionData({ ...actionData, status: value })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Action Type</label>
                <Select value={actionData.action} onValueChange={(value) => setActionData({ ...actionData, action: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolve">Mark as Resolved</SelectItem>
                    <SelectItem value="pin">Pin Discussion</SelectItem>
                    <SelectItem value="archive">Archive Discussion</SelectItem>
                    <SelectItem value="feature">Feature in App</SelectItem>
                    <SelectItem value="investigate">Investigate Further</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Admin Notes</label>
                <Textarea
                  value={actionData.notes}
                  onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                  placeholder="Add notes about this discussion..."
                  className="bg-slate-800/50 border-slate-600 text-gray-300"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowActionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveAction}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Action
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 