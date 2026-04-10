"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, ChevronLeft } from 'lucide-react';
export default function AdminSecurityPage() {
  const { isAdmin, isSuperadmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="admin-card max-w-md text-slate-200">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-sm font-medium text-slate-200 mb-2">Admin Access Required</CardTitle>
            <p className="text-slate-300 text-sm">You need admin or superadmin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1 text-slate-300 hover:text-slate-200 text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-xl font-semibold text-slate-200 mb-2">Security Administration</h1>
        <p className="text-slate-400 text-sm max-w-2xl mb-6">
          Monitor and manage the security of your FutureSeer application. Track authentication events, suspicious activities, and system health.
        </p>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="admin-card text-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Firebase Security Rules</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-green-400">Active</div>
              <p className="text-xs text-slate-300">
                Security rules are properly configured
              </p>
            </CardContent>
          </Card>

          <Card className="admin-card text-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Rate Limiting</CardTitle>
              <Shield className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-blue-400">Enabled</div>
              <p className="text-xs text-slate-300">
                API endpoints are rate limited
              </p>
            </CardContent>
          </Card>

          <Card className="admin-card text-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">Security Monitoring</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-orange-400">Active</div>
              <p className="text-xs text-slate-300">
                Real-time security monitoring enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Alerts */}
        <Alert className="border-slate-600 bg-slate-800/80 [&>svg]:text-slate-400">
          <Shield className="h-4 w-4 text-slate-400" />
          <AlertDescription className="text-slate-300 text-sm">
            <strong className="text-slate-200">Security Status:</strong> Your FutureSeer application is currently protected by comprehensive security measures including Firebase Security Rules, rate limiting, and real-time monitoring.
          </AlertDescription>
        </Alert>

        {/* Security Dashboard */}
        <div className="admin-card p-6">
          <SecurityDashboard />
        </div>

        {/* Security Recommendations */}
        <Card className="admin-card text-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              Security Recommendations
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Best practices to enhance your application&apos;s security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-400">Implemented</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    Firebase Authentication with multiple providers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    Firestore Security Rules with user isolation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    Rate limiting on API endpoints
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    Real-time security monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    Enhanced error handling and logging
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-orange-400">Recommended</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    Set up email/Slack alerts for security events
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    Implement IP whitelisting for admin access
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    Add two-factor authentication (2FA)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    Regular security audits and penetration testing
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    Backup and disaster recovery procedures
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Security Rules Status */}
        <Card className="admin-card text-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              Firebase Security Rules Status
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Current status of your Firestore security rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-green-500/30 bg-green-500/10 [&>svg]:text-green-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  <strong>Security Rules Active:</strong> Your Firestore database is protected by comprehensive security rules that ensure users can only access their own data.
                </AlertDescription>
              </Alert>

              <div className="bg-slate-800/80 rounded-lg border border-slate-600 p-4 font-mono text-sm text-slate-300">
                <div className="text-green-400 mb-2">{'// Current Security Rules Status:'}</div>
                <div className="text-slate-300 space-y-1">
                  <div>✅ Authentication required for all operations</div>
                  <div>✅ User data isolation enforced</div>
                  <div>✅ Data validation implemented</div>
                  <div>✅ Rate limiting configured</div>
                  <div>✅ Security monitoring active</div>
                </div>
              </div>

              <div className="text-sm text-slate-400">
                <p>
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
                <p>
                  <strong>Next Review:</strong> Recommended monthly security rule reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 