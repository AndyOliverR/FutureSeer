/**
 * Cafe-style labels: 24h hour with 12h equivalent in one line (e.g. "14 = 2 pm").
 * Shared by birth-time pickers and synastry/horary helpers.
 */

/** Parse "HH:mm" or "HH:mm:ss" → hour 0–23, minute 0–59 */
export function parseHourMinuteFromTimeString(time24: string | undefined | null): { hour: number; minute: number } {
  const raw = (time24 || "").trim()
  const [h = "12", m = "0"] = raw.split(":")
  const hour = Math.min(23, Math.max(0, parseInt(h, 10) || 0))
  const minute = Math.min(59, Math.max(0, parseInt(m, 10) || 0))
  return { hour, minute }
}

/** Build "HH:mm" from hour (0–23) and minute */
export function toHHmm(hour: number, minute: number): string {
  const h = Math.min(23, Math.max(0, hour))
  const m = Math.min(59, Math.max(0, minute))
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** 24h "HH:mm" → 12h hour (1–12), minute, AM/PM */
export function time24To12(time24: string): { hour12: number; minute: number; ampm: "AM" | "PM" } {
  const { hour, minute } = parseHourMinuteFromTimeString(time24)
  const hour12 = hour % 12 || 12
  const ampm = hour < 12 ? "AM" : "PM"
  return { hour12, minute, ampm }
}

/** 12h hour (1–12), minute, AM/PM → 24h "HH:mm" */
export function time12To24(hour12: number, minute: number, ampm: "AM" | "PM"): string {
  const m = Math.min(59, Math.max(0, minute))
  let hour24: number
  if (ampm === "AM") {
    hour24 = hour12 === 12 ? 0 : hour12
  } else {
    hour24 = hour12 === 12 ? 12 : hour12 + 12
  }
  return toHHmm(hour24, m)
}

/** Cafe-style label for one hour 0–23 */
export function formatDualHourLabel(hour: number): string {
  const h = Math.min(23, Math.max(0, hour))
  if (h === 0) return "0 midnight"
  if (h === 12) return "12 noon"
  if (h < 12) return `${h} am`
  const pm = h - 12
  return `${h} = ${pm} pm`
}

/** Options for <select> value=0..23 */
export function hourOptionsForSelect(): { value: number; label: string }[] {
  return Array.from({ length: 24 }, (_, h) => ({
    value: h,
    label: formatDualHourLabel(h),
  }))
}
