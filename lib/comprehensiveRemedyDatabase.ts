// COMPREHENSIVE HOLISTIC REMEDY DATABASE
// Covers ALL 25+ FutureSeer divination systems for complete A-Z coverage
// Creates the ultimate "WOW" effect with comprehensive mystical solutions

import { 
  Gem, Watch, Circle, Diamond, Palette, Clock, Heart, Shield, Zap, Star, Moon, Sun,
  Leaf, Droplets, Flame, Wind, Eye, Brain, Hand, Foot, Crown, Sparkles, BookOpen,
  Music, Camera, Home, Car, Plane, Tree, Flower, Mountain, Ocean, Fire, Lightning
} from 'lucide-react'

export interface ComprehensiveRemedy {
  id: string
  system: string // Which divination system this remedy comes from
  category: string // Remedy category
  title: string
  description: string
  icon: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  instructions: string[]
  benefits: string[]
  contraindications?: string[]
  activationTime?: string
  duration?: string
  frequency?: string
  cost?: 'free' | 'low' | 'medium' | 'high' | 'luxury'
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  
  // System-specific triggers
  astrologicalTriggers?: string[]
  numerologicalTriggers?: string[]
  tarotTriggers?: string[]
  palmistryTriggers?: string[]
  faceReadingTriggers?: string[]
  vastuTriggers?: string[]
  dreamTriggers?: string[]
  angelNumberTriggers?: string[]
  baziTriggers?: string[]
  ichingTriggers?: string[]
  runeTriggers?: string[]
  lenormandTriggers?: string[]
  
  // Elemental and planetary associations
  elementalAssociations?: string[]
  planetaryRulers?: string[]
  chakraAssociations?: string[]
  meridianAssociations?: string[]
  
  // Advanced associations
  zodiacSigns?: string[]
  houses?: string[]
  aspects?: string[]
  nakshatras?: string[]
  chineseElements?: string[]
  fengShuiDirections?: string[]
  
  // Timing and cycles
  lunarPhase?: string[]
  solarPhase?: string[]
  seasonalTiming?: string[]
  dailyTiming?: string[]
  
  // Compatibility
  compatibleWith?: string[]
  incompatibleWith?: string[]
  
  // Modern applications
  modernUses?: string[]
  scientificBacking?: string[]
  psychologicalBenefits?: string[]
  
  // Cultural origins
  culturalOrigin?: string[]
  traditionalSource?: string[]
  modernAdaptation?: string
}

// ============================================================================
// 1. ASTROLOGICAL REMEDIES (All Systems)
// ============================================================================

export const ASTROLOGICAL_REMEDIES = {
  // Vedic Astrology Remedies
  vedic: {
    nakshatraRemedies: {
      ashwini: {
        title: "Ashwini Nakshatra Activation",
        description: "Enhance speed, healing, and new beginnings",
        instructions: [
          "Wear red clothing on Tuesdays",
          "Chant Ashwini mantra 108 times",
          "Use Ashwagandha herb",
          "Practice horse-riding or fast walking"
        ],
        benefits: ["Enhanced speed", "Better healing", "New opportunities"],
        planetaryRulers: ["Ketu"],
        chakraAssociations: ["Root"]
      },
      bharani: {
        title: "Bharani Nakshatra Enhancement",
        description: "Strengthen determination and creative power",
        instructions: [
          "Wear red and black clothing",
          "Use Yoni mudra daily",
          "Practice creative arts",
          "Eat pomegranate regularly"
        ],
        benefits: ["Increased determination", "Creative power", "Sexual energy"],
        planetaryRulers: ["Venus"],
        chakraAssociations: ["Sacral"]
      }
    },
    
    doshaRemedies: {
      vata: {
        title: "Vata Dosha Balancing",
        description: "Balance air element and nervous system",
        instructions: [
          "Warm oil massage (Abhyanga)",
          "Eat warm, cooked foods",
          "Practice grounding yoga",
          "Use sesame oil for cooking"
        ],
        benefits: ["Reduced anxiety", "Better sleep", "Stable energy"],
        elementalAssociations: ["Air"],
        modernUses: ["Anxiety relief", "Insomnia treatment"]
      },
      pitta: {
        title: "Pitta Dosha Cooling",
        description: "Cool fire element and reduce inflammation",
        instructions: [
          "Cooling foods (cucumber, coconut)",
          "Moon gazing meditation",
          "Swimming or water activities",
          "Avoid spicy foods"
        ],
        benefits: ["Reduced inflammation", "Better digestion", "Cool mind"],
        elementalAssociations: ["Fire"],
        modernUses: ["Inflammation reduction", "Digestive health"]
      },
      kapha: {
        title: "Kapha Dosha Stimulation",
        description: "Stimulate earth element and reduce lethargy",
        instructions: [
          "Dry massage with powder",
          "Spicy and bitter foods",
          "Vigorous exercise",
          "Early morning routine"
        ],
        benefits: ["Increased energy", "Weight management", "Mental clarity"],
        elementalAssociations: ["Earth"],
        modernUses: ["Weight loss", "Energy enhancement"]
      }
    }
  },

  // Western Astrology Remedies
  // IMPORTANT: Western astrology uses psychological and practical approaches, NOT ritualistic remedies
  // Focus on self-awareness, mindfulness, lifestyle adjustments, and conscious engagement with planetary energies
  western: {
    sunSignRemedies: {
      aries: {
        title: "Aries Self-Awareness Practice",
        description: "Develop conscious awareness of your pioneering energy and leadership impulses through self-reflection and constructive action",
        instructions: [
          "Practice morning mindfulness to connect with your Aries drive and assess when to act versus when to pause",
          "Engage in regular physical exercise to channel Mars energy constructively and prevent impulsivity",
          "Develop self-awareness around impulsivity through journaling and reflection before making decisions",
          "Consider therapy or counseling to work with assertiveness patterns and learn healthy boundaries",
          "Establish routines that honor your need for independence while developing patience and follow-through",
          "Practice conscious leadership by listening before acting and considering others' perspectives"
        ],
        benefits: ["Enhanced self-awareness", "Constructive expression of Mars energy", "Better impulse control", "Improved decision-making"],
        planetaryRulers: ["Mars"],
        elementalAssociations: ["Fire"],
        modernUses: ["Personal growth", "Leadership development", "Stress management", "Anger management"]
      },
      taurus: {
        title: "Taurus Mindful Grounding",
        description: "Cultivate awareness of your need for stability while remaining flexible and open to growth",
        instructions: [
          "Practice grounding meditation and body awareness to connect with your physical and emotional needs",
          "Develop mindful spending habits and reflect on your relationship with material security",
          "Establish routines that provide stability while allowing room for necessary change and growth",
          "Practice setting healthy boundaries around your time, energy, and resources",
          "Consider counseling to explore attachment patterns and your relationship with security",
          "Engage in creative practices that honor your sensual nature while expanding your comfort zone"
        ],
        benefits: ["Balanced approach to security", "Flexibility within stability", "Better resource management", "Personal growth"],
        planetaryRulers: ["Venus"],
        elementalAssociations: ["Earth"],
        modernUses: ["Financial wellness", "Relationship health", "Stress reduction", "Personal development"]
      },
      gemini: {
        title: "Gemini Mindful Communication",
        description: "Develop awareness of your communication patterns and learn to focus your mental energy constructively",
        instructions: [
          "Practice mindfulness meditation to quiet the mind and develop focused awareness",
          "Engage in journaling to process thoughts and feelings before expressing them to others",
          "Develop active listening skills and practice being fully present in conversations",
          "Consider counseling or communication workshops to improve relationship dynamics",
          "Establish daily routines that include quiet reflection time alongside social activities",
          "Practice conscious information consumption and set boundaries around media intake"
        ],
        benefits: ["Improved communication", "Better focus and concentration", "Deeper connections", "Mental clarity"],
        planetaryRulers: ["Mercury"],
        elementalAssociations: ["Air"],
        modernUses: ["Communication skills", "Stress management", "Relationship improvement", "Mental wellness"]
      },
      cancer: {
        title: "Cancer Emotional Intelligence",
        description: "Develop healthy emotional boundaries while honoring your nurturing nature and intuitive gifts",
        instructions: [
          "Practice emotional awareness through meditation and journaling to understand your feelings",
          "Develop healthy boundaries to prevent emotional overwhelm and codependency patterns",
          "Engage in self-care practices that honor your need for security and emotional safety",
          "Consider therapy to work with family patterns and develop healthier attachment styles",
          "Practice expressing needs directly rather than through emotional manipulation or withdrawal",
          "Establish routines that balance nurturing others with nurturing yourself"
        ],
        benefits: ["Emotional intelligence", "Healthy boundaries", "Better self-care", "Improved relationships"],
        planetaryRulers: ["Moon"],
        elementalAssociations: ["Water"],
        modernUses: ["Emotional wellness", "Relationship health", "Family dynamics", "Self-care"]
      },
      leo: {
        title: "Leo Authentic Self-Expression",
        description: "Develop authentic confidence and creative expression while maintaining healthy relationships",
        instructions: [
          "Practice self-reflection to distinguish between authentic self-expression and attention-seeking",
          "Engage in creative practices that allow genuine self-expression without requiring external validation",
          "Develop awareness of how your need for recognition affects relationships and interactions",
          "Consider counseling to explore self-esteem and learn to validate yourself internally",
          "Practice humility and learn to celebrate others' successes as well as your own",
          "Establish routines that balance creative expression with rest and reflection"
        ],
        benefits: ["Authentic confidence", "Improved relationships", "Genuine creativity", "Emotional maturity"],
        planetaryRulers: ["Sun"],
        elementalAssociations: ["Fire"],
        modernUses: ["Self-esteem building", "Creative expression", "Leadership development", "Relationship skills"]
      },
      virgo: {
        title: "Virgo Mindful Perfectionism",
        description: "Develop awareness of perfectionist tendencies and learn to embrace imperfection and self-compassion",
        instructions: [
          "Practice mindfulness to recognize when perfectionism becomes self-critical or controlling",
          "Engage in self-compassion exercises and learn to accept \"good enough\" outcomes",
          "Develop awareness of how your analytical nature might create anxiety or stress",
          "Consider therapy to work with perfectionist patterns and develop self-acceptance",
          "Practice delegating tasks and allowing others to help without micromanaging",
          "Establish routines that include rest and self-care, not just productivity and service"
        ],
        benefits: ["Self-compassion", "Reduced anxiety", "Better work-life balance", "Improved relationships"],
        planetaryRulers: ["Mercury"],
        elementalAssociations: ["Earth"],
        modernUses: ["Anxiety management", "Work-life balance", "Self-care", "Personal growth"]
      },
      libra: {
        title: "Libra Balanced Relationships",
        description: "Develop awareness of relationship patterns and learn to make decisions based on your own values",
        instructions: [
          "Practice self-reflection to understand your own values and desires independent of others' opinions",
          "Develop decision-making skills that honor your needs as well as others' needs",
          "Engage in solo activities to strengthen your sense of self and independence",
          "Consider counseling to explore codependency patterns and people-pleasing tendencies",
          "Practice setting boundaries in relationships and expressing disagreement when needed",
          "Establish routines that balance social connection with alone time for reflection"
        ],
        benefits: ["Personal autonomy", "Healthier relationships", "Better decision-making", "Self-confidence"],
        planetaryRulers: ["Venus"],
        elementalAssociations: ["Air"],
        modernUses: ["Relationship health", "Self-development", "Boundary setting", "Personal growth"]
      },
      scorpio: {
        title: "Scorpio Transformative Awareness",
        description: "Develop awareness of control patterns and learn to embrace vulnerability and transformation",
        instructions: [
          "Practice deep self-reflection and shadow work to understand hidden motivations and fears",
          "Develop trust and vulnerability in relationships while maintaining healthy boundaries",
          "Engage in therapy or counseling to work with intensity, jealousy, and control issues",
          "Practice letting go of control and allowing transformation to occur naturally",
          "Learn to express intense emotions constructively rather than through manipulation or secrecy",
          "Establish routines that include both intense engagement and periods of rest and renewal"
        ],
        benefits: ["Emotional depth", "Healthy relationships", "Personal transformation", "Genuine intimacy"],
        planetaryRulers: ["Mars", "Pluto"],
        elementalAssociations: ["Water"],
        modernUses: ["Relationship healing", "Personal transformation", "Emotional wellness", "Spiritual growth"]
      },
      sagittarius: {
        title: "Sagittarius Mindful Exploration",
        description: "Develop awareness of restlessness and learn to find meaning in both journey and destination",
        instructions: [
          "Practice mindfulness to stay present rather than constantly seeking the next adventure",
          "Engage in philosophical study and reflection to deepen understanding, not just accumulate knowledge",
          "Develop awareness of when optimism becomes avoidance of difficult emotions or situations",
          "Consider counseling to explore restlessness and commitment issues",
          "Practice commitment and follow-through on projects and relationships",
          "Establish routines that balance exploration and adventure with stability and responsibility"
        ],
        benefits: ["Present-moment awareness", "Deeper meaning", "Commitment skills", "Balanced optimism"],
        planetaryRulers: ["Jupiter"],
        elementalAssociations: ["Fire"],
        modernUses: ["Personal growth", "Relationship commitment", "Spiritual development", "Life direction"]
      },
      capricorn: {
        title: "Capricorn Balanced Ambition",
        description: "Develop awareness of work patterns and learn to balance ambition with emotional fulfillment",
        instructions: [
          "Practice self-reflection to understand your relationship with achievement and external validation",
          "Develop awareness of when discipline becomes rigidity or work becomes avoidance of emotions",
          "Engage in therapy to explore family patterns and develop emotional expression skills",
          "Practice self-compassion and learn that your worth isn't tied to achievements",
          "Establish routines that include rest, play, and emotional connection, not just work and responsibility",
          "Practice asking for help and delegating rather than carrying everything alone"
        ],
        benefits: ["Work-life balance", "Emotional fulfillment", "Self-compassion", "Healthier relationships"],
        planetaryRulers: ["Saturn"],
        elementalAssociations: ["Earth"],
        modernUses: ["Work-life balance", "Stress management", "Emotional wellness", "Personal growth"]
      },
      aquarius: {
        title: "Aquarius Conscious Individuality",
        description: "Develop awareness of detachment patterns and learn to balance independence with connection",
        instructions: [
          "Practice emotional awareness and learn to identify and express feelings rather than intellectualizing",
          "Develop authentic connections with others while maintaining your independence and uniqueness",
          "Engage in group activities and community involvement to practice interpersonal connection",
          "Consider counseling to explore detachment patterns and fear of emotional intimacy",
          "Practice being present in relationships and engaging emotionally, not just intellectually",
          "Establish routines that balance alone time with social connection and community engagement"
        ],
        benefits: ["Emotional connection", "Authentic relationships", "Personal fulfillment", "Community engagement"],
        planetaryRulers: ["Saturn", "Uranus"],
        elementalAssociations: ["Air"],
        modernUses: ["Relationship development", "Emotional intelligence", "Community involvement", "Personal growth"]
      },
      pisces: {
        title: "Pisces Grounded Intuition",
        description: "Develop awareness of boundaries and learn to ground intuitive gifts in practical reality",
        instructions: [
          "Practice grounding exercises and mindfulness to stay connected to physical reality",
          "Develop healthy boundaries to prevent emotional overwhelm and psychic absorption of others' energy",
          "Engage in creative practices that channel your intuitive and artistic nature constructively",
          "Consider therapy or counseling to work with escapism patterns and develop healthy coping mechanisms",
          "Practice saying no and setting limits to protect your energy and prevent martyrdom",
          "Establish routines that include both spiritual practice and practical responsibilities"
        ],
        benefits: ["Emotional boundaries", "Grounded intuition", "Better self-care", "Practical spirituality"],
        planetaryRulers: ["Jupiter", "Neptune"],
        elementalAssociations: ["Water"],
        modernUses: ["Boundary setting", "Emotional wellness", "Spiritual practice", "Personal growth"]
      }
    },
    
    houseRemedies: {
      firstHouse: {
        title: "First House Self-Awareness",
        description: "Develop conscious awareness of your self-image and how you present yourself to the world",
        instructions: [
          "Practice daily self-reflection and mirror work to develop authentic self-awareness",
          "Engage in activities that help you discover your authentic identity beyond external appearance",
          "Practice self-affirmations based on your genuine strengths and values, not superficial traits",
          "Consider therapy or counseling to explore self-image issues and develop healthy self-esteem",
          "Exercise regularly with mindfulness to connect with your physical body and energy",
          "Develop awareness of how you project yourself versus who you authentically are"
        ],
        benefits: ["Authentic self-image", "Personal confidence", "Self-awareness", "Genuine self-expression"],
        modernUses: ["Self-esteem building", "Personal development", "Identity exploration", "Confidence building"]
      }
    }
  },

  // Medical Astrology Remedies
  medical: {
    planetaryHealth: {
      sun: {
        title: "Solar Energy Enhancement",
        description: "Strengthen heart and vital energy",
        instructions: [
          "Sun gazing at sunrise",
          "Eat orange and red foods",
          "Practice Surya Namaskar",
          "Wear gold jewelry"
        ],
        benefits: ["Heart health", "Vital energy", "Leadership"],
        modernUses: ["Cardiovascular health", "Vitamin D synthesis"]
      },
      moon: {
        title: "Lunar Energy Balancing",
        description: "Balance emotions and mental health",
        instructions: [
          "Moon gazing meditation",
          "Drink silver-charged water",
          "Practice lunar yoga",
          "Wear pearl jewelry"
        ],
        benefits: ["Emotional balance", "Mental clarity", "Intuition"],
        modernUses: ["Mental health", "Sleep improvement"]
      }
    }
  }
}

// ============================================================================
// 2. NUMEROLOGY REMEDIES (All Systems)
// ============================================================================

export const NUMEROLOGY_REMEDIES = {
  // Chaldean Numerology
  chaldean: {
    missingNumbers: {
      1: {
        title: "Leadership Number Activation",
        description: "Enhance leadership and independence",
        instructions: [
          "Wear red clothing on Sundays",
          "Practice leadership exercises",
          "Take initiative daily",
          "Use red crystals (garnet, ruby)",
          "Chant 'Om Suryaya Namah' 108 times",
          "Keep a piece of gold or sunstone nearby",
          "Initiate new ventures on Sundays"
        ],
        benefits: ["Leadership skills", "Independence", "Confidence", "Initiative"],
        modernUses: ["Career advancement", "Personal development", "Entrepreneurship"],
        gemstones: ["Garnet", "Ruby", "Sunstone", "Gold"],
        colors: ["Red", "Orange", "Gold"],
        daysOfWeek: ["Sunday"],
        mantras: ["Om Suryaya Namah"]
      },
      2: {
        title: "Cooperation Number Activation",
        description: "Enhance harmony, diplomacy, and partnership",
        instructions: [
          "Keep a silver bowl filled with water at home",
          "Carry or wear a pearl",
          "Make important decisions on Mondays",
          "Use silver crystals (pearl, moonstone)",
          "Practice meditation and mindfulness",
          "Engage in partnership activities",
          "Wear white or silver clothing"
        ],
        benefits: ["Harmony", "Diplomacy", "Intuition", "Partnership"],
        modernUses: ["Relationship improvement", "Team collaboration", "Emotional balance"],
        gemstones: ["Pearl", "Moonstone", "Silver"],
        colors: ["White", "Silver", "Light Blue"],
        daysOfWeek: ["Monday"],
        mantras: ["Om Som Somaya Namah"]
      },
      3: {
        title: "Creativity Number Activation",
        description: "Enhance expression, creativity, and communication",
        instructions: [
          "Wear yellow clothing or accessories",
          "Apply turmeric tilak on forehead",
          "Plan success-oriented activities on Thursdays",
          "Use yellow crystals (citrine, amber)",
          "Engage in creative arts daily",
          "Practice positive affirmations",
          "Surround yourself with yellow flowers"
        ],
        benefits: ["Creativity", "Expression", "Communication", "Joy"],
        modernUses: ["Creative projects", "Public speaking", "Self-expression"],
        gemstones: ["Citrine", "Amber", "Topaz"],
        colors: ["Yellow", "Gold", "Orange"],
        daysOfWeek: ["Thursday"],
        mantras: ["Om Gum Ganapataye Namah"]
      },
      4: {
        title: "Stability Number Activation",
        description: "Enhance stability, organization, and structure",
        instructions: [
          "Use iron objects in your environment",
          "Wear blue sapphire (verified quality)",
          "Implement life changes on Saturdays",
          "Use blue/black crystals (sapphire, onyx)",
          "Create structured routines",
          "Practice grounding exercises",
          "Organize your living space"
        ],
        benefits: ["Stability", "Organization", "Discipline", "Reliability"],
        modernUses: ["Career stability", "Financial planning", "Time management"],
        gemstones: ["Blue Sapphire", "Onyx", "Obsidian"],
        colors: ["Blue", "Black", "Navy"],
        daysOfWeek: ["Saturday"],
        mantras: ["Om Sham Shanicharaya Namah"]
      },
      5: {
        title: "Freedom Number Activation",
        description: "Enhance adventure, freedom, and versatility",
        instructions: [
          "Wear emerald or green crystals",
          "Place green plants in your home",
          "Plan important activities on Wednesdays",
          "Use green crystals (emerald, peridot)",
          "Practice diverse activities",
          "Travel when possible",
          "Embrace change and variety"
        ],
        benefits: ["Freedom", "Adventure", "Versatility", "Communication"],
        modernUses: ["Career flexibility", "Personal growth", "Social connections"],
        gemstones: ["Emerald", "Peridot", "Green Tourmaline"],
        colors: ["Green", "Emerald Green"],
        daysOfWeek: ["Wednesday"],
        mantras: ["Om Bum Budhaya Namah"]
      },
      6: {
        title: "Nurturing Number Activation",
        description: "Enhance love, responsibility, and nurturing qualities",
        instructions: [
          "Keep fresh flowers at home",
          "Wear diamond or white crystals",
          "Plan social or financial activities on Fridays",
          "Use white/clear crystals (diamond, clear quartz)",
          "Practice acts of service",
          "Spend time with family",
          "Create a harmonious home environment"
        ],
        benefits: ["Love", "Responsibility", "Nurturing", "Balance"],
        modernUses: ["Relationship harmony", "Family life", "Home improvement"],
        gemstones: ["Diamond", "Clear Quartz", "White Topaz"],
        colors: ["White", "Pink", "Light Blue"],
        daysOfWeek: ["Friday"],
        mantras: ["Om Shukraya Namah"]
      },
      7: {
        title: "Spiritual Number Activation",
        description: "Enhance spirituality, wisdom, and introspection",
        instructions: [
          "Meditate with clear quartz",
          "Keep spiritual artifacts at home",
          "Practice spiritual activities on Sundays",
          "Use purple/clear crystals (amethyst, clear quartz)",
          "Spend time in nature",
          "Practice silence and solitude",
          "Study spiritual texts"
        ],
        benefits: ["Spirituality", "Wisdom", "Intuition", "Inner peace"],
        modernUses: ["Spiritual growth", "Mental clarity", "Meditation practice"],
        gemstones: ["Amethyst", "Clear Quartz", "Selenite"],
        colors: ["Purple", "Violet", "Indigo"],
        daysOfWeek: ["Sunday"],
        mantras: ["Om Namah Shivaya"]
      },
      8: {
        title: "Power Number Activation",
        description: "Enhance material success, authority, and achievement",
        instructions: [
          "Donate black items to charity",
          "Light a mustard oil lamp on Saturdays",
          "Use black/red crystals (garnet, black tourmaline)",
          "Practice financial discipline",
          "Set ambitious goals",
          "Take leadership roles",
          "Wear power colors"
        ],
        benefits: ["Material success", "Authority", "Achievement", "Power"],
        modernUses: ["Business success", "Financial growth", "Career advancement"],
        gemstones: ["Garnet", "Black Tourmaline", "Obsidian"],
        colors: ["Black", "Dark Blue", "Burgundy"],
        daysOfWeek: ["Saturday"],
        mantras: ["Om Sham Shanicharaya Namah"]
      },
      9: {
        title: "Humanitarian Number Activation",
        description: "Enhance compassion, service, and universal love",
        instructions: [
          "Wear red coral or red crystals",
          "Light camphor daily",
          "Plan challenging activities on Tuesdays",
          "Use red crystals (red coral, carnelian)",
          "Practice acts of service",
          "Support humanitarian causes",
          "Express gratitude daily"
        ],
        benefits: ["Compassion", "Service", "Universal love", "Completion"],
        modernUses: ["Philanthropy", "Community service", "Personal fulfillment"],
        gemstones: ["Red Coral", "Carnelian", "Ruby"],
        colors: ["Red", "Crimson"],
        daysOfWeek: ["Tuesday"],
        mantras: ["Om Mang Mangalaya Namah"]
      }
    },
    
    lifePathRemedies: {
      1: {
        title: "Life Path 1 Enhancement - The Leader",
        description: "Strengthen pioneering and leadership qualities",
        instructions: [
          "Wear gold accessories or keep sunstone nearby",
          "Initiate new ventures on Sundays",
          "Practice solo activities to build independence",
          "Take calculated risks regularly",
          "Develop self-reliance through challenging projects",
          "Wear power colors (red, orange, gold)",
          "Chant 'Om Suryaya Namah' for solar energy",
          "Set clear, ambitious goals"
        ],
        benefits: ["Leadership", "Innovation", "Independence", "Confidence"],
        modernUses: ["Entrepreneurship", "Career leadership", "Personal development"],
        gemstones: ["Sunstone", "Gold", "Garnet", "Ruby"],
        colors: ["Red", "Orange", "Gold"],
        daysOfWeek: ["Sunday"],
        mantras: ["Om Suryaya Namah"]
      },
      2: {
        title: "Life Path 2 Enhancement - The Harmonizer",
        description: "Strengthen cooperation, diplomacy, and partnership",
        instructions: [
          "Keep a silver bowl filled with water at home",
          "Carry or wear a pearl for calmness",
          "Make significant decisions on Mondays",
          "Practice meditation and mindfulness daily",
          "Engage in partnership activities",
          "Develop intuition through quiet reflection",
          "Wear white or silver clothing",
          "Practice active listening"
        ],
        benefits: ["Harmony", "Diplomacy", "Intuition", "Partnership"],
        modernUses: ["Relationship harmony", "Team collaboration", "Emotional balance"],
        gemstones: ["Pearl", "Moonstone", "Silver"],
        colors: ["White", "Silver", "Light Blue"],
        daysOfWeek: ["Monday"],
        mantras: ["Om Som Somaya Namah"]
      },
      3: {
        title: "Life Path 3 Enhancement - The Visionary",
        description: "Strengthen creativity, expression, and communication",
        instructions: [
          "Incorporate yellow clothing or accessories",
          "Apply turmeric tilak on forehead for auspiciousness",
          "Plan success-oriented activities on Thursdays",
          "Engage in creative arts daily",
          "Practice positive affirmations",
          "Surround yourself with yellow flowers",
          "Express yourself through writing, art, or speaking",
          "Maintain a joyful, optimistic attitude"
        ],
        benefits: ["Creativity", "Expression", "Communication", "Joy"],
        modernUses: ["Creative projects", "Public speaking", "Self-expression"],
        gemstones: ["Citrine", "Amber", "Topaz"],
        colors: ["Yellow", "Gold", "Orange"],
        daysOfWeek: ["Thursday"],
        mantras: ["Om Gum Ganapataye Namah"]
      },
      4: {
        title: "Life Path 4 Enhancement - The Builder",
        description: "Strengthen stability, organization, and structure",
        instructions: [
          "Use iron objects in your environment",
          "Wear blue sapphire (verified quality) for stability",
          "Implement life changes on Saturdays",
          "Create structured daily routines",
          "Practice grounding exercises",
          "Organize your living and work spaces",
          "Build something tangible",
          "Develop practical skills"
        ],
        benefits: ["Stability", "Organization", "Discipline", "Reliability"],
        modernUses: ["Career stability", "Financial planning", "Time management"],
        gemstones: ["Blue Sapphire", "Onyx", "Obsidian"],
        colors: ["Blue", "Black", "Navy"],
        daysOfWeek: ["Saturday"],
        mantras: ["Om Sham Shanicharaya Namah"]
      },
      5: {
        title: "Life Path 5 Enhancement - The Communicator",
        description: "Strengthen freedom, adventure, and versatility",
        instructions: [
          "Wear emerald or green crystals",
          "Place green plants throughout your home",
          "Plan important activities on Wednesdays",
          "Practice diverse activities regularly",
          "Travel when possible",
          "Embrace change and variety",
          "Learn new skills continuously",
          "Stay active and mobile"
        ],
        benefits: ["Freedom", "Adventure", "Versatility", "Communication"],
        modernUses: ["Career flexibility", "Personal growth", "Social connections"],
        gemstones: ["Emerald", "Peridot", "Green Tourmaline"],
        colors: ["Green", "Emerald Green"],
        daysOfWeek: ["Wednesday"],
        mantras: ["Om Bum Budhaya Namah"]
      },
      6: {
        title: "Life Path 6 Enhancement - The Nurturer",
        description: "Strengthen love, responsibility, and nurturing",
        instructions: [
          "Keep fresh flowers at home",
          "Wear diamond or white crystals",
          "Plan social or financial activities on Fridays",
          "Practice acts of service",
          "Spend quality time with family",
          "Create a harmonious home environment",
          "Express love and appreciation",
          "Take responsibility for others' wellbeing"
        ],
        benefits: ["Love", "Responsibility", "Nurturing", "Balance"],
        modernUses: ["Relationship harmony", "Family life", "Home improvement"],
        gemstones: ["Diamond", "Clear Quartz", "White Topaz"],
        colors: ["White", "Pink", "Light Blue"],
        daysOfWeek: ["Friday"],
        mantras: ["Om Shukraya Namah"]
      },
      7: {
        title: "Life Path 7 Enhancement - The Seeker",
        description: "Strengthen spirituality, wisdom, and introspection",
        instructions: [
          "Meditate with clear quartz",
          "Keep spiritual artifacts at home",
          "Practice spiritual activities on Sundays",
          "Spend time in nature",
          "Practice silence and solitude",
          "Study spiritual texts",
          "Develop intuition through meditation",
          "Seek answers within"
        ],
        benefits: ["Spirituality", "Wisdom", "Intuition", "Inner peace"],
        modernUses: ["Spiritual growth", "Mental clarity", "Meditation practice"],
        gemstones: ["Amethyst", "Clear Quartz", "Selenite"],
        colors: ["Purple", "Violet", "Indigo"],
        daysOfWeek: ["Sunday"],
        mantras: ["Om Namah Shivaya"]
      },
      8: {
        title: "Life Path 8 Enhancement - The Achiever",
        description: "Strengthen material success, authority, and achievement",
        instructions: [
          "Donate black items to charity",
          "Light a mustard oil lamp on Saturdays",
          "Practice financial discipline",
          "Set ambitious goals",
          "Take leadership roles",
          "Wear power colors",
          "Build strong business networks",
          "Focus on long-term success"
        ],
        benefits: ["Material success", "Authority", "Achievement", "Power"],
        modernUses: ["Business success", "Financial growth", "Career advancement"],
        gemstones: ["Garnet", "Black Tourmaline", "Obsidian"],
        colors: ["Black", "Dark Blue", "Burgundy"],
        daysOfWeek: ["Saturday"],
        mantras: ["Om Sham Shanicharaya Namah"]
      },
      9: {
        title: "Life Path 9 Enhancement - The Warrior",
        description: "Strengthen compassion, service, and universal love",
        instructions: [
          "Wear red coral or red crystals",
          "Light camphor daily",
          "Plan challenging activities on Tuesdays",
          "Practice acts of service",
          "Support humanitarian causes",
          "Express gratitude daily",
          "Let go of attachments",
          "Serve the greater good"
        ],
        benefits: ["Compassion", "Service", "Universal love", "Completion"],
        modernUses: ["Philanthropy", "Community service", "Personal fulfillment"],
        gemstones: ["Red Coral", "Carnelian", "Ruby"],
        colors: ["Red", "Crimson"],
        daysOfWeek: ["Tuesday"],
        mantras: ["Om Mang Mangalaya Namah"]
      },
      11: {
        title: "Life Path 11 Enhancement - Master Teacher",
        description: "Balance spiritual sensitivity and master teacher energy",
        instructions: [
          "Practice grounding exercises daily",
          "Use amethyst or clear quartz for spiritual protection",
          "Meditate regularly to balance sensitivity",
          "Share wisdom with others",
          "Protect your energy with boundaries",
          "Practice self-care",
          "Channel intuition into service",
          "Avoid overstimulation"
        ],
        benefits: ["Spiritual insight", "Intuition", "Teaching ability", "Inspiration"],
        modernUses: ["Spiritual teaching", "Intuitive development", "Energy protection"],
        gemstones: ["Amethyst", "Clear Quartz", "Selenite"],
        colors: ["Purple", "Violet", "Indigo"],
        daysOfWeek: ["Sunday", "Monday"],
        mantras: ["Om Namah Shivaya", "Om"]
      },
      22: {
        title: "Life Path 22 Enhancement - Master Builder",
        description: "Channel practical mastery and spiritual vision",
        instructions: [
          "Combine spiritual vision with practical action",
          "Use grounding crystals (obsidian, black tourmaline)",
          "Set realistic, achievable goals",
          "Build something meaningful",
          "Practice patience and persistence",
          "Balance idealism with practicality",
          "Work on large-scale projects",
          "Maintain spiritual connection"
        ],
        benefits: ["Master building", "Practical mastery", "Vision", "Achievement"],
        modernUses: ["Large-scale projects", "Building empires", "Practical spirituality"],
        gemstones: ["Obsidian", "Black Tourmaline", "Clear Quartz"],
        colors: ["Black", "Dark Blue", "Purple"],
        daysOfWeek: ["Saturday", "Sunday"],
        mantras: ["Om Sham Shanicharaya Namah", "Om"]
      }
    },
    
    expressionRemedies: {
      1: {
        title: "Expression Number 1 Remedies",
        description: "Enhance natural leadership and self-expression",
        instructions: [
          "Express yourself confidently",
          "Take on leadership roles",
          "Wear red or gold accessories",
          "Practice public speaking",
          "Initiate creative projects",
          "Use sunstone or garnet"
        ],
        benefits: ["Self-expression", "Leadership", "Confidence"],
        modernUses: ["Career advancement", "Public speaking"],
        gemstones: ["Sunstone", "Garnet", "Ruby"],
        colors: ["Red", "Gold"]
      },
      2: {
        title: "Expression Number 2 Remedies",
        description: "Enhance cooperation and diplomatic expression",
        instructions: [
          "Practice collaboration",
          "Use silver or pearl",
          "Develop listening skills",
          "Express through partnership",
          "Practice mediation",
          "Wear white or silver"
        ],
        benefits: ["Diplomacy", "Cooperation", "Harmony"],
        modernUses: ["Teamwork", "Relationship building"],
        gemstones: ["Pearl", "Moonstone"],
        colors: ["White", "Silver"]
      },
      3: {
        title: "Expression Number 3 Remedies",
        description: "Enhance creative and artistic expression",
        instructions: [
          "Engage in creative arts",
          "Use citrine or amber",
          "Express through writing or art",
          "Practice joyful communication",
          "Wear yellow",
          "Share your creativity"
        ],
        benefits: ["Creativity", "Joy", "Expression"],
        modernUses: ["Artistic projects", "Communication"],
        gemstones: ["Citrine", "Amber"],
        colors: ["Yellow", "Gold"]
      },
      4: {
        title: "Expression Number 4 Remedies",
        description: "Enhance practical and structured expression",
        instructions: [
          "Build something tangible",
          "Use blue sapphire",
          "Express through organization",
          "Practice discipline",
          "Create systematic approaches",
          "Wear blue or black"
        ],
        benefits: ["Stability", "Organization", "Reliability"],
        modernUses: ["Project management", "Building systems"],
        gemstones: ["Blue Sapphire", "Onyx"],
        colors: ["Blue", "Black"]
      },
      5: {
        title: "Expression Number 5 Remedies",
        description: "Enhance versatile and adventurous expression",
        instructions: [
          "Explore diverse interests",
          "Use emerald",
          "Express through variety",
          "Stay active",
          "Embrace change",
          "Wear green"
        ],
        benefits: ["Versatility", "Adventure", "Freedom"],
        modernUses: ["Career flexibility", "Personal growth"],
        gemstones: ["Emerald", "Peridot"],
        colors: ["Green"]
      },
      6: {
        title: "Expression Number 6 Remedies",
        description: "Enhance nurturing and loving expression",
        instructions: [
          "Express love and care",
          "Use diamond or clear quartz",
          "Help others",
          "Create beauty",
          "Express through service",
          "Wear white or pink"
        ],
        benefits: ["Love", "Nurturing", "Service"],
        modernUses: ["Caregiving", "Service work"],
        gemstones: ["Diamond", "Clear Quartz"],
        colors: ["White", "Pink"]
      },
      7: {
        title: "Expression Number 7 Remedies",
        description: "Enhance spiritual and intellectual expression",
        instructions: [
          "Express through teaching",
          "Use amethyst or clear quartz",
          "Share wisdom",
          "Practice introspection",
          "Express through research",
          "Wear purple"
        ],
        benefits: ["Wisdom", "Spirituality", "Analysis"],
        modernUses: ["Teaching", "Research"],
        gemstones: ["Amethyst", "Clear Quartz"],
        colors: ["Purple", "Violet"]
      },
      8: {
        title: "Expression Number 8 Remedies",
        description: "Enhance material and authoritative expression",
        instructions: [
          "Express through achievement",
          "Use garnet or obsidian",
          "Build businesses",
          "Express authority",
          "Practice financial discipline",
          "Wear black or dark blue"
        ],
        benefits: ["Success", "Authority", "Achievement"],
        modernUses: ["Business", "Leadership"],
        gemstones: ["Garnet", "Obsidian"],
        colors: ["Black", "Dark Blue"]
      },
      9: {
        title: "Expression Number 9 Remedies",
        description: "Enhance humanitarian and universal expression",
        instructions: [
          "Express through service",
          "Use red coral or carnelian",
          "Help humanity",
          "Express compassion",
          "Practice generosity",
          "Wear red"
        ],
        benefits: ["Compassion", "Service", "Universal love"],
        modernUses: ["Philanthropy", "Humanitarian work"],
        gemstones: ["Red Coral", "Carnelian"],
        colors: ["Red"]
      }
    },
    
    soulUrgeRemedies: {
      1: {
        title: "Soul Urge 1 Remedies",
        description: "Fulfill inner desire for independence and leadership",
        instructions: [
          "Spend time alone for self-discovery",
          "Follow your own path",
          "Use sunstone for inner strength",
          "Practice self-reliance",
          "Honor your need for independence"
        ],
        benefits: ["Self-discovery", "Independence", "Inner strength"],
        modernUses: ["Personal development", "Self-actualization"],
        gemstones: ["Sunstone", "Garnet"],
        colors: ["Red", "Gold"]
      },
      2: {
        title: "Soul Urge 2 Remedies",
        description: "Fulfill inner desire for harmony and partnership",
        instructions: [
          "Seek peaceful environments",
          "Practice meditation",
          "Use pearl for inner peace",
          "Develop intuition",
          "Honor your need for connection"
        ],
        benefits: ["Inner peace", "Harmony", "Intuition"],
        modernUses: ["Emotional balance", "Relationship fulfillment"],
        gemstones: ["Pearl", "Moonstone"],
        colors: ["White", "Silver"]
      },
      3: {
        title: "Soul Urge 3 Remedies",
        description: "Fulfill inner desire for creativity and joy",
        instructions: [
          "Express creativity daily",
          "Practice joy and optimism",
          "Use citrine for inner joy",
          "Share your gifts",
          "Honor your creative spirit"
        ],
        benefits: ["Inner joy", "Creativity", "Self-expression"],
        modernUses: ["Creative fulfillment", "Happiness"],
        gemstones: ["Citrine", "Amber"],
        colors: ["Yellow", "Gold"]
      },
      4: {
        title: "Soul Urge 4 Remedies",
        description: "Fulfill inner desire for stability and security",
        instructions: [
          "Create structure in your life",
          "Build foundations",
          "Use blue sapphire for stability",
          "Practice discipline",
          "Honor your need for security"
        ],
        benefits: ["Inner security", "Stability", "Foundation"],
        modernUses: ["Security", "Stability"],
        gemstones: ["Blue Sapphire", "Onyx"],
        colors: ["Blue", "Black"]
      },
      5: {
        title: "Soul Urge 5 Remedies",
        description: "Fulfill inner desire for freedom and adventure",
        instructions: [
          "Explore new experiences",
          "Embrace change",
          "Use emerald for growth",
          "Satisfy curiosity",
          "Honor your need for freedom"
        ],
        benefits: ["Adventure", "Freedom", "Growth"],
        modernUses: ["Personal growth", "Exploration"],
        gemstones: ["Emerald", "Peridot"],
        colors: ["Green"]
      },
      6: {
        title: "Soul Urge 6 Remedies",
        description: "Fulfill inner desire for love and nurturing",
        instructions: [
          "Express love freely",
          "Nurture others",
          "Use diamond for love",
          "Create beauty",
          "Honor your need to love"
        ],
        benefits: ["Love", "Nurturing", "Beauty"],
        modernUses: ["Relationship fulfillment", "Love"],
        gemstones: ["Diamond", "Clear Quartz"],
        colors: ["White", "Pink"]
      },
      7: {
        title: "Soul Urge 7 Remedies",
        description: "Fulfill inner desire for wisdom and spirituality",
        instructions: [
          "Seek spiritual knowledge",
          "Practice meditation",
          "Use amethyst for wisdom",
          "Spend time in solitude",
          "Honor your need for understanding"
        ],
        benefits: ["Wisdom", "Spirituality", "Inner peace"],
        modernUses: ["Spiritual growth", "Wisdom"],
        gemstones: ["Amethyst", "Clear Quartz"],
        colors: ["Purple", "Violet"]
      },
      8: {
        title: "Soul Urge 8 Remedies",
        description: "Fulfill inner desire for material achievement",
        instructions: [
          "Set ambitious goals",
          "Build material success",
          "Use garnet for power",
          "Practice financial discipline",
          "Honor your need for achievement"
        ],
        benefits: ["Achievement", "Power", "Success"],
        modernUses: ["Material success", "Achievement"],
        gemstones: ["Garnet", "Obsidian"],
        colors: ["Black", "Dark Blue"]
      },
      9: {
        title: "Soul Urge 9 Remedies",
        description: "Fulfill inner desire for universal love and service",
        instructions: [
          "Serve others",
          "Practice compassion",
          "Use red coral for service",
          "Express universal love",
          "Honor your need to help"
        ],
        benefits: ["Compassion", "Service", "Universal love"],
        modernUses: ["Service", "Compassion"],
        gemstones: ["Red Coral", "Carnelian"],
        colors: ["Red"]
      }
    },
    
    personalityRemedies: {
      1: {
        title: "Personality Number 1 Remedies",
        description: "Improve external presentation as a leader",
        instructions: [
          "Dress confidently",
          "Maintain good posture",
          "Speak with authority",
          "Use red or gold colors",
          "Project independence"
        ],
        benefits: ["Confidence", "Leadership presence", "Authority"],
        modernUses: ["Professional image", "First impressions"],
        gemstones: ["Sunstone", "Garnet"],
        colors: ["Red", "Gold"]
      },
      2: {
        title: "Personality Number 2 Remedies",
        description: "Improve external presentation as a collaborator",
        instructions: [
          "Dress harmoniously",
          "Practice diplomacy",
          "Show cooperation",
          "Use white or silver",
          "Project harmony"
        ],
        benefits: ["Harmony", "Diplomacy", "Cooperation"],
        modernUses: ["Team presence", "Harmonious interactions"],
        gemstones: ["Pearl", "Moonstone"],
        colors: ["White", "Silver"]
      },
      3: {
        title: "Personality Number 3 Remedies",
        description: "Improve external presentation as creative",
        instructions: [
          "Dress creatively",
          "Express enthusiasm",
          "Show optimism",
          "Use yellow or gold",
          "Project joy"
        ],
        benefits: ["Creativity", "Enthusiasm", "Joy"],
        modernUses: ["Creative presence", "Positive interactions"],
        gemstones: ["Citrine", "Amber"],
        colors: ["Yellow", "Gold"]
      },
      4: {
        title: "Personality Number 4 Remedies",
        description: "Improve external presentation as reliable",
        instructions: [
          "Dress professionally",
          "Show organization",
          "Demonstrate reliability",
          "Use blue or black",
          "Project stability"
        ],
        benefits: ["Reliability", "Professionalism", "Stability"],
        modernUses: ["Professional presence", "Trust building"],
        gemstones: ["Blue Sapphire", "Onyx"],
        colors: ["Blue", "Black"]
      },
      5: {
        title: "Personality Number 5 Remedies",
        description: "Improve external presentation as versatile",
        instructions: [
          "Dress variably",
          "Show adaptability",
          "Express freedom",
          "Use green",
          "Project versatility"
        ],
        benefits: ["Versatility", "Adaptability", "Freedom"],
        modernUses: ["Flexible presence", "Dynamic interactions"],
        gemstones: ["Emerald", "Peridot"],
        colors: ["Green"]
      },
      6: {
        title: "Personality Number 6 Remedies",
        description: "Improve external presentation as nurturing",
        instructions: [
          "Dress warmly",
          "Show care",
          "Express love",
          "Use white or pink",
          "Project nurturing"
        ],
        benefits: ["Nurturing", "Warmth", "Love"],
        modernUses: ["Caring presence", "Loving interactions"],
        gemstones: ["Diamond", "Clear Quartz"],
        colors: ["White", "Pink"]
      },
      7: {
        title: "Personality Number 7 Remedies",
        description: "Improve external presentation as wise",
        instructions: [
          "Dress thoughtfully",
          "Show wisdom",
          "Express depth",
          "Use purple",
          "Project intelligence"
        ],
        benefits: ["Wisdom", "Depth", "Intelligence"],
        modernUses: ["Intellectual presence", "Deep interactions"],
        gemstones: ["Amethyst", "Clear Quartz"],
        colors: ["Purple", "Violet"]
      },
      8: {
        title: "Personality Number 8 Remedies",
        description: "Improve external presentation as powerful",
        instructions: [
          "Dress powerfully",
          "Show authority",
          "Express success",
          "Use black or dark blue",
          "Project power"
        ],
        benefits: ["Power", "Authority", "Success"],
        modernUses: ["Authoritative presence", "Powerful interactions"],
        gemstones: ["Garnet", "Obsidian"],
        colors: ["Black", "Dark Blue"]
      },
      9: {
        title: "Personality Number 9 Remedies",
        description: "Improve external presentation as compassionate",
        instructions: [
          "Dress compassionately",
          "Show service",
          "Express universal love",
          "Use red",
          "Project compassion"
        ],
        benefits: ["Compassion", "Service", "Universal love"],
        modernUses: ["Caring presence", "Compassionate interactions"],
        gemstones: ["Red Coral", "Carnelian"],
        colors: ["Red"]
      }
    },
    
    karmicDebtRemedies: {
      13: {
        title: "Karmic Debt 13 Remedies",
        description: "Balance karmic debt of laziness and lack of discipline",
        instructions: [
          "Practice consistent hard work",
          "Develop discipline daily",
          "Complete tasks fully",
          "Avoid procrastination",
          "Use grounding crystals (obsidian, black tourmaline)",
          "Practice self-discipline",
          "Accept responsibility",
          "Work through challenges"
        ],
        benefits: ["Discipline", "Hard work", "Responsibility", "Karmic balance"],
        modernUses: ["Productivity", "Overcoming laziness", "Building discipline"],
        gemstones: ["Obsidian", "Black Tourmaline", "Hematite"],
        colors: ["Black", "Dark Brown"],
        mantras: ["Om Sham Shanicharaya Namah"]
      },
      14: {
        title: "Karmic Debt 14 Remedies",
        description: "Balance karmic debt of overindulgence and lack of moderation",
        instructions: [
          "Practice moderation in all things",
          "Avoid excess",
          "Develop self-control",
          "Practice balance",
          "Use stabilizing crystals (blue sapphire, amethyst)",
          "Exercise restraint",
          "Find middle ground",
          "Practice mindfulness"
        ],
        benefits: ["Moderation", "Balance", "Self-control", "Karmic balance"],
        modernUses: ["Addiction recovery", "Balance", "Self-control"],
        gemstones: ["Blue Sapphire", "Amethyst", "Lapis Lazuli"],
        colors: ["Blue", "Purple"],
        mantras: ["Om Bum Budhaya Namah"]
      },
      16: {
        title: "Karmic Debt 16 Remedies",
        description: "Balance karmic debt of abuse of power and ego",
        instructions: [
          "Practice humility",
          "Serve others",
          "Avoid ego inflation",
          "Use spiritual crystals (clear quartz, amethyst)",
          "Practice compassion",
          "Develop spiritual awareness",
          "Let go of pride",
          "Serve the greater good"
        ],
        benefits: ["Humility", "Service", "Spiritual growth", "Karmic balance"],
        modernUses: ["Ego management", "Spiritual development", "Humility"],
        gemstones: ["Clear Quartz", "Amethyst", "Selenite"],
        colors: ["White", "Purple"],
        mantras: ["Om Namah Shivaya"]
      },
      19: {
        title: "Karmic Debt 19 Remedies",
        description: "Balance karmic debt of abuse of power and selfishness",
        instructions: [
          "Practice selflessness",
          "Help others unconditionally",
          "Develop compassion",
          "Use heart-opening crystals (rose quartz, clear quartz)",
          "Practice generosity",
          "Serve humanity",
          "Let go of selfishness",
          "Express universal love"
        ],
        benefits: ["Selflessness", "Compassion", "Service", "Karmic balance"],
        modernUses: ["Philanthropy", "Compassion", "Service"],
        gemstones: ["Rose Quartz", "Clear Quartz", "Red Coral"],
        colors: ["Pink", "White", "Red"],
        mantras: ["Om Mang Mangalaya Namah"]
      }
    },
    
    masterNumberRemedies: {
      11: {
        title: "Master Number 11 Remedies",
        description: "Balance spiritual sensitivity and master teacher energy",
        instructions: [
          "Practice grounding exercises daily",
          "Use amethyst or clear quartz for spiritual protection",
          "Meditate regularly to balance sensitivity",
          "Share wisdom with others",
          "Protect your energy with boundaries",
          "Practice self-care",
          "Channel intuition into service",
          "Avoid overstimulation",
          "Spend time in nature",
          "Practice energy clearing"
        ],
        benefits: ["Spiritual insight", "Intuition", "Teaching ability", "Energy balance"],
        modernUses: ["Spiritual teaching", "Intuitive development", "Energy protection"],
        gemstones: ["Amethyst", "Clear Quartz", "Selenite", "Black Tourmaline"],
        colors: ["Purple", "Violet", "Indigo"],
        daysOfWeek: ["Sunday", "Monday"],
        mantras: ["Om Namah Shivaya", "Om"]
      },
      22: {
        title: "Master Number 22 Remedies",
        description: "Channel practical mastery and spiritual vision",
        instructions: [
          "Combine spiritual vision with practical action",
          "Use grounding crystals (obsidian, black tourmaline)",
          "Set realistic, achievable goals",
          "Build something meaningful",
          "Practice patience and persistence",
          "Balance idealism with practicality",
          "Work on large-scale projects",
          "Maintain spiritual connection",
          "Ground spiritual energy",
          "Practice practical spirituality"
        ],
        benefits: ["Master building", "Practical mastery", "Vision", "Achievement"],
        modernUses: ["Large-scale projects", "Building empires", "Practical spirituality"],
        gemstones: ["Obsidian", "Black Tourmaline", "Clear Quartz", "Blue Sapphire"],
        colors: ["Black", "Dark Blue", "Purple"],
        daysOfWeek: ["Saturday", "Sunday"],
        mantras: ["Om Sham Shanicharaya Namah", "Om"]
      }
    },
    
    personalYearRemedies: {
      1: {
        title: "Personal Year 1 Remedies",
        description: "Enhance new beginnings and fresh starts",
        instructions: [
          "Take initiative",
          "Start new projects",
          "Use red or gold colors",
          "Practice independence",
          "Set new goals",
          "Embrace change"
        ],
        benefits: ["New beginnings", "Independence", "Fresh starts"],
        gemstones: ["Sunstone", "Garnet"],
        colors: ["Red", "Gold"]
      },
      2: {
        title: "Personal Year 2 Remedies",
        description: "Enhance cooperation and patience",
        instructions: [
          "Practice patience",
          "Collaborate with others",
          "Use white or silver",
          "Develop partnerships",
          "Practice diplomacy",
          "Wait for opportunities"
        ],
        benefits: ["Cooperation", "Patience", "Partnership"],
        gemstones: ["Pearl", "Moonstone"],
        colors: ["White", "Silver"]
      },
      3: {
        title: "Personal Year 3 Remedies",
        description: "Enhance creativity and expression",
        instructions: [
          "Express creativity",
          "Share your gifts",
          "Use yellow or gold",
          "Practice joy",
          "Communicate freely",
          "Enjoy life"
        ],
        benefits: ["Creativity", "Expression", "Joy"],
        gemstones: ["Citrine", "Amber"],
        colors: ["Yellow", "Gold"]
      },
      4: {
        title: "Personal Year 4 Remedies",
        description: "Enhance stability and building",
        instructions: [
          "Build foundations",
          "Create structure",
          "Use blue or black",
          "Practice discipline",
          "Work hard",
          "Organize your life"
        ],
        benefits: ["Stability", "Building", "Discipline"],
        gemstones: ["Blue Sapphire", "Onyx"],
        colors: ["Blue", "Black"]
      },
      5: {
        title: "Personal Year 5 Remedies",
        description: "Enhance change and freedom",
        instructions: [
          "Embrace change",
          "Explore new experiences",
          "Use green",
          "Stay flexible",
          "Travel if possible",
          "Enjoy variety"
        ],
        benefits: ["Change", "Freedom", "Adventure"],
        gemstones: ["Emerald", "Peridot"],
        colors: ["Green"]
      },
      6: {
        title: "Personal Year 6 Remedies",
        description: "Enhance responsibility and nurturing",
        instructions: [
          "Focus on family",
          "Take responsibility",
          "Use white or pink",
          "Nurture others",
          "Create harmony",
          "Express love"
        ],
        benefits: ["Responsibility", "Nurturing", "Love"],
        gemstones: ["Diamond", "Clear Quartz"],
        colors: ["White", "Pink"]
      },
      7: {
        title: "Personal Year 7 Remedies",
        description: "Enhance spirituality and introspection",
        instructions: [
          "Spend time alone",
          "Study spiritual texts",
          "Use purple",
          "Practice meditation",
          "Seek wisdom",
          "Develop intuition"
        ],
        benefits: ["Spirituality", "Wisdom", "Introspection"],
        gemstones: ["Amethyst", "Clear Quartz"],
        colors: ["Purple", "Violet"]
      },
      8: {
        title: "Personal Year 8 Remedies",
        description: "Enhance material success and achievement",
        instructions: [
          "Focus on business",
          "Set ambitious goals",
          "Use black or dark blue",
          "Practice discipline",
          "Build success",
          "Achieve goals"
        ],
        benefits: ["Success", "Achievement", "Material gain"],
        gemstones: ["Garnet", "Obsidian"],
        colors: ["Black", "Dark Blue"]
      },
      9: {
        title: "Personal Year 9 Remedies",
        description: "Enhance completion and service",
        instructions: [
          "Complete projects",
          "Let go of old patterns",
          "Use red",
          "Serve others",
          "Express compassion",
          "Prepare for new cycle"
        ],
        benefits: ["Completion", "Service", "Compassion"],
        gemstones: ["Red Coral", "Carnelian"],
        colors: ["Red"]
      }
    }
  },

  // Angel Numbers
  angelNumbers: {
    sequences: {
      "111": {
        title: "Manifestation Sequence",
        description: "Enhance manifestation and new beginnings",
        instructions: [
          "Practice visualization daily",
          "Set clear intentions",
          "Use manifestation crystals",
          "Practice gratitude"
        ],
        benefits: ["Manifestation", "New beginnings", "Spiritual awakening"],
        modernUses: ["Goal achievement", "Positive thinking"]
      },
      "222": {
        title: "Balance and Harmony",
        description: "Restore balance and harmony in life",
        instructions: [
          "Practice meditation",
          "Balance work and life",
          "Use harmony crystals",
          "Practice yoga"
        ],
        benefits: ["Balance", "Harmony", "Peace"],
        modernUses: ["Stress reduction", "Work-life balance"]
      }
    }
  }
}

// ============================================================================
// 3. DIVINATION REMEDIES
// ============================================================================

export const DIVINATION_REMEDIES = {
  // Tarot Remedies
  tarot: {
    majorArcana: {
      fool: {
        title: "Fool's Journey Activation",
        description: "Embrace new beginnings and innocence",
        instructions: [
          "Take spontaneous actions",
          "Trust your intuition",
          "Embrace uncertainty",
          "Practice beginner's mind"
        ],
        benefits: ["New beginnings", "Innocence", "Adventure"],
        modernUses: ["Personal growth", "Risk-taking"]
      },
      magician: {
        title: "Magician's Power Enhancement",
        description: "Activate personal power and manifestation",
        instructions: [
          "Practice visualization",
          "Use power crystals",
          "Set clear intentions",
          "Take action daily"
        ],
        benefits: ["Personal power", "Manifestation", "Willpower"],
        modernUses: ["Goal achievement", "Personal empowerment"]
      }
    }
  },

  // Runes Remedies
  runes: {
    individualRunes: {
      fehu: {
        title: "Fehu Wealth Activation",
        description: "Enhance wealth and abundance",
        instructions: [
          "Carry Fehu rune",
          "Practice abundance meditation",
          "Use green crystals",
          "Gratitude practice"
        ],
        benefits: ["Wealth", "Abundance", "Prosperity"],
        modernUses: ["Financial success", "Abundance mindset"]
      }
    }
  }
}

// ============================================================================
// 4. READING REMEDIES
// ============================================================================

export const READING_REMEDIES = {
  // Palmistry Remedies
  palmistry: {
    // LINE REMEDIES
    lineRemedies: {
      // Life Line Remedies
      lifeLineWeak: {
        title: "Life Line Strengthening - Weak Line",
        description: "Enhance vitality and life force when life line is faint or weak",
        instructions: [
          "Practice pranayama (breathing exercises) daily for 15-20 minutes",
          "Eat vitality-boosting foods: leafy greens, nuts, seeds, whole grains",
          "Exercise regularly: walking, yoga, tai chi, or moderate cardio",
          "Use vitality crystals: carnelian, red jasper, or garnet (carry or wear)",
          "Get adequate sleep (7-9 hours) to restore life force",
          "Practice grounding meditation daily",
          "Drink plenty of water and stay hydrated",
          "Avoid stress and practice stress management techniques",
          "Spend time in nature regularly",
          "Wear red or orange colors to stimulate life force"
        ],
        benefits: ["Increased vitality", "Improved health", "Enhanced life force", "Better energy levels"],
        gemstones: ["Carnelian", "Red Jasper", "Garnet", "Ruby"],
        colors: ["Red", "Orange", "Gold"],
        mantras: ["Om Namah Shivaya", "I am strong and vibrant"],
        practices: ["Pranayama", "Grounding meditation", "Nature walks"],
        timing: "Morning hours (6-10 AM)",
        frequency: "Daily",
        priority: "critical",
        palmistryTriggers: ["life-line-weak", "life-line-faint", "life-line-short"]
      },
      lifeLineBroken: {
        title: "Life Line Healing - Broken Line",
        description: "Heal breaks and restore continuity in life line",
        instructions: [
          "Practice continuity meditation focusing on unbroken energy flow",
          "Use healing crystals: clear quartz, rose quartz, or amethyst",
          "Visualize your life line as complete and unbroken during meditation",
          "Practice forgiveness work to heal past traumas",
          "Engage in healing practices: Reiki, energy healing, or acupuncture",
          "Strengthen physical health through regular exercise and nutrition",
          "Work with a therapist or healer to address underlying issues",
          "Practice self-care rituals daily",
          "Connect with your life purpose and goals",
          "Wear protective crystals or amulets"
        ],
        benefits: ["Healed breaks", "Restored continuity", "Overcome obstacles", "Improved resilience"],
        gemstones: ["Clear Quartz", "Rose Quartz", "Amethyst", "Black Tourmaline"],
        colors: ["White", "Purple", "Pink"],
        mantras: ["I am whole and complete", "I overcome all obstacles"],
        practices: ["Healing meditation", "Energy healing", "Therapy"],
        timing: "Evening hours (6-9 PM)",
        frequency: "Daily until healed",
        priority: "critical",
        palmistryTriggers: ["life-line-broken", "life-line-breaks"]
      },
      lifeLineShort: {
        title: "Life Line Extension - Short Line",
        description: "Extend life line energy and improve longevity",
        instructions: [
          "Practice longevity techniques: qigong, tai chi, or yoga",
          "Focus on healthy lifestyle: balanced diet, regular exercise, stress management",
          "Use longevity crystals: jade, agate, or turquoise",
          "Practice gratitude daily for life and health",
          "Engage in activities that bring joy and purpose",
          "Maintain strong social connections",
          "Practice mindfulness and present-moment awareness",
          "Work on life purpose and meaningful goals",
          "Balance work and rest appropriately",
          "Practice deep breathing exercises"
        ],
        benefits: ["Extended vitality", "Improved longevity", "Enhanced life force", "Better quality of life"],
        gemstones: ["Jade", "Agate", "Turquoise", "Peridot"],
        colors: ["Green", "Blue", "Teal"],
        mantras: ["I live a long and healthy life", "I am blessed with vitality"],
        practices: ["Qigong", "Tai Chi", "Yoga"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["life-line-short"]
      },
      lifeLineChained: {
        title: "Life Line Smoothing - Chained Line",
        description: "Smooth out chain links and restore steady energy flow",
        instructions: [
          "Practice flow meditation to restore smooth energy",
          "Use smoothing crystals: smooth stones like river stones, obsidian",
          "Work on consistency in daily routines",
          "Address health issues that cause energy fluctuations",
          "Practice stress reduction techniques",
          "Maintain regular sleep schedule",
          "Eat regular, balanced meals",
          "Practice grounding exercises daily",
          "Work on emotional stability",
          "Engage in activities that bring steady joy"
        ],
        benefits: ["Smooth energy flow", "Consistent vitality", "Reduced fluctuations", "Better stability"],
        gemstones: ["Obsidian", "Hematite", "Smoky Quartz"],
        colors: ["Black", "Gray", "Brown"],
        mantras: ["My energy flows smoothly", "I am stable and grounded"],
        practices: ["Flow meditation", "Grounding exercises"],
        timing: "Morning and evening",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["life-line-chained"]
      },
      // Heart Line Remedies
      heartLineWeak: {
        title: "Heart Line Strengthening - Weak Line",
        description: "Enhance emotional capacity and heart energy",
        instructions: [
          "Practice heart-opening yoga poses: camel, cobra, bridge",
          "Use heart crystals: rose quartz, pink tourmaline, rhodonite",
          "Practice compassion meditation daily",
          "Engage in acts of kindness and service",
          "Express emotions healthily through journaling or art",
          "Build meaningful relationships",
          "Practice self-love and self-compassion",
          "Listen to heart-opening music",
          "Practice forgiveness work",
          "Wear pink or green colors"
        ],
        benefits: ["Enhanced emotional capacity", "Improved relationships", "Greater compassion", "Better emotional health"],
        gemstones: ["Rose Quartz", "Pink Tourmaline", "Rhodonite", "Emerald"],
        colors: ["Pink", "Green", "Rose"],
        mantras: ["I love and am loved", "My heart is open"],
        practices: ["Heart-opening yoga", "Compassion meditation"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["heart-line-weak", "heart-line-faint"]
      },
      heartLineBroken: {
        title: "Heart Line Healing - Broken Line",
        description: "Heal emotional breaks and restore heart connection",
        instructions: [
          "Practice heart healing meditation",
          "Use healing crystals: rose quartz, emerald, or green aventurine",
          "Work with a therapist or counselor to heal emotional wounds",
          "Practice forgiveness for self and others",
          "Engage in heart-opening activities",
          "Express emotions safely",
          "Practice self-compassion",
          "Build trust gradually in relationships",
          "Practice vulnerability safely",
          "Surround yourself with loving, supportive people"
        ],
        benefits: ["Healed heart wounds", "Restored emotional capacity", "Improved relationships", "Greater love"],
        gemstones: ["Rose Quartz", "Emerald", "Green Aventurine"],
        colors: ["Pink", "Green"],
        mantras: ["I heal my heart", "I am worthy of love"],
        practices: ["Heart healing meditation", "Therapy"],
        timing: "Evening hours",
        frequency: "Daily until healed",
        priority: "critical",
        palmistryTriggers: ["heart-line-broken"]
      },
      heartLineForked: {
        title: "Heart Line Integration - Forked Line",
        description: "Integrate dual emotional natures and find balance",
        instructions: [
          "Practice integration meditation",
          "Use balancing crystals: ametrine, fluorite, or labradorite",
          "Explore both sides of your emotional nature",
          "Practice emotional flexibility",
          "Work on finding balance between head and heart",
          "Practice adaptability in relationships",
          "Honor both emotional and logical aspects",
          "Practice self-awareness of emotional patterns",
          "Work on emotional maturity",
          "Practice healthy boundaries"
        ],
        benefits: ["Integrated emotions", "Balanced relationships", "Emotional flexibility", "Better decision-making"],
        gemstones: ["Ametrine", "Fluorite", "Labradorite"],
        colors: ["Purple", "Green", "Blue"],
        mantras: ["I integrate all aspects of myself", "I am balanced"],
        practices: ["Integration meditation", "Self-reflection"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["heart-line-forked"]
      },
      // Head Line Remedies
      headLineWeak: {
        title: "Head Line Strengthening - Weak Line",
        description: "Enhance mental capacity and intellectual power",
        instructions: [
          "Practice mental exercises: puzzles, reading, learning new skills",
          "Use mental enhancement crystals: amethyst, clear quartz, or fluorite",
          "Practice meditation to improve focus",
          "Engage in continuous learning",
          "Practice critical thinking exercises",
          "Maintain mental stimulation",
          "Practice mindfulness",
          "Get adequate rest for mental recovery",
          "Practice brain-boosting activities",
          "Wear blue or purple colors"
        ],
        benefits: ["Enhanced mental capacity", "Improved focus", "Better learning", "Sharper intellect"],
        gemstones: ["Amethyst", "Clear Quartz", "Fluorite", "Sodalite"],
        colors: ["Blue", "Purple", "Indigo"],
        mantras: ["My mind is sharp", "I learn easily"],
        practices: ["Mental exercises", "Meditation"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["head-line-weak", "head-line-faint"]
      },
      headLineBroken: {
        title: "Head Line Healing - Broken Line",
        description: "Heal mental breaks and restore cognitive function",
        instructions: [
          "Practice cognitive healing meditation",
          "Use healing crystals: clear quartz, amethyst, or lapis lazuli",
          "Work with mental health professionals if needed",
          "Practice brain-boosting activities",
          "Address underlying mental health issues",
          "Practice stress reduction",
          "Maintain regular sleep schedule",
          "Practice mental exercises gradually",
          "Avoid mental overload",
          "Practice self-compassion"
        ],
        benefits: ["Healed mental breaks", "Restored cognitive function", "Improved focus", "Better mental health"],
        gemstones: ["Clear Quartz", "Amethyst", "Lapis Lazuli"],
        colors: ["Blue", "Purple"],
        mantras: ["My mind is healing", "I think clearly"],
        practices: ["Cognitive healing meditation", "Mental exercises"],
        timing: "Morning hours",
        frequency: "Daily until healed",
        priority: "critical",
        palmistryTriggers: ["head-line-broken"]
      },
      headLineWavy: {
        title: "Head Line Stabilization - Wavy Line",
        description: "Stabilize mental energy and improve focus",
        instructions: [
          "Practice focus meditation",
          "Use stabilizing crystals: hematite, obsidian, or smoky quartz",
          "Work on consistency in thinking",
          "Practice single-tasking",
          "Reduce distractions",
          "Practice mental organization",
          "Create structured routines",
          "Practice mindfulness",
          "Avoid mental overload",
          "Practice patience"
        ],
        benefits: ["Stabilized thinking", "Improved focus", "Better organization", "Mental clarity"],
        gemstones: ["Hematite", "Obsidian", "Smoky Quartz"],
        colors: ["Black", "Gray"],
        mantras: ["My mind is focused", "I think clearly"],
        practices: ["Focus meditation", "Mindfulness"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["head-line-wavy"]
      },
      // Fate Line Remedies
      fateLineMissing: {
        title: "Fate Line Creation - Missing Line",
        description: "Create and strengthen fate line for career and life purpose",
        instructions: [
          "Discover and pursue your life purpose",
          "Use purpose crystals: citrine, tiger's eye, or pyrite",
          "Set clear career and life goals",
          "Take action toward your goals daily",
          "Practice visualization of your desired future",
          "Work on developing skills and talents",
          "Take responsibility for your life direction",
          "Practice self-discipline",
          "Build professional networks",
          "Wear gold or yellow colors"
        ],
        benefits: ["Created life path", "Clear direction", "Career success", "Life purpose"],
        gemstones: ["Citrine", "Tiger's Eye", "Pyrite", "Gold"],
        colors: ["Gold", "Yellow", "Orange"],
        mantras: ["I create my destiny", "I know my purpose"],
        practices: ["Goal setting", "Visualization"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["fate-line-missing", "fate-line-absent"]
      },
      fateLineBroken: {
        title: "Fate Line Restoration - Broken Line",
        description: "Restore career continuity and life direction",
        instructions: [
          "Practice career restoration meditation",
          "Use restoration crystals: citrine, carnelian, or sunstone",
          "Address career disruptions and challenges",
          "Rebuild professional momentum",
          "Network and build connections",
          "Develop new skills",
          "Practice resilience",
          "Stay focused on long-term goals",
          "Overcome obstacles",
          "Practice persistence"
        ],
        benefits: ["Restored career", "Overcome obstacles", "Career continuity", "Life direction"],
        gemstones: ["Citrine", "Carnelian", "Sunstone"],
        colors: ["Gold", "Orange", "Yellow"],
        mantras: ["I restore my path", "I overcome obstacles"],
        practices: ["Career meditation", "Goal visualization"],
        timing: "Morning hours",
        frequency: "Daily until restored",
        priority: "high",
        palmistryTriggers: ["fate-line-broken"]
      },
      fateLineChangingDirection: {
        title: "Fate Line Alignment - Changing Direction",
        description: "Align with new life direction and embrace change",
        instructions: [
          "Embrace change and transitions",
          "Use transition crystals: labradorite, amethyst, or moonstone",
          "Practice adaptability",
          "Explore new opportunities",
          "Practice flexibility in career",
          "Trust the process of change",
          "Practice self-reflection",
          "Set new goals aligned with new direction",
          "Practice courage in transitions",
          "Stay open to new possibilities"
        ],
        benefits: ["Aligned direction", "Embracing change", "Career flexibility", "New opportunities"],
        gemstones: ["Labradorite", "Amethyst", "Moonstone"],
        colors: ["Purple", "Blue", "Silver"],
        mantras: ["I embrace change", "I trust my path"],
        practices: ["Transition meditation", "Self-reflection"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["fate-line-changing-direction"]
      },
      // Health Line Remedies
      healthLineWeak: {
        title: "Health Line Strengthening - Weak Line",
        description: "Improve health and vitality",
        instructions: [
          "Focus on preventive health care",
          "Use health crystals: jade, green aventurine, or peridot",
          "Practice healthy lifestyle habits",
          "Regular health check-ups",
          "Balanced diet and exercise",
          "Stress management",
          "Adequate rest and sleep",
          "Practice wellness routines",
          "Avoid toxins and harmful substances",
          "Wear green colors"
        ],
        benefits: ["Improved health", "Better vitality", "Preventive care", "Wellness"],
        gemstones: ["Jade", "Green Aventurine", "Peridot"],
        colors: ["Green", "Emerald"],
        mantras: ["I am healthy", "My body is strong"],
        practices: ["Wellness routines", "Health maintenance"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["health-line-weak", "health-line-faint"]
      },
      healthLineBroken: {
        title: "Health Line Healing - Broken Line",
        description: "Heal health issues and restore vitality",
        instructions: [
          "Seek medical attention for health issues",
          "Use healing crystals: clear quartz, green jade, or emerald",
          "Practice healing meditation",
          "Follow medical advice",
          "Practice self-care",
          "Rest and recovery",
          "Supportive nutrition",
          "Gentle exercise",
          "Stress reduction",
          "Positive healing mindset"
        ],
        benefits: ["Healed health issues", "Restored vitality", "Recovery", "Better health"],
        gemstones: ["Clear Quartz", "Jade", "Emerald"],
        colors: ["Green", "White"],
        mantras: ["I am healing", "My body restores itself"],
        practices: ["Healing meditation", "Medical care"],
        timing: "Morning and evening",
        frequency: "Daily until healed",
        priority: "critical",
        palmistryTriggers: ["health-line-broken"]
      },
      // Marriage Lines Remedies
      marriageLinesMultiple: {
        title: "Marriage Lines Harmony - Multiple Lines",
        description: "Harmonize multiple relationships and find balance",
        instructions: [
          "Practice relationship balance",
          "Use harmony crystals: rose quartz, rhodonite, or pink tourmaline",
          "Work on communication skills",
          "Practice commitment and loyalty",
          "Honor current relationship",
          "Practice relationship boundaries",
          "Work on emotional maturity",
          "Practice relationship skills",
          "Focus on quality over quantity",
          "Wear pink or rose colors"
        ],
        benefits: ["Harmonized relationships", "Better commitment", "Improved relationships", "Emotional balance"],
        gemstones: ["Rose Quartz", "Rhodonite", "Pink Tourmaline"],
        colors: ["Pink", "Rose"],
        mantras: ["I honor my relationships", "I am committed"],
        practices: ["Relationship work", "Communication practice"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["marriage-lines-multiple"]
      },
      marriageLinesNone: {
        title: "Marriage Lines Activation - No Lines",
        description: "Activate relationship energy and attract love",
        instructions: [
          "Practice self-love and self-worth",
          "Use love crystals: rose quartz, rhodonite, or pink tourmaline",
          "Open your heart to love",
          "Practice social skills",
          "Engage in social activities",
          "Work on relationship readiness",
          "Practice emotional availability",
          "Visualize loving relationships",
          "Practice compassion and kindness",
          "Wear pink or red colors"
        ],
        benefits: ["Activated love energy", "Attracted relationships", "Open heart", "Relationship readiness"],
        gemstones: ["Rose Quartz", "Rhodonite", "Pink Tourmaline"],
        colors: ["Pink", "Red", "Rose"],
        mantras: ["I am ready for love", "I attract loving relationships"],
        practices: ["Self-love practices", "Heart-opening meditation"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["marriage-lines-none", "marriage-lines-absent"]
      },
      marriageLinesForked: {
        title: "Marriage Lines Unity - Forked Line",
        description: "Unify relationship paths and strengthen commitment",
        instructions: [
          "Practice relationship unity",
          "Use unity crystals: rose quartz, ametrine, or rhodochrosite",
          "Work on relationship harmony",
          "Practice compromise and understanding",
          "Strengthen commitment",
          "Work on communication",
          "Practice relationship balance",
          "Honor both partners' needs",
          "Practice relationship skills",
          "Wear pink or purple colors"
        ],
        benefits: ["Unified relationships", "Strengthened commitment", "Better harmony", "Improved relationships"],
        gemstones: ["Rose Quartz", "Ametrine", "Rhodochrosite"],
        colors: ["Pink", "Purple"],
        mantras: ["We are united", "Our relationship is strong"],
        practices: ["Relationship unity work", "Communication practice"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["marriage-lines-forked"]
      },
      // Travel Lines Remedies
      travelLinesWeak: {
        title: "Travel Lines Activation - Weak Lines",
        description: "Activate travel energy and explore opportunities",
        instructions: [
          "Plan and take trips",
          "Use travel crystals: aquamarine, blue lace agate, or sodalite",
          "Practice adventure mindset",
          "Explore new places",
          "Engage in travel activities",
          "Practice openness to new experiences",
          "Visualize travel experiences",
          "Practice flexibility",
          "Embrace adventure",
          "Wear blue or turquoise colors"
        ],
        benefits: ["Activated travel", "More opportunities", "Adventure", "New experiences"],
        gemstones: ["Aquamarine", "Blue Lace Agate", "Sodalite"],
        colors: ["Blue", "Turquoise"],
        mantras: ["I explore the world", "I embrace adventure"],
        practices: ["Travel planning", "Adventure mindset"],
        timing: "Morning hours",
        frequency: "Weekly",
        priority: "low",
        palmistryTriggers: ["travel-lines-weak"]
      },
      travelLinesMany: {
        title: "Travel Lines Balance - Many Lines",
        description: "Balance travel energy and find stability",
        instructions: [
          "Practice grounding",
          "Use grounding crystals: hematite, obsidian, or smoky quartz",
          "Balance travel with home life",
          "Practice stability",
          "Create home base",
          "Practice moderation in travel",
          "Maintain connections",
          "Practice balance",
          "Find stability in movement",
          "Wear earth colors"
        ],
        benefits: ["Balanced travel", "Stability", "Home connection", "Moderation"],
        gemstones: ["Hematite", "Obsidian", "Smoky Quartz"],
        colors: ["Brown", "Black", "Gray"],
        mantras: ["I am grounded", "I balance travel and home"],
        practices: ["Grounding meditation", "Home practices"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["travel-lines-many"]
      },
      // Sun Line Remedies
      sunLineMissing: {
        title: "Sun Line Activation - Missing Line",
        description: "Activate success and recognition energy",
        instructions: [
          "Pursue your passions and talents",
          "Use success crystals: citrine, sunstone, or pyrite",
          "Work on visibility and recognition",
          "Develop your talents",
          "Practice confidence",
          "Share your gifts",
          "Practice self-promotion",
          "Build your reputation",
          "Practice excellence",
          "Wear gold or yellow colors"
        ],
        benefits: ["Activated success", "Recognition", "Fame", "Achievement"],
        gemstones: ["Citrine", "Sunstone", "Pyrite"],
        colors: ["Gold", "Yellow", "Orange"],
        mantras: ["I am successful", "I shine brightly"],
        practices: ["Talent development", "Success visualization"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["sun-line-missing", "sun-line-absent"]
      },
      sunLineWeak: {
        title: "Sun Line Strengthening - Weak Line",
        description: "Strengthen success and recognition energy",
        instructions: [
          "Enhance your talents",
          "Use success crystals: citrine, sunstone, or amber",
          "Practice confidence building",
          "Work on visibility",
          "Share your achievements",
          "Practice self-worth",
          "Build your reputation",
          "Practice excellence",
          "Express creativity",
          "Wear gold colors"
        ],
        benefits: ["Strengthened success", "Better recognition", "Confidence", "Achievement"],
        gemstones: ["Citrine", "Sunstone", "Amber"],
        colors: ["Gold", "Yellow"],
        mantras: ["I am worthy of success", "I shine"],
        practices: ["Talent enhancement", "Confidence building"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["sun-line-weak"]
      },
      // Mercury Line Remedies
      mercuryLineWeak: {
        title: "Mercury Line Strengthening - Weak Line",
        description: "Enhance communication and business skills",
        instructions: [
          "Practice communication skills",
          "Use communication crystals: blue lace agate, sodalite, or aquamarine",
          "Develop business acumen",
          "Practice networking",
          "Work on negotiation skills",
          "Practice public speaking",
          "Develop writing skills",
          "Practice active listening",
          "Build business relationships",
          "Wear blue colors"
        ],
        benefits: ["Enhanced communication", "Better business skills", "Networking", "Success"],
        gemstones: ["Blue Lace Agate", "Sodalite", "Aquamarine"],
        colors: ["Blue", "Turquoise"],
        mantras: ["I communicate clearly", "I am successful in business"],
        practices: ["Communication practice", "Business skills"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["mercury-line-weak"]
      },
      mercuryLineBroken: {
        title: "Mercury Line Healing - Broken Line",
        description: "Heal communication issues and restore business energy",
        instructions: [
          "Practice communication healing",
          "Use healing crystals: blue lace agate, sodalite, or lapis lazuli",
          "Address communication challenges",
          "Work on business recovery",
          "Practice clear communication",
          "Rebuild business relationships",
          "Practice honesty and integrity",
          "Work on communication skills",
          "Practice patience",
          "Wear blue colors"
        ],
        benefits: ["Healed communication", "Restored business", "Better relationships", "Success"],
        gemstones: ["Blue Lace Agate", "Sodalite", "Lapis Lazuli"],
        colors: ["Blue"],
        mantras: ["I communicate clearly", "I heal my business"],
        practices: ["Communication healing", "Business recovery"],
        timing: "Morning hours",
        frequency: "Daily until healed",
        priority: "high",
        palmistryTriggers: ["mercury-line-broken"]
      }
    },
    // MOUNT REMEDIES
    mountRemedies: {
      // Jupiter Mount Remedies
      jupiterMountWeak: {
        title: "Jupiter Mount Activation - Weak/Flat Mount",
        description: "Activate leadership and ambition when Jupiter mount is weak or flat",
        instructions: [
          "Practice leadership skills and take initiative",
          "Use Jupiter crystals: yellow sapphire, citrine, or amber",
          "Set ambitious goals and work toward them",
          "Practice confidence building exercises",
          "Take on leadership roles",
          "Practice self-discipline",
          "Work on personal growth",
          "Practice authority and command",
          "Wear yellow or gold colors",
          "Practice Jupiter mantras: 'Om Gum Guruve Namah'"
        ],
        benefits: ["Activated leadership", "Increased ambition", "Confidence", "Personal growth"],
        gemstones: ["Yellow Sapphire", "Citrine", "Amber", "Topaz"],
        colors: ["Yellow", "Gold", "Orange"],
        mantras: ["Om Gum Guruve Namah", "I am a natural leader"],
        practices: ["Leadership training", "Confidence building"],
        timing: "Thursday mornings",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["jupiter-mount-weak", "jupiter-mount-flat"]
      },
      jupiterMountOverdeveloped: {
        title: "Jupiter Mount Balance - Overdeveloped Mount",
        description: "Balance excessive ambition and find humility",
        instructions: [
          "Practice humility and gratitude",
          "Use balancing crystals: amethyst, labradorite, or moonstone",
          "Practice moderation in ambition",
          "Work on patience",
          "Practice service to others",
          "Avoid arrogance",
          "Practice self-reflection",
          "Work on empathy",
          "Practice balance",
          "Wear purple or blue colors"
        ],
        benefits: ["Balanced ambition", "Humility", "Better relationships", "Inner peace"],
        gemstones: ["Amethyst", "Labradorite", "Moonstone"],
        colors: ["Purple", "Blue"],
        mantras: ["I balance ambition with humility", "I serve others"],
        practices: ["Humility practices", "Service work"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["jupiter-mount-overdeveloped"]
      },
      // Saturn Mount Remedies
      saturnMountWeak: {
        title: "Saturn Mount Activation - Weak/Flat Mount",
        description: "Activate wisdom and responsibility when Saturn mount is weak",
        instructions: [
          "Practice wisdom through study and reflection",
          "Use Saturn crystals: blue sapphire, amethyst, or lapis lazuli",
          "Take on responsibilities gradually",
          "Practice discipline and structure",
          "Work on maturity",
          "Practice patience",
          "Learn from challenges",
          "Practice self-reflection",
          "Wear blue or black colors",
          "Practice Saturn mantras: 'Om Sham Shanicharaya Namah'"
        ],
        benefits: ["Activated wisdom", "Increased responsibility", "Maturity", "Discipline"],
        gemstones: ["Blue Sapphire", "Amethyst", "Lapis Lazuli", "Obsidian"],
        colors: ["Blue", "Black", "Indigo"],
        mantras: ["Om Sham Shanicharaya Namah", "I am wise and responsible"],
        practices: ["Study and reflection", "Discipline practice"],
        timing: "Saturday mornings",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["saturn-mount-weak", "saturn-mount-flat"]
      },
      saturnMountOverdeveloped: {
        title: "Saturn Mount Balance - Overdeveloped Mount",
        description: "Balance excessive seriousness and find joy",
        instructions: [
          "Practice joy and lightness",
          "Use balancing crystals: citrine, sunstone, or amber",
          "Engage in fun activities",
          "Practice humor",
          "Balance work with play",
          "Practice spontaneity",
          "Work on social connections",
          "Practice optimism",
          "Avoid excessive seriousness",
          "Wear yellow or orange colors"
        ],
        benefits: ["Balanced seriousness", "More joy", "Better social life", "Lightness"],
        gemstones: ["Citrine", "Sunstone", "Amber"],
        colors: ["Yellow", "Orange"],
        mantras: ["I balance seriousness with joy", "I find lightness"],
        practices: ["Fun activities", "Social connections"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["saturn-mount-overdeveloped"]
      },
      // Apollo Mount Remedies
      apolloMountWeak: {
        title: "Apollo Mount Activation - Weak/Flat Mount",
        description: "Activate creativity and success when Apollo mount is weak",
        instructions: [
          "Practice creative activities: art, music, writing",
          "Use Apollo crystals: citrine, sunstone, or amber",
          "Express your creativity daily",
          "Practice confidence",
          "Share your creative work",
          "Practice self-expression",
          "Develop artistic skills",
          "Practice success visualization",
          "Wear gold or yellow colors",
          "Practice Sun mantras: 'Om Suryaya Namah'"
        ],
        benefits: ["Activated creativity", "Success", "Self-expression", "Confidence"],
        gemstones: ["Citrine", "Sunstone", "Amber", "Topaz"],
        colors: ["Gold", "Yellow", "Orange"],
        mantras: ["Om Suryaya Namah", "I am creative and successful"],
        practices: ["Creative activities", "Self-expression"],
        timing: "Sunday mornings",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["apollo-mount-weak", "apollo-mount-flat", "sun-mount-weak"]
      },
      apolloMountOverdeveloped: {
        title: "Apollo Mount Balance - Overdeveloped Mount",
        description: "Balance excessive ego and find humility",
        instructions: [
          "Practice humility",
          "Use balancing crystals: amethyst, moonstone, or labradorite",
          "Practice gratitude",
          "Work on empathy",
          "Practice service",
          "Avoid excessive pride",
          "Practice self-reflection",
          "Work on relationships",
          "Practice balance",
          "Wear purple or silver colors"
        ],
        benefits: ["Balanced ego", "Humility", "Better relationships", "Inner peace"],
        gemstones: ["Amethyst", "Moonstone", "Labradorite"],
        colors: ["Purple", "Silver"],
        mantras: ["I balance ego with humility", "I serve others"],
        practices: ["Humility practices", "Service work"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["apollo-mount-overdeveloped", "sun-mount-overdeveloped"]
      },
      // Mercury Mount Remedies
      mercuryMountWeak: {
        title: "Mercury Mount Activation - Weak/Flat Mount",
        description: "Activate communication and business skills when Mercury mount is weak",
        instructions: [
          "Practice communication skills daily",
          "Use Mercury crystals: emerald, peridot, or green aventurine",
          "Develop business acumen",
          "Practice networking",
          "Work on negotiation skills",
          "Practice public speaking",
          "Develop writing skills",
          "Practice active listening",
          "Wear green colors",
          "Practice Mercury mantras: 'Om Budhaya Namah'"
        ],
        benefits: ["Activated communication", "Business success", "Networking", "Skills"],
        gemstones: ["Emerald", "Peridot", "Green Aventurine"],
        colors: ["Green", "Emerald"],
        mantras: ["Om Budhaya Namah", "I communicate clearly"],
        practices: ["Communication practice", "Business skills"],
        timing: "Wednesday mornings",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["mercury-mount-weak", "mercury-mount-flat"]
      },
      mercuryMountOverdeveloped: {
        title: "Mercury Mount Balance - Overdeveloped Mount",
        description: "Balance excessive communication and find stillness",
        instructions: [
          "Practice silence and stillness",
          "Use balancing crystals: amethyst, clear quartz, or sodalite",
          "Practice listening more than speaking",
          "Work on quality over quantity",
          "Practice mindfulness",
          "Avoid gossip",
          "Practice reflection",
          "Work on depth",
          "Practice balance",
          "Wear purple or blue colors"
        ],
        benefits: ["Balanced communication", "Better listening", "Depth", "Stillness"],
        gemstones: ["Amethyst", "Clear Quartz", "Sodalite"],
        colors: ["Purple", "Blue"],
        mantras: ["I balance speaking with listening", "I find stillness"],
        practices: ["Silence practice", "Mindfulness"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["mercury-mount-overdeveloped"]
      },
      // Mars Mount Remedies
      marsMountWeak: {
        title: "Mars Mount Activation - Weak/Flat Mount",
        description: "Activate courage and energy when Mars mount is weak",
        instructions: [
          "Practice courage-building exercises",
          "Use Mars crystals: red coral, garnet, or red jasper",
          "Engage in physical exercise",
          "Practice assertiveness",
          "Work on confidence",
          "Practice courage in daily life",
          "Develop fighting spirit",
          "Practice self-defense",
          "Wear red colors",
          "Practice Mars mantras: 'Om Mangalaya Namah'"
        ],
        benefits: ["Activated courage", "Increased energy", "Confidence", "Strength"],
        gemstones: ["Red Coral", "Garnet", "Red Jasper", "Ruby"],
        colors: ["Red", "Orange"],
        mantras: ["Om Mangalaya Namah", "I am courageous"],
        practices: ["Physical exercise", "Courage building"],
        timing: "Tuesday mornings",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["mars-mount-weak", "mars-mount-flat"]
      },
      marsMountOverdeveloped: {
        title: "Mars Mount Balance - Overdeveloped Mount",
        description: "Balance excessive aggression and find peace",
        instructions: [
          "Practice peace and calm",
          "Use balancing crystals: rose quartz, amethyst, or moonstone",
          "Practice anger management",
          "Work on patience",
          "Practice meditation",
          "Avoid conflict",
          "Practice compassion",
          "Work on emotional control",
          "Practice balance",
          "Wear pink or purple colors"
        ],
        benefits: ["Balanced aggression", "Peace", "Better relationships", "Emotional control"],
        gemstones: ["Rose Quartz", "Amethyst", "Moonstone"],
        colors: ["Pink", "Purple"],
        mantras: ["I balance strength with peace", "I find calm"],
        practices: ["Anger management", "Meditation"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "critical",
        palmistryTriggers: ["mars-mount-overdeveloped"]
      },
      // Venus Mount Remedies
      venusMountWeak: {
        title: "Venus Mount Activation - Weak/Flat Mount",
        description: "Activate love and sensuality when Venus mount is weak",
        instructions: [
          "Practice self-love and self-care",
          "Use Venus crystals: rose quartz, pink tourmaline, or rhodonite",
          "Engage in loving activities",
          "Practice sensuality",
          "Work on relationships",
          "Practice beauty appreciation",
          "Develop artistic appreciation",
          "Practice compassion",
          "Wear pink or green colors",
          "Practice Venus mantras: 'Om Shukraya Namah'"
        ],
        benefits: ["Activated love", "Sensuality", "Better relationships", "Self-love"],
        gemstones: ["Rose Quartz", "Pink Tourmaline", "Rhodonite", "Emerald"],
        colors: ["Pink", "Green", "Rose"],
        mantras: ["Om Shukraya Namah", "I am loving"],
        practices: ["Self-love practices", "Relationship work"],
        timing: "Friday mornings",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["venus-mount-weak", "venus-mount-flat"]
      },
      venusMountOverdeveloped: {
        title: "Venus Mount Balance - Overdeveloped Mount",
        description: "Balance excessive sensuality and find moderation",
        instructions: [
          "Practice moderation",
          "Use balancing crystals: amethyst, clear quartz, or sodalite",
          "Work on emotional depth",
          "Practice boundaries",
          "Avoid excessive indulgence",
          "Practice self-discipline",
          "Work on spiritual growth",
          "Practice balance",
          "Focus on inner beauty",
          "Wear purple or blue colors"
        ],
        benefits: ["Balanced sensuality", "Moderation", "Emotional depth", "Spiritual growth"],
        gemstones: ["Amethyst", "Clear Quartz", "Sodalite"],
        colors: ["Purple", "Blue"],
        mantras: ["I balance sensuality with moderation", "I find depth"],
        practices: ["Moderation practices", "Spiritual growth"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["venus-mount-overdeveloped"]
      },
      // Moon Mount Remedies
      moonMountWeak: {
        title: "Moon Mount Activation - Weak/Flat Mount",
        description: "Activate intuition and imagination when Moon mount is weak",
        instructions: [
          "Practice intuition development",
          "Use Moon crystals: moonstone, pearl, or selenite",
          "Practice meditation",
          "Work on imagination",
          "Practice dream work",
          "Engage in creative visualization",
          "Practice psychic development",
          "Work on emotional intuition",
          "Wear silver or white colors",
          "Practice Moon mantras: 'Om Somaya Namah'"
        ],
        benefits: ["Activated intuition", "Imagination", "Psychic abilities", "Emotional insight"],
        gemstones: ["Moonstone", "Pearl", "Selenite", "Clear Quartz"],
        colors: ["Silver", "White", "Blue"],
        mantras: ["Om Somaya Namah", "I trust my intuition"],
        practices: ["Intuition development", "Meditation"],
        timing: "Monday evenings",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["moon-mount-weak", "moon-mount-flat", "luna-mount-weak"]
      },
      moonMountOverdeveloped: {
        title: "Moon Mount Balance - Overdeveloped Mount",
        description: "Balance excessive fantasy and find reality",
        instructions: [
          "Practice grounding",
          "Use grounding crystals: hematite, obsidian, or smoky quartz",
          "Work on practicality",
          "Practice reality checks",
          "Balance imagination with action",
          "Practice focus",
          "Work on goals",
          "Practice discipline",
          "Avoid excessive fantasy",
          "Wear earth colors"
        ],
        benefits: ["Balanced imagination", "Groundedness", "Practicality", "Focus"],
        gemstones: ["Hematite", "Obsidian", "Smoky Quartz"],
        colors: ["Brown", "Black", "Gray"],
        mantras: ["I balance imagination with reality", "I am grounded"],
        practices: ["Grounding practices", "Reality checks"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["moon-mount-overdeveloped", "luna-mount-overdeveloped"]
      }
    },
    // HAND SHAPE REMEDIES
    handShapeRemedies: {
      earthHand: {
        title: "Earth Hand Enhancement - Stimulation & Creativity",
        description: "Stimulate earth hand energy and add creativity and adventure",
        instructions: [
          "Engage in creative activities regularly",
          "Use creativity crystals: citrine, carnelian, or sunstone",
          "Plan adventures and travel experiences",
          "Practice spontaneity",
          "Try new experiences",
          "Practice creative expression",
          "Engage in artistic pursuits",
          "Practice flexibility",
          "Wear warm colors: red, orange, yellow",
          "Practice earth element balancing"
        ],
        benefits: ["Increased creativity", "More adventure", "Spontaneity", "Balance"],
        gemstones: ["Citrine", "Carnelian", "Sunstone"],
        colors: ["Red", "Orange", "Yellow"],
        mantras: ["I embrace creativity", "I am adventurous"],
        practices: ["Creative activities", "Adventure planning"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["earth-hand"]
      },
      airHand: {
        title: "Air Hand Enhancement - Grounding & Stability",
        description: "Ground air hand energy and add stability and patience",
        instructions: [
          "Practice grounding exercises daily",
          "Use grounding crystals: hematite, obsidian, or smoky quartz",
          "Practice patience exercises",
          "Engage in grounding activities: gardening, walking in nature",
          "Practice stability in routines",
          "Work on patience",
          "Practice mindfulness",
          "Engage in physical activities",
          "Wear earth colors: brown, black, gray",
          "Practice air element balancing"
        ],
        benefits: ["Better grounding", "Increased stability", "Patience", "Balance"],
        gemstones: ["Hematite", "Obsidian", "Smoky Quartz"],
        colors: ["Brown", "Black", "Gray"],
        mantras: ["I am grounded", "I am stable"],
        practices: ["Grounding exercises", "Patience practice"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["air-hand"]
      },
      fireHand: {
        title: "Fire Hand Enhancement - Cooling & Balance",
        description: "Cool fire hand energy and add balance and reflection",
        instructions: [
          "Practice cooling activities: swimming, meditation",
          "Use cooling crystals: moonstone, amethyst, or blue lace agate",
          "Practice reflection and introspection",
          "Engage in calming activities",
          "Practice patience",
          "Work on balance",
          "Practice meditation",
          "Engage in peaceful activities",
          "Wear cool colors: blue, purple, silver",
          "Practice fire element balancing"
        ],
        benefits: ["Better balance", "Cooler energy", "Reflection", "Peace"],
        gemstones: ["Moonstone", "Amethyst", "Blue Lace Agate"],
        colors: ["Blue", "Purple", "Silver"],
        mantras: ["I am balanced", "I find peace"],
        practices: ["Cooling activities", "Meditation"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["fire-hand"]
      },
      waterHand: {
        title: "Water Hand Enhancement - Strength & Confidence",
        description: "Strengthen water hand energy and add confidence and action",
        instructions: [
          "Practice strength-building exercises",
          "Use strength crystals: red jasper, garnet, or carnelian",
          "Practice confidence building",
          "Take action on goals",
          "Practice assertiveness",
          "Work on decisiveness",
          "Practice courage",
          "Engage in empowering activities",
          "Wear strong colors: red, orange, gold",
          "Practice water element balancing"
        ],
        benefits: ["Increased strength", "Confidence", "Action", "Balance"],
        gemstones: ["Red Jasper", "Garnet", "Carnelian"],
        colors: ["Red", "Orange", "Gold"],
        mantras: ["I am strong", "I take action"],
        practices: ["Strength building", "Confidence exercises"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["water-hand"]
      }
    },
    // FINGER REMEDIES
    fingerRemedies: {
      shortFingers: {
        title: "Short Fingers Enhancement - Patience & Detail Focus",
        description: "Develop patience and detail focus for short fingers",
        instructions: [
          "Practice patience exercises",
          "Use patience crystals: amethyst, labradorite, or moonstone",
          "Work on attention to detail",
          "Practice mindfulness",
          "Engage in detailed activities",
          "Practice patience in daily life",
          "Work on focus",
          "Practice careful observation",
          "Wear calming colors: purple, blue",
          "Practice finger flexibility exercises"
        ],
        benefits: ["Increased patience", "Better detail focus", "Mindfulness", "Attention"],
        gemstones: ["Amethyst", "Labradorite", "Moonstone"],
        colors: ["Purple", "Blue"],
        mantras: ["I am patient", "I focus on details"],
        practices: ["Patience exercises", "Detail work"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "low",
        palmistryTriggers: ["short-fingers"]
      },
      longFingers: {
        title: "Long Fingers Enhancement - Action & Decisiveness",
        description: "Add action and decisiveness for long fingers",
        instructions: [
          "Practice decision-making exercises",
          "Use action crystals: citrine, carnelian, or red jasper",
          "Take action on goals",
          "Practice decisiveness",
          "Work on taking initiative",
          "Practice quick decision-making",
          "Engage in action-oriented activities",
          "Practice confidence",
          "Wear energizing colors: red, orange, yellow",
          "Practice finger strengthening exercises"
        ],
        benefits: ["More action", "Decisiveness", "Initiative", "Confidence"],
        gemstones: ["Citrine", "Carnelian", "Red Jasper"],
        colors: ["Red", "Orange", "Yellow"],
        mantras: ["I take action", "I am decisive"],
        practices: ["Action exercises", "Decision-making practice"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "low",
        palmistryTriggers: ["long-fingers"]
      },
      thickFingers: {
        title: "Thick Fingers Enhancement - Refinement & Elegance",
        description: "Develop refinement and elegance for thick fingers",
        instructions: [
          "Practice refined activities",
          "Use refinement crystals: clear quartz, diamond, or white sapphire",
          "Work on elegance",
          "Practice grace",
          "Engage in refined activities",
          "Practice sophistication",
          "Work on refinement",
          "Practice elegance",
          "Wear elegant colors: white, silver, gold",
          "Practice finger dexterity exercises"
        ],
        benefits: ["Refinement", "Elegance", "Grace", "Sophistication"],
        gemstones: ["Clear Quartz", "Diamond", "White Sapphire"],
        colors: ["White", "Silver", "Gold"],
        mantras: ["I am refined", "I am elegant"],
        practices: ["Refinement practices", "Elegance exercises"],
        timing: "Evening hours",
        frequency: "Daily",
        priority: "low",
        palmistryTriggers: ["thick-fingers"]
      },
      thinFingers: {
        title: "Thin Fingers Enhancement - Strength & Resilience",
        description: "Develop strength and resilience for thin fingers",
        instructions: [
          "Practice strength-building exercises",
          "Use strength crystals: red jasper, garnet, or hematite",
          "Work on resilience",
          "Practice endurance",
          "Engage in strengthening activities",
          "Practice persistence",
          "Work on physical strength",
          "Practice resilience",
          "Wear strong colors: red, black, brown",
          "Practice finger strengthening exercises"
        ],
        benefits: ["Increased strength", "Resilience", "Endurance", "Persistence"],
        gemstones: ["Red Jasper", "Garnet", "Hematite"],
        colors: ["Red", "Black", "Brown"],
        mantras: ["I am strong", "I am resilient"],
        practices: ["Strength building", "Resilience exercises"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "low",
        palmistryTriggers: ["thin-fingers"]
      },
      rigidFingers: {
        title: "Rigid Fingers Enhancement - Flexibility & Adaptability",
        description: "Develop flexibility and adaptability for rigid fingers",
        instructions: [
          "Practice flexibility exercises",
          "Use flexibility crystals: fluorite, labradorite, or moonstone",
          "Work on adaptability",
          "Practice flexibility in thinking",
          "Engage in flexible activities",
          "Practice adaptability",
          "Work on openness",
          "Practice flexibility",
          "Wear adaptable colors: purple, blue, green",
          "Practice finger flexibility exercises"
        ],
        benefits: ["Increased flexibility", "Adaptability", "Openness", "Versatility"],
        gemstones: ["Fluorite", "Labradorite", "Moonstone"],
        colors: ["Purple", "Blue", "Green"],
        mantras: ["I am flexible", "I adapt easily"],
        practices: ["Flexibility exercises", "Adaptability practice"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "low",
        palmistryTriggers: ["rigid-fingers"]
      },
      flexibleFingers: {
        title: "Flexible Fingers Enhancement - Stability & Consistency",
        description: "Develop stability and consistency for flexible fingers",
        instructions: [
          "Practice stability exercises",
          "Use stability crystals: hematite, obsidian, or smoky quartz",
          "Work on consistency",
          "Practice stable routines",
          "Engage in consistent activities",
          "Practice reliability",
          "Work on stability",
          "Practice consistency",
          "Wear stable colors: black, gray, brown",
          "Practice finger stability exercises"
        ],
        benefits: ["Increased stability", "Consistency", "Reliability", "Structure"],
        gemstones: ["Hematite", "Obsidian", "Smoky Quartz"],
        colors: ["Black", "Gray", "Brown"],
        mantras: ["I am stable", "I am consistent"],
        practices: ["Stability exercises", "Consistency practice"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "low",
        palmistryTriggers: ["flexible-fingers"]
      }
    },
    // MARKING REMEDIES
    markingRemedies: {
      linesWithBreaks: {
        title: "Healing Breaks in Lines - Continuity & Healing",
        description: "Heal breaks in lines and restore continuity",
        instructions: [
          "Practice continuity meditation",
          "Use healing crystals: clear quartz, rose quartz, or amethyst",
          "Visualize unbroken lines",
          "Practice healing work",
          "Address underlying issues",
          "Practice self-care",
          "Work on healing",
          "Practice restoration",
          "Wear healing colors: white, pink, purple",
          "Practice line healing meditation"
        ],
        benefits: ["Healed breaks", "Restored continuity", "Healing", "Restoration"],
        gemstones: ["Clear Quartz", "Rose Quartz", "Amethyst"],
        colors: ["White", "Pink", "Purple"],
        mantras: ["I heal my lines", "I restore continuity"],
        practices: ["Healing meditation", "Self-care"],
        timing: "Evening hours",
        frequency: "Daily until healed",
        priority: "critical",
        palmistryTriggers: ["lines-with-breaks", "broken-lines"]
      },
      islandFormations: {
        title: "Island Formations Healing - Resolution & Clarity",
        description: "Resolve island formations and find clarity",
        instructions: [
          "Practice clarity meditation",
          "Use clarity crystals: clear quartz, sodalite, or lapis lazuli",
          "Work on resolution",
          "Practice clarity in thinking",
          "Address obstacles",
          "Practice problem-solving",
          "Work on clarity",
          "Practice resolution",
          "Wear clarity colors: white, blue, indigo",
          "Practice island resolution meditation"
        ],
        benefits: ["Resolved islands", "Clarity", "Resolution", "Problem-solving"],
        gemstones: ["Clear Quartz", "Sodalite", "Lapis Lazuli"],
        colors: ["White", "Blue", "Indigo"],
        mantras: ["I resolve obstacles", "I find clarity"],
        practices: ["Clarity meditation", "Problem-solving"],
        timing: "Morning hours",
        frequency: "Daily until resolved",
        priority: "high",
        palmistryTriggers: ["island-formations", "islands"]
      },
      crosses: {
        title: "Crosses Protection - Spiritual Guidance",
        description: "Protect from challenging crosses and find spiritual guidance",
        instructions: [
          "Practice protection meditation",
          "Use protection crystals: black tourmaline, obsidian, or hematite",
          "Seek spiritual guidance",
          "Practice protection rituals",
          "Work on spiritual protection",
          "Practice prayer or meditation",
          "Work on spiritual connection",
          "Practice protection",
          "Wear protection colors: black, dark blue",
          "Practice cross protection meditation"
        ],
        benefits: ["Protection", "Spiritual guidance", "Safety", "Shielding"],
        gemstones: ["Black Tourmaline", "Obsidian", "Hematite"],
        colors: ["Black", "Dark Blue"],
        mantras: ["I am protected", "I receive guidance"],
        practices: ["Protection meditation", "Spiritual practices"],
        timing: "Morning and evening",
        frequency: "Daily",
        priority: "high",
        palmistryTriggers: ["crosses", "cross-markings"]
      },
      stars: {
        title: "Stars Channeling - Focus & Channeling",
        description: "Channel star energy and find focus",
        instructions: [
          "Practice focus meditation",
          "Use focus crystals: clear quartz, amethyst, or sodalite",
          "Work on channeling energy",
          "Practice focus",
          "Channel star energy",
          "Practice concentration",
          "Work on focus",
          "Practice channeling",
          "Wear focus colors: white, purple, blue",
          "Practice star channeling meditation"
        ],
        benefits: ["Channeled energy", "Focus", "Concentration", "Clarity"],
        gemstones: ["Clear Quartz", "Amethyst", "Sodalite"],
        colors: ["White", "Purple", "Blue"],
        mantras: ["I channel energy", "I am focused"],
        practices: ["Focus meditation", "Channeling practice"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["stars", "star-markings"]
      },
      grids: {
        title: "Grids Organization - Simplification",
        description: "Organize grids and simplify life",
        instructions: [
          "Practice organization",
          "Use organization crystals: clear quartz, citrine, or tiger's eye",
          "Work on simplification",
          "Practice organization skills",
          "Simplify life",
          "Practice decluttering",
          "Work on organization",
          "Practice simplification",
          "Wear organization colors: yellow, gold, orange",
          "Practice grid organization meditation"
        ],
        benefits: ["Organization", "Simplification", "Clarity", "Structure"],
        gemstones: ["Clear Quartz", "Citrine", "Tiger's Eye"],
        colors: ["Yellow", "Gold", "Orange"],
        mantras: ["I organize my life", "I simplify"],
        practices: ["Organization practices", "Simplification work"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["grids", "grid-markings"]
      },
      triangles: {
        title: "Triangles Integration - Balance",
        description: "Integrate triangles and find balance",
        instructions: [
          "Practice integration meditation",
          "Use integration crystals: ametrine, fluorite, or labradorite",
          "Work on balance",
          "Practice integration",
          "Balance aspects",
          "Practice harmony",
          "Work on integration",
          "Practice balance",
          "Wear balance colors: purple, green, blue",
          "Practice triangle integration meditation"
        ],
        benefits: ["Integration", "Balance", "Harmony", "Unity"],
        gemstones: ["Ametrine", "Fluorite", "Labradorite"],
        colors: ["Purple", "Green", "Blue"],
        mantras: ["I integrate all aspects", "I am balanced"],
        practices: ["Integration meditation", "Balance practice"],
        timing: "Morning hours",
        frequency: "Daily",
        priority: "medium",
        palmistryTriggers: ["triangles", "triangle-markings"]
      }
    }
  },

  // Face Reading Remedies
  faceReading: {
    featureEnhancement: {
      eyes: {
        title: "Eye Energy Enhancement",
        description: "Strengthen vision and intuition",
        instructions: [
          "Eye exercises daily",
          "Use eye-friendly herbs",
          "Practice eye meditation",
          "Protect from blue light"
        ],
        benefits: ["Better vision", "Intuition", "Eye health"],
        modernUses: ["Eye health", "Digital wellness"]
      }
    }
  }
}
// 5. SPECIALIZED SYSTEM REMEDIES
// ============================================================================

export const SPECIALIZED_REMEDIES = {
  // Vastu Remedies
  vastu: {
    directionalRemedies: {
      north: {
        title: "North Direction Enhancement",
        description: "Enhance career and opportunities",
        instructions: [
          "Place water element in north",
          "Use blue colors",
          "Keep north area clean",
          "Place career items in north"
        ],
        benefits: ["Career growth", "Opportunities", "Wealth"],
        modernUses: ["Office design", "Career enhancement"]
      },
      east: {
        title: "East Direction Activation",
        description: "Enhance health and family",
        instructions: [
          "Place plants in east",
          "Use green colors",
          "Morning sunlight",
          "Family photos in east"
        ],
        benefits: ["Health", "Family harmony", "New beginnings"],
        modernUses: ["Home design", "Family wellness"]
      }
    }
  },

  // Bazi Remedies
  bazi: {
    elementBalancing: {
      wood: {
        title: "Wood Element Enhancement",
        description: "Strengthen growth and creativity",
        instructions: [
          "Wear green clothing",
          "Eat green vegetables",
          "Practice wood element exercises",
          "Use wood element crystals"
        ],
        benefits: ["Growth", "Creativity", "Flexibility"],
        modernUses: ["Personal growth", "Creative projects"]
      }
    }
  },

  // I Ching Remedies
  iching: {
    hexagramRemedies: {
      "1": {
        title: "Creative Force Activation",
        description: "Enhance creativity and leadership",
        instructions: [
          "Practice creative activities",
          "Use red colors",
          "Morning exercises",
          "Leadership practice"
        ],
        benefits: ["Creativity", "Leadership", "Vitality"],
        modernUses: ["Creative projects", "Leadership development"]
      }
    }
  }
}

// ============================================================================
// 6. MODERN HOLISTIC REMEDIES
// ============================================================================

const MODERN_HOLISTIC_REMEDIES = {
  // Crystal Therapy
  crystals: {
    chakraStones: {
      root: {
        title: "Root Chakra Activation",
        description: "Enhance grounding and security",
        instructions: [
          "Use red jasper or garnet",
          "Practice grounding exercises",
          "Eat root vegetables",
          "Wear red clothing",
          "Chant LAM mantra",
          "Practice root chakra meditation"
        ],
        benefits: ["Grounding", "Security", "Vitality"],
        modernUses: ["Anxiety relief", "Grounding practices"]
      },
      sacral: {
        title: "Sacral Chakra Enhancement",
        description: "Enhance creativity and emotions",
        instructions: [
          "Use carnelian or orange calcite",
          "Practice creative activities",
          "Eat orange foods",
          "Dance and movement",
          "Chant VAM mantra",
          "Practice water-based activities"
        ],
        benefits: ["Creativity", "Emotional balance", "Passion"],
        modernUses: ["Creative therapy", "Emotional healing"]
      },
      solarPlexus: {
        title: "Solar Plexus Chakra Enhancement",
        description: "Enhance personal power and confidence",
        instructions: [
          "Use citrine or yellow jasper",
          "Practice confidence-building exercises",
          "Eat yellow foods",
          "Wear yellow clothing",
          "Chant RAM mantra",
          "Practice solar plexus meditation"
        ],
        benefits: ["Confidence", "Personal power", "Willpower"],
        modernUses: ["Self-esteem building", "Leadership development"]
      },
      heart: {
        title: "Heart Chakra Activation",
        description: "Enhance love and compassion",
        instructions: [
          "Use rose quartz or green aventurine",
          "Practice heart-opening exercises",
          "Eat green foods",
          "Practice loving-kindness meditation",
          "Chant YAM mantra",
          "Wear green or pink clothing"
        ],
        benefits: ["Love", "Compassion", "Forgiveness"],
        modernUses: ["Relationship healing", "Emotional healing"]
      },
      throat: {
        title: "Throat Chakra Enhancement",
        description: "Enhance communication and expression",
        instructions: [
          "Use blue lace agate or aquamarine",
          "Practice vocal exercises",
          "Eat blue foods",
          "Express yourself creatively",
          "Chant HAM mantra",
          "Wear blue clothing"
        ],
        benefits: ["Communication", "Expression", "Truth"],
        modernUses: ["Public speaking", "Creative expression"]
      },
      thirdEye: {
        title: "Third Eye Chakra Activation",
        description: "Enhance intuition and insight",
        instructions: [
          "Use amethyst or lapis lazuli",
          "Practice meditation",
          "Trust your intuition",
          "Chant OM or AUM mantra",
          "Practice visualization exercises",
          "Wear indigo or purple"
        ],
        benefits: ["Intuition", "Insight", "Wisdom"],
        modernUses: ["Intuition development", "Mental clarity"]
      },
      crown: {
        title: "Crown Chakra Activation",
        description: "Enhance spirituality and connection",
        instructions: [
          "Use clear quartz or amethyst",
          "Practice spiritual meditation",
          "Connect with divine energy",
          "Chant OM mantra",
          "Practice mindfulness",
          "Wear white or purple"
        ],
        benefits: ["Spirituality", "Divine connection", "Enlightenment"],
        modernUses: ["Spiritual growth", "Meditation practice"]
      }
    },
    crystalHealing: {
      clearQuartz: {
        title: "Clear Quartz Master Healer",
        description: "Amplify all energy and healing",
        instructions: [
          "Place on any chakra",
          "Use in crystal grids",
          "Carry as pocket stone",
          "Meditate with daily",
          "Cleanse in moonlight"
        ],
        benefits: ["Amplification", "Clarity", "Healing"],
        modernUses: ["Energy amplification", "Mental clarity"]
      },
      amethyst: {
        title: "Amethyst Protection",
        description: "Protect and enhance intuition",
        instructions: [
          "Place under pillow for sleep",
          "Wear as jewelry",
          "Place on third eye",
          "Meditate with",
          "Use for protection"
        ],
        benefits: ["Protection", "Intuition", "Calm"],
        modernUses: ["Stress relief", "Intuition enhancement"]
      },
      roseQuartz: {
        title: "Rose Quartz Love",
        description: "Attract and enhance love",
        instructions: [
          "Wear as jewelry",
          "Place on heart chakra",
          "Carry close to heart",
          "Use in love rituals",
          "Meditate with"
        ],
        benefits: ["Love", "Compassion", "Relationships"],
        modernUses: ["Love attraction", "Heart healing"]
      }
    }
  },
  // Reiki Healing
  reiki: {
    symbols: {
      choKuRei: {
        title: "Power Symbol (Cho Ku Rei)",
        description: "Increase power and focus energy",
        instructions: [
          "Visualize or draw symbol",
          "Use at beginning of treatment",
          "Draw on hands or body",
          "Repeat three times",
          "Focus intention"
        ],
        benefits: ["Power", "Focus", "Protection"],
        modernUses: ["Energy amplification", "Protection"]
      },
      seiHeKi: {
        title: "Mental/Emotional Symbol (Sei He Ki)",
        description: "Mental and emotional healing",
        instructions: [
          "Visualize or draw symbol",
          "Use for emotional healing",
          "Draw on head or heart",
          "Focus on harmony",
          "Practice regularly"
        ],
        benefits: ["Emotional healing", "Harmony", "Balance"],
        modernUses: ["Emotional therapy", "Mental clarity"]
      }
    },
    practices: {
      selfReiki: {
        title: "Self-Reiki Practice",
        description: "Daily self-healing practice",
        instructions: [
          "Set aside 15-20 minutes",
          "Find quiet space",
          "Use hand positions",
          "Channel universal energy",
          "Practice daily"
        ],
        benefits: ["Self-healing", "Balance", "Wellness"],
        modernUses: ["Daily wellness", "Stress relief"]
      }
    }
  },
  // Aura Healing
  aura: {
    colors: {
      blue: {
        title: "Blue Aura Enhancement",
        description: "Calm and peaceful energy",
        instructions: [
          "Wear blue clothing",
          "Surround with blue",
          "Practice calm meditation",
          "Express truthfully",
          "Balance throat chakra"
        ],
        benefits: ["Calm", "Peace", "Communication"],
        modernUses: ["Stress reduction", "Clear communication"]
      },
      green: {
        title: "Green Aura Healing",
        description: "Healing and growth energy",
        instructions: [
          "Wear green clothing",
          "Spend time in nature",
          "Practice heart-opening",
          "Focus on growth",
          "Heal relationships"
        ],
        benefits: ["Healing", "Growth", "Balance"],
        modernUses: ["Physical healing", "Emotional growth"]
      },
      purple: {
        title: "Purple Aura Activation",
        description: "Spiritual and intuitive energy",
        instructions: [
          "Wear purple clothing",
          "Practice meditation",
          "Develop intuition",
          "Connect spiritually",
          "Balance crown chakra"
        ],
        benefits: ["Spirituality", "Intuition", "Wisdom"],
        modernUses: ["Spiritual development", "Intuition enhancement"]
      }
    }
  },

  // Essential Oils
  essentialOils: {
    emotionalBalance: {
      lavender: {
        title: "Lavender Calming",
        description: "Promote calm and sleep",
        instructions: [
          "Diffuse lavender oil",
          "Add to bath water",
          "Apply to pulse points",
          "Use in meditation"
        ],
        benefits: ["Calm", "Sleep", "Relaxation"],
        modernUses: ["Sleep improvement", "Stress reduction"]
      },
      peppermint: {
        title: "Peppermint Energy",
        description: "Enhance focus and energy",
        instructions: [
          "Diffuse peppermint oil",
          "Apply to temples",
          "Inhale for focus",
          "Use in morning routine"
        ],
        benefits: ["Focus", "Energy", "Mental clarity"],
        modernUses: ["Productivity enhancement", "Mental focus"]
      }
    }
  },

  // Sound Healing
  soundHealing: {
    frequencies: {
      "432Hz": {
        title: "432Hz Healing Frequency",
        description: "Promote healing and harmony",
        instructions: [
          "Listen to 432Hz music",
          "Meditate with 432Hz",
          "Use 432Hz tuning forks",
          "Practice sound healing"
        ],
        benefits: ["Healing", "Harmony", "Balance"],
        modernUses: ["Sound therapy", "Meditation enhancement"]
      }
    }
  },

  // Color Therapy
  colorTherapy: {
    chakraColors: {
      red: {
        title: "Red Energy Activation",
        description: "Enhance vitality and courage",
        instructions: [
          "Wear red clothing",
          "Use red in environment",
          "Eat red foods",
          "Practice red meditation"
        ],
        benefits: ["Vitality", "Courage", "Energy"],
        modernUses: ["Energy enhancement", "Courage building"]
      }
    }
  }
}

// ============================================================================
// 7. LIFESTYLE AND WELLNESS REMEDIES
// ============================================================================

const LIFESTYLE_REMEDIES = {
  // Diet and Nutrition
  diet: {
    elementalFoods: {
      fire: {
        title: "Fire Element Foods",
        description: "Enhance energy and transformation",
        instructions: [
          "Eat spicy foods",
          "Include red foods",
          "Warm foods",
          "Protein-rich diet"
        ],
        benefits: ["Energy", "Transformation", "Digestion"],
        modernUses: ["Energy enhancement", "Metabolism boost"]
      }
    }
  },

  // Exercise and Movement
  exercise: {
    elementalMovement: {
      fire: {
        title: "Fire Element Exercise",
        description: "Enhance energy and strength",
        instructions: [
          "High-intensity workouts",
          "Martial arts",
          "Dancing",
          "Sun salutations"
        ],
        benefits: ["Energy", "Strength", "Confidence"],
        modernUses: ["Fitness", "Energy enhancement"]
      }
    }
  },

  // Sleep and Rest
  sleep: {
    lunarCycles: {
      newMoon: {
        title: "New Moon Sleep Enhancement",
        description: "Optimize sleep during new moon",
        instructions: [
          "Early bedtime",
          "Dark room",
          "No screens before bed",
          "Lunar meditation"
        ],
        benefits: ["Deep sleep", "Restoration", "Intuition"],
        modernUses: ["Sleep improvement", "Rest optimization"]
      }
    }
  }
}

// ============================================================================
// 8. LAL KITAB REMEDIES
// ============================================================================

export const LAL_KITAB_REMEDIES = {
  // Simple, practical remedies from Lal Kitab (Red Book) system
  planetary: {
    sun: {
      copperCoin: {
        title: "Copper Coin Remedy",
        description: "Throw copper coins in running water to strengthen Sun",
        instructions: [
          "Take 7 copper coins",
          "Go to a flowing river or stream",
          "Throw coins one by one into the water",
          "Recite 'Om Suryaya Namah' while throwing each coin",
          "Perform on Sunday during sunrise hours (6-8 AM)"
        ],
        benefits: ["Strengthens Sun", "Improves confidence", "Enhances leadership", "Better health"],
        planetaryRulers: ["Sun"],
        cost: "low",
        difficulty: "beginner",
        timing: "Sunday, Sunrise (6-8 AM)",
        frequency: "Once a week for 7 weeks",
        culturalOrigin: ["Indian"],
        traditionalSource: ["Lal Kitab"]
      },
      wheatDonation: {
        title: "Wheat Donation",
        description: "Donate wheat to strengthen Sun and improve health",
        instructions: [
          "Take 1 kg of wheat",
          "Donate to a temple or needy person on Sunday",
          "Do this during morning hours",
          "Recite 'Om Suryaya Namah' 11 times before donation"
        ],
        benefits: ["Strengthens Sun", "Improves health", "Increases vitality", "Better eyesight"],
        planetaryRulers: ["Sun"],
        cost: "low",
        difficulty: "beginner",
        timing: "Sunday, Morning (8-10 AM)",
        frequency: "Every Sunday for 11 weeks",
        culturalOrigin: ["Indian"],
        traditionalSource: ["Lal Kitab"]
      }
    },
    saturn: {
      feedCrows: {
        title: "Feed Crows",
        description: "Feed crows to strengthen Saturn and improve karma",
        instructions: [
          "Take some food (rice, bread, or grains)",
          "Feed crows on Saturday",
          "Perform during morning hours (7-9 AM)",
          "Recite 'Om Shanaishcharaya Namah' while feeding",
          "Do not harm or disturb the crows"
        ],
        benefits: ["Strengthens Saturn", "Improves karma", "Reduces obstacles", "Better discipline"],
        planetaryRulers: ["Saturn"],
        cost: "free",
        difficulty: "beginner",
        timing: "Saturday, Morning (7-9 AM)",
        frequency: "Every Saturday for 11 weeks",
        culturalOrigin: ["Indian"],
        traditionalSource: ["Lal Kitab"]
      },
      mustardOil: {
        title: "Mustard Oil Remedy",
        description: "Donate mustard oil to balance Saturn and reduce delays",
        instructions: [
          "Take 1 liter of mustard oil",
          "Donate to a temple or pour under a peepal tree on Saturday",
          "Perform during evening hours (6-8 PM)",
          "Recite 'Om Shanaishcharaya Namah' 11 times"
        ],
        benefits: ["Balances Saturn", "Reduces delays", "Better discipline", "Improved karma"],
        planetaryRulers: ["Saturn"],
        cost: "low",
        difficulty: "beginner",
        timing: "Saturday, Evening (6-8 PM)",
        frequency: "Every Saturday for 11 weeks",
        culturalOrigin: ["Indian"],
        traditionalSource: ["Lal Kitab"]
      }
    },
    mars: {
      redLentil: {
        title: "Red Lentil Donation",
        description: "Donate red lentils to balance Mars and reduce anger",
        instructions: [
          "Take 1 kg of red lentils (masoor dal)",
          "Donate to a temple or needy person on Tuesday",
          "Perform during morning hours (8-10 AM)",
          "Recite 'Om Mangalaya Namah' 11 times"
        ],
        benefits: ["Balances Mars", "Reduces anger", "Better courage", "Improved energy"],
        planetaryRulers: ["Mars"],
        cost: "low",
        difficulty: "beginner",
        timing: "Tuesday, Morning (8-10 AM)",
        frequency: "Every Tuesday for 11 weeks",
        culturalOrigin: ["Indian"],
        traditionalSource: ["Lal Kitab"]
      }
    },
    jupiter: {
      yellowGram: {
        title: "Yellow Gram Donation",
        description: "Donate yellow gram to strengthen Jupiter and improve wisdom",
        instructions: [
          "Take 1 kg of yellow gram (chana dal)",
          "Donate to a temple or feed to a yellow cow on Thursday",
          "Perform during morning hours (8-10 AM)",
          "Recite 'Om Brihaspataye Namah' 11 times"
        ],
        benefits: ["Strengthens Jupiter", "Improves wisdom", "Better education", "Spiritual growth"],
        planetaryRulers: ["Jupiter"],
        cost: "low",
        difficulty: "beginner",
        timing: "Thursday, Morning (8-10 AM)",
        frequency: "Every Thursday for 11 weeks",
        culturalOrigin: ["Indian"],
        traditionalSource: ["Lal Kitab"]
      }
    }
  }
}

// ============================================================================
// 9. TRICHAKRA METHOD REMEDIES
// ============================================================================

export const TRICHAKRA_REMEDIES = {
  // Integrated remedies organized by chakra levels
  body: {
    gemstones: {
      title: "Body Level Gemstone Therapy",
      description: "Physical gemstones to balance planetary energies",
      instructions: [
        "Wear appropriate gemstone based on weak planet",
        "Set in proper metal (gold or silver)",
        "Wear on correct finger",
        "Activate on planetary day",
        "Clean regularly"
      ],
      benefits: ["Physical balance", "Planetary strength", "Material prosperity"],
      cost: "high",
      difficulty: "intermediate",
      chakraAssociations: ["Root", "Sacral", "Solar Plexus"]
    },
    colors: {
      title: "Body Level Color Therapy",
      description: "Wear and use colors to balance planetary influences",
      instructions: [
        "Wear colors associated with weak planets",
        "Use colors in home decor",
        "Eat foods of appropriate colors",
        "Surround yourself with beneficial colors"
      ],
      benefits: ["Energy balance", "Mood enhancement", "Physical harmony"],
      cost: "low",
      difficulty: "beginner",
      chakraAssociations: ["All chakras"]
    }
  },
  mind: {
    mantras: {
      title: "Mind Level Mantra Practice",
      description: "Chant mantras to strengthen planetary energies",
      instructions: [
        "Choose mantra for weak planet",
        "Chant 108 times daily",
        "Use mala (rosary) for counting",
        "Focus on pronunciation and intention",
        "Practice at auspicious times"
      ],
      benefits: ["Mental clarity", "Spiritual growth", "Planetary strength"],
      cost: "free",
      difficulty: "beginner",
      chakraAssociations: ["Third Eye", "Crown"]
    },
    meditation: {
      title: "Mind Level Meditation",
      description: "Meditation practices for mental and spiritual balance",
      instructions: [
        "Practice daily meditation",
        "Focus on weak planetary energies",
        "Visualize planetary blessings",
        "Maintain regular practice",
        "Combine with mantras for best results"
      ],
      benefits: ["Mental peace", "Emotional balance", "Spiritual growth"],
      cost: "free",
      difficulty: "intermediate",
      chakraAssociations: ["Third Eye", "Crown", "Heart"]
    }
  },
  soul: {
    rituals: {
      title: "Soul Level Rituals",
      description: "Deep transformative rituals for karmic healing",
      instructions: [
        "Perform rituals on auspicious days",
        "Follow traditional procedures",
        "Maintain purity and devotion",
        "Seek guidance from experienced practitioners",
        "Practice with faith and sincerity"
      ],
      benefits: ["Karmic healing", "Deep transformation", "Spiritual liberation"],
      cost: "medium",
      difficulty: "advanced",
      chakraAssociations: ["Crown", "All chakras"]
    },
    charity: {
      title: "Soul Level Charity",
      description: "Selfless service and charity for karmic balance",
      instructions: [
        "Donate to worthy causes",
        "Help those in need",
        "Practice selfless service",
        "Give without expectation",
        "Maintain humility and gratitude"
      ],
      benefits: ["Karmic balance", "Spiritual growth", "Universal blessings"],
      cost: "variable",
      difficulty: "beginner",
      chakraAssociations: ["Heart", "Crown"]
    }
  }
}

// ============================================================================
// MAIN REMEDY GENERATION FUNCTION
// ============================================================================

export function generateComprehensiveRemedies(
  userProfile: any,
  question: string,
  allSystemData: any
): ComprehensiveRemedy[] {
  const remedies: ComprehensiveRemedy[] = []
  
  // This function will analyze ALL systems and generate remedies
  // Implementation will be in the next part due to size limits
  
  return remedies
}

export default {
  ASTROLOGICAL_REMEDIES,
  NUMEROLOGY_REMEDIES,
  DIVINATION_REMEDIES,
  READING_REMEDIES,
  SPECIALIZED_REMEDIES,
  MODERN_HOLISTIC_REMEDIES,
  LIFESTYLE_REMEDIES,
  LAL_KITAB_REMEDIES,
  TRICHAKRA_REMEDIES,
  generateComprehensiveRemedies
} 