import { ToolConfig } from '@/lib/types/toolSchemas';

// Tool Configuration Database
export const TOOL_CONFIGS: Record<string, ToolConfig> = {

  'vedic-astrology': {
    slug: 'vedic-astrology',
    name: 'Vedic Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024, // 5MB
    analysisTime: 30,
    apiEndpoint: '/api/tools/vedic/analysis',
    description: 'Ancient Indian astrological system with comprehensive birth chart analysis',
    icon: '🕉️',
    popularityScore: 72 // Tier 2
  },
  'western-astrology': {
    slug: 'western-astrology',
    name: 'Western Astrology',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/western-astrology/analysis',
    description: 'Traditional Western zodiac system',
    icon: '⭐',
    popularityScore: 100 // Tier 1 - Baseline
  },
  'hellenistic-astrology': {
    slug: 'hellenistic-astrology',
    name: 'Hellenistic Astrology',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/hellenistic-astrology/analysis',
    description: 'Ancient Greco-Roman astrology system (1st century BCE - 7th century CE)',
    icon: '🏛️',
    popularityScore: 65 // Tier 2
  },
  'kp-astrology': {
    slug: 'kp-astrology',
    name: 'KP Astrology',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/tools/kp-astrology/analysis',
    description: 'Krishnamurti Paddhati system',
    icon: '🎯',
    popularityScore: 37 // Tier 3
  },
  'numerology': {
    slug: 'numerology',
    name: 'Chaldean Numerology',
    category: 'Numerology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 20,
    apiEndpoint: '/api/tools/numerology/analysis',
    description: 'Ancient Babylonian number system',
    icon: '🔢',
    popularityScore: 77 // Tier 1
  },
  'tarot': {
    slug: 'tarot',
    name: 'Tarot',
    category: 'Divination',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 15,
    apiEndpoint: '/api/tools/tarot/reading',
    description: '78-card mystical deck system',
    icon: '🔮',
    popularityScore: 87 // Tier 1
  },
  'palmistry': {
    slug: 'palmistry',
    name: 'Palmistry',
    category: 'Reading',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'palmImage', 'dominantHand'],
    optionalFields: [],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/tools/palmistry/analysis',
    description: 'Palm reading and hand analysis',
    icon: '🤲',
    popularityScore: 67 // Tier 2
  },

  // Additional Astrology Tools
  'horary-astrology': {
    slug: 'horary-astrology',
    name: 'Horary Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/horary-astrology/analysis',
    description: 'Question-based astrological divination',
    icon: '🕰️',
    popularityScore: 27 // Tier 4
  },
  'medical-astrology': {
    slug: 'medical-astrology',
    name: 'Medical Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/tools/medical-astrology/analysis',
    description: 'Health-focused astrological analysis',
    icon: '⚕️',
    popularityScore: 27 // Tier 4
  },
  'financial-astrology': {
    slug: 'financial-astrology',
    name: 'Financial Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/tools/financial-astrology/analysis',
    description: 'Investment and wealth astrological guidance',
    icon: '💰',
    popularityScore: 27 // Tier 4
  },
  'mundane-astrology': {
    slug: 'mundane-astrology',
    name: 'Mundane Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/tools/mundane-astrology/analysis',
    description: 'World events and political astrology',
    icon: '🌐',
    popularityScore: 13 // Tier 5
  },
  'synastry': {
    slug: 'synastry',
    name: 'Synastry',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'partnerName', 'partnerDateOfBirth', 'partnerTimeOfBirth', 'partnerPlaceOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/tools/synastry/analysis',
    description: 'Relationship compatibility analysis',
    icon: '💕',
    popularityScore: 52 // Tier 3
  },
  'thirteen-signs-zodiac': {
    slug: 'thirteen-signs-zodiac',
    name: 'Thirteen Signs Zodiac',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: true, // Informational/reference tool
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/thirteen-signs-zodiac/analysis',
    description: 'Modern 13-sign zodiac system (Reference tool - Coming Soon)',
    icon: '🕰️',
    hideFromMainList: true,
    popularityScore: 6 // Tier 6
  },

  // Numerology Tools
  'kabbalistic-numerology': {
    slug: 'kabbalistic-numerology',
    name: 'Kabbalistic Numerology',
    category: 'Numerology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/kabbalistic-numerology/analysis',
    description: 'Hebrew mystical number system',
    icon: '🪬',
    popularityScore: 22 // Tier 4 (similar to other specialized numerology)
  },
  'name-analysis': {
    slug: 'name-analysis',
    name: 'Name Analysis',
    category: 'Numerology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 20,
    apiEndpoint: '/api/tools/name-analysis/analysis',
    description: 'Personality analysis through name',
    icon: '📝',
    popularityScore: 22 // Tier 4
  },
  'angel-numbers': {
    slug: 'angel-numbers',
    name: 'Angel Numbers',
    category: 'Numerology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 15,
    apiEndpoint: '/api/tools/angel-numbers/analysis',
    description: 'Divine guidance through numbers',
    icon: '👼',
    popularityScore: 62 // Tier 2
  },

  // Divination Tools
  'runes': {
    slug: 'runes',
    name: 'Runes',
    category: 'Divination',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 20,
    apiEndpoint: '/api/tools/runes/reading',
    description: 'Ancient Norse divination system',
    icon: 'ᚱ',
    popularityScore: 32 // Tier 4
  },
  'lenormand': {
    slug: 'lenormand',
    name: 'Lenormand',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/lenormand/reading',
    description: '36-card fortune telling system',
    icon: '🍀',
    popularityScore: 22 // Tier 4
  },
  'pendulum': {
    slug: 'pendulum',
    name: 'Pendulum',
    category: 'Divination',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 15,
    apiEndpoint: '/api/tools/pendulum/reading',
    description: 'Crystal pendulum divination',
    icon: '🌀',
    popularityScore: 27 // Tier 4
  },
  'geomancy': {
    slug: 'geomancy',
    name: 'Geomancy',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/geomancy/reading',
    description: 'Earth-based divination system',
    icon: '🌍',
    popularityScore: 17 // Tier 5
  },
  'i-ching': {
    slug: 'i-ching',
    name: 'I Ching',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/tools/i-ching/reading',
    description: 'Ancient Chinese divination system',
    icon: '☯️',
    popularityScore: 47 // Tier 3
  },

  // Reading Tools
  'face-reading': {
    slug: 'face-reading',
    name: 'Face Reading',
    category: 'Reading',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'faceImage'],
    optionalFields: [],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/tools/face-reading/analysis',
    description: 'Personality analysis through facial features',
    icon: '👁️',
    popularityScore: 42 // Tier 3
  },
  'dream-symbols': {
    slug: 'dream-symbols',
    name: 'Dream Symbols',
    category: 'Reading',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dreamDescription'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/dream-symbols/analysis',
    description: 'Dream interpretation and symbolism',
    icon: '🌙',
    popularityScore: 42 // Tier 3
  },

  // Chinese Systems
  'bazi': {
    slug: 'bazi',
    name: 'BaZi',
    category: 'Chinese',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/tools/bazi/analysis',
    description: 'Chinese Four Pillars of Destiny',
    icon: '🏮',
    popularityScore: 57 // Tier 2 (as part of Chinese Astrology)
  },
  'vastu': {
    slug: 'vastu',
    name: 'Vastu',
    category: 'Indian',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/tools/vastu/analysis',
    description: 'Indian architectural harmony system',
    icon: '🏠',
    popularityScore: 22 // Tier 4
  },

  // Advanced Systems
  'akashic-records': {
    slug: 'akashic-records',
    name: 'Akashic Records',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 60,
    apiEndpoint: '/api/tools/akashic-records/reading',
    description: 'Access to the universal library of souls',
    icon: '📚',
    popularityScore: 12 // Tier 5
  },
  'human-design': {
    slug: 'human-design',
    name: 'Human Design',
    category: 'Analysis',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/tools/human-design/analysis',
    description: 'Modern synthesis of astrology, I Ching, Kabbalah, and chakras',
    icon: '🧬',
    popularityScore: 22 // Tier 4
  },

  // Advanced Astrology Systems (New)
  'uranian-astrology': {
    slug: 'uranian-astrology',
    name: 'Uranian Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/occult/universal',
    description: 'Hamburg School midpoint astrology',
    icon: '⚡',
    redirectTo: 'western-astrology',
    hideFromMainList: true
  },
  'cosmobiology': {
    slug: 'cosmobiology',
    name: 'Cosmobiology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/occult/universal',
    description: 'Ebertin system of midpoint astrology',
    icon: '🔬',
    redirectTo: 'western-astrology',
    hideFromMainList: true
  },
  'esoteric-astrology': {
    slug: 'esoteric-astrology',
    name: 'Esoteric Astrology',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 55,
    apiEndpoint: '/api/esoteric-astrology/comprehensive',
    description: 'Soul evolution and spiritual purpose',
    icon: '✨',
    popularityScore: 60
  },
  'kabbalistic-astrology': {
    slug: 'kabbalistic-astrology',
    name: 'Kabbalistic Astrology',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/kabbalistic-astrology/comprehensive',
    description: 'Spiritual blueprint and karmic correction (Tikkun)',
    icon: '🪬',
    popularityScore: 55
  },
  'hermetic-astrology': {
    slug: 'hermetic-astrology',
    name: 'Hermetic Astrology',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/hermetic-astrology/comprehensive',
    description: 'Spiritual mechanics and inner alchemy',
    icon: '🔱',
    popularityScore: 50
  },
  'astrocartography': {
    slug: 'astrocartography',
    name: 'Astrocartography',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 60,
    apiEndpoint: '/api/astrocartography/comprehensive',
    description: 'Location-based activation: where planetary energies are strongest for you',
    icon: '🗺️',
    popularityScore: 55
  },
  'solar-return': {
    slug: 'solar-return',
    name: 'Solar Return',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/occult/universal',
    description: 'Annual birthday chart analysis',
    icon: '☀️',
    redirectTo: 'western-astrology',
    hideFromMainList: true
  },
  'lunar-return': {
    slug: 'lunar-return',
    name: 'Lunar Return',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/occult/universal',
    description: 'Monthly lunar cycle analysis',
    icon: '🌙',
    redirectTo: 'western-astrology',
    hideFromMainList: true
  },
  'progressions': {
    slug: 'progressions',
    name: 'Progressions',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/occult/universal',
    description: 'Progressed chart analysis',
    icon: '⏳',
    redirectTo: 'western-astrology',
    hideFromMainList: true
  },
  'transits': {
    slug: 'transits',
    name: 'Transits',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/occult/universal',
    description: 'Current planetary transits',
    icon: '🔄',
    redirectTo: 'western-astrology',
    hideFromMainList: true
  },
  'composite-charts': {
    slug: 'composite-charts',
    name: 'Composite Charts',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'partnerName', 'partnerDateOfBirth', 'partnerTimeOfBirth', 'partnerPlaceOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 55,
    apiEndpoint: '/api/occult/universal',
    description: 'Relationship composite charts',
    icon: '💑',
    redirectTo: 'synastry',
    hideFromMainList: true
  },
  'davison-charts': {
    slug: 'davison-charts',
    name: 'Davison Charts',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'partnerName', 'partnerDateOfBirth', 'partnerTimeOfBirth', 'partnerPlaceOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/occult/universal',
    description: 'Relationship midpoint charts',
    icon: '💕',
    redirectTo: 'synastry',
    hideFromMainList: true
  },
  'psychological-astrology': {
    slug: 'psychological-astrology',
    name: 'Psychological Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/psychological-astrology/comprehensive',
    description: 'Inner patterns and emotional dynamics — not prediction',
    icon: '🧠',
    popularityScore: 55
  },
  'evolutionary-astrology': {
    slug: 'evolutionary-astrology',
    name: 'Evolutionary Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 55,
    apiEndpoint: '/api/occult/universal',
    description: 'Soul evolution and karmic patterns',
    icon: '🦋',
    redirectTo: 'western-astrology',
    hideFromMainList: true
  },
  'shamanic-astrology': {
    slug: 'shamanic-astrology',
    name: 'Shamanic Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/shamanic-astrology/comprehensive',
    description: 'Initiatory life journey — power, shadow, soul contracts',
    icon: '🪶',
    popularityScore: 50
  },
  'quantum-astrology': {
    slug: 'quantum-astrology',
    name: 'Quantum Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: true, // Informational/reference tool
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 60,
    apiEndpoint: '/api/occult/universal',
    description: 'Quantum field and consciousness (Reference tool - Coming Soon)',
    icon: '⚛️',
    hideFromMainList: true,
    popularityScore: 6 // Tier 6
  },

  // Traditional Systems (New) - Reference/Informational Tools
  'tibetan-astrology': {
    slug: 'tibetan-astrology',
    name: 'Tibetan Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: true, // Informational/reference tool
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/occult/universal',
    description: 'Tibetan Buddhist astrology (Reference tool - Coming Soon)',
    icon: '🏔️',
    hideFromMainList: true,
    popularityScore: 6 // Tier 6
  },
  'mayan-astrology': {
    slug: 'mayan-astrology',
    name: 'Mayan Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: true, // Informational/reference tool
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/occult/universal',
    description: 'Mayan calendar and astrology (Reference tool - Coming Soon)',
    icon: '🗿',
    hideFromMainList: true,
    popularityScore: 6 // Tier 6
  },
  'celtic-astrology': {
    slug: 'celtic-astrology',
    name: 'Celtic Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: true, // Informational/reference tool
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/occult/universal',
    description: 'Celtic tree astrology (Reference tool - Coming Soon)',
    icon: '🌳',
    hideFromMainList: true,
    popularityScore: 6 // Tier 6
  },
  'chinese-face-reading': {
    slug: 'chinese-face-reading',
    name: 'Chinese Face Reading',
    category: 'Reading',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'faceImage'],
    optionalFields: [],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/tools/chinese-face-reading/analysis',
    description: 'Traditional Chinese face reading',
    icon: '👤',
    redirectTo: 'face-reading',
    hideFromMainList: true
  },
  'feng-shui': {
    slug: 'feng-shui',
    name: 'Feng Shui',
    category: 'Chinese',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/tools/feng-shui/analysis',
    description: 'Chinese geomancy and space harmony',
    icon: '🪔',
    popularityScore: 32 // Tier 4
  },

  // Energy Systems (New)
  'chakra-analysis': {
    slug: 'chakra-analysis',
    name: 'Chakra Analysis',
    category: 'Energy',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/tools/energy-healing/analysis',
    description: 'Energy center analysis and balancing (Part of Energy & Healing)',
    icon: '🌀',
    redirectTo: 'energy-healing'
  },
  'aura-reading': {
    slug: 'aura-reading',
    name: 'Aura Reading',
    category: 'Energy',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/tools/energy-healing/analysis',
    description: 'Energy field and aura analysis (Part of Energy & Healing)',
    icon: '🌈',
    redirectTo: 'energy-healing'
  },
  'energy-healing': {
    slug: 'energy-healing',
    name: 'Energy & Healing',
    category: 'Energy',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/tools/energy-healing/analysis',
    description: 'Holistic energy work: Chakra Analysis, Aura Reading, Reiki, Crystal Healing, and Energy Balancing',
    icon: '✨',
    popularityScore: 17 // Tier 5
  },
  'reiki': {
    slug: 'reiki',
    name: 'Reiki',
    category: 'Energy',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/tools/energy-healing/analysis',
    description: 'Reiki energy healing system (Part of Energy & Healing)',
    icon: '🙏',
    redirectTo: 'energy-healing'
  },
  'crystal-healing': {
    slug: 'crystal-healing',
    name: 'Crystal Healing',
    category: 'Energy',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 35,
    apiEndpoint: '/api/tools/energy-healing/analysis',
    description: 'Crystal healing and gemstone therapy (Part of Energy & Healing)',
    icon: '💎',
    redirectTo: 'energy-healing'
  },

  // Advanced Divination (New)
  'scrying': {
    slug: 'scrying',
    name: 'Scrying',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/scrying/reading',
    description: 'Crystal ball and mirror scrying',
    icon: '🪞',
    popularityScore: 17 // Tier 5
  },
  'crystal-ball': {
    slug: 'crystal-ball',
    name: 'Crystal Ball',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/scrying/reading',
    description: 'Crystal ball divination (Part of Scrying)',
    icon: '🪞',
    redirectTo: 'scrying'
  },
  'tea-leaf-reading': {
    slug: 'tea-leaf-reading',
    name: 'Tea Leaf Reading',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 20,
    apiEndpoint: '/api/tools/tea-leaf-reading/reading',
    description: 'Tasseography and tea leaf reading',
    icon: '🍵',
    redirectTo: 'dream-symbols',
    hideFromMainList: true
  },
  'bone-throwing': {
    slug: 'bone-throwing',
    name: 'Bone Throwing',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/bone-throwing/reading',
    description: 'Traditional bone throwing divination',
    icon: '🦴',
    redirectTo: 'dream-symbols',
    hideFromMainList: true
  },
  'trichakra-method': {
    slug: 'trichakra-method',
    name: 'Trichakra Method',
    category: 'Remedies',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/tools/trichakra-method/analysis',
    description: 'Integrated occult remedies combining Astrology, Numerology, Vastu, and Lal Kitab for body, mind, and soul',
    icon: '🔯',
    popularityScore: 85 // Tier 1 - High value integrated system
  },
  'ogham': {
    slug: 'ogham',
    name: 'Ogham',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/ogham/reading',
    description: 'Celtic Ogham tree alphabet',
    icon: '🌿',
    popularityScore: 12 // Tier 5
  },

  // New Integrated Tools
  'kerykeion': {
    slug: 'kerykeion',
    name: 'Kerykeion Data-Driven Astrology',
    category: 'Astrology',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 40,
    apiEndpoint: '/api/tools/kerykeion/analysis',
    description: 'Data-driven astrology with Swiss Ephemeris and SVG charts (Calculation tool used internally)',
    icon: '📊',
    hideFromMainList: true, // Hidden - calculation tool, not a divination method
    popularityScore: 0 // Backend tool
  },
  'iztro': {
    slug: 'iztro',
    name: 'Zi Wei Dou Shu (紫微斗数)',
    category: 'Chinese',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 50,
    apiEndpoint: '/api/tools/chinese-astrology/analysis', // Redirects to consolidated page
    description: 'Ancient Chinese Purple Star Astrology - The Emperor\'s Astrology (Merged with Chinese Astrology)',
    icon: '👑',
    redirectTo: 'chinese-astrology', // Indicates this tool redirects to another
    hideFromMainList: true, // Hidden - merged into Chinese Astrology
    popularityScore: 57 // Tier 2 (same as Chinese Astrology)
  },
  'chinese-astrology': {
    slug: 'chinese-astrology',
    name: 'Chinese Astrology (Zi Wei Dou Shu)',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'gender'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 45,
    apiEndpoint: '/api/tools/chinese-astrology/analysis',
    description: '紫微斗数 - Traditional Chinese Purple Star Astrology with 12 palaces and fortune cycles',
    icon: '👑',
    popularityScore: 57 // Tier 2
  },
  'sortilege': {
    slug: 'sortilege',
    name: 'Sortilege Divination',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/sortilege/reading',
    description: 'Multiple divination methods: I Ching, Tarot, Runes, Ogham, and Magic 8-Ball',
    icon: '🪄',
    popularityScore: 10 // Tier 5
  },
  'navaratna-planetary-stones': {
    slug: 'navaratna-planetary-stones',
    name: 'Navaratna & Planetary Stones',
    category: 'Remedies',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/navaratna-planetary-stones/analysis',
    description: 'Personalized gemstone recommendations based on Vedic astrology and Navaratna principles',
    icon: '💎',
    popularityScore: 45 // Tier 3
  },
  'daily-decisions': {
    slug: 'daily-decisions',
    name: 'Daily Decisions',
    category: 'Astrology',
    isPremium: false,
    isComingSoon: false,
    requiredFields: ['fullName', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 25,
    apiEndpoint: '/api/tools/daily-decisions/analysis',
    description: 'Personalized Vedic astrology guidance for daily life decisions (lending, borrowing, haircuts, grooming)',
    icon: '📅',
    popularityScore: 60 // Tier 2
  },
  'bibliomancy': {
    slug: 'bibliomancy',
    name: 'Bibliomancy',
    category: 'Divination',
    isPremium: true,
    isComingSoon: false,
    requiredFields: ['fullName', 'question'],
    optionalFields: ['faceImage'],
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024,
    analysisTime: 30,
    apiEndpoint: '/api/tools/bibliomancy/reading',
    description: 'Sacred Text Divination - Guidance through Bible, Quran, Bhagavad Gita, and more',
    icon: '📖',
    popularityScore: 12 // Tier 5
  }
};

export class ToolManager {
  private static instance: ToolManager;
  private tools: Map<string, ToolConfig>;

  private constructor() {
    this.tools = new Map(Object.entries(TOOL_CONFIGS));
  }

  public static getInstance(): ToolManager {
    if (!ToolManager.instance) {
      ToolManager.instance = new ToolManager();
    }
    return ToolManager.instance;
  }

  // Get all tools
  public getAllTools(): ToolConfig[] {
    return Array.from(this.tools.values());
  }

  // Get tools by category
  public getToolsByCategory(category: string): ToolConfig[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  // Get tool by slug
  public getTool(slug: string): ToolConfig | undefined {
    return this.tools.get(slug);
  }

  // Get all categories
  public getCategories(): string[] {
    const categories = new Set(Array.from(this.tools.values()).map(tool => tool.category));
    return Array.from(categories);
  }

  // Check if tool is available
  public isToolAvailable(slug: string): boolean {
    const tool = this.tools.get(slug);
    return tool ? !tool.isComingSoon : false;
  }

  // Check if tool is premium
  public isToolPremium(slug: string): boolean {
    const tool = this.tools.get(slug);
    return tool ? tool.isPremium : false;
  }

  // Validate tool requirements
  public validateToolRequirements(slug: string, userData: any): { isValid: boolean; missingFields: string[] } {
    const tool = this.tools.get(slug);
    if (!tool) {
      return { isValid: false, missingFields: [] };
    }

    const missingFields = tool.requiredFields.filter(field => !userData[field]);
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // Get tool analysis endpoint
  public getToolEndpoint(slug: string): string | null {
    const tool = this.tools.get(slug);
    return tool ? tool.apiEndpoint : null;
  }

  // Get tool analysis time
  public getToolAnalysisTime(slug: string): number {
    const tool = this.tools.get(slug);
    return tool ? tool.analysisTime : 30;
  }

  // Add new tool (for future expansion)
  public addTool(config: ToolConfig): void {
    this.tools.set(config.slug, config);
  }

  // Remove tool
  public removeTool(slug: string): boolean {
    return this.tools.delete(slug);
  }

  // Get tools count
  public getToolsCount(): number {
    return this.tools.size;
  }

  // Get premium tools count
  public getPremiumToolsCount(): number {
    return Array.from(this.tools.values()).filter(tool => tool.isPremium).length;
  }

  // Search tools
  public searchTools(query: string): ToolConfig[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tools.values()).filter(tool => 
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.category.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Export singleton instance
export const toolManager = ToolManager.getInstance();



