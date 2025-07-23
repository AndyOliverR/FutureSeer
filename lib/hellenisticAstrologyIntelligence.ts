import { HellenisticAnalysis, BirthData, PlanetaryDignity, HellenisticAspect, HellenisticHouse } from '@/hooks/useHellenisticAstrology'
import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

class HellenisticAstrologyIntelligence {
  private planetaryDignities: Record<string, Record<string, string>> = {
    Sun: {
      ruler: 'Leo',
      exaltation: 'Aries',
      detriment: 'Aquarius',
      fall: 'Libra'
    },
    Moon: {
      ruler: 'Cancer',
      exaltation: 'Taurus',
      detriment: 'Capricorn',
      fall: 'Scorpio'
    },
    Mercury: {
      ruler: 'Gemini,Virgo',
      exaltation: 'Virgo',
      detriment: 'Sagittarius,Pisces',
      fall: 'Pisces'
    },
    Venus: {
      ruler: 'Taurus,Libra',
      exaltation: 'Pisces',
      detriment: 'Aries,Scorpio',
      fall: 'Virgo'
    },
    Mars: {
      ruler: 'Aries,Scorpio',
      exaltation: 'Capricorn',
      detriment: 'Taurus,Libra',
      fall: 'Cancer'
    },
    Jupiter: {
      ruler: 'Sagittarius,Pisces',
      exaltation: 'Cancer',
      detriment: 'Gemini,Virgo',
      fall: 'Capricorn'
    },
    Saturn: {
      ruler: 'Capricorn,Aquarius',
      exaltation: 'Libra',
      detriment: 'Cancer,Leo',
      fall: 'Aries'
    }
  }

  private triplicityRulers: Record<string, string[]> = {
    Fire: ['Sun', 'Jupiter', 'Saturn'],
    Earth: ['Venus', 'Moon', 'Mars'],
    Air: ['Saturn', 'Mercury', 'Jupiter'],
    Water: ['Venus', 'Mars', 'Moon']
  }

  async performHellenisticAnalysis(birthData: BirthData): Promise<HellenisticAnalysis> {
    try {
      // Generate planetary positions (simplified for demo)
      const rawPlanets = this.generatePlanetaryPositions(birthData)
      
      // Calculate dignities
      const planetData = this.calculateDignities(rawPlanets)
      const dignities = {
        strongPlanets: Object.values(planetData).filter((d: any) => d.dignity.strength >= 4).map((d: any) => d.dignity),
        weakPlanets: Object.values(planetData).filter((d: any) => d.dignity.strength <= 1).map((d: any) => d.dignity),
        overallAssessment: this.getOverallAssessment(planetData)
      }
      
      // Generate aspects
      const aspects = this.generateAspects(rawPlanets)
      
      // Generate houses
      const houses = this.generateHouses(rawPlanets)
      
      // Generate overview
      const overview = this.generateOverview(rawPlanets, planetData, birthData.focus)
      
      // Generate timing
      const timing = this.generateTiming(rawPlanets, aspects)
      
      // Generate advice
      const advice = this.generateAdvice(rawPlanets, planetData, birthData.focus)

      return {
        overview,
        planets: planetData,
        aspects,
        houses,
        dignities,
        timing,
        advice
      }
    } catch (error) {
      console.error('Hellenistic analysis error:', error)
      throw new Error('Failed to perform Hellenistic analysis')
    }
  }

  private generatePlanetaryPositions(birthData: BirthData) {
    // Simplified planetary position generation
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    
    return {
      sun: { sign: signs[Math.floor(Math.random() * signs.length)], house: houses[Math.floor(Math.random() * houses.length)] },
      moon: { sign: signs[Math.floor(Math.random() * signs.length)], house: houses[Math.floor(Math.random() * houses.length)] },
      mercury: { sign: signs[Math.floor(Math.random() * signs.length)], house: houses[Math.floor(Math.random() * houses.length)] },
      venus: { sign: signs[Math.floor(Math.random() * signs.length)], house: houses[Math.floor(Math.random() * houses.length)] },
      mars: { sign: signs[Math.floor(Math.random() * signs.length)], house: houses[Math.floor(Math.random() * houses.length)] },
      jupiter: { sign: signs[Math.floor(Math.random() * signs.length)], house: houses[Math.floor(Math.random() * houses.length)] },
      saturn: { sign: signs[Math.floor(Math.random() * signs.length)], house: houses[Math.floor(Math.random() * houses.length)] }
    }
  }

  private calculateDignities(planets: any) {
    const dignities: Record<string, any> = {}
    
    Object.entries(planets).forEach(([planet, data]: [string, any]) => {
      const sign = data.sign
      const dignity = this.getPlanetaryDignity(planet, sign)
      dignities[planet] = {
        sign,
        house: data.house,
        dignity,
        interpretation: this.getDignityInterpretation(planet, dignity)
      }
    })
    
    return dignities
  }

  private getPlanetaryDignity(planet: string, sign: string): PlanetaryDignity {
    const planetDignities = this.planetaryDignities[planet.charAt(0).toUpperCase() + planet.slice(1)]
    
    if (planetDignities.ruler.includes(sign)) {
      return {
        planet,
        sign,
        dignity: 'ruler',
        strength: 5,
        interpretation: `${planet} is in its rulership in ${sign}, indicating great strength and natural expression`
      }
    } else if (planetDignities.exaltation === sign) {
      return {
        planet,
        sign,
        dignity: 'exaltation',
        strength: 4,
        interpretation: `${planet} is exalted in ${sign}, showing enhanced power and positive expression`
      }
    } else if (planetDignities.detriment.includes(sign)) {
      return {
        planet,
        sign,
        dignity: 'detriment',
        strength: 1,
        interpretation: `${planet} is in detriment in ${sign}, indicating challenges and weakened expression`
      }
    } else if (planetDignities.fall === sign) {
      return {
        planet,
        sign,
        dignity: 'fall',
        strength: 0,
        interpretation: `${planet} is in fall in ${sign}, showing the most difficult expression`
      }
    } else {
      return {
        planet,
        sign,
        dignity: 'peregrine',
        strength: 2,
        interpretation: `${planet} is peregrine in ${sign}, showing neutral expression`
      }
    }
  }

  private getDignityInterpretation(planet: string, dignity: PlanetaryDignity): string {
    const interpretations: Record<string, string> = {
      sun: 'Your core identity and life purpose',
      moon: 'Your emotional nature and inner world',
      mercury: 'Your communication style and mental approach',
      venus: 'Your values, relationships, and aesthetic sense',
      mars: 'Your drive, energy, and how you take action',
      jupiter: 'Your wisdom, growth, and expansion areas',
      saturn: 'Your challenges, discipline, and life lessons'
    }
    
    return `${interpretations[planet.toLowerCase()]} is ${dignity.interpretation}`
  }

  private generateAspects(planets: any): HellenisticAspect[] {
    const aspects: HellenisticAspect[] = []
    const planetNames = Object.keys(planets)
    
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planetNames[i]
        const planet2 = planetNames[j]
        const aspect = this.calculateAspect(planets[planet1].sign, planets[planet2].sign)
        
        if (aspect) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspect.type,
            orb: aspect.orb,
            interpretation: this.getAspectInterpretation(planet1, planet2, aspect.type),
            strength: aspect.orb <= 3 ? 'strong' : aspect.orb <= 6 ? 'moderate' : 'weak'
          })
        }
      }
    }
    
    return aspects
  }

  private calculateAspect(sign1: string, sign2: string): { type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'; orb: number } | null {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const pos1 = signs.indexOf(sign1)
    const pos2 = signs.indexOf(sign2)
    const distance = Math.abs(pos1 - pos2)
    
    if (distance === 0) return { type: 'conjunction', orb: Math.random() * 5 }
    if (distance === 2 || distance === 10) return { type: 'sextile', orb: Math.random() * 3 }
    if (distance === 3 || distance === 9) return { type: 'square', orb: Math.random() * 3 }
    if (distance === 4 || distance === 8) return { type: 'trine', orb: Math.random() * 3 }
    if (distance === 6) return { type: 'opposition', orb: Math.random() * 3 }
    
    return null
  }

  private getAspectInterpretation(planet1: string, planet2: string, aspect: string): string {
    const aspectMeanings: Record<string, string> = {
      conjunction: 'united energy and focused expression',
      sextile: 'harmonious cooperation and opportunity',
      square: 'tension and challenge requiring growth',
      trine: 'flowing harmony and natural talent',
      opposition: 'polarity and integration of opposites'
    }
    
    return `${planet1} and ${planet2} form a ${aspect} aspect, indicating ${aspectMeanings[aspect]}`
  }

  private generateHouses(planets: any): HellenisticHouse[] {
    const houses: HellenisticHouse[] = []
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const traditionalRulers = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter']
    
    for (let i = 0; i < 12; i++) {
      const housePlanets = Object.entries(planets)
        .filter(([_, data]: [string, any]) => data.house === i + 1)
        .map(([planet, _]) => planet)
      
      houses.push({
        house: i + 1,
        sign: signs[i],
        planets: housePlanets,
        interpretation: this.getHouseInterpretation(i + 1, housePlanets),
        traditionalRuler: traditionalRulers[i]
      })
    }
    
    return houses
  }

  private getHouseInterpretation(house: number, planets: string[]): string {
    const houseMeanings: Record<number, string> = {
      1: 'Your identity, appearance, and first impressions',
      2: 'Your values, possessions, and financial security',
      3: 'Your communication, siblings, and local environment',
      4: 'Your home, family, and emotional foundation',
      5: 'Your creativity, romance, and self-expression',
      6: 'Your work, health, and daily routines',
      7: 'Your partnerships, marriage, and open enemies',
      8: 'Your shared resources, transformation, and mystery',
      9: 'Your higher learning, travel, and philosophy',
      10: 'Your career, reputation, and public image',
      11: 'Your friends, groups, and hopes and dreams',
      12: 'Your spirituality, hidden matters, and subconscious'
    }
    
    const baseMeaning = houseMeanings[house]
    if (planets.length === 0) {
      return `${baseMeaning} - no planets here indicate this area flows naturally`
    }
    
    return `${baseMeaning} - influenced by ${planets.join(', ')}`
  }

  private generateOverview(planets: any, dignities: any, focus: string): any {
    const strongPlanets = Object.values(dignities).filter((d: any) => d.dignity.strength >= 4)
    const weakPlanets = Object.values(dignities).filter((d: any) => d.dignity.strength <= 1)
    
    let summary = ''
    if (strongPlanets.length > weakPlanets.length) {
      summary = 'Your chart shows strong planetary placements, indicating natural talents and favorable life circumstances.'
    } else if (weakPlanets.length > strongPlanets.length) {
      summary = 'Your chart shows challenging planetary placements, indicating areas for growth and development.'
    } else {
      summary = 'Your chart shows a balanced mix of strong and challenging placements, indicating both talents and growth areas.'
    }
    
    const temperament = this.calculateTemperament(planets)
    const elementalBalance = this.calculateElementalBalance(planets)
    
    return {
      summary,
      temperament,
      elementalBalance,
      keyStrengths: strongPlanets.map((p: any) => `${p.dignity.planet} in ${p.dignity.sign} - ${p.dignity.interpretation}`),
      challenges: weakPlanets.map((p: any) => `${p.dignity.planet} in ${p.dignity.sign} - ${p.dignity.interpretation}`)
    }
  }

  private calculateTemperament(planets: any): string {
    const fireSigns = ['Aries', 'Leo', 'Sagittarius']
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn']
    const airSigns = ['Gemini', 'Libra', 'Aquarius']
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces']
    
    let fire = 0, earth = 0, air = 0, water = 0
    
    Object.values(planets).forEach((planet: any) => {
      if (fireSigns.includes(planet.sign)) fire++
      else if (earthSigns.includes(planet.sign)) earth++
      else if (airSigns.includes(planet.sign)) air++
      else if (waterSigns.includes(planet.sign)) water++
    })
    
    const max = Math.max(fire, earth, air, water)
    if (fire === max) return 'Choleric (Fire) - passionate, energetic, and action-oriented'
    if (earth === max) return 'Melancholic (Earth) - practical, reliable, and detail-oriented'
    if (air === max) return 'Sanguine (Air) - intellectual, social, and adaptable'
    if (water === max) return 'Phlegmatic (Water) - emotional, intuitive, and nurturing'
    
    return 'Balanced - showing qualities of all four temperaments'
  }

  private calculateElementalBalance(planets: any): string {
    const fireSigns = ['Aries', 'Leo', 'Sagittarius']
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn']
    const airSigns = ['Gemini', 'Libra', 'Aquarius']
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces']
    
    let fire = 0, earth = 0, air = 0, water = 0
    
    Object.values(planets).forEach((planet: any) => {
      if (fireSigns.includes(planet.sign)) fire++
      else if (earthSigns.includes(planet.sign)) earth++
      else if (airSigns.includes(planet.sign)) air++
      else if (waterSigns.includes(planet.sign)) water++
    })
    
    return `Fire: ${fire}, Earth: ${earth}, Air: ${air}, Water: ${water}`
  }

  private generateTiming(planets: any, aspects: HellenisticAspect[]): any {
    return {
      lifePeriods: [
        'Childhood (0-7): Moon period - emotional foundation',
        'Youth (7-14): Mercury period - learning and communication',
        'Adolescence (14-21): Venus period - values and relationships',
        'Early Adulthood (21-28): Sun period - identity and purpose',
        'Maturity (28-35): Mars period - action and achievement',
        'Wisdom (35-42): Jupiter period - expansion and growth',
        'Mastery (42+): Saturn period - discipline and mastery'
      ],
      favorableTransits: [
        'Jupiter transits bring expansion and opportunity',
        'Venus transits enhance relationships and creativity',
        'Sun transits illuminate your path and purpose'
      ],
      challengingTransits: [
        'Saturn transits bring lessons and discipline',
        'Mars transits can bring conflict and action',
        'Pluto transits bring transformation and power struggles'
      ],
      timingTechniques: [
        'Annual profections for year-by-year focus',
        'Solar returns for birthday year themes',
        'Transits for current planetary influences',
        'Progressions for personal development timing'
      ]
    }
  }

  private getOverallAssessment(planetData: any): string {
    const strongPlanets = Object.values(planetData).filter((d: any) => d.dignity.strength >= 4)
    const weakPlanets = Object.values(planetData).filter((d: any) => d.dignity.strength <= 1)
    
    if (strongPlanets.length > weakPlanets.length) {
      return 'Your chart shows strong planetary placements with natural talents and favorable circumstances.'
    } else if (weakPlanets.length > strongPlanets.length) {
      return 'Your chart shows challenging placements requiring growth and development.'
    } else {
      return 'Your chart shows a balanced mix of strengths and challenges.'
    }
  }

  private generateAdvice(planets: any, dignities: any, focus: string): any {
    const advice: any = {
      personality: [
        'Embrace your natural temperament and elemental balance',
        'Work with your strong planets to maximize their potential',
        'Develop awareness of your challenging placements for growth'
      ],
      career: [
        'Focus on areas ruled by your strong planets',
        'Use your natural talents indicated by planetary dignities',
        'Consider traditional career paths for your chart type'
      ],
      relationships: [
        'Understand your Venus and Mars placements for love',
        'Work with your Moon placement for emotional needs',
        'Consider your 7th house for partnership dynamics'
      ],
      health: [
        'Pay attention to your 6th house and its ruler',
        'Consider the element of your rising sign for health',
        'Work with Mars and Saturn for energy and discipline'
      ],
      spirituality: [
        'Explore your 9th and 12th house themes',
        'Work with Jupiter and Neptune for spiritual growth',
        'Consider your Sun and Moon for soul purpose'
      ]
    }
    
    return advice
  }
}

export const hellenisticAstrologyIntelligence = new HellenisticAstrologyIntelligence() 