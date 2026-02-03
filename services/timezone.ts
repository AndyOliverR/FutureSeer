// Timezone utilities for Vedic Astrology
// Handles timezone conversion, offset calculation, and DST handling

export interface TimezoneInfo {
  timezone: string;
  offset: number; // in hours
  offsetMinutes: number; // in minutes
  isDST: boolean;
  abbreviation: string;
  utcOffset: string; // e.g., "+05:30"
}

export interface DateTimeInfo {
  local: Date;
  utc: Date;
  timezone: TimezoneInfo;
  formatted: {
    local: string;
    utc: string;
    timezone: string;
  };
}

export class TimezoneService {
  private timezoneCache: Map<string, TimezoneInfo> = new Map();
  private cacheExpiry: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get timezone information for a given timezone
   */
  async getTimezoneInfo(timezone: string): Promise<TimezoneInfo> {
    // Check cache first
    const cached = this.timezoneCache.get(timezone);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      const info = await this.fetchTimezoneInfo(timezone);
      this.timezoneCache.set(timezone, { ...info, timestamp: Date.now() });
      return info;
    } catch (error) {
      console.warn(`Failed to fetch timezone info for ${timezone}:`, error);
      return this.getFallbackTimezoneInfo(timezone);
    }
  }

  /**
   * Convert date/time to different timezone
   */
  async convertDateTime(
    dateTime: Date | string,
    fromTimezone: string,
    toTimezone: string
  ): Promise<DateTimeInfo> {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    
    // Get timezone info
    const [fromInfo, toInfo] = await Promise.all([
      this.getTimezoneInfo(fromTimezone),
      this.getTimezoneInfo(toTimezone)
    ]);

    // Convert to UTC first
    const utc = new Date(date.getTime() - (fromInfo.offsetMinutes * 60 * 1000));
    
    // Convert from UTC to target timezone
    const local = new Date(utc.getTime() + (toInfo.offsetMinutes * 60 * 1000));

    return {
      local,
      utc,
      timezone: toInfo,
      formatted: {
        local: this.formatDateTime(local, toTimezone),
        utc: this.formatDateTime(utc, 'UTC'),
        timezone: `${toTimezone} (${toInfo.abbreviation})`
      }
    };
  }

  /**
   * Get current time in a specific timezone
   */
  async getCurrentTime(timezone: string): Promise<DateTimeInfo> {
    const now = new Date();
    const timezoneInfo = await this.getTimezoneInfo(timezone);
    
    // Calculate local time
    const local = new Date(now.getTime() + (timezoneInfo.offsetMinutes * 60 * 1000));

    return {
      local,
      utc: now,
      timezone: timezoneInfo,
      formatted: {
        local: this.formatDateTime(local, timezone),
        utc: this.formatDateTime(now, 'UTC'),
        timezone: `${timezone} (${timezoneInfo.abbreviation})`
      }
    };
  }

  /**
   * Calculate timezone offset between two timezones
   */
  async getTimezoneOffset(fromTimezone: string, toTimezone: string): Promise<number> {
    const [fromInfo, toInfo] = await Promise.all([
      this.getTimezoneInfo(fromTimezone),
      this.getTimezoneInfo(toTimezone)
    ]);

    return toInfo.offsetMinutes - fromInfo.offsetMinutes;
  }

  /**
   * Check if a timezone observes DST
   */
  async isDST(timezone: string, date: Date = new Date()): Promise<boolean> {
    const info = await this.getTimezoneInfo(timezone);
    return info.isDST;
  }

  /**
   * Get all available timezones
   */
  getAvailableTimezones(): string[] {
    return [
      // Major timezones
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Moscow',
      'Asia/Kolkata',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Pacific/Auckland',
      
      // Indian timezones
      'Asia/Kolkata',
      'Asia/Dhaka',
      'Asia/Karachi',
      
      // US timezones
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
      
      // European timezones
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Europe/Moscow',
      
      // Asian timezones
      'Asia/Kolkata',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Seoul',
      'Asia/Singapore',
      'Asia/Dubai',
      
      // Australian timezones
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Perth',
      'Australia/Adelaide',
      'Australia/Darwin',
      'Australia/Brisbane',
      
      // Pacific timezones
      'Pacific/Auckland',
      'Pacific/Fiji',
      'Pacific/Honolulu',
      'Pacific/Guam'
    ];
  }

  /**
   * Format date/time for display
   */
  formatDateTime(date: Date, timezone: string): string {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  /**
   * Format timezone offset
   */
  formatOffset(offsetMinutes: number): string {
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Fetch timezone information from API or calculate
   */
  private async fetchTimezoneInfo(timezone: string): Promise<TimezoneInfo> {
    // Try to use Intl.DateTimeFormat for basic info
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });

    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');
    
    if (offsetPart) {
      const offsetMatch = offsetPart.value.match(/([+-])(\d{2}):(\d{2})/);
      if (offsetMatch) {
        const sign = offsetMatch[1] === '+' ? 1 : -1;
        const hours = parseInt(offsetMatch[2]);
        const minutes = parseInt(offsetMatch[3]);
        const offsetMinutes = sign * (hours * 60 + minutes);

        return {
          timezone,
          offset: offsetMinutes / 60,
          offsetMinutes,
          isDST: this.calculateDST(now, timezone),
          abbreviation: this.getTimezoneAbbreviation(timezone),
          utcOffset: this.formatOffset(offsetMinutes)
        };
      }
    }

    // Fallback calculation
    return this.getFallbackTimezoneInfo(timezone);
  }

  /**
   * Get fallback timezone info when API fails
   */
  private getFallbackTimezoneInfo(timezone: string): TimezoneInfo {
    const timezoneOffsets: Record<string, number> = {
      'UTC': 0,
      'Asia/Kolkata': 5.5 * 60,
      'America/New_York': -5 * 60,
      'America/Chicago': -6 * 60,
      'America/Denver': -7 * 60,
      'America/Los_Angeles': -8 * 60,
      'Europe/London': 0 * 60,
      'Europe/Paris': 1 * 60,
      'Europe/Berlin': 1 * 60,
      'Europe/Moscow': 3 * 60,
      'Asia/Shanghai': 8 * 60,
      'Asia/Tokyo': 9 * 60,
      'Australia/Sydney': 10 * 60,
      'Pacific/Auckland': 12 * 60
    };

    const offsetMinutes = timezoneOffsets[timezone] || 0;

    return {
      timezone,
      offset: offsetMinutes / 60,
      offsetMinutes,
      isDST: false, // Simplified - would need proper DST calculation
      abbreviation: this.getTimezoneAbbreviation(timezone),
      utcOffset: this.formatOffset(offsetMinutes)
    };
  }

  /**
   * Calculate DST status
   */
  private calculateDST(date: Date, timezone: string): boolean {
    // Simplified DST calculation - in production, use a proper library
    const month = date.getMonth();
    const day = date.getDate();
    
    // Basic DST rules (simplified)
    if (timezone.startsWith('America/')) {
      // US DST: Second Sunday in March to First Sunday in November
      return (month > 2 && month < 10) || 
             (month === 2 && day >= 8) || 
             (month === 10 && day <= 7);
    }
    
    if (timezone.startsWith('Europe/')) {
      // EU DST: Last Sunday in March to Last Sunday in October
      return (month > 2 && month < 9) || 
             (month === 2 && day >= 25) || 
             (month === 9 && day <= 25);
    }
    
    return false;
  }

  /**
   * Get timezone abbreviation
   */
  private getTimezoneAbbreviation(timezone: string): string {
    const abbreviations: Record<string, string> = {
      'UTC': 'UTC',
      'Asia/Kolkata': 'IST',
      'America/New_York': 'EST/EDT',
      'America/Chicago': 'CST/CDT',
      'America/Denver': 'MST/MDT',
      'America/Los_Angeles': 'PST/PDT',
      'Europe/London': 'GMT/BST',
      'Europe/Paris': 'CET/CEST',
      'Europe/Berlin': 'CET/CEST',
      'Europe/Moscow': 'MSK',
      'Asia/Shanghai': 'CST',
      'Asia/Tokyo': 'JST',
      'Australia/Sydney': 'AEST/AEDT',
      'Pacific/Auckland': 'NZST/NZDT'
    };

    return abbreviations[timezone] || timezone.split('/').pop() || 'UTC';
  }
}

// Export singleton instance
export const timezoneService = new TimezoneService();

