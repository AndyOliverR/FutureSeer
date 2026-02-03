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
import { Header } from '@/components/header';

// Dummy user data for scaffolding
const dummyUsers = [
  {
    uid: '1',
    email: 'you@example.com',
    displayName: 'You (Superadmin)',
    claims: { superadmin: true, admin: true, support: true, userManagement: true, logs: true, codeEditor: true, billing: true, featureFlags: true, dataExport: true, impersonate: true, deleteUser: true },
  },
  {
    uid: '2',
    email: 'admin@example.com',
    displayName: 'Admin User',
    claims: { admin: true, support: true, userManagement: false, logs: true, codeEditor: false, billing: false, featureFlags: false, dataExport: false, impersonate: false, deleteUser: false },
  },
  {
    uid: '3',
    email: 'support@example.com',
    displayName: 'Support Staff',
    claims: { admin: true, support: true, userManagement: false, logs: false, codeEditor: false, billing: false, featureFlags: false, dataExport: false, impersonate: false, deleteUser: false },
  },
];

// TODO: Replace with real fetch from Firestore/Firebase Auth
async function fetchUsersWithClaims() {
  // Example: fetch from a secure API route or directly from Firebase Admin SDK (server-side)
  // For now, return dummy data
  return [
    {
      uid: '1',
      email: 'you@example.com',
      displayName: 'You (Superadmin)',
      claims: { superadmin: true, admin: true, support: true, userManagement: true, logs: true, codeEditor: true, billing: true, featureFlags: true, dataExport: true, impersonate: true, deleteUser: true },
    },
    {
      uid: '2',
      email: 'admin@example.com',
      displayName: 'Admin User',
      claims: { admin: true, support: true, userManagement: false, logs: true, codeEditor: false, billing: false, featureFlags: false, dataExport: false, impersonate: false, deleteUser: false },
    },
    {
      uid: '3',
      email: 'support@example.com',
      displayName: 'Support Staff',
      claims: { admin: true, support: true, userManagement: false, logs: false, codeEditor: false, billing: false, featureFlags: false, dataExport: false, impersonate: false, deleteUser: false },
    },
  ];
}

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

  if (loading) return <div className="p-4 text-center">Loading users...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>User Management</CardTitle>
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
            className="flex-1"
          />
          <Button type="submit" size="sm" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </form>

        {showBulkActions && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
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
              <tr>
                <th className="p-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-4 h-4"
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
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="border-b last:border-0">
                  <td className="p-2">
                    <button
                      onClick={() => handleSelectUser(user.uid)}
                      className="flex items-center justify-center w-4 h-4"
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
                      className="flex items-center gap-1"
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
          <p className="text-sm text-gray-500">
            Showing {users.length} users
            {nextPageToken && ` (more available)`}
          </p>
          <div className="flex gap-2">
            {nextPageToken && (
              <Button
                onClick={handleNextPage}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Next Page
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
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

  if (loading) return <div className="p-4 text-center">Loading logs...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Audit Logs</CardTitle>
          <Button onClick={fetchLogs} size="sm" variant="outline">
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
          />
          <Input
            placeholder="Filter by user ID..."
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
          />
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
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
                <tr key={log.id} className="border-b last:border-0">
                  <td className="p-2 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">
                    <Badge variant="outline">{log.action}</Badge>
                  </td>
                  <td className="p-2 font-mono">{log.performedBy}</td>
                  <td className="p-2 font-mono">{log.targetUser}</td>
                  <td className="p-2">
                    <pre className="text-xs bg-gray-100 p-1 rounded">
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
          <p className="text-center text-gray-500 mt-4">No logs found</p>
        )}
      </CardContent>
    </Card>
  );
}

function CodeEditor() {
  return (
    <Card>
      <CardHeader><CardTitle>Code Editor</CardTitle></CardHeader>
      <CardContent>
        <p>Edit app files or content here. (Coming soon, advanced feature!)</p>
      </CardContent>
    </Card>
  );
}

function AppSettings() {
  return (
    <Card>
      <CardHeader><CardTitle>App Settings</CardTitle></CardHeader>
      <CardContent>
        <p>Manage feature flags, environment variables, and more. (Coming soon)</p>
      </CardContent>
    </Card>
  );
}

function SupportTools() {
  return (
    <Card>
      <CardHeader><CardTitle>Support Tools</CardTitle></CardHeader>
      <CardContent>
        <p>Impersonate users, reset user data, toggle admin/test mode, etc. (Coming soon)</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { isSuperadmin, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p>You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 starfield-ultra-sharp">
      <Header />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-amber-300">God Mode Dashboard</h1>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="code">Code Editor</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="support">Support Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="users"><UserManagement /></TabsContent>
          <TabsContent value="logs"><Logs /></TabsContent>
          <TabsContent value="code"><CodeEditor /></TabsContent>
          <TabsContent value="settings"><AppSettings /></TabsContent>
          <TabsContent value="support"><SupportTools /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 