import { tarotIntelligence } from '@/lib/tarotIntelligence';

describe('TarotIntelligence matrix-whisper spread', () => {
  it('exposes Matrix + Whisper in available spreads', () => {
    const spreads = tarotIntelligence.getAvailableSpreads();
    const matrix = spreads.find((s) => s.key === 'matrix-whisper');
    expect(matrix).toBeDefined();
    expect(matrix?.positions).toHaveLength(6);
    expect(matrix?.positions[0]).toBe('Whisper (Blind Spot)');
  });

  it('draws cards with signal gravity for matrix-whisper', async () => {
    const reading = await tarotIntelligence.drawCards(
      'What pattern am I missing?',
      'Matrix + Whisper Spread',
    );
    expect(reading.spreadType).toBe('matrix-whisper');
    expect(reading.cards).toHaveLength(6);
    for (const card of reading.cards) {
      expect((card as { signalGravity?: string }).signalGravity).toMatch(/fleeting|moderate|major/);
    }
    expect(reading.recommendations.some((r) => r.includes('Whisper'))).toBe(true);
  });
});
