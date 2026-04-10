"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, TrendingUp, Users, MessageCircle, Zap, Filter, Search, Flag, Pin } from 'lucide-react';
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
  category: 'astrology' | 'tarot' | 'numerology' | 'palmistry' | 'dream-analysis' | 'angel-numbers' | 'vedic' | 'western' | 'kabbalah' | 'iching' | 'runes' | 'lenormand' | 'geomancy' | 'horary' | 'synastry' | 'medical' | 'financial' | 'bazi' | 'kp' | 'vaastu' | 'face-reading' | 'general';
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
  const { isSuperadmin, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState<DiscussionThread[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionThread | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionData, setActionData] = useState({ priority: '', status: '', notes: '', action: '' });
  const [filters, setFilters] = useState({ category: 'all', priority: 'all', status: 'all', search: '' });
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin && !isSuperadmin) {
      setLoading(false);
      return;
    }
    const fetchDiscussions = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch('/api/community/discussions?status=active&limit=50');
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.success || !Array.isArray(data.discussions)) {
          setDiscussions([]);
          setFilteredDiscussions([]);
          setStats({
            totalDiscussions: 0,
            activeDiscussions: 0,
            criticalIssues: 0,
            highPriorityRequests: 0,
            averageEngagement: 0,
            topCategories: []
          });
          setLoading(false);
          return;
        }
        const list: DiscussionThread[] = data.discussions.map((d: Record<string, unknown>) => {
          const createdAt = d.createdAt as string | undefined;
          const dateStr = createdAt ? (createdAt.slice ? createdAt.slice(0, 10) : new Date(createdAt).toISOString().slice(0, 10)) : '';
          return {
            id: String(d.id ?? ''),
            title: String(d.title ?? ''),
            content: String(d.content ?? ''),
            author: String(d.authorName ?? d.author ?? ''),
            authorId: String(d.userId ?? d.authorId ?? ''),
            date: dateStr,
            upvotes: Number(d.upvotes ?? 0),
            downvotes: Number(d.downvotes ?? 0),
            comments: Number(d.commentCount ?? d.comments ?? 0),
            category: (d.category as DiscussionThread['category']) ?? 'general',
            priority: (d.priority as DiscussionThread['priority']) ?? 'medium',
            status: (d.status as DiscussionThread['status']) ?? 'active',
            isHot: Boolean(d.isHot),
            isSticky: Boolean(d.isSticky),
            adminNotes: d.adminNotes as string | undefined,
            actionRequired: Boolean(d.actionRequired)
          };
        });
        setDiscussions(list);
        setFilteredDiscussions(list);
        const active = list.filter(d => d.status === 'active');
        const totalEngagement = list.reduce((acc, d) => acc + d.upvotes + d.comments, 0);
        const categoryCounts: Record<string, number> = {};
        list.forEach(d => {
          categoryCounts[d.category] = (categoryCounts[d.category] ?? 0) + 1;
        });
        setStats({
          totalDiscussions: list.length,
          activeDiscussions: active.length,
          criticalIssues: list.filter(d => d.priority === 'critical').length,
          highPriorityRequests: list.filter(d => d.priority === 'high').length,
          averageEngagement: list.length ? Math.round(totalEngagement / list.length) : 0,
          topCategories: Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load discussions';
        setFetchError(msg);
        setDiscussions([]);
        setFilteredDiscussions([]);
        setStats({
          totalDiscussions: 0,
          activeDiscussions: 0,
          criticalIssues: 0,
          highPriorityRequests: 0,
          averageEngagement: 0,
          topCategories: []
        });
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussions();
  }, [isAdmin, isSuperadmin, toast]);

  useEffect(() => {
    let filtered = discussions;

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(d => d.category === filters.category);
    }
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(d => d.priority === filters.priority);
    }
    if (filters.status && filters.status !== 'all') {
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
          priority: actionData.priority as DiscussionThread['priority'],
          status: actionData.status as DiscussionThread['status'],
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading community management dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSuperadmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="admin-card max-w-md text-slate-200">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-sm font-medium text-slate-200 mb-2">Admin Access Required</CardTitle>
            <p className="text-slate-300 text-sm">You need admin or superadmin privileges to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-8">
        <Button asChild type="button" variant="outline" size="sm" className="mb-6 text-xs">
          <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
        </Button>
        <h1 className="text-xl font-semibold text-slate-200 mb-2">Community Management Dashboard</h1>
        <p className="text-slate-400 text-sm mb-6">
          Monitor discussions, prioritize actions, and manage community engagement
        </p>

        {fetchError && (
          <div className="mb-6 admin-card border-red-500/50 p-4 text-red-300 text-sm">
            {fetchError}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="admin-card text-slate-200">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-blue-200">{stats?.totalDiscussions}</h3>
              <p className="text-slate-400 text-sm">Total Discussions</p>
            </CardContent>
          </Card>

          <Card className="admin-card text-slate-200">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-red-200">{stats?.criticalIssues}</h3>
              <p className="text-slate-400 text-sm">Critical Issues</p>
            </CardContent>
          </Card>

          <Card className="admin-card text-slate-200">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-green-200">{stats?.averageEngagement}</h3>
              <p className="text-slate-400 text-sm">Avg Engagement</p>
            </CardContent>
          </Card>

          <Card className="admin-card text-slate-200">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-purple-200">{stats?.activeDiscussions}</h3>
              <p className="text-slate-400 text-sm">Active Discussions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="admin-card mb-8 text-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search discussions..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-slate-800 border-slate-600 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
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
                <label className="text-sm font-medium text-slate-300 mb-2 block">Priority</label>
                <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
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
        <Card className="admin-card text-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Community Discussions ({filteredDiscussions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDiscussions.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No discussions yet.</p>
                </div>
              ) : (
              filteredDiscussions.map((discussion) => (
                <div key={discussion.id} className="p-4 bg-slate-800/80 rounded-lg border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-slate-200">{discussion.title}</h3>
                        {discussion.isHot && <TrendingUp className="w-4 h-4 text-red-400" />}
                        {discussion.isSticky && <Pin className="w-4 h-4 text-yellow-400" />}
                        {discussion.actionRequired && <Flag className="w-4 h-4 text-orange-400" />}
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{discussion.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
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
                      className="border-slate-500 text-slate-200 hover:bg-slate-800"
                      size="sm"
                      variant="outline"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Take Action
                    </Button>
                  </div>
                  {discussion.adminNotes && (
                    <div className="mt-3 p-3 bg-slate-800/80 rounded-lg border border-slate-600">
                      <p className="text-xs text-slate-300 font-medium mb-1">Admin Notes:</p>
                      <p className="text-xs text-slate-300">{discussion.adminNotes}</p>
                    </div>
                  )}
                </div>
              ))
            )
            }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedDiscussion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="admin-card w-full max-w-2xl text-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Take Action: {selectedDiscussion.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Priority</label>
                  <Select value={actionData.priority} onValueChange={(value) => setActionData({ ...actionData, priority: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
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
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Status</label>
                  <Select value={actionData.status} onValueChange={(value) => setActionData({ ...actionData, status: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
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
                <label className="text-sm font-medium text-slate-300 mb-2 block">Action Type</label>
                <Select value={actionData.action} onValueChange={(value) => setActionData({ ...actionData, action: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
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
                <label className="text-sm font-medium text-slate-300 mb-2 block">Admin Notes</label>
                <Textarea
                  value={actionData.notes}
                  onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                  placeholder="Add notes about this discussion..."
                  className="bg-slate-800 border-slate-600 text-slate-200"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 border-slate-500 text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveAction}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-0"
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