// Rate limiting utility for API endpoints
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis or database)
const rateLimitStore: RateLimitStore = {};

export class RateLimiter {
  config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      ...config,
    };
  }

  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    });
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    
    const key = this.getKey(identifier);
    const now = Date.now();
    
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: rateLimitStore[key].resetTime,
      };
    }

    const record = rateLimitStore[key];
    
    if (now > record.resetTime) {
      // Reset window
      record.count = 1;
      record.resetTime = now + this.config.windowMs;
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: record.resetTime,
      };
    }

    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  getErrorMessage(): string {
    return this.config.message || 'Too many requests, please try again later.';
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // General API requests
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'API rate limit exceeded. Please try again in 15 minutes.',
  }),

  // Authentication requests
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  }),

  // AI predictions
  ai: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'AI prediction limit reached. Please try again in 1 hour.',
  }),

  // File uploads
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Upload limit reached. Please try again in 1 hour.',
  }),

  // User actions
  user: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    message: 'Too many user actions. Please try again in 5 minutes.',
  }),

  /**
   * POST /api/profile/generate-mystical — expensive; keyed by uid in route handler.
   * Tune with RATE_LIMIT_PROFILE_GEN_MAX_PER_HOUR or RATE_LIMIT_STRICT=1 (tighter cap).
   */
  profileGeneration: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: (() => {
      const strict = process.env.RATE_LIMIT_STRICT === '1';
      const raw = process.env.RATE_LIMIT_PROFILE_GEN_MAX_PER_HOUR;
      if (raw && /^\d+$/.test(raw)) return Math.max(1, parseInt(raw, 10));
      return strict ? 4 : 12;
    })(),
    message:
      'Too many profile generation requests in a short period. Please try again in about an hour.',
  }),
};

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // In production, you might want to use a more sophisticated method
  // like IP address, user ID, or session token
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}

// Helper function to get user identifier
export function getUserIdentifier(userId?: string): string {
  return userId || 'anonymous';
}

/** Next.js App Router route handler compatible with `withRateLimit` wrapping. */
export type RateLimitedRouteHandler = (
  request: Request,
  ...args: unknown[]
) => Promise<Response | unknown> | Response | unknown;

// Rate limiting middleware for Next.js API routes
export function withRateLimit(
  handler: RateLimitedRouteHandler,
  limiter: RateLimiter = rateLimiters.api,
  getIdentifier: (request: Request) => string = getClientIdentifier
) {
  return async (request: Request, ...args: unknown[]) => {
    const identifier = getIdentifier(request);
    const result = limiter.check(identifier);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: limiter.getErrorMessage(),
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(request, ...args);
    
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', limiter.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    }

    return response;
  };
}

// Rate limiting for specific user actions
export function withUserRateLimit(
  handler: RateLimitedRouteHandler,
  limiter: RateLimiter = rateLimiters.user
) {
  return async (request: Request, ...args: unknown[]) => {
    // Extract user ID from request (you'll need to implement this based on your auth)
    const userId = 'user-id-from-request'; // Replace with actual user ID extraction
    const identifier = getUserIdentifier(userId);
    const result = limiter.check(identifier);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: limiter.getErrorMessage(),
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return handler(request, ...args);
  };
} 