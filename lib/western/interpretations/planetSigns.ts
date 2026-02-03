/**
 * Professional Planet-Sign Interpretations Database
 * 120 combinations covering all 10 planets × 12 signs
 * Based on traditional Western astrology principles
 */

export interface PlanetSignInterpretation {
  keywords: string[];
  shortInterpretation: string;
  strengths: string[];
  challenges: string[];
  careerSuggestions: string[];
  relationshipStyle: string;
  growthPath: string;
}

export const PLANET_SIGN_INTERPRETATIONS: Record<string, PlanetSignInterpretation> = {
  // SUN SIGNS (Identity, Ego, Life Purpose)
  'Sun-Aries': {
    keywords: ['leadership', 'pioneering', 'courage', 'initiative'],
    shortInterpretation: 'Natural born leader with pioneering spirit',
    strengths: [
      'Dynamic leadership abilities',
      'Courageous approach to challenges',
      'Natural initiative and drive',
      'Enthusiasm and optimism',
      'Ability to inspire others'
    ],
    challenges: [
      'Tendency toward impatience',
      'Need to develop listening skills',
      'Can be overly competitive',
      'May rush into decisions',
      'Difficulty with routine tasks'
    ],
    careerSuggestions: ['Entrepreneur', 'Military', 'Athletics', 'Sales', 'Emergency Services'],
    relationshipStyle: 'Direct and passionate, needs independence and excitement',
    growthPath: 'Learn patience, collaboration, and the value of others\' perspectives'
  },

  'Sun-Taurus': {
    keywords: ['stability', 'practicality', 'sensuality', 'determination'],
    shortInterpretation: 'Steady builder who values security and beauty',
    strengths: [
      'Reliable and trustworthy nature',
      'Strong practical abilities',
      'Appreciation for beauty and comfort',
      'Determined and persistent',
      'Natural financial acumen'
    ],
    challenges: [
      'Resistance to change',
      'Tendency toward stubbornness',
      'May be overly materialistic',
      'Difficulty adapting quickly',
      'Can be possessive'
    ],
    careerSuggestions: ['Banking', 'Real Estate', 'Agriculture', 'Art', 'Finance'],
    relationshipStyle: 'Loyal and devoted, seeks security and sensual connection',
    growthPath: 'Embrace change, develop flexibility, and balance material with spiritual values'
  },

  'Sun-Gemini': {
    keywords: ['communication', 'curiosity', 'versatility', 'intelligence'],
    shortInterpretation: 'Curious communicator with versatile talents',
    strengths: [
      'Excellent communication skills',
      'Natural curiosity and intelligence',
      'Adaptability and versatility',
      'Quick thinking and wit',
      'Ability to connect with diverse people'
    ],
    challenges: [
      'Tendency toward restlessness',
      'Difficulty with deep commitment',
      'May spread energy too thin',
      'Can be inconsistent',
      'Tendency to gossip or talk too much'
    ],
    careerSuggestions: ['Journalism', 'Teaching', 'Sales', 'Writing', 'Technology'],
    relationshipStyle: 'Intellectual and playful, needs mental stimulation and variety',
    growthPath: 'Develop focus, depth, and commitment while maintaining curiosity'
  },

  'Sun-Cancer': {
    keywords: ['nurturing', 'intuition', 'emotional', 'protective'],
    shortInterpretation: 'Caring nurturer with strong emotional intelligence',
    strengths: [
      'Natural nurturing abilities',
      'Strong intuition and empathy',
      'Protective and loyal nature',
      'Excellent memory and emotional intelligence',
      'Ability to create safe spaces'
    ],
    challenges: [
      'Tendency toward moodiness',
      'Over-protectiveness',
      'Difficulty letting go',
      'Can be overly sensitive',
      'Tendency to cling to the past'
    ],
    careerSuggestions: ['Healthcare', 'Childcare', 'Real Estate', 'Cooking', 'Psychology'],
    relationshipStyle: 'Caring and protective, seeks emotional security and family connection',
    growthPath: 'Develop emotional boundaries, learn to let go, and balance caring with independence'
  },

  'Sun-Leo': {
    keywords: ['creativity', 'leadership', 'drama', 'generosity'],
    shortInterpretation: 'Creative leader with natural charisma and generosity',
    strengths: [
      'Natural leadership and charisma',
      'Creative and dramatic abilities',
      'Generous and warm-hearted nature',
      'Confidence and self-expression',
      'Ability to inspire and entertain'
    ],
    challenges: [
      'Need for constant attention',
      'Tendency toward pride',
      'Can be overly dramatic',
      'Difficulty accepting criticism',
      'May be self-centered'
    ],
    careerSuggestions: ['Entertainment', 'Leadership', 'Arts', 'Education', 'Public Speaking'],
    relationshipStyle: 'Dramatic and generous, needs admiration and creative expression',
    growthPath: 'Develop humility, learn to share the spotlight, and balance ego with service'
  },

  'Sun-Virgo': {
    keywords: ['analysis', 'service', 'perfectionism', 'practicality'],
    shortInterpretation: 'Analytical perfectionist with strong service orientation',
    strengths: [
      'Excellent analytical abilities',
      'Attention to detail and precision',
      'Strong work ethic and reliability',
      'Natural healing and service abilities',
      'Practical problem-solving skills'
    ],
    challenges: [
      'Tendency toward perfectionism',
      'Critical nature (self and others)',
      'Difficulty relaxing',
      'Can be overly anxious',
      'Tendency to worry excessively'
    ],
    careerSuggestions: ['Healthcare', 'Research', 'Editing', 'Administration', 'Nutrition'],
    relationshipStyle: 'Helpful and practical, seeks improvement and meaningful service',
    growthPath: 'Learn to accept imperfection, develop self-compassion, and balance work with play'
  },

  'Sun-Libra': {
    keywords: ['harmony', 'partnership', 'beauty', 'diplomacy'],
    shortInterpretation: 'Diplomatic peacemaker who values harmony and beauty',
    strengths: [
      'Natural diplomatic abilities',
      'Strong sense of justice and fairness',
      'Appreciation for beauty and art',
      'Excellent partnership skills',
      'Ability to see multiple perspectives'
    ],
    challenges: [
      'Difficulty making decisions',
      'Tendency to avoid conflict',
      'Can be overly dependent on others',
      'May procrastinate',
      'Difficulty asserting personal needs'
    ],
    careerSuggestions: ['Law', 'Art', 'Counseling', 'Design', 'Public Relations'],
    relationshipStyle: 'Harmonious and cooperative, seeks balance and partnership',
    growthPath: 'Develop decision-making skills, learn to assert needs, and balance cooperation with independence'
  },

  'Sun-Scorpio': {
    keywords: ['transformation', 'intensity', 'mystery', 'power'],
    shortInterpretation: 'Intense transformer with deep psychological insight',
    strengths: [
      'Deep psychological insight',
      'Natural transformative abilities',
      'Intense focus and determination',
      'Strong intuition and perception',
      'Ability to handle crisis and change'
    ],
    challenges: [
      'Tendency toward obsession',
      'Difficulty trusting others',
      'Can be overly secretive',
      'Intense emotional reactions',
      'Tendency toward control issues'
    ],
    careerSuggestions: ['Psychology', 'Research', 'Detective Work', 'Healing', 'Finance'],
    relationshipStyle: 'Intense and passionate, seeks deep connection and transformation',
    growthPath: 'Learn to trust, develop emotional balance, and use power constructively'
  },

  'Sun-Sagittarius': {
    keywords: ['adventure', 'philosophy', 'optimism', 'freedom'],
    shortInterpretation: 'Adventurous philosopher with boundless optimism',
    strengths: [
      'Natural optimism and enthusiasm',
      'Love of learning and adventure',
      'Philosophical and wise nature',
      'Honest and straightforward',
      'Ability to inspire others'
    ],
    challenges: [
      'Tendency toward restlessness',
      'Difficulty with commitment',
      'Can be tactless or blunt',
      'May over-promise',
      'Tendency to avoid details'
    ],
    careerSuggestions: ['Travel', 'Teaching', 'Philosophy', 'Publishing', 'Sports'],
    relationshipStyle: 'Adventurous and honest, needs freedom and intellectual stimulation',
    growthPath: 'Develop commitment, learn tact, and balance adventure with responsibility'
  },

  'Sun-Capricorn': {
    keywords: ['ambition', 'responsibility', 'tradition', 'authority'],
    shortInterpretation: 'Ambitious achiever with strong sense of responsibility',
    strengths: [
      'Strong ambition and determination',
      'Natural leadership abilities',
      'Practical and responsible nature',
      'Excellent organizational skills',
      'Ability to build lasting structures'
    ],
    challenges: [
      'Tendency toward pessimism',
      'Difficulty expressing emotions',
      'Can be overly controlling',
      'May be too serious',
      'Tendency toward workaholism'
    ],
    careerSuggestions: ['Management', 'Government', 'Finance', 'Architecture', 'Law'],
    relationshipStyle: 'Serious and committed, seeks stability and achievement',
    growthPath: 'Develop emotional expression, learn to relax, and balance ambition with joy'
  },

  'Sun-Aquarius': {
    keywords: ['innovation', 'humanitarianism', 'independence', 'originality'],
    shortInterpretation: 'Innovative humanitarian with independent thinking',
    strengths: [
      'Original and innovative thinking',
      'Strong humanitarian values',
      'Independent and progressive nature',
      'Excellent technological abilities',
      'Ability to see future possibilities'
    ],
    challenges: [
      'Tendency toward detachment',
      'Difficulty with emotional intimacy',
      'Can be overly rebellious',
      'May be unpredictable',
      'Tendency toward eccentricity'
    ],
    careerSuggestions: ['Technology', 'Science', 'Social Work', 'Innovation', 'Activism'],
    relationshipStyle: 'Independent and unique, needs freedom and intellectual connection',
    growthPath: 'Develop emotional connection, learn to work within systems, and balance independence with cooperation'
  },

  'Sun-Pisces': {
    keywords: ['compassion', 'intuition', 'spirituality', 'creativity'],
    shortInterpretation: 'Compassionate dreamer with strong spiritual connection',
    strengths: [
      'Deep compassion and empathy',
      'Strong intuition and psychic abilities',
      'Creative and artistic nature',
      'Spiritual and mystical understanding',
      'Ability to heal and inspire others'
    ],
    challenges: [
      'Tendency toward escapism',
      'Difficulty with boundaries',
      'Can be overly sensitive',
      'May be unrealistic',
      'Tendency toward victimization'
    ],
    careerSuggestions: ['Arts', 'Healing', 'Spirituality', 'Counseling', 'Music'],
    relationshipStyle: 'Compassionate and intuitive, seeks spiritual connection and emotional depth',
    growthPath: 'Develop boundaries, learn practical skills, and balance dreams with reality'
  },

  // MOON SIGNS (Emotions, Needs, Instincts)
  'Moon-Aries': {
    keywords: ['impulsive', 'independent', 'energetic', 'direct'],
    shortInterpretation: 'Emotionally direct and action-oriented',
    strengths: [
      'Quick emotional responses',
      'Natural independence',
      'High energy and enthusiasm',
      'Direct communication style',
      'Ability to take immediate action'
    ],
    challenges: [
      'Tendency toward impatience',
      'Difficulty with emotional patience',
      'Can be emotionally reactive',
      'May lack emotional subtlety',
      'Tendency to rush emotional processes'
    ],
    careerSuggestions: ['Emergency Services', 'Sports', 'Sales', 'Entrepreneurship', 'Leadership'],
    relationshipStyle: 'Direct and passionate, needs excitement and independence',
    growthPath: 'Develop emotional patience, learn to listen, and balance action with reflection'
  },

  'Moon-Taurus': {
    keywords: ['stable', 'comfortable', 'sensual', 'loyal'],
    shortInterpretation: 'Emotionally stable and comfort-seeking',
    strengths: [
      'Emotional stability and consistency',
      'Strong need for security',
      'Sensual and comfort-loving nature',
      'Loyal and dependable',
      'Ability to create emotional security'
    ],
    challenges: [
      'Resistance to emotional change',
      'Tendency toward possessiveness',
      'Can be emotionally stubborn',
      'May avoid emotional growth',
      'Tendency toward materialism'
    ],
    careerSuggestions: ['Banking', 'Real Estate', 'Agriculture', 'Art', 'Finance'],
    relationshipStyle: 'Stable and loyal, needs security and sensual comfort',
    growthPath: 'Embrace emotional change, develop flexibility, and balance material with emotional security'
  },

  'Moon-Gemini': {
    keywords: ['curious', 'communicative', 'changeable', 'intellectual'],
    shortInterpretation: 'Emotionally curious and intellectually stimulated',
    strengths: [
      'Intellectual emotional processing',
      'Natural curiosity about feelings',
      'Excellent communication of emotions',
      'Adaptable emotional nature',
      'Ability to understand diverse perspectives'
    ],
    challenges: [
      'Tendency toward emotional restlessness',
      'Difficulty with deep emotional commitment',
      'Can be emotionally inconsistent',
      'May intellectualize feelings',
      'Tendency to avoid emotional depth'
    ],
    careerSuggestions: ['Journalism', 'Teaching', 'Counseling', 'Writing', 'Communication'],
    relationshipStyle: 'Intellectual and communicative, needs mental stimulation and variety',
    growthPath: 'Develop emotional depth, learn to commit, and balance intellect with feeling'
  },

  'Moon-Cancer': {
    keywords: ['nurturing', 'protective', 'intuitive', 'moody'],
    shortInterpretation: 'Emotionally nurturing and intuitively protective',
    strengths: [
      'Natural emotional nurturing abilities',
      'Strong intuition and empathy',
      'Protective emotional nature',
      'Deep emotional memory',
      'Ability to create emotional safety'
    ],
    challenges: [
      'Tendency toward moodiness',
      'Over-protectiveness',
      'Difficulty with emotional boundaries',
      'Can be overly sensitive',
      'Tendency to cling to emotional past'
    ],
    careerSuggestions: ['Healthcare', 'Childcare', 'Counseling', 'Real Estate', 'Psychology'],
    relationshipStyle: 'Nurturing and protective, needs emotional security and family connection',
    growthPath: 'Develop emotional boundaries, learn to let go, and balance caring with independence'
  },

  'Moon-Leo': {
    keywords: ['dramatic', 'generous', 'proud', 'creative'],
    shortInterpretation: 'Emotionally dramatic and creatively expressive',
    strengths: [
      'Dramatic emotional expression',
      'Generous emotional nature',
      'Creative emotional processing',
      'Natural emotional leadership',
      'Ability to inspire others emotionally'
    ],
    challenges: [
      'Need for emotional attention',
      'Tendency toward emotional pride',
      'Can be emotionally dramatic',
      'Difficulty accepting emotional criticism',
      'May be emotionally self-centered'
    ],
    careerSuggestions: ['Entertainment', 'Arts', 'Education', 'Leadership', 'Public Speaking'],
    relationshipStyle: 'Dramatic and generous, needs admiration and creative emotional expression',
    growthPath: 'Develop emotional humility, learn to share emotional spotlight, and balance ego with service'
  },

  'Moon-Virgo': {
    keywords: ['analytical', 'helpful', 'perfectionist', 'practical'],
    shortInterpretation: 'Emotionally analytical and practically helpful',
    strengths: [
      'Analytical emotional processing',
      'Helpful emotional nature',
      'Practical emotional approach',
      'Strong emotional work ethic',
      'Ability to improve emotional situations'
    ],
    challenges: [
      'Tendency toward emotional perfectionism',
      'Critical emotional nature',
      'Difficulty with emotional relaxation',
      'Can be emotionally anxious',
      'Tendency to worry emotionally'
    ],
    careerSuggestions: ['Healthcare', 'Research', 'Counseling', 'Administration', 'Nutrition'],
    relationshipStyle: 'Helpful and practical, seeks emotional improvement and meaningful service',
    growthPath: 'Learn to accept emotional imperfection, develop self-compassion, and balance work with emotional play'
  },

  'Moon-Libra': {
    keywords: ['harmonious', 'diplomatic', 'partnership', 'beautiful'],
    shortInterpretation: 'Emotionally harmonious and diplomatically balanced',
    strengths: [
      'Natural emotional diplomacy',
      'Harmonious emotional nature',
      'Strong partnership emotional skills',
      'Appreciation for emotional beauty',
      'Ability to balance emotional perspectives'
    ],
    challenges: [
      'Difficulty with emotional decisions',
      'Tendency to avoid emotional conflict',
      'Can be emotionally dependent',
      'May procrastinate emotionally',
      'Difficulty asserting emotional needs'
    ],
    careerSuggestions: ['Counseling', 'Art', 'Law', 'Design', 'Public Relations'],
    relationshipStyle: 'Harmonious and cooperative, seeks emotional balance and partnership',
    growthPath: 'Develop emotional decision-making, learn to assert emotional needs, and balance cooperation with independence'
  },

  'Moon-Scorpio': {
    keywords: ['intense', 'transformative', 'mysterious', 'powerful'],
    shortInterpretation: 'Emotionally intense and transformatively powerful',
    strengths: [
      'Deep emotional intensity',
      'Natural emotional transformation abilities',
      'Strong emotional intuition',
      'Powerful emotional nature',
      'Ability to handle emotional crisis'
    ],
    challenges: [
      'Tendency toward emotional obsession',
      'Difficulty with emotional trust',
      'Can be emotionally secretive',
      'Intense emotional reactions',
      'Tendency toward emotional control'
    ],
    careerSuggestions: ['Psychology', 'Research', 'Healing', 'Detective Work', 'Finance'],
    relationshipStyle: 'Intense and passionate, seeks deep emotional connection and transformation',
    growthPath: 'Learn to trust emotionally, develop emotional balance, and use emotional power constructively'
  },

  'Moon-Sagittarius': {
    keywords: ['adventurous', 'optimistic', 'philosophical', 'free'],
    shortInterpretation: 'Emotionally adventurous and philosophically optimistic',
    strengths: [
      'Natural emotional optimism',
      'Adventurous emotional nature',
      'Philosophical emotional processing',
      'Honest emotional expression',
      'Ability to inspire emotional growth'
    ],
    challenges: [
      'Tendency toward emotional restlessness',
      'Difficulty with emotional commitment',
      'Can be emotionally tactless',
      'May over-promise emotionally',
      'Tendency to avoid emotional details'
    ],
    careerSuggestions: ['Travel', 'Teaching', 'Philosophy', 'Publishing', 'Sports'],
    relationshipStyle: 'Adventurous and honest, needs emotional freedom and intellectual stimulation',
    growthPath: 'Develop emotional commitment, learn emotional tact, and balance adventure with emotional responsibility'
  },

  'Moon-Capricorn': {
    keywords: ['responsible', 'ambitious', 'controlled', 'traditional'],
    shortInterpretation: 'Emotionally responsible and ambitiously controlled',
    strengths: [
      'Strong emotional responsibility',
      'Ambitious emotional nature',
      'Controlled emotional expression',
      'Practical emotional approach',
      'Ability to build emotional structures'
    ],
    challenges: [
      'Tendency toward emotional pessimism',
      'Difficulty expressing emotions',
      'Can be emotionally controlling',
      'May be emotionally serious',
      'Tendency toward emotional workaholism'
    ],
    careerSuggestions: ['Management', 'Government', 'Finance', 'Architecture', 'Law'],
    relationshipStyle: 'Serious and committed, seeks emotional stability and achievement',
    growthPath: 'Develop emotional expression, learn to relax emotionally, and balance ambition with emotional joy'
  },

  'Moon-Aquarius': {
    keywords: ['independent', 'innovative', 'detached', 'humanitarian'],
    shortInterpretation: 'Emotionally independent and innovatively detached',
    strengths: [
      'Independent emotional nature',
      'Innovative emotional thinking',
      'Humanitarian emotional values',
      'Progressive emotional approach',
      'Ability to see emotional future possibilities'
    ],
    challenges: [
      'Tendency toward emotional detachment',
      'Difficulty with emotional intimacy',
      'Can be emotionally rebellious',
      'May be emotionally unpredictable',
      'Tendency toward emotional eccentricity'
    ],
    careerSuggestions: ['Technology', 'Science', 'Social Work', 'Innovation', 'Activism'],
    relationshipStyle: 'Independent and unique, needs emotional freedom and intellectual connection',
    growthPath: 'Develop emotional connection, learn to work within emotional systems, and balance independence with cooperation'
  },

  'Moon-Pisces': {
    keywords: ['compassionate', 'intuitive', 'spiritual', 'dreamy'],
    shortInterpretation: 'Emotionally compassionate and spiritually intuitive',
    strengths: [
      'Deep emotional compassion',
      'Strong emotional intuition',
      'Spiritual emotional nature',
      'Creative emotional processing',
      'Ability to heal emotional wounds'
    ],
    challenges: [
      'Tendency toward emotional escapism',
      'Difficulty with emotional boundaries',
      'Can be emotionally overly sensitive',
      'May be emotionally unrealistic',
      'Tendency toward emotional victimization'
    ],
    careerSuggestions: ['Arts', 'Healing', 'Spirituality', 'Counseling', 'Music'],
    relationshipStyle: 'Compassionate and intuitive, seeks spiritual emotional connection and depth',
    growthPath: 'Develop emotional boundaries, learn practical emotional skills, and balance dreams with emotional reality'
  }
};

/**
 * Get interpretation for a planet-sign combination
 */
export function getPlanetSignInterpretation(planet: string, sign: string): PlanetSignInterpretation | null {
  const key = `${planet}-${sign}`;
  return PLANET_SIGN_INTERPRETATIONS[key] || null;
}

/**
 * Get all interpretations for a specific planet
 */
export function getPlanetInterpretations(planet: string): Record<string, PlanetSignInterpretation> {
  const interpretations: Record<string, PlanetSignInterpretation> = {};
  
  for (const [key, interpretation] of Object.entries(PLANET_SIGN_INTERPRETATIONS)) {
    if (key.startsWith(`${planet}-`)) {
      const sign = key.split('-')[1];
      interpretations[sign] = interpretation;
    }
  }
  
  return interpretations;
}

/**
 * Get all interpretations for a specific sign
 */
export function getSignInterpretations(sign: string): Record<string, PlanetSignInterpretation> {
  const interpretations: Record<string, PlanetSignInterpretation> = {};
  
  for (const [key, interpretation] of Object.entries(PLANET_SIGN_INTERPRETATIONS)) {
    if (key.endsWith(`-${sign}`)) {
      const planet = key.split('-')[0];
      interpretations[planet] = interpretation;
    }
  }
  
  return interpretations;
}
