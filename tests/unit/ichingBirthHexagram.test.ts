import { buildBirthHexagram } from '@/lib/ichingBirthHexagram'

describe('buildBirthHexagram', () => {
  it('returns six yin/yang lines instead of empty placeholders', () => {
    const hex = buildBirthHexagram('1990-06-15')
    expect(hex.lines).toHaveLength(6)
    expect(hex.lines.every((line) => line.yinYang === 'yin' || line.yinYang === 'yang')).toBe(true)
    expect(hex.lines.every((line) => line.text.length > 0)).toBe(true)
    expect(hex.changingLines).toEqual([])
  })
})
