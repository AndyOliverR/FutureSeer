/**
 * King Wen figures, lines stored bottom-to-top (line 1 first, 1 = yang).
 * Taken from yi-jing-oracle line_numbers. The package binary field is the reverse
 * and must not be used as a cast key.
 */

export interface KingWenHexagram {
  number: number;
  name: string;
  chinese: string;
  pinyin: string;
  /** Six bits, bottom line first. */
  bottomUp: string;
}

export const KING_WEN_HEXAGRAMS: readonly KingWenHexagram[] = [
  { number: 1, name: 'The Creative', chinese: '乾', pinyin: 'qián', bottomUp: '111111' },
  { number: 2, name: 'The Receptive', chinese: '坤', pinyin: 'kūn', bottomUp: '000000' },
  { number: 3, name: 'Difficulty at the Beginning', chinese: '屯', pinyin: 'zhūn', bottomUp: '100010' },
  { number: 4, name: 'Youthful Folly', chinese: '蒙', pinyin: 'méng', bottomUp: '010001' },
  { number: 5, name: 'Waiting', chinese: '需', pinyin: 'xū', bottomUp: '111010' },
  { number: 6, name: 'Conflict', chinese: '訟', pinyin: 'sòng', bottomUp: '010111' },
  { number: 7, name: 'The Army', chinese: '師', pinyin: 'shī', bottomUp: '010000' },
  { number: 8, name: 'Holding Together', chinese: '比', pinyin: 'bǐ', bottomUp: '000010' },
  { number: 9, name: 'The Taming Power of the Small', chinese: '小畜', pinyin: 'xiǎo chù', bottomUp: '111011' },
  { number: 10, name: 'Conduct', chinese: '履', pinyin: 'lǚ', bottomUp: '110111' },
  { number: 11, name: 'Peace', chinese: '泰', pinyin: 'tài', bottomUp: '111000' },
  { number: 12, name: 'Standstill (Stagnation)', chinese: '否', pinyin: 'pǐ', bottomUp: '000111' },
  { number: 13, name: 'Fellowship with Men', chinese: '同人', pinyin: 'tóng rén', bottomUp: '101111' },
  { number: 14, name: 'Possession in Great Measure', chinese: '大有', pinyin: 'dà yǒu', bottomUp: '111101' },
  { number: 15, name: 'Modesty', chinese: '謙', pinyin: 'qiān', bottomUp: '001000' },
  { number: 16, name: 'Enthusiasm', chinese: '豫', pinyin: 'yù', bottomUp: '000100' },
  { number: 17, name: 'Following', chinese: '隨', pinyin: 'suí', bottomUp: '100110' },
  { number: 18, name: 'Work on What Has Been Spoiled', chinese: '蠱', pinyin: 'gǔ', bottomUp: '011001' },
  { number: 19, name: 'Approach', chinese: '臨', pinyin: 'lín', bottomUp: '110000' },
  { number: 20, name: 'Contemplation (View)', chinese: '觀', pinyin: 'guān', bottomUp: '000011' },
  { number: 21, name: 'Biting Through', chinese: '噬嗑', pinyin: 'shì kè', bottomUp: '100101' },
  { number: 22, name: 'Grace', chinese: '賁', pinyin: 'bì', bottomUp: '101001' },
  { number: 23, name: 'Splitting Apart', chinese: '剝', pinyin: 'bō', bottomUp: '000001' },
  { number: 24, name: 'Return (The Turning Point)', chinese: '復', pinyin: 'fù', bottomUp: '100000' },
  { number: 25, name: 'Innocence (The Unexpected)', chinese: '無妄', pinyin: 'wú wàng', bottomUp: '100111' },
  { number: 26, name: 'The Taming Power of the Great', chinese: '大畜', pinyin: 'dà chù', bottomUp: '111001' },
  { number: 27, name: 'The Corners of the Mouth (Providing Nourishment)', chinese: '頤', pinyin: 'yí', bottomUp: '100001' },
  { number: 28, name: 'Preponderance of the Great', chinese: '大過', pinyin: 'dà guò', bottomUp: '011110' },
  { number: 29, name: 'The Abysmal (Water)', chinese: '坎', pinyin: 'kǎn', bottomUp: '010010' },
  { number: 30, name: 'The Clinging, Fire', chinese: '離', pinyin: 'lí', bottomUp: '101101' },
  { number: 31, name: 'Influence (Wooing)', chinese: '咸', pinyin: 'xián', bottomUp: '001110' },
  { number: 32, name: 'Duration', chinese: '恆', pinyin: 'héng', bottomUp: '011100' },
  { number: 33, name: 'Retreat', chinese: '遯', pinyin: 'dùn', bottomUp: '001111' },
  { number: 34, name: 'The Power of the Great', chinese: '大壯', pinyin: 'dà zhuàng', bottomUp: '111100' },
  { number: 35, name: 'Progress', chinese: '晉', pinyin: 'jìn', bottomUp: '000101' },
  { number: 36, name: 'Darkening of the Light', chinese: '明夷', pinyin: 'míng yí', bottomUp: '101000' },
  { number: 37, name: 'The Family', chinese: '家人', pinyin: 'jiā rén', bottomUp: '101011' },
  { number: 38, name: 'Opposition', chinese: '睽', pinyin: 'kuí', bottomUp: '110101' },
  { number: 39, name: 'Obstruction', chinese: '蹇', pinyin: 'jiǎn', bottomUp: '001010' },
  { number: 40, name: 'Deliverance', chinese: '解', pinyin: 'xiè', bottomUp: '010100' },
  { number: 41, name: 'Decrease', chinese: '損', pinyin: 'sǔn', bottomUp: '110001' },
  { number: 42, name: 'Increase', chinese: '益', pinyin: 'yì', bottomUp: '100011' },
  { number: 43, name: 'Break-through (Resoluteness)', chinese: '夬', pinyin: 'guài', bottomUp: '111110' },
  { number: 44, name: 'Coming to Meet', chinese: '姤', pinyin: 'gòu', bottomUp: '011111' },
  { number: 45, name: 'Gathering Together', chinese: '萃', pinyin: 'cuì', bottomUp: '000110' },
  { number: 46, name: 'Pushing Upward', chinese: '升', pinyin: 'shēng', bottomUp: '011000' },
  { number: 47, name: 'Oppression (Exhaustion)', chinese: '困', pinyin: 'kùn', bottomUp: '010110' },
  { number: 48, name: 'The Well', chinese: '井', pinyin: 'jǐng', bottomUp: '011010' },
  { number: 49, name: 'Revolution (Molting)', chinese: '革', pinyin: 'gé', bottomUp: '101110' },
  { number: 50, name: 'The Caldron', chinese: '鼎', pinyin: 'dǐng', bottomUp: '011101' },
  { number: 51, name: 'The Arousing (Shock, Thunder)', chinese: '震', pinyin: 'zhèn', bottomUp: '100100' },
  { number: 52, name: 'Keeping Still, Mountain', chinese: '艮', pinyin: 'gèn', bottomUp: '001001' },
  { number: 53, name: 'Development (Gradual Progress)', chinese: '漸', pinyin: 'jiàn', bottomUp: '001011' },
  { number: 54, name: 'The Marrying Maiden', chinese: '歸妹', pinyin: 'guī mèi', bottomUp: '110100' },
  { number: 55, name: 'Abundance', chinese: '豐', pinyin: 'fēng', bottomUp: '101100' },
  { number: 56, name: 'The Wanderer', chinese: '旅', pinyin: 'lǚ', bottomUp: '001101' },
  { number: 57, name: 'The Gentle (The Penetrating, Wind)', chinese: '巽', pinyin: 'xùn', bottomUp: '011011' },
  { number: 58, name: 'The Joyous, Lake', chinese: '兌', pinyin: 'duì', bottomUp: '110110' },
  { number: 59, name: 'Dispersion', chinese: '渙', pinyin: 'huàn', bottomUp: '010011' },
  { number: 60, name: 'Limitation', chinese: '節', pinyin: 'jié', bottomUp: '110010' },
  { number: 61, name: 'Inner Truth', chinese: '中孚', pinyin: 'zhōng fú', bottomUp: '110011' },
  { number: 62, name: 'Preponderance of the Small', chinese: '小過', pinyin: 'xiǎo guò', bottomUp: '001100' },
  { number: 63, name: 'After Completion', chinese: '既濟', pinyin: 'jì jì', bottomUp: '101010' },
  { number: 64, name: 'Before Completion', chinese: '未濟', pinyin: 'wèi jì', bottomUp: '010101' },
];

const BY_LINES = new Map(KING_WEN_HEXAGRAMS.map((hex) => [hex.bottomUp, hex.number]));

export function kingWenNumberFromBottomUpLines(pattern: string): number | null {
  return BY_LINES.get(pattern) ?? null;
}

export function kingWenHexagramByNumber(number: number): KingWenHexagram | null {
  return KING_WEN_HEXAGRAMS.find((hex) => hex.number === number) ?? null;
}
