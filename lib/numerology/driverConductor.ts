function reduceToDigitOrMaster(n: number): { master?: number; reduced: number } {
  let current = n
  // Sum digits until <= 22, then preserve 11/22 else reduce to 1-9
  while (current > 22 || (current > 9 && current !== 11 && current !== 22)) {
    current = current
      .toString()
      .split('')
      .reduce((a, b) => a + parseInt(b, 10), 0)
  }
  if (current === 11 || current === 22) return { master: current, reduced: current === 11 ? 2 : 4 }
  return { reduced: current }
}

export function calcDriver(birthDateISO: string | undefined) {
  if (!birthDateISO) return { reduced: null as number | null }
  const parts = birthDateISO.split('-')
  if (parts.length < 3) return { reduced: null as number | null }
  const day = parseInt(parts[2], 10)
  if (!day) return { reduced: null as number | null }
  const { master, reduced } = reduceToDigitOrMaster(day)
  return { master, reduced }
}

export function calcConductor(birthDateISO: string | undefined) {
  if (!birthDateISO) return { reduced: null as number | null }
  const digits = birthDateISO.replace(/\D/g, '').split('')
  if (digits.length === 0) return { reduced: null as number | null }
  const total = digits.reduce((a, d) => a + parseInt(d, 10), 0)
  const { master, reduced } = reduceToDigitOrMaster(total)
  return { master, reduced }
}


