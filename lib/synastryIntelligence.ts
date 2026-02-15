'use client'

import { PersonData, SynastryCompatibility, SynastryAspect, HouseOverlay, PersonNatalSummary } from '@/hooks/useSynastry'
import { devLog } from '@/lib/devLogger';
import { universalOccultService, BirthData } from './universalOccultService'
import { getCoordinatesWithFallback } from './geocoding'

class SynastryIntelligence {
  private async getAstroData(birthData: PersonData): Promise<any> {
    try {
      // Geocode birth location if needed
      const coords = await getCoordinatesWithFallback(birthData.birthPlace)
      
      const birthDataFormatted: BirthData = {
        birthDate: '', // Will be provided by caller
        birthTime: birthData.birthTime,
        birthPlace: birthData.birthPlace,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
      
      const result = await universalOccultService.calculateWesternChart(birthDataFormatted, {
        houseSystem: 'placidus',
        includeAspects: true
      })
      
      if (!result.success) {
        throw new Error('Failed to calculate birth chart')
      }
      
      return result.data
    } catch (error) {
      devLog.error('Error fetching astro data:', error, 'synastryIntelligence')
      throw new Error('Unable to calculate birth chart')
    }
  }

  async analyzeCompatibility(person1: PersonData, person2: PersonData): Promise<SynastryCompatibility> {
    try {
      devLog.debug('💕 SynastryIntelligence.analyzeCompatibility called', { person1, person2 })
      
      // Parse birth dates from birthTime strings (format: "YYYY-MM-DD HH:MM" or separate date/time)
      // BirthTime format can be "YYYY-MM-DD HH:MM" or just "HH:MM"
      let person1Date = ''
      let person1Time = person1.birthTime
      let person2Date = ''
      let person2Time = person2.birthTime
      
      // Check if birthTime includes date
      if (person1.birthTime.includes('T') || person1.birthTime.includes(' ')) {
        const parts = person1.birthTime.split(/[T ]/)
        person1Date = parts[0]
        person1Time = parts[1] || person1.birthTime
      }
      
      if (person2.birthTime.includes('T') || person2.birthTime.includes(' ')) {
        const parts = person2.birthTime.split(/[T ]/)
        person2Date = parts[0]
        person2Time = parts[1] || person2.birthTime
      }
      
      // If no date in birthTime, we need to get it from caller - for now use today's date as fallback
      if (!person1Date) {
        devLog.warn('⚠️ No birth date found in person1.birthTime, using today as fallback', 'synastryIntelligence')
        person1Date = new Date().toISOString().split('T')[0]
      }
      
      if (!person2Date) {
        devLog.warn('⚠️ No birth date found in person2.birthTime, using today as fallback', 'synastryIntelligence')
        person2Date = new Date().toISOString().split('T')[0]
      }
      
      devLog.debug('💕 Parsed dates and times:', {
        person1: { date: person1Date, time: person1Time },
        person2: { date: person2Date, time: person2Time }
      })
      
      // Geocode birth locations
      devLog.debug('💕 Geocoding locations...', {
        person1Location: person1.birthPlace,
        person2Location: person2.birthPlace
      })
      
      const [coords1, coords2] = await Promise.all([
        getCoordinatesWithFallback(person1.birthPlace),
        getCoordinatesWithFallback(person2.birthPlace)
      ])
      
      devLog.debug('💕 Geocoding complete:', { coords1, coords2 })
      
      // Prepare birth data for both persons
      const birthData1: BirthData = {
        birthDate: person1Date,
        birthTime: person1Time,
        birthPlace: person1.birthPlace,
        latitude: coords1.latitude,
        longitude: coords1.longitude
      }
      
      const birthData2: BirthData = {
        birthDate: person2Date,
        birthTime: person2Time,
        birthPlace: person2.birthPlace,
        latitude: coords2.latitude,
        longitude: coords2.longitude
      }
      
      // Get birth charts for both people using universalOccultService
      devLog.debug('💕 Calculating Western charts...')
      const [chart1Result, chart2Result] = await Promise.all([
        universalOccultService.calculateWesternChart(birthData1, {
          houseSystem: 'placidus',
          includeAspects: true
        }),
        universalOccultService.calculateWesternChart(birthData2, {
          houseSystem: 'placidus',
          includeAspects: true
        })
      ])
      
      devLog.debug('💕 Chart calculations complete:', {
        chart1Success: chart1Result.success,
        chart2Success: chart2Result.success,
        chart1Planets: chart1Result.data?.planets?.length || 0,
        chart2Planets: chart2Result.data?.planets?.length || 0
      })
      
      if (!chart1Result.success || !chart2Result.success) {
        const errorMsg = `Failed to calculate charts: chart1=${chart1Result.success ? 'OK' : 'FAIL'}, chart2=${chart2Result.success ? 'OK' : 'FAIL'}`
        devLog.error('❌', errorMsg, 'synastryIntelligence')
        throw new Error(errorMsg)
      }
      
      const chart1 = chart1Result.data
      const chart2 = chart2Result.data

      // Calculate aspects between charts
      devLog.debug('💕 Calculating aspects...')
      const aspects = this.calculateAspects(chart1, chart2)
      devLog.debug('💕 Calculated', aspects.length, 'aspects')
      
      // Calculate house overlays
      devLog.debug('💕 Calculating house overlays...')
      const houseOverlays = this.calculateHouseOverlays(chart1, chart2)
      devLog.debug('💕 Calculated', houseOverlays.length, 'house overlays')
      
      // Calculate composite chart
      devLog.debug('💕 Calculating composite chart...')
      const composite = this.calculateComposite(chart1, chart2)
      devLog.debug('💕 Composite chart:', composite)
      
      // Generate overview
      devLog.debug('💕 Generating overview...')
      const overview = this.generateOverview(aspects, houseOverlays, composite)
      devLog.debug('💕 Overview generated:', overview)
      
      // Generate timing insights
      devLog.debug('💕 Generating timing insights...')
      const timing = this.generateTimingInsights(chart1, chart2)
      devLog.debug('💕 Timing insights generated')

      // Build per-person natal summaries (Sun/Moon/Venus/Mars sign + house) for Ask the Seer
      const person1Natal = this.buildNatalSummary(chart1)
      const person2Natal = this.buildNatalSummary(chart2)

      const result = {
        overview,
        aspects,
        houseOverlays,
        composite,
        timing,
        person1Natal,
        person2Natal
      }
      
      devLog.debug('✅ Synastry analysis complete:', {
        score: overview.overallScore,
        aspectsCount: aspects.length,
        houseOverlaysCount: houseOverlays.length
      })
      
      return result
    } catch (error) {
      devLog.error('❌ Synastry analysis error:', error, 'synastryIntelligence')
      devLog.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace', 'synastryIntelligence')
      throw new Error(`Failed to analyze compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateAspects(chart1: any, chart2: any): SynastryAspect[] {
    const aspects: SynastryAspect[] = []
    const planets1 = chart1.planets || []
    const planets2 = chart2.planets || []
    
    // Create planet maps for quick lookup
    const planetMap1: Record<string, any> = {}
    const planetMap2: Record<string, any> = {}
    
    planets1.forEach((p: any) => { planetMap1[p.name] = p })
    planets2.forEach((p: any) => { planetMap2[p.name] = p })
    
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    
    for (const planet1Name of planetNames) {
      for (const planet2Name of planetNames) {
        const planet1 = planetMap1[planet1Name]
        const planet2 = planetMap2[planet2Name]
        
        if (!planet1 || !planet2) continue
        
        const lon1 = planet1.longitude || 0
        const lon2 = planet2.longitude || 0
        
        const aspect = this.calculateAspect(lon1, lon2, planet1Name, planet2Name)
        if (aspect) {
          aspects.push({
            planet1: planet1Name,
            planet2: planet2Name,
            aspect: aspect.type,
            orb: aspect.orb,
            influence: aspect.influence,
            description: this.getAspectDescription(planet1Name, planet2Name, aspect.type, aspect.influence)
          })
        }
      }
    }
    
    return aspects.sort((a, b) => a.orb - b.orb) // Sort by orb (closest aspects first)
  }

  private calculateAspect(lon1: number, lon2: number, planet1Name: string, planet2Name: string) {
    const diff = Math.abs(lon1 - lon2)
    const normalizedAngle = Math.min(diff, 360 - diff)
    
    // Variable orbs based on planet importance
    const importantPlanets = ['Sun', 'Moon', 'Venus', 'Mars']
    const outerPlanets = ['Uranus', 'Neptune', 'Pluto']
    
    let maxOrbConjunction = 8
    let maxOrbMajor = 8
    let maxOrbMinor = 6
    
    if (importantPlanets.includes(planet1Name) || importantPlanets.includes(planet2Name)) {
      maxOrbConjunction += 2
      maxOrbMajor += 2
      maxOrbMinor += 2
    }
    
    if (outerPlanets.includes(planet1Name) || outerPlanets.includes(planet2Name)) {
      maxOrbConjunction += 2
      maxOrbMajor += 2
      maxOrbMinor += 2
    }
    
    // Check for conjunction
    if (normalizedAngle <= maxOrbConjunction) {
      return { type: 'conjunction', orb: normalizedAngle, influence: 'neutral' as const }
    }
    
    // Check for opposition
    const oppDiff = Math.abs(normalizedAngle - 180)
    if (oppDiff <= maxOrbMajor) {
      return { type: 'opposition', orb: oppDiff, influence: 'challenging' as const }
    }
    
    // Check for trine
    const trineDiff = Math.abs(normalizedAngle - 120)
    if (trineDiff <= maxOrbMajor) {
      return { type: 'trine', orb: trineDiff, influence: 'harmonious' as const }
    }
    
    // Check for square
    const squareDiff = Math.abs(normalizedAngle - 90)
    if (squareDiff <= maxOrbMajor) {
      return { type: 'square', orb: squareDiff, influence: 'challenging' as const }
    }
    
    // Check for sextile
    const sextileDiff = Math.abs(normalizedAngle - 60)
    if (sextileDiff <= maxOrbMinor) {
      return { type: 'sextile', orb: sextileDiff, influence: 'harmonious' as const }
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
    const planets1 = chart1.planets || []
    const planets2 = chart2.planets || []
    const houses1 = chart1.houses || []
    const houses2 = chart2.houses || []
    
    // Person 1's planets in Person 2's houses
    for (const planet of planets1) {
      const planetLongitude = planet.longitude || 0
      const house = this.calculateHouse(planetLongitude, houses2)
      if (house) {
        overlays.push({
          planet: planet.name,
          house,
          person: 'person2',
          description: this.getHouseOverlayDescription(planet.name, house, 'person2')
        })
      }
    }
    
    // Person 2's planets in Person 1's houses
    for (const planet of planets2) {
      const planetLongitude = planet.longitude || 0
      const house = this.calculateHouse(planetLongitude, houses1)
      if (house) {
        overlays.push({
          planet: planet.name,
          house,
          person: 'person1',
          description: this.getHouseOverlayDescription(planet.name, house, 'person1')
        })
      }
    }
    
    return overlays
  }

  private calculateHouse(planetLongitude: number, houses: any[]): number | null {
    if (!houses || houses.length === 0) return null
    
    const normalizedLongitude = ((planetLongitude % 360) + 360) % 360
    
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i]
      const nextHouse = houses[(i + 1) % houses.length]
      
      // Handle different house data formats
      const currentCusp = currentHouse.longitude || currentHouse.cusp || currentHouse.degree || 0
      const nextCusp = nextHouse.longitude || nextHouse.cusp || nextHouse.degree || 0
      
      const currentCuspNorm = ((currentCusp % 360) + 360) % 360
      const nextCuspNorm = ((nextCusp % 360) + 360) % 360
      
      // Handle crossing 0 degrees
      if (currentCuspNorm > nextCuspNorm) {
        // We're crossing the 0 degree point
        if (normalizedLongitude >= currentCuspNorm || normalizedLongitude < nextCuspNorm) {
          return i + 1
        }
      } else {
        // Normal case
        if (normalizedLongitude >= currentCuspNorm && normalizedLongitude < nextCuspNorm) {
          return i + 1
        }
      }
    }
    
    return 1 // Default to first house if not found
  }

  private getHouseOverlayDescription(planet: string, house: number, person: 'person1' | 'person2'): string {
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

  /** Build PersonNatalSummary (Sun/Moon/Venus/Mars sign + house) from a chart for Ask the Seer. */
  private buildNatalSummary(chart: any): PersonNatalSummary {
    const planets = chart.planets || []
    const houses = chart.houses || []
    const planetMap: Record<string, { sign?: string; longitude?: number; house?: number }> = {}
    planets.forEach((p: any) => {
      planetMap[p.name] = {
        sign: p.sign,
        longitude: p.longitude,
        house: p.house
      }
    })

    const getEntry = (name: string): { sign: string; house: number } => {
      const p = planetMap[name]
      if (!p) return { sign: 'Unknown', house: 1 }
      const sign = p.sign || (p.longitude != null ? this.getSign(p.longitude) : 'Unknown')
      const house = p.house ?? (p.longitude != null && houses.length ? this.calculateHouse(p.longitude, houses) ?? 1 : 1)
      return { sign, house }
    }

    return {
      sun: getEntry('Sun'),
      moon: getEntry('Moon'),
      venus: getEntry('Venus'),
      mars: getEntry('Mars')
    }
  }

  private calculateComposite(chart1: any, chart2: any) {
    const planets1 = chart1.planets || []
    const planets2 = chart2.planets || []
    
    // Create planet maps
    const planetMap1: Record<string, any> = {}
    const planetMap2: Record<string, any> = {}
    
    planets1.forEach((p: any) => { planetMap1[p.name] = p })
    planets2.forEach((p: any) => { planetMap2[p.name] = p })
    
    // Calculate midpoint for each planet
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    let compositeSun = 0
    let compositeMoon = 0
    let compositeAsc = 0
    
    for (const name of planetNames) {
      const p1 = planetMap1[name]
      const p2 = planetMap2[name]
      
      if (p1 && p2) {
        let lon1 = p1.longitude || 0
        let lon2 = p2.longitude || 0
        
        // Normalize longitudes
        lon1 = ((lon1 % 360) + 360) % 360
        lon2 = ((lon2 % 360) + 360) % 360
        
        // Calculate midpoint (handle 0° crossing)
        let compositeLon = (lon1 + lon2) / 2
        if (Math.abs(lon1 - lon2) > 180) {
          compositeLon = (lon1 + lon2 + 360) / 2
          compositeLon = compositeLon % 360
        }
        compositeLon = ((compositeLon % 360) + 360) % 360
        
        if (name === 'Sun') compositeSun = compositeLon
        if (name === 'Moon') compositeMoon = compositeLon
      }
    }
    
    // Calculate composite Ascendant (midpoint of both ascendants)
    const asc1Lon = chart1.houses?.[0]?.longitude || chart1.ascendant || 0
    const asc2Lon = chart2.houses?.[0]?.longitude || chart2.ascendant || 0
    let asc1Norm = ((asc1Lon % 360) + 360) % 360
    let asc2Norm = ((asc2Lon % 360) + 360) % 360
    
    let ascMidpoint = (asc1Norm + asc2Norm) / 2
    if (Math.abs(asc1Norm - asc2Norm) > 180) {
      ascMidpoint = (asc1Norm + asc2Norm + 360) / 2
      ascMidpoint = ascMidpoint % 360
    }
    compositeAsc = ((ascMidpoint % 360) + 360) % 360
    
    return {
      sunSign: this.getSign(compositeSun),
      moonSign: this.getSign(compositeMoon),
      ascendant: this.getSign(compositeAsc),
      description: `Your composite chart shows a ${this.getSign(compositeSun)} Sun and ${this.getSign(compositeMoon)} Moon, indicating a relationship focused on ${this.getCompositeFocus(compositeSun, compositeMoon)}`
    }
  }

  private getSign(longitude: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const normalizedLongitude = ((longitude % 360) + 360) % 360
    const signIndex = Math.floor(normalizedLongitude / 30)
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