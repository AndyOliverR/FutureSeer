import { collapseDuplicateReportFields } from '@/lib/reportDedup'
import {
  hasToolReportExtraInputs,
  sanitizeToolReportExtraInputs,
  mergeExtraInputsOntoProfile,
} from '@/lib/toolReportExtraInputs'

describe('toolReportExtraInputs', () => {
  it('rejects empty objects', () => {
    expect(sanitizeToolReportExtraInputs({})).toBeUndefined()
    expect(hasToolReportExtraInputs({})).toBe(false)
  })

  it('clips and keeps a horary question payload', () => {
    const extra = sanitizeToolReportExtraInputs({
      question: '  Will the job offer arrive this month?  ',
      questionTime: '14:30:00',
      questionPlace: 'London, UK',
    })
    expect(extra?.question).toBe('Will the job offer arrive this month?')
    expect(hasToolReportExtraInputs(extra)).toBe(true)
  })

  it('merges partner fields onto a profile record', () => {
    const merged = mergeExtraInputsOntoProfile(
      { displayName: 'A' },
      { partnerName: 'B', partnerBirthDate: '1990-01-01', partnerBirthTime: '12:00:00', partnerBirthPlace: 'Paris' },
    )
    expect(merged.partnerBirthDate).toBe('1990-01-01')
    expect(merged.partnerDateOfBirth).toBe('1990-01-01')
  })
})

describe('collapseDuplicateReportFields', () => {
  it('drops an overview that restates executive_summary', () => {
    const summary = 'Your chart emphasises discipline, timing, and long-range structure in career matters.'
    const out = collapseDuplicateReportFields({
      executive_summary: summary,
      overview: summary,
      keyInsights: [summary, 'A distinct second insight about relationships.'],
    })
    expect(out.overview).toBeUndefined()
    expect(out.keyInsights).toEqual(['A distinct second insight about relationships.'])
  })
})
