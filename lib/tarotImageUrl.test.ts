import { resolveTarotCardImageSrc } from '@/lib/tarotImageUrl'

describe('resolveTarotCardImageSrc', () => {
  it('prefixes bare filename with /tarot/', () => {
    expect(resolveTarotCardImageSrc({ name: 'The Magician', image: 'major_01_the_magician.png.png' })).toBe(
      '/tarot/major_01_the_magician.png.png'
    )
  })

  it('leaves absolute app paths unchanged', () => {
    expect(resolveTarotCardImageSrc({ name: 'The Fool', image: '/tarot/major_00_the_fool.png.png' })).toBe(
      '/tarot/major_00_the_fool.png.png'
    )
  })

  it('uses name lookup when image missing', () => {
    const s = resolveTarotCardImageSrc({ name: 'The Magician', image: '' })
    expect(s).toContain('magician')
    expect(s.startsWith('/')).toBe(true)
  })
})
