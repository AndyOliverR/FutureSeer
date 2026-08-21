import { getChartTokens } from '@/lib/charts/visualTokens'
import { CHART_SVG_FONT_FAMILY } from '@/lib/charts/svgTypography'

describe('chart visual tokens', () => {
  it('uses cosmic dark tokens for western and vedic (not ivory print)', () => {
    expect(getChartTokens('western').background).toBe('#0b1220')
    expect(getChartTokens('vedic').background).toBe('#0b1220')
    expect(getChartTokens('western').textPrimary).toBe('#f8fafc')
    expect(getChartTokens('vedic').ringStroke).toBe('#e2b659')
  })

  it('keeps SVG type on the Inter stack from globals', () => {
    expect(CHART_SVG_FONT_FAMILY).toContain('--font-inter')
    expect(CHART_SVG_FONT_FAMILY.toLowerCase()).not.toContain('arial')
  })
})
