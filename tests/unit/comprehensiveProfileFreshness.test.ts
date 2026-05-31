import {
  getComprehensiveProfileFreshnessMarker,
  shouldApplyComprehensiveProfileSnapshot,
} from '@/lib/comprehensiveProfileFreshness'

describe('comprehensive profile freshness', () => {
  it('rejects snapshots from an older generation', () => {
    const lastApplied = getComprehensiveProfileFreshnessMarker({
      metadata: { generatedAt: '2026-05-31T10:00:00.000Z' },
    })

    expect(
      shouldApplyComprehensiveProfileSnapshot(
        { metadata: { generatedAt: '2026-05-31T09:59:00.000Z' } },
        lastApplied,
      ),
    ).toBe(false)
  })

  it('applies same-generation snapshots with newer progress', () => {
    const lastApplied = getComprehensiveProfileFreshnessMarker({
      metadata: { generatedAt: '2026-05-31T10:00:00.000Z' },
      lastProgressAt: 1000,
    })

    expect(
      shouldApplyComprehensiveProfileSnapshot(
        {
          metadata: { generatedAt: '2026-05-31T10:00:00.000Z' },
          lastProgressAt: 2000,
        },
        lastApplied,
      ),
    ).toBe(true)
  })

  it('applies same-generation snapshots when another tool becomes ready', () => {
    const lastApplied = getComprehensiveProfileFreshnessMarker({
      metadata: { generatedAt: '2026-05-31T10:00:00.000Z' },
      toolStatus: {
        vedic: { state: 'ready' },
      },
    })

    expect(
      shouldApplyComprehensiveProfileSnapshot(
        {
          metadata: { generatedAt: '2026-05-31T10:00:00.000Z' },
          toolStatus: {
            vedic: { state: 'ready' },
            tarot: { state: 'ready' },
          },
        },
        lastApplied,
      ),
    ).toBe(true)
  })

  it('skips duplicate same-generation snapshots without progress', () => {
    const lastApplied = getComprehensiveProfileFreshnessMarker({
      metadata: { generatedAt: '2026-05-31T10:00:00.000Z' },
      lastProgressAt: 2000,
      toolStatus: {
        vedic: { state: 'ready' },
      },
    })

    expect(
      shouldApplyComprehensiveProfileSnapshot(
        {
          metadata: { generatedAt: '2026-05-31T10:00:00.000Z' },
          lastProgressAt: 2000,
          toolStatus: {
            vedic: { state: 'ready' },
          },
        },
        lastApplied,
      ),
    ).toBe(false)
  })
})
