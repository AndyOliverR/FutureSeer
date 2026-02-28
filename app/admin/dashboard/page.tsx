"use client"

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, Search, UserCheck, Eye, ChevronLeft, ChevronRight, CheckSquare, Square, Trash2, Shield, Users, Activity, Settings, FileText, Filter } from 'lucide-react';
import Link from 'next/link';

async function updateUserClaims(uid: string, claims: any, idToken: string) {
  const res = await fetch('/api/admin/set-claims', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uid, claims }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update claims');
  return data;
}

async function fetchUsersWithClaimsApi(idToken: string, pageToken?: string, searchEmail?: string) {
  const params = new URLSearchParams();
  if (pageToken) params.append('pageToken', pageToken);
  if (searchEmail) params.append('email', searchEmail);
  const res = await fetch(`/api/admin/list-users?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${idToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
  return data;
}

async function impersonateUser(targetUid: string, idToken: string) {
  const response = await fetch('/api/admin/impersonate', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ targetUid })
  });
  
  if (!response.ok) {
    throw new Error('Failed to impersonate user');
  }
  
  return response.json();
}

async function exportUsers(format: 'json' | 'csv', idToken: string, fields: string[] = []) {
  const params = new URLSearchParams();
  params.append('format', format);
  if (fields.length > 0) {
    params.append('fields', fields.join(','));
  }
  
  const response = await fetch(`/api/admin/export-users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to export users');
  }
  
  if (format === 'csv') {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

async function performBulkAction(action: string, userIds: string[], idToken: string, claims?: any, reason?: string) {
  const response = await fetch('/api/admin/bulk-actions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ action, userIds, claims, reason })
  });
  
  if (!response.ok) {
    throw new Error('Failed to perform bulk action');
  }
  
  return response.json();
}

async function fetchAuditLogs(idToken: string, filters?: any) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
  }
  
  const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }
  
  return response.json();
}

function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [uid: string]: boolean }>({});
  const [impersonating, setImpersonating] = useState<{ [uid: string]: boolean }>({});
  const [exporting, setExporting] = useState(false);
  const [bulkActioning, setBulkActioning] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { toast } = useToast();

  // Get the current user's ID token for secure API calls
  async function getIdToken() {
    if (!user) return '';
    return await user.getIdToken();
  }

  const fetchUsers = async (token: string, pageToken?: string, searchEmail?: string) => {
    setLoading(true);
    try {
      const data = await fetchUsersWithClaimsApi(token, pageToken, searchEmail);
      setUsers(data.users);
      setNextPageToken(data.nextPageToken);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIdToken().then((token) => {
      fetchUsers(token, undefined, search);
    });
    // eslint-disable-next-line
  }, [search]);

  const handleToggle = async (uid: string, claimKey: string, value: boolean) => {
    setUpdating((u) => ({ ...u, [uid]: true }));
    // Optimistic update
    setUsers((prev) => prev.map((user) => user.uid === uid ? { ...user, claims: { ...user.claims, [claimKey]: value } } : user));
    try {
      const userObj = users.find((u) => u.uid === uid);
      const idToken = await getIdToken();
      await updateUserClaims(uid, { ...userObj.claims, [claimKey]: value }, idToken);
      toast({ title: 'Success', description: `Updated ${claimKey} for ${userObj.email}` });
    } catch (e: any) {
      // Rollback on error
      setUsers((prev) => prev.map((user) => user.uid === uid ? { ...user, claims: { ...user.claims, [claimKey]: !value } } : user));
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setUpdating((u) => ({ ...u, [uid]: false }));
    }
  };

  const handleNextPage = async () => {
    const idToken = await getIdToken();
    fetchUsers(idToken, nextPageToken, search);
    setPageToken(nextPageToken);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPageToken(undefined);
  };

  const handleImpersonate = async (targetUid: string, targetEmail: string) => {
    setImpersonating(prev => ({ ...prev, [targetUid]: true }));
    try {
      const idToken = await getIdToken();
      const result = await impersonateUser(targetUid, idToken);
      
      // Store the impersonation token in localStorage for the frontend to use
      localStorage.setItem('impersonationToken', result.customToken);
      localStorage.setItem('impersonatedUser', JSON.stringify(result.targetUser));
      
      toast({ 
        title: 'Impersonation Ready', 
        description: `You can now sign in as ${targetEmail}. Use the token in your auth system.` 
      });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setImpersonating(prev => ({ ...prev, [targetUid]: false }));
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const idToken = await getIdToken();
      await exportUsers(format, idToken, []);
      toast({ 
        title: 'Export Successful', 
        description: `Users exported as ${format.toUpperCase()}` 
      });
    } catch (e: any) {
      toast({ title: 'Export Failed', description: e.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleSelectUser = (uid: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(uid)) {
      newSelected.delete(uid);
    } else {
      newSelected.add(uid);
    }
    setSelectedUsers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedUsers(new Set(users.map(u => u.uid)));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: string, claims?: any) => {
    if (selectedUsers.size === 0) return;
    
    setBulkActioning(true);
    try {
      const idToken = await getIdToken();
      const userIds = Array.from(selectedUsers);
      const result = await performBulkAction(action, userIds, idToken, claims);
      
      toast({ 
        title: 'Bulk Action Successful', 
        description: `${result.results.success.length} users updated successfully` 
      });
      
      // Refresh the user list
      fetchUsers(idToken, pageToken, search);
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } catch (e: any) {
      toast({ title: 'Bulk Action Failed', description: e.message, variant: 'destructive' });
    } finally {
      setBulkActioning(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-amber-200">Loading users...</div>;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-amber-400">User Management</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              onClick={() => handleExport('json')}
              disabled={exporting}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export JSON'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <Input
            type="text"
            placeholder="Search by email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
          />
          <Button type="submit" size="sm" className="flex items-center gap-2 border-amber-500/50 text-amber-200">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </form>

        {showBulkActions && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-200">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBulkAction('updateClaims', { support: true })}
                  disabled={bulkActioning}
                  size="sm"
                  variant="outline"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Make Support
                </Button>
                <Button
                  onClick={() => handleBulkAction('updateClaims', { admin: true })}
                  disabled={bulkActioning}
                  size="sm"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Make Admin
                </Button>
                <Button
                  onClick={() => handleBulkAction('disableUsers')}
                  disabled={bulkActioning}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Disable Users
                </Button>
                <Button
                  onClick={() => setSelectedUsers(new Set())}
                  size="sm"
                  variant="ghost"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-amber-200/90">
                <th className="p-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-4 h-4 text-amber-200"
                  >
                    {selectedUsers.size === users.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-2">Email</th>
                <th className="p-2">Display Name</th>
                <th className="p-2">Superadmin</th>
                <th className="p-2">Admin</th>
                <th className="p-2">Support</th>
                <th className="p-2">User Mgmt</th>
                <th className="p-2">Logs</th>
                <th className="p-2">Code Editor</th>
                <th className="p-2">Billing</th>
                <th className="p-2">Feature Flags</th>
                <th className="p-2">Data Export</th>
                <th className="p-2">Impersonate</th>
                <th className="p-2">Delete User</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-slate-700 last:border-0">
                  <td className="p-2">
                    <button
                      onClick={() => handleSelectUser(user.uid)}
                      className="flex items-center justify-center w-4 h-4 text-amber-200"
                    >
                      {selectedUsers.has(user.uid) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-2 font-mono">{user.email}</td>
                  <td className="p-2">{user.displayName}</td>
                  {['superadmin','admin','support','userManagement','logs','codeEditor','billing','featureFlags','dataExport','impersonate','deleteUser'].map((claim) => (
                    <td className="p-2 text-center" key={claim}>
                      <Switch
                        checked={!!user.claims[claim]}
                        disabled={updating[user.uid] || (claim === 'superadmin' && !user.claims.superadmin)}
                        onCheckedChange={(val) => handleToggle(user.uid, claim, val)}
                      />
                    </td>
                  ))}
                  <td className="p-2 space-x-2">
                    <Button
                      onClick={() => handleImpersonate(user.uid, user.email)}
                      disabled={impersonating[user.uid] || !user.claims.impersonate}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
                    >
                      <Eye className="w-3 h-3" />
                      {impersonating[user.uid] ? 'Impersonating...' : 'Impersonate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-white/80">
            Showing {users.length} users
            {nextPageToken && ` (more available)`}
          </p>
          <div className="flex gap-2">
            {nextPageToken && (
              <Button
                onClick={handleNextPage}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 border-amber-500/50 text-amber-200"
              >
                <ChevronRight className="w-4 h-4" />
                Next Page
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-200">
            <strong>Features:</strong> Live user data, real-time permission toggles, search, pagination, 
            impersonation, and export functionality. All changes update Firebase immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Logs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const { toast } = useToast();

  async function getIdToken() {
    if (!user) return '';
    return await user.getIdToken();
  }

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const idToken = await getIdToken();
      const data = await fetchAuditLogs(idToken, filters);
      setLogs(data.logs);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  if (loading) return <div className="p-4 text-center text-amber-200">Loading logs...</div>;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-amber-400">Audit Logs</CardTitle>
          <Button onClick={fetchLogs} size="sm" variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20">
            <Activity className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <Input
            placeholder="Filter by action..."
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
          />
          <Input
            placeholder="Filter by user ID..."
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
          />
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-amber-200/90">
                <th className="p-2">Timestamp</th>
                <th className="p-2">Action</th>
                <th className="p-2">Performed By</th>
                <th className="p-2">Target User</th>
                <th className="p-2">Details</th>
                <th className="p-2">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 text-white/90">
                  <td className="p-2 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-200">{log.action}</Badge>
                  </td>
                  <td className="p-2 font-mono">{log.performedBy}</td>
                  <td className="p-2 font-mono">{log.targetUser}</td>
                  <td className="p-2">
                    <pre className="text-xs bg-slate-700/80 text-gray-200 p-1 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                  <td className="p-2 font-mono text-xs">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {logs.length === 0 && (
          <p className="text-center text-amber-200 mt-4">No logs found</p>
        )}
      </CardContent>
    </Card>
  );
}

function CodeEditor() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90">
      <CardHeader><CardTitle className="text-amber-400">Code Editor</CardTitle></CardHeader>
      <CardContent>
        <p className="text-white/80">Edit app files or content here. (Coming soon, advanced feature!)</p>
      </CardContent>
    </Card>
  );
}

function AppSettings() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90">
      <CardHeader><CardTitle className="text-amber-400">App Settings</CardTitle></CardHeader>
      <CardContent>
        <p className="text-white/80">Manage feature flags, environment variables, and more. (Coming soon)</p>
      </CardContent>
    </Card>
  );
}

function SupportTools() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90">
      <CardHeader><CardTitle className="text-amber-400">Support Tools</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/80">
          Read support tickets and feedback here. Respond to users from Support Desk.
        </p>
        <p className="text-sm text-white/70">
          Public community: <Link href="/community/attribution" className="text-amber-300 hover:underline">/community/attribution</Link> — Manage discussions: Community Management below.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/support">
            <Button variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20">
              Support Desk
            </Button>
          </Link>
          <Link href="/admin/feedback">
            <Button variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20">
              Feedback
            </Button>
          </Link>
          <Link href="/admin/community-management">
            <Button variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20">
              Community Management
            </Button>
          </Link>
          <Link href="/admin/security">
            <Button variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20">
              Security
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Billing() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Array<{ uid: string; email?: string; displayName?: string; subscriptionStatus?: string; nextBillingDate?: unknown; subscriptionId?: string; lastPaymentId?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);
  const { toast } = useToast();

  const fetchBilling = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/billing', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.subscriptions)) setSubscriptions(data.subscriptions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to load billing', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBilling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCancel = async (userId: string) => {
    if (!user) return;
    setCancelling(userId);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/cancel-user-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }
      toast({ title: 'Success', description: 'Subscription cancelled' });
      fetchBilling();
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally {
      setCancelling(null);
    }
  };

  const handleRefund = async () => {
    if (!user || !refundPaymentId.trim()) return;
    setRefunding(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentId: refundPaymentId.trim(), amount: refundAmount ? Number(refundAmount) : undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }
      toast({ title: 'Success', description: 'Refund initiated' });
      setRefundModal(false);
      setRefundPaymentId('');
      setRefundAmount('');
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally {
      setRefunding(false);
    }
  };

  if (loading) return <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90"><CardContent className="p-8 text-center text-amber-200">Loading billing...</CardContent></Card>;
  if (error) return <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90"><CardContent className="p-8 text-center text-red-400">{error}</CardContent></Card>;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-amber-400">Subscriptions & Refunds</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setRefundModal(true)} className="border-amber-500/50 text-amber-200">
          Issue Refund
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2 text-amber-200">Email</th>
                <th className="p-2 text-amber-200">Status</th>
                <th className="p-2 text-amber-200">Next Billing</th>
                <th className="p-2 text-amber-200">Subscription ID</th>
                <th className="p-2 text-amber-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-gray-400">No subscriptions found.</td></tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.uid} className="border-b border-slate-700">
                    <td className="p-2 text-white/90">{s.email ?? s.uid}</td>
                    <td className="p-2">{s.subscriptionStatus ?? '—'}</td>
                    <td className="p-2 text-gray-400">{s.nextBillingDate != null ? String(s.nextBillingDate) : '—'}</td>
                    <td className="p-2 font-mono text-xs text-gray-500">{s.subscriptionId ?? '—'}</td>
                    <td className="p-2">
                      {s.subscriptionStatus === 'active' && s.subscriptionId && (
                        <Button size="sm" variant="outline" disabled={cancelling === s.uid} onClick={() => handleCancel(s.uid)} className="border-red-500/50 text-red-200">
                          {cancelling === s.uid ? 'Cancelling...' : 'Cancel subscription'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {refundModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-amber-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Issue Refund</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setRefundModal(false); setRefundPaymentId(''); setRefundAmount(''); }}>Close</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Payment ID (required)</label>
                  <Input value={refundPaymentId} onChange={(e) => setRefundPaymentId(e.target.value)} placeholder="pay_xxx" className="bg-slate-800 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Amount (optional, partial refund)</label>
                  <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Leave empty for full refund" className="bg-slate-800 text-white" />
                </div>
                <Button onClick={handleRefund} disabled={refunding || !refundPaymentId.trim()} className="bg-amber-600 hover:bg-amber-700">
                  {refunding ? 'Processing...' : 'Submit Refund'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { isSuperadmin, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-amber-200">Loading...</div>;
  if (!isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 text-white/90">
          <CardHeader><CardTitle className="text-amber-400">Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p className="text-white/80">You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 starfield-ultra-sharp">
      <div className="max-w-5xl mx-auto pt-20">
        <h1 className="text-4xl font-bold mb-8 text-amber-300">Admin Dashboard</h1>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4 bg-slate-800/90 border border-amber-500/30 rounded-xl p-1 text-amber-200">
            <TabsTrigger value="users" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Users</TabsTrigger>
            <TabsTrigger value="logs" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Logs</TabsTrigger>
            <TabsTrigger value="billing" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Billing</TabsTrigger>
            <TabsTrigger value="code" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Code Editor</TabsTrigger>
            <TabsTrigger value="settings" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Settings</TabsTrigger>
            <TabsTrigger value="support" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Support Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="users"><UserManagement /></TabsContent>
          <TabsContent value="logs"><Logs /></TabsContent>
          <TabsContent value="billing"><Billing /></TabsContent>
          <TabsContent value="code"><CodeEditor /></TabsContent>
          <TabsContent value="settings"><AppSettings /></TabsContent>
          <TabsContent value="support"><SupportTools /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 