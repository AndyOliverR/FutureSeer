export function buildLoShuCounts(birthDateISO: string) {
  const digits = (birthDateISO || '').replace(/\D/g, '').split('')
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
  for (const d of digits) {
    const n = parseInt(d, 10)
    if (n >= 1 && n <= 9) counts[n] += 1
  }
  const missing = (Object.keys(counts) as unknown as number[]).filter((n) => counts[n] === 0)
  return { counts, missing }
}

export function isNumberMissing(counts: Record<number, number>, num: number): boolean {
  return (counts[num] || 0) === 0
}

