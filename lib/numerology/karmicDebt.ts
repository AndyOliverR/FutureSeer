const KD_SET = new Set([13, 14, 16, 19])

export function detectKarmicDebtNumbers(values: Array<number | undefined | null>): number[] {
  const unique = new Set<number>()
  for (const v of values) {
    const n = typeof v === 'number' ? v : undefined
    if (n !== undefined && KD_SET.has(n)) unique.add(n)
  }
  return Array.from(unique).sort((a, b) => a - b)
}

export function karmicDebtShortMeaning(num: number): string {
  switch (num) {
    case 13:
      return 'Work ethic lesson: persistence over shortcuts.'
    case 14:
      return 'Freedom with discipline: avoid excess and extremes.'
    case 16:
      return 'Ego humility: rebuild on spiritual foundations.'
    case 19:
      return 'Self-reliance vs. isolation: lead with service.'
    default:
      return ''
  }
}

