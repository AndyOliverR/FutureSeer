/**
 * Navaratna Database
 * Complete database of the nine gemstones (Navaratna) corresponding to the nine planets (Navagrahas)
 * Based on Vedic Jyotish principles
 */

export interface NavaratnaGemstone {
  planet: string;
  planetSanskrit: string;
  gemstone: {
    english: string;
    sanskrit: string;
    alternativeNames: string[];
    imagePath?: string; // e.g., '/gemstones/photos/ruby.png'
    iconPath?: string;  // e.g., '/gemstones/icons/ruby.svg'
  };
  element: string;
  day: string;
  time: string;
  metal: string;
  finger: string;
  hand: string;
  pendant: boolean;
  skinContact: string;
  purification: string;
  mantra: string;
  chanting: string;
  paksha: string;
  simplicity: string;
  special?: string;
  weight: {
    min: string;
    max: string;
    ideal: string;
    note: string;
  };
  benefits: string[];
  contraindications: string[];
  color: string;
  chakra: string;
}

export const NAVARATNA_DATABASE: Record<string, NavaratnaGemstone> = {
  sun: {
    planet: 'Sun',
    planetSanskrit: 'Surya',
    gemstone: {
      english: 'Ruby',
      sanskrit: 'Manikya',
      alternativeNames: ['Manik', 'Red Ruby', 'Padmaraga'],
      imagePath: '/gemstones/photos/ruby.png',
      iconPath: '/gemstones/icons/ruby.svg'
    },
    element: 'Fire',
    day: 'Sunday',
    time: 'Morning (5-9 AM)',
    metal: 'Gold, Panch-dhatu, Ashta-dhatu, or Copper (Yellow Metal only). Never Silver.',
    finger: 'Ring Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Sunday',
    mantra: 'Om Hrim Sum Suryaya Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    weight: {
      min: '3 ratti (2.7 carats)',
      max: '7 ratti (6.4 carats)',
      ideal: '5 ratti (4.5 carats)',
      note: 'Minimum 3 ratti required for astrological effects'
    },
    benefits: [
      'Enhances vitality and energy',
      'Improves leadership qualities',
      'Boosts self-esteem and confidence',
      'Strengthens the Sun in birth chart',
      'Brings recognition and fame',
      'Improves relationship with father and authority figures'
    ],
    contraindications: [
      'Avoid if Sun is in 6th, 8th, or 12th house',
      'Not recommended if Sun is Maraka (Killer) planet',
      'Consult astrologer if Sun is combust or weak',
      'Avoid during Sun Dasha if Sun is malefic'
    ],
    color: 'Red',
    chakra: 'Solar Plexus (Manipura)'
  },
  moon: {
    planet: 'Moon',
    planetSanskrit: 'Chandra',
    gemstone: {
      english: 'Pearl',
      sanskrit: 'Moti',
      alternativeNames: ['Mukta', 'White Pearl', 'Natural Pearl'],
      imagePath: '/gemstones/photos/pearl.png',
      iconPath: '/gemstones/icons/pearl.svg'
    },
    element: 'Water',
    day: 'Monday',
    time: 'Morning, Sunset, or Night',
    metal: 'Silver',
    finger: 'Little Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Monday',
    mantra: 'Om Cham Chandraye Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    special: 'Undrilled single piece, round shape preferred. Should not be in bead form or pierced.',
    weight: {
      min: '2 ratti (1.8 carats)',
      max: '5 ratti (4.5 carats)',
      ideal: '4 ratti (3.6 carats)',
      note: 'Minimum 2 ratti required for astrological effects'
    },
    benefits: [
      'Calms emotions and mind',
      'Enhances intuition and psychic abilities',
      'Improves relationship with mother',
      'Brings emotional stability',
      'Enhances creativity and artistic abilities',
      'Improves sleep and mental peace'
    ],
    contraindications: [
      'Avoid if Moon is in 6th, 8th, or 12th house',
      'Not recommended during waning Moon phase',
      'Avoid if Moon is Maraka planet',
      'Consult astrologer if Moon is weak or debilitated'
    ],
    color: 'White/Silver',
    chakra: 'Crown (Sahasrara)'
  },
  mars: {
    planet: 'Mars',
    planetSanskrit: 'Mangal',
    gemstone: {
      english: 'Red Coral',
      sanskrit: 'Moonga',
      alternativeNames: ['Pavalam', 'Red Coral', 'Praval'],
      imagePath: '/gemstones/photos/red-coral.png',
      iconPath: '/gemstones/icons/red-coral.svg'
    },
    element: 'Fire',
    day: 'Tuesday',
    time: 'Morning (5-9 AM)',
    metal: 'Gold, Copper, or Silver',
    finger: 'Ring Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Tuesday',
    mantra: 'Om Krim Kum Kujaya Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    weight: {
      min: '5 ratti (4.5 carats)',
      max: '10 ratti (9.1 carats)',
      ideal: '7 ratti (6.4 carats)',
      note: 'Minimum 5 ratti required for astrological effects'
    },
    benefits: [
      'Boosts courage and energy',
      'Enhances physical strength and stamina',
      'Improves relationship with siblings',
      'Brings success in competitive fields',
      'Enhances leadership and initiative',
      'Protects from accidents and injuries'
    ],
    contraindications: [
      'Avoid if Mars is in 1st, 4th, 7th, 8th, or 12th house',
      'Not recommended if Mars is Maraka planet',
      'Avoid if Mars is combust or very weak',
      'Consult astrologer before wearing during Mars Dasha'
    ],
    color: 'Red',
    chakra: 'Root (Muladhara)'
  },
  mercury: {
    planet: 'Mercury',
    planetSanskrit: 'Budh',
    gemstone: {
      english: 'Emerald',
      sanskrit: 'Panna',
      alternativeNames: ['Marakata', 'Green Emerald', 'Zamurrud'],
      imagePath: '/gemstones/photos/emerald.png',
      iconPath: '/gemstones/icons/emerald.svg'
    },
    element: 'Earth',
    day: 'Wednesday',
    time: 'Sunrise or Sunset (5-9 AM or 5-7 PM)',
    metal: 'Gold, Silver, Panch-dhatu, or Ashta-dhatu (friendly with all metals)',
    finger: 'Little Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Wednesday',
    mantra: 'Om Aim Bum Budhaye Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    weight: {
      min: '3 ratti (2.7 carats)',
      max: '6 ratti (5.5 carats)',
      ideal: '5 ratti (4.5 carats)',
      note: 'Minimum 3 ratti required for astrological effects'
    },
    benefits: [
      'Improves communication and intellect',
      'Enhances business and financial success',
      'Improves relationship with maternal uncles',
      'Brings clarity of thought',
      'Enhances writing and speaking abilities',
      'Improves memory and learning capacity'
    ],
    contraindications: [
      'Avoid if Mercury is in 6th, 8th, or 12th house',
      'Not recommended if Mercury is Maraka planet',
      'Avoid if Mercury is combust (too close to Sun)',
      'Consult astrologer if Mercury is weak or debilitated'
    ],
    color: 'Green',
    chakra: 'Throat (Vishuddha)'
  },
  jupiter: {
    planet: 'Jupiter',
    planetSanskrit: 'Guru',
    gemstone: {
      english: 'Yellow Sapphire',
      sanskrit: 'Pukhraj',
      alternativeNames: ['Pushparaga', 'Yellow Sapphire', 'Topaz'],
      imagePath: '/gemstones/photos/yellow-sapphire.png',
      iconPath: '/gemstones/icons/yellow-sapphire.svg'
    },
    element: 'Ether',
    day: 'Thursday',
    time: 'Morning (5-9 AM)',
    metal: 'Gold, Panch-Dhatu, or Ashta-Dhatu',
    finger: 'Index Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Thursday',
    mantra: 'Om Streem Brahm Brihaspataye Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    weight: {
      min: '3 ratti (2.7 carats)',
      max: '7 ratti (6.4 carats)',
      ideal: '5 ratti (4.5 carats)',
      note: 'Minimum 3 ratti required for astrological effects'
    },
    benefits: [
      'Brings wisdom and knowledge',
      'Enhances prosperity and wealth',
      'Improves relationship with teachers and gurus',
      'Brings spiritual growth',
      'Enhances children and progeny',
      'Brings good fortune and luck'
    ],
    contraindications: [
      'Avoid if Jupiter is in 6th, 8th, or 12th house',
      'Not recommended if Jupiter is Maraka planet',
      'Avoid if Jupiter is weak or debilitated',
      'Consult astrologer before wearing during Jupiter Dasha if Jupiter is malefic'
    ],
    color: 'Yellow/Gold',
    chakra: 'Third Eye (Ajna)'
  },
  venus: {
    planet: 'Venus',
    planetSanskrit: 'Shukra',
    gemstone: {
      english: 'Diamond',
      sanskrit: 'Heera',
      alternativeNames: ['Vajra', 'Diamond', 'White Sapphire', 'Opal', 'Fire Opal'],
      imagePath: '/gemstones/photos/diamond.png',
      iconPath: '/gemstones/icons/diamond.svg'
    },
    element: 'Water',
    day: 'Friday',
    time: 'Sunrise or Sunset (5-9 AM or 5-7 PM)',
    metal: 'Silver or White Gold (can also use Yellow Gold)',
    finger: 'Index Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Friday',
    mantra: 'Om Draam Dreem Droum Sah Shukraaye Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    special: 'Bottom side should be open and not covered',
    weight: {
      min: '3 ratti (2.7 carats)',
      max: '6 ratti (5.5 carats)',
      ideal: '5 ratti (4.5 carats)',
      note: 'Minimum 3 ratti required for astrological effects'
    },
    benefits: [
      'Enhances love and relationships',
      'Brings beauty and charm',
      'Improves financial prosperity',
      'Enhances artistic and creative abilities',
      'Brings marital harmony',
      'Improves relationship with spouse'
    ],
    contraindications: [
      'Avoid if Venus is in 6th, 8th, or 12th house',
      'Not recommended if Venus is Maraka planet',
      'Avoid if Venus is weak or debilitated',
      'Consult astrologer before wearing during Venus Dasha if Venus is malefic'
    ],
    color: 'White/Transparent',
    chakra: 'Sacral (Svadhisthana)'
  },
  saturn: {
    planet: 'Saturn',
    planetSanskrit: 'Shani',
    gemstone: {
      english: 'Blue Sapphire',
      sanskrit: 'Neelam',
      alternativeNames: ['Indranila', 'Blue Sapphire', 'Neelamani'],
      imagePath: '/gemstones/photos/blue-sapphire.png',
      iconPath: '/gemstones/icons/blue-sapphire.svg'
    },
    element: 'Air',
    day: 'Saturday',
    time: 'Sunrise or Sunset (5-9 AM or 5-7 PM)',
    metal: 'Silver or White Gold (Never Yellow Gold)',
    finger: 'Middle Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Saturday',
    mantra: 'Aum Sham Shanaish-charaaye Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    weight: {
      min: '4 ratti (3.6 carats)',
      max: '7 ratti (6.4 carats)',
      ideal: '5 ratti (4.5 carats)',
      note: 'Minimum 4 ratti required for astrological effects'
    },
    benefits: [
      'Provides discipline and stability',
      'Brings career success and recognition',
      'Enhances longevity',
      'Brings spiritual growth',
      'Protects from negative influences',
      'Brings justice and fairness'
    ],
    contraindications: [
      'REQUIRES TESTING PERIOD: Wear for 3-7 days first to test compatibility',
      'Avoid if Saturn is in 1st, 4th, 7th, or 10th house',
      'Not recommended if Saturn is Maraka planet',
      'Avoid if Saturn is very weak or debilitated',
      'CRITICAL: Consult experienced astrologer before wearing',
      'Stop immediately if experiencing negative effects'
    ],
    color: 'Blue/Black',
    chakra: 'Root (Muladhara)'
  },
  rahu: {
    planet: 'Rahu',
    planetSanskrit: 'Rahu',
    gemstone: {
      english: 'Hessonite Garnet',
      sanskrit: 'Gomedh',
      alternativeNames: ['Gomed', 'Hessonite', 'Gomedak'],
      imagePath: '/gemstones/photos/hessonite.png',
      iconPath: '/gemstones/icons/hessonite.svg'
    },
    element: 'Air',
    day: 'Wednesday or Saturday',
    time: 'Sunset (5-7 PM)',
    metal: 'Silver',
    finger: 'Middle Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Wednesday or Saturday',
    mantra: 'Om Raam Rahve Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    weight: {
      min: '5 ratti (4.5 carats)',
      max: '10 ratti (9.1 carats)',
      ideal: '7 ratti (6.4 carats)',
      note: 'Minimum 5 ratti required for astrological effects'
    },
    benefits: [
      'Reduces negative effects of Rahu',
      'Brings sudden gains and opportunities',
      'Enhances spiritual growth',
      'Brings fame and recognition',
      'Protects from illusions and deceptions',
      'Brings material success'
    ],
    contraindications: [
      'Avoid if Rahu is in 1st, 4th, 7th, or 10th house',
      'Not recommended if Rahu is Maraka planet',
      'Avoid if Rahu is very weak or debilitated',
      'Consult astrologer before wearing during Rahu Dasha'
    ],
    color: 'Honey/Orange',
    chakra: 'Crown (Sahasrara)'
  },
  ketu: {
    planet: 'Ketu',
    planetSanskrit: 'Ketu',
    gemstone: {
      english: "Cat's Eye",
      sanskrit: 'Lehsunia',
      alternativeNames: ['Vaidurya', "Cat's Eye", 'Chrysoberyl'],
      imagePath: '/gemstones/photos/cats-eye.png',
      iconPath: '/gemstones/icons/cats-eye.svg'
    },
    element: 'Fire',
    day: 'Tuesday or Thursday',
    time: 'Sunset (5-7 PM)',
    metal: 'Silver (can also use Gold)',
    finger: 'Middle Finger or Ring Finger',
    hand: 'Men: Right Hand, Women: Left or Right',
    pendant: true,
    skinContact: 'Bottom-tip should touch the skin',
    purification: 'Dip 3 times in Ganga-Jal or raw Cow-Milk on Tuesday or Thursday',
    mantra: 'Om Kem Ketve Namah',
    chanting: 'Chant 108 times, wear on 108th chant',
    paksha: 'Can be worn in Krishna Paksha (no special Muhurta needed)',
    simplicity: 'Simplest remedy, not a complex procedure',
    special: 'Bottom side open, not covered from top and bottom',
    weight: {
      min: '3 ratti (2.7 carats)',
      max: '7 ratti (6.4 carats)',
      ideal: '5 ratti (4.5 carats)',
      note: 'Minimum 3 ratti required for astrological effects'
    },
    benefits: [
      'Spiritual growth and enlightenment',
      'Protection from negative energies',
      'Enhances intuition and psychic abilities',
      'Brings detachment and liberation',
      'Protects from accidents and sudden events',
      'Brings moksha (liberation)'
    ],
    contraindications: [
      'Avoid if Ketu is in 1st, 4th, 7th, or 10th house',
      'Not recommended if Ketu is Maraka planet',
      'Avoid if Ketu is very weak or debilitated',
      'Consult astrologer before wearing during Ketu Dasha'
    ],
    color: 'Brown/Yellow',
    chakra: 'Crown (Sahasrara)'
  }
};

/**
 * Get gemstone data by planet name
 */
export function getGemstoneByPlanet(planetName: string): NavaratnaGemstone | null {
  const key = planetName.toLowerCase();
  return NAVARATNA_DATABASE[key] || null;
}

/**
 * Get all Navaratna gemstones
 */
export function getAllNavaratnaGemstones(): NavaratnaGemstone[] {
  return Object.values(NAVARATNA_DATABASE);
}

/**
 * Calculate recommended gemstone weight based on body weight
 * Formula: 1/10th of body weight in kilograms, typically 5-8 Ratti
 */
export function calculateGemstoneWeight(bodyWeightKg?: number): {
  min: string;
  ideal: string;
  max: string;
  note: string;
} {
  if (!bodyWeightKg) {
    return {
      min: '5 ratti (4.5 carats)',
      ideal: '6 ratti (5.5 carats)',
      max: '8 ratti (7.3 carats)',
      note: 'General recommendation. For personalized weight, provide your body weight.'
    };
  }

  const weightInRatti = Math.round((bodyWeightKg / 10) * 0.91); // Convert kg to ratti (1 ratti ≈ 0.91 carats)
  const minRatti = Math.max(3, weightInRatti - 2);
  const idealRatti = weightInRatti;
  const maxRatti = Math.min(10, weightInRatti + 2);

  return {
    min: `${minRatti} ratti (${(minRatti * 0.91).toFixed(1)} carats)`,
    ideal: `${idealRatti} ratti (${(idealRatti * 0.91).toFixed(1)} carats)`,
    max: `${maxRatti} ratti (${(maxRatti * 0.91).toFixed(1)} carats)`,
    note: `Calculated based on 1/10th of your body weight (${bodyWeightKg} kg). Consult an astrologer for final recommendation.`
  };
}
