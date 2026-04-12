import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { buildMysticalCardSnippet } from '@/lib/mysticalProfilePositiveSnippet'

function assertNoJsonLeak(text: string) {
  expect(text).not.toMatch(/\{"comprehensiveAnalysis"/)
  expect(text).not.toMatch(/^\s*[\[{]/)
  expect(text).not.toContain('"profile":')
}

describe('buildToolTeaser — no raw JSON in user-facing hook lines', () => {
  it('astrocartography uses summarySnapshot prose, not JSON', () => {
    const report = {
      comprehensiveAnalysis: {
        summarySnapshot: 'Career: MC line, Relationships: DSC emphasis for relocation timing.',
      },
    }
    const t = buildToolTeaser('astrocartography', report)
    assertNoJsonLeak(t.hookLine)
    expect(t.hookLine).toContain('Astrocartography')
    expect(t.hookLine).toContain('MC line')
  })

  it('astrocartography falls back cleanly when only nested objects exist', () => {
    const report = {
      comprehensiveAnalysis: {
        ingressDatetime: '2026-03-20T15:00:00.000Z',
        chartSummary: { nested: true },
      },
    }
    const t = buildToolTeaser('astrocartography', report)
    assertNoJsonLeak(t.hookLine)
    expect(t.hookLine).toMatch(/top \d+%/)
  })

  it('mundaneAstrology avoids JSON in hook line', () => {
    const report = {
      comprehensiveAnalysis: {
        chartOverview: 'Ingress-heavy quarter with emphasis on cardinal shifts.',
      },
    }
    const t = buildToolTeaser('mundaneAstrology', report)
    assertNoJsonLeak(t.hookLine)
    expect(t.hookLine).toContain('Mundane astrology')
  })

  it('tarot uses card names from profile, not raw profile JSON', () => {
    const report = {
      data: {
        profile: {
          birthCard: { name: 'The Star', numerology: 17 },
          lifePathCard: { name: 'Justice', numerology: 11 },
        },
      },
    }
    const t = buildToolTeaser('tarot', report)
    assertNoJsonLeak(t.hookLine)
    expect(t.hookLine).toContain('Justice')
    expect(t.hookLine).toContain('The Star')
  })

  it('iching with empty question does not append JSON blob', () => {
    const report = {
      hexagram: {
        element: 'Metal',
        name: 'Youthful Folly',
        chineseName: '蒙',
      },
      comprehensiveAnalysis: {
        deep: { only: 'objects' },
      },
    }
    const t = buildToolTeaser('iching', report)
    assertNoJsonLeak(t.hookLine)
    expect(t.hookLine).toMatch(/iching/i)
  })

  it('bibliomancy prefers interpretation strings over structure', () => {
    const report = {
      interpretations: {
        ambiguity: "Hafez's poetry is intentionally ambiguous for layered counsel and timing.",
      },
    }
    const t = buildToolTeaser('bibliomancy', report)
    assertNoJsonLeak(t.hookLine)
    expect(t.hookLine).toMatch(/Bibliomancy/i)
    expect(t.hookLine.toLowerCase()).toContain('hafez')
  })

  it('generic slug never embeds JSON.stringify output', () => {
    const report = {
      comprehensiveAnalysis: {
        foo: { bar: 1 },
        noProseHere: true,
      },
    }
    const t = buildToolTeaser('someFutureToolSlug', report)
    assertNoJsonLeak(t.hookLine)
    expect(t.hookLine).toMatch(/top \d+%/)
  })
})

describe('buildMysticalCardSnippet', () => {
  it('primary line for astrocartography has no JSON leak', () => {
    const { primaryLine, secondaryLine } = buildMysticalCardSnippet('astrocartography', {
      comprehensiveAnalysis: {
        summarySnapshot: 'Relocation lines favor creative hubs in the next cycle.',
      },
    })
    assertNoJsonLeak(primaryLine)
    assertNoJsonLeak(secondaryLine)
  })
})
