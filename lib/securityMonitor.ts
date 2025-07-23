// Security monitoring and logging system for Firebase
interface SecurityEvent {
  timestamp: number;
  eventType: 'auth_success' | 'auth_failure' | 'data_access' | 'data_modification' | 'rate_limit' | 'suspicious_activity';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityConfig {
  enableLogging: boolean;
  enableAlerts: boolean;
  alertThreshold: number; // Number of events before alerting
  suspiciousPatterns: string[];
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private config: SecurityConfig;
  private alertCount = 0;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableAlerts: true,
      alertThreshold: 10,
      suspiciousPatterns: [
        'sql_injection',
        'xss_attempt',
        'brute_force',
        'unauthorized_access',
        'data_exfiltration'
      ],
      ...config
    };
  }

  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Event:', {
        type: fullEvent.eventType,
        severity: fullEvent.severity,
        userId: fullEvent.userId,
        details: fullEvent.details
      });
    }

    // Check for suspicious patterns
    this.checkSuspiciousActivity(fullEvent);

    // Send alerts if threshold exceeded
    if (this.config.enableAlerts && this.shouldAlert(fullEvent)) {
      this.sendAlert(fullEvent);
    }

    // Clean up old events (keep last 1000)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  private checkSuspiciousActivity(event: SecurityEvent): void {
    const suspiciousIndicators = [
      event.eventType === 'auth_failure' && this.getRecentAuthFailures(event.userId) > 5,
      event.eventType === 'data_access' && this.getRecentDataAccess(event.userId) > 50,
      event.eventType === 'rate_limit' && this.getRecentRateLimits(event.userId) > 3,
      event.details?.userAgent?.includes('bot') || event.details?.userAgent?.includes('crawler'),
      event.details?.ipAddress && this.isKnownMaliciousIP(event.details.ipAddress),
    ];

    if (suspiciousIndicators.some(indicator => indicator)) {
      this.logEvent({
        eventType: 'suspicious_activity',
        userId: event.userId,
        ipAddress: event.details?.ipAddress,
        userAgent: event.details?.userAgent,
        details: {
          originalEvent: event,
          indicators: suspiciousIndicators
        },
        severity: 'high'
      });
    }
  }

  private getRecentAuthFailures(userId?: string): number {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return this.events.filter(event => 
      event.eventType === 'auth_failure' &&
      event.timestamp > fiveMinutesAgo &&
      (!userId || event.userId === userId)
    ).length;
  }

  private getRecentDataAccess(userId?: string): number {
    const oneMinuteAgo = Date.now() - (60 * 1000);
    return this.events.filter(event => 
      event.eventType === 'data_access' &&
      event.timestamp > oneMinuteAgo &&
      (!userId || event.userId === userId)
    ).length;
  }

  private getRecentRateLimits(userId?: string): number {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    return this.events.filter(event => 
      event.eventType === 'rate_limit' &&
      event.timestamp > tenMinutesAgo &&
      (!userId || event.userId === userId)
    ).length;
  }

  private isKnownMaliciousIP(ip: string): boolean {
    // In production, you would check against a threat intelligence database
    const knownMaliciousIPs: string[] = [
      // Add known malicious IPs here
    ];
    return knownMaliciousIPs.includes(ip);
  }

  private shouldAlert(event: SecurityEvent): boolean {
    const recentEvents = this.events.filter(e => 
      e.timestamp > Date.now() - (15 * 60 * 1000) && // Last 15 minutes
      e.severity === 'high' || e.severity === 'critical'
    );

    return recentEvents.length >= this.config.alertThreshold;
  }

  private sendAlert(event: SecurityEvent): void {
    this.alertCount++;
    
    // In production, send to your alerting system (email, Slack, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 SECURITY ALERT:', {
        count: this.alertCount,
        event: event,
        recentEvents: this.getRecentEvents(15 * 60 * 1000) // Last 15 minutes
      });
    }

    // You can integrate with services like:
    // - Email notifications
    // - Slack webhooks
    // - PagerDuty
    // - Custom webhook endpoints
  }

  getRecentEvents(timeWindowMs: number): SecurityEvent[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.events.filter(event => event.timestamp > cutoff);
  }

  getEventsByUser(userId: string, timeWindowMs?: number): SecurityEvent[] {
    let events = this.events.filter(event => event.userId === userId);
    
    if (timeWindowMs) {
      const cutoff = Date.now() - timeWindowMs;
      events = events.filter(event => event.timestamp > cutoff);
    }
    
    return events;
  }

  getSecurityReport(): {
    totalEvents: number;
    recentEvents: number;
    highSeverityEvents: number;
    suspiciousActivities: number;
    alertCount: number;
  } {
    const recentEvents = this.getRecentEvents(24 * 60 * 60 * 1000); // Last 24 hours
    
    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      highSeverityEvents: recentEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length,
      suspiciousActivities: recentEvents.filter(e => e.eventType === 'suspicious_activity').length,
      alertCount: this.alertCount
    };
  }

  clearEvents(): void {
    this.events = [];
    this.alertCount = 0;
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Helper functions for common security events
export const securityEvents = {
  // Authentication events
  logAuthSuccess: (userId: string, details: any) => {
    securityMonitor.logEvent({
      eventType: 'auth_success',
      userId,
      details,
      severity: 'low'
    });
  },

  logAuthFailure: (userId: string, details: any) => {
    securityMonitor.logEvent({
      eventType: 'auth_failure',
      userId,
      details,
      severity: 'medium'
    });
  },

  // Data access events
  logDataAccess: (userId: string, collection: string, documentId: string, details: any) => {
    securityMonitor.logEvent({
      eventType: 'data_access',
      userId,
      details: {
        collection,
        documentId,
        ...details
      },
      severity: 'low'
    });
  },

  logDataModification: (userId: string, collection: string, documentId: string, operation: string, details: any) => {
    securityMonitor.logEvent({
      eventType: 'data_modification',
      userId,
      details: {
        collection,
        documentId,
        operation,
        ...details
      },
      severity: 'medium'
    });
  },

  // Rate limiting events
  logRateLimit: (userId: string, endpoint: string, details: any) => {
    securityMonitor.logEvent({
      eventType: 'rate_limit',
      userId,
      details: {
        endpoint,
        ...details
      },
      severity: 'medium'
    });
  },

  // Suspicious activity
  logSuspiciousActivity: (userId: string, activity: string, details: any) => {
    securityMonitor.logEvent({
      eventType: 'suspicious_activity',
      userId,
      details: {
        activity,
        ...details
      },
      severity: 'high'
    });
  }
};

// Middleware to automatically log security events
export function withSecurityLogging(
  handler: Function,
  eventType: SecurityEvent['eventType'] = 'data_access'
) {
  return async (request: Request, ...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const response = await handler(request, ...args);
      
      // Log successful operation
      securityEvents.logDataAccess(
        'user-id', // Extract from request
        'collection', // Extract from request
        'document-id', // Extract from request
        {
          method: request.method,
          url: request.url,
          duration: Date.now() - startTime,
          status: response.status
        }
      );
      
      return response;
    } catch (error: any) {
      // Log failed operation
      securityEvents.logSuspiciousActivity(
        'user-id', // Extract from request
        'operation_failed',
        {
          method: request.method,
          url: request.url,
          error: error.message || 'Unknown error',
          duration: Date.now() - startTime
        }
      );
      
      throw error;
    }
  };
}

// Export the monitor for direct access
export default securityMonitor; 