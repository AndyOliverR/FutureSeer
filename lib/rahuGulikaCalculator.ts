// Rahu Kaal and Gulika Kaal Calculator
// Calculates inauspicious time periods based on sunrise, sunset, and weekday
// Based on Vedic astrology principles: 1/8th of daylight hours assigned to each period

export interface RahuGulikaTimings {
  rahuKaal: {
    start: Date;
    end: Date;
    durationMinutes: number;
  };
  gulikaKaal: {
    start: Date;
    end: Date;
    durationMinutes: number;
  };
}

// Rahu Kaal hour mapping (1-8, from sunrise)
// Sunday: 4th hour, Monday: 2nd hour, Tuesday: 3rd hour, Wednesday: 5th hour,
// Thursday: 6th hour, Friday: 4th hour, Saturday: 8th hour
const RAHU_KAAL_HOUR: Record<number, number> = {
  0: 4, // Sunday
  1: 2, // Monday
  2: 3, // Tuesday
  3: 5, // Wednesday
  4: 6, // Thursday
  5: 4, // Friday
  6: 8, // Saturday
};

// Gulika Kaal hour mapping (1-8, from sunrise)
// Sunday: 5th hour, Monday: 4th hour, Tuesday: 7th hour, Wednesday: 2nd hour,
// Thursday: 3rd hour, Friday: 7th hour, Saturday: 6th hour
const GULIKA_KAAL_HOUR: Record<number, number> = {
  0: 5, // Sunday
  1: 4, // Monday
  2: 7, // Tuesday
  3: 2, // Wednesday
  4: 3, // Thursday
  5: 7, // Friday
  6: 6, // Saturday
};

/**
 * Calculate Rahu Kaal and Gulika Kaal for a given date
 * 
 * @param sunrise - Sunrise time for the date
 * @param sunset - Sunset time for the date
 * @param date - The date to calculate for (used to determine weekday)
 * @returns Rahu Kaal and Gulika Kaal timings
 */
export function calculateRahuGulika(
  sunrise: Date,
  sunset: Date,
  date: Date = new Date()
): RahuGulikaTimings {
  // Get weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const weekday = date.getDay();
  
  // Calculate daylight duration in milliseconds
  const daylightMs = sunset.getTime() - sunrise.getTime();
  const daylightHours = daylightMs / (1000 * 60 * 60);
  
  // One segment = 1/8th of daylight
  const segmentDurationMs = daylightMs / 8;
  const segmentDurationMinutes = segmentDurationMs / (1000 * 60);
  
  // Get which hour (segment) Rahu Kaal and Gulika Kaal fall on
  const rahuHour = RAHU_KAAL_HOUR[weekday];
  const gulikaHour = GULIKA_KAAL_HOUR[weekday];
  
  // Calculate start time for each period
  // Hour 1 starts at sunrise, hour 2 starts after 1 segment, etc.
  const rahuStartMs = sunrise.getTime() + (rahuHour - 1) * segmentDurationMs;
  const rahuEndMs = rahuStartMs + segmentDurationMs;
  
  const gulikaStartMs = sunrise.getTime() + (gulikaHour - 1) * segmentDurationMs;
  const gulikaEndMs = gulikaStartMs + segmentDurationMs;
  
  return {
    rahuKaal: {
      start: new Date(rahuStartMs),
      end: new Date(rahuEndMs),
      durationMinutes: segmentDurationMinutes,
    },
    gulikaKaal: {
      start: new Date(gulikaStartMs),
      end: new Date(gulikaEndMs),
      durationMinutes: segmentDurationMinutes,
    },
  };
}

/**
 * Format time for display (HH:MM AM/PM)
 */
export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Check if a given time falls within Rahu Kaal or Gulika Kaal
 */
export function isInauspiciousTime(
  checkTime: Date,
  rahuGulika: RahuGulikaTimings
): { inRahuKaal: boolean; inGulikaKaal: boolean } {
  const timeMs = checkTime.getTime();
  const inRahuKaal =
    timeMs >= rahuGulika.rahuKaal.start.getTime() &&
    timeMs < rahuGulika.rahuKaal.end.getTime();
  const inGulikaKaal =
    timeMs >= rahuGulika.gulikaKaal.start.getTime() &&
    timeMs < rahuGulika.gulikaKaal.end.getTime();
  
  return { inRahuKaal, inGulikaKaal };
}
