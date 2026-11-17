/**
 * Zi Wei Dou Shu chart assembly helpers.
 * iztro timeIndex 0 is early Rat (00:00–01:00) and 12 is late Rat (23:00–24:00).
 * Palaces are ordered from the Yin branch, not from the Life Palace.
 */

export const ZIWEI_CHART_VERSION = 2

/**
 * Map a 24-hour birth time to iztro's double-hour index.
 * Missing or non-numeric hours stay at noon (index 6). Hour 0 must stay 0:
 * `parseInt('00') || 12` would cast midnight as the Horse hour.
 */
export function ziweiTimeIndex(birthTime: string | null | undefined): number {
  const hourToken = String(birthTime ?? '').trim().split(/[:\s]/)[0] ?? ''
  const parsed = parseInt(hourToken, 10)
  const hour = Number.isNaN(parsed) ? 12 : Math.min(23, Math.max(0, parsed))
  if (hour === 23) return 12
  return Math.floor((hour + 1) / 2)
}

export function findZiweiPalace<T extends { name?: unknown; palaceName?: unknown }>(
  palaces: readonly T[] | null | undefined,
  palaceName: string,
): T | undefined {
  const target = palaceName.toLowerCase()
  return palaces?.find((palace) => {
    const name = String(palace.name ?? palace.palaceName ?? '').toLowerCase()
    return name === target
  })
}
