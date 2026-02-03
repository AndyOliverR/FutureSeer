/**
 * Formatting Utilities
 * Date, time, and location formatting functions for user profile display
 */

import { formatBirthPlace } from './locationMappings';

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
export function formatBirthDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format time from 24-hour to 12-hour format
 */
export function formatBirthTime(timeString: string | undefined): string {
  if (!timeString) return "-";
  try {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

/**
 * Re-export formatBirthPlace from locationMappings
 */
export { formatBirthPlace };
