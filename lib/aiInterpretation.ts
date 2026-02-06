// AI Interpretation Service for Vedic Astrology
// Provides human-readable explanations of complex astrological data

import { VedicReportSchema } from '@/types/vedicReport'

export interface AIInterpretation {
  summary: string
  personality: string
  career: string
  relationships: string
  health: string
  spiritual: string
  currentPeriod: string
  recommendations: string[]
  termExplanations?: { [key: string]: string }
}

export class VedicAIInterpreter {
  
  // Generate comprehensive AI interpretation
  static async interpretVedicData(vedicData: VedicReportSchema): Promise<AIInterpretation> {
    try {
      // For now, we'll use rule-based interpretation
      // In the future, this can be replaced with actual AI model calls
      return this.generateRuleBasedInterpretation(vedicData)
    } catch (error) {
      console.error('Error interpreting Vedic data:', error)
      return this.getDefaultInterpretation()
    }
  }

  // Rule-based interpretation using real AstroApp data
  private static generateRuleBasedInterpretation(vedicData: VedicReportSchema): AIInterpretation {
    const { planetary_positions, house_analysis, personality_analysis, current_influences, dasha_forecast, nakshatra_analysis, yogas_doshas, strength_analysis } = vedicData

    // Analyze dominant planets and houses using real data
    const dominantPlanets = this.getDominantPlanets(planetary_positions ?? [])
    const strongHouses = this.getStrongHouses(house_analysis ?? [])
    const currentDasha = current_influences?.current_dasha
    const nakshatras = nakshatra_analysis || []
    const yogas = yogas_doshas?.yogas || []
    const doshas = yogas_doshas?.doshas || []

    return {
      summary: this.generateSummary(dominantPlanets, strongHouses, nakshatras, yogas),
      personality: this.generatePersonalityInterpretation(personality_analysis, dominantPlanets, nakshatras),
      career: this.generateCareerInterpretation(house_analysis ?? [], planetary_positions ?? [], yogas),
      relationships: this.generateRelationshipInterpretation(house_analysis ?? [], planetary_positions ?? [], nakshatras),
      health: this.generateHealthInterpretation(house_analysis ?? [], planetary_positions ?? [], doshas as any[]),
      spiritual: this.generateSpiritualInterpretation(house_analysis ?? [], planetary_positions ?? [], nakshatras),
      currentPeriod: this.generateCurrentPeriodInterpretation(currentDasha, (dasha_forecast ?? []) as any[]),
      recommendations: this.generateRecommendations(vedicData, yogas, doshas),
      termExplanations: this.generateTermExplanations(vedicData)
    }
  }

  private static getDominantPlanets(planets: any[]): string[] {
    if (!planets || !Array.isArray(planets)) {
      return [] // No fallback data
    }
    // Use real planetary data from AstroApp
    return planets
      .filter(p => p && p.planet && (p.shadbala > 400 || p.strength === 'strong'))
      .map(p => p.planet)
      .slice(0, 3)
  }

  private static getStrongHouses(houses: any[]): any[] {
    if (!houses || !Array.isArray(houses)) {
      return [] // Return empty array if houses is undefined
    }
    return houses.filter(h => h && h.strength === 'Strong')
  }

  private static generateSummary(dominantPlanets: string[], strongHouses: any[], nakshatras: any[], yogas: any[]): string {
    const planetNames = dominantPlanets.length > 0 ? dominantPlanets.join(', ') : 'your planetary influences'
    const houseNumbers = strongHouses.map(h => h.house).join(', ')
    const nakshatraNames = nakshatras.slice(0, 3).map(n => n.nakshatra).join(', ')
    const yogaNames = yogas.slice(0, 2).map(y => y.name).join(' and ')
    
    let summary = `Your cosmic blueprint reveals a fascinating journey shaped by ${planetNames}. `
    
    if (strongHouses.length > 0) {
      summary += `These powerful planetary influences create a unique energy pattern that affects houses ${houseNumbers}, making these areas of life particularly significant for your growth and development. `
    }
    
    if (nakshatraNames) {
      summary += `Your nakshatras (${nakshatraNames}) add unique spiritual qualities to your personality. `
    }
    
    if (yogaNames) {
      summary += `The presence of ${yogaNames} in your chart indicates special planetary combinations that enhance your life path. `
    }
    
    summary += `Your chart suggests a person with deep intuitive abilities and strong spiritual inclinations. This means you have natural gifts for understanding the deeper meaning of life and connecting with spiritual wisdom.`
    
    return summary
  }

  private static generatePersonalityInterpretation(personality: any, dominantPlanets: string[], nakshatras: any[]): string {
    if (!personality || !personality.strengths || !personality.challenges) {
      return 'Your personality analysis is being processed. Please check back later for detailed insights.'
    }
    
    const strengths = personality.strengths.slice(0, 3).join(', ')
    const challenges = personality.challenges.slice(0, 2).join(' and ')
    const nakshatraTraits = nakshatras.slice(0, 2).map(n => n.traits).join(' and ')
    
    let interpretation = `Your personality is beautifully complex, marked by ${strengths}. You possess natural leadership qualities and a deep connection to your emotional world.`
    
    if (challenges) {
      interpretation += ` However, you may sometimes struggle with ${challenges}.`
    }
    
    if (dominantPlanets.length > 0) {
      interpretation += ` Your ${dominantPlanets[0]} influence makes you highly intuitive and emotionally intelligent, allowing you to understand others deeply.`
    }
    
    if (nakshatraTraits) {
      interpretation += ` Your nakshatra characteristics include ${nakshatraTraits}, adding unique spiritual dimensions to your personality.`
    }
    
    return interpretation
  }

  private static generateCareerInterpretation(houses: any[], planets: any[], yogas: any[]): string {
    if (!houses || !Array.isArray(houses)) {
      return 'Your career analysis is being processed. Please check back later for detailed insights.'
    }
    
    const careerHouse = houses.find(h => h && h.house === 10)
    const careerPlanets = careerHouse?.planets || []
    const careerYogas = yogas.filter(y => y.type === 'positive' && y.influence.toLowerCase().includes('career'))
    
    let interpretation = ''
    
    if (careerPlanets.length > 0) {
      interpretation = `Your career path is strongly influenced by ${careerPlanets.join(' and ')} in your 10th house. This suggests success in communication-based fields, teaching, writing, or analytical professions.`
    } else if (careerHouse?.lord) {
      interpretation = `Your career house shows potential for growth in areas related to ${careerHouse.lord}. You may find success through determination and hard work, particularly in fields that allow you to express your natural talents and spiritual inclinations.`
    } else {
      interpretation = 'Your career path shows potential for growth through determination and hard work, particularly in fields that allow you to express your natural talents and spiritual inclinations.'
    }
    
    if (careerYogas.length > 0) {
      interpretation += ` The presence of ${careerYogas[0].name} in your chart indicates special career opportunities and success in your chosen field.`
    }
    
    interpretation += ' You have natural leadership abilities and may excel in positions that require both intellectual and emotional intelligence.'
    
    return interpretation
  }

  private static generateRelationshipInterpretation(houses: any[], planets: any[], nakshatras: any[]): string {
    if (!houses || !Array.isArray(houses)) {
      return 'Your relationship analysis is being processed. Please check back later for detailed insights.'
    }
    
    const relationshipHouse = houses.find(h => h.house === 7)
    const relationshipPlanets = relationshipHouse?.planets || []
    const relationshipNakshatras = nakshatras.filter(n => n.planet === 'Venus' || n.planet === 'Moon')
    
    let interpretation = ''
    
    if (relationshipPlanets.length > 0) {
      interpretation = `Your relationships are deeply influenced by ${relationshipPlanets.join(' and ')} in your 7th house. This creates a serious and committed approach to partnerships.`
    } else if (relationshipHouse?.lord) {
      interpretation = `Your relationship house is ruled by ${relationshipHouse.lord}, suggesting a ${relationshipHouse.lord.toLowerCase()} approach to partnerships.`
    } else {
      interpretation = 'Your relationship house suggests you may need to work on developing deeper connections.'
    }
    
    if (relationshipNakshatras.length > 0) {
      interpretation += ` Your Venus and Moon nakshatras (${relationshipNakshatras.map(n => n.nakshatra).join(', ')}) add unique qualities to your approach to love and relationships.`
    }
    
    interpretation += ' You value deep emotional connections and may attract partners who share your spiritual or intellectual interests.'
    
    return interpretation
  }

  private static generateHealthInterpretation(houses: any[], planets: any[], doshas: any[]): string {
    if (!houses || !Array.isArray(houses)) {
      return 'Your health analysis is being processed. Please check back later for detailed insights.'
    }
    
    const healthHouse = houses.find(h => h.house === 6)
    const healthPlanets = healthHouse?.planets || []
    const healthDoshas = doshas.filter(d => d.type === 'negative' && d.influence.toLowerCase().includes('health'))
    
    let interpretation = 'Your health is primarily influenced by your emotional and mental well-being.'
    
    if (healthPlanets.length > 0) {
      interpretation += ` The presence of ${healthPlanets.join(' and ')} in your 6th house indicates specific areas of health to focus on.`
    }
    
    if (healthDoshas.length > 0) {
      interpretation += ` Be aware of ${healthDoshas[0].name} which may affect your health if not properly managed.`
    }
    
    interpretation += ' Regular meditation and stress management will be particularly beneficial for you. Your sensitive nature means you may be more affected by environmental factors, so maintaining a peaceful and harmonious lifestyle is essential.'
    
    return interpretation
  }

  private static generateSpiritualInterpretation(houses: any[], planets: any[], nakshatras: any[]): string {
    if (!houses || !Array.isArray(houses)) {
      return 'Your spiritual analysis is being processed. Please check back later for detailed insights.'
    }
    
    const spiritualHouse = houses.find(h => h.house === 9)
    const spiritualPlanets = spiritualHouse?.planets || []
    const spiritualNakshatras = nakshatras.filter(n => n.planet === 'Jupiter' || n.planet === 'Sun')
    
    let interpretation = ''
    
    if (spiritualPlanets.length > 0) {
      interpretation = `Your spiritual journey is powerfully guided by ${spiritualPlanets.join(' and ')} in your 9th house. This creates a natural inclination toward higher learning, philosophy, and spiritual practices.`
    } else if (spiritualHouse?.lord) {
      interpretation = `Your spiritual house is ruled by ${spiritualHouse.lord}, indicating a ${spiritualHouse.lord.toLowerCase()} approach to spiritual development.`
    } else {
      interpretation = 'Your spiritual development comes through personal exploration and inner work.'
    }
    
    if (spiritualNakshatras.length > 0) {
      interpretation += ` Your Jupiter and Sun nakshatras (${spiritualNakshatras.map(n => n.nakshatra).join(', ')}) add unique spiritual qualities to your path.`
    }
    
    interpretation += ' You have a natural curiosity about life\'s deeper meanings and may find fulfillment through meditation, study, and connecting with ancient wisdom traditions.'
    
    return interpretation
  }

  private static generateCurrentPeriodInterpretation(currentDasha: any, dashaForecast: any[]): string {
    if (!currentDasha) {
      return `Your current life period is one of growth and development. Focus on building strong foundations in all areas of life, particularly those that align with your natural talents and spiritual inclinations.`
    }
    
    const planet = currentDasha.planet
    const influence = currentDasha.influence
    
    return `You are currently in a ${planet} dasha period, which brings ${influence}. This is a time of ${this.getDashaDescription(planet)}. Use this period to focus on areas of life that align with ${planet}'s energy and make the most of the opportunities this planetary influence provides.`
  }

  private static getDashaDescription(planet: string): string {
    const descriptions: Record<string, string> = {
      'Sun': 'leadership, recognition, and personal power',
      'Moon': 'emotional growth, intuition, and family matters',
      'Mars': 'energy, courage, and new beginnings',
      'Mercury': 'communication, learning, and intellectual pursuits',
      'Jupiter': 'wisdom, expansion, and spiritual growth',
      'Venus': 'love, beauty, and artistic expression',
      'Saturn': 'discipline, responsibility, and long-term goals'
    }
    return descriptions[planet] || 'personal development and growth'
  }

  private static generateRecommendations(vedicData: VedicReportSchema, yogas: any[], doshas: any[]): string[] {
    const recommendations: string[] = []
    
    // Based on planetary positions
    const retrogradePlanets = vedicData.current_influences?.retrograde_planets || []
    if (retrogradePlanets.length > 0) {
      recommendations.push(`Focus on inner reflection during ${retrogradePlanets.join(' and ')} retrograde periods`)
    }
    
    // Based on remedies (vedicData.remedies may be array or undefined)
    const remedies = (vedicData as { remedies?: Array<{ remedy?: string; issue?: string }> }).remedies
    if (remedies && Array.isArray(remedies) && remedies.length > 0) {
      const r = remedies[0]
      recommendations.push(`Practice ${r.remedy ?? 'recommended remedy'} for ${r.issue ?? 'balance'}`)
    }
    
    // Based on yogas
    if (yogas.length > 0) {
      const positiveYogas = yogas.filter((y: { type?: string; name?: string }) => y.type === 'positive')
      if (positiveYogas.length > 0) {
        const y0 = positiveYogas[0] as { name?: string }
        recommendations.push(`Leverage your ${y0.name ?? 'yoga'} for enhanced success and spiritual growth`)
      }
    }
    
    // Based on doshas
    if (doshas.length > 0) {
      const negativeDoshas = doshas.filter((d: { type?: string; name?: string }) => d.type === 'negative')
      if (negativeDoshas.length > 0) {
        const d0 = negativeDoshas[0] as { name?: string }
        recommendations.push(`Be mindful of ${d0.name ?? 'dosha'} and work on balancing its influence`)
      }
    }
    
    // Based on current dasha (currentDasha may be string or object)
    const currentDasha = vedicData.current_influences?.current_dasha
    if (currentDasha) {
      const dashaPlanet = typeof currentDasha === 'string' ? currentDasha : (currentDasha as { planet?: string }).planet ?? ''
      if (dashaPlanet) {
        recommendations.push(`Focus on ${this.getDashaDescription(dashaPlanet)} during your current ${dashaPlanet} dasha`)
      }
    }
    
    // General recommendations
    recommendations.push('Maintain a regular meditation practice for emotional balance')
    recommendations.push('Surround yourself with positive, spiritually-minded people')
    recommendations.push('Keep a journal to track your spiritual and emotional growth')
    
    return recommendations.slice(0, 5) // Limit to 5 recommendations
  }

  private static getDefaultInterpretation(): AIInterpretation {
    return {
      summary: 'Your cosmic blueprint reveals a unique journey of growth and self-discovery. Your chart suggests a person with deep intuitive abilities and strong spiritual inclinations.',
      personality: 'You possess natural leadership qualities and emotional intelligence. Your sensitive nature allows you to understand others deeply and connect with the spiritual aspects of life.',
      career: 'Your career path may involve communication, teaching, or helping others. You have natural talents that can be developed through dedication and spiritual practice.',
      relationships: 'You value deep emotional connections and harmony in relationships. Your spiritual nature attracts like-minded partners who share your interests.',
      health: 'Your health is closely connected to your emotional and mental well-being. Regular meditation and stress management are particularly beneficial.',
      spiritual: 'Your spiritual journey is an important part of your life path. You may find fulfillment through meditation, study, and connecting with ancient wisdom.',
      currentPeriod: 'Your current life period is one of growth and development. Focus on building strong foundations and developing your natural talents.',
      recommendations: [
        'Practice regular meditation for emotional balance',
        'Trust your intuition and develop your psychic abilities',
        'Surround yourself with positive, spiritually-minded people',
        'Keep a journal to track your spiritual growth',
        'Focus on areas that align with your natural talents'
      ]
    }
  }

  // Generate explanations for complex Vedic terms
  private static generateTermExplanations(vedicData: VedicReportSchema): { [key: string]: string } {
    const explanations: { [key: string]: string } = {}
    
    // Add explanations for common terms found in the data
    explanations['Nakshatra'] = `Nakshatras are 27 lunar mansions in Vedic astrology. Think of them as the "moon's neighborhood" - each one has unique qualities, like different neighborhoods in a city, that influence your personality and life path.`
    
    explanations['Dasha'] = `Dasha periods are like chapters in your life story. Each planet takes turns being the "main character" for a certain number of years, influencing the themes and experiences you encounter during that time.`
    
    explanations['Yoga'] = `Yogas are special planetary combinations that create unique energies in your chart. Think of them as "cosmic recipes" - when certain planets are positioned together, they create specific effects on your life, like ingredients combining to make a special dish.`
    
    explanations['Dosha'] = `Doshas are planetary afflictions or challenges in your chart. They're like "cosmic obstacles" that teach you important lessons and help you grow stronger. They're not punishments, but opportunities for spiritual development.`
    
    explanations['Shadbala'] = `Shadbala measures the strength of planets in your chart. It's like a "cosmic fitness test" - planets with high Shadbala are strong and influential, while weak planets need support through remedies.`
    
    explanations['House'] = `Houses represent different areas of life (career, relationships, health, etc.). Think of them as 12 different "rooms" in your cosmic home, each representing a specific aspect of your life experience.`
    
    explanations['Ascendant'] = `The Ascendant is your rising sign - the zodiac sign that was rising on the eastern horizon when you were born. It's like your "cosmic first impression" - how others see you and how you approach new situations.`
    
    explanations['Rahu'] = `Rahu is a shadow planet that represents desires, obsessions, and material pursuits. It's like your "cosmic craving" - what you're drawn to but need to balance with spiritual growth.`
    
    explanations['Ketu'] = `Ketu is Rahu's opposite - it represents detachment, spirituality, and past-life wisdom. It's like your "cosmic wisdom" - the spiritual lessons you've already learned and can share with others.`
    
    explanations['Retrograde'] = `When a planet is retrograde, it appears to move backward in the sky. In your chart, this means the planet's energy is turned inward, making you more introspective and thoughtful about that planet's themes.`
    
    explanations['Exalted'] = `An exalted planet is in its most powerful and beneficial position. It's like a planet in its "dream job" - it can express its best qualities and bring positive influences to your life.`
    
    explanations['Debilitated'] = `A debilitated planet is in its weakest position. It's like a planet in a "challenging job" - it needs extra support and understanding, but can still contribute valuable lessons to your growth.`
    
    explanations['Mangal Dosha'] = `Mangal Dosha occurs when Mars is in certain houses. It's like having a "cosmic fire alarm" - it can create challenges in relationships, but with proper remedies and understanding, it can be managed effectively.`
    
    explanations['Shudra'] = `In nakshatra astrology, "Shudra" doesn't refer to social caste. It's a symbolic classification describing your natural approach to life - you're someone who excels at practical work, service to others, and bringing ideas to life through consistent effort. You're the "doer" who makes things happen.`
    
    explanations['Brahmana'] = `In nakshatra astrology, "Brahmana" represents wisdom, teaching, and spiritual knowledge. You're naturally drawn to learning, sharing knowledge, and helping others understand deeper truths.`
    
    explanations['Kshatriya'] = `In nakshatra astrology, "Kshatriya" represents leadership, courage, and protection. You're naturally inclined to take charge, protect others, and lead by example.`
    
    explanations['Vaishya'] = `In nakshatra astrology, "Vaishya" represents commerce, trade, and material prosperity. You're naturally skilled at business, trade, and creating wealth through practical means.`
    
    return explanations
  }
}

// Export convenience function
export async function interpretVedicData(vedicData: VedicReportSchema): Promise<AIInterpretation> {
  return VedicAIInterpreter.interpretVedicData(vedicData)
}
