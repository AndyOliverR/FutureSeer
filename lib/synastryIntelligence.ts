import { PersonData, SynastryCompatibility, SynastryAspect, HouseOverlay } from '@/hooks/useSynastry'
import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

class SynastryIntelligence {
  private async getAstroData(birthData: PersonData) {
    try {
      const response = await fetch('/api/astroapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'natal',
          birthTime: birthData.birthTime,
          birthPlace: birthData.birthPlace
        })
      })
      
      if (!response.ok) throw new Error('Failed to fetch astro data')
      return await response.json()
    } catch (error) {
      console.error('Error fetching astro data:', error)
      throw new Error('Unable to calculate birth chart')
    }
  }

  async analyzeCompatibility(person1: PersonData, person2: PersonData): Promise<SynastryCompatibility> {
    try {
      // Get birth charts for both people
      const [chart1, chart2] = await Promise.all([
        this.getAstroData(person1),
        this.getAstroData(person2)
      ])

      // Calculate aspects between charts
      const aspects = this.calculateAspects(chart1, chart2)
      
      // Calculate house overlays
      const houseOverlays = this.calculateHouseOverlays(chart1, chart2)
      
      // Calculate composite chart
      const composite = this.calculateComposite(chart1, chart2)
      
      // Generate overview
      const overview = this.generateOverview(aspects, houseOverlays, composite)
      
      // Generate timing insights
      const timing = this.generateTimingInsights(chart1, chart2)

      return {
        overview,
        aspects,
        houseOverlays,
        composite,
        timing
      }
    } catch (error) {
      console.error('Synastry analysis error:', error)
      throw new Error('Failed to analyze compatibility')
    }
  }

  private calculateAspects(chart1: any, chart2: any): SynastryAspect[] {
    const aspects: SynastryAspect[] = []
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    
    for (const planet1 of planets) {
      for (const planet2 of planets) {
        const pos1 = chart1.planets?.[planet1]?.position || 0
        const pos2 = chart2.planets?.[planet2]?.position || 0
        
        const aspect = this.calculateAspect(pos1, pos2)
        if (aspect) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspect.type,
            orb: aspect.orb,
            influence: aspect.influence,
            description: this.getAspectDescription(planet1, planet2, aspect.type, aspect.influence)
          })
        }
      }
    }
    
    return aspects.sort((a, b) => b.orb - a.orb) // Sort by orb (closest aspects first)
  }

  private calculateAspect(pos1: number, pos2: number) {
    const diff = Math.abs(pos1 - pos2)
    const orb = Math.min(diff, 360 - diff)
    
    // Major aspects
    if (orb <= 8) { // Conjunction
      return { type: 'Conjunction', orb, influence: 'neutral' as const }
    } else if (orb >= 172 && orb <= 188) { // Opposition
      return { type: 'Opposition', orb: Math.abs(orb - 180), influence: 'challenging' as const }
    } else if (orb >= 58 && orb <= 62) { // Sextile
      return { type: 'Sextile', orb: Math.abs(orb - 60), influence: 'harmonious' as const }
    } else if (orb >= 88 && orb <= 92) { // Square
      return { type: 'Square', orb: Math.abs(orb - 90), influence: 'challenging' as const }
    } else if (orb >= 118 && orb <= 122) { // Trine
      return { type: 'Trine', orb: Math.abs(orb - 120), influence: 'harmonious' as const }
    }
    
    return null
  }

  private getAspectDescription(planet1: string, planet2: string, aspect: string, influence: string): string {
    const descriptions = {
      'Sun-Sun': {
        'Conjunction': 'Strong ego connection and shared life purpose',
        'Opposition': 'Complementary life goals that may create tension',
        'Trine': 'Harmonious sharing of life direction and values',
        'Square': 'Conflicting life goals that require compromise'
      },
      'Moon-Moon': {
        'Conjunction': 'Deep emotional resonance and intuitive understanding',
        'Opposition': 'Complementary emotional needs that balance each other',
        'Trine': 'Natural emotional harmony and comfort',
        'Square': 'Emotional challenges that promote growth'
      },
      'Venus-Venus': {
        'Conjunction': 'Shared values and aesthetic preferences',
        'Opposition': 'Complementary values that attract and challenge',
        'Trine': 'Natural romantic harmony and attraction',
        'Square': 'Different values that create romantic tension'
      },
      'Mars-Mars': {
        'Conjunction': 'Shared drive and sexual energy',
        'Opposition': 'Complementary action styles that balance',
        'Trine': 'Harmonious physical and sexual connection',
        'Square': 'Conflicting action styles that create passion'
      }
    }
    
    const key = `${planet1}-${planet2}`
    return descriptions[key as keyof typeof descriptions]?.[aspect as keyof typeof descriptions[keyof typeof descriptions]] || 
           `${planet1} ${aspect} ${planet2} creates ${influence} energy in your relationship`
  }

  private calculateHouseOverlays(chart1: any, chart2: any): HouseOverlay[] {
    const overlays: HouseOverlay[] = []
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    
    // Person 1's planets in Person 2's houses
    for (const planet of planets) {
      const planetPos = chart1.planets?.[planet]?.position || 0
      const house = this.calculateHouse(planetPos, chart2.houses || [])
      if (house) {
        overlays.push({
          planet,
          house,
          person: 'person2',
          description: this.getHouseOverlayDescription(planet, house, 'person2')
        })
      }
    }
    
    // Person 2's planets in Person 1's houses
    for (const planet of planets) {
      const planetPos = chart2.planets?.[planet]?.position || 0
      const house = this.calculateHouse(planetPos, chart1.houses || [])
      if (house) {
        overlays.push({
          planet,
          house,
          person: 'person1',
          description: this.getHouseOverlayDescription(planet, house, 'person1')
        })
      }
    }
    
    return overlays
  }

  private calculateHouse(planetPos: number, houses: any[]): number | null {
    if (!houses || houses.length === 0) return null
    
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i]
      const nextHouse = houses[(i + 1) % houses.length]
      
      if (planetPos >= currentHouse.position && planetPos < nextHouse.position) {
        return i + 1
      }
    }
    
    return 1 // Default to first house
  }

  private getHouseOverlayDescription(planet: string, house: number, person: string): string {
    const houseMeanings = {
      1: 'identity and self-expression',
      2: 'values and material security',
      3: 'communication and learning',
      4: 'home and emotional foundation',
      5: 'creativity and romance',
      6: 'work and health',
      7: 'partnerships and relationships',
      8: 'transformation and shared resources',
      9: 'philosophy and expansion',
      10: 'career and public image',
      11: 'friendships and social groups',
      12: 'spirituality and subconscious'
    }
    
    const planetMeanings = {
      'Sun': 'ego and life purpose',
      'Moon': 'emotions and intuition',
      'Mercury': 'communication and thinking',
      'Venus': 'love and values',
      'Mars': 'action and desire',
      'Jupiter': 'expansion and wisdom',
      'Saturn': 'structure and responsibility',
      'Uranus': 'innovation and freedom',
      'Neptune': 'spirituality and dreams',
      'Pluto': 'transformation and power'
    }
    
    return `${planet} (${planetMeanings[planet as keyof typeof planetMeanings]}) activates ${person === 'person1' ? 'your' : 'their'} ${house}${this.getOrdinalSuffix(house)} house of ${houseMeanings[house as keyof typeof houseMeanings]}`
  }

  private getOrdinalSuffix(num: number): string {
    if (num >= 11 && num <= 13) return 'th'
    switch (num % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  private calculateComposite(chart1: any, chart2: any) {
    // Simplified composite calculation
    const sun1 = chart1.planets?.Sun?.position || 0
    const sun2 = chart2.planets?.Sun?.position || 0
    const moon1 = chart1.planets?.Moon?.position || 0
    const moon2 = chart2.planets?.Moon?.position || 0
    
    const compositeSun = (sun1 + sun2) / 2
    const compositeMoon = (moon1 + moon2) / 2
    
    return {
      sunSign: this.getSign(compositeSun),
      moonSign: this.getSign(compositeMoon),
      ascendant: 'Libra', // Simplified
      description: `Your composite chart shows a ${this.getSign(compositeSun)} Sun and ${this.getSign(compositeMoon)} Moon, indicating a relationship focused on ${this.getCompositeFocus(compositeSun, compositeMoon)}`
    }
  }

  private getSign(position: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const signIndex = Math.floor(position / 30)
    return signs[signIndex] || 'Aries'
  }

  private getCompositeFocus(sun: number, moon: number): string {
    const sunSign = this.getSign(sun)
    const moonSign = this.getSign(moon)
    
    if (sunSign === moonSign) {
      return 'deep unity and shared purpose'
    } else if (['Aries', 'Leo', 'Sagittarius'].includes(sunSign) && ['Aries', 'Leo', 'Sagittarius'].includes(moonSign)) {
      return 'adventure and expansion'
    } else if (['Taurus', 'Virgo', 'Capricorn'].includes(sunSign) && ['Taurus', 'Virgo', 'Capricorn'].includes(moonSign)) {
      return 'stability and practical growth'
    } else if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign) && ['Gemini', 'Libra', 'Aquarius'].includes(moonSign)) {
      return 'intellectual connection and social harmony'
    } else if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign) && ['Cancer', 'Scorpio', 'Pisces'].includes(moonSign)) {
      return 'emotional depth and spiritual connection'
    } else {
      return 'balance and complementarity'
    }
  }

  private generateOverview(aspects: SynastryAspect[], houseOverlays: HouseOverlay[], composite: any) {
    const harmoniousAspects = aspects.filter(a => a.influence === 'harmonious').length
    const challengingAspects = aspects.filter(a => a.influence === 'challenging').length
    const totalAspects = aspects.length
    
    const overallScore = totalAspects > 0 ? Math.round((harmoniousAspects / totalAspects) * 100) : 50
    
    let summary = ''
    if (overallScore >= 80) {
      summary = 'This is a highly harmonious connection with strong potential for lasting love and partnership.'
    } else if (overallScore >= 60) {
      summary = 'This relationship has good potential with some areas for growth and learning.'
    } else if (overallScore >= 40) {
      summary = 'This connection offers valuable lessons and growth opportunities, though it may require more effort.'
    } else {
      summary = 'This relationship presents significant challenges that can lead to profound transformation if both partners are willing to work through them.'
    }
    
    const strengths = this.identifyStrengths(aspects, houseOverlays)
    const challenges = this.identifyChallenges(aspects, houseOverlays)
    const recommendations = this.generateRecommendations(aspects, houseOverlays, overallScore)
    
    return {
      summary,
      overallScore,
      strengths,
      challenges,
      recommendations
    }
  }

  private identifyStrengths(aspects: SynastryAspect[], houseOverlays: HouseOverlay[]): string[] {
    const strengths: string[] = []
    
    // Check for strong harmonious aspects
    const strongHarmonious = aspects.filter(a => a.influence === 'harmonious' && a.orb <= 3)
    if (strongHarmonious.length > 0) {
      strengths.push(`Strong harmonious connections between ${strongHarmonious.map(a => `${a.planet1}-${a.planet2}`).join(', ')}`)
    }
    
    // Check for Venus and Moon connections
    const venusMoon = aspects.filter(a => 
      (a.planet1 === 'Venus' && a.planet2 === 'Moon') || 
      (a.planet1 === 'Moon' && a.planet2 === 'Venus')
    )
    if (venusMoon.length > 0) {
      strengths.push('Deep emotional and romantic compatibility')
    }
    
    // Check for Sun connections
    const sunAspects = aspects.filter(a => a.planet1 === 'Sun' || a.planet2 === 'Sun')
    if (sunAspects.length > 0) {
      strengths.push('Strong life purpose alignment')
    }
    
    return strengths.length > 0 ? strengths : ['Unique potential for growth and learning']
  }

  private identifyChallenges(aspects: SynastryAspect[], houseOverlays: HouseOverlay[]): string[] {
    const challenges: string[] = []
    
    // Check for strong challenging aspects
    const strongChallenging = aspects.filter(a => a.influence === 'challenging' && a.orb <= 3)
    if (strongChallenging.length > 0) {
      challenges.push(`Intense dynamics between ${strongChallenging.map(a => `${a.planet1}-${a.planet2}`).join(', ')}`)
    }
    
    // Check for Saturn aspects
    const saturnAspects = aspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn')
    if (saturnAspects.length > 0) {
      challenges.push('Lessons in commitment and responsibility')
    }
    
    // Check for Mars aspects
    const marsAspects = aspects.filter(a => a.planet1 === 'Mars' || a.planet2 === 'Mars')
    if (marsAspects.length > 0) {
      challenges.push('Potential for conflict and power dynamics')
    }
    
    return challenges.length > 0 ? challenges : ['Normal relationship challenges that promote growth']
  }

  private generateRecommendations(aspects: SynastryAspect[], houseOverlays: HouseOverlay[], overallScore: number): string[] {
    const recommendations: string[] = []
    
    if (overallScore < 60) {
      recommendations.push('Focus on open communication and mutual understanding')
      recommendations.push('Consider relationship counseling or therapy')
    }
    
    const saturnAspects = aspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn')
    if (saturnAspects.length > 0) {
      recommendations.push('Work on building trust and commitment gradually')
    }
    
    const marsAspects = aspects.filter(a => a.planet1 === 'Mars' || a.planet2 === 'Mars')
    if (marsAspects.length > 0) {
      recommendations.push('Channel passion into constructive activities together')
    }
    
    const venusAspects = aspects.filter(a => a.planet1 === 'Venus' || a.planet2 === 'Venus')
    if (venusAspects.length > 0) {
      recommendations.push('Nurture romance and shared values')
    }
    
    recommendations.push('Regular check-ins about relationship goals and needs')
    recommendations.push('Celebrate your unique connection and differences')
    
    return recommendations
  }

  private generateTimingInsights(chart1: any, chart2: any) {
    return {
      currentTransits: [
        'Jupiter in Aries is activating your relationship growth',
        'Saturn in Pisces is testing your spiritual connection',
        'Venus retrograde periods may bring relationship reviews'
      ],
      futureHighlights: [
        'Eclipse season will bring relationship revelations',
        'Jupiter-Saturn conjunction will test your commitment',
        'Pluto transits will transform your relationship dynamics'
      ],
      advice: 'Use challenging transits as opportunities for growth and deeper connection. Harmonious transits are perfect for celebration and expansion.'
    }
  }
}

export const synastryIntelligence = new SynastryIntelligence() 