/**
 * 45 energy-field names (Vastu Purusha mandala quick reference).
 * Source: Anant Vastu — "Complete List of 45 Vastu Devtas (Quick Reference Table)"
 * https://www.anantvastu.com/blog/vastu-purusha-mandala-decoded/
 *
 * The classical mandala is grid-based; this app maps equal 8° compass sectors to these
 * names in rotation (see degreesTo45FieldLabel in vastuDirections.ts). Different
 * schools order or name fields differently — not a universal standard.
 */

export const VASTU_45_REFERENCE_URL = 'https://www.anantvastu.com/blog/vastu-purusha-mandala-decoded/';

/** Table order: Brahma (center in mandala) through Bhujag. Used with angular offset for compass ring. */
export const VASTU_45_DEVTA_NAMES = [
  'Brahma',
  'Bhudhar',
  'Aryama',
  'Vivaswaan',
  'Mitra',
  'Apaha',
  'Apahavatsa',
  'Savita',
  'Savitur',
  'Indra',
  'Indrajaya',
  'Rudra',
  'Rajyakshma',
  'Aditi',
  'Diti',
  'Shikhi',
  'Parjanya',
  'Brisha',
  'Akash',
  'Anila',
  'Pusha',
  'Bhringraj',
  'Mrigah',
  'Pitra',
  'Dauwarik',
  'Shosha',
  'Papyakshama',
  'Roga',
  'Naga',
  'Jayant',
  'Mahendra',
  'Surya',
  'Satya',
  'Vitatha',
  'Gurhakshat',
  'Yama',
  'Gandharva',
  'Sugreev',
  'Pushpadant',
  'Varun',
  'Asur',
  'Mukhya',
  'Bhallat',
  'Soma',
  'Bhujag',
] as const;

export const VASTU_45_COUNT = VASTU_45_DEVTA_NAMES.length;
