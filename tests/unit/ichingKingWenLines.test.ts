import { buildBirthHexagram } from '@/lib/ichingBirthHexagram';
import {
  KING_WEN_HEXAGRAMS,
  kingWenHexagramByNumber,
  kingWenNumberFromBottomUpLines,
} from '@/lib/iching/kingWenLines';

describe('King Wen line lookup', () => {
  it('keeps The Army distinct from Dispersion when later map keys used to overwrite it', () => {
    // Bottom-to-top. The old table stored 010000 as both 7 and 59, and Map kept 59.
    expect(kingWenNumberFromBottomUpLines('010000')).toBe(7);
    expect(kingWenNumberFromBottomUpLines('000010')).toBe(8);
    expect(kingWenNumberFromBottomUpLines('110111')).toBe(10);
    expect(kingWenNumberFromBottomUpLines('111110')).toBe(43);
  });

  it('resolves figures the old table had assigned to a different hexagram or dropped', () => {
    expect(kingWenNumberFromBottomUpLines('010011')).toBe(59);
    expect(kingWenNumberFromBottomUpLines('110010')).toBe(60);
    expect(kingWenNumberFromBottomUpLines('101010')).toBe(63);
    expect(kingWenNumberFromBottomUpLines('010101')).toBe(64);
    expect(kingWenNumberFromBottomUpLines('101011')).toBe(37);
    expect(kingWenNumberFromBottomUpLines('001100')).toBe(62);
  });

  it('has one unique figure for each of the 64 hexagrams', () => {
    expect(KING_WEN_HEXAGRAMS).toHaveLength(64);
    const figures = new Set(KING_WEN_HEXAGRAMS.map((hex) => hex.bottomUp));
    expect(figures.size).toBe(64);
    expect(kingWenHexagramByNumber(7)?.name).toBe('The Army');
    expect(kingWenHexagramByNumber(63)?.bottomUp).toBe('101010');
  });
});

describe('buildBirthHexagram lines', () => {
  it('draws the King Wen figure for the numbered hexagram', () => {
    const hex = buildBirthHexagram('1990-06-15');
    const canonical = kingWenHexagramByNumber(hex.number);
    const drawn = hex.lines.map((line) => (line.yinYang === 'yang' ? '1' : '0')).join('');
    const indexedBottomUp = (hex.number - 1).toString(2).padStart(6, '0').split('').reverse().join('');
    expect(drawn).toBe(canonical?.bottomUp);
    expect(hex.name).toBe(canonical?.name);
    expect(drawn).not.toBe(indexedBottomUp);
  });
});
