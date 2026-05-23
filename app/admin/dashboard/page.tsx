"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, Search, Eye, ChevronRight, CheckSquare, Square, Trash2, Shield, Users, Activity, AlertTriangle, Route } from 'lucide-react';
import Link from 'next/link';
import { getPricingHealthSnapshot } from '@/lib/pricingConfig';

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Firebase custom claims payload for admin API */
type AdminClaimsPayload = Record<string, unknown>;

interface AdminUserRow {
  uid: string;
  email: string;
  displayName?: string;
  claims: Record<string, boolean | undefined>;
  profileComplete?: boolean;
  mysticalReady?: boolean;
  activeToday?: boolean;
  lastSeenAt?: string | null;
  lastSeenRoute?: string | null;
  subscriptionStatus?: string | null;
  profileStatus?: string | null;
}

function formatLastSeenShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FunnelYesNo({ value }: { value: boolean | undefined }) {
  if (value === true) {
    return <span className="text-emerald-400 font-medium">Yes</span>;
  }
  if (value === false) {
    return <span className="text-slate-500">No</span>;
  }
  return <span className="text-slate-500">—</span>;
}

interface AuditLogRow {
  id: string;
  timestamp: string | number;
  action?: string;
  performedBy?: string;
  targetUser?: string;
  details?: unknown;
  ipAddress?: string;
}

async function updateUserClaims(uid: string, claims: AdminClaimsPayload, idToken: string) {
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

async function fetchUsersWithClaimsApi(
  idToken: string,
  pageToken?: string,
  searchEmail?: string,
  freshToken?: () => Promise<string>
) {
  if (!idToken?.trim()) throw new Error('Not signed in');
  const params = new URLSearchParams();
  if (pageToken) params.append('pageToken', pageToken);
  if (searchEmail) params.append('email', searchEmail);
  let res = await fetch(`/api/admin/list-users?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${idToken}` },
  });
  let data = await res.json();
  if (res.status === 401 && freshToken) {
    const token = await freshToken();
    res = await fetch(`/api/admin/list-users?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    data = await res.json();
  }
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

async function performBulkAction(
  action: string,
  userIds: string[],
  idToken: string,
  claims?: AdminClaimsPayload,
  reason?: string
) {
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

async function fetchAuditLogs(
  idToken: string,
  filters?: Record<string, string>,
  freshToken?: () => Promise<string>
): Promise<{ logs: AuditLogRow[] }> {
  if (!idToken?.trim()) throw new Error('Not signed in');
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
  }
  let response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  if (response.status === 401 && freshToken) {
    const token = await freshToken();
    response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }
  return response.json() as Promise<{ logs: AuditLogRow[] }>;
}

function UserManagement({ adminToken, getToken }: { adminToken: string | null; getToken: () => Promise<string> }) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
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

  const fetchUsers = useCallback(
    async (token: string, pageToken?: string, searchEmail?: string) => {
      setLoading(true);
      try {
        const data = await fetchUsersWithClaimsApi(token, pageToken, searchEmail, getToken);
        setUsers(data.users);
        setNextPageToken(data.nextPageToken);
      } catch (e: unknown) {
        toast({ title: 'Error', description: getErrorMessage(e), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    },
    [getToken, toast]
  );

  useEffect(() => {
    if (!adminToken?.trim()) {
      setLoading(false);
      return;
    }
    void fetchUsers(adminToken, undefined, search);
  }, [adminToken, search, fetchUsers]);

  const handleToggle = async (uid: string, claimKey: string, value: boolean) => {
    setUpdating((u) => ({ ...u, [uid]: true }));
    // Optimistic update
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, claims: { ...u.claims, [claimKey]: value } } : u));
    try {
      const userObj = users.find((u) => u.uid === uid);
      if (!userObj) throw new Error('User not found');
      const idToken = await getToken();
      if (!idToken?.trim()) throw new Error('Not signed in');
      await updateUserClaims(uid, { ...userObj.claims, [claimKey]: value }, idToken);
      toast({ title: 'Success', description: `Updated ${claimKey} for ${userObj.email}` });
    } catch (e: unknown) {
      // Rollback on error
      setUsers((prev) => prev.map((user) => user.uid === uid ? { ...user, claims: { ...user.claims, [claimKey]: !value } } : user));
      toast({ title: 'Error', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setUpdating((u) => ({ ...u, [uid]: false }));
    }
  };

  const handleNextPage = async () => {
    const idToken = await getToken();
    if (!idToken?.trim()) return;
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
      const idToken = await getToken();
      if (!idToken?.trim()) throw new Error('Not signed in');
      const result = await impersonateUser(targetUid, idToken);
      
      // Store the impersonation token in localStorage for the frontend to use
      localStorage.setItem('impersonationToken', result.customToken);
      localStorage.setItem('impersonatedUser', JSON.stringify(result.targetUser));
      
      toast({ 
        title: 'Impersonation Ready', 
        description: `You can now sign in as ${targetEmail}. Use the token in your auth system.` 
      });
    } catch (e: unknown) {
      toast({ title: 'Error', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setImpersonating(prev => ({ ...prev, [targetUid]: false }));
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const idToken = await getToken();
      if (!idToken?.trim()) throw new Error('Not signed in');
      await exportUsers(format, idToken, []);
      toast({ 
        title: 'Export Successful', 
        description: `Users exported as ${format.toUpperCase()}` 
      });
    } catch (e: unknown) {
      toast({ title: 'Export Failed', description: getErrorMessage(e), variant: 'destructive' });
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

  const handleBulkAction = async (action: string, claims?: AdminClaimsPayload) => {
    if (selectedUsers.size === 0) return;
    
    setBulkActioning(true);
    try {
      const idToken = await getToken();
      if (!idToken?.trim()) throw new Error('Not signed in');
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
    } catch (e: unknown) {
      toast({ title: 'Bulk Action Failed', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setBulkActioning(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-slate-300">Loading users...</div>;

  return (
    <Card className="admin-card text-slate-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-slate-200">User Management</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 border-slate-500 text-slate-200 hover:bg-slate-800"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              onClick={() => handleExport('json')}
              disabled={exporting}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 border-slate-500 text-slate-200 hover:bg-slate-800"
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
            className="flex-1 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
          />
          <Button type="submit" size="sm" className="flex items-center gap-2 border-slate-500 text-slate-200 hover:bg-slate-800">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </form>

        {showBulkActions && (
          <div className="mb-4 p-3 bg-slate-800/80 border border-slate-600 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-200">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBulkAction('updateClaims', { support: true })}
                  disabled={bulkActioning}
                  size="sm"
                  variant="outline"
                  className="border-slate-500 text-slate-200 hover:bg-slate-800"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Make Support
                </Button>
                <Button
                  onClick={() => handleBulkAction('updateClaims', { admin: true })}
                  disabled={bulkActioning}
                  size="sm"
                  variant="outline"
                  className="border-slate-500 text-slate-200 hover:bg-slate-800"
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

        <p className="mt-1 mb-1 hidden text-xs text-slate-400 md:block">
          Scroll horizontally to view all permission toggles.
        </p>

        <div className="mt-1 max-h-[60vh] overflow-x-auto overflow-y-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200">
                <th className="sticky left-0 z-10 bg-slate-800/80 p-2 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-4 h-4 text-slate-200"
                  >
                    {selectedUsers.size === users.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="sticky left-10 z-10 bg-slate-800/80 p-2 min-w-[12rem]">Email</th>
                <th className="sticky left-[14.5rem] z-10 bg-slate-800/80 p-2 min-w-[8rem]">Display Name</th>
                <th className="p-2 min-w-[4.5rem]">Profile</th>
                <th className="p-2 min-w-[4.5rem]">Mystical</th>
                <th className="p-2 min-w-[4.5rem]">Today</th>
                <th className="p-2 min-w-[9rem] border-r border-slate-600 shadow-[2px_0_4px_0_rgba(0,0,0,0.2)]">Last seen</th>
                <th className="p-2">Superadmin</th>
                <th className="p-2">Admin</th>
                <th className="p-2">Support</th>
                <th className="p-2">User Mgmt</th>
                <th className="p-2">Logs</th>
                <th className="p-2">Code Editor</th>
                <th className="p-2">Billing</th>
                <th className="p-2">Feature Flags</th>
                <th className="p-2">Data Export</th>
                <th className="p-2">Special user</th>
                <th className="p-2">Impersonate</th>
                <th className="p-2">Delete User</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-slate-700/60 last:border-0">
                  <td className="sticky left-0 z-10 bg-slate-900 p-2 w-10">
                    <button
                      onClick={() => handleSelectUser(user.uid)}
                      className="flex items-center justify-center w-4 h-4 text-slate-200"
                    >
                      {selectedUsers.has(user.uid) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="sticky left-10 z-10 bg-slate-900 p-2 min-w-[12rem] font-mono">{user.email}</td>
                  <td className="sticky left-[14.5rem] z-10 bg-slate-900 p-2 min-w-[8rem]">{user.displayName}</td>
                  <td className="p-2 text-center">
                    <FunnelYesNo value={user.profileComplete} />
                  </td>
                  <td className="p-2 text-center">
                    <FunnelYesNo value={user.mysticalReady} />
                  </td>
                  <td className="p-2 text-center">
                    <FunnelYesNo value={user.activeToday} />
                  </td>
                  <td className="p-2 text-xs text-slate-400 border-r border-slate-700/60 min-w-[9rem]">
                    <div>{formatLastSeenShort(user.lastSeenAt)}</div>
                    {user.lastSeenRoute && (
                      <div className="truncate max-w-[8rem] text-slate-500" title={user.lastSeenRoute}>
                        {user.lastSeenRoute}
                      </div>
                    )}
                  </td>
                  {['superadmin','admin','support','userManagement','logs','codeEditor','billing','featureFlags','dataExport','specialUser','impersonate','deleteUser'].map((claim) => (
                    <td className="p-2 text-center" key={claim}>
                      <Switch
                        checked={!!user.claims[claim]}
                        disabled={updating[user.uid] || (claim === 'superadmin' && !user.claims.superadmin)}
                        onCheckedChange={(val) => handleToggle(user.uid, claim, val)}
                      />
                    </td>
                  ))}
                  <td className="p-2 space-x-2">
                    <Button size="sm" variant="outline" asChild className="border-slate-500 text-slate-200 hover:bg-slate-800">
                      <Link href={`/admin/users/${user.uid}`} className="flex items-center gap-1">
                        <Route className="w-3 h-3" />
                        Journey
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleImpersonate(user.uid, user.email)}
                      disabled={impersonating[user.uid] || !user.claims.impersonate}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 border-slate-500 text-slate-200 hover:bg-slate-800"
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
          <p className="text-sm text-slate-300">
            Showing {users.length} users
            {nextPageToken && ` (more available)`}
          </p>
          <div className="flex gap-2">
            {nextPageToken && (
              <Button
                onClick={handleNextPage}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 border-slate-500 text-slate-200 hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
                Next Page
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800/80 border border-slate-600 rounded-lg">
          <p className="text-sm text-slate-300">
            <strong className="text-slate-200">Features:</strong> Live user data, real-time permission toggles, search, pagination, 
            impersonation, and export functionality. All changes update Firebase immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Logs({ adminToken, getToken }: { adminToken: string | null; getToken: () => Promise<string> }) {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    const idToken = await getToken();
    if (!idToken?.trim()) return;
    setLoading(true);
    try {
      const data = await fetchAuditLogs(idToken, filters, getToken);
      setLogs(data.logs);
    } catch (e: unknown) {
      toast({ title: 'Error', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [getToken, filters, toast]);

  useEffect(() => {
    if (!adminToken?.trim()) {
      setLoading(false);
      return;
    }
    void fetchLogs();
  }, [adminToken, fetchLogs]);

  if (loading) return <div className="p-4 text-center text-slate-300">Loading logs...</div>;

  return (
    <Card className="admin-card text-slate-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-slate-200">Audit Logs</CardTitle>
          <Button onClick={fetchLogs} size="sm" variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-800">
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
            className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
          />
          <Input
            placeholder="Filter by user ID..."
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
          />
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200">
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
                <tr key={log.id} className="border-b border-slate-700/60 last:border-0 text-slate-300">
                  <td className="p-2 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="border-slate-500 text-slate-200">{log.action}</Badge>
                  </td>
                  <td className="p-2 font-mono">{log.performedBy}</td>
                  <td className="p-2 font-mono">{log.targetUser}</td>
                  <td className="p-2">
                    <pre className="text-xs bg-slate-800/80 text-slate-300 p-1 rounded border border-slate-600">
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
          <p className="text-center text-slate-400 mt-4">No logs found</p>
        )}
      </CardContent>
    </Card>
  );
}

function SupportTools() {
  return (
    <Card className="admin-card text-slate-200">
      <CardHeader><CardTitle className="text-sm font-medium text-slate-200">Support Tools</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">
          Read support tickets and feedback here. Respond to users from Support Desk.
        </p>
        <p className="text-sm text-slate-400">
          Public community: <Link href="/community/attribution" className="text-amber-200/90 hover:underline">/community/attribution</Link> — Manage discussions: Community Management below.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/support">
            <Button variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-800">
              Support Desk
            </Button>
          </Link>
          <Link href="/admin/feedback">
            <Button variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-800">
              Feedback
            </Button>
          </Link>
          <Link href="/admin/community-management">
            <Button variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-800">
              Community Management
            </Button>
          </Link>
          <Link href="/admin/security">
            <Button variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-800">
              Security
            </Button>
          </Link>
          <Link href="/admin/social-posts">
            <Button variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-800">
              Social post generator
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Billing({ adminToken, getToken }: { adminToken: string | null; getToken: () => Promise<string> }) {
  const [subscriptions, setSubscriptions] = useState<Array<{ uid: string; email?: string; displayName?: string; subscriptionStatus?: string; nextBillingDate?: unknown; subscriptionId?: string; lastPaymentId?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);
  const { toast } = useToast();

  const fetchBilling = useCallback(async () => {
    const token = await getToken();
    if (!token?.trim()) {
      setLoading(false);
      setError('Not signed in');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let res = await fetch('/api/admin/billing', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        const fresh = await getToken();
        res = await fetch('/api/admin/billing', { headers: { Authorization: `Bearer ${fresh}` } });
      }
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
  }, [getToken, toast]);

  useEffect(() => {
    if (!adminToken?.trim()) {
      setLoading(false);
      return;
    }
    void fetchBilling();
  }, [adminToken, fetchBilling]);

  const handleCancel = async (userId: string) => {
    setCancelling(userId);
    try {
      const token = await getToken();
      if (!token?.trim()) throw new Error('Not signed in');
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
    if (!refundPaymentId.trim()) return;
    setRefunding(true);
    try {
      const token = await getToken();
      if (!token?.trim()) throw new Error('Not signed in');
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

  if (loading) return <Card className="admin-card"><CardContent className="p-8 text-center text-slate-300">Loading billing...</CardContent></Card>;
  if (error) return <Card className="admin-card"><CardContent className="p-8 text-center text-red-400">{error}</CardContent></Card>;

  return (
    <Card className="admin-card text-slate-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-slate-200">Subscriptions & Refunds</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setRefundModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white border-0">
          Issue Refund
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200">
                <th className="p-2">Email</th>
                <th className="p-2">Status</th>
                <th className="p-2">Next Billing</th>
                <th className="p-2">Subscription ID</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-slate-400">No subscriptions found.</td></tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.uid} className="border-b border-slate-700/60">
                    <td className="p-2 text-slate-300">{s.email ?? s.uid}</td>
                    <td className="p-2 text-slate-300">{s.subscriptionStatus ?? '—'}</td>
                    <td className="p-2 text-slate-400">{s.nextBillingDate != null ? String(s.nextBillingDate) : '—'}</td>
                    <td className="p-2 font-mono text-xs text-slate-500">{s.subscriptionId ?? '—'}</td>
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
            <Card className="admin-card w-full max-w-md text-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-200">Issue Refund</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setRefundModal(false); setRefundPaymentId(''); setRefundAmount(''); }} className="text-slate-300">Close</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 block mb-1">Payment ID (required)</label>
                  <Input value={refundPaymentId} onChange={(e) => setRefundPaymentId(e.target.value)} placeholder="pay_xxx" className="bg-slate-800 border-slate-600 text-slate-200" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 block mb-1">Amount (optional, partial refund)</label>
                  <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Leave empty for full refund" className="bg-slate-800 border-slate-600 text-slate-200" />
                </div>
                <Button onClick={handleRefund} disabled={refunding || !refundPaymentId.trim()} className="bg-amber-600 hover:bg-amber-700 text-white border-0">
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

function PricingHealthPanel() {
  const snapshot = getPricingHealthSnapshot();
  const failing = snapshot.filter((row) => !row.isValid);
  const { toast } = useToast();

  const handleCopySnapshot = async () => {
    const lines = snapshot.map((row) =>
      [
        row.countryCode,
        row.currency,
        row.monthlyWebNet.toFixed(2),
        row.isValid ? "ok" : `review: ${row.issues.join(" | ")}`,
      ].join("\t")
    );
    const payload = ["country\tcurrency\tmonthlyWebNet\tstatus", ...lines].join("\n");
    try {
      await navigator.clipboard.writeText(payload);
      toast({ title: "Copied", description: "Pricing health snapshot copied to clipboard." });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: error instanceof Error ? error.message : "Unable to copy pricing snapshot.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="admin-card text-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-slate-200">Pricing Health Snapshot</CardTitle>
          <Button
            onClick={handleCopySnapshot}
            size="sm"
            variant="outline"
            className="border-slate-500 text-slate-200 hover:bg-slate-800"
          >
            Copy snapshot
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">
          Countries checked: {snapshot.length} • Validation issues: {failing.length}
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200">
                <th className="p-2">Country</th>
                <th className="p-2">Currency</th>
                <th className="p-2">Monthly Net (Web)</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.map((row) => (
                <tr key={row.countryCode} className="border-b border-slate-700/60">
                  <td className="p-2">{row.countryCode}</td>
                  <td className="p-2">{row.currency}</td>
                  <td className="p-2">{row.monthlyWebNet.toFixed(2)}</td>
                  <td className="p-2">
                    {row.isValid ? (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-300">ok</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/50 text-amber-300" title={row.issues.join(' | ')}>
                        review
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user, isSuperadmin, isAdmin, loading } = useAuth();
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      void Promise.resolve().then(() => setAdminToken(null));
      return;
    }
    void user.getIdToken().then((t) => setAdminToken(t && t.trim() ? t : null));
  }, [user]);

  const getToken = useCallback(async () => {
    if (!user) return '';
    return await user.getIdToken(true);
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-300">Loading...</div>;
  if (!isSuperadmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="admin-card border-slate-600/80 text-slate-200">
          <CardHeader><CardTitle className="text-sm font-medium text-slate-200">Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto pt-8">
        <h1 className="text-xl font-semibold text-slate-200 mb-6">Admin Dashboard</h1>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4 w-full flex-wrap gap-1 bg-slate-900/90 border border-slate-600 rounded-lg p-1 sm:flex-nowrap">
            <TabsTrigger value="users" className="text-sm text-slate-400 hover:text-slate-200 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 data-[state=active]:border data-[state=active]:border-slate-600 data-[state=active]:rounded-md">Users</TabsTrigger>
            <TabsTrigger value="logs" className="text-sm text-slate-400 hover:text-slate-200 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 data-[state=active]:border data-[state=active]:border-slate-600 data-[state=active]:rounded-md">Logs</TabsTrigger>
            <TabsTrigger value="billing" className="text-sm text-slate-400 hover:text-slate-200 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 data-[state=active]:border data-[state=active]:border-slate-600 data-[state=active]:rounded-md">Billing</TabsTrigger>
            <TabsTrigger value="pricing-health" className="text-sm text-slate-400 hover:text-slate-200 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 data-[state=active]:border data-[state=active]:border-slate-600 data-[state=active]:rounded-md">Pricing Health</TabsTrigger>
            <TabsTrigger value="support" className="text-sm text-slate-400 hover:text-slate-200 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 data-[state=active]:border data-[state=active]:border-slate-600 data-[state=active]:rounded-md">Support Tools</TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 data-[state=active]:border data-[state=active]:border-slate-600 data-[state=active]:rounded-md">
              <AlertTriangle className="w-3 h-3" />
              <span>Errors</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users"><UserManagement adminToken={adminToken} getToken={getToken} /></TabsContent>
          <TabsContent value="logs"><Logs adminToken={adminToken} getToken={getToken} /></TabsContent>
          <TabsContent value="billing"><Billing adminToken={adminToken} getToken={getToken} /></TabsContent>
          <TabsContent value="pricing-health"><PricingHealthPanel /></TabsContent>
          <TabsContent value="support"><SupportTools /></TabsContent>
          <TabsContent value="errors">
            <Card className="admin-card text-slate-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-200">Recent errors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  View a detailed list of recent errors, with simple explanations and copyable details, on the errors page.
                </p>
                <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white border-0">
                  <Link href="/admin/errors">Open error dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 