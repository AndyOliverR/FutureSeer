// Vedic Medical Astrology Enhancements
// Hybrid Vedic + Western medical astrology calculations

import { BirthData } from '@/lib/universalOccultService'

interface NakshatraHealth {
  nakshatra: string
  immunity: string
  vitality: string
  sensitivities: string[]
  recommendations: string[]
}

interface VedicHealthIndicator {
  name: string
  description: string
  vedicSource: 'Nakshatra' | 'Dasha' | 'House Lord' | 'Dusthana'
  strength: number
  recommendations: string[]
}

// Nakshatra Health Correlations
export function getNakshatraHealth(nakshatra: string): NakshatraHealth {
  const correlations: Record<string, NakshatraHealth> = {
    'Ashwini': {
      nakshatra: 'Ashwini',
      immunity: 'Strong, quick healing',
      vitality: 'High energy, restless',
      sensitivities: ['Head', 'Eyes'],
      recommendations: ['Moderate physical activity', 'Cooling foods', 'Eye protection']
    },
    'Bharani': {
      nakshatra: 'Bharani',
      immunity: 'Variable, reproductive focus',
      vitality: 'Strong endurance, occasional fatigue',
      sensitivities: ['Reproductive organs'],
      recommendations: ['Sexual health', 'Calcium', 'Iron-rich foods']
    },
    'Krittika': {
      nakshatra: 'Krittika',
      immunity: 'Strong but inflammatory',
      vitality: 'High Pitta, fiery',
      sensitivities: ['Digestion', 'Skin'],
      recommendations: ['Cooling diet', 'Avoid spicy foods', 'Digestive teas']
    },
    'Rohini': {
      nakshatra: 'Rohini',
      immunity: 'Strong, nurturing',
      vitality: 'Stable, fertile',
      sensitivities: ['Reproductive system', 'Throat'],
      recommendations: ['Balanced diet', 'Ginger tea', 'Fertility support']
    },
    'Mrigashira': {
      nakshatra: 'Mrigashira',
      immunity: 'Moderate, nervous sensitivity',
      vitality: 'Active, requires rest',
      sensitivities: ['Nervous system', 'Head'],
      recommendations: ['Stress management', 'Meditation', 'Adequate sleep']
    },
    'Ardra': {
      nakshatra: 'Ardra',
      immunity: 'Variable, healing ability',
      vitality: 'Intense, transformative',
      sensitivities: ['Skin', 'Head'],
      recommendations: ['Toxin elimination', 'Fasting', 'Hair care']
    },
    'Punarvasu': {
      nakshatra: 'Punarvasu',
      immunity: 'Strong, regenerative',
      vitality: 'Restoring, adaptable',
      sensitivities: ['Chest', 'Breathing'],
      recommendations: ['Respiratory health', 'Fresh air', 'Lung exercises']
    },
    'Pushya': {
      nakshatra: 'Pushya',
      immunity: 'Excellent, nourishing',
      vitality: 'Stable, nurturing',
      sensitivities: ['Digestive system'],
      recommendations: ['Nutritious diet', 'Regular meals', 'Digestive enzymes']
    }
  }
  
  return correlations[nakshatra] || {
    nakshatra: nakshatra,
    immunity: 'Variable',
    vitality: 'Moderate',
    sensitivities: ['General'],
    recommendations: ['Balanced lifestyle']
  }
}

// Dosha Analysis from Planetary Positions
export function calculateDoshaFromChart(chart: any): { vata: number, pitta: number, kapha: number, dominant: string } {
  let vata = 0
  let pitta = 0
  let kapha = 0
  
  // Planetary dosha correlations
  const planetDoshas: Record<string, { vata: number, pitta: number, kapha: number }> = {
    'Sun': { vata: 0, pitta: 30, kapha: 0 },
    'Moon': { vata: 0, pitta: 0, kapha: 30 },
    'Mercury': { vata: 25, pitta: 5, kapha: 0 },
    'Venus': { vata: 0, pitta: 0, kapha: 30 },
    'Mars': { vata: 0, pitta: 30, kapha: 0 },
    'Jupiter': { vata: 0, pitta: 0, kapha: 30 },
    'Saturn': { vata: 30, pitta: 0, kapha: 0 },
    'Rahu': { vata: 20, pitta: 10, kapha: 0 },
    'Ketu': { vata: 20, pitta: 10, kapha: 0 },
    'Uranus': { vata: 30, pitta: 0, kapha: 0 },
    'Neptune': { vata: 10, pitta: 0, kapha: 20 },
    'Pluto': { vata: 10, pitta: 20, kapha: 0 }
  }
  
  // Count planetary influences
  if (chart?.planets) {
    Object.entries(chart.planets).forEach(([planet, data]: [string, any]) => {
      const dosha = planetDoshas[planet] || { vata: 0, pitta: 0, kapha: 0 }
      // Weight by house position (health houses increase influence)
      const weight = [6, 8, 12].includes(data.house) ? 1.5 : 1.0
      vata += dosha.vata * weight
      pitta += dosha.pitta * weight
      kapha += dosha.kapha * weight
    })
  }
  
  // Determine dominant dosha
  const dominant = vata > pitta && vata > kapha ? 'Vata' : 
                   pitta > kapha ? 'Pitta' : 'Kapha'
  
  return { vata: Math.round(vata), pitta: Math.round(pitta), kapha: Math.round(kapha), dominant }
}

// Generate Vedic Health Indicators
export function generateVedicHealthIndicators(chart: any, nakshatra?: string): VedicHealthIndicator[] {
  const indicators: VedicHealthIndicator[] = []
  
  // 1. Nakshatra Health Analysis
  if (nakshatra) {
    const nakshatraHealth = getNakshatraHealth(nakshatra)
    indicators.push({
      name: `Moon in ${nakshatra} Nakshatra`,
      description: `${nakshatraHealth.immunity}. ${nakshatraHealth.vitality}. Sensitivities: ${nakshatraHealth.sensitivities.join(', ')}`,
      vedicSource: 'Nakshatra',
      strength: 85,
      recommendations: nakshatraHealth.recommendations
    })
  }
  
  // 2. Dusthana (6/8/12) Analysis
  const dusthanaHouses = [6, 8, 12]
  dusthanaHouses.forEach((houseNum) => {
    const housePlanets = Object.entries(chart?.planets || {}).filter(([_, data]: [string, any]) => data.house === houseNum)
    
    housePlanets.forEach(([planet, data]: [string, any]) => {
      const houseNames: Record<number, string> = {
        6: 'Health',
        8: 'Longevity',
        12: 'Hospitalization'
      }
      
      indicators.push({
        name: `${planet} in ${houseNum}H (${houseNames[houseNum]})`,
        description: `${planet} in Dusthana house ${houseNum} affects ${houseNames[houseNum].toLowerCase()} indicators. Sign: ${data.sign}`,
        vedicSource: 'Dusthana',
        strength: houseNum === 6 ? 60 : houseNum === 8 ? 50 : 40,
        recommendations: [
          houseNum === 6 ? 'Maintain hygiene, prevent infections' :
          houseNum === 8 ? 'Focus on longevity practices' :
          'Avoid stress, support immunity'
        ]
      })
    })
  })
  
  // 3. Dosha Analysis
  const doshaAnalysis = calculateDoshaFromChart(chart)
  indicators.push({
    name: `Ayurvedic Constitution: ${doshaAnalysis.dominant} Dominant`,
    description: `Vata: ${doshaAnalysis.vata}%, Pitta: ${doshaAnalysis.pitta}%, Kapha: ${doshaAnalysis.kapha}%. Balance through lifestyle.`,
    vedicSource: 'House Lord',
    strength: Math.max(doshaAnalysis.vata, doshaAnalysis.pitta, doshaAnalysis.kapha),
    recommendations: [
      doshaAnalysis.dominant === 'Vata' ? 'Warm, grounding foods' :
      doshaAnalysis.dominant === 'Pitta' ? 'Cooling, calming foods' :
      'Light, stimulating foods'
    ]
  })
  
  return indicators
}

// Get Western Transit Timing for Health
export function getWesternHealthTransit(chart: any): any {
  const now = new Date()
  
  // Calculate current planetary positions (simplified approximation)
  const getCurrentPlanetPos = (planetName: string, natalLong: number): number => {
    // Daily movement approximation (rough averages)
    const dailyMovement: Record<string, number> = {
      'Sun': 1.0,
      'Moon': 13.2,
      'Mercury': 1.4,
      'Venus': 1.2,
      'Mars': 0.5,
      'Jupiter': 0.083,
      'Saturn': 0.033,
      'Uranus': 0.014,
      'Neptune': 0.0068,
      'Pluto': 0.0042
    }
    
    const daysSinceEpoch = (now.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24)
    return (natalLong + (dailyMovement[planetName] || 0.1) * daysSinceEpoch) % 360
  }
  
  // Calculate aspect between two positions
  const getAspect = (position1: number, position2: number): { type: string; orb: number } | null => {
    const diff = Math.abs(position1 - position2)
    const orb = diff > 180 ? 360 - diff : diff
    
    // Hard aspects with 8° orb
    if (orb <= 8) return { type: 'conjunction', orb }
    if (Math.abs(orb - 90) <= 8) return { type: 'square', orb }
    if (Math.abs(orb - 120) <= 8) return { type: 'trine', orb }
    if (Math.abs(orb - 180) <= 8) return { type: 'opposition', orb }
    
    return null
  }
  
  const healthTransits: any[] = []
  const healthPlanets = ['Sun', 'Moon', 'Mars', 'Saturn']
  const healthHouses = [1, 6, 8, 12]
  
  // Check transiting planets to health-sensitive natal planets
  if (chart?.planets) {
    Object.entries(chart.planets).forEach(([planetName, natalData]: [string, any]) => {
      if (healthPlanets.includes(planetName)) {
        const natalLong = natalData.longitude || natalData.lonSidereal || 0
        const currentLong = getCurrentPlanetPos(planetName, natalLong)
        
        // Self-transit (planet transiting its own natal position)
        const selfAspect = getAspect(currentLong, natalLong)
        if (selfAspect && selfAspect.type === 'conjunction' && planetName !== 'Moon') {
          healthTransits.push({
            planet: planetName,
            aspect: 'return',
            impact: `${planetName} return - important health cycle`,
            duration: 'Ongoing'
          })
        }
        
        // Transiting Mars to health planets
        if (planetName !== 'Mars') {
          const marsLong = getCurrentPlanetPos('Mars', chart.planets.Mars?.longitude || chart.planets.Mars?.lonSidereal || 0)
          const aspect = getAspect(marsLong, natalLong)
          if (aspect && ['square', 'opposition', 'conjunction'].includes(aspect.type)) {
            healthTransits.push({
              planet: 'Mars',
              aspect: aspect.type,
              impact: `Mars ${aspect.type} natal ${planetName} - watch for inflammation`,
              duration: 'Active'
            })
          }
        }
      }
    })
    
    // Check for planets transiting health houses
    healthHouses.forEach(houseNum => {
      const housePlanets = Object.entries(chart.planets || {}).filter(([_, data]: [string, any]) => data.house === houseNum)
      
      housePlanets.forEach(([planetName, data]: [string, any]) => {
        const natalLong = data.longitude || data.lonSidereal || 0
        const currentLong = getCurrentPlanetPos(planetName, natalLong)
        const aspect = getAspect(currentLong, natalLong)
        
        if (aspect && ['square', 'opposition'].includes(aspect.type)) {
          healthTransits.push({
            planet: planetName,
            aspect: `${aspect.type} to ${houseNum}H`,
            impact: `${planetName} challenges health house ${houseNum}`,
            duration: 'Active'
          })
        }
      })
    })
  }
  
  // Determine current transit message
  if (healthTransits.length > 0) {
    const primaryTransit = healthTransits[0]
    return {
      currentTransit: `${primaryTransit.planet} ${primaryTransit.aspect} - ${primaryTransit.impact}`,
      upcomingTransits: healthTransits.slice(1, 4),
      impact: 'Monitor health during this transit period',
      duration: 'Variable'
    }
  } else {
    return {
      currentTransit: 'Favorable health period - no challenging transits',
      upcomingTransits: [],
      impact: 'Good time for healing and wellness activities',
      duration: 'Current'
    }
  }
}

