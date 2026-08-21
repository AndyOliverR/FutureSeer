/**
 * @jest-environment node
 */

import {
  buildSeerMessages,
  buildToolSeerMessages,
  STANDARD_JSON_CONSTRAINTS,
} from '@/lib/aiPromptBuilder';

describe('aiPromptBuilder', () => {
  it('orders system slots before history and user', () => {
    const { messages } = buildSeerMessages({
      slots: [
        { kind: 'system', content: 'Core persona' },
        { kind: 'constraints', content: STANDARD_JSON_CONSTRAINTS },
      ],
      history: [{ role: 'user', content: 'Earlier question' }, { role: 'assistant', content: 'Earlier answer' }],
      userMessage: 'Current question',
    });

    expect(messages[0]?.role).toBe('system');
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: 'Current question' });
    const roles = messages.map((m) => m.role);
    expect(roles.filter((r) => r === 'system').length).toBeGreaterThanOrEqual(1);
  });

  it('always includes the user message', () => {
    const { messages } = buildSeerMessages({
      slots: [{ kind: 'system', content: 'x'.repeat(50_000) }],
      userMessage: 'Must survive',
      maxInputTokens: 100,
    });
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: 'Must survive' });
  });

  it('buildToolSeerMessages wraps system + history + user', () => {
    const { messages } = buildToolSeerMessages({
      systemContent: 'Tarot expert',
      userMessage: 'What does my card mean?',
      history: [{ question: 'Hi', answer: 'Hello' }],
    });
    expect(messages[0]?.role).toBe('system');
    const systemText = messages.filter((m) => m.role === 'system').map((m) => String(m.content)).join('\n');
    expect(systemText).toContain('THIS tradition only');
    expect(systemText).toContain('Tarot expert');
    expect(messages[messages.length - 1]).toEqual({
      role: 'user',
      content: 'What does my card mean?',
    });
  });

  it('truncates or drops low-priority slots under tight budget', () => {
    const { droppedSlotIds, truncatedSlotIds } = buildSeerMessages({
      slots: [
        { kind: 'system', content: 'Required', id: 'core' },
        { kind: 'context', content: 'c'.repeat(20_000), id: 'filler' },
      ],
      userMessage: 'Q',
      maxInputTokens: 80,
    });
    expect(droppedSlotIds.includes('filler') || truncatedSlotIds.includes('filler')).toBe(true);
  });
});
