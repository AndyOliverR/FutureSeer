// ADVANCED PERSONALIZATION SYSTEM
// Multi-layered personalization for ultimate customization

import { ComprehensiveRemedy } from './comprehensiveRemedyDatabase'

export interface AdvancedUserProfile {
  // Basic Profile
  id: string
  name: string
  email: string
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  
  // Physical Characteristics
  height: number
  weight: number
  bloodType: string
  dominantHand: 'left' | 'right' | 'ambidextrous'
  eyeColor: string
  hairColor: string
  skinTone: string
  
  // Personality & Psychology
  mbtiType: string
  enneagramType: string
  bigFiveTraits: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  communicationStyle: 'direct' | 'diplomatic' | 'analytical' | 'expressive'
  
  // Lifestyle & Preferences
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean'
  exerciseLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athletic'
  sleepPattern: 'early_bird' | 'night_owl' | 'regular' | 'irregular'
  stressLevel: 'low' | 'moderate' | 'high' | 'extreme'
  meditationExperience: 'none' | 'beginner' | 'intermediate' | 'advanced'
  
  // Environmental Factors
  climate: 'tropical' | 'temperate' | 'cold' | 'desert' | 'mountain'
  urbanRural: 'urban' | 'suburban' | 'rural'
  livingSpace: 'apartment' | 'house' | 'shared' | 'outdoor'
  workEnvironment: 'office' | 'remote' | 'outdoor' | 'creative' | 'medical'
  
  // Spiritual & Cultural
  spiritualBeliefs: 'atheist' | 'agnostic' | 'spiritual' | 'religious' | 'mystical'
  culturalBackground: string[]
  preferredLanguages: string[]
  spiritualPractices: string[]
  
  // Health & Wellness
  healthConditions: string[]
  medications: string[]
  allergies: string[]
  energyLevel: 'low' | 'moderate' | 'high' | 'variable'
  painAreas: string[]
  
  // Goals & Intentions
  primaryGoals: string[]
  lifeAreas: {
    career: number // 1-10 priority
    relationships: number
    health: number
    spirituality: number
    finances: number
    creativity: number
    learning: number
  }
  currentChallenges: string[]
  desiredOutcomes: string[]
  
  // Behavioral Patterns
  decisionMakingStyle: 'intuitive' | 'analytical' | 'collaborative' | 'impulsive'
  riskTolerance: 'low' | 'moderate' | 'high'
  changeAdaptability: 'resistant' | 'cautious' | 'flexible' | 'embracing'
  socialEnergy: 'introvert' | 'ambivert' | 'extrovert'
  
  // Technology & Modern Life
  techComfort: 'low' | 'moderate' | 'high'
  digitalDetoxInterest: boolean
  biohackingInterest: boolean
  wearableTech: string[]
  
  // Financial & Resources
  budgetRange: 'low' | 'moderate' | 'high' | 'luxury'
  timeAvailability: 'minimal' | 'moderate' | 'generous'
  resourceAccess: 'limited' | 'moderate' | 'extensive'
  
  // Historical Data
  pastRemedies: {
    remedyId: string
    effectiveness: number // 1-10
    sideEffects: string[]
    duration: number
    date: string
  }[]
  successPatterns: string[]
  failurePatterns: string[]
  
  // Real-time Context
  currentMood: 'stressed' | 'calm' | 'energetic' | 'tired' | 'focused' | 'scattered'
  currentEnergy: 'low' | 'moderate' | 'high'
  currentLifePhase: 'transition' | 'stable' | 'growth' | 'challenge' | 'celebration'
  immediateNeeds: string[]
}

export interface PersonalizedContext {
  userProfile: AdvancedUserProfile
  currentQuestion: string
  lifeArea: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  timeOfDay: string
  lunarPhase: string
  seasonalContext: string
  astrologicalTransits: any
  numerologicalCycles: any
  environmentalFactors: {
    weather: string
    airQuality: string
    noiseLevel: string
    lightLevel: string
  }
  emotionalState: {
    primary: string
    secondary: string
    intensity: number
  }
  physicalState: {
    energy: number
    stress: number
    sleep: number
    nutrition: number
  }
}

export interface PersonalizationFactors {
  // Compatibility Scores
  remedyCompatibility: number // 0-100
  timingOptimality: number
  resourceAlignment: number
  lifestyleFit: number
  culturalRelevance: number
  
  // Effectiveness Predictors
  predictedEffectiveness: number
  adherenceLikelihood: number
  sideEffectRisk: number
  longTermBenefit: number
  
  // Personalization Modifiers
  intensityModifier: number
  durationModifier: number
  frequencyModifier: number
  costModifier: number
  difficultyModifier: number
}

export class AdvancedPersonalizationEngine {
  private userProfile: AdvancedUserProfile
  private context: PersonalizedContext
  
  constructor(userProfile: AdvancedUserProfile, context: PersonalizedContext) {
    this.userProfile = userProfile
    this.context = context
  }
  
  // ============================================================================
  // PERSONALITY-BASED PERSONALIZATION
  // ============================================================================
  
  calculatePersonalityAlignment(remedy: ComprehensiveRemedy): number {
    let alignment = 50 // Base alignment
    
    // MBTI-based adjustments
    if (this.userProfile.mbtiType) {
      alignment += this.getMBTIAlignment(remedy, this.userProfile.mbtiType)
    }
    
    // Enneagram-based adjustments
    if (this.userProfile.enneagramType) {
      alignment += this.getEnneagramAlignment(remedy, this.userProfile.enneagramType)
    }
    
    // Big Five adjustments
    alignment += this.getBigFiveAlignment(remedy, this.userProfile.bigFiveTraits)
    
    // Learning style adjustments
    alignment += this.getLearningStyleAlignment(remedy, this.userProfile.learningStyle)
    
    return Math.max(0, Math.min(100, alignment))
  }
  
  private getMBTIAlignment(remedy: ComprehensiveRemedy, mbtiType: string): number {
    const mbtiAlignments: { [key: string]: { [key: string]: number } } = {
      'INTJ': { 'analytical': 20, 'intuitive': 15, 'systematic': 15, 'independent': 10 },
      'INTP': { 'analytical': 20, 'creative': 15, 'flexible': 15, 'intellectual': 10 },
      'ENTJ': { 'leadership': 20, 'strategic': 15, 'efficient': 15, 'ambitious': 10 },
      'ENTP': { 'innovative': 20, 'adaptable': 15, 'energetic': 15, 'curious': 10 },
      'INFJ': { 'spiritual': 20, 'empathetic': 15, 'creative': 15, 'idealistic': 10 },
      'INFP': { 'creative': 20, 'spiritual': 15, 'empathetic': 15, 'authentic': 10 },
      'ENFJ': { 'social': 20, 'empathetic': 15, 'leadership': 15, 'harmonious': 10 },
      'ENFP': { 'creative': 20, 'social': 15, 'energetic': 15, 'optimistic': 10 },
      'ISTJ': { 'practical': 20, 'reliable': 15, 'structured': 15, 'traditional': 10 },
      'ISFJ': { 'caring': 20, 'practical': 15, 'reliable': 15, 'harmonious': 10 },
      'ESTJ': { 'practical': 20, 'efficient': 15, 'leadership': 15, 'organized': 10 },
      'ESFJ': { 'social': 20, 'caring': 15, 'practical': 15, 'harmonious': 10 },
      'ISTP': { 'practical': 20, 'flexible': 15, 'analytical': 15, 'independent': 10 },
      'ISFP': { 'creative': 20, 'practical': 15, 'empathetic': 15, 'authentic': 10 },
      'ESTP': { 'energetic': 20, 'practical': 15, 'adaptable': 15, 'action-oriented': 10 },
      'ESFP': { 'social': 20, 'energetic': 15, 'practical': 15, 'optimistic': 10 }
    }
    
    const typeAlignments = mbtiAlignments[mbtiType] || {}
    let alignment = 0
    
    // Check remedy characteristics against personality preferences
    if (remedy.category.includes('Analytical') && typeAlignments.analytical) alignment += typeAlignments.analytical
    if (remedy.category.includes('Creative') && typeAlignments.creative) alignment += typeAlignments.creative
    if (remedy.category.includes('Spiritual') && typeAlignments.spiritual) alignment += typeAlignments.spiritual
    if (remedy.category.includes('Social') && typeAlignments.social) alignment += typeAlignments.social
    if (remedy.category.includes('Practical') && typeAlignments.practical) alignment += typeAlignments.practical
    if (remedy.category.includes('Leadership') && typeAlignments.leadership) alignment += typeAlignments.leadership
    
    return alignment
  }
  
  private getEnneagramAlignment(remedy: ComprehensiveRemedy, enneagramType: string): number {
    const enneagramAlignments: { [key: string]: { [key: string]: number } } = {
      '1': { 'perfectionist': 20, 'reform': 15, 'principled': 15, 'structured': 10 },
      '2': { 'helper': 20, 'caring': 15, 'generous': 15, 'harmonious': 10 },
      '3': { 'achiever': 20, 'success': 15, 'efficient': 15, 'ambitious': 10 },
      '4': { 'individualist': 20, 'creative': 15, 'authentic': 15, 'emotional': 10 },
      '5': { 'investigator': 20, 'analytical': 15, 'knowledge': 15, 'independent': 10 },
      '6': { 'loyalist': 20, 'security': 15, 'reliable': 15, 'cautious': 10 },
      '7': { 'enthusiast': 20, 'adventure': 15, 'optimistic': 15, 'flexible': 10 },
      '8': { 'challenger': 20, 'power': 15, 'direct': 15, 'protective': 10 },
      '9': { 'peacemaker': 20, 'harmony': 15, 'calm': 15, 'accepting': 10 }
    }
    
    const typeAlignments = enneagramAlignments[enneagramType] || {}
    let alignment = 0
    
    // Check remedy characteristics against enneagram preferences
    if (remedy.category.includes('Perfectionist') && typeAlignments.perfectionist) alignment += typeAlignments.perfectionist
    if (remedy.category.includes('Helper') && typeAlignments.helper) alignment += typeAlignments.helper
    if (remedy.category.includes('Achiever') && typeAlignments.achiever) alignment += typeAlignments.achiever
    if (remedy.category.includes('Individualist') && typeAlignments.individualist) alignment += typeAlignments.individualist
    if (remedy.category.includes('Investigator') && typeAlignments.investigator) alignment += typeAlignments.investigator
    if (remedy.category.includes('Loyalist') && typeAlignments.loyalist) alignment += typeAlignments.loyalist
    if (remedy.category.includes('Enthusiast') && typeAlignments.enthusiast) alignment += typeAlignments.enthusiast
    if (remedy.category.includes('Challenger') && typeAlignments.challenger) alignment += typeAlignments.challenger
    if (remedy.category.includes('Peacemaker') && typeAlignments.peacemaker) alignment += typeAlignments.peacemaker
    
    return alignment
  }
  
  private getBigFiveAlignment(remedy: ComprehensiveRemedy, bigFive: any): number {
    let alignment = 0
    
    // Openness adjustments
    if (bigFive.openness > 7) {
      if (remedy.category.includes('Creative') || remedy.category.includes('Innovative')) alignment += 15
      if (remedy.category.includes('Traditional') || remedy.category.includes('Conservative')) alignment -= 10
    } else if (bigFive.openness < 4) {
      if (remedy.category.includes('Traditional') || remedy.category.includes('Conservative')) alignment += 15
      if (remedy.category.includes('Creative') || remedy.category.includes('Innovative')) alignment -= 10
    }
    
    // Extraversion adjustments
    if (bigFive.extraversion > 7) {
      if (remedy.category.includes('Social') || remedy.category.includes('Group')) alignment += 15
      if (remedy.category.includes('Solitary') || remedy.category.includes('Individual')) alignment -= 10
    } else if (bigFive.extraversion < 4) {
      if (remedy.category.includes('Solitary') || remedy.category.includes('Individual')) alignment += 15
      if (remedy.category.includes('Social') || remedy.category.includes('Group')) alignment -= 10
    }
    
    // Conscientiousness adjustments
    if (bigFive.conscientiousness > 7) {
      if (remedy.category.includes('Structured') || remedy.category.includes('Systematic')) alignment += 15
      if (remedy.category.includes('Flexible') || remedy.category.includes('Spontaneous')) alignment -= 10
    } else if (bigFive.conscientiousness < 4) {
      if (remedy.category.includes('Flexible') || remedy.category.includes('Spontaneous')) alignment += 15
      if (remedy.category.includes('Structured') || remedy.category.includes('Systematic')) alignment -= 10
    }
    
    return alignment
  }
  
  private getLearningStyleAlignment(remedy: ComprehensiveRemedy, learningStyle: string): number {
    const styleAlignments: { [key: string]: number } = {
      'visual': remedy.category.includes('Visual') || remedy.category.includes('Color') ? 20 : 0,
      'auditory': remedy.category.includes('Sound') || remedy.category.includes('Mantra') ? 20 : 0,
      'kinesthetic': remedy.category.includes('Movement') || remedy.category.includes('Exercise') ? 20 : 0,
      'reading': remedy.category.includes('Study') || remedy.category.includes('Knowledge') ? 20 : 0
    }
    
    return styleAlignments[learningStyle] || 0
  }
  
  // ============================================================================
  // LIFESTYLE-BASED PERSONALIZATION
  // ============================================================================
  
  calculateLifestyleFit(remedy: ComprehensiveRemedy): number {
    let fit = 50 // Base fit
    
    // Diet compatibility
    fit += this.getDietCompatibility(remedy, this.userProfile.dietType)
    
    // Exercise compatibility
    fit += this.getExerciseCompatibility(remedy, this.userProfile.exerciseLevel)
    
    // Sleep pattern compatibility
    fit += this.getSleepCompatibility(remedy, this.userProfile.sleepPattern)
    
    // Stress level compatibility
    fit += this.getStressCompatibility(remedy, this.userProfile.stressLevel)
    
    // Meditation experience compatibility
    fit += this.getMeditationCompatibility(remedy, this.userProfile.meditationExperience)
    
    return Math.max(0, Math.min(100, fit))
  }
  
  private getDietCompatibility(remedy: ComprehensiveRemedy, dietType: string): number {
    const dietAlignments: { [key: string]: { [key: string]: number } } = {
      'vegetarian': { 'plant-based': 20, 'herbal': 15, 'natural': 10 },
      'vegan': { 'plant-based': 25, 'herbal': 20, 'natural': 15 },
      'keto': { 'energy': 20, 'focus': 15, 'metabolic': 10 },
      'paleo': { 'natural': 20, 'primal': 15, 'strength': 10 },
      'mediterranean': { 'balance': 20, 'heart-healthy': 15, 'social': 10 }
    }
    
    const dietAlignments_ = dietAlignments[dietType] || {}
    let compatibility = 0
    
    if (remedy.category.includes('Plant-based') && dietAlignments_['plant-based']) compatibility += dietAlignments_['plant-based']
    if (remedy.category.includes('Herbal') && dietAlignments_['herbal']) compatibility += dietAlignments_['herbal']
    if (remedy.category.includes('Natural') && dietAlignments_['natural']) compatibility += dietAlignments_['natural']
    if (remedy.category.includes('Energy') && dietAlignments_['energy']) compatibility += dietAlignments_['energy']
    if (remedy.category.includes('Balance') && dietAlignments_['balance']) compatibility += dietAlignments_['balance']
    
    return compatibility
  }
  
  private getExerciseCompatibility(remedy: ComprehensiveRemedy, exerciseLevel: string): number {
    const exerciseAlignments: { [key: string]: { [key: string]: number } } = {
      'sedentary': { 'gentle': 20, 'seated': 15, 'low-impact': 10 },
      'light': { 'gentle': 15, 'moderate': 20, 'walking': 10 },
      'moderate': { 'moderate': 20, 'balanced': 15, 'varied': 10 },
      'active': { 'energetic': 20, 'challenging': 15, 'dynamic': 10 },
      'athletic': { 'intense': 20, 'performance': 15, 'advanced': 10 }
    }
    
    const exerciseAlignments_ = exerciseAlignments[exerciseLevel] || {}
    let compatibility = 0
    
    if (remedy.category.includes('Gentle') && exerciseAlignments_['gentle']) compatibility += exerciseAlignments_['gentle']
    if (remedy.category.includes('Moderate') && exerciseAlignments_['moderate']) compatibility += exerciseAlignments_['moderate']
    if (remedy.category.includes('Energetic') && exerciseAlignments_['energetic']) compatibility += exerciseAlignments_['energetic']
    if (remedy.category.includes('Intense') && exerciseAlignments_['intense']) compatibility += exerciseAlignments_['intense']
    
    return compatibility
  }
  
  private getSleepCompatibility(remedy: ComprehensiveRemedy, sleepPattern: string): number {
    const sleepAlignments: { [key: string]: { [key: string]: number } } = {
      'early_bird': { 'morning': 20, 'energizing': 15, 'sunrise': 10 },
      'night_owl': { 'evening': 20, 'calming': 15, 'moon': 10 },
      'regular': { 'balanced': 20, 'consistent': 15, 'routine': 10 },
      'irregular': { 'flexible': 20, 'adaptable': 15, 'portable': 10 }
    }
    
    const sleepAlignments_ = sleepAlignments[sleepPattern] || {}
    let compatibility = 0
    
    if (remedy.category.includes('Morning') && sleepAlignments_['morning']) compatibility += sleepAlignments_['morning']
    if (remedy.category.includes('Evening') && sleepAlignments_['evening']) compatibility += sleepAlignments_['evening']
    if (remedy.category.includes('Balanced') && sleepAlignments_['balanced']) compatibility += sleepAlignments_['balanced']
    if (remedy.category.includes('Flexible') && sleepAlignments_['flexible']) compatibility += sleepAlignments_['flexible']
    
    return compatibility
  }
  
  private getStressCompatibility(remedy: ComprehensiveRemedy, stressLevel: string): number {
    const stressAlignments: { [key: string]: { [key: string]: number } } = {
      'low': { 'maintenance': 20, 'prevention': 15, 'enhancement': 10 },
      'moderate': { 'balance': 20, 'support': 15, 'stress-management': 10 },
      'high': { 'stress-relief': 20, 'calming': 15, 'grounding': 10 },
      'extreme': { 'emergency': 20, 'immediate-relief': 15, 'crisis-support': 10 }
    }
    
    const stressAlignments_ = stressAlignments[stressLevel] || {}
    let compatibility = 0
    
    if (remedy.category.includes('Stress-relief') && stressAlignments_['stress-relief']) compatibility += stressAlignments_['stress-relief']
    if (remedy.category.includes('Calming') && stressAlignments_['calming']) compatibility += stressAlignments_['calming']
    if (remedy.category.includes('Balance') && stressAlignments_['balance']) compatibility += stressAlignments_['balance']
    if (remedy.category.includes('Emergency') && stressAlignments_['emergency']) compatibility += stressAlignments_['emergency']
    
    return compatibility
  }
  
  private getMeditationCompatibility(remedy: ComprehensiveRemedy, meditationExperience: string): number {
    const meditationAlignments: { [key: string]: { [key: string]: number } } = {
      'none': { 'beginner': 20, 'simple': 15, 'guided': 10 },
      'beginner': { 'beginner': 15, 'intermediate': 20, 'guided': 10 },
      'intermediate': { 'intermediate': 20, 'advanced': 15, 'self-guided': 10 },
      'advanced': { 'advanced': 20, 'expert': 15, 'intensive': 10 }
    }
    
    const meditationAlignments_ = meditationAlignments[meditationExperience] || {}
    let compatibility = 0
    
    if (remedy.category.includes('Beginner') && meditationAlignments_['beginner']) compatibility += meditationAlignments_['beginner']
    if (remedy.category.includes('Intermediate') && meditationAlignments_['intermediate']) compatibility += meditationAlignments_['intermediate']
    if (remedy.category.includes('Advanced') && meditationAlignments_['advanced']) compatibility += meditationAlignments_['advanced']
    if (remedy.category.includes('Expert') && meditationAlignments_['expert']) compatibility += meditationAlignments_['expert']
    
    return compatibility
  }
  
  // ============================================================================
  // CONTEXTUAL PERSONALIZATION
  // ============================================================================
  
  calculateContextualRelevance(remedy: ComprehensiveRemedy): number {
    let relevance = 50 // Base relevance
    
    // Time-based adjustments
    relevance += this.getTimeBasedRelevance(remedy, this.context.timeOfDay)
    
    // Lunar phase adjustments
    relevance += this.getLunarRelevance(remedy, this.context.lunarPhase)
    
    // Seasonal adjustments
    relevance += this.getSeasonalRelevance(remedy, this.context.seasonalContext)
    
    // Emotional state adjustments
    relevance += this.getEmotionalRelevance(remedy, this.context.emotionalState)
    
    // Physical state adjustments
    relevance += this.getPhysicalRelevance(remedy, this.context.physicalState)
    
    return Math.max(0, Math.min(100, relevance))
  }
  
  private getTimeBasedRelevance(remedy: ComprehensiveRemedy, timeOfDay: string): number {
    const timeAlignments: { [key: string]: { [key: string]: number } } = {
      'morning': { 'energizing': 20, 'focus': 15, 'productivity': 10 },
      'afternoon': { 'balance': 20, 'sustained': 15, 'social': 10 },
      'evening': { 'calming': 20, 'reflection': 15, 'preparation': 10 },
      'night': { 'sleep': 20, 'dreaming': 15, 'restoration': 10 }
    }
    
    const timeAlignments_ = timeAlignments[timeOfDay] || {}
    let relevance = 0
    
    if (remedy.category.includes('Energizing') && timeAlignments_['energizing']) relevance += timeAlignments_['energizing']
    if (remedy.category.includes('Calming') && timeAlignments_['calming']) relevance += timeAlignments_['calming']
    if (remedy.category.includes('Balance') && timeAlignments_['balance']) relevance += timeAlignments_['balance']
    if (remedy.category.includes('Sleep') && timeAlignments_['sleep']) relevance += timeAlignments_['sleep']
    
    return relevance
  }
  
  private getLunarRelevance(remedy: ComprehensiveRemedy, lunarPhase: string): number {
    const lunarAlignments: { [key: string]: { [key: string]: number } } = {
      'new_moon': { 'new_beginnings': 20, 'intention': 15, 'manifestation': 10 },
      'waxing_crescent': { 'growth': 20, 'development': 15, 'building': 10 },
      'first_quarter': { 'action': 20, 'decision': 15, 'momentum': 10 },
      'waxing_gibbous': { 'refinement': 20, 'perfection': 15, 'preparation': 10 },
      'full_moon': { 'completion': 20, 'illumination': 15, 'celebration': 10 },
      'waning_gibbous': { 'gratitude': 20, 'sharing': 15, 'teaching': 10 },
      'last_quarter': { 'release': 20, 'forgiveness': 15, 'letting_go': 10 },
      'waning_crescent': { 'rest': 20, 'reflection': 15, 'surrender': 10 }
    }
    
    const lunarAlignments_ = lunarAlignments[lunarPhase] || {}
    let relevance = 0
    
    if (remedy.category.includes('New Beginnings') && lunarAlignments_['new_beginnings']) relevance += lunarAlignments_['new_beginnings']
    if (remedy.category.includes('Growth') && lunarAlignments_['growth']) relevance += lunarAlignments_['growth']
    if (remedy.category.includes('Completion') && lunarAlignments_['completion']) relevance += lunarAlignments_['completion']
    if (remedy.category.includes('Release') && lunarAlignments_['release']) relevance += lunarAlignments_['release']
    
    return relevance
  }
  
  private getSeasonalRelevance(remedy: ComprehensiveRemedy, seasonalContext: string): number {
    const seasonalAlignments: { [key: string]: { [key: string]: number } } = {
      'spring': { 'renewal': 20, 'growth': 15, 'planting': 10 },
      'summer': { 'abundance': 20, 'energy': 15, 'celebration': 10 },
      'autumn': { 'harvest': 20, 'reflection': 15, 'preparation': 10 },
      'winter': { 'rest': 20, 'introspection': 15, 'planning': 10 }
    }
    
    const seasonalAlignments_ = seasonalAlignments[seasonalContext] || {}
    let relevance = 0
    
    if (remedy.category.includes('Renewal') && seasonalAlignments_['renewal']) relevance += seasonalAlignments_['renewal']
    if (remedy.category.includes('Abundance') && seasonalAlignments_['abundance']) relevance += seasonalAlignments_['abundance']
    if (remedy.category.includes('Harvest') && seasonalAlignments_['harvest']) relevance += seasonalAlignments_['harvest']
    if (remedy.category.includes('Rest') && seasonalAlignments_['rest']) relevance += seasonalAlignments_['rest']
    
    return relevance
  }
  
  private getEmotionalRelevance(remedy: ComprehensiveRemedy, emotionalState: any): number {
    const emotionalAlignments: { [key: string]: { [key: string]: number } } = {
      'stressed': { 'calming': 20, 'grounding': 15, 'stress-relief': 10 },
      'calm': { 'maintenance': 20, 'enhancement': 15, 'growth': 10 },
      'energetic': { 'channeling': 20, 'focus': 15, 'productivity': 10 },
      'tired': { 'energizing': 20, 'restoration': 15, 'gentle': 10 },
      'focused': { 'amplification': 20, 'achievement': 15, 'success': 10 },
      'scattered': { 'centering': 20, 'clarity': 15, 'organization': 10 }
    }
    
    const emotionalAlignments_ = emotionalAlignments[emotionalState.primary] || {}
    let relevance = 0
    
    if (remedy.category.includes('Calming') && emotionalAlignments_['calming']) relevance += emotionalAlignments_['calming']
    if (remedy.category.includes('Energizing') && emotionalAlignments_['energizing']) relevance += emotionalAlignments_['energizing']
    if (remedy.category.includes('Focus') && emotionalAlignments_['focus']) relevance += emotionalAlignments_['focus']
    if (remedy.category.includes('Centering') && emotionalAlignments_['centering']) relevance += emotionalAlignments_['centering']
    
    return relevance
  }
  
  private getPhysicalRelevance(remedy: ComprehensiveRemedy, physicalState: any): number {
    let relevance = 0
    
    // Energy level adjustments
    if (physicalState.energy < 3) {
      if (remedy.category.includes('Energizing') || remedy.category.includes('Restoration')) relevance += 20
      if (remedy.category.includes('Intense') || remedy.category.includes('Demanding')) relevance -= 15
    } else if (physicalState.energy > 7) {
      if (remedy.category.includes('Calming') || remedy.category.includes('Grounding')) relevance += 20
      if (remedy.category.includes('Stimulating') || remedy.category.includes('Energizing')) relevance -= 15
    }
    
    // Stress level adjustments
    if (physicalState.stress > 7) {
      if (remedy.category.includes('Stress-relief') || remedy.category.includes('Calming')) relevance += 20
      if (remedy.category.includes('Stimulating') || remedy.category.includes('Intense')) relevance -= 15
    }
    
    return relevance
  }
  
  // ============================================================================
  // HISTORICAL EFFECTIVENESS PREDICTION
  // ============================================================================
  
  predictEffectiveness(remedy: ComprehensiveRemedy): number {
    let effectiveness = 50 // Base effectiveness
    
    // Historical success patterns
    effectiveness += this.getHistoricalEffectiveness(remedy)
    
    // Similar remedy success
    effectiveness += this.getSimilarRemedyEffectiveness(remedy)
    
    // User preference patterns
    effectiveness += this.getPreferenceEffectiveness(remedy)
    
    return Math.max(0, Math.min(100, effectiveness))
  }
  
  private getHistoricalEffectiveness(remedy: ComprehensiveRemedy): number {
    if (!this.userProfile.pastRemedies || this.userProfile.pastRemedies.length === 0) {
      return 0
    }
    
    // Find similar remedies in history
    const similarRemedies = this.userProfile.pastRemedies.filter(pastRemedy => {
      // This would need to be implemented with actual remedy similarity logic
      return pastRemedy.remedyId.includes(remedy.system) || 
             pastRemedy.remedyId.includes(remedy.category)
    })
    
    if (similarRemedies.length === 0) {
      return 0
    }
    
    // Calculate average effectiveness
    const totalEffectiveness = similarRemedies.reduce((sum, pastRemedy) => {
      return sum + pastRemedy.effectiveness
    }, 0)
    
    return totalEffectiveness / similarRemedies.length - 50 // Normalize to -50 to +50 range
  }
  
  private getSimilarRemedyEffectiveness(remedy: ComprehensiveRemedy): number {
    // This would analyze remedies with similar characteristics
    // For now, return a neutral score
    return 0
  }
  
  private getPreferenceEffectiveness(remedy: ComprehensiveRemedy): number {
    // This would analyze user preferences and patterns
    // For now, return a neutral score
    return 0
  }
  
  // ============================================================================
  // COMPREHENSIVE PERSONALIZATION SCORE
  // ============================================================================
  
  calculateComprehensiveScore(remedy: ComprehensiveRemedy): PersonalizationFactors {
    const personalityAlignment = this.calculatePersonalityAlignment(remedy)
    const lifestyleFit = this.calculateLifestyleFit(remedy)
    const contextualRelevance = this.calculateContextualRelevance(remedy)
    const predictedEffectiveness = this.predictEffectiveness(remedy)
    
    // Calculate composite scores
    const remedyCompatibility = (personalityAlignment + lifestyleFit) / 2
    const timingOptimality = contextualRelevance
    const resourceAlignment = this.calculateResourceAlignment(remedy)
    const lifestyleFit_ = lifestyleFit
    const culturalRelevance = this.calculateCulturalRelevance(remedy)
    
    // Calculate effectiveness predictors
    const adherenceLikelihood = this.calculateAdherenceLikelihood(remedy)
    const sideEffectRisk = this.calculateSideEffectRisk(remedy)
    const longTermBenefit = this.calculateLongTermBenefit(remedy)
    
    // Calculate personalization modifiers
    const intensityModifier = this.calculateIntensityModifier(remedy)
    const durationModifier = this.calculateDurationModifier(remedy)
    const frequencyModifier = this.calculateFrequencyModifier(remedy)
    const costModifier = this.calculateCostModifier(remedy)
    const difficultyModifier = this.calculateDifficultyModifier(remedy)
    
    return {
      remedyCompatibility,
      timingOptimality,
      resourceAlignment,
      lifestyleFit: lifestyleFit_,
      culturalRelevance,
      predictedEffectiveness,
      adherenceLikelihood,
      sideEffectRisk,
      longTermBenefit,
      intensityModifier,
      durationModifier,
      frequencyModifier,
      costModifier,
      difficultyModifier
    }
  }
  
  // Helper methods for comprehensive scoring
  private calculateResourceAlignment(remedy: ComprehensiveRemedy): number {
    // This would check if the remedy aligns with user's available resources
    return 75 // Placeholder
  }
  
  private calculateCulturalRelevance(remedy: ComprehensiveRemedy): number {
    // This would check cultural compatibility
    return 80 // Placeholder
  }
  
  private calculateAdherenceLikelihood(remedy: ComprehensiveRemedy): number {
    // This would predict how likely the user is to follow through
    return 70 // Placeholder
  }
  
  private calculateSideEffectRisk(remedy: ComprehensiveRemedy): number {
    // This would assess potential side effects
    return 20 // Placeholder (low risk)
  }
  
  private calculateLongTermBenefit(remedy: ComprehensiveRemedy): number {
    // This would assess long-term benefits
    return 85 // Placeholder
  }
  
  private calculateIntensityModifier(remedy: ComprehensiveRemedy): number {
    // This would adjust intensity based on user profile
    return 1.0 // Placeholder (no modification)
  }
  
  private calculateDurationModifier(remedy: ComprehensiveRemedy): number {
    // This would adjust duration based on user profile
    return 1.0 // Placeholder (no modification)
  }
  
  private calculateFrequencyModifier(remedy: ComprehensiveRemedy): number {
    // This would adjust frequency based on user profile
    return 1.0 // Placeholder (no modification)
  }
  
  private calculateCostModifier(remedy: ComprehensiveRemedy): number {
    // This would adjust cost recommendations based on user budget
    return 1.0 // Placeholder (no modification)
  }
  
  private calculateDifficultyModifier(remedy: ComprehensiveRemedy): number {
    // This would adjust difficulty based on user experience
    return 1.0 // Placeholder (no modification)
  }
}

export default AdvancedPersonalizationEngine 