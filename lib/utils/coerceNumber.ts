/**
 * Coerce unknown values to integer for use in numerology and report data.
 * Use toIntegerOrNull when you need a sentinel for "missing", toIntegerOrUndefined otherwise.
 */

export function toIntegerOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isInteger(v) ? v : null
}

export function toIntegerOrUndefined(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isInteger(v) ? v : undefined
}
