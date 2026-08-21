/**
 * @jest-environment node
 */

import {
  historyFromSeerBody,
  seerConversationHistoryFromMessages,
  wantsDeeperSeerAnswer,
  SEER_CHAT_VOICE,
  SEER_TOOL_CHAT_VOICE,
} from '@/lib/seerChatVoice'
import {
  buildIdentityDossier,
  compactReportSlice,
  formatReadyToolsIndex,
  formatSeerMasterForPrompt,
  pickRelevantToolSlugs,
} from '@/lib/mainSeerContext'
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { getSeerMaxTokens } from '@/lib/seerModel'

describe('seerChatVoice', () => {
  it('detects a request to go deeper', () => {
    expect(wantsDeeperSeerAnswer('Go deeper on my career')).toBe(true)
    expect(wantsDeeperSeerAnswer('What should I focus on this week?')).toBe(false)
  })

  it('pairs thread messages into question/answer turns', () => {
    const history = historyFromSeerBody({
      thread: [
        { role: 'user', content: 'How is my career?' },
        { role: 'seer', content: 'Stay with the current role through autumn.' },
        { role: 'user', content: 'And love?' },
        { role: 'assistant', content: 'Partnership timing opens later this year.' },
      ],
    })
    expect(history).toEqual([
      { question: 'How is my career?', answer: 'Stay with the current role through autumn.' },
      { question: 'And love?', answer: 'Partnership timing opens later this year.' },
    ])
  })

  it('builds history from UI messages', () => {
    const history = seerConversationHistoryFromMessages([
      { type: 'user', content: 'Hi' },
      { type: 'seer', content: 'Hello' },
    ])
    expect(history[0]).toEqual({ question: 'Hi', answer: 'Hello' })
  })
})

describe('mainSeerContext', () => {
  it('builds an identity dossier without asking for known fields', () => {
    const text = buildIdentityDossier({
      uid: 'u1',
      email: 'a@b.c',
      displayName: 'Asha',
      fullName: 'Asha Rao',
      birthDate: '1990-06-15',
      birthTime: '14:30:00',
      birthPlace: 'Mumbai, India',
      gender: 'female',
      currentLocation: 'London',
      facePhotoUrl: 'https://example.com/face.jpg',
      palmPhotoUrl: undefined,
    } as never)
    expect(text).toContain('Asha Rao')
    expect(text).toContain('1990-06-15')
    expect(text).toContain('female')
    expect(text).toContain('London')
    expect(text).toContain('Face photo on file: yes')
    expect(text).toContain('Palm photo on file: no')
    expect(text).toContain('do not ask them to re-enter')
  })

  it('omits empty identity fields', () => {
    const text = buildIdentityDossier({ uid: 'u1', email: 'a@b.c' } as never)
    expect(text).not.toContain('Date of birth')
    expect(text).toContain('Face photo on file: no')
  })

  it('picks career slugs and caps at 4 unless deeper', () => {
    const ready = ['vedic', 'western', 'kp', 'numerology', 'humanDesign', 'tarot', 'synastry']
    expect(pickRelevantToolSlugs('Should I change jobs this year?', ready)).toEqual([
      'vedic',
      'western',
      'kp',
      'numerology',
    ])
    expect(pickRelevantToolSlugs('Go deeper — tell me more about my career', ready, { deeper: true })).toHaveLength(5)
  })

  it('picks love slugs', () => {
    const ready = ['synastry', 'vedic', 'western', 'tarot', 'kp']
    expect(pickRelevantToolSlugs('Will I get married soon?', ready)[0]).toBe('synastry')
  })

  it('falls back to default slugs', () => {
    const ready = ['vedic', 'western', 'numerology', 'tarot']
    expect(pickRelevantToolSlugs('Give me a reading for today.', ready)).toEqual(ready)
  })

  it('formats seer master and truncates slices', () => {
    expect(formatSeerMasterForPrompt(null)).toContain('not generated yet')
    expect(formatSeerMasterForPrompt({ core_identity: ['steady'] })).toContain('steady')
    expect(compactReportSlice({ a: 1 }, 20)).toContain('a')
    expect(compactReportSlice({ blob: 'x'.repeat(5000) }, 80).endsWith('…[truncated]')).toBe(true)
  })

  it('lists ready vs pending tools', () => {
    const text = formatReadyToolsIndex(['vedic'], ['tarot'])
    expect(text).toContain('vedic')
    expect(text).toContain('tarot')
  })
})

describe('getSeerMaxTokens', () => {
  const paid = process.env.SEER_MAX_TOKENS_PAID
  const free = process.env.SEER_MAX_TOKENS_FREE
  afterEach(() => {
    if (paid === undefined) delete process.env.SEER_MAX_TOKENS_PAID
    else process.env.SEER_MAX_TOKENS_PAID = paid
    if (free === undefined) delete process.env.SEER_MAX_TOKENS_FREE
    else process.env.SEER_MAX_TOKENS_FREE = free
  })

  it('defaults to conversational budgets', () => {
    delete process.env.SEER_MAX_TOKENS_PAID
    delete process.env.SEER_MAX_TOKENS_FREE
    expect(getSeerMaxTokens(false)).toBe(800)
    expect(getSeerMaxTokens(true)).toBe(1000)
    expect(getSeerMaxTokens(false, true)).toBe(1200)
    expect(getSeerMaxTokens(true, true)).toBe(1500)
  })
})

describe('buildToolSeerMessages chat voice', () => {
  it('injects the shared tool chat-voice contract', () => {
    const { messages } = buildToolSeerMessages({
      systemContent: 'Tarot expert',
      userMessage: 'What does my card mean?',
    })
    const systemText = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n')
    expect(systemText).toContain(SEER_TOOL_CHAT_VOICE.slice(0, 40))
    expect(systemText).toContain('Tarot expert')
    expect(SEER_CHAT_VOICE).toContain('one expert')
  })
})
