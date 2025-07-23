import { generateAstrologicalChart, validateBirthData } from './astroCalculations'

// Fallback astrological data service
// This provides complete astrological calculations when external APIs are unavailable

export interface FallbackAstroData {
  sun_sign: string
  moon_sign: string
  rising_sign: string
  planets: Array<{
    name: string
    sign: string
    degree: number
    house: number
    longitude: number
    latitude: number
    speed: number
    isRetrograde: boolean
  }>
  houses: Array<{
    number: number
    sign: string
    degree: number
    cusp: number
  }>
  aspects: Array<{
    planet1: string
    planet2: string
    type: string
    orb: number
    angle: number
  }>
  elements: {
    fire: number
    earth: number
    air: number
    water: number
  }
  modalities: {
    cardinal: number
    fixed: number
    mutable: number
  }
  personalityTraits: string[]
  lifePath: string
  challenges: string[]
  strengths: string[]
  compatibility: {
    bestMatches: string[]
    challengingMatches: string[]
  }
  metadata: {
    source: 'internal_calculations'
    version: string
    accuracy: string
    timestamp: number
    isFallback: true
  }
}

// Convert birth place to coordinates
export function getCoordinatesFromPlace(birthPlace: string): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    // Try to get coordinates from birth place string
    const commonPlaces = {
      'New York': { latitude: 40.7128, longitude: -74.0060 },
      'Los Angeles': { latitude: 34.0522, longitude: -118.2437 },
      'London': { latitude: 51.5074, longitude: -0.1278 },
      'Paris': { latitude: 48.8566, longitude: 2.3522 },
      'Tokyo': { latitude: 35.6762, longitude: 139.6503 },
      'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
      'Delhi': { latitude: 28.7041, longitude: 77.1025 },
      'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
      'Chennai': { latitude: 13.0827, longitude: 80.2707 },
      'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
      'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
      'Pune': { latitude: 18.5204, longitude: 73.8567 },
      'Ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
      'Jaipur': { latitude: 26.9124, longitude: 75.7873 },
      'Lucknow': { latitude: 26.8467, longitude: 80.9462 },
      'Kanpur': { latitude: 26.4499, longitude: 80.3319 },
      'Nagpur': { latitude: 21.1458, longitude: 79.0882 },
      'Indore': { latitude: 22.7196, longitude: 75.8577 },
      'Thane': { latitude: 19.2183, longitude: 72.9781 },
      'Bhopal': { latitude: 23.2599, longitude: 77.4126 },
      'Visakhapatnam': { latitude: 17.6868, longitude: 83.2185 },
      'Pimpri-Chinchwad': { latitude: 18.6298, longitude: 73.7997 },
      'Patna': { latitude: 25.5941, longitude: 85.1376 },
      'Vadodara': { latitude: 22.3072, longitude: 73.1812 },
      'Ghaziabad': { latitude: 28.6692, longitude: 77.4538 },
      'Ludhiana': { latitude: 30.9010, longitude: 75.8573 },
      'Agra': { latitude: 27.1767, longitude: 78.0081 },
      'Nashik': { latitude: 19.9975, longitude: 73.7898 },
      'Faridabad': { latitude: 28.4089, longitude: 77.3178 },
      'Meerut': { latitude: 28.9845, longitude: 77.7064 },
      'Rajkot': { latitude: 22.3039, longitude: 70.8022 },
      'Kalyan-Dombivali': { latitude: 19.2350, longitude: 73.1295 },
      'Vasai-Virar': { latitude: 19.4259, longitude: 72.8225 },
      'Varanasi': { latitude: 25.3176, longitude: 82.9739 },
      'Srinagar': { latitude: 34.0837, longitude: 74.7973 },
      'Aurangabad': { latitude: 19.8762, longitude: 75.3433 },
      'Dhanbad': { latitude: 23.7957, longitude: 86.4304 },
      'Amritsar': { latitude: 31.6340, longitude: 74.8723 },
      'Allahabad': { latitude: 25.4358, longitude: 81.8463 },
      'Ranchi': { latitude: 23.3441, longitude: 85.3096 },
      'Howrah': { latitude: 22.5958, longitude: 88.2636 },
      'Coimbatore': { latitude: 11.0168, longitude: 76.9558 },
      'Jabalpur': { latitude: 23.1815, longitude: 79.9864 },
      'Gwalior': { latitude: 26.2183, longitude: 78.1828 },
      'Vijayawada': { latitude: 16.5062, longitude: 80.6480 },
      'Jodhpur': { latitude: 26.2389, longitude: 73.0243 },
      'Madurai': { latitude: 9.9252, longitude: 78.1198 },
      'Raipur': { latitude: 21.2514, longitude: 81.6296 },
      'Kota': { latitude: 25.2138, longitude: 75.8648 },
      'Guwahati': { latitude: 26.1445, longitude: 91.7362 },
      'Chandigarh': { latitude: 30.7333, longitude: 76.7794 },
      'Solapur': { latitude: 17.6599, longitude: 75.9064 },
      'Hubli-Dharwad': { latitude: 15.3647, longitude: 75.1240 },
      'Bareilly': { latitude: 28.3670, longitude: 79.4304 },
      'Moradabad': { latitude: 28.8389, longitude: 78.7738 },
      'Mysore': { latitude: 12.2958, longitude: 76.6394 },
      'Gurgaon': { latitude: 28.4595, longitude: 77.0266 },
      'Aligarh': { latitude: 27.8974, longitude: 78.0880 },
      'Jalandhar': { latitude: 31.3260, longitude: 75.5762 },
      'Tiruchirappalli': { latitude: 10.7905, longitude: 78.7047 },
      'Bhubaneswar': { latitude: 20.2961, longitude: 85.8245 },
      'Salem': { latitude: 11.6643, longitude: 78.1460 },
      'Warangal': { latitude: 17.9689, longitude: 79.5941 },
      'Mira-Bhayandar': { latitude: 19.2952, longitude: 72.8544 },
      'Thiruvananthapuram': { latitude: 8.5241, longitude: 76.9366 },
      'Bhiwandi': { latitude: 19.2969, longitude: 73.0626 },
      'Saharanpur': { latitude: 29.9675, longitude: 77.5451 },
      'Gorakhpur': { latitude: 26.7606, longitude: 83.3732 },
      'Guntur': { latitude: 16.2991, longitude: 80.4575 },
      'Bikaner': { latitude: 28.0229, longitude: 73.3119 },
      'Amravati': { latitude: 20.9374, longitude: 77.7796 },
      'Noida': { latitude: 28.5355, longitude: 77.3910 },
      'Jamshedpur': { latitude: 22.8046, longitude: 86.2029 },
      'Bhilai': { latitude: 21.2096, longitude: 81.4285 },
      'Cuttack': { latitude: 20.4625, longitude: 85.8830 },
      'Firozabad': { latitude: 27.1591, longitude: 78.3958 },
      'Kochi': { latitude: 9.9312, longitude: 76.2673 },
      'Nellore': { latitude: 14.4426, longitude: 79.9865 },
      'Bhavnagar': { latitude: 21.7645, longitude: 72.1519 },
      'Dehradun': { latitude: 30.3165, longitude: 78.0322 },
      'Durgapur': { latitude: 23.5204, longitude: 87.3119 },
      'Asansol': { latitude: 23.6889, longitude: 86.9661 },
      'Rourkela': { latitude: 22.2492, longitude: 84.8828 },
      'Nanded': { latitude: 19.1383, longitude: 77.3210 },
      'Kolhapur': { latitude: 16.7050, longitude: 74.2433 },
      'Ajmer': { latitude: 26.4499, longitude: 74.6399 },
      'Akola': { latitude: 20.7096, longitude: 77.0021 },
      'Gulbarga': { latitude: 17.3297, longitude: 76.8343 },
      'Jamnagar': { latitude: 22.4707, longitude: 70.0577 },
      'Ujjain': { latitude: 23.1765, longitude: 75.7885 },
      'Loni': { latitude: 28.7515, longitude: 77.2885 },
      'Siliguri': { latitude: 26.7271, longitude: 88.3953 },
      'Jhansi': { latitude: 25.4484, longitude: 78.5685 },
      'Ulhasnagar': { latitude: 19.2183, longitude: 73.1635 },
      'Jammu': { latitude: 32.7266, longitude: 74.8570 },
      'Sangli-Miraj & Kupwad': { latitude: 16.8524, longitude: 74.5815 },
      'Mangalore': { latitude: 12.9716, longitude: 74.8631 },
      'Erode': { latitude: 11.3410, longitude: 77.7172 },
      'Belgaum': { latitude: 15.8497, longitude: 74.4977 },
      'Ambattur': { latitude: 13.0982, longitude: 80.1614 },
      'Tirunelveli': { latitude: 8.7139, longitude: 77.7567 },
      'Malegaon': { latitude: 20.5538, longitude: 74.5255 },
      'Gaya': { latitude: 24.7914, longitude: 85.0002 },
      'Jalgaon': { latitude: 21.0077, longitude: 75.5626 },
      'Udaipur': { latitude: 24.5854, longitude: 73.7125 },
      'Maheshtala': { latitude: 22.5086, longitude: 88.2532 },
      'Tirupur': { latitude: 11.1085, longitude: 77.3411 },
      'Davanagere': { latitude: 14.4644, longitude: 75.9218 },
      'Kozhikode': { latitude: 11.2588, longitude: 75.7804 },
      'Akbarpur': { latitude: 26.4307, longitude: 82.5363 },
      'Kurnool': { latitude: 15.8281, longitude: 78.0373 },
      'Bokaro Steel City': { latitude: 23.6693, longitude: 86.1511 },
      'Rajahmundry': { latitude: 17.0005, longitude: 81.8040 },
      'Ballari': { latitude: 15.1394, longitude: 76.9214 },
      'Agartala': { latitude: 23.8315, longitude: 91.2868 },
      'Bhagalpur': { latitude: 25.2445, longitude: 87.0108 },
      'Dhule': { latitude: 20.9029, longitude: 74.7773 },
      'Korba': { latitude: 22.3458, longitude: 82.6963 },
      'Bhilwara': { latitude: 25.3463, longitude: 74.6364 },
      'Brahmapur': { latitude: 19.3149, longitude: 84.7941 },
      'Muzaffarpur': { latitude: 26.1209, longitude: 85.3647 },
      'Ahmednagar': { latitude: 19.0952, longitude: 74.7496 },
      'Mathura': { latitude: 27.4924, longitude: 77.6737 },
      'Kollam': { latitude: 8.8932, longitude: 76.6141 },
      'Avadi': { latitude: 13.1147, longitude: 80.0997 },
      'Kadapa': { latitude: 14.4753, longitude: 78.8354 },
      'Anantapur': { latitude: 14.6819, longitude: 77.6006 },
      'Tiruvottiyur': { latitude: 13.1579, longitude: 80.3045 },
      'Bhatpara': { latitude: 22.8664, longitude: 88.4011 },
      'Parbhani': { latitude: 19.2606, longitude: 76.7827 },
      'Panihati': { latitude: 22.6948, longitude: 88.3744 }
    }

    // Try to find exact match first
    const exactMatch = commonPlaces[birthPlace as keyof typeof commonPlaces]
    if (exactMatch) {
      resolve(exactMatch)
      return
    }

    // Try to find partial matches
    const placeLower = birthPlace.toLowerCase()
    for (const [place, coords] of Object.entries(commonPlaces)) {
      if (place.toLowerCase().includes(placeLower) || placeLower.includes(place.toLowerCase())) {
        resolve(coords)
        return
      }
    }

    // Default to New York if no match found
    console.warn(`No coordinates found for "${birthPlace}", using default`)
    resolve({ latitude: 40.7128, longitude: -74.0060 })
  })
}

// Generate fallback astrological data
export async function generateFallbackAstroData(
  birthDate: string, 
  birthPlace: string, 
  birthTime: string = "12:00"
): Promise<FallbackAstroData> {
  try {
    console.log('Generating fallback astrological data using internal calculations')
    
    // Validate input data
    const validation = validateBirthData(birthDate, birthTime, 0, 0)
    if (!validation.isValid) {
      throw new Error(`Invalid birth data: ${validation.errors.join(', ')}`)
    }

    // Get coordinates from birth place
    const coordinates = await getCoordinatesFromPlace(birthPlace)
    
    // Generate complete astrological chart
    const chart = generateAstrologicalChart(
      birthDate, 
      birthTime, 
      coordinates.latitude, 
      coordinates.longitude
    )

    // Transform to expected format
    const fallbackData: FallbackAstroData = {
      sun_sign: chart.sun_sign,
      moon_sign: chart.moon_sign,
      rising_sign: chart.rising_sign,
      planets: chart.planets,
      houses: chart.houses,
      aspects: chart.aspects,
      elements: chart.elements,
      modalities: chart.modalities,
      personalityTraits: chart.personalityTraits,
      lifePath: chart.lifePath,
      challenges: chart.challenges,
      strengths: chart.strengths,
      compatibility: chart.compatibility,
      metadata: {
        source: 'internal_calculations' as const,
        version: chart.metadata.version,
        accuracy: chart.metadata.accuracy,
        timestamp: chart.metadata.timestamp,
        isFallback: true
      }
    }

    console.log('Successfully generated fallback astrological data')
    return fallbackData

  } catch (error) {
    console.error('Error generating fallback astrological data:', error)
    throw new Error(`Failed to generate fallback data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Check if fallback data is available and reliable
export function isFallbackDataReliable(birthDate: string, birthPlace: string): boolean {
  // Basic validation
  if (!birthDate || !birthPlace) {
    return false
  }

  // Check if birth date is reasonable (not in future, not too far in past)
  const date = new Date(birthDate)
  const now = new Date()
  const minDate = new Date('1900-01-01')
  
  if (date > now || date < minDate) {
    return false
  }

  return true
}

// Get accuracy level of fallback calculations
export function getFallbackAccuracy(): string {
  return 'high' // Our calculations are designed to be highly accurate
}

// Get supported features
export function getSupportedFeatures(): string[] {
  return [
    'Planetary positions',
    'House calculations',
    'Aspect analysis',
    'Element and modality calculations',
    'Personality insights',
    'Compatibility analysis',
    'Life path interpretation'
  ]
} 