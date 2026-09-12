/**
 * @jest-environment node
 *
 * Tool Ask-the-Seer POSTs debit in enforceToolSeerGate before the LLM runs.
 * These chat UIs must not auto-retry 5xx or thrown fetches: a single send would
 * consume the per-tool free instance and then charge PAYG credits.
 */
import fs from 'fs'

const BILLED_SEER_CHAT_SOURCES: Array<{ rel: string; src: string }> = [
  {
    rel: 'components/FaceReadingSeerChatInterface.tsx',
    src: fs.readFileSync('components/FaceReadingSeerChatInterface.tsx', 'utf8'),
  },
  {
    rel: 'components/RunesSeerChatInterface.tsx',
    src: fs.readFileSync('components/RunesSeerChatInterface.tsx', 'utf8'),
  },
  {
    rel: 'components/KPSeerChatInterface.tsx',
    src: fs.readFileSync('components/KPSeerChatInterface.tsx', 'utf8'),
  },
  {
    rel: 'components/HorarySeerChatInterface.tsx',
    src: fs.readFileSync('components/HorarySeerChatInterface.tsx', 'utf8'),
  },
  {
    rel: 'components/FengShuiSeerChatInterface.tsx',
    src: fs.readFileSync('components/FengShuiSeerChatInterface.tsx', 'utf8'),
  },
  {
    rel: 'components/DreamSymbolsSeerChatInterface.tsx',
    src: fs.readFileSync('components/DreamSymbolsSeerChatInterface.tsx', 'utf8'),
  },
]

describe('billed tool Seer chat UIs do not auto-retry', () => {
  it.each(BILLED_SEER_CHAT_SOURCES)('$rel posts the billed request once', ({ src }) => {
    expect(src).not.toMatch(/RETRY_DELAY_MS/)
    expect(src).not.toMatch(/isRetryableStatus/)
    expect(src).not.toMatch(/retryResponse/)
    const performFetchCalls = src.match(/await performFetch\(\)/g) ?? []
    expect(performFetchCalls).toHaveLength(1)
    expect(src).toMatch(/Do not auto-retry/)
  })
})
