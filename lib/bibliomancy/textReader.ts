/**
 * Load canonical sacred texts from local JSON (build-safe; no runtime fetch).
 * Seeded random selection for reproducibility.
 */

import path from 'path';
import fs from 'fs';

export type SacredTextId = 'bible' | 'quran' | 'gita' | 'torah' | 'hafez';

const DATA_DIR = path.join(process.cwd(), 'lib', 'bibliomancy', 'data');

function loadJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/** Seeded PRNG (simple LCG) for reproducible selection */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

interface BibleVerse {
  verseNumber: number;
  text: string;
}
interface BibleChapter {
  chapterNumber: number;
  verses: BibleVerse[];
}
interface BibleBook {
  id: string;
  name: string;
  shortName: string;
  chapters: BibleChapter[];
}
interface BibleData {
  version: string;
  books: BibleBook[];
}

export function loadBible(): BibleData {
  return loadJson<BibleData>('bible.json');
}

export function pickBibleVerse(rand: () => number): { citation: string; text: string; version: string } {
  const data = loadBible();
  const book = data.books[Math.floor(rand() * data.books.length)];
  const chapter = book.chapters[Math.floor(rand() * book.chapters.length)];
  const verse = chapter.verses[Math.floor(rand() * chapter.verses.length)];
  return {
    citation: `${book.name} ${chapter.chapterNumber}:${verse.verseNumber}`,
    text: verse.text,
    version: data.version,
  };
}

interface QuranAyah {
  number: number;
  text: string;
}
interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  ayahs: QuranAyah[];
}
interface QuranData {
  version: string;
  surahs: QuranSurah[];
}

export function loadQuran(): QuranData {
  return loadJson<QuranData>('quran.json');
}

export function pickQuranAyah(rand: () => number): { citation: string; text: string; version: string } {
  const data = loadQuran();
  const surah = data.surahs[Math.floor(rand() * data.surahs.length)];
  const ayah = surah.ayahs[Math.floor(rand() * surah.ayahs.length)];
  return {
    citation: `Surah ${surah.englishName} (${surah.name}), ${ayah.number}`,
    text: ayah.text,
    version: data.version,
  };
}

interface GitaVerse {
  verseNumber: number;
  text: string;
  sanskrit?: string;
}
interface GitaChapter {
  chapterNumber: number;
  name: string;
  verses: GitaVerse[];
}
interface GitaData {
  version: string;
  chapters: GitaChapter[];
}

export function loadGita(): GitaData {
  return loadJson<GitaData>('gita.json');
}

export function pickGitaVerse(rand: () => number): { citation: string; text: string; version: string; sanskrit?: string } {
  const data = loadGita();
  const chapter = data.chapters[Math.floor(rand() * data.chapters.length)];
  const verse = chapter.verses[Math.floor(rand() * chapter.verses.length)];
  return {
    citation: `Bhagavad Gita ${chapter.chapterNumber}.${verse.verseNumber} (${chapter.name})`,
    text: verse.text,
    version: data.version,
    sanskrit: verse.sanskrit,
  };
}

interface TorahVerse {
  verseNumber: number;
  text: string;
}
interface TorahChapter {
  chapterNumber: number;
  verses: TorahVerse[];
}
interface TorahBook {
  id: string;
  name: string;
  shortName: string;
  chapters: TorahChapter[];
}
interface TorahData {
  version: string;
  books: TorahBook[];
}

export function loadTorah(): TorahData {
  return loadJson<TorahData>('torah.json');
}

export function pickTorahVerse(rand: () => number): { citation: string; text: string; version: string } {
  const data = loadTorah();
  const book = data.books[Math.floor(rand() * data.books.length)];
  const chapter = book.chapters[Math.floor(rand() * book.chapters.length)];
  const verse = chapter.verses[Math.floor(rand() * chapter.verses.length)];
  return {
    citation: `${book.name} ${chapter.chapterNumber}:${verse.verseNumber}`,
    text: verse.text,
    version: data.version,
  };
}

interface HafezCouplet {
  lineNumber: number;
  persian: string;
  english: string;
}
interface HafezPoem {
  id: number;
  couplets: HafezCouplet[];
  themeHint?: string;
}
interface HafezData {
  version: string;
  poems: HafezPoem[];
}

export function loadHafez(): HafezData {
  return loadJson<HafezData>('hafez.json');
}

export function pickHafezPoem(rand: () => number): { citation: string; text: string; version: string; themeHint?: string } {
  const data = loadHafez();
  const poem = data.poems[Math.floor(rand() * data.poems.length)];
  const couplet = poem.couplets[Math.floor(rand() * poem.couplets.length)];
  const text = `${couplet.english} (${couplet.persian})`;
  return {
    citation: `Hafez, Ghazal ${poem.id}, line ${couplet.lineNumber}`,
    text,
    version: data.version,
    themeHint: poem.themeHint,
  };
}

export function pickPassage(
  textId: SacredTextId,
  rand: () => number
): { citation: string; text: string; version: string; sanskrit?: string; themeHint?: string } {
  switch (textId) {
    case 'bible':
      return pickBibleVerse(rand);
    case 'quran':
      return pickQuranAyah(rand);
    case 'gita':
      return pickGitaVerse(rand);
    case 'torah':
      return pickTorahVerse(rand);
    case 'hafez':
      return pickHafezPoem(rand);
    default:
      return pickBibleVerse(rand);
  }
}
