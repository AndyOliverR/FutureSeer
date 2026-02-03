// Gotra (Ancestral Lineage) Data System
// Based on Kalaprakashika and classical Vedic texts

export interface GotraInfo {
  id: number
  name: string
  sage: string
  sanskritName: string
  meaning: string
  nakshatras: string[]
  characteristics: string[]
  familyTraditions: string[]
  ritualSignificance: string
  spiritualQualities: string[]
  commonSurnames: string[]
  marriageCompatibility: {
    avoidSameGotra: boolean
    relatedGotras: string[]
  }
  mantra?: string
  deity?: string
}

// The Seven Saptarishi Gotras (Primary Classification)
export const SAPTARISHI_GOTRAS: GotraInfo[] = [
  {
    id: 1,
    name: "Marichi",
    sage: "Maharishi Marichi",
    sanskritName: "मरीचि",
    meaning: "Ray of Light, son of Brahma",
    nakshatras: ["Ashwini", "Bharani", "Krittika", "Rohini"],
    characteristics: [
      "Natural healers and physicians",
      "Quick decision-makers",
      "Independent and pioneering spirit",
      "Strong connection to life force energy"
    ],
    familyTraditions: [
      "Traditional practitioners of Ayurveda",
      "Known for swift action and courage",
      "Often engage in pioneering activities"
    ],
    ritualSignificance: "Marichi Gotra is invoked for healing, vitality, and new beginnings. Associated with the Ashwini Kumaras, divine physicians.",
    spiritualQualities: [
      "Healing energy",
      "Vitality and youth",
      "Innovation and speed",
      "Divine medicine"
    ],
    commonSurnames: ["Marichi", "Kashyap", "Bharadwaj"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: []
    },
    mantra: "Om Marichaye Namaha",
    deity: "Ashwini Kumaras"
  },
  {
    id: 2,
    name: "Vashistha",
    sage: "Maharishi Vashistha",
    sanskritName: "वशिष्ठ",
    meaning: "Most Excellent, the great teacher",
    nakshatras: ["Mrigashira", "Ardra", "Punarvasu", "Pushya"],
    characteristics: [
      "Natural teachers and scholars",
      "Profound wisdom and knowledge",
      "Nurturing and protective nature",
      "Strong family values"
    ],
    familyTraditions: [
      "Preservation of Vedic knowledge",
      "Teaching and guidance roles",
      "Spiritual counseling and mentorship"
    ],
    ritualSignificance: "Vashistha Gotra represents supreme knowledge and teaching. The lineage of Guru to Lord Rama, embodying wisdom transmission.",
    spiritualQualities: [
      "Supreme wisdom",
      "Teaching ability",
      "Patience and nurturing",
      "Spiritual authority"
    ],
    commonSurnames: ["Vashist", "Dikshit", "Upadhyay"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: []
    },
    mantra: "Om Vasisthaya Namaha",
    deity: "Brahma (Creator)"
  },
  {
    id: 3,
    name: "Angiras",
    sage: "Maharishi Angiras",
    sanskritName: "अंगिरस",
    meaning: "The Glowing One, author of Atharvaveda",
    nakshatras: ["Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni"],
    characteristics: [
      "Mystical and psychic abilities",
      "Natural authority and leadership",
      "Deep understanding of rituals",
      "Connection to ancestral power"
    ],
    familyTraditions: [
      "Experts in Vedic rituals and yajnas",
      "Guardians of mystical knowledge",
      "Often hold positions of authority"
    ],
    ritualSignificance: "Angiras Gotra is invoked for protection, ancestral blessings, and mystical power. Connected to fire rituals and Atharvaveda.",
    spiritualQualities: [
      "Mystical insight",
      "Ancestral connection",
      "Ritual mastery",
      "Royal bearing"
    ],
    commonSurnames: ["Angirasa", "Bhargava", "Bharadwaj"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: ["Bhrigu"]
    },
    mantra: "Om Angirase Namaha",
    deity: "Agni (Fire)"
  },
  {
    id: 4,
    name: "Atri",
    sage: "Maharishi Atri",
    sanskritName: "अत्रि",
    meaning: "The Devourer, the illuminator",
    nakshatras: ["Hasta", "Chitra", "Swati", "Vishakha"],
    characteristics: [
      "Artistic and creative talents",
      "Skilled craftsmen and artists",
      "Balanced and diplomatic nature",
      "Appreciation for beauty and harmony"
    ],
    familyTraditions: [
      "Artisans and skilled craftspeople",
      "Musicians and performing artists",
      "Architects and designers"
    ],
    ritualSignificance: "Atri Gotra represents creativity, balance, and illumination. Associated with the Moon (Chandra), bringing light to darkness.",
    spiritualQualities: [
      "Creative expression",
      "Balance and harmony",
      "Illumination of truth",
      "Artistic mastery"
    ],
    commonSurnames: ["Atreya", "Chandra", "Soma"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: []
    },
    mantra: "Om Atraye Namaha",
    deity: "Chandra (Moon)"
  },
  {
    id: 5,
    name: "Pulastya",
    sage: "Maharishi Pulastya",
    sanskritName: "पुलस्त्य",
    meaning: "The Ancient One, ancestor of Rakshasas",
    nakshatras: ["Anuradha", "Jyeshtha", "Mula", "Purva Ashadha"],
    characteristics: [
      "Deep transformative power",
      "Strong will and determination",
      "Ability to work with hidden forces",
      "Penetrating insight"
    ],
    familyTraditions: [
      "Known for occult and mystical practices",
      "Powerful and influential families",
      "Deep understanding of karma"
    ],
    ritualSignificance: "Pulastya Gotra represents transformation and deep knowledge. Connected to Ravana's lineage, showing the power of knowledge for both creation and destruction.",
    spiritualQualities: [
      "Transformative power",
      "Deep wisdom",
      "Occult knowledge",
      "Karmic understanding"
    ],
    commonSurnames: ["Pulastya", "Ravana", "Kubera"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: ["Pulaha"]
    },
    mantra: "Om Pulastyaya Namaha",
    deity: "Shiva (Transformer)"
  },
  {
    id: 6,
    name: "Pulaha",
    sage: "Maharishi Pulaha",
    sanskritName: "पुलह",
    meaning: "The Ascetic, the victorious",
    nakshatras: ["Uttara Ashadha", "Abhijit", "Shravana", "Dhanishta"],
    characteristics: [
      "Victory and success",
      "Fame and recognition",
      "Prosperity and wealth",
      "Musical and rhythmic abilities"
    ],
    familyTraditions: [
      "Leaders and administrators",
      "Musicians and performers",
      "Achievers and goal-oriented families"
    ],
    ritualSignificance: "Pulaha Gotra represents ultimate victory and achievement. Associated with Lord Vishnu's blessings and cosmic order (Rta).",
    spiritualQualities: [
      "Victory consciousness",
      "Divine fame",
      "Cosmic rhythm",
      "Universal sound"
    ],
    commonSurnames: ["Pulaha", "Vishnu", "Narayana"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: ["Pulastya"]
    },
    mantra: "Om Pulahaya Namaha",
    deity: "Vishnu (Preserver)"
  },
  {
    id: 7,
    name: "Kratu",
    sage: "Maharishi Kratu",
    sanskritName: "क्रतु",
    meaning: "The Sacrificer, master of rituals",
    nakshatras: ["Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
    characteristics: [
      "Healing and mystical abilities",
      "Compassionate and service-oriented",
      "Deep spiritual understanding",
      "Liberation-seeking nature"
    ],
    familyTraditions: [
      "Healers and spiritual practitioners",
      "Charitable and service-oriented",
      "Seekers of moksha (liberation)"
    ],
    ritualSignificance: "Kratu Gotra represents spiritual sacrifice and healing. Connected to cosmic dissolution and rebirth, the path to liberation.",
    spiritualQualities: [
      "Healing powers",
      "Mystical insight",
      "Compassion",
      "Liberation consciousness"
    ],
    commonSurnames: ["Kratu", "Varuna", "Mitra"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: []
    },
    mantra: "Om Kratave Namaha",
    deity: "Varuna (Cosmic Waters)"
  }
]

// Nakshatra to Gotra Mapping (28 Nakshatras including Abhijit)
// Based on Kalaprakashika text
export const NAKSHATRA_GOTRA_MAP: Record<string, string> = {
  // Marichi Gotra (Nakshatras 1-4)
  'Ashwini': 'Marichi',
  'Ashvini': 'Marichi',
  'Bharani': 'Marichi',
  'Krittika': 'Marichi',
  'Kritika': 'Marichi',
  'Rohini': 'Marichi',
  
  // Vashistha Gotra (Nakshatras 5-8)
  'Mrigashira': 'Vashistha',
  'Mrigasira': 'Vashistha',
  'Ardra': 'Vashistha',
  'Punarvasu': 'Vashistha',
  'Pushya': 'Vashistha',
  'Pushyami': 'Vashistha',
  
  // Angiras Gotra (Nakshatras 9-12)
  'Ashlesha': 'Angiras',
  'Aslesha': 'Angiras',
  'Magha': 'Angiras',
  'Makha': 'Angiras',
  'Purva Phalguni': 'Angiras',
  'Purvaphalguni': 'Angiras',
  'Poorvaphalguni': 'Angiras',
  'Uttara Phalguni': 'Angiras',
  'Uttaraphalguni': 'Angiras',
  'Uttarphalguni': 'Angiras',
  
  // Atri Gotra (Nakshatras 13-16)
  'Hasta': 'Atri',
  'Hastha': 'Atri',
  'Chitra': 'Atri',
  'Chitta': 'Atri',
  'Swati': 'Atri',
  'Svati': 'Atri',
  'Vishakha': 'Atri',
  'Visakha': 'Atri',
  
  // Pulastya Gotra (Nakshatras 17-20)
  'Anuradha': 'Pulastya',
  'Anuraadha': 'Pulastya',
  'Jyeshtha': 'Pulastya',
  'Jyestha': 'Pulastya',
  'Mula': 'Pulastya',
  'Moola': 'Pulastya',
  'Purva Ashadha': 'Pulastya',
  'Purvashada': 'Pulastya',
  'Poorvashada': 'Pulastya',
  
  // Pulaha Gotra (Nakshatras 21-24)
  'Uttara Ashadha': 'Pulaha',
  'Uttarashada': 'Pulaha',
  'Uttarashadha': 'Pulaha',
  'Abhijit': 'Pulaha',  // Special 28th nakshatra
  'Shravana': 'Pulaha',
  'Sravana': 'Pulaha',
  'Thiruvonam': 'Pulaha',
  'Dhanishta': 'Pulaha',
  'Dhanishtha': 'Pulaha',
  'Avittam': 'Pulaha',
  
  // Kratu Gotra (Nakshatras 25-27)
  'Shatabhisha': 'Kratu',
  'Satabhisha': 'Kratu',
  'Sadayam': 'Kratu',
  'Purva Bhadrapada': 'Kratu',
  'Purvabhadra': 'Kratu',
  'Poorvabhadra': 'Kratu',
  'Uttara Bhadrapada': 'Kratu',
  'Uttarabhadra': 'Kratu',
  'Uttaraproshtapada': 'Kratu',
  'Revati': 'Kratu',
  'Revathi': 'Kratu'
}

// Extended list of 18 common Gotras (beyond Saptarishis)
export const EXTENDED_GOTRAS: GotraInfo[] = [
  {
    id: 8,
    name: "Kashyapa",
    sage: "Maharishi Kashyapa",
    sanskritName: "कश्यप",
    meaning: "Tortoise, father of all beings",
    nakshatras: [], // Not assigned via Nakshatra method
    characteristics: [
      "Universal father figure",
      "Protective and nurturing",
      "Diverse talents and abilities",
      "Adaptability"
    ],
    familyTraditions: [
      "Default Gotra when lineage is unknown",
      "Considered universal ancestor",
      "Wide range of professions"
    ],
    ritualSignificance: "Kashyapa is often used as the default Gotra when family lineage is unknown. He is the father of devas, asuras, nagas, and all creatures.",
    spiritualQualities: [
      "Universal compassion",
      "Adaptability",
      "Fatherhood",
      "Creation energy"
    ],
    commonSurnames: ["Kashyap", "Kashyapa", "Kansal", "Kasyap"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: []
    },
    mantra: "Om Kashyapaya Namaha"
  },
  {
    id: 9,
    name: "Gautama",
    sage: "Maharishi Gautama",
    sanskritName: "गौतम",
    meaning: "Descendant of Gotama, remover of darkness",
    nakshatras: [], // Surname-based
    characteristics: [
      "Intellectual and analytical",
      "Truth-seekers",
      "Strong sense of dharma",
      "Purification abilities"
    ],
    familyTraditions: [
      "Scholars and philosophers",
      "Known for righteousness",
      "Water purification rituals (Ganga's descent)"
    ],
    ritualSignificance: "Gautama Gotra is associated with the descent of Ganga and purification. Known for intellectual pursuits and dharmic living.",
    spiritualQualities: [
      "Truth-seeking",
      "Purification",
      "Intellectual clarity",
      "Dharmic strength"
    ],
    commonSurnames: ["Gautam", "Gautama", "Gotama"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: []
    },
    mantra: "Om Gautamaya Namaha"
  },
  {
    id: 10,
    name: "Bharadwaja",
    sage: "Maharishi Bharadwaja",
    sanskritName: "भरद्वाज",
    meaning: "Lark, the sustainer",
    nakshatras: [], // Surname-based
    characteristics: [
      "Knowledge of all Vedas",
      "Long-lived and enduring",
      "Medical and healing knowledge",
      "Devotion to learning"
    ],
    familyTraditions: [
      "Scholars and physicians",
      "Long family traditions",
      "Preservation of ancient knowledge"
    ],
    ritualSignificance: "Bharadwaja Gotra represents comprehensive knowledge and longevity. Known for mastery of all four Vedas and Ayurveda.",
    spiritualQualities: [
      "Complete knowledge",
      "Longevity",
      "Healing wisdom",
      "Devotion to study"
    ],
    commonSurnames: ["Bharadwaj", "Bharadvaja", "Dwivedi", "Tripathi"],
    marriageCompatibility: {
      avoidSameGotra: true,
      relatedGotras: []
    },
    mantra: "Om Bharadwajaya Namaha"
  }
]

// All Gotras combined for lookup
export const ALL_GOTRAS = [...SAPTARISHI_GOTRAS, ...EXTENDED_GOTRAS]

// Surname to Gotra mapping (community-specific, non-exhaustive)
export const SURNAME_GOTRA_MAP: Record<string, string[]> = {
  // Brahmin surnames
  'Sharma': ['Bharadwaja', 'Kashyapa', 'Vashistha'],
  'Sharmaa': ['Bharadwaja', 'Kashyapa', 'Vashistha'],
  'Shukla': ['Bharadwaja', 'Sandilya'],
  'Mishra': ['Bharadwaja', 'Kashyapa'],
  'Tiwari': ['Bharadwaja', 'Kashyapa'],
  'Tripathi': ['Bharadwaja'],
  'Pandey': ['Kashyapa', 'Bharadwaja'],
  'Pande': ['Kashyapa', 'Bharadwaja'],
  'Joshi': ['Bharadwaja', 'Kashyapa'],
  'Upadhyay': ['Vashistha', 'Bharadwaja'],
  'Dikshit': ['Vashistha'],
  'Dwivedi': ['Bharadwaja'],
  'Trivedi': ['Bharadwaja'],
  'Chaturvedi': ['Bharadwaja'],
  
  // Kayastha surnames
  'Gupta': ['Kashyapa'],
  'Saxena': ['Kashyapa'],
  'Mathur': ['Kashyapa'],
  'Srivastava': ['Kashyapa'],
  'Bhatnagar': ['Kashyapa'],
  
  // Agrawal/Marwari surnames (often Gotra is the surname itself)
  'Agarwal': ['Garg', 'Goyal', 'Bansal'],
  'Bansal': ['Bansal'],
  'Goyal': ['Goyal'],
  'Garg': ['Garg'],
  'Kansal': ['Kashyapa'],
  'Jindal': ['Jindal'],
  'Mittal': ['Mittal'],
  
  // Rajput surnames
  'Singh': ['Bharadwaja', 'Kashyapa', 'Gautama'],
  'Rathore': ['Gautama'],
  'Chauhan': ['Vatsa'],
  'Tomar': ['Atri'],
  
  // South Indian surnames
  'Iyer': ['Bharadwaja', 'Kashyapa', 'Vashistha'],
  'Iyengar': ['Bharadwaja', 'Kashyapa'],
  'Sastri': ['Bharadwaja', 'Vashistha'],
  'Acharya': ['Angiras', 'Bharadwaja'],
  'Bhat': ['Bharadwaja', 'Kashyapa'],
  
  // Common Gotras as surnames
  'Kashyap': ['Kashyapa'],
  'Kashyapa': ['Kashyapa'],
  'Bharadwaj': ['Bharadwaja'],
  'Gautam': ['Gautama'],
  'Vashist': ['Vashistha'],
  'Angirasa': ['Angiras']
}

// Helper function to get Gotra info by name
export function getGotraInfo(gotraName: string): GotraInfo | undefined {
  return ALL_GOTRAS.find(g => g.name === gotraName)
}

// Helper to get all possible Gotras from surname
export function getPossibleGotrasFromSurname(surname: string): string[] {
  return SURNAME_GOTRA_MAP[surname] || []
}

// Default Gotra when nothing matches
export const DEFAULT_GOTRA = 'Kashyapa'
