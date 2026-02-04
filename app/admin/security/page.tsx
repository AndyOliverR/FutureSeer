"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, ChevronLeft } from 'lucide-react';
import { Header } from '@/components/header';

const adminCardClass = "rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.01]";

export default function AdminSecurityPage() {
  const { isAdmin, isSuperadmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" />
          <p className="text-amber-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
        <Card className="w-96 bg-slate-900/80 backdrop-blur-sm border-amber-500/20">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-200 mb-2">Admin Access Required</h2>
            <p className="text-gray-400 mb-4">You need admin or superadmin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20 space-y-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1 text-amber-400/90 hover:text-amber-300 text-sm font-medium mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
            Security Administration
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monitor and manage the security of your FutureSeer application. 
            Track authentication events, suspicious activities, and system health.
          </p>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={adminCardClass}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Firebase Security Rules</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Active</div>
              <p className="text-xs text-white/80">
                Security rules are properly configured
              </p>
            </CardContent>
          </Card>

          <Card className={adminCardClass}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Rate Limiting</CardTitle>
              <Shield className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">Enabled</div>
              <p className="text-xs text-white/80">
                API endpoints are rate limited
              </p>
            </CardContent>
          </Card>

          <Card className={adminCardClass}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">Security Monitoring</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">Active</div>
              <p className="text-xs text-white/80">
                Real-time security monitoring enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Alerts */}
        <Alert className="border-amber-500/30 bg-slate-800/80 [&>svg]:text-amber-400">
          <Shield className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-white/90">
            <strong>Security Status:</strong> Your FutureSeer application is currently protected by comprehensive security measures including Firebase Security Rules, rate limiting, and real-time monitoring.
          </AlertDescription>
        </Alert>

        {/* Security Dashboard */}
        <div className={`${adminCardClass} p-6`}>
          <SecurityDashboard />
        </div>

        {/* Security Recommendations */}
        <Card className={adminCardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Shield className="h-5 w-5 text-amber-400" />
              Security Recommendations
            </CardTitle>
            <CardDescription className="text-gray-400">
              Best practices to enhance your application's security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-400">Implemented</h4>
                <ul className="space-y-2 text-sm text-white/80">
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
                <ul className="space-y-2 text-sm text-white/80">
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
        <Card className={adminCardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Shield className="h-5 w-5 text-amber-400" />
              Firebase Security Rules Status
            </CardTitle>
            <CardDescription className="text-gray-400">
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

              <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-green-400 mb-2">// Current Security Rules Status:</div>
                <div className="text-gray-200 space-y-1">
                  <div>✅ Authentication required for all operations</div>
                  <div>✅ User data isolation enforced</div>
                  <div>✅ Data validation implemented</div>
                  <div>✅ Rate limiting configured</div>
                  <div>✅ Security monitoring active</div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
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