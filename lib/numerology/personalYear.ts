function reduceToDigitOrMaster(n: number): number {
  // Keep 11 and 22 as master numbers; otherwise reduce to 1-9
  while (n > 22 || (n > 9 && n !== 11 && n !== 22)) {
    n = n
      .toString()
      .split('')
      .reduce((a, b) => a + parseInt(b, 10), 0)
  }
  return n
}

export function calcPersonalYear(birthDateISO: string, year?: number): number | null {
  if (!birthDateISO) return null
  const targetYear = year ?? new Date().getFullYear()
  const [y, m, d] = birthDateISO.split('-').map((s) => parseInt(s, 10))
  if (!y || !m || !d) return null
  const sum = reduceToDigitOrMaster(
    reduceToDigitOrMaster(m) + reduceToDigitOrMaster(d) + reduceToDigitOrMaster(targetYear)
  )
  return sum
}

