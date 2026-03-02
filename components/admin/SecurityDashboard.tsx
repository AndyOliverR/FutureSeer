'use client';

import React, { useState, useEffect } from 'react';
import { devLog } from '@/lib/devLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Clock, 
  RefreshCw,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import securityMonitor, { securityEvents } from '@/lib/securityMonitor';

interface SecurityEvent {
  timestamp: number;
  eventType: string;
  userId?: string;
  severity: string;
  details: any;
}

export function SecurityDashboard() {
  const [securityReport, setSecurityReport] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const report = securityMonitor.getSecurityReport();
      const events = securityMonitor.getRecentEvents(24 * 60 * 60 * 1000); // Last 24 hours
      
      setSecurityReport(report);
      setRecentEvents(events);
    } catch (error) {
      devLog.error('Error refreshing security data:', error, 'SecurityDashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'auth_success': return '🔐';
      case 'auth_failure': return '❌';
      case 'data_access': return '📖';
      case 'data_modification': return '✏️';
      case 'rate_limit': return '⏱️';
      case 'suspicious_activity': return '🚨';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const clearEvents = () => {
    securityMonitor.clearEvents();
    refreshData();
  };

  const adminCardClass = "rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 ";

  if (!securityReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-400/60" />
          <p className="text-white/80 text-sm">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
            Security Dashboard
          </h2>
          <p className="text-gray-400">Monitor your application's security status</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={clearEvents}
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Events
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={adminCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white/90">{securityReport.totalEvents}</div>
            <p className="text-xs text-gray-400">
              All time security events
            </p>
          </CardContent>
        </Card>

        <Card className={adminCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200">Recent Events</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white/90">{securityReport.recentEvents}</div>
            <p className="text-xs text-gray-400">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card className={adminCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {securityReport.highSeverityEvents}
            </div>
            <p className="text-xs text-gray-400">
              High/Critical events
            </p>
          </CardContent>
        </Card>

        <Card className={adminCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200">Alerts Sent</CardTitle>
            <Shield className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {securityReport.alertCount}
            </div>
            <p className="text-xs text-gray-400">
              Security alerts triggered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {securityReport.highSeverityEvents > 0 && (
        <Alert className="border-orange-500/40 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-200">
            <strong>{securityReport.highSeverityEvents}</strong> high severity security events detected in the last 24 hours. 
            Review the events below and take appropriate action.
          </AlertDescription>
        </Alert>
      )}

      {/* Events Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-1 text-amber-200">
          <TabsTrigger value="recent" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Recent Events</TabsTrigger>
          <TabsTrigger value="suspicious" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Suspicious Activity</TabsTrigger>
          <TabsTrigger value="auth" className="text-amber-200/90 hover:text-amber-100 data-[state=active]:text-amber-100 data-[state=active]:font-semibold">Authentication</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card className={adminCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Activity className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription className="text-gray-400">
                Security events from the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-amber-400/60" />
                  <p className="text-white/80 text-sm">No security events in the last 24 hours</p>
                  <p className="text-sm text-gray-400">Your application appears to be secure</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.slice(0, 20).map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-slate-600 rounded-lg hover:bg-slate-700/50 text-white/90"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                        <div>
                          <div className="font-medium capitalize text-white/90">
                            {event.eventType.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-400">
                            {event.userId ? `User: ${event.userId}` : 'Anonymous'}
                          </div>
                          {showDetails && (
                            <div className="text-xs text-gray-400 mt-1">
                              {JSON.stringify(event.details, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <div className="text-xs text-gray-400">
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious" className="space-y-4">
          <Card className={adminCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Suspicious Activity
              </CardTitle>
              <CardDescription className="text-gray-400">
                Potentially malicious or suspicious activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.filter(e => e.eventType === 'suspicious_activity').length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-amber-400/60" />
                  <p className="text-white/80 text-sm">No suspicious activity detected</p>
                  <p className="text-sm text-gray-400">Your security measures are working well</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents
                    .filter(e => e.eventType === 'suspicious_activity')
                    .map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-orange-500/40 rounded-lg bg-orange-500/10 text-orange-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🚨</span>
                          <div>
                            <div className="font-medium text-orange-200">
                              Suspicious Activity Detected
                            </div>
                            <div className="text-sm text-orange-300/80">
                              {event.userId ? `User: ${event.userId}` : 'Anonymous'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-orange-300/80">
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card className={adminCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Users className="h-5 w-5" />
                Authentication Events
              </CardTitle>
              <CardDescription className="text-gray-400">
                Login attempts and authentication activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.filter(e => e.eventType.includes('auth')).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-amber-400/60" />
                  <p className="text-white/80 text-sm">No authentication events in the last 24 hours</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents
                    .filter(e => e.eventType.includes('auth'))
                    .map((event, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border rounded-lg text-white/90 ${
                          event.eventType === 'auth_failure' 
                            ? 'border-red-500/40 bg-red-500/10' 
                            : 'border-green-500/40 bg-green-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {event.eventType === 'auth_success' ? '✅' : '❌'}
                          </span>
                          <div>
                            <div className="font-medium">
                              {event.eventType === 'auth_success' ? 'Successful Login' : 'Failed Login'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {event.userId || 'Unknown user'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Toggle Details Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant="outline"
          size="sm"
          className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
        >
          {showDetails ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Details
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 