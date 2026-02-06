// Intelligent Astrological Coaching System
// Acts as a personalized trainer using comprehensive astrological insights

import { ComprehensiveAstroData } from './astroDataService'

interface CoachingContext {
  userId: string
  astroData: ComprehensiveAstroData
  userQuery: string
  currentMood?: string
  currentChallenges?: string[]
  goals?: string[]
  recentEvents?: string[]
}

interface CoachingResponse {
  guidance: string
  suggestions: string[]
  insights: string[]
  actionableSteps: string[]
  encouragement: string
  relatedTopics: string[]
  confidence: number
  personalization: string
}

interface PersonalityProfile {
  dominantElement: string
  dominantModality: string
  keyStrengths: string[]
  growthAreas: string[]
  communicationStyle: string
  motivationStyle: string
  stressTriggers: string[]
  copingStrategies: string[]
}

export class AstroCoach {
  private coachingTemplates = {
    encouragement: [
      "Your {element} energy gives you incredible {strength}. Trust this power within you.",
      "With your {modality} nature, you have the perfect approach for this situation.",
      "Your {planet} in {sign} shows you're naturally equipped for this challenge.",
      "The stars align with your {strength} - this is your moment to shine."
    ],
    
    guidance: [
      "Given your {element} dominance, I'd suggest focusing on {approach}.",
      "Your {modality} energy thrives when you {strategy}.",
      "With {planet} in {sign}, you'll find success by {method}.",
      "Your chart shows this is a perfect time to {action}."
    ],
    
    insights: [
      "Your {element} nature means you naturally {trait}.",
      "The {planet} influence in your chart suggests {insight}.",
      "Your {modality} approach is actually your superpower here.",
      "This challenge aligns with your {strength} - it's growth in disguise."
    ]
  }

  // Main coaching method
  async provideCoaching(context: CoachingContext): Promise<CoachingResponse> {
    console.log('🧠 AstroCoach: Providing personalized coaching for user:', context.userId)
    
    const personalityProfile = this.analyzePersonality(context.astroData)
    const currentTransits = this.analyzeCurrentTransits(context.astroData)
    const lifeThemes = this.identifyLifeThemes(context.astroData)
    
    // Generate personalized coaching response
    const response = await this.generatePersonalizedResponse(
      context,
      personalityProfile,
      currentTransits,
      lifeThemes
    )
    
    return response
  }

  // Analyze user's personality from astrological data
  private analyzePersonality(astroData: ComprehensiveAstroData): PersonalityProfile {
    const elements = astroData.elements
    const modalities = astroData.modalities
    const planets = astroData.planets
    const aspects = astroData.aspects
    
    // Determine dominant element
    const dominantElement = Object.entries(elements).reduce((a, b) => 
      elements[a[0] as keyof typeof elements] > elements[b[0] as keyof typeof elements] ? a : b
    )[0]
    
    // Determine dominant modality
    const dominantModality = Object.entries(modalities).reduce((a, b) => 
      modalities[a[0] as keyof typeof modalities] > modalities[b[0] as keyof typeof modalities] ? a : b
    )[0]
    
    // Analyze key strengths
    const keyStrengths = this.identifyStrengths(planets, aspects, dominantElement, dominantModality)
    
    // Identify growth areas
    const growthAreas = this.identifyGrowthAreas(planets, aspects, dominantElement, dominantModality)
    
    // Determine communication style
    const communicationStyle = this.determineCommunicationStyle(planets, dominantElement)
    
    // Determine motivation style
    const motivationStyle = this.determineMotivationStyle(planets, dominantModality)
    
    // Identify stress triggers
    const stressTriggers = this.identifyStressTriggers(planets, aspects)
    
    // Suggest coping strategies
    const copingStrategies = this.suggestCopingStrategies(stressTriggers, dominantElement)
    
    return {
      dominantElement,
      dominantModality,
      keyStrengths,
      growthAreas,
      communicationStyle,
      motivationStyle,
      stressTriggers,
      copingStrategies
    }
  }

  // Identify user's key strengths
  private identifyStrengths(planets: any[], aspects: any[], element: string, modality: string): string[] {
    const strengths: string[] = []
    
    // Element-based strengths
    const elementStrengths = {
      fire: ['passion', 'creativity', 'leadership', 'courage', 'enthusiasm'],
      earth: ['practicality', 'reliability', 'patience', 'determination', 'stability'],
      air: ['intellect', 'communication', 'adaptability', 'curiosity', 'social skills'],
      water: ['intuition', 'empathy', 'emotional depth', 'nurturing', 'psychic abilities']
    }
    
    strengths.push(...elementStrengths[element as keyof typeof elementStrengths])
    
    // Modality-based strengths
    const modalityStrengths = {
      cardinal: ['initiative', 'leadership', 'pioneering spirit', 'ambition'],
      fixed: ['determination', 'loyalty', 'consistency', 'endurance'],
      mutable: ['adaptability', 'versatility', 'open-mindedness', 'flexibility']
    }
    
    strengths.push(...modalityStrengths[modality as keyof typeof modalityStrengths])
    
    // Planet-based strengths
    planets.forEach(planet => {
      const planetStrengths = this.getPlanetStrengths(planet.name, planet.sign)
      strengths.push(...planetStrengths)
    })
    
    // Aspect-based strengths
    aspects.forEach(aspect => {
      if (aspect.type === 'Trine' || aspect.type === 'Sextile') {
        strengths.push(`harmonious ${aspect.planet1}-${aspect.planet2} energy`)
      }
    })
    
    return [...new Set(strengths)].slice(0, 8) // Return top 8 unique strengths
  }

  // Identify growth areas
  private identifyGrowthAreas(planets: any[], aspects: any[], element: string, modality: string): string[] {
    const growthAreas: string[] = []
    
    // Element-based growth areas
    const elementGrowth = {
      fire: ['patience', 'listening', 'detail orientation', 'emotional balance'],
      earth: ['spontaneity', 'risk-taking', 'emotional expression', 'flexibility'],
      air: ['grounding', 'emotional depth', 'patience', 'practical application'],
      water: ['boundaries', 'practicality', 'logic', 'assertiveness']
    }
    
    growthAreas.push(...elementGrowth[element as keyof typeof elementGrowth])
    
    // Modality-based growth areas
    const modalityGrowth = {
      cardinal: ['patience', 'listening', 'collaboration', 'flexibility'],
      fixed: ['adaptability', 'openness to change', 'compromise', 'flexibility'],
      mutable: ['focus', 'consistency', 'follow-through', 'decision-making']
    }
    
    growthAreas.push(...modalityGrowth[modality as keyof typeof modalityGrowth])
    
    // Challenging aspects
    aspects.forEach(aspect => {
      if (aspect.type === 'Square' || aspect.type === 'Opposition') {
        growthAreas.push(`balancing ${aspect.planet1} and ${aspect.planet2} energies`)
      }
    })
    
    return [...new Set(growthAreas)].slice(0, 6) // Return top 6 unique growth areas
  }

  // Determine communication style
  private determineCommunicationStyle(planets: any[], element: string): string {
    const mercury = planets.find(p => p.name === 'Mercury')
    const venus = planets.find(p => p.name === 'Venus')
    
    if (mercury && venus) {
      const styles = {
        fire: 'direct and passionate',
        earth: 'practical and clear',
        air: 'intellectual and engaging',
        water: 'empathetic and intuitive'
      }
      return styles[element as keyof typeof styles]
    }
    
    return 'authentic and personal'
  }

  // Determine motivation style
  private determineMotivationStyle(planets: any[], modality: string): string {
    const mars = planets.find(p => p.name === 'Mars')
    const saturn = planets.find(p => p.name === 'Saturn')
    
    const styles = {
      cardinal: 'goal-oriented and ambitious',
      fixed: 'determined and persistent',
      mutable: 'adaptable and growth-focused'
    }
    
    return styles[modality as keyof typeof styles]
  }

  // Identify stress triggers
  private identifyStressTriggers(planets: any[], aspects: any[]): string[] {
    const triggers: string[] = []
    
    // Saturn aspects often indicate stress areas
    aspects.forEach(aspect => {
      if (aspect.planet1 === 'Saturn' || aspect.planet2 === 'Saturn') {
        triggers.push(`pressure around ${aspect.planet1 === 'Saturn' ? aspect.planet2 : aspect.planet1} matters`)
      }
    })
    
    // Mars aspects can indicate conflict areas
    aspects.forEach(aspect => {
      if (aspect.planet1 === 'Mars' || aspect.planet2 === 'Mars') {
        triggers.push(`conflict in ${aspect.planet1 === 'Mars' ? aspect.planet2 : aspect.planet1} areas`)
      }
    })
    
    return triggers.length > 0 ? triggers : ['unexpected changes', 'lack of control', 'perfectionism']
  }

  // Suggest coping strategies
  private suggestCopingStrategies(triggers: string[], element: string): string[] {
    const strategies: string[] = []
    
    const elementStrategies = {
      fire: ['physical exercise', 'creative expression', 'goal-setting', 'leadership activities'],
      earth: ['grounding exercises', 'practical planning', 'nature connection', 'routine building'],
      air: ['intellectual stimulation', 'social connection', 'learning new things', 'communication'],
      water: ['emotional processing', 'meditation', 'creative outlets', 'nurturing activities']
    }
    
    strategies.push(...elementStrategies[element as keyof typeof elementStrategies])
    
    return strategies
  }

  // Analyze current transits
  private analyzeCurrentTransits(astroData: ComprehensiveAstroData) {
    const transits = astroData.currentTransits || []
    
    return {
      activeTransits: transits,
      majorInfluences: transits.filter(t => t.orb < 3),
      opportunities: transits.filter(t => (t as { type?: string }).type === 'Trine' || (t as { type?: string }).type === 'Sextile'),
      challenges: transits.filter(t => (t as { type?: string }).type === 'Square' || (t as { type?: string }).type === 'Opposition')
    }
  }

  // Identify life themes
  private identifyLifeThemes(astroData: ComprehensiveAstroData) {
    const themes: string[] = []
    
    // Sun sign themes
    const sunThemes = this.getSunSignThemes(astroData.sunSign)
    themes.push(sunThemes)
    
    // Life path themes
    if (astroData.lifePath) {
      themes.push('personal growth and transformation')
    }
    
    // House themes
    const houseThemes = this.getHouseThemes(astroData.houses)
    themes.push(...houseThemes)
    
    return themes
  }

  // Get sun sign themes
  private getSunSignThemes(sunSign: string): string {
    const themes: { [key: string]: string } = {
      'Aries': 'leadership and pioneering',
      'Taurus': 'stability and material mastery',
      'Gemini': 'communication and learning',
      'Cancer': 'nurturing and emotional security',
      'Leo': 'creativity and self-expression',
      'Virgo': 'service and perfection',
      'Libra': 'harmony and relationships',
      'Scorpio': 'transformation and depth',
      'Sagittarius': 'expansion and wisdom',
      'Capricorn': 'achievement and structure',
      'Aquarius': 'innovation and humanitarianism',
      'Pisces': 'spirituality and compassion'
    }
    
    return themes[sunSign] || 'personal development'
  }

  // Get house themes
  private getHouseThemes(houses: any[]): string[] {
    const themes: string[] = []
    
    houses.forEach(house => {
      const houseThemes: { [key: number]: string } = {
        1: 'self-identity and personal expression',
        2: 'values and material resources',
        3: 'communication and learning',
        4: 'home and emotional foundation',
        5: 'creativity and romance',
        6: 'work and service',
        7: 'partnerships and relationships',
        8: 'transformation and shared resources',
        9: 'higher learning and expansion',
        10: 'career and public image',
        11: 'friendships and community',
        12: 'spirituality and subconscious'
      }
      
      if (houseThemes[house.number]) {
        themes.push(houseThemes[house.number])
      }
    })
    
    return themes.slice(0, 3) // Return top 3 themes
  }

  // Get planet strengths
  private getPlanetStrengths(planetName: string, sign: string): string[] {
    const strengths: { [key: string]: string[] } = {
      'Sun': ['leadership', 'vitality', 'self-expression', 'confidence'],
      'Moon': ['intuition', 'emotional intelligence', 'nurturing', 'empathy'],
      'Mercury': ['communication', 'intelligence', 'adaptability', 'learning'],
      'Venus': ['harmony', 'beauty', 'relationships', 'artistic talent'],
      'Mars': ['courage', 'action', 'energy', 'determination'],
      'Jupiter': ['wisdom', 'optimism', 'expansion', 'generosity'],
      'Saturn': ['discipline', 'responsibility', 'structure', 'perseverance'],
      'Uranus': ['innovation', 'originality', 'independence', 'vision'],
      'Neptune': ['intuition', 'compassion', 'creativity', 'spirituality'],
      'Pluto': ['transformation', 'power', 'depth', 'regeneration']
    }
    
    return strengths[planetName] || ['unique energy', 'personal power']
  }

  // Generate personalized coaching response
  private async generatePersonalizedResponse(
    context: CoachingContext,
    personality: PersonalityProfile,
    transits: any,
    themes: string[]
  ): Promise<CoachingResponse> {
    
    const query = context.userQuery.toLowerCase()
    const guidance = this.generateGuidance(query, personality, transits, themes)
    const suggestions = this.generateSuggestions(query, personality, transits)
    const insights = this.generateInsights(query, personality, context.astroData)
    const actionableSteps = this.generateActionableSteps(query, personality, transits)
    const encouragement = this.generateEncouragement(personality, context.astroData)
    const relatedTopics = this.generateRelatedTopics(query, themes)
    
    return {
      guidance,
      suggestions,
      insights,
      actionableSteps,
      encouragement,
      relatedTopics,
      confidence: 0.92,
      personalization: `Based on your ${personality.dominantElement} nature and ${personality.dominantModality} approach`
    }
  }

  // Generate personalized guidance
  private generateGuidance(query: string, personality: PersonalityProfile, transits: any, themes: string[]): string {
    const element = personality.dominantElement
    const modality = personality.dominantModality
    const strengths = personality.keyStrengths
    
    if (query.includes('career') || query.includes('work') || query.includes('job')) {
      return `Your ${element} energy combined with your ${modality} nature makes you a natural ${strengths[0]}. Focus on roles that let you ${strengths[1]} and ${strengths[2]}. Your chart shows this is a powerful time for career advancement.`
    }
    
    if (query.includes('relationship') || query.includes('love') || query.includes('partner')) {
      return `With your ${personality.communicationStyle} communication style, you naturally ${strengths[0]}. In relationships, focus on ${strengths[1]} while also developing your ${personality.growthAreas[0]}. Your ${element} nature needs ${this.getElementRelationshipNeeds(element)}.`
    }
    
    if (query.includes('stress') || query.includes('anxiety') || query.includes('overwhelm')) {
      return `Your ${element} nature can be sensitive to ${personality.stressTriggers[0]}. Try ${personality.copingStrategies[0]} and ${personality.copingStrategies[1]} to ground your energy. Your ${modality} approach means you thrive with ${this.getModalityStressRelief(modality)}.`
    }
    
    if (query.includes('goal') || query.includes('dream') || query.includes('aspiration')) {
      return `Your ${modality} energy is perfect for achieving goals. Use your ${strengths[0]} and ${strengths[1]} to ${personality.motivationStyle}. The current transits support your ${themes[0]} journey.`
    }
    
    return `Your ${element} nature and ${modality} approach give you unique strengths. Focus on ${strengths[0]} and ${strengths[1]} while developing your ${personality.growthAreas[0]}. Trust your natural ${personality.communicationStyle} style.`
  }

  // Generate personalized suggestions
  private generateSuggestions(query: string, personality: PersonalityProfile, transits: any): string[] {
    const suggestions: string[] = []
    const element = personality.dominantElement
    const modality = personality.dominantModality
    
    if (query.includes('career') || query.includes('work')) {
      suggestions.push(`Leverage your ${element} energy in leadership roles`)
      suggestions.push(`Use your ${modality} nature for strategic planning`)
      suggestions.push(`Focus on industries that value ${personality.keyStrengths[0]}`)
      suggestions.push(`Develop your ${personality.growthAreas[0]} for career growth`)
    }
    
    if (query.includes('relationship') || query.includes('love')) {
      suggestions.push(`Express your ${element} nature authentically in relationships`)
      suggestions.push(`Use your ${personality.communicationStyle} communication style`)
      suggestions.push(`Practice ${personality.growthAreas[0]} for better connections`)
      suggestions.push(`Focus on partners who appreciate your ${personality.keyStrengths[0]}`)
    }
    
    if (query.includes('stress') || query.includes('anxiety')) {
      suggestions.push(`Try ${personality.copingStrategies[0]} for immediate relief`)
      suggestions.push(`Practice ${personality.copingStrategies[1]} regularly`)
      suggestions.push(`Avoid ${personality.stressTriggers[0]} when possible`)
      suggestions.push(`Use your ${modality} nature to create stability`)
    }
    
    // Add general suggestions
    suggestions.push(`Embrace your ${element} energy in daily activities`)
    suggestions.push(`Use your ${modality} approach for long-term success`)
    suggestions.push(`Develop your ${personality.growthAreas[0]} for personal growth`)
    
    return suggestions.slice(0, 4) // Return top 4 suggestions
  }

  // Generate personalized insights
  private generateInsights(query: string, personality: PersonalityProfile, astroData: ComprehensiveAstroData): string[] {
    const insights: string[] = []
    
    insights.push(`Your ${personality.dominantElement} nature means you naturally ${personality.keyStrengths[0]}`)
    insights.push(`With ${personality.dominantModality} energy, you excel at ${personality.keyStrengths[1]}`)
    insights.push(`Your ${astroData.sunSign} sun sign gives you ${this.getSunSignInsight(astroData.sunSign)}`)
    insights.push(`The ${astroData.moonSign} moon in your chart shows ${this.getMoonSignInsight(astroData.moonSign)}`)
    
    return insights
  }

  // Generate actionable steps
  private generateActionableSteps(query: string, personality: PersonalityProfile, transits: any): string[] {
    const steps: string[] = []
    
    steps.push(`Practice ${personality.copingStrategies[0]} for 10 minutes daily`)
    steps.push(`Focus on developing your ${personality.growthAreas[0]} this week`)
    steps.push(`Use your ${personality.keyStrengths[0]} in a new situation`)
    steps.push(`Express your ${personality.dominantElement} energy through ${this.getElementActivity(personality.dominantElement)}`)
    
    return steps
  }

  // Generate encouragement
  private generateEncouragement(personality: PersonalityProfile, astroData: ComprehensiveAstroData): string {
    const element = personality.dominantElement
    const strength = personality.keyStrengths[0]
    const sign = astroData.sunSign
    
    return `Your ${element} energy combined with your ${sign} nature gives you incredible ${strength}. Trust this power within you - you're naturally equipped for whatever challenges come your way. Your ${personality.dominantModality} approach means you have the perfect strategy for success.`
  }

  // Generate related topics
  private generateRelatedTopics(query: string, themes: string[]): string[] {
    const topics: string[] = []
    
    if (query.includes('career')) {
      topics.push('Personal Branding', 'Leadership Development', 'Skill Enhancement', 'Networking')
    } else if (query.includes('relationship')) {
      topics.push('Communication Skills', 'Emotional Intelligence', 'Boundary Setting', 'Self-Love')
    } else if (query.includes('stress')) {
      topics.push('Mindfulness', 'Work-Life Balance', 'Self-Care', 'Resilience Building')
    } else {
      topics.push(...themes.slice(0, 3))
      topics.push('Personal Growth', 'Life Purpose')
    }
    
    return topics
  }

  // Helper methods
  private getElementRelationshipNeeds(element: string): string {
    const needs = {
      fire: 'passion and excitement',
      earth: 'stability and security',
      air: 'intellectual connection and space',
      water: 'emotional depth and understanding'
    }
    return needs[element as keyof typeof needs]
  }

  private getModalityStressRelief(modality: string): string {
    const relief = {
      cardinal: 'clear goals and action plans',
      fixed: 'routine and consistency',
      mutable: 'flexibility and adaptation'
    }
    return relief[modality as keyof typeof relief]
  }

  private getSunSignInsight(sunSign: string): string {
    const insights: { [key: string]: string } = {
      'Aries': 'natural leadership abilities',
      'Taurus': 'practical wisdom and determination',
      'Gemini': 'versatile communication skills',
      'Cancer': 'deep emotional intelligence',
      'Leo': 'creative self-expression',
      'Virgo': 'attention to detail and service',
      'Libra': 'natural diplomacy and harmony',
      'Scorpio': 'transformative power and depth',
      'Sagittarius': 'philosophical wisdom and optimism',
      'Capricorn': 'ambition and practical achievement',
      'Aquarius': 'innovative thinking and humanitarianism',
      'Pisces': 'spiritual insight and compassion'
    }
    return insights[sunSign] || 'unique personal qualities'
  }

  private getMoonSignInsight(moonSign: string): string {
    const insights: { [key: string]: string } = {
      'Aries': 'emotional courage and independence',
      'Taurus': 'emotional stability and patience',
      'Gemini': 'emotional curiosity and adaptability',
      'Cancer': 'nurturing emotional nature',
      'Leo': 'emotional creativity and warmth',
      'Virgo': 'emotional precision and care',
      'Libra': 'emotional harmony and balance',
      'Scorpio': 'emotional depth and intensity',
      'Sagittarius': 'emotional optimism and freedom',
      'Capricorn': 'emotional discipline and responsibility',
      'Aquarius': 'emotional independence and innovation',
      'Pisces': 'emotional sensitivity and intuition'
    }
    return insights[moonSign] || 'unique emotional qualities'
  }

  private getElementActivity(element: string): string {
    const activities = {
      fire: 'creative projects or physical exercise',
      earth: 'gardening or practical planning',
      air: 'learning new skills or social activities',
      water: 'meditation or artistic expression'
    }
    return activities[element as keyof typeof activities]
  }
}

// Export singleton instance
export const astroCoach = new AstroCoach()

// Helper functions for external use
export async function getPersonalizedCoaching(
  userId: string,
  astroData: ComprehensiveAstroData,
  query: string,
  context?: Partial<CoachingContext>
): Promise<CoachingResponse> {
  const coachingContext: CoachingContext = {
    userId,
    astroData,
    userQuery: query,
    ...context
  }
  
  return astroCoach.provideCoaching(coachingContext)
}

export function analyzePersonality(astroData: ComprehensiveAstroData): PersonalityProfile {
  return astroCoach['analyzePersonality'](astroData)
} 