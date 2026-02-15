/**
 * Date Parser for Natural Language Questions
 * Extracts and parses date references from user questions to enable
 * accurate future transit calculations for astrology predictions
 */

import { devLog } from '@/lib/devLogger';

export interface ParsedDateRange {
  startDate: Date;
  endDate: Date | null;
  isDateRange: boolean;
  isSpecificDate: boolean;
  isRelative: boolean;
  rawText: string;
}

/**
 * Parse natural language date references from questions
 */
export function parseDatesFromQuestion(question: string): ParsedDateRange | null {
  // Clean and normalize the question
  const normalized = question.toLowerCase().trim();
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Try ISO format first: "2025-11-03"
  const isoMatch = normalized.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]);
    const month = parseInt(isoMatch[2]) - 1;
    const day = parseInt(isoMatch[3]);
    const date = new Date(Date.UTC(year, month, day));
    if (!isNaN(date.getTime())) {
      return {
        startDate: date,
        endDate: null,
        isDateRange: false,
        isSpecificDate: true,
        isRelative: false,
        rawText: isoMatch[0]
      };
    }
  }

  // 2. Try specific-date and relative patterns (year-only is last)
  const patterns = [
    // "11th February 2026" (day month year) - try first so follow-ups parse correctly
    /(\d+)(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december),?\s+(\d{4})/gi,
    // Specific date ranges: "November 3rd to 9th, 2025"
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d+)(?:st|nd|rd|th)?\s+to\s+(\d+)(?:st|nd|rd|th)?,\s+(\d{4})/gi,
    // "3rd to the 9th of November 2025"
    /(\d+)(?:st|nd|rd|th)?\s+to\s+(?:the\s+)?(\d+)(?:st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december),?\s+(\d{4})/gi,
    // "on November 15, 2025"
    /on\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})/gi,
    // "November 2025"
    /(january|february|march|april|may|june|july|august|september|october|november|december),?\s+(\d{4})/gi,
    // Relative dates: "next week", "next month"
    /next\s+(week|month|year)/gi,
    /this\s+(week|month|year)/gi,
    // Specific day: "Monday", "next Monday"
    /(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      try {
        const parsed = parseMatch(match, normalized);
        if (parsed) return parsed;
      } catch (error) {
        devLog.error('Error parsing date match:', error, 'dateParser');
        continue;
      }
    }
  }

  // 3. Year-only last: "2026", "in 2026", "the year 2026", "year 2026"
  const yearOnlyMatch = normalized.match(/(?:in\s+)?(?:the\s+)?(?:year\s+)?(\d{4})\b/);
  if (yearOnlyMatch) {
    const year = parseInt(yearOnlyMatch[1], 10);
    if (year >= currentYear && year <= currentYear + 10) {
      const startDate = new Date(Date.UTC(year, 0, 1));
      const endDate = new Date(Date.UTC(year, 11, 31));
      return {
        startDate,
        endDate,
        isDateRange: true,
        isSpecificDate: false,
        isRelative: false,
        rawText: yearOnlyMatch[0].trim()
      };
    }
  }

  return null;
}

/**
 * Parse a matched date pattern into structured data
 */
function parseMatch(match: RegExpMatchArray, fullText: string): ParsedDateRange | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Pattern 1: "November 3rd to 9th, 2025"
  if (match[1] && match[2] && match[3] && match[4]) {
    const monthName = match[1];
    const startDay = parseInt(match[2]);
    const endDay = parseInt(match[3]);
    const year = parseInt(match[4]);
    
    const monthIndex = getMonthIndex(monthName);
    if (monthIndex === -1) return null;
    
    return {
      startDate: new Date(Date.UTC(year, monthIndex, startDay)),
      endDate: new Date(Date.UTC(year, monthIndex, endDay)),
      isDateRange: true,
      isSpecificDate: true,
      isRelative: false,
      rawText: match[0]
    };
  }
  
  // Pattern 2: "3rd to the 9th of November 2025"
  if (match[1] && match[2] && match[3] && match[4]) {
    const startDay = parseInt(match[1]);
    const endDay = parseInt(match[2]);
    const monthName = match[3];
    const year = parseInt(match[4]);
    
    const monthIndex = getMonthIndex(monthName);
    if (monthIndex === -1) return null;
    
    return {
      startDate: new Date(Date.UTC(year, monthIndex, startDay)),
      endDate: new Date(Date.UTC(year, monthIndex, endDay)),
      isDateRange: true,
      isSpecificDate: true,
      isRelative: false,
      rawText: match[0]
    };
  }
  
  // Pattern 3a: "11th February 2026" (day month year) - second group is month
  if (match[1] && match[2] && match[3] && getMonthIndex(match[2]) >= 0 && /^\d+$/.test(match[1])) {
    const day = parseInt(match[1], 10);
    const monthIndex = getMonthIndex(match[2]);
    const year = parseInt(match[3], 10);
    if (day >= 1 && day <= 31) {
      return {
        startDate: new Date(Date.UTC(year, monthIndex, day)),
        endDate: null,
        isDateRange: false,
        isSpecificDate: true,
        isRelative: false,
        rawText: match[0]
      };
    }
  }

  // Pattern 3b: "on November 15, 2025" (month day year)
  if (match[1] && match[2] && match[3]) {
    const monthName = match[1];
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    const monthIndex = getMonthIndex(monthName);
    if (monthIndex === -1) return null;
    
    return {
      startDate: new Date(Date.UTC(year, monthIndex, day)),
      endDate: null,
      isDateRange: false,
      isSpecificDate: true,
      isRelative: false,
      rawText: match[0]
    };
  }
  
  // Pattern 4: "November 2025" - use first day of month
  if (match[1] && match[2]) {
    const monthName = match[1];
    const year = parseInt(match[2]);
    
    const monthIndex = getMonthIndex(monthName);
    if (monthIndex === -1) return null;
    
    return {
      startDate: new Date(Date.UTC(year, monthIndex, 1)),
      endDate: null,
      isDateRange: false,
      isSpecificDate: true,
      isRelative: false,
      rawText: match[0]
    };
  }
  
  // Pattern 5: "next week"
  if (match[1] && match[2] && match[2] === 'week') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return {
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 6 * 24 * 60 * 60 * 1000),
      isDateRange: true,
      isSpecificDate: false,
      isRelative: true,
      rawText: match[0]
    };
  }
  
  // Pattern 6: "next month"
  if (match[1] && match[2] && match[2] === 'month') {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    
    const endOfMonth = new Date(nextMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    
    return {
      startDate: nextMonth,
      endDate: endOfMonth,
      isDateRange: true,
      isSpecificDate: false,
      isRelative: true,
      rawText: match[0]
    };
  }
  
  // Pattern 7: "this week"
  if (match[1] && match[2] && match[1] === 'this' && match[2] === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      isDateRange: true,
      isSpecificDate: false,
      isRelative: true,
      rawText: match[0]
    };
  }
  
  // Pattern 8: "this month"
  if (match[1] && match[2] && match[1] === 'this' && match[2] === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth,
      endDate: endOfMonth,
      isDateRange: true,
      isSpecificDate: false,
      isRelative: true,
      rawText: match[0]
    };
  }
  
  return null;
}

/**
 * Convert month name to 0-indexed month number
 */
function getMonthIndex(monthName: string): number {
  const months: Record<string, number> = {
    'january': 0,
    'february': 1,
    'march': 2,
    'april': 3,
    'may': 4,
    'june': 5,
    'july': 6,
    'august': 7,
    'september': 8,
    'october': 9,
    'november': 10,
    'december': 11
  };
  
  return months[monthName.toLowerCase()] ?? -1;
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Format date for display in AI context
 */
export function formatDateForContext(date: Date): string {
  return date.toISOString().split('T')[0];
}

