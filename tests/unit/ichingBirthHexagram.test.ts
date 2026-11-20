import { buildBirthHexagram } from '@/lib/ichingBirthHexagram'
import { kingWenHexagramByNumber } from '@/lib/iching/kingWenLines'

describe('buildBirthHexagram', () => {
  it('returns six yin/yang lines instead of empty placeholders', () => {
    const hex = buildBirthHexagram('1990-06-15')
    expect(hex.lines).toHaveLength(6)
    expect(hex.lines.every((line) => line.yinYang === 'yin' || line.yinYang === 'yang')).toBe(true)
    expect(hex.lines.every((line) => line.text.length > 0)).toBe(true)
    expect(hex.changingLines).toEqual([])
  })

  it('uses the King Wen lines for that number, not the binary of number minus one', () => {
    const hex = buildBirthHexagram('1990-06-15')
    const canonical = kingWenHexagramByNumber(hex.number)
    const drawn = hex.lines.map((line) => (line.yinYang === 'yang' ? '1' : '0')).join('')
    const indexedBottomUp = (hex.number - 1).toString(2).padStart(6, '0').split('').reverse().join('')
    expect(drawn).toBe(canonical?.bottomUp)
    expect(drawn).not.toBe(indexedBottomUp)
  })
})
