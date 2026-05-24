/**
 * Weekly organic post times (IST primary, UTC for diaspora scheduling).
 * Benchmarks: Later, Buffer, Sprout Social, Publora 2026 — validate with your analytics.
 */

export interface ScheduledPostTime {
  hourIst: number;
  minuteIst: number;
}

export function formatIstTime(hourIst: number, minuteIst: number): string {
  const period = hourIst >= 12 ? 'PM' : 'AM';
  const h12 = hourIst % 12 || 12;
  return `${h12}:${minuteIst.toString().padStart(2, '0')} ${period} IST`;
}

/** Display UTC clock time equivalent to a given IST slot (same calendar day in IST). */
export function istToUtcDisplay(hourIst: number, minuteIst: number): string {
  let totalMinutes = hourIst * 60 + minuteIst - (5 * 60 + 30);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} UTC`;
}

export function formatScheduledTimeDisplay(time: ScheduledPostTime): { ist: string; utc: string } {
  return {
    ist: formatIstTime(time.hourIst, time.minuteIst),
    utc: istToUtcDisplay(time.hourIst, time.minuteIst),
  };
}
