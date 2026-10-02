import {
  mysticalProfileLooksGenerated,
  shouldApplyProfileSnapshot,
  stampMysticalProfileMetadata,
} from '@/lib/mysticalProfileFreshness'

describe('shouldApplyProfileSnapshot', () => {
  const older = '2026-08-01T00:00:00.000Z'
  const newer = '2026-09-03T12:00:00.000Z'

  it('applies a snapshot whose generatedAt matches the profile already shown', () => {
    expect(shouldApplyProfileSnapshot(newer, newer)).toBe(true)
  })

  it('applies a newer snapshot and ignores a strictly older one', () => {
    expect(shouldApplyProfileSnapshot(newer, older)).toBe(true)
    expect(shouldApplyProfileSnapshot(older, newer)).toBe(false)
  })

  it('applies when either timestamp is missing', () => {
    expect(shouldApplyProfileSnapshot(undefined, newer)).toBe(true)
    expect(shouldApplyProfileSnapshot(newer, null)).toBe(true)
  })
})

describe('stampMysticalProfileMetadata', () => {
  it('keeps existing metadata keys and advances generatedAt', () => {
    const stamped = stampMysticalProfileMetadata(
      { source: 'profile_generation_orchestrator', version: '2.0', generatedAt: '2026-08-01T00:00:00.000Z' },
      Date.parse('2026-10-02T11:00:00.000Z'),
    )
    expect(stamped.source).toBe('profile_generation_orchestrator')
    expect(stamped.version).toBe('2.0')
    expect(stamped.generatedAt).toBe('2026-10-02T11:00:00.000Z')
  })

  it('creates metadata when the stored profile has none', () => {
    const stamped = stampMysticalProfileMetadata(undefined, Date.parse('2026-10-02T11:00:00.000Z'))
    expect(stamped.generatedAt).toBe('2026-10-02T11:00:00.000Z')
  })
})

describe('mysticalProfileLooksGenerated', () => {
  it('treats a catalog chart without metadata.generatedAt as generated', () => {
    expect(mysticalProfileLooksGenerated({ vedic: { planets: [{ name: 'Moon', sign: 'Libra' }] } })).toBe(true)
    expect(mysticalProfileLooksGenerated({ western: { sunSign: 'Virgo' } })).toBe(true)
  })

  it('stays false for an empty profile', () => {
    expect(mysticalProfileLooksGenerated(null)).toBe(false)
    expect(mysticalProfileLooksGenerated({})).toBe(false)
    expect(mysticalProfileLooksGenerated({ metadata: {} })).toBe(false)
  })
})
