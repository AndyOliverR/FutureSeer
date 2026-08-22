import { getChartTokens } from '@/lib/charts/visualTokens'
import { CHART_SVG_FONT_FAMILY } from '@/lib/charts/svgTypography'

describe('chart visual tokens', () => {
  it('uses white paper for every chart system', () => {
    expect(getChartTokens('western').background).toBe('#ffffff')
    expect(getChartTokens('vedic').background).toBe('#ffffff')
    expect(getChartTokens('nakshatra').background).toBe('#ffffff')
    expect(getChartTokens('kp').background).toBe('#ffffff')
    expect(getChartTokens('numerology').background).toBe('#ffffff')
    expect(getChartTokens('vastu').background).toBe('#ffffff')
    expect(getChartTokens('fengshui').background).toBe('#ffffff')
    expect(getChartTokens('western').textPrimary).toBe('#0f172a')
    expect(getChartTokens('vedic').ringStroke).toBe('#3b82f6')
  })

  it('keeps SVG type on the Inter stack from globals', () => {
    expect(CHART_SVG_FONT_FAMILY).toContain('--font-inter')
    expect(CHART_SVG_FONT_FAMILY.toLowerCase()).not.toContain('arial')
  })
})
