// Comprehensive Nakshatra Data System
// 27 Lunar Mansions with detailed characteristics

export interface NakshatraData {
  id: number;
  name: string;
  englishName: string;
  lord: string;
  symbol: string;
  deity: string;
  element: string;
  quality: string;
  caste: string;
  sex: string;
  nature: string;
  characteristics: string[];
  personality: string[];
  career: string[];
  health: string[];
  relationships: string[];
  strengths: string[];
  weaknesses: string[];
  remedies: string[];
  degrees: {
    start: number;
    end: number;
  };
  pada: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
}

export const NAKSHATRAS: NakshatraData[] = [
  {
    id: 1,
    name: "अश्विनी",
    englishName: "Ashwini",
    lord: "Ketu",
    symbol: "Horse's Head",
    deity: "Ashwini Kumaras",
    element: "Earth",
    quality: "Dhruva (Fixed)",
    caste: "Vaishya",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Quick", "Energetic", "Healing", "Innovative"],
    personality: ["Fast-acting", "Independent", "Healing nature", "Quick decisions"],
    career: ["Medicine", "Healing", "Technology", "Transportation"],
    health: ["Strong constitution", "Quick recovery", "Head/face issues"],
    relationships: ["Independent", "Quick to act", "Healing partner"],
    strengths: ["Speed", "Healing", "Innovation", "Independence"],
    weaknesses: ["Impatience", "Rashness", "Restlessness"],
    remedies: ["Worship Ashwini Kumaras", "Fast on Tuesdays", "Wear red coral"],
    degrees: { start: 0, end: 13.33 },
    pada: {
      1: "Aries",
      2: "Taurus", 
      3: "Gemini",
      4: "Cancer"
    }
  },
  {
    id: 2,
    name: "भरणी",
    englishName: "Bharani",
    lord: "Venus",
    symbol: "Vulva",
    deity: "Yama",
    element: "Earth",
    quality: "Chara (Movable)",
    caste: "Shudra",
    sex: "Female",
    nature: "Manushya (Human)",
    characteristics: ["Creative", "Sensual", "Transformative", "Enduring"],
    personality: ["Creative", "Sensual", "Enduring", "Transformative"],
    career: ["Arts", "Creativity", "Transformation", "Endurance"],
    health: ["Strong reproductive system", "Endurance", "Transformation"],
    relationships: ["Sensual", "Creative", "Enduring", "Transformative"],
    strengths: ["Creativity", "Endurance", "Transformation", "Sensuality"],
    weaknesses: ["Possessiveness", "Stubbornness", "Transformation issues"],
    remedies: ["Worship Yama", "Fast on Fridays", "Wear diamond"],
    degrees: { start: 13.33, end: 26.67 },
    pada: {
      1: "Cancer",
      2: "Leo",
      3: "Virgo", 
      4: "Libra"
    }
  },
  {
    id: 3,
    name: "कृत्तिका",
    englishName: "Krittika",
    lord: "Sun",
    symbol: "Razor",
    deity: "Agni",
    element: "Fire",
    quality: "Dhruva (Fixed)",
    caste: "Brahmin",
    sex: "Female",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Sharp", "Cutting", "Purifying", "Leadership"],
    personality: ["Sharp intellect", "Leadership", "Purifying", "Cutting"],
    career: ["Leadership", "Sharp tools", "Purification", "Cutting"],
    health: ["Sharp mind", "Leadership", "Purification", "Cutting"],
    relationships: ["Sharp", "Leadership", "Purifying", "Cutting"],
    strengths: ["Sharpness", "Leadership", "Purification", "Cutting"],
    weaknesses: ["Sharp tongue", "Cutting remarks", "Purification issues"],
    remedies: ["Worship Agni", "Fast on Sundays", "Wear ruby"],
    degrees: { start: 26.67, end: 40 },
    pada: {
      1: "Libra",
      2: "Scorpio",
      3: "Sagittarius",
      4: "Capricorn"
    }
  },
  {
    id: 4,
    name: "रोहिणी",
    englishName: "Rohini",
    lord: "Moon",
    symbol: "Cart",
    deity: "Brahma",
    element: "Earth",
    quality: "Dhruva (Fixed)",
    caste: "Shudra",
    sex: "Female",
    nature: "Manushya (Human)",
    characteristics: ["Fertile", "Creative", "Material", "Beautiful"],
    personality: ["Fertile", "Creative", "Material", "Beautiful"],
    career: ["Agriculture", "Creativity", "Material wealth", "Beauty"],
    health: ["Fertile", "Creative", "Material", "Beautiful"],
    relationships: ["Fertile", "Creative", "Material", "Beautiful"],
    strengths: ["Fertility", "Creativity", "Material wealth", "Beauty"],
    weaknesses: ["Materialism", "Possessiveness", "Fertility issues"],
    remedies: ["Worship Brahma", "Fast on Mondays", "Wear pearl"],
    degrees: { start: 40, end: 53.33 },
    pada: {
      1: "Capricorn",
      2: "Aquarius",
      3: "Pisces",
      4: "Aries"
    }
  },
  {
    id: 5,
    name: "मृगशिरा",
    englishName: "Mrigashira",
    lord: "Mars",
    symbol: "Deer's Head",
    deity: "Soma",
    element: "Earth",
    quality: "Chara (Movable)",
    caste: "Kshatriya",
    sex: "Female",
    nature: "Deva (Divine)",
    characteristics: ["Curious", "Seeking", "Gentle", "Restless"],
    personality: ["Inquisitive", "Sensitive", "Artistic", "Changeable"],
    career: [
      "Research",
      "Travel industry",
      "Writing",
      "Teaching",
      "Fashion",
      "Art",
      "Exploration"
    ],
    health: [
      "Throat issues",
      "Voice problems",
      "Nervous tension",
      "Allergies"
    ],
    relationships: [
      "Romantic idealist",
      "Needs variety",
      "Gentle lover",
      "Commitment issues"
    ],
    strengths: [
      "Intellectual curiosity",
      "Artistic talent",
      "Adaptability",
      "Gentle nature"
    ],
    weaknesses: [
      "Restlessness",
      "Indecisiveness",
      "Fickleness",
      "Escapist tendencies"
    ],
    remedies: ["Worship Soma", "Fast on Tuesdays", "Wear red coral"],
    degrees: { start: 53.33, end: 66.67 },
    pada: {
      1: "Aries",
      2: "Taurus",
      3: "Gemini",
      4: "Cancer"
    }
  },
  {
    id: 6,
    name: "आर्द्रा",
    englishName: "Ardra",
    lord: "Rahu",
    symbol: "Tear Drop",
    deity: "Rudra",
    element: "Water",
    quality: "Dhruva (Fixed)",
    caste: "Shudra",
    sex: "Female",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Intense", "Transformative", "Emotional", "Destructive"],
    personality: ["Passionate", "Volatile", "Intense", "Unpredictable"],
    career: [
      "Surgery",
      "Destruction work",
      "Psychology",
      "Crisis management",
      "Emergency services",
      "Transformation work"
    ],
    health: [
      "Eye problems",
      "Emotional disorders",
      "Headaches",
      "Stress-related issues"
    ],
    relationships: [
      "Intense emotions",
      "Volatile relationships",
      "Passionate lover",
      "Needs emotional intensity"
    ],
    strengths: [
      "Crisis management",
      "Emotional depth",
      "Transformative power",
      "Intense focus"
    ],
    weaknesses: [
      "Emotional volatility",
      "Destructive tendencies",
      "Unpredictable behavior",
      "Stress sensitivity"
    ],
    remedies: ["Worship Rudra", "Fast on Saturdays", "Wear hessonite"],
    degrees: { start: 66.67, end: 80 },
    pada: {
      1: "Cancer",
      2: "Leo",
      3: "Virgo",
      4: "Libra"
    }
  },
  {
    id: 7,
    name: "पुनर्वसु",
    englishName: "Punarvasu",
    lord: "Jupiter",
    symbol: "Bow",
    deity: "Aditi",
    element: "Water",
    quality: "Chara (Movable)",
    caste: "Vaishya",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Renewal", "Abundance", "Protection", "Returning"],
    personality: ["Optimistic", "Generous", "Protective", "Renewing"],
    career: [
      "Teaching",
      "Counseling",
      "Business",
      "Agriculture",
      "Real estate",
      "Renewable energy"
    ],
    health: [
      "Liver health",
      "Digestive system",
      "Immune system",
      "Recovery abilities"
    ],
    relationships: [
      "Protective partner",
      "Generous lover",
      "Family-oriented",
      "Renewing relationships"
    ],
    strengths: [
      "Optimism",
      "Generosity",
      "Protective nature",
      "Renewal abilities"
    ],
    weaknesses: [
      "Over-protectiveness",
      "Over-generosity",
      "Indecisiveness",
      "Dependency issues"
    ],
    remedies: ["Worship Aditi", "Fast on Thursdays", "Wear yellow sapphire"],
    degrees: { start: 80, end: 93.33 },
    pada: {
      1: "Libra",
      2: "Scorpio",
      3: "Sagittarius",
      4: "Capricorn"
    }
  },
  {
    id: 8,
    name: "पुष्य",
    englishName: "Pushya",
    lord: "Saturn",
    symbol: "Flower",
    deity: "Brihaspati",
    element: "Water",
    quality: "Dhruva (Fixed)",
    caste: "Brahmin",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Nourishing", "Protective", "Spiritual", "Caring"],
    personality: ["Nurturing", "Devoted", "Spiritual", "Compassionate"],
    career: [
      "Healthcare",
      "Nursing",
      "Teaching",
      "Spiritual counseling",
      "Childcare",
      "Social work"
    ],
    health: [
      "Chest area",
      "Heart health",
      "Respiratory system",
      "Emotional wellness"
    ],
    relationships: [
      "Nurturing partner",
      "Devoted lover",
      "Family-focused",
      "Spiritual connection"
    ],
    strengths: [
      "Nurturing nature",
      "Devotion",
      "Spiritual wisdom",
      "Compassion"
    ],
    weaknesses: [
      "Over-nurturing",
      "Over-protectiveness",
      "Emotional dependency",
      "Self-neglect"
    ],
    remedies: ["Worship Brihaspati", "Fast on Saturdays", "Wear blue sapphire"],
    degrees: { start: 93.33, end: 106.67 },
    pada: {
      1: "Capricorn",
      2: "Aquarius",
      3: "Pisces",
      4: "Aries"
    }
  },
  {
    id: 9,
    name: "आश्लेषा",
    englishName: "Ashlesha",
    lord: "Mercury",
    symbol: "Serpent",
    deity: "Nagas",
    element: "Water",
    quality: "Chara (Movable)",
    caste: "Shudra",
    sex: "Female",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Intuitive", "Mysterious", "Penetrating insight", "Hypnotic"],
    personality: ["Secretive", "Intense", "Perceptive", "Manipulative tendencies"],
    career: [
      "Psychology",
      "Occult sciences",
      "Medicine",
      "Research",
      "Toxicology",
      "Hypnotherapy",
      "Investigation"
    ],
    health: [
      "Nervous system",
      "Digestive issues",
      "Mental health concerns",
      "Sensitivity to toxins"
    ],
    relationships: [
      "Intense bonds",
      "Possessive nature",
      "Loyal but suspicious",
      "Needs emotional depth"
    ],
    strengths: [
      "Penetrating intelligence",
      "Healing abilities",
      "Transformative power",
      "Intuitive understanding"
    ],
    weaknesses: [
      "Manipulative tendencies",
      "Suspicious nature",
      "Emotional volatility",
      "Vengeful when hurt"
    ],
    remedies: ["Worship Nagas", "Fast on Wednesdays", "Wear emerald"],
    degrees: { start: 106.67, end: 120 },
    pada: {
      1: "Aries",
      2: "Taurus",
      3: "Gemini",
      4: "Cancer"
    }
  },
  {
    id: 10,
    name: "मघा",
    englishName: "Magha",
    lord: "Ketu",
    symbol: "Throne",
    deity: "Pitris",
    element: "Fire",
    quality: "Dhruva (Fixed)",
    caste: "Shudra",
    sex: "Male",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Royal", "Ancestral", "Powerful", "Traditional"],
    personality: ["Authoritative", "Traditional", "Proud", "Ancestral"],
    career: [
      "Government",
      "Leadership",
      "Ancestral business",
      "Traditional arts",
      "Royal services",
      "Heritage work"
    ],
    health: [
      "Back problems",
      "Spinal issues",
      "Ancestral diseases",
      "Bone health"
    ],
    relationships: [
      "Traditional values",
      "Ancestral connections",
      "Power dynamics",
      "Royal expectations"
    ],
    strengths: [
      "Leadership qualities",
      "Ancestral wisdom",
      "Traditional knowledge",
      "Authority"
    ],
    weaknesses: [
      "Arrogance",
      "Rigid thinking",
      "Ancestral burdens",
      "Power struggles"
    ],
    remedies: ["Worship Pitris", "Fast on Tuesdays", "Wear red coral"],
    degrees: { start: 120, end: 133.33 },
    pada: {
      1: "Cancer",
      2: "Leo",
      3: "Virgo",
      4: "Libra"
    }
  },
  {
    id: 11,
    name: "पूर्व फाल्गुनी",
    englishName: "Purva Phalguni",
    lord: "Venus",
    symbol: "Hammock",
    deity: "Bhaga",
    element: "Fire",
    quality: "Chara (Movable)",
    caste: "Kshatriya",
    sex: "Male",
    nature: "Manushya (Human)",
    characteristics: ["Comfortable", "Luxurious", "Creative", "Social"],
    personality: ["Charming", "Luxury-loving", "Creative", "Social"],
    career: [
      "Entertainment",
      "Luxury goods",
      "Arts",
      "Hospitality",
      "Fashion",
      "Social work"
    ],
    health: [
      "Reproductive system",
      "Kidney health",
      "Luxury-related issues",
      "Social stress"
    ],
    relationships: [
      "Charming partner",
      "Luxury-oriented",
      "Creative connection",
      "Social butterfly"
    ],
    strengths: [
      "Charm",
      "Creativity",
      "Social skills",
      "Luxury appreciation"
    ],
    weaknesses: [
      "Over-indulgence",
      "Luxury addiction",
      "Social dependency",
      "Superficiality"
    ],
    remedies: ["Worship Bhaga", "Fast on Fridays", "Wear diamond"],
    degrees: { start: 133.33, end: 146.67 },
    pada: {
      1: "Libra",
      2: "Scorpio",
      3: "Sagittarius",
      4: "Capricorn"
    }
  },
  {
    id: 12,
    name: "उत्तर फाल्गुनी",
    englishName: "Uttara Phalguni",
    lord: "Sun",
    symbol: "Fig Tree",
    deity: "Aryaman",
    element: "Fire",
    quality: "Dhruva (Fixed)",
    caste: "Kshatriya",
    sex: "Female",
    nature: "Manushya (Human)",
    characteristics: ["Fruitful", "Noble", "Generous", "Protective"],
    personality: ["Noble", "Generous", "Protective", "Fruitful"],
    career: [
      "Government service",
      "Noble professions",
      "Charity work",
      "Protection services",
      "Fruitful ventures",
      "Leadership roles"
    ],
    health: [
      "Heart health",
      "Circulatory system",
      "Generous energy",
      "Protective immunity"
    ],
    relationships: [
      "Noble partner",
      "Generous lover",
      "Protective nature",
      "Fruitful relationships"
    ],
    strengths: [
      "Nobility",
      "Generosity",
      "Protective instincts",
      "Fruitful outcomes"
    ],
    weaknesses: [
      "Over-generosity",
      "Over-protectiveness",
      "Noble arrogance",
      "Fruitful expectations"
    ],
    remedies: ["Worship Aryaman", "Fast on Sundays", "Wear ruby"],
    degrees: { start: 146.67, end: 160 },
    pada: {
      1: "Capricorn",
      2: "Aquarius",
      3: "Pisces",
      4: "Aries"
    }
  },
  {
    id: 13,
    name: "हस्त",
    englishName: "Hasta",
    lord: "Moon",
    symbol: "Hand",
    deity: "Savitar",
    element: "Air",
    quality: "Chara (Movable)",
    caste: "Vaishya",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Skilled", "Crafty", "Healing", "Manipulative"],
    personality: ["Skilled", "Crafty", "Healing", "Manipulative"],
    career: [
      "Handicrafts",
      "Surgery",
      "Healing arts",
      "Manual skills",
      "Craftsmanship",
      "Manipulative work"
    ],
    health: [
      "Hand problems",
      "Nervous system",
      "Healing abilities",
      "Manipulative stress"
    ],
    relationships: [
      "Skilled lover",
      "Crafty partner",
      "Healing connection",
      "Manipulative dynamics"
    ],
    strengths: [
      "Manual skills",
      "Craftsmanship",
      "Healing abilities",
      "Manipulative skills"
    ],
    weaknesses: [
      "Manipulative tendencies",
      "Crafty behavior",
      "Healing dependency",
      "Skill overuse"
    ],
    remedies: ["Worship Savitar", "Fast on Mondays", "Wear pearl"],
    degrees: { start: 160, end: 173.33 },
    pada: {
      1: "Aries",
      2: "Taurus",
      3: "Gemini",
      4: "Cancer"
    }
  },
  {
    id: 14,
    name: "चित्रा",
    englishName: "Chitra",
    lord: "Mars",
    symbol: "Pearl",
    deity: "Vishwakarma",
    element: "Air",
    quality: "Dhruva (Fixed)",
    caste: "Shudra",
    sex: "Female",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Beautiful", "Artistic", "Creative", "Illusion"],
    personality: ["Beautiful", "Artistic", "Creative", "Illusion"],
    career: [
      "Fashion design",
      "Art",
      "Beauty industry",
      "Creative arts",
      "Illusion work",
      "Design"
    ],
    health: [
      "Skin health",
      "Beauty concerns",
      "Artistic stress",
      "Illusion-related issues"
    ],
    relationships: [
      "Beautiful partner",
      "Artistic connection",
      "Creative lover",
      "Illusion dynamics"
    ],
    strengths: [
      "Beauty",
      "Artistic talent",
      "Creativity",
      "Illusion skills"
    ],
    weaknesses: [
      "Illusion tendencies",
      "Artistic ego",
      "Beauty obsession",
      "Creative blocks"
    ],
    remedies: ["Worship Vishwakarma", "Fast on Tuesdays", "Wear red coral"],
    degrees: { start: 173.33, end: 186.67 },
    pada: {
      1: "Cancer",
      2: "Leo",
      3: "Virgo",
      4: "Libra"
    }
  },
  {
    id: 15,
    name: "स्वाति",
    englishName: "Swati",
    lord: "Rahu",
    symbol: "Sword",
    deity: "Vayu",
    element: "Air",
    quality: "Chara (Movable)",
    caste: "Kshatriya",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Independent", "Sharp", "Cutting", "Windy"],
    personality: ["Independent", "Sharp", "Cutting", "Windy"],
    career: [
      "Independence work",
      "Sharp tools",
      "Cutting work",
      "Wind energy",
      "Sword work",
      "Air work"
    ],
    health: [
      "Independent health",
      "Sharp issues",
      "Cutting problems",
      "Windy health"
    ],
    relationships: [
      "Independent partner",
      "Sharp connection",
      "Cutting dynamics",
      "Windy relationships"
    ],
    strengths: [
      "Independence",
      "Sharpness",
      "Cutting ability",
      "Wind power"
    ],
    weaknesses: [
      "Independence",
      "Sharpness",
      "Cutting",
      "Wind"
    ],
    remedies: ["Worship Vayu", "Fast on Saturdays", "Wear hessonite"],
    degrees: { start: 186.67, end: 200 },
    pada: {
      1: "Libra",
      2: "Scorpio",
      3: "Sagittarius",
      4: "Capricorn"
    }
  },
  {
    id: 16,
    name: "विशाखा",
    englishName: "Vishakha",
    lord: "Jupiter",
    symbol: "Archway",
    deity: "Indra",
    element: "Air",
    quality: "Dhruva (Fixed)",
    caste: "Kshatriya",
    sex: "Female",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Achieving", "Goal-oriented", "Powerful", "Determined"],
    personality: ["Achieving", "Goal-oriented", "Powerful", "Determined"],
    career: [
      "Achievement work",
      "Goal setting",
      "Power work",
      "Determination work",
      "Archway work",
      "Indra work"
    ],
    health: [
      "Achieving health",
      "Goal-oriented health",
      "Powerful health",
      "Determined health"
    ],
    relationships: [
      "Achieving partner",
      "Goal-oriented connection",
      "Powerful dynamics",
      "Determined relationships"
    ],
    strengths: [
      "Achievement",
      "Goal orientation",
      "Power",
      "Determination"
    ],
    weaknesses: [
      "Achievement",
      "Goals",
      "Power",
      "Determination"
    ],
    remedies: ["Worship Indra", "Fast on Thursdays", "Wear yellow sapphire"],
    degrees: { start: 200, end: 213.33 },
    pada: {
      1: "Capricorn",
      2: "Aquarius",
      3: "Pisces",
      4: "Aries"
    }
  },
  {
    id: 17,
    name: "अनुराधा",
    englishName: "Anuradha",
    lord: "Saturn",
    symbol: "Lotus",
    deity: "Mitra",
    element: "Air",
    quality: "Chara (Movable)",
    caste: "Shudra",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Friendship", "Cooperation", "Success", "Radiance"],
    personality: ["Friendship", "Cooperation", "Success", "Radiance"],
    career: [
      "Friendship work",
      "Cooperation work",
      "Success work",
      "Radiance work",
      "Lotus work",
      "Mitra work"
    ],
    health: [
      "Friendship health",
      "Cooperation health",
      "Success health",
      "Radiance health"
    ],
    relationships: [
      "Friendship partner",
      "Cooperation connection",
      "Success dynamics",
      "Radiance relationships"
    ],
    strengths: [
      "Friendship",
      "Cooperation",
      "Success",
      "Radiance"
    ],
    weaknesses: [
      "Friendship",
      "Cooperation",
      "Success",
      "Radiance"
    ],
    remedies: ["Worship Mitra", "Fast on Saturdays", "Wear blue sapphire"],
    degrees: { start: 213.33, end: 226.67 },
    pada: {
      1: "Aries",
      2: "Taurus",
      3: "Gemini",
      4: "Cancer"
    }
  },
  {
    id: 18,
    name: "ज्येष्ठा",
    englishName: "Jyeshtha",
    lord: "Mercury",
    symbol: "Earring",
    deity: "Indra",
    element: "Air",
    quality: "Dhruva (Fixed)",
    caste: "Shudra",
    sex: "Female",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Elder", "Senior", "Powerful", "Protective"],
    personality: ["Elder", "Senior", "Powerful", "Protective"],
    career: [
      "Elder work",
      "Senior work",
      "Power work",
      "Protection work",
      "Earring work",
      "Indra work"
    ],
    health: [
      "Elder health",
      "Senior health",
      "Powerful health",
      "Protective health"
    ],
    relationships: [
      "Elder partner",
      "Senior connection",
      "Powerful dynamics",
      "Protective relationships"
    ],
    strengths: [
      "Elder wisdom",
      "Senior knowledge",
      "Power",
      "Protection"
    ],
    weaknesses: [
      "Elder",
      "Senior",
      "Power",
      "Protection"
    ],
    remedies: ["Worship Indra", "Fast on Wednesdays", "Wear emerald"],
    degrees: { start: 226.67, end: 240 },
    pada: {
      1: "Cancer",
      2: "Leo",
      3: "Virgo",
      4: "Libra"
    }
  },
  {
    id: 19,
    name: "मूल",
    englishName: "Mula",
    lord: "Ketu",
    symbol: "Root",
    deity: "Nirriti",
    element: "Water",
    quality: "Chara (Movable)",
    caste: "Shudra",
    sex: "Male",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Root", "Foundation", "Destruction", "Transformation"],
    personality: ["Root", "Foundation", "Destruction", "Transformation"],
    career: [
      "Root work",
      "Foundation work",
      "Destruction work",
      "Transformation work",
      "Root work",
      "Nirriti work"
    ],
    health: [
      "Root health",
      "Foundation health",
      "Destruction health",
      "Transformation health"
    ],
    relationships: [
      "Root partner",
      "Foundation connection",
      "Destruction dynamics",
      "Transformation relationships"
    ],
    strengths: [
      "Root strength",
      "Foundation",
      "Destruction",
      "Transformation"
    ],
    weaknesses: [
      "Root",
      "Foundation",
      "Destruction",
      "Transformation"
    ],
    remedies: ["Worship Nirriti", "Fast on Tuesdays", "Wear red coral"],
    degrees: { start: 240, end: 253.33 },
    pada: {
      1: "Libra",
      2: "Scorpio",
      3: "Sagittarius",
      4: "Capricorn"
    }
  },
  {
    id: 20,
    name: "पूर्वाषाढ़ा",
    englishName: "Purva Ashadha",
    lord: "Venus",
    symbol: "Fan",
    deity: "Apas",
    element: "Water",
    quality: "Dhruva (Fixed)",
    caste: "Kshatriya",
    sex: "Male",
    nature: "Manushya (Human)",
    characteristics: ["Invincible", "Unconquerable", "Victorious", "Powerful"],
    personality: ["Invincible", "Unconquerable", "Victorious", "Powerful"],
    career: [
      "Invincible work",
      "Unconquerable work",
      "Victory work",
      "Power work",
      "Fan work",
      "Apas work"
    ],
    health: [
      "Invincible health",
      "Unconquerable health",
      "Victorious health",
      "Powerful health"
    ],
    relationships: [
      "Invincible partner",
      "Unconquerable connection",
      "Victorious dynamics",
      "Powerful relationships"
    ],
    strengths: [
      "Invincible",
      "Unconquerable",
      "Victory",
      "Power"
    ],
    weaknesses: [
      "Invincible",
      "Unconquerable",
      "Victory",
      "Power"
    ],
    remedies: ["Worship Apas", "Fast on Fridays", "Wear diamond"],
    degrees: { start: 253.33, end: 266.67 },
    pada: {
      1: "Capricorn",
      2: "Aquarius",
      3: "Pisces",
      4: "Aries"
    }
  },
  {
    id: 21,
    name: "उत्तराषाढ़ा",
    englishName: "Uttara Ashadha",
    lord: "Sun",
    symbol: "Elephant Tusk",
    deity: "Vishvedevas",
    element: "Water",
    quality: "Chara (Movable)",
    caste: "Kshatriya",
    sex: "Female",
    nature: "Manushya (Human)",
    characteristics: ["Victorious", "Universal", "All-encompassing", "Powerful"],
    personality: ["Victorious", "Universal", "All-encompassing", "Powerful"],
    career: [
      "Victory work",
      "Universal work",
      "All-encompassing work",
      "Power work",
      "Elephant Tusk work",
      "Vishvedevas work"
    ],
    health: [
      "Victorious health",
      "Universal health",
      "All-encompassing health",
      "Powerful health"
    ],
    relationships: [
      "Victorious partner",
      "Universal connection",
      "All-encompassing dynamics",
      "Powerful relationships"
    ],
    strengths: [
      "Victory",
      "Universal",
      "All-encompassing",
      "Power"
    ],
    weaknesses: [
      "Victory",
      "Universal",
      "All-encompassing",
      "Power"
    ],
    remedies: ["Worship Vishvedevas", "Fast on Sundays", "Wear ruby"],
    degrees: { start: 266.67, end: 280 },
    pada: {
      1: "Aries",
      2: "Taurus",
      3: "Gemini",
      4: "Cancer"
    }
  },
  {
    id: 22,
    name: "श्रवण",
    englishName: "Shravana",
    lord: "Moon",
    symbol: "Ear",
    deity: "Vishnu",
    element: "Earth",
    quality: "Dhruva (Fixed)",
    caste: "Vaishya",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Listening", "Learning", "Hearing", "Knowledge"],
    personality: ["Listening", "Learning", "Hearing", "Knowledge"],
    career: [
      "Listening work",
      "Learning work",
      "Hearing work",
      "Knowledge work",
      "Ear work",
      "Vishnu work"
    ],
    health: [
      "Listening health",
      "Learning health",
      "Hearing health",
      "Knowledge health"
    ],
    relationships: [
      "Listening partner",
      "Learning connection",
      "Hearing dynamics",
      "Knowledge relationships"
    ],
    strengths: [
      "Listening",
      "Learning",
      "Hearing",
      "Knowledge"
    ],
    weaknesses: [
      "Listening",
      "Learning",
      "Hearing",
      "Knowledge"
    ],
    remedies: ["Worship Vishnu", "Fast on Mondays", "Wear pearl"],
    degrees: { start: 280, end: 293.33 },
    pada: {
      1: "Cancer",
      2: "Leo",
      3: "Virgo",
      4: "Libra"
    }
  },
  {
    id: 23,
    name: "धनिष्ठा",
    englishName: "Dhanishtha",
    lord: "Mars",
    symbol: "Drum",
    deity: "Vasus",
    element: "Earth",
    quality: "Chara (Movable)",
    caste: "Shudra",
    sex: "Female",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Wealthy", "Musical", "Rhythmic", "Abundant"],
    personality: ["Wealthy", "Musical", "Rhythmic", "Abundant"],
    career: [
      "Wealth work",
      "Music work",
      "Rhythm work",
      "Abundance work",
      "Drum work",
      "Vasus work"
    ],
    health: [
      "Wealthy health",
      "Musical health",
      "Rhythmic health",
      "Abundant health"
    ],
    relationships: [
      "Wealthy partner",
      "Musical connection",
      "Rhythmic dynamics",
      "Abundant relationships"
    ],
    strengths: [
      "Wealth",
      "Music",
      "Rhythm",
      "Abundance"
    ],
    weaknesses: [
      "Wealth",
      "Music",
      "Rhythm",
      "Abundance"
    ],
    remedies: ["Worship Vasus", "Fast on Tuesdays", "Wear red coral"],
    degrees: { start: 293.33, end: 306.67 },
    pada: {
      1: "Libra",
      2: "Scorpio",
      3: "Sagittarius",
      4: "Capricorn"
    }
  },
  {
    id: 24,
    name: "शतभिषा",
    englishName: "Shatabhisha",
    lord: "Rahu",
    symbol: "100 Stars",
    deity: "Varuna",
    element: "Earth",
    quality: "Dhruva (Fixed)",
    caste: "Shudra",
    sex: "Male",
    nature: "Rakshasa (Demonic)",
    characteristics: ["Healing", "Mystical", "Hidden", "Transformative"],
    personality: ["Healing", "Mystical", "Hidden", "Transformative"],
    career: [
      "Healing work",
      "Mysticism work",
      "Hidden work",
      "Transformation work",
      "100 Stars work",
      "Varuna work"
    ],
    health: [
      "Healing health",
      "Mystical health",
      "Hidden health",
      "Transformative health"
    ],
    relationships: [
      "Healing partner",
      "Mystical connection",
      "Hidden dynamics",
      "Transformative relationships"
    ],
    strengths: [
      "Healing",
      "Mysticism",
      "Hidden",
      "Transformation"
    ],
    weaknesses: [
      "Healing",
      "Mysticism",
      "Hidden",
      "Transformation"
    ],
    remedies: ["Worship Varuna", "Fast on Saturdays", "Wear hessonite"],
    degrees: { start: 306.67, end: 320 },
    pada: {
      1: "Capricorn",
      2: "Aquarius",
      3: "Pisces",
      4: "Aries"
    }
  },
  {
    id: 25,
    name: "पूर्व भाद्रपद",
    englishName: "Purva Bhadrapada",
    lord: "Jupiter",
    symbol: "Sword",
    deity: "Aja Ekapada",
    element: "Fire",
    quality: "Chara (Movable)",
    caste: "Kshatriya",
    sex: "Male",
    nature: "Manushya (Human)",
    characteristics: ["Warrior", "Protective", "Sharp", "Powerful"],
    personality: ["Warrior", "Protective", "Sharp", "Powerful"],
    career: [
      "Warrior work",
      "Protection work",
      "Sharpness work",
      "Power work",
      "Sword work",
      "Aja Ekapada work"
    ],
    health: [
      "Warrior health",
      "Protective health",
      "Sharp health",
      "Powerful health"
    ],
    relationships: [
      "Warrior partner",
      "Protective connection",
      "Sharp dynamics",
      "Powerful relationships"
    ],
    strengths: [
      "Warrior",
      "Protection",
      "Sharpness",
      "Power"
    ],
    weaknesses: [
      "Warrior",
      "Protection",
      "Sharpness",
      "Power"
    ],
    remedies: ["Worship Aja Ekapada", "Fast on Thursdays", "Wear yellow sapphire"],
    degrees: { start: 320, end: 333.33 },
    pada: {
      1: "Aries",
      2: "Taurus",
      3: "Gemini",
      4: "Cancer"
    }
  },
  {
    id: 26,
    name: "उत्तर भाद्रपद",
    englishName: "Uttara Bhadrapada",
    lord: "Saturn",
    symbol: "Snake",
    deity: "Ahir Budhnya",
    element: "Fire",
    quality: "Dhruva (Fixed)",
    caste: "Kshatriya",
    sex: "Female",
    nature: "Manushya (Human)",
    characteristics: ["Serpent", "Hidden", "Mystical", "Protective"],
    personality: ["Serpent", "Hidden", "Mystical", "Protective"],
    career: [
      "Serpent work",
      "Hidden work",
      "Mysticism work",
      "Protection work",
      "Snake work",
      "Ahir Budhnya work"
    ],
    health: [
      "Serpent health",
      "Hidden health",
      "Mystical health",
      "Protective health"
    ],
    relationships: [
      "Serpent partner",
      "Hidden connection",
      "Mystical dynamics",
      "Protective relationships"
    ],
    strengths: [
      "Serpent",
      "Hidden",
      "Mysticism",
      "Protection"
    ],
    weaknesses: [
      "Serpent",
      "Hidden",
      "Mysticism",
      "Protection"
    ],
    remedies: ["Worship Ahir Budhnya", "Fast on Saturdays", "Wear blue sapphire"],
    degrees: { start: 333.33, end: 346.67 },
    pada: {
      1: "Cancer",
      2: "Leo",
      3: "Virgo",
      4: "Libra"
    }
  },
  {
    id: 27,
    name: "रेवती",
    englishName: "Revati",
    lord: "Mercury",
    symbol: "Fish",
    deity: "Pushan",
    element: "Fire",
    quality: "Chara (Movable)",
    caste: "Vaishya",
    sex: "Male",
    nature: "Deva (Divine)",
    characteristics: ["Nourishing", "Protective", "Caring", "Abundant"],
    personality: ["Nourishing", "Protective", "Caring", "Abundant"],
    career: [
      "Nourishment work",
      "Protection work",
      "Caring work",
      "Abundance work",
      "Fish work",
      "Pushan work"
    ],
    health: [
      "Nourishing health",
      "Protective health",
      "Caring health",
      "Abundant health"
    ],
    relationships: [
      "Nourishing partner",
      "Protective connection",
      "Caring dynamics",
      "Abundant relationships"
    ],
    strengths: [
      "Nourishment",
      "Protection",
      "Caring",
      "Abundance"
    ],
    weaknesses: [
      "Nourishment",
      "Protection",
      "Caring",
      "Abundance"
    ],
    remedies: ["Worship Pushan", "Fast on Wednesdays", "Wear emerald"],
    degrees: { start: 346.67, end: 360 },
    pada: {
      1: "Libra",
      2: "Scorpio",
      3: "Sagittarius",
      4: "Capricorn"
    }
  }
];

// Helper functions for nakshatra calculations
export function getNakshatraFromLongitude(longitude: number): NakshatraData | null {
  // Validate longitude
  if (longitude === undefined || longitude === null || isNaN(longitude)) {
    console.warn('⚠️ Invalid longitude for nakshatra calculation:', longitude);
    return null;
  }
  
  const nakshatraIndex = Math.floor(longitude / (360 / 27));
  return NAKSHATRAS[nakshatraIndex % 27] || null;
}

export function getNakshatraLord(nakshatraId: number): string {
  return NAKSHATRAS[nakshatraId - 1]?.lord || 'Unknown';
}

export function getNakshatraCharacteristics(nakshatraId: number): string[] {
  return NAKSHATRAS[nakshatraId - 1]?.characteristics || [];
}

export function getNakshatraRemedies(nakshatraId: number): string[] {
  return NAKSHATRAS[nakshatraId - 1]?.remedies || [];
}
