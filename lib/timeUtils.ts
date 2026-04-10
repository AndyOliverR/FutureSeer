/**
 * Time normalization utilities for handling various birthTime formats
 */

import { devLog } from './devLogger';

/**
 * Normalizes birthTime input to HH:MM format
 * Handles both timestamp (Unix milliseconds) and string formats
 * 
 * @param birthTime - Can be a timestamp, time string, or any other format
 * @returns Normalized time string in HH:MM format
 */
export function normalizeTimeString(birthTime: any): string {
  if (!birthTime) return '';
  
  const timeString = String(birthTime);
  
  // If birthTime is a timestamp (all digits, length > 10), convert to time string
  if (/^\d+$/.test(timeString) && timeString.length > 10) {
    const timestamp = parseInt(timeString);
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // Already in HH:MM format or other valid format
  return timeString;
}

/**
 * Normalizes birthDate input to ensure proper format
 * 
 * @param birthDate - Can be various date formats
 * @returns Normalized date string in YYYY-MM-DD format
 */
export function normalizeDateString(birthDate: any): string {
  if (!birthDate) return '';
  
  const dateString = String(birthDate);
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Try to parse as Date and format
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    devLog.warn('Failed to normalize date', dateString, 'timeUtils');
  }
  
  return dateString;
}
