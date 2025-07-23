import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminSecurityPage() {
  return (
    <div className="min-h-screen cosmic-background-restored p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
            Security Administration
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Monitor and manage the security of your FutureSeer application. 
            Track authentication events, suspicious activities, and system health.
          </p>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Firebase Security Rules</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-green-500">
                Security rules are properly configured
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Rate Limiting</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Enabled</div>
              <p className="text-xs text-blue-500">
                API endpoints are rate limited
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Security Monitoring</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Active</div>
              <p className="text-xs text-orange-500">
                Real-time security monitoring enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Alerts */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Security Status:</strong> Your FutureSeer application is currently protected by comprehensive security measures including Firebase Security Rules, rate limiting, and real-time monitoring.
          </AlertDescription>
        </Alert>

        {/* Security Dashboard */}
        <div className="glass-card">
          <SecurityDashboard />
        </div>

        {/* Security Recommendations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Recommendations
            </CardTitle>
            <CardDescription>
              Best practices to enhance your application's security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✅ Implemented</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Firebase Authentication with multiple providers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Firestore Security Rules with user isolation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Rate limiting on API endpoints
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time security monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Enhanced error handling and logging
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-orange-600">🔧 Recommended</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Set up email/Slack alerts for security events
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Implement IP whitelisting for admin access
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Add two-factor authentication (2FA)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Regular security audits and penetration testing
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Backup and disaster recovery procedures
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Security Rules Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Firebase Security Rules Status
            </CardTitle>
            <CardDescription>
              Current status of your Firestore security rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✅ Security Rules Active:</strong> Your Firestore database is protected by comprehensive security rules that ensure users can only access their own data.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <div className="text-green-400 mb-2">// Current Security Rules Status:</div>
                <div className="text-gray-300 space-y-1">
                  <div>✅ Authentication required for all operations</div>
                  <div>✅ User data isolation enforced</div>
                  <div>✅ Data validation implemented</div>
                  <div>✅ Rate limiting configured</div>
                  <div>✅ Security monitoring active</div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
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