/**
 * @jest-environment node
 */

import { getDocument, setDocument } from '@/lib/firebase-admin'
import { persistOnDemandToolReports } from '@/lib/onDemandToolReports'

jest.mock('@/lib/firebase-admin', () => ({
  getDocument: jest.fn(),
  setDocument: jest.fn(),
}))

jest.mock('@/lib/universalDataAggregator', () => ({
  clearCachedDivinationData: jest.fn(),
}))

jest.mock('@/lib/profileGenerationOrchestrator', () => ({
  ALL_TOOL_SLUGS: ['vedic', 'western'],
  classifyToolReportState: () => 'ready',
  isReadyToolReport: () => true,
  summarizeToolReadiness: () => ({
    allReportsReady: false,
    pendingToolSlugs: ['western'],
    readyToolsCount: 1,
  }),
  runProfileGenerationToolSlugs: jest.fn(),
}))

const mockGetDocument = getDocument as jest.MockedFunction<typeof getDocument>
const mockSetDocument = setDocument as jest.MockedFunction<typeof setDocument>

describe('persistOnDemandToolReports metadata stamp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSetDocument.mockResolvedValue(true)
  })

  it('bumps metadata.generatedAt while keeping prior metadata keys', async () => {
    mockGetDocument.mockImplementation(async (collection: string) => {
      if (collection === 'comprehensiveMysticalProfiles') {
        return {
          metadata: {
            source: 'profile_generation_orchestrator',
            version: '2.0',
            generatedAt: '2026-08-01T00:00:00.000Z',
          },
          vedic: { planets: [{ name: 'Moon', sign: 'Cancer' }] },
        }
      }
      return null
    })

    await persistOnDemandToolReports({
      uid: 'user-1',
      profileHash: 'hash-new',
      toolReports: {
        vedic: {
          status: 'success',
          data: { planets: [{ name: 'Moon', sign: 'Libra' }] },
          generatedAt: '2026-10-02T11:00:00.000Z',
        },
      },
    })

    const profileWrite = mockSetDocument.mock.calls.find(
      (call) => call[0] === 'comprehensiveMysticalProfiles',
    )
    expect(profileWrite).toBeDefined()
    const patch = profileWrite?.[2] as {
      metadata?: { source?: string; version?: string; generatedAt?: string }
      vedic?: { planets?: Array<{ sign?: string }> }
      lastUpdated?: number
    }
    expect(patch.metadata?.source).toBe('profile_generation_orchestrator')
    expect(patch.metadata?.version).toBe('2.0')
    expect(patch.metadata?.generatedAt).not.toBe('2026-08-01T00:00:00.000Z')
    expect(typeof patch.metadata?.generatedAt).toBe('string')
    expect(patch.vedic?.planets?.[0]?.sign).toBe('Libra')
    expect(typeof patch.lastUpdated).toBe('number')
  })
})
