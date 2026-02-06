/**
 * Navaratna Intelligence Service
 * Analyzes Vedic birth chart to recommend personalized gemstones
 * Based on Lagnesh, planetary strengths, Dasha, and benefic/malefic analysis
 */

import { vedicIntelligence } from './vedicIntelligence'
import { getGemstoneByPlanet, calculateGemstoneWeight, NAVARATNA_DATABASE } from './navaratnaDatabase'

export interface PlanetaryAnalysis {
  planet: string
  strength: 'Very Strong' | 'Strong' | 'Comfortable' | 'Neutral' | 'Weak' | 'Very Weak'
  isNaturalBenefic: boolean
  isNaturalMalefic: boolean
  isFunctionalBenefic: boolean
  isFunctionalMalefic: boolean
  isMaraka: boolean
  house: number
  houseLord: boolean
  isLagnesh: boolean
  isDashaLord: boolean
  dignity: {
    exalted: boolean
    debilitated: boolean
    ownSign: boolean
    moolatrikona: boolean
  }
  recommendation: 'recommended' | 'caution' | 'avoid'
  reason: string
}

export interface GemstoneRecommendation {
  planet: string
  gemstone: {
    english: string
    sanskrit: string
    alternativeNames: string[]
    imagePath?: string
    iconPath?: string
  }
  type: 'life_stone' | 'benefic_stone' | 'dasha_stone' | 'strengthening'
  priority: 'high' | 'medium' | 'low'
  reason: string
  analysis: PlanetaryAnalysis
  wearingInstructions: {
    day: string
    time: string
    metal: string
    finger: string
    hand: string
    pendant: boolean
    skinContact: string
    purification: string
    mantra: string
    chanting: string
    special?: string
  }
  weight: {
    min: string
    ideal: string
    max: string
    note: string
  }
  benefits: string[]
  warnings: string[]
  color?: string
}

export interface NavaratnaAnalysis {
  userId: string
  birthData: {
    birthDate: string
    birthTime: string
    birthPlace: string
    latitude: number
    longitude: number
  }
  chartSummary: {
    ascendant: {
      sign: string
      degree: number
      lord: string
    }
    lagnesh: string
    currentDasha: {
      planet: string
      startDate: string
      endDate: string
      progress: number
    } | null
  }
  planetaryAnalysis: PlanetaryAnalysis[]
  recommendations: {
    lifeStone: GemstoneRecommendation | null
    beneficStones: GemstoneRecommendation[]
    dashaStone: GemstoneRecommendation | null
    avoidedStones: Array<{
      planet: string
      gemstone: string
      reason: string
    }>
  }
  weightRecommendation: {
    min: string
    ideal: string
    max: string
    note: string
  }
  safetyWarnings: string[]
  generatedAt: string
}

class NavaratnaIntelligence {
  // Natural benefic planets
  private readonly NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon']
  
  // Natural malefic planets
  private readonly NATURAL_MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']
  
  // Maraka (Killer) houses - lords of these houses should be avoided
  private readonly MARAKA_HOUSES = [2, 7]
  
  // Trik houses (inauspicious) - 6th, 8th, 12th
  private readonly TRIK_HOUSES = [6, 8, 12]

  /**
   * Analyze birth chart and generate gemstone recommendations
   */
  async analyzeGemstones(
    userId: string,
    birthDate: string,
    birthTime: string,
    birthPlace: string,
    latitude: number,
    longitude: number,
    bodyWeightKg?: number
  ): Promise<NavaratnaAnalysis> {
    // Get Vedic chart data
    const vedicData = await vedicIntelligence.getIntelligentVedicData(
      userId,
      birthDate,
      birthTime,
      birthPlace,
      latitude,
      longitude,
      false,
      false
    )

    // Extract chart data
    const ascendant = vedicData.chartData.ascendant
    const planets = vedicData.chartData.planets
    const houses = vedicData.chartData.houses
    const currentDasha = vedicData.chartData.currentDasha

    // Calculate Lagnesh (Ascendant Lord)
    const lagnesh = ascendant.lord || this.calculateLagneshFromSign(ascendant.sign)

    // Analyze each planet
    const planetaryAnalysis = this.analyzePlanets(
      planets,
      houses,
      lagnesh,
      currentDasha?.planet || null
    )

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      planetaryAnalysis,
      lagnesh,
      currentDasha?.planet || null
    )

    // Calculate weight recommendation
    const weightRecommendation = calculateGemstoneWeight(bodyWeightKg)

    // Generate safety warnings
    const safetyWarnings = this.generateSafetyWarnings(recommendations, planetaryAnalysis)

    return {
      userId,
      birthData: {
        birthDate,
        birthTime,
        birthPlace,
        latitude,
        longitude
      },
      chartSummary: {
        ascendant: {
          sign: ascendant.sign,
          degree: ascendant.degree,
          lord: lagnesh  // Use calculated lagnesh
        },
        lagnesh,
        currentDasha: currentDasha ? {
          planet: currentDasha.planet,
          startDate: currentDasha.startDate,
          endDate: currentDasha.endDate,
          progress: currentDasha.progress
        } : null
      },
      planetaryAnalysis,
      recommendations,
      weightRecommendation,
      safetyWarnings,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Analyze each planet for benefic/malefic status and recommendations
   */
  private analyzePlanets(
    planets: any[],
    houses: any[],
    lagnesh: string,
    dashaLord: string | null
  ): PlanetaryAnalysis[] {
    const analysis: PlanetaryAnalysis[] = []

    // Create house lord map
    const houseLords: Record<number, string> = {}
    houses.forEach(house => {
      houseLords[house.number] = house.lord
    })

    planets.forEach(planet => {
      const planetName = planet.name
      const planetHouse = planet.house
      const isHouseLord = houseLords[planetHouse] === planetName
      const isLagneshPlanet = planetName === lagnesh
      const isDashaLordPlanet = planetName === dashaLord

      // Determine natural benefic/malefic
      const isNaturalBenefic = this.NATURAL_BENEFICS.includes(planetName)
      const isNaturalMalefic = this.NATURAL_MALEFICS.includes(planetName)

      // Determine functional benefic/malefic based on house lordship
      const isFunctionalBenefic = this.isFunctionalBenefic(
        planetName,
        planetHouse,
        houseLords,
        lagnesh
      )
      const isFunctionalMalefic = !isFunctionalBenefic && (
        this.isMarakaLord(planetName, houseLords) ||
        this.isTrikLord(planetName, houseLords)
      )

      // Check if planet is Maraka (Killer)
      const isMaraka = this.isMarakaLord(planetName, houseLords)

      // Determine strength (simplified - in production, use Shadbala)
      const strength = this.determinePlanetaryStrength(planet)

      // Determine recommendation
      const { recommendation, reason } = this.determineRecommendation(
        planetName,
        isNaturalBenefic,
        isNaturalMalefic,
        isFunctionalBenefic,
        isFunctionalMalefic,
        isMaraka,
        isLagneshPlanet,
        isDashaLordPlanet,
        strength,
        planetHouse
      )

      analysis.push({
        planet: planetName,
        strength,
        isNaturalBenefic,
        isNaturalMalefic,
        isFunctionalBenefic,
        isFunctionalMalefic,
        isMaraka,
        house: planetHouse,
        houseLord: isHouseLord,
        isLagnesh: isLagneshPlanet,
        isDashaLord: isDashaLordPlanet,
        dignity: {
          exalted: false, // Would need to calculate from sign/degree
          debilitated: false,
          ownSign: false,
          moolatrikona: false
        },
        recommendation,
        reason
      })
    })

    return analysis
  }

  /**
   * Determine if planet is functionally benefic
   */
  private isFunctionalBenefic(
    planet: string,
    planetHouse: number,
    houseLords: Record<number, string>,
    lagnesh: string
  ): boolean {
    // Lagnesh (1st house lord) is always functional benefic
    if (planet === lagnesh) return true

    // Lords of 1st, 5th, 9th houses are functional benefics
    if (houseLords[1] === planet || houseLords[5] === planet || houseLords[9] === planet) {
      return true
    }

    // Natural benefics in good houses are functional benefics
    if (this.NATURAL_BENEFICS.includes(planet)) {
      if (!this.TRIK_HOUSES.includes(planetHouse) && planetHouse !== 7) {
        return true
      }
    }

    return false
  }

  /**
   * Check if planet is Maraka (Killer) lord
   */
  private isMarakaLord(planet: string, houseLords: Record<number, string>): boolean {
    return this.MARAKA_HOUSES.some(house => houseLords[house] === planet)
  }

  /**
   * Check if planet is Trik (inauspicious) house lord
   */
  private isTrikLord(planet: string, houseLords: Record<number, string>): boolean {
    return this.TRIK_HOUSES.some(house => houseLords[house] === planet)
  }

  /**
   * Determine planetary strength (simplified)
   */
  private determinePlanetaryStrength(planet: any): PlanetaryAnalysis['strength'] {
    // Simplified strength calculation
    // In production, use Shadbala calculations
    if (planet.dignity?.strength) {
      const strengthMap: Record<string, PlanetaryAnalysis['strength']> = {
        'Very Strong': 'Very Strong',
        'Strong': 'Strong',
        'Comfortable': 'Comfortable',
        'Neutral': 'Neutral',
        'Weak': 'Weak',
        'Very Weak': 'Very Weak'
      }
      return strengthMap[planet.dignity.strength] || 'Neutral'
    }
    return 'Neutral'
  }

  /**
   * Determine gemstone recommendation for planet
   */
  private determineRecommendation(
    planet: string,
    isNaturalBenefic: boolean,
    isNaturalMalefic: boolean,
    isFunctionalBenefic: boolean,
    isFunctionalMalefic: boolean,
    isMaraka: boolean,
    isLagnesh: boolean,
    isDashaLord: boolean,
    strength: PlanetaryAnalysis['strength'],
    house: number
  ): { recommendation: 'recommended' | 'caution' | 'avoid'; reason: string } {
    // Always avoid Maraka planets
    if (isMaraka) {
      return {
        recommendation: 'avoid',
        reason: `Avoid wearing ${planet}'s gemstone as it is a Maraka (Killer) planet, ruling the 2nd or 7th house. This can cause harm.`
      }
    }

    // Avoid natural malefics in Trik houses (6th, 8th, 12th)
    if (isNaturalMalefic && this.TRIK_HOUSES.includes(house)) {
      return {
        recommendation: 'avoid',
        reason: `Avoid wearing ${planet}'s gemstone as it is a natural malefic in an inauspicious house (${house}th house).`
      }
    }

    // Lagnesh is always recommended (Life Stone)
    if (isLagnesh) {
      return {
        recommendation: 'recommended',
        reason: `Highly recommended as Life Stone. ${planet} is your Lagnesh (Ascendant Lord), ruling the 1st house.`
      }
    }

    // Functional benefics are recommended
    if (isFunctionalBenefic && !isNaturalMalefic) {
      if (strength === 'Weak' || strength === 'Very Weak') {
        return {
          recommendation: 'recommended',
          reason: `Recommended to strengthen ${planet}, which is functionally benefic but currently weak in your chart.`
        }
      }
      return {
        recommendation: 'recommended',
        reason: `Recommended as ${planet} is functionally benefic and can enhance positive qualities.`
      }
    }

    // Dasha lord - recommend if benefic, caution if malefic
    if (isDashaLord) {
      if (isFunctionalBenefic || isNaturalBenefic) {
        return {
          recommendation: 'recommended',
          reason: `Recommended during ${planet} Dasha period as it is benefic and can enhance Dasha effects.`
        }
      } else {
        return {
          recommendation: 'caution',
          reason: `Use caution with ${planet}'s gemstone during Dasha. Consult an astrologer first as ${planet} is malefic.`
        }
      }
    }

    // Natural malefics in good houses - caution
    if (isNaturalMalefic && !this.TRIK_HOUSES.includes(house) && house !== 7) {
      return {
        recommendation: 'caution',
        reason: `Use caution with ${planet}'s gemstone. It is a natural malefic but placed in a good house. Consult an astrologer.`
      }
    }

    // Default: avoid
    return {
      recommendation: 'avoid',
      reason: `Not recommended to wear ${planet}'s gemstone based on your chart analysis.`
    }
  }

  /**
   * Generate gemstone recommendations
   */
  private generateRecommendations(
    planetaryAnalysis: PlanetaryAnalysis[],
    lagnesh: string,
    dashaLord: string | null
  ): NavaratnaAnalysis['recommendations'] {
    const recommendations: NavaratnaAnalysis['recommendations'] = {
      lifeStone: null,
      beneficStones: [],
      dashaStone: null,
      avoidedStones: []
    }

    planetaryAnalysis.forEach(analysis => {
      const gemstoneData = getGemstoneByPlanet(analysis.planet)
      if (!gemstoneData) return

      if (analysis.recommendation === 'avoid') {
        recommendations.avoidedStones.push({
          planet: analysis.planet,
          gemstone: gemstoneData.gemstone.english,
          reason: analysis.reason
        })
        return
      }

      if (analysis.recommendation === 'recommended') {
        const recommendation: GemstoneRecommendation = {
          planet: analysis.planet,
          gemstone: gemstoneData.gemstone,
          type: analysis.isLagnesh ? 'life_stone' : 
                analysis.isDashaLord ? 'dasha_stone' : 
                'benefic_stone',
          priority: analysis.isLagnesh ? 'high' : 
                   analysis.isDashaLord ? 'high' : 
                   'medium',
          reason: analysis.reason,
          analysis,
          wearingInstructions: {
            day: gemstoneData.day,
            time: gemstoneData.time,
            metal: gemstoneData.metal,
            finger: gemstoneData.finger,
            hand: gemstoneData.hand,
            pendant: gemstoneData.pendant,
            skinContact: gemstoneData.skinContact,
            purification: gemstoneData.purification,
            mantra: gemstoneData.mantra,
            chanting: gemstoneData.chanting,
            special: gemstoneData.special
          },
          weight: gemstoneData.weight,
          benefits: gemstoneData.benefits,
          warnings: gemstoneData.contraindications
        }

        if (analysis.isLagnesh) {
          recommendations.lifeStone = recommendation
        } else if (analysis.isDashaLord) {
          recommendations.dashaStone = recommendation
        } else {
          recommendations.beneficStones.push(recommendation)
        }
      }
    })

    // Sort benefic stones by priority
    recommendations.beneficStones.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return recommendations
  }

  /**
   * Generate safety warnings
   */
  private generateSafetyWarnings(
    recommendations: NavaratnaAnalysis['recommendations'],
    planetaryAnalysis: PlanetaryAnalysis[]
  ): string[] {
    const warnings: string[] = []

    warnings.push(
      '⚠️ IMPORTANT: Always consult an experienced Vedic astrologer before purchasing and wearing expensive gemstones.',
      '⚠️ Test gemstones for 3-7 days before committing, especially Blue Sapphire (Saturn) and Cat\'s Eye (Ketu).',
      '⚠️ Stop wearing immediately if you experience negative effects such as health issues, financial losses, or relationship problems.',
      '⚠️ Gemstone weight should be calculated based on your body weight (1/10th of body weight in kg, typically 5-8 Ratti).',
      '⚠️ Ensure gemstones are authentic and properly purified before wearing.',
      '⚠️ Follow wearing instructions carefully: correct day, time, metal, finger, and mantra chanting.'
    )

    // Add specific warnings for Saturn/Blue Sapphire
    const hasSaturnRecommendation = recommendations.lifeStone?.planet === 'Saturn' ||
                                   recommendations.dashaStone?.planet === 'Saturn' ||
                                   recommendations.beneficStones.some(r => r.planet === 'Saturn')
    
    if (hasSaturnRecommendation) {
      warnings.push(
        '🔵 SPECIAL WARNING FOR BLUE SAPPHIRE (SATURN): This is a powerful gemstone that requires careful testing. Wear for 3-7 days first. If you experience any negative effects, remove immediately and consult an astrologer.'
      )
    }

    return warnings
  }

  /**
   * Calculate Lagnesh (Ascendant Lord) from ascendant sign
   * Fallback method when ascendant.lord is not provided
   */
  private calculateLagneshFromSign(sign: string): string {
    const signToLord: Record<string, string> = {
      'Aries': 'Mars',
      'Taurus': 'Venus',
      'Gemini': 'Mercury',
      'Cancer': 'Moon',
      'Leo': 'Sun',
      'Virgo': 'Mercury',
      'Libra': 'Venus',
      'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn',
      'Aquarius': 'Saturn',
      'Pisces': 'Jupiter'
    }
    return signToLord[sign] || 'Unknown'
  }
}

export const navaratnaIntelligence = new NavaratnaIntelligence()
