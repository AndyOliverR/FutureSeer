"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, 
  User, 
  Star, 
  Globe, 
  Home, 
  Sparkles,
  Zap,
  Heart,
  Briefcase,
  Activity,
  TrendingUp,
  Gem,
  Loader2,
  Info,
  RefreshCw,
  Target,
  Brain,
  Shield
} from "lucide-react"
import { AffiliateLink } from '@/components/AffiliateLink'
import { getGemstoneAffiliateUrl } from '@/lib/affiliateConfig'
import NorthIndianVedicChart from "@/components/NorthIndianVedicChart"
import VedicSouthChart from "@/components/VedicSouthChart"
import { KPAstrologyCoachInterface } from "@/components/KPAstrologyCoachInterface"
import KPSeerChatInterface from "@/components/KPSeerChatInterface"
import { KPAnalysis as KPIntelligenceAnalysis } from "@/lib/kpAstrologyIntelligence"
import { useAuth } from "@/hooks/use-auth"
import { getPermanentChart, storeCurrentChart, getCurrentChart, ChartStorage } from '@/lib/chartStorage'

// Helper functions for generating interpretations
const getPlanetInterpretation = (planet: string, sign: string, house: number, nakshatra: string, sublord: string): string => {
  const planetNames: Record<string, string> = {
    'Sun': 'Your Sun represents your core identity, ego, and life force',
    'Moon': 'Your Moon reflects your emotional nature, intuition, and inner self',
    'Mars': 'Mars governs your energy, courage, and drive',
    'Mercury': 'Mercury influences communication, intellect, and reasoning',
    'Jupiter': 'Jupiter brings wisdom, expansion, and spiritual growth',
    'Venus': 'Venus rules love, beauty, relationships, and pleasures',
    'Saturn': 'Saturn teaches discipline, responsibility, and life lessons',
    'Rahu': 'Rahu represents desires, innovation, and worldly pursuits',
    'Ketu': 'Ketu signifies spirituality, detachment, and past-life karma'
  }
  
  const houseMeanings: Record<number, string> = {
    1: 'affects your personality and physical appearance',
    2: 'influences wealth, family, and speech',
    3: 'rules courage, siblings, and communication',
    4: 'governs home, mother, and emotional foundation',
    5: 'controls creativity, education, and children',
    6: 'relates to health, service, and obstacles',
    7: 'signifies partnerships, marriage, and business',
    8: 'represents transformation, longevity, and mysteries',
    9: 'rules spirituality, higher learning, and fortune',
    10: 'controls career, reputation, and public life',
    11: 'governs gains, friendships, and aspirations',
    12: 'signifies losses, spirituality, and liberation'
  }
  
  const sublordMeanings: Record<string, string> = {
    'Sun': 'with solar sub-lord energy emphasizing authority and leadership',
    'Moon': 'with lunar sub-lord bringing emotional sensitivity and intuition',
    'Mars': 'with martial sub-lord indicating dynamic action and initiative',
    'Mercury': 'with mercurial sub-lord highlighting communication and adaptability',
    'Jupiter': 'with jovian sub-lord expanding wisdom and opportunity',
    'Venus': 'with venusian sub-lord enhancing relationships and creativity',
    'Saturn': 'with saturnine sub-lord teaching patience and structure',
    'Rahu': 'with rahu sub-lord bringing innovation and worldly desires',
    'Ketu': 'with ketu sub-lord focusing on spirituality and detachment'
  }
  
  const base = planetNames[planet] || `${planet} influences specific areas of your life`
  const houseInfo = houseMeanings[house] || `in house ${house}`
  const sublordInfo = sublordMeanings[sublord] || `with ${sublord} sub-lord influence`
  
  return `${base}, ${houseInfo}. The ${nakshatra} nakshatra and ${sublordInfo} create unique timing influences in your chart.`
}

const getHouseInterpretation = (house: number, sign: string, sublord: string): string => {
  const houseNames: Record<number, string> = {
    1: 'Personality & Self', 2: 'Wealth & Family', 3: 'Courage & Siblings',
    4: 'Home & Mother', 5: 'Creativity & Children', 6: 'Health & Service',
    7: 'Partnerships & Marriage', 8: 'Transformation & Longevity', 9: 'Spirituality & Fortune',
    10: 'Career & Reputation', 11: 'Gains & Friendships', 12: 'Spirituality & Liberation'
  }
  
  const sublordInfluences: Record<string, string> = {
    'Sun': 'Leadership qualities and authority will be prominent',
    'Moon': 'Emotional sensitivity and intuitive abilities are highlighted',
    'Mars': 'Dynamic action and courage characterize this area',
    'Mercury': 'Communication and intellectual pursuits are favored',
    'Jupiter': 'Wisdom, expansion, and positive growth are indicated',
    'Venus': 'Relationships, creativity, and pleasures are enhanced',
    'Saturn': 'Discipline, patience, and structured progress are needed',
    'Rahu': 'Innovation, worldly desires, and unconventional paths',
    'Ketu': 'Spiritual growth and detachment from materialism'
  }
  
  return `Your ${houseNames[house]} house (${sign}) with ${sublord} sub-lord suggests ${sublordInfluences[sublord] || 'unique influences'} in this life area.`
}

const getDashaInfluence = (dasha: string): { focus: string, events: string[] } => {
  const influences: Record<string, { focus: string, events: string[] }> = {
    'Sun': { focus: 'Leadership, authority, recognition, and career advancement', events: ['Professional opportunities', 'Government connections', 'Recognition for achievements', 'Leadership roles'] },
    'Moon': { focus: 'Emotional growth, public matters, and domestic harmony', events: ['Emotional healing', 'Home improvements', 'Public recognition', 'Nurturing relationships'] },
    'Mars': { focus: 'Energy, courage, property, and assertive actions', events: ['New ventures', 'Property matters', 'Physical activities', 'Competitive success'] },
    'Mercury': { focus: 'Communication, business, education, and intellectual pursuits', events: ['Business opportunities', 'Educational achievements', 'Writing or speaking', 'Short journeys'] },
    'Jupiter': { focus: 'Wisdom, expansion, children, and spiritual growth', events: ['Educational pursuits', 'Spiritual growth', 'Family expansion', 'Financial gains'] },
    'Venus': { focus: 'Relationships, arts, luxury, and pleasures', events: ['Romantic relationships', 'Artistic pursuits', 'Luxury purchases', 'Social connections'] },
    'Saturn': { focus: 'Discipline, hard work, obstacles, and service', events: ['Career challenges', 'Service to others', 'Delayed gratification', 'Long-term projects'] },
    'Rahu': { focus: 'Innovation, foreign connections, technology, and desires', events: ['Foreign travel', 'Technological opportunities', 'Unconventional paths', 'Material desires'] },
    'Ketu': { focus: 'Spirituality, research, detachment, and past-life karma', events: ['Spiritual practices', 'Research activities', 'Letting go of attachments', 'Mystical experiences'] }
  }
  
  return influences[dasha] || { focus: 'Balanced growth and development', events: ['Personal growth', 'Life opportunities', 'Inner development'] }
}

const getRemedyExplanation = (remedy: string, planet?: string): { explanation: string, benefits: string, instructions?: string } => {
  const explanations: Record<string, { explanation: string, benefits: string, instructions?: string }> = {
    'Chant mantras for': {
      explanation: `Mantras for ${planet} help align your energy with the planetary influence, reducing negative effects and enhancing positive qualities.`,
      benefits: 'Brings harmony, reduces obstacles, and strengthens the planetary energy in your chart.',
      instructions: `Chant ${planet === 'Sun' ? 'Gayatri Mantra' : planet === 'Moon' ? 'Om Som Somaya Namah' : `the specific mantra for ${planet}`} daily, ideally during the planetary hour or sunrise.`
    },
    'Wear gemstones': {
      explanation: 'Gemstones resonate with specific planetary energies, helping balance and strengthen those influences in your chart.',
      benefits: 'Enhances positive planetary effects, protects from negative influences, and attracts favorable energies.',
      instructions: 'Wear the recommended gemstone after proper consultation, ideally on the appropriate finger and during an auspicious time.'
    },
    'Perform charitable acts': {
      explanation: 'Charitable acts help balance karma and create positive energy that aligns with planetary beneficence.',
      benefits: 'Reduces negative karma, attracts positive opportunities, and creates spiritual merit.',
      instructions: 'Perform charity on auspicious days, particularly during the planetary day of the week.'
    },
    'Maintain positive thoughts': {
      explanation: 'Your mental state directly influences how planetary energies manifest in your life.',
      benefits: 'Attracts positive experiences, reduces stress, and helps manifest favorable outcomes.',
      instructions: 'Practice meditation, affirmations, and mindfulness daily to maintain positive mental energy.'
    }
  }
  
  if (remedy.includes('Chant mantras')) {
    return explanations['Chant mantras for']
  } else if (remedy.includes('gemstone')) {
    return explanations['Wear gemstones']
  } else if (remedy.includes('charitable')) {
    return explanations['Perform charitable acts']
  } else if (remedy.includes('positive thoughts')) {
    return explanations['Maintain positive thoughts']
  }
  
  return {
    explanation: 'This remedy is recommended based on your KP chart analysis to balance planetary influences.',
    benefits: 'Helps align your energy with favorable cosmic influences and reduce obstacles.'
  }
}

// Transform KP analysis planetary positions to NorthIndianVedicChart format
// Calculate planetary dignity based on Vedic astrology rules
const calculatePlanetaryDignity = (planetName: string, sign: number, signName: string): { exalted: boolean; debilitated: boolean; ownSign: boolean } => {
  const planet = planetName.toLowerCase()
  const signLower = signName.toLowerCase()
  
  // Exaltation signs
  const exaltationSigns: Record<string, string> = {
    'sun': 'aries',
    'moon': 'taurus',
    'mars': 'capricorn',
    'mercury': 'virgo',
    'jupiter': 'cancer',
    'venus': 'pisces',
    'saturn': 'libra'
  }
  
  // Debilitation signs
  const debilitationSigns: Record<string, string> = {
    'sun': 'libra',
    'moon': 'scorpio',
    'mars': 'cancer',
    'mercury': 'pisces',
    'jupiter': 'capricorn',
    'venus': 'virgo',
    'saturn': 'aries'
  }
  
  // Own signs (multiple signs per planet)
  const ownSigns: Record<string, string[]> = {
    'sun': ['leo'],
    'moon': ['cancer'],
    'mars': ['aries', 'scorpio'],
    'mercury': ['gemini', 'virgo'],
    'jupiter': ['sagittarius', 'pisces'],
    'venus': ['taurus', 'libra'],
    'saturn': ['capricorn', 'aquarius']
  }
  
  const exalted = exaltationSigns[planet] === signLower
  const debilitated = debilitationSigns[planet] === signLower
  const ownSign = ownSigns[planet]?.includes(signLower) || false
  
  return { exalted, debilitated, ownSign }
}

const transformKPPlanetsForChart = (planetaryPositions: any[]): Array<{ name: string; sign: number; degreeInSign: number; isRetrograde: boolean }> => {
  if (!planetaryPositions || !Array.isArray(planetaryPositions)) return []
  
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  
  const getSignIndex = (signName: string): number => {
    const index = signNames.findIndex(s => s.toLowerCase() === signName.toLowerCase())
    return index >= 0 ? index : 0
  }
  
  return planetaryPositions.map((planet: any) => {
    const planetName = (planet.planet || planet.name || '').charAt(0).toUpperCase() + (planet.planet || planet.name || '').slice(1).toLowerCase()
    const signName = planet.sign || 'Aries'
    const sign = getSignIndex(signName)
    const degree = planet.degree || 0
    // Extract degree in sign (assuming degree is already in sign format or convert from absolute degree)
    const degreeInSign = degree >= 30 ? degree % 30 : degree
    const isRetrograde = planet.isRetrograde || planet.retrograde || false
    
    return {
      name: planetName,
      sign,
      degreeInSign,
      isRetrograde
    }
  })
}

interface KPAnalysis {
  basicInfo: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    currentLocation?: string;
  };
  birthChart?: string;
  chartOverview?: string;
  planetaryPositions?: Record<string, any>;
  houses?: Array<{
    house: number;
    sign: string;
    degree: string;
    lord: string;
  }>;
  aspects?: any;
  interpretations?: {
    personality?: string;
    lifePath?: string;
    career?: string;
    relationships?: string;
    health?: string;
    wealth?: string;
    spiritual?: string;
    strengths?: string[];
    challenges?: string[];
    recommendations?: string[];
    kpSpecific?: {
      sublords?: string[];
      dashaPeriods?: string[];
      transits?: string[];
      predictions?: string[];
    };
  };
  isRealData?: boolean;
  rawAstroAppData?: any;
  ascendant?: string;
  moonSign?: string;
  sunSign?: string;
}

export default function KPAstrologyPage() {
  const { user, userProfile } = useAuth()
  const [analysis, setAnalysis] = useState<KPAnalysis | null>(null)
  
  // Debug: Log analysis state changes
  useEffect(() => {
    console.log('🔍 Analysis state changed:', {
      hasAnalysis: !!analysis,
      hasBasicInfo: !!analysis?.basicInfo,
      basicInfo: analysis?.basicInfo ? {
        name: analysis.basicInfo.name,
        dateOfBirth: analysis.basicInfo.dateOfBirth,
        timeOfBirth: analysis.basicInfo.timeOfBirth,
        placeOfBirth: analysis.basicInfo.placeOfBirth
      } : null,
      hasRawData: !!analysis?.rawAstroAppData,
      hasInterpretations: !!analysis?.interpretations,
      hasAscendant: !!analysis?.rawAstroAppData?.ascendant,
      analysisKeys: analysis ? Object.keys(analysis) : []
    })
  }, [analysis])
  const [currentTransits, setCurrentTransits] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTransits, setIsLoadingTransits] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'chart_images' | 'planetary_positions' | 'sublord_analysis' | 'dasha_forecast' | 'remedies' | 'current_transits' | 'kp_astrology_expert'>('chart_images')

  // Check if user has complete profile
  const hasCompleteProfile = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Transform analysis data to KPAnalysis format for KPAstrologyCoachInterface
  const transformToKPIntelligenceAnalysis = (): KPIntelligenceAnalysis | null => {
    if (!analysis?.rawAstroAppData) return null

    const raw = analysis.rawAstroAppData

    return {
      ascendant: {
        sign: raw.ascendant?.sign || 'Aries',
        degree: raw.ascendant?.degree || 0,
        subLord: raw.ascendant?.subLord || 'Sun',
        starLord: raw.ascendant?.starLord || raw.ascendant?.nakshatraLord || 'Sun',
        nakshatra: raw.ascendant?.nakshatra || 'Unknown',
        nakshatraLord: raw.ascendant?.nakshatraLord || raw.ascendant?.starLord || 'Sun'
      },
      planets: (raw.planetary_positions || []).map((p: any) => ({
        name: p.planet || p.name || 'Sun',
        sign: p.sign || 'Aries',
        degree: p.degree || 0,
        subLord: p.sublord || p.subLord || 'Sun',
        starLord: p.nakshatraLord || p.starLord || 'Sun',
        house: p.house || 1,
        nakshatra: p.nakshatra || 'Unknown',
        nakshatraLord: p.nakshatraLord || 'Sun'
      })),
      cusps: (raw.house_analysis || []).map((c: any) => ({
        house: c.house || 1,
        sign: c.sign || 'Aries',
        degree: c.degree || 0,
        subLord: c.sublord || c.subLord || 'Sun',
        starLord: c.starLord || 'Sun',
        nakshatra: c.nakshatra || 'Unknown',
        nakshatraLord: c.nakshatraLord || 'Sun'
      })),
      subLords: (raw.sublord_analysis?.sublords || []).map((sl: any) => ({
        planet: sl.planet || 'Sun',
        subLords: sl.sublord ? [sl.sublord] : ['Sun'],
        significations: sl.influence ? sl.influence.split(', ') : []
      })),
      timingAnalysis: {
        dasha: raw.dasha_forecast?.[0]?.planet || 'Moon',
        antardasha: raw.dasha_forecast?.[0]?.antardasha || 'Sun',
        pratyantardasha: raw.dasha_forecast?.[0]?.pratyantardasha || 'Mars',
        currentPeriod: raw.dasha_forecast?.[0]?.description || 'Current dasha period',
        nextPeriod: raw.dasha_forecast?.[0]?.nextPeriod || 'Next dasha period'
      },
      significations: {
        career: raw.significations?.career || [],
        relationships: raw.significations?.relationships || [],
        health: raw.significations?.health || [],
        wealth: raw.significations?.wealth || [],
        education: raw.significations?.education || [],
        travel: raw.significations?.travel || []
      },
      predictions: {
        shortTerm: raw.predictions?.shortTerm || '',
        mediumTerm: raw.predictions?.mediumTerm || '',
        longTerm: raw.predictions?.longTerm || '',
        remedies: (raw.remedies || []).map((r: any) => ({
          type: r.type || 'lifestyle',
          planet: r.planet || 'General',
          name: typeof r === 'string' ? r : (r.name || r.remedy || 'Remedy'),
          description: typeof r === 'string' ? r : (r.description || r.remedy || 'KP remedy'),
          instructions: typeof r === 'string' ? [] : (Array.isArray(r.instructions) ? r.instructions : []),
          benefits: typeof r === 'string' ? [] : (Array.isArray(r.benefits) ? r.benefits : []),
          frequency: typeof r === 'string' ? undefined : r.frequency,
          explanation: typeof r === 'string' ? 'Based on KP sub-lord analysis' : (r.explanation || 'Based on KP chart analysis'),
          priority: typeof r === 'string' ? 'medium' : (r.priority || 'medium')
        }))
      }
    }
  }

  const fetchCurrentTransits = useCallback(async () => {
    if (!hasCompleteProfile || !userProfile?.uid) return

    setIsLoadingTransits(true)
    try {
      console.log('🔄 Fetching current transits for KP astrology...')
      const response = await fetch('/api/tools/kp-astrology/current-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.uid,
          birthData: {
            birthDate: userProfile.birthDate,
            birthTime: userProfile.birthTime,
            birthPlace: userProfile.birthPlace,
            displayName: userProfile.displayName || 'User'
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('📡 Transits API response:', {
          success: result.success,
          hasData: !!result.data,
          activeTransitsCount: result.data?.activeTransits?.length || 0,
          upcomingTransitsCount: result.data?.upcomingTransits?.length || 0
        })
        
        if (result.success) {
          setCurrentTransits(result.data)
          // Store current transits with shorter cache time
          storeCurrentChart(
            userProfile.uid || 'default', 
            'kp-astrology', 
            result.data, 
            {
              birthDate: userProfile.birthDate ?? '',
              birthTime: userProfile.birthTime ?? '',
              birthPlace: userProfile.birthPlace ?? '',
              displayName: userProfile.displayName || 'User'
            },
            { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
          )
          console.log('✅ Fresh current transits loaded and cached:', {
            activeTransits: result.data?.activeTransits?.length || 0,
            upcomingTransits: result.data?.upcomingTransits?.length || 0
          })
        } else {
          console.warn('⚠️ Failed to fetch transits:', result.error)
          setCurrentTransits(null) // Clear transits on error
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.warn('⚠️ Transits API error:', response.status, errorData.error || 'Unknown error')
        setCurrentTransits(null) // Clear transits on error
      }
    } catch (err) {
      console.error('❌ Error loading current transits:', err)
    } finally {
      setIsLoadingTransits(false)
    }
  }, [hasCompleteProfile, userProfile?.uid, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.displayName])

  const loadCurrentTransits = useCallback(async () => {
    if (!hasCompleteProfile || !userProfile?.uid) return

    // First try to load cached current transits
    const cachedTransits = getCurrentChart(userProfile.uid || 'default', 'kp-astrology')
    if (cachedTransits) {
      setCurrentTransits(cachedTransits)
      console.log('✅ Loaded current transits from cache')
      return
    }

    // If no cached transits, fetch fresh ones
    await fetchCurrentTransits()
  }, [hasCompleteProfile, userProfile?.uid, fetchCurrentTransits])

  const performKPAnalysis = useCallback(async () => {
    if (!hasCompleteProfile) {
      setError('Please complete your profile with birth date, time, and place')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Generating KP Astrology report...')
      
      const formattedBirthData = {
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime,
        birthPlace: userProfile.birthPlace,
        displayName: userProfile.fullName || userProfile.displayName || 'User'
      }
      
      // Generate KP astrology report using the new API endpoint
      console.log('📡 Calling KP astrology API endpoint...', {
        userId: userProfile.uid,
        birthData: formattedBirthData
      })

      const response = await fetch('/api/tools/kp-astrology/generate-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.uid || 'user',
          birthData: formattedBirthData
        })
      })

      console.log('📡 API Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('❌ API Error Response:', errorData)
        throw new Error(errorData.error || `Failed to generate KP astrology report (${response.status})`)
      }

      const result = await response.json()
      console.log('📡 API Response received:', {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      })
      
      if (!result.success) {
        console.error('❌ API returned error:', result.error)
        throw new Error(result.error || 'Failed to generate KP astrology report')
      }

      if (!result.data) {
        console.error('❌ API response missing data field')
        throw new Error('API response missing data field')
      }

      const kpData = result.data // This is KPAnalysis from intelligence service
      console.log('✅ KP Astrology data received:', {
        hasAscendant: !!kpData.ascendant,
        ascendantSign: kpData.ascendant?.sign,
        hasPlanets: !!kpData.planets && kpData.planets.length > 0,
        planetsCount: kpData.planets?.length || 0,
        hasCusps: !!kpData.cusps && kpData.cusps.length > 0,
        cuspsCount: kpData.cusps?.length || 0,
        hasSubLords: !!kpData.subLords && kpData.subLords.length > 0,
        subLordsCount: kpData.subLords?.length || 0,
        hasTimingAnalysis: !!kpData.timingAnalysis,
        timingDasha: kpData.timingAnalysis?.dasha,
        hasSignifications: !!kpData.significations,
        hasPredictions: !!kpData.predictions
      })
      
      // Transform KP analysis to page format
      const sunPlanet = kpData.planets?.find((p: any) => p.name === 'Sun')
      const moonPlanet = kpData.planets?.find((p: any) => p.name === 'Moon')
      const venusPlanet = kpData.planets?.find((p: any) => p.name === 'Venus')
      
      // Create KP astrology analysis in page format
      const analysisData: KPAnalysis = {
        basicInfo: {
          name: userProfile.fullName || 'User',
          dateOfBirth: userProfile.birthDate || '',
          timeOfBirth: userProfile.birthTime || '',
          placeOfBirth: userProfile.birthPlace || ''
        },
        // Store raw KP data for access
        rawAstroAppData: {
          ascendant: kpData.ascendant,
          planetary_positions: kpData.planets?.map((p: any) => ({
            planet: p.name,
            sign: p.sign,
            degree: p.degree,
            house: p.house,
            nakshatra: p.nakshatra,
            sublord: p.subLord,
            starLord: p.starLord
          })) || [],
          significations: kpData.significations || {},
          sublord_analysis: {
            summary: {
              totalSublords: kpData.subLords?.length || 0,
              dominantSublord: kpData.subLords?.[0]?.planet || 'Unknown',
              strongestSublord: kpData.subLords?.[0]?.planet || 'Unknown'
            },
            sublords: kpData.subLords?.map((sl: any) => ({
              planet: sl.planet,
              sublord: sl.subLords?.[0] || sl.planet,
              influence: sl.significations?.join(', ') || 'KP analysis pending',
              strength: 'moderate'
            })) || []
          },
          dasha_forecast: [{
            planet: kpData.timingAnalysis?.dasha || 'Moon',
            description: kpData.timingAnalysis?.currentPeriod || 'Current dasha period',
            antardasha: kpData.timingAnalysis?.antardasha || 'Unknown',
            pratyantardasha: kpData.timingAnalysis?.pratyantardasha || 'Unknown',
            nextPeriod: kpData.timingAnalysis?.nextPeriod || 'Unknown',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            focus_area: kpData.significations?.career?.[0] || 'General life matters',
            likely_events: kpData.predictions?.shortTerm || 'KP predictions pending'
          }],
          predictions: kpData.predictions || {},
          remedies: kpData.predictions?.remedies?.map((r: string) => ({
            type: 'General',
            remedy: r,
            benefits: 'Based on KP sub-lord analysis'
          })) || [],
          house_analysis: kpData.cusps?.map((c: any) => ({
            house: c.house,
            sign: c.sign,
            degree: c.degree,
            sublord: c.subLord
          })) || []
        },
        isRealData: true,
        sunSign: sunPlanet?.sign || 'Unknown',
        moonSign: moonPlanet?.sign || 'Unknown',
        ascendant: kpData.ascendant?.sign || 'Unknown',
        // Add interpretations based on real data
        interpretations: {
          personality: `As a ${sunPlanet?.sign || 'Sun'} sign with ${moonPlanet?.sign || 'Moon'} in your emotional nature, your KP chart reveals unique characteristics based on sub-lord influences.`,
          lifePath: `Your ${kpData.ascendant?.sign || 'Rising Sign'} with ${kpData.ascendant?.subLord || 'sub-lord'} sublord suggests a life journey focused on personal development and growth.`,
          career: kpData.significations?.career?.join(', ') || 'KP career analysis pending',
          relationships: kpData.significations?.relationships?.join(', ') || 'KP relationship analysis pending',
          health: kpData.significations?.health?.join(', ') || 'KP health analysis pending',
          wealth: kpData.significations?.wealth?.join(', ') || 'KP wealth analysis pending',
          spiritual: `Your KP chart reveals spiritual insights through ${kpData.ascendant?.nakshatra || 'nakshatra'} and sub-lord connections.`,
          strengths: kpData.predictions?.remedies?.slice(0, 3).map((r: any) => typeof r === 'string' ? r : r.name || r.description || 'Strength') || ['Natural leadership', 'Creative expression', 'Intellectual depth'],
          challenges: ['Perfectionism', 'Emotional sensitivity', 'High expectations'],
          recommendations: kpData.predictions?.remedies?.map((r: any) => typeof r === 'string' ? r : r.name || r.description || 'Recommendation') || ['Practice self-compassion', 'Develop emotional boundaries', 'Embrace imperfection'],
          kpSpecific: {
            sublords: kpData.subLords?.map((sl: any) => `${sl.planet}: ${sl.subLords?.[0] || 'Unknown'} sublord`) || ['Detailed sublord analysis would go here'],
            dashaPeriods: [`${kpData.timingAnalysis?.dasha || 'Moon'} Dasha: ${kpData.timingAnalysis?.currentPeriod || 'Current period'}`],
            transits: ['Important planetary transits'],
            predictions: [kpData.predictions?.shortTerm || 'KP predictions pending']
          }
        }
      }

      console.log('✅ KP analysis data transformed successfully:', {
        hasBasicInfo: !!analysisData.basicInfo,
        hasRawData: !!analysisData.rawAstroAppData,
        hasInterpretations: !!analysisData.interpretations,
        sunSign: analysisData.sunSign,
        moonSign: analysisData.moonSign,
        ascendant: analysisData.ascendant
      })

      setAnalysis(analysisData)
      setError(null)
      
      // Store as permanent data (birth chart doesn't change)
      // Note: storePermanentChart stores data in chartUrl property, so we need to pass it as a string or JSON
      // But since we're storing an object, we'll JSON.stringify it for proper storage
      try {
        // Store using the chart storage - the data goes into chartUrl property
        // We need to pass birthData separately for validation
        const birthDataForStorage = {
          birthDate: userProfile.birthDate || '',
          birthTime: userProfile.birthTime || '',
          birthPlace: userProfile.birthPlace || '',
          displayName: userProfile.fullName || userProfile.displayName || 'User'
        }
        
        // Use ChartStorage instance directly to include birthData for validation
        // The export wrapper storeChart doesn't support birthData parameter properly
        // Note: storeChart is async but we don't await it since caching failure shouldn't block the UI
        ChartStorage.getInstance().storeChart(
          userProfile.uid || 'default', 
          'kp-astrology' as any, 
          JSON.stringify(analysisData), // Store as JSON string in chartUrl
          'futureseer-generator',
          birthDataForStorage,
          { analysisData } // Also store in metadata for easier retrieval
        ).catch(err => {
          console.warn('⚠️ Failed to store chart:', err)
        })
        
        console.log('✅ KP analysis stored in cache with birth data validation')
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache KP analysis:', cacheError)
        // Don't throw - caching failure shouldn't prevent analysis display
      }
      
      // Also load current transits (don't wait for it to complete)
      loadCurrentTransits().catch(err => {
        console.warn('⚠️ Failed to load current transits:', err)
        // Don't throw - transits are optional
      })
      
    } catch (err: any) {
      console.error('❌ KP Astrology analysis failed:', {
        error: err,
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      const errorMessage = err.message || 'Failed to perform KP astrology analysis'
      setError(errorMessage)
      setAnalysis(null) // Clear any partial analysis on error
    } finally {
      setIsLoading(false)
      console.log('✅ KP analysis process completed, loading state:', false)
    }
  }, [hasCompleteProfile, userProfile?.uid, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.fullName, userProfile?.displayName, loadCurrentTransits])

  // Auto-generate analysis when component loads and user has complete profile
  useEffect(() => {
    if (!user || !userProfile || !hasCompleteProfile) {
      console.log('⏳ Waiting for user profile...', { hasUser: !!user, hasProfile: !!userProfile, hasComplete: hasCompleteProfile })
      return
    }

    if (analysis || isLoading) {
      console.log('⏸️ Analysis already exists or loading in progress', { hasAnalysis: !!analysis, isLoading })
      return
    }

    console.log('🎯 Starting KP astrology auto-generation...', {
      userId: userProfile.uid,
      hasProfile: hasCompleteProfile,
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime,
      birthPlace: userProfile.birthPlace
    })

    // First try to load permanent birth chart data
    const permanentChart = getPermanentChart(userProfile.uid || 'default', 'kp-astrology')
    
    if (permanentChart) {
      try {
        console.log('✅ Found cached KP astrology data, validating structure...', {
          hasChart: !!permanentChart,
          chartKeys: permanentChart ? Object.keys(permanentChart) : [],
          hasData: !!(permanentChart as any)?.data,
          hasChartUrl: !!(permanentChart as any)?.chartUrl
        })
        
        // Extract the actual analysis data from the stored chart
        // The stored chart may have the data in different places depending on how it was stored
        let analysisData: KPAnalysis | null = null
        
        // Check if data is directly in permanentChart (legacy format - analysis object stored directly)
        if ((permanentChart as any)?.basicInfo || (permanentChart as any)?.rawAstroAppData) {
          analysisData = permanentChart as any as KPAnalysis
        }
        // Check if data is in metadata property (new format)
        else if ((permanentChart as any)?.metadata?.analysisData) {
          analysisData = (permanentChart as any).metadata.analysisData as KPAnalysis
        }
        // Check if data is in chartUrl property as JSON string (standard format)
        else if ((permanentChart as any)?.chartUrl) {
          const chartUrlData = (permanentChart as any).chartUrl
          if (typeof chartUrlData === 'string') {
            try {
              analysisData = JSON.parse(chartUrlData) as KPAnalysis
            } catch (e) {
              console.warn('⚠️ Failed to parse chartUrl as JSON:', e)
            }
          } else if (typeof chartUrlData === 'object') {
            // If chartUrl is already an object, use it directly
            analysisData = chartUrlData as KPAnalysis
          }
        }
        // Check if data is in data property (fallback)
        else if ((permanentChart as any)?.data) {
          analysisData = (permanentChart as any).data as KPAnalysis
        }
        
        // Validate the analysis data structure
        if (analysisData && analysisData.basicInfo && (
          analysisData.rawAstroAppData || 
          analysisData.interpretations ||
          analysisData.sunSign
        )) {
          console.log('✅ Valid KP astrology data structure found:', {
            hasBasicInfo: !!analysisData.basicInfo,
            hasRawData: !!analysisData.rawAstroAppData,
            hasInterpretations: !!analysisData.interpretations,
            birthDate: analysisData.basicInfo.dateOfBirth,
            birthTime: analysisData.basicInfo.timeOfBirth,
            birthPlace: analysisData.basicInfo.placeOfBirth
          })
          
          setAnalysis(analysisData)
          console.log('📊 Loaded permanent KP astrology data from cache')
          
          // Also try to load current transits
          loadCurrentTransits()
          return
        } else {
          console.warn('⚠️ Cached data structure invalid, will generate new analysis:', {
            hasAnalysisData: !!analysisData,
            hasBasicInfo: analysisData?.basicInfo ? 'yes' : 'no',
            hasRawData: analysisData?.rawAstroAppData ? 'yes' : 'no',
            structure: analysisData ? Object.keys(analysisData) : 'no data'
          })
        }
      } catch (error) {
        console.error('❌ Failed to load stored KP analysis:', error)
        console.log('🔄 Will generate new analysis...')
      }
    }
    
    // Generate new analysis if no permanent data exists
    console.log('🚀 No cached data found, generating new KP analysis...')
    performKPAnalysis()
  }, [user, userProfile?.uid, hasCompleteProfile, analysis, isLoading, performKPAnalysis, loadCurrentTransits])

  if (!hasCompleteProfile) {
    return (
      <div className="min-h-screen p-4 starfield-ultra-sharp">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-12 max-w-2xl mx-auto shadow-md">
              <User className="w-24 h-24 text-amber-700 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-amber-900 mb-6">Complete Your Profile</h1>
              <p className="text-slate-700 text-lg mb-8 leading-relaxed">
                To unlock your KP astrology reading, please complete your cosmic profile with your birth details.
              </p>
              <motion.a
                href="/profile"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                whileHover={{ y: -2 }}
              >
                <User className="w-5 h-5" />
                Complete Profile
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen p-4">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 pt-4"
        >
          <h1 className="text-5xl font-bold gold-glow mb-6">
            <span className="text-yellow-400">🎯</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">KP Astrology</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light mb-8">
            Krishnamurti Paddhati - The most precise system of astrological predictions
          </p>
          {/* Inspirational Quote */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md max-w-2xl mx-auto">
            <p className="text-xl italic text-amber-900 font-serif mb-2">
              "In the precise calculations of KP Astrology lies the mathematical key to unlocking the exact timing of destiny's unfolding."
            </p>
            <p className="text-slate-700 text-sm">— Prof. K.S. Krishnamurti</p>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-12 max-w-2xl mx-auto shadow-md">
              <Loader2 className="w-16 h-16 text-amber-700 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-amber-900 mb-4">Calculating Sublords</h2>
              <p className="text-slate-700 text-lg">Generating your KP astrology analysis...</p>
            </div>
                    </motion.div>
        )}

        {/* Error State - Always visible when error exists */}
        {error && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
            className="text-center py-8 mb-8"
          >
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-8 max-w-2xl mx-auto shadow-md">
              <h2 className="text-2xl font-bold text-red-700 mb-4">Analysis Error</h2>
              <p className="text-slate-700 text-lg mb-6">{error}</p>
              <button
                onClick={performKPAnalysis}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Try Again'}
              </button>
            </div>
                  </motion.div>
                )}

        {/* Generate Button - Show when no analysis exists */}
        {hasCompleteProfile && !analysis && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 mb-8"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 max-w-2xl mx-auto shadow-md">
              <Target className="w-16 h-16 text-amber-700 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-amber-900 mb-4">Ready to Generate Your KP Chart</h2>
              <p className="text-slate-700 text-lg mb-6 leading-relaxed">
                Your profile is complete. Generate your KP astrology analysis to discover precise timing predictions based on sub-lords and cusps.
              </p>
              <motion.button
                onClick={performKPAnalysis}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <Target className="w-5 h-5" />
                Generate KP Analysis
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation - Always visible when profile is complete */}
        {hasCompleteProfile && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
              <div className="flex flex-wrap gap-2 mb-6 items-center justify-center">
              {[
                { id: 'chart_images', label: 'Chart Images', icon: Star, description: 'KP Rasi chart with sublord positions' },
                { id: 'planetary_positions', label: 'Planetary Positions', icon: Zap, description: 'All planets with signs, houses, and sublords' },
                { id: 'sublord_analysis', label: 'Sublord Analysis', icon: Target, description: 'Detailed sublord breakdown and influences' },
                { id: 'dasha_forecast', label: 'Dasha Forecast', icon: Clock, description: 'Timing periods and predictions' },
                { id: 'remedies', label: 'Remedies', icon: Shield, description: 'KP-specific remedies and recommendations' },
                  { id: 'current_transits', label: 'Current Transits', icon: RefreshCw, description: 'Real-time planetary influences and timing' },
                  { id: 'kp_astrology_expert', label: 'Ask the Seer', icon: Brain, description: 'Ask questions about your KP chart analysis' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 shadow-md'
                      : 'bg-white/60 text-slate-700 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            
            {/* Tab Description */}
            <div className="text-center">
                <p className="text-slate-700 text-sm">
                {[
                  { id: 'chart_images', desc: 'Visual representation of your KP birth chart' },
                  { id: 'planetary_positions', desc: 'Detailed planetary positions with sublord influences' },
                  { id: 'sublord_analysis', desc: 'In-depth analysis of sublord energies and timing' },
                  { id: 'dasha_forecast', desc: 'Current and upcoming planetary periods' },
                  { id: 'remedies', desc: 'Personalized remedies for optimal life outcomes' },
                    { id: 'current_transits', desc: 'Real-time planetary influences affecting your life' },
                    { id: 'kp_astrology_expert', desc: 'Get personalized answers to your KP astrology questions' }
                ].find(tab => tab.id === activeTab)?.desc}
              </p>
            </div>
          </div>

            {/* Tab Content - Show empty states when no analysis */}
            <AnimatePresence mode="wait">
              {!analysis ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-12 text-center shadow-md"
                >
                  <Target className="w-16 h-16 text-amber-700 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-amber-900 mb-4">
                    {activeTab === 'chart_images' && 'No Chart Data Available'}
                    {activeTab === 'planetary_positions' && 'No Planetary Positions Available'}
                    {activeTab === 'sublord_analysis' && 'No Sublord Analysis Available'}
                    {activeTab === 'dasha_forecast' && 'No Dasha Forecast Available'}
                    {activeTab === 'remedies' && 'No Remedies Available'}
                    {activeTab === 'current_transits' && 'No Transits Available'}
                    {activeTab === 'kp_astrology_expert' && 'No Analysis Available'}
                  </h3>
                  <p className="text-slate-700 text-lg mb-6">
                    Generate your KP astrology analysis to view {activeTab === 'chart_images' ? 'chart data' : activeTab === 'kp_astrology_expert' ? 'the expert' : activeTab.replace('_', ' ').toLowerCase()} here.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="analysis-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Chart Images Tab */}
            {activeTab === 'chart_images' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {analysis?.rawAstroAppData?.planetary_positions && analysis.rawAstroAppData.house_analysis ? (() => {
                  // Transform KP analysis data into chart format for VedicNorthChart/VedicSouthChart
                  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                  const getSignIndex = (signName: string): number => {
                    const index = signNames.findIndex(s => s.toLowerCase() === signName.toLowerCase())
                    return index >= 0 ? index : 0
                  }

                  const planets: Record<string, any> = {}
                  analysis.rawAstroAppData.planetary_positions.forEach((planet: any) => {
                    const planetKey = planet.planet?.toLowerCase() || planet.name?.toLowerCase()
                    if (planetKey) {
                      const signName = planet.sign || 'Aries'
                      const signIndex = getSignIndex(signName)
                      const dignity = calculatePlanetaryDignity(planet.planet || planet.name, signIndex, signName)
                      planets[planetKey] = {
                        name: planet.planet || planet.name,
                        house: planet.house || 1,
                        sign: signIndex,
                        signName: signName,
                        degree: planet.degree || 0,
                        nakshatra: planet.nakshatra,
                        sublord: planet.sublord,
                        dignity: dignity
                      }
                    }
                  })

                  const houses = analysis.rawAstroAppData.house_analysis.slice(0, 12).map((house: any, index: number) => {
                    const signName = house.sign || signNames[index] || 'Aries'
                    return {
                      house: house.house || (index + 1),
                      signName: signName,
                      sign: getSignIndex(signName),
                      lord: house.lord || 'Sun',
                      degree: house.degree || 0,
                      sublord: house.sublord
                    }
                  })

                  const chartData = {
                    planets,
                    houses,
                    ascendant: analysis.rawAstroAppData.ascendant ? {
                      signName: analysis.rawAstroAppData.ascendant.sign,
                      sign: houses.findIndex((h: any) => h.signName === analysis.rawAstroAppData.ascendant.sign),
                      degree: analysis.rawAstroAppData.ascendant.degree || 0,
                      nakshatra: analysis.rawAstroAppData.ascendant.nakshatra,
                      sublord: analysis.rawAstroAppData.ascendant.subLord
                    } : null,
                    metadata: {
                      ayanamsha: 'KP',
                      system: 'Placidus',
                      chartType: 'KP Astrology'
                    }
                  }

                  // Transform planets for NorthIndianVedicChart
                  const transformedPlanets = transformKPPlanetsForChart(analysis.rawAstroAppData.planetary_positions || [])
                  
                  // Calculate ascendant sign and degree for NorthIndianVedicChart
                  const ascendantSign = analysis.rawAstroAppData.ascendant 
                    ? getSignIndex(analysis.rawAstroAppData.ascendant.sign || 'Aries')
                    : 0
                  const ascendantDegree = analysis.rawAstroAppData.ascendant?.degree || 0

                  return (
                    <>
                      {/* Chart Images Display */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* North Indian Chart */}
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                          <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center flex items-center justify-center gap-3">
                            <Globe className="w-6 h-6 text-amber-700" />
                            North Indian Chart
                          </h3>
                          <div className="bg-white overflow-visible" style={{ width: '450px', height: '333px', margin: '0 auto', padding: 0, lineHeight: 0, fontSize: 0 }}>
                            <NorthIndianVedicChart
                              planets={transformedPlanets}
                              ascendantSign={ascendantSign}
                              ascendantDegree={ascendantDegree}
                              chartType="KP"
                            />
                      </div>
                </div>

                        {/* South Indian Chart */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                          <h3 className="text-2xl font-bold text-purple-900 mb-6 text-center flex items-center justify-center gap-3">
                            <Globe className="w-6 h-6 text-purple-700" />
                            South Indian Chart
                          </h3>
                          <div className="bg-white overflow-visible" style={{ width: '450px', height: '333px', margin: '0 auto', padding: 0, lineHeight: 0, fontSize: 0 }}>
                            <VedicSouthChart chart={chartData} />
                    </div>
                    </div>
                    </div>

                      {/* Chart Summary */}
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-2xl p-6 shadow-md">
                        <h3 className="text-xl font-bold text-cyan-900 mb-4 text-center">Chart Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">Total Planets</p>
                            <p className="text-cyan-900 text-2xl font-bold">{analysis.rawAstroAppData.planetary_positions?.length || 9}</p>
                  </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">House Cusps</p>
                            <p className="text-cyan-900 text-2xl font-bold">{analysis.rawAstroAppData.house_analysis?.length || 12}</p>
                </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">Sub-Lords</p>
                            <p className="text-cyan-900 text-2xl font-bold">{analysis.rawAstroAppData.sublord_analysis?.summary?.totalSublords || 9}</p>
                    </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">Ascendant</p>
                            <p className="text-amber-700 text-lg font-bold">{analysis.rawAstroAppData.ascendant?.sign || 'N/A'}</p>
                    </div>
                      </div>
                        <p className="text-slate-700 text-sm italic text-center mt-4">
                          Your KP birth chart uses Placidus house system with sub-lord analysis based on Vimshottari dasha divisions.
                        </p>
                  </div>
                    </>
                  )
                })() : (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-12 text-center shadow-md">
                    <Star className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-700 text-lg">Chart images will be generated based on your KP analysis</p>
                    <p className="text-slate-600 text-sm mt-2">Generate your KP analysis to view chart images</p>
                </div>
                )}
              </motion.div>
            )}

            {/* Planetary Positions Tab */}
            {activeTab === 'planetary_positions' && (
              <motion.div
                key="planets"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-green-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Zap className="w-8 h-8 text-green-700" />
                    Planetary Positions with Sublords
                  </h2>
                  
                  {analysis.rawAstroAppData?.planetary_positions ? (
                    <>
                      {/* Planetary Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Total Planets</h4>
                          <p className="text-green-900 text-2xl font-bold">{analysis.rawAstroAppData.planetary_positions.length}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Unique Signs</h4>
                          <p className="text-green-900 text-2xl font-bold">
                            {new Set(analysis.rawAstroAppData.planetary_positions.map((p: any) => p.sign)).size}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Unique Houses</h4>
                          <p className="text-green-900 text-2xl font-bold">
                            {new Set(analysis.rawAstroAppData.planetary_positions.map((p: any) => p.house)).size}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Unique Sublords</h4>
                          <p className="text-green-900 text-2xl font-bold">
                            {new Set(analysis.rawAstroAppData.planetary_positions.map((p: any) => p.sublord)).size}
                          </p>
                        </div>
                      </div>

                      {/* Personality Insights Section */}
                      {analysis.interpretations?.personality && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl p-6 mb-8 border-2 border-purple-300 shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <Brain className="w-8 h-8 text-purple-700 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="text-xl font-bold text-purple-900 mb-2">Personality Insights</h3>
                              <p className="text-slate-700 leading-relaxed">{analysis.interpretations.personality}</p>
                              {analysis.interpretations.lifePath && (
                                <p className="text-slate-600 mt-3 italic leading-relaxed">{analysis.interpretations.lifePath}</p>
                              )}
                              </div>
                            </div>
                        </motion.div>
                      )}

                      {/* Detailed Planetary Positions with Interpretations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysis.rawAstroAppData.planetary_positions.slice(0, 9).map((planet: any, index: number) => {
                          const interpretation = getPlanetInterpretation(
                            planet.planet,
                            planet.sign,
                            planet.house,
                            planet.nakshatra || 'Unknown',
                            planet.sublord || 'Unknown'
                          )
                          const houseStrength = [1, 4, 5, 7, 9, 10].includes(planet.house) ? 'strong' : 
                                               [6, 8, 12].includes(planet.house) ? 'weak' : 'moderate'
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white rounded-xl p-5 border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-slate-900 font-bold text-lg">{planet.planet}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                    {planet.sign}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200">
                                    {planet.house}H
                                  </span>
                              </div>
                              </div>
                              
                              {/* Strength Indicator */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-slate-600">Planetary Strength</span>
                                  <span className={`text-xs font-medium ${
                                    houseStrength === 'strong' ? 'text-green-700' :
                                    houseStrength === 'weak' ? 'text-red-700' : 'text-amber-700'
                                  }`}>
                                    {houseStrength.charAt(0).toUpperCase() + houseStrength.slice(1)}
                                  </span>
                              </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      houseStrength === 'strong' ? 'bg-green-600 w-4/5' :
                                      houseStrength === 'weak' ? 'bg-red-600 w-2/5' : 'bg-amber-600 w-3/5'
                                    }`}
                                  />
                              </div>
                            </div>

                              <div className="space-y-3 text-sm mb-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Sign:</span>
                                  <span className="text-slate-900 font-medium">{planet.sign}</span>
                          </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">House:</span>
                                  <span className="text-slate-900 font-medium">{planet.house}</span>
                      </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Degree:</span>
                                  <span className="text-slate-900 font-medium">{planet.degree}°</span>
                    </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Nakshatra:</span>
                                  <span className="text-purple-700 font-medium">{planet.nakshatra || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Star Lord:</span>
                                  <span className="text-blue-700 font-medium">{planet.starLord || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                  <span className="text-amber-700 font-medium">Sub-Lord:</span>
                                  <span className="text-amber-800 font-bold">{planet.sublord || 'Unknown'}</span>
                                </div>
                </div>

                              {/* Interpretation */}
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-700 leading-relaxed italic">
                                  {interpretation}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                    
                      {/* Life Area Significations */}
                      {analysis.rawAstroAppData?.significations && Object.keys(analysis.rawAstroAppData.significations).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8"
                        >
                          <h3 className="text-2xl font-bold text-green-900 mb-6 text-center flex items-center justify-center gap-3">
                            <TrendingUp className="w-6 h-6 text-green-700" />
                            Life Area Significations
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analysis.rawAstroAppData.significations.career && (
                              <div className="bg-white rounded-xl p-5 border-2 border-blue-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Briefcase className="w-6 h-6 text-blue-700" />
                                  <h4 className="text-lg font-bold text-blue-900">Career</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.career) 
                                    ? analysis.rawAstroAppData.significations.career.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.career}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.relationships && (
                              <div className="bg-white rounded-xl p-5 border-2 border-pink-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Heart className="w-6 h-6 text-pink-700" />
                                  <h4 className="text-lg font-bold text-pink-900">Relationships</h4>
                    </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.relationships)
                                    ? analysis.rawAstroAppData.significations.relationships.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.relationships}</li>
                                  }
                                </ul>
                      </div>
                    )}
                            {analysis.rawAstroAppData.significations.wealth && (
                              <div className="bg-white rounded-xl p-5 border-2 border-amber-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <TrendingUp className="w-6 h-6 text-amber-700" />
                                  <h4 className="text-lg font-bold text-amber-900">Wealth</h4>
                  </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.wealth)
                                    ? analysis.rawAstroAppData.significations.wealth.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.wealth}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.health && (
                              <div className="bg-white rounded-xl p-5 border-2 border-green-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Activity className="w-6 h-6 text-green-700" />
                                  <h4 className="text-lg font-bold text-green-900">Health</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.health)
                                    ? analysis.rawAstroAppData.significations.health.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.health}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.education && (
                              <div className="bg-white rounded-xl p-5 border-2 border-indigo-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Brain className="w-6 h-6 text-indigo-700" />
                                  <h4 className="text-lg font-bold text-indigo-900">Education</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.education)
                                    ? analysis.rawAstroAppData.significations.education.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.education}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.travel && (
                              <div className="bg-white rounded-xl p-5 border-2 border-cyan-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Globe className="w-6 h-6 text-cyan-700" />
                                  <h4 className="text-lg font-bold text-cyan-900">Travel</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.travel)
                                    ? analysis.rawAstroAppData.significations.travel.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.travel}</li>
                                  }
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="w-16 h-16 text-green-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Planetary positions will be calculated based on your birth details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Sublord Analysis Tab */}
            {activeTab === 'sublord_analysis' && (
              <motion.div
                key="sublords"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Target className="w-8 h-8 text-purple-700" />
                    Sublord Analysis
                  </h2>
                  
                  {analysis.rawAstroAppData?.sublord_analysis ? (
                    <>
                      {/* Sublord Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200 shadow-sm">
                          <h4 className="text-purple-700 font-medium mb-1">Total Sublords</h4>
                          <p className="text-purple-900 text-2xl font-bold">{analysis.rawAstroAppData.sublord_analysis.summary?.totalSublords || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200 shadow-sm">
                          <h4 className="text-purple-700 font-medium mb-1">Dominant Sublord</h4>
                          <p className="text-purple-900 text-xl font-bold">{analysis.rawAstroAppData.sublord_analysis.summary?.dominantSublord || 'Unknown'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200 shadow-sm">
                          <h4 className="text-purple-700 font-medium mb-1">Strongest Sublord</h4>
                          <p className="text-purple-900 text-xl font-bold">{analysis.rawAstroAppData.sublord_analysis.summary?.strongestSublord || 'Unknown'}</p>
                        </div>
                      </div>

                      {/* Sublord Details */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-purple-900 mb-4">Sub-Lord Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.rawAstroAppData.sublord_analysis.sublords?.map((sublord: any, index: number) => (
                            <div key={index} className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-slate-900 font-medium">{sublord.planet || `Planet ${index + 1}`}</h4>
                                <span className={`text-xs px-2 py-1 rounded border ${
                                  sublord.strength === 'strong' ? 'bg-green-100 text-green-700 border-green-300' :
                                  sublord.strength === 'moderate' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                  'bg-red-100 text-red-700 border-red-300'
                                }`}>
                                  {sublord.strength || 'moderate'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mb-2">Sub-Lord: <span className="text-amber-700 font-semibold">{sublord.sublord}</span></p>
                              <p className="text-xs text-slate-600 leading-relaxed">{sublord.influence || 'KP sub-lord analysis based on Vimshottari dasha system'}</p>
                            </div>
                          ))}
                          
                          {/* House Cusp Sub-Lords with Interpretations */}
                          {analysis.rawAstroAppData.house_analysis && analysis.rawAstroAppData.house_analysis.length > 0 && (
                            <div className="col-span-full mt-6">
                              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5 text-purple-700" />
                                House Cusp Sub-Lords & Interpretations
                              </h3>
                              <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                                Each house cusp has its own sub-lord which influences the timing and outcomes of matters related to that life area. Understanding these sub-lords is crucial for precise KP predictions.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {analysis.rawAstroAppData.house_analysis.slice(0, 12).map((house: any, idx: number) => {
                                  const interpretation = getHouseInterpretation(house.house, house.sign || 'Unknown', house.sublord || 'Unknown')
                                  
                                  return (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="bg-white rounded-lg p-4 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-lg font-bold text-purple-900">House {house.house}</h4>
                                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                          {house.sublord || 'Unknown'} Sub-Lord
                                        </span>
                        </div>
                                      <div className="mb-3">
                                        <p className="text-xs text-slate-600 mb-1">Sign</p>
                                        <p className="text-sm text-slate-900 font-medium">{house.sign || 'Unknown'}</p>
                      </div>
                                      {house.degree !== undefined && (
                                        <div className="mb-3">
                                          <p className="text-xs text-slate-600 mb-1">Degree</p>
                                          <p className="text-sm text-slate-900 font-medium">{house.degree}°</p>
                    </div>
                  )}
                                      <div className="pt-3 border-t border-slate-200">
                                        <p className="text-xs text-slate-700 leading-relaxed italic">{interpretation}</p>
                </div>
                                    </motion.div>
                                  )
                                })}
                    </div>
                            </div>
                          )}
                    </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Target className="w-16 h-16 text-purple-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Sublord analysis will be calculated based on your planetary positions</p>
                      </div>
                    )}
                </div>
              </motion.div>
            )}

            {/* Dasha Forecast Tab */}
            {activeTab === 'dasha_forecast' && (
              <motion.div
                key="dashas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-orange-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Clock className="w-8 h-8 text-orange-700" />
                    Dasha Forecast
                  </h2>
                  
                  {analysis?.rawAstroAppData?.dasha_forecast && analysis.rawAstroAppData.dasha_forecast.length > 0 ? (
                    <div className="space-y-6">
                      {analysis.rawAstroAppData.dasha_forecast.map((dasha: any, index: number) => {
                        const dashaInfluence = getDashaInfluence(dasha.planet || 'Moon')
                        const startDate = new Date(dasha.startDate)
                        const endDate = new Date(dasha.endDate)
                        const now = new Date()
                        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                        const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                        const progressPercent = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100))
                        const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-6 border-2 border-orange-300 shadow-md"
                          >
                            {/* Dasha Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                              <div>
                                <h3 className="text-2xl font-bold text-orange-900 flex items-center gap-3 mb-2">
                                  <Clock className="w-7 h-7 text-orange-700" />
                                  {dasha.planet || 'Moon'} Dasha
                                  {dasha.antardasha && (
                                    <span className="text-lg text-slate-600 font-normal">- {dasha.antardasha} Antardasha</span>
                                  )}
                                </h3>
                                <p className="text-slate-700 text-sm">{dasha.description || dashaInfluence.focus}</p>
                            </div>
                              <div className="text-right">
                                <div className="text-sm text-slate-600 mb-1">Period Duration</div>
                                <div className="text-slate-900 font-semibold">
                                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </div>
                            </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">Dasha Progress</span>
                                <span className="text-sm font-semibold text-orange-700">{Math.round(progressPercent)}% Complete</span>
                          </div>
                              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercent}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-orange-600 to-amber-600 rounded-full"
                                />
                        </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                <span>{elapsedDays} days elapsed</span>
                                <span>{remainingDays} days remaining</span>
                    </div>
                            </div>

                            {/* Focus Area & Events Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="bg-orange-50 rounded-lg p-5 border-2 border-orange-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Target className="w-5 h-5 text-orange-700" />
                                  <h4 className="text-lg font-bold text-orange-900">Focus Area</h4>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{dashaInfluence.focus}</p>
                                {dasha.focus_area && (
                                  <p className="text-slate-600 text-sm mt-2 italic">{dasha.focus_area}</p>
                                )}
                              </div>
                              <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="w-5 h-5 text-amber-700" />
                                  <h4 className="text-lg font-bold text-amber-900">Likely Events</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(dashaInfluence.events) ? (
                                    dashaInfluence.events.slice(0, 4).map((event: string, idx: number) => (
                                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                        <span>{event}</span>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-sm text-slate-700">{dasha.likely_events || dashaInfluence.events || 'Positive developments expected'}</li>
                                  )}
                                </ul>
                    </div>
                            </div>

                            {/* Dasha Details */}
                            {dasha.antardasha && (
                              <div className="bg-slate-50 rounded-lg p-4 mb-4 border-2 border-slate-200">
                                <h4 className="text-slate-900 font-semibold mb-2">Sub-Periods:</h4>
                                <div className="flex flex-wrap gap-3">
                                  {dasha.pratyantardasha && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                                      Pratyantar: {dasha.pratyantardasha}
                                    </span>
                  )}
                </div>
                              </div>
                            )}

                            {/* Next Dasha Preview */}
                            {dasha.nextPeriod && (
                              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-5 h-5 text-blue-700" />
                                  <h4 className="text-blue-900 font-semibold">Next Dasha Period</h4>
                    </div>
                                <p className="text-slate-900 font-medium">{dasha.nextPeriod}</p>
                                <p className="text-slate-600 text-sm mt-1">
                                  {getDashaInfluence(dasha.nextPeriod.replace(' Dasha', '')).focus}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                      
                      {/* Predictions Section */}
                      {analysis?.rawAstroAppData?.predictions && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl p-6 border-2 border-purple-300 shadow-md"
                        >
                          <h3 className="text-2xl font-bold text-purple-900 mb-6 text-center flex items-center justify-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-700" />
                            KP Predictions
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {analysis.rawAstroAppData.predictions.shortTerm && (
                              <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Zap className="w-5 h-5 text-green-700" />
                                  <h4 className="text-lg font-bold text-green-900">Short Term</h4>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{analysis.rawAstroAppData.predictions.shortTerm}</p>
                              </div>
                            )}
                            {analysis.rawAstroAppData.predictions.mediumTerm && (
                              <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="w-5 h-5 text-amber-700" />
                                  <h4 className="text-lg font-bold text-amber-900">Medium Term</h4>
                    </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{analysis.rawAstroAppData.predictions.mediumTerm}</p>
                      </div>
                    )}
                            {analysis.rawAstroAppData.predictions.longTerm && (
                              <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <TrendingUp className="w-5 h-5 text-blue-700" />
                                  <h4 className="text-lg font-bold text-blue-900">Long Term</h4>
                  </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{analysis.rawAstroAppData.predictions.longTerm}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-orange-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Dasha forecast will be calculated based on your birth details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Remedies Tab */}
            {activeTab === 'remedies' && (
              <motion.div
                key="remedies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-red-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Shield className="w-8 h-8 text-red-700" />
                    KP Remedies
                  </h2>
                  
                  {analysis?.rawAstroAppData?.remedies && analysis.rawAstroAppData.remedies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.rawAstroAppData.remedies.map((remedy: any, index: number) => {
                        // Handle both old string format and new structured format
                        const isStructured = typeof remedy === 'object' && remedy.name && remedy.type
                        
                        if (!isStructured) {
                          // Legacy string format - skip for now as we should have structured data
                          return null
                        }
                        
                        const getTypeIcon = (type: string) => {
                          switch(type) {
                            case 'gemstone': return <Gem className="w-6 h-6 text-amber-700" />
                            case 'mantra': return <Sparkles className="w-6 h-6 text-blue-700" />
                            case 'ritual': return <Heart className="w-6 h-6 text-red-700" />
                            default: return <Shield className="w-6 h-6 text-purple-700" />
                          }
                        }
                        
                        const getTypeColor = (type: string) => {
                          switch(type) {
                            case 'gemstone': return 'bg-amber-50 border-amber-300'
                            case 'mantra': return 'bg-blue-50 border-blue-300'
                            case 'ritual': return 'bg-red-50 border-red-300'
                            default: return 'bg-purple-50 border-purple-300'
                          }
                        }
                        
                        const priorityBadge = remedy.priority === 'high' ? 'bg-red-100 text-red-800 border-red-300' :
                                              remedy.priority === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                              'bg-blue-100 text-blue-800 border-blue-300'
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-white rounded-xl p-6 border-2 ${getTypeColor(remedy.type)} shadow-md hover:shadow-lg transition-all duration-300`}
                          >
                            <div className="flex items-start gap-3 mb-4">
                              {getTypeIcon(remedy.type)}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-xl font-bold text-slate-900">
                                    {remedy.name}
                                  </h3>
                                  <span className={`text-xs px-2 py-1 rounded border ${priorityBadge}`}>
                                    {remedy.priority} priority
                                  </span>
                            </div>
                                <div className="bg-slate-50 rounded-lg p-3 mb-3 border-2 border-slate-200">
                                  <p className="text-slate-700 text-sm font-medium leading-relaxed">{remedy.description}</p>
                                  {remedy.planet && remedy.planet !== 'General' && (
                                    <p className="text-amber-700 text-xs mt-2">For {remedy.planet} • {remedy.type.charAt(0).toUpperCase() + remedy.type.slice(1)}</p>
                          )}
                        </div>
                              </div>
                            </div>

                            {/* Explanation */}
                            <div className="mb-4">
                              <h4 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-700" />
                                Why This Remedy?
                              </h4>
                              <p className="text-slate-700 text-sm leading-relaxed">{remedy.explanation}</p>
                            </div>

                            {/* Benefits */}
                            {remedy.benefits && Array.isArray(remedy.benefits) && remedy.benefits.length > 0 && (
                              <div className="mb-4 bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <h4 className="text-green-900 font-semibold mb-2 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-green-700" />
                                  Benefits
                                </h4>
                                <ul className="space-y-1">
                                  {remedy.benefits.map((benefit: string, idx: number) => (
                                    <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                                      <span className="text-green-700 mt-1">•</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Instructions */}
                            {remedy.instructions && Array.isArray(remedy.instructions) && remedy.instructions.length > 0 && (
                              <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                                <h4 className="text-amber-900 font-semibold mb-2 flex items-center gap-2">
                                  {remedy.type === 'gemstone' ? <Gem className="w-4 h-4 text-amber-700" /> : remedy.type === 'mantra' ? <Sparkles className="w-4 h-4 text-amber-700" /> : <Target className="w-4 h-4 text-amber-700" />}
                                  How to Practice
                                </h4>
                                <ul className="space-y-2">
                                  {remedy.instructions.map((instruction: string, idx: number) => (
                                    <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                                      <span className="text-amber-700 mt-1">•</span>
                                      <span>{instruction}</span>
                                    </li>
                                  ))}
                                </ul>
                                {remedy.frequency && (
                                  <p className="text-amber-800 text-xs mt-3 font-medium">
                                    Frequency: {remedy.frequency}
                                  </p>
                                )}
                              </div>
                            )}
                            {remedy.type === 'gemstone' && (
                              <div className="mt-3">
                                <AffiliateLink href={getGemstoneAffiliateUrl(remedy.name || 'gemstone')} label="Buy here" className="text-amber-600" />
                              </div>
                            )}
                          </motion.div>
                        )
                      }).filter(Boolean)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-red-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Personalized remedies will be generated based on your chart analysis</p>
                    </div>
                  )}

                  {/* Show predictions with remedies */}
                  {analysis?.interpretations?.recommendations && analysis.interpretations.recommendations.length > 0 && (
                    <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
                      <h3 className="text-xl font-semibold text-amber-900 mb-4">KP-Based Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.interpretations.recommendations.map((rec: any, idx: number) => {
                          const recText = typeof rec === 'string' ? rec : (rec?.name || rec?.description || 'Recommendation')
                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-amber-700 mt-1">•</span>
                              <p className="text-slate-700">{recText}</p>
                    </div>
                          )
                        })}
                    </div>
                      </div>
                    )}
                </div>
              </motion.div>
            )}

            {/* Current Transits Tab */}
            {activeTab === 'current_transits' && (
              <motion.div
                key="current_transits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-2xl p-8 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                        <RefreshCw className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-cyan-900">Current Transits</h2>
                        <p className="text-slate-700 text-sm">Real-time planetary influences affecting your KP timing</p>
                      </div>
                    </div>
                    <button
                      onClick={fetchCurrentTransits}
                      disabled={isLoadingTransits}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                    >
                      {isLoadingTransits ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 inline mr-2" />
                          Refresh Transits
                        </>
                      )}
                    </button>
                  </div>

                  {currentTransits ? (
                    (currentTransits.activeTransits?.length > 0 || currentTransits.upcomingTransits?.length > 0) ? (
                    <div className="space-y-6">
                        {currentTransits.activeTransits && currentTransits.activeTransits.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border-2 border-cyan-200 shadow-md">
                        <h3 className="text-xl font-semibold text-cyan-900 mb-4">Active KP Transits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {currentTransits.activeTransits.map((transit: any, index: number) => (
                            <div key={index} className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200 shadow-sm">
                              <h4 className="text-slate-900 font-medium">{transit.planet} → {transit.target}</h4>
                                  <p className="text-sm text-slate-700 mt-2">{transit.description}</p>
                              <div className="text-xs text-cyan-800 mt-2">
                                {transit.startDate} - {transit.endDate}
                              </div>
                                  {transit.intensity && (
                                    <div className="text-xs text-amber-700 mt-1">
                                      Intensity: {transit.intensity}
                                    </div>
                                  )}
                            </div>
                          ))}
                        </div>
                      </div>
                        )}

                        {currentTransits.upcomingTransits && currentTransits.upcomingTransits.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border-2 border-pink-200 shadow-md">
                        <h3 className="text-xl font-semibold text-pink-900 mb-4">Upcoming KP Transits</h3>
                        <div className="space-y-3">
                              {currentTransits.upcomingTransits.slice(0, 5).map((transit: any, index: number) => (
                            <div key={index} className="p-4 bg-pink-50 rounded-lg border-2 border-pink-200 shadow-sm">
                              <h4 className="text-slate-900 font-medium">{transit.planet} → {transit.target}</h4>
                                  <p className="text-sm text-slate-700 mt-2">{transit.description}</p>
                              <div className="text-xs text-pink-800 mt-2">
                                Starts: {transit.startDate}
                              </div>
                                  {transit.significance && (
                                    <div className="text-xs text-amber-700 mt-1">
                                      {transit.significance}
                                    </div>
                                  )}
                            </div>
                          ))}
                        </div>
                      </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <RefreshCw className="w-16 h-16 text-cyan-700 mx-auto mb-4" />
                        <p className="text-slate-700 text-lg mb-2">No active transits at this time</p>
                        <p className="text-slate-600 text-sm">Planetary transits are calculated based on current positions relative to your natal chart</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <RefreshCw className="w-16 h-16 text-cyan-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Click "Refresh Transits" to load current KP planetary influences</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* KP Astrology Expert Tab */}
            {activeTab === 'kp_astrology_expert' && (
              <motion.div
                key="kp-expert"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
                  <KPSeerChatInterface
                    analysis={transformToKPIntelligenceAnalysis() ?? undefined}
                    userId={user?.uid ?? userProfile?.uid}
                    userProfile={userProfile}
                    sessionId={userProfile?.uid ? `kp_${userProfile.uid}` : undefined}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>
        )}
      </div>
    </div>
  )
} 