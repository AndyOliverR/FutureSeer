/**
 * Standardized cache TTL (Time To Live) constants
 * Use these constants across all services for consistent caching behavior
 */

// Standard cache durations in milliseconds
export const CACHE_TTL = {
  // User reports and analysis data
  REPORTS: 24 * 60 * 60 * 1000, // 24 hours
  
  // User profiles (until profile is updated)
  PROFILES: Infinity, // Cached until profile update
  
  // Static reference data (rarely changes)
  STATIC_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Transit data (changes daily)
  TRANSITS: 60 * 60 * 1000, // 1 hour
  
  // Chart calculations (based on fixed birth data)
  CHARTS: 24 * 60 * 60 * 1000, // 24 hours
  
  // Divination data (comprehensive profiles)
  DIVINATION_DATA: 24 * 60 * 60 * 1000, // 24 hours
  
  // API responses (short-term)
  API_RESPONSES: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Check if cached data is still valid
 */
export function isCacheValid(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp < ttl;
}

/**
 * Get cache expiry time
 */
export function getCacheExpiry(ttl: number): number {
  return Date.now() + ttl;
}

