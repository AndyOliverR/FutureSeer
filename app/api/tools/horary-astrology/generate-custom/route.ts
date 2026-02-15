import { NextRequest, NextResponse } from 'next/server'
import { HybridHoraryEngine } from '@/lib/hybridHoraryEngine'
import FutureSeerQualityAssurance from '@/lib/futureSeerQualityAssurance'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, questionData } = body

    if (!userId || !questionData) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate question data
    if (!questionData.question || !questionData.questionTime || !questionData.questionPlace) {
      return NextResponse.json(
        { success: false, error: 'Missing question, time, or place' },
        { status: 400 }
      )
    }

    devLog.info('🔮 Generating Custom Horary Astrology report for user:', userId, 'horary')
    devLog.debug('📝 Question:', questionData.question, 'horary')

    // Create Hybrid Engine instance
    const hybridEngine = new HybridHoraryEngine()

    // Generate Horary chart using hybrid engine (AstroApp + Custom fallback)
    const horaryData = await hybridEngine.generateHoraryChart({
      question: questionData.question,
      questionDate: questionData.questionDate || new Date().toISOString().split('T')[0],
      questionTime: questionData.questionTime,
      questionPlace: questionData.questionPlace,
      latitude: questionData.latitude || 12.2958,
      longitude: questionData.longitude || 76.6394,
      timezone: questionData.timezone || 'Asia/Kolkata'
    })

    // Generate interpretation using hybrid engine
    const interpretation = await hybridEngine.generateHoraryInterpretation(horaryData, questionData.question)

    // Seer state: radicality + ascendant + Moon for Ask the Seer
    const houses = horaryData.houses ?? []
    const planets = horaryData.planets ?? []
    const aspects = horaryData.aspects ?? []
    const ascendantHouse = houses.find((h: { house: number }) => h.house === 1)
    const moon = planets.find((p: { planet: string }) => p.planet === 'Moon')
    const saturn = planets.find((p: { planet: string }) => p.planet === 'Saturn')
    const moonApplyingAspects = aspects.filter(
      (a: { planet1: string; planet2: string; applying: boolean }) =>
        (a.planet1 === 'Moon' || a.planet2 === 'Moon') && a.applying
    )
    const voidOfCourseMoon = moonApplyingAspects.length === 0
    const moonApplyingAspect =
      moonApplyingAspects.length > 0
        ? `${moonApplyingAspects[0].aspect} to ${moonApplyingAspects[0].planet1 === 'Moon' ? moonApplyingAspects[0].planet2 : moonApplyingAspects[0].planet1}`
        : undefined

    const seerState = {
      ascendantSign: ascendantHouse?.sign ?? 'Unknown',
      ascendantDegree: typeof ascendantHouse?.cusp === 'number' ? ascendantHouse.cusp : 0,
      moonSign: moon?.sign ?? 'Unknown',
      moonHouse: moon?.house ?? 0,
      moonApplyingAspect: moonApplyingAspect ?? undefined,
      voidOfCourseMoon,
      saturnInFirst: saturn?.house === 1,
    }

    // Transform data to match our UI expectations
    const transformedData = {
      basicInfo: {
        question: questionData.question,
        questionTime: questionData.questionTime,
        questionPlace: questionData.questionPlace,
        chartTime: questionData.questionTime
      },
      seerState,
      chartImages: {
        horaryChart: horaryData.chartImage,
        chartStyle: horaryData.metadata.engine === 'astroapp' ? 'Vedic South Indian' : 'Horary Traditional',
        chartType: 'horary',
        houseSystem: horaryData.metadata.engine === 'astroapp' ? 'Vedic' : 'Regiomontanus'
      },
      answer: interpretation.answer,
      planetaryPositions: horaryData.planets.map(planet => ({
        name: planet.planet,
        sign: planet.sign,
        degree: planet.degree,
        house: planet.house,
        meaning: `${planet.planet} in ${planet.sign} ${planet.degree.toFixed(1)}°`,
        dignity: planet.speed > 0 ? 'Direct' : 'Retrograde',
        speed: planet.speed > 0 ? 'Direct' : 'Retrograde'
      })),
      houseAnalysis: await hybridEngine.generateProfessionalHouseAnalysis(horaryData, questionData.question),
      aspects: horaryData.aspects.map(aspect => ({
        planets: `${aspect.planet1} - ${aspect.planet2}`,
        type: aspect.aspect,
        orb: aspect.orb,
        description: `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb.toFixed(1)}° orb)`,
        applying: aspect.applying,
        separating: !aspect.applying
      })),
      timing: interpretation.timing,
      guidance: interpretation.guidance,
      rawAstroAppData: {
        engine: horaryData.metadata.engine === 'astroapp' ? 'AstroApp + FutureSeer Hybrid' : 'FutureSeer Professional',
        version: '3.0.0',
        calculations: horaryData.metadata.engine === 'astroapp' ? 'AstroApp Vedic + NASA JPL-grade' : 'NASA JPL-grade Astronomical Data',
        houseSystem: horaryData.metadata.engine === 'astroapp' ? 'Vedic Sidereal' : 'Regiomontanus',
        accuracy: horaryData.metadata.accuracy,
        dataSource: horaryData.metadata.engine === 'astroapp' ? 'AstroApp API + Custom Engine' : 'Real Astronomical Calculations',
        noMockData: true,
        confidence: interpretation.confidence
      }
    }

    // Perform Quality Assurance Check
    const qualityAssurance = new FutureSeerQualityAssurance()
    const qualityMetrics = await qualityAssurance.checkHoraryAstrologyQuality(transformedData)
    
    devLog.info('✅ Hybrid Horary chart generated successfully', undefined, 'horary')
    devLog.debug('📊 Hybrid Engine Data summary:', {
      planets: transformedData.planetaryPositions.length,
      houses: transformedData.houseAnalysis.length,
      aspects: transformedData.aspects.length,
      hasChartImage: !!transformedData.chartImages.horaryChart,
      engine: horaryData.metadata.engine === 'astroapp' ? 'AstroApp + FutureSeer Hybrid' : 'FutureSeer Professional',
      accuracy: horaryData.metadata.accuracy,
      confidence: interpretation.confidence,
      chartStyle: transformedData.chartImages.chartStyle
    }, 'horary')
    
    devLog.debug('🔍 Quality Assurance Results:', {
      overallScore: qualityMetrics.overallScore.toFixed(1),
      uiConsistency: qualityMetrics.uiConsistency.totalScore.toFixed(1),
      backendPerformance: qualityMetrics.backendPerformance.totalScore.toFixed(1),
      dataQuality: qualityMetrics.dataQuality.totalScore.toFixed(1),
      userExperience: qualityMetrics.userExperience.totalScore.toFixed(1),
      criticalIssues: qualityMetrics.criticalIssues.length,
      recommendations: qualityMetrics.recommendations.length
    }, 'horary')

    return NextResponse.json({
      success: true,
      data: transformedData,
      cached: false,
      engine: horaryData.metadata.engine === 'astroapp' ? 'AstroApp + FutureSeer Hybrid' : 'FutureSeer Professional',
      confidence: interpretation.confidence,
      qualityMetrics: {
        overallScore: qualityMetrics.overallScore,
        uiConsistency: qualityMetrics.uiConsistency.totalScore,
        backendPerformance: qualityMetrics.backendPerformance.totalScore,
        dataQuality: qualityMetrics.dataQuality.totalScore,
        userExperience: qualityMetrics.userExperience.totalScore,
        criticalIssues: qualityMetrics.criticalIssues,
        recommendations: qualityMetrics.recommendations
      }
    })

  } catch (error: any) {
    devLog.error('❌ Custom Horary Astrology API Error:', error, 'route')
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate custom Horary astrology report',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Helper function to get house meanings
function getHouseMeaning(houseNumber: number): string {
  const meanings = {
    1: 'self, personality, and appearance',
    2: 'money, possessions, and values',
    3: 'communication, siblings, and short trips',
    4: 'home, family, and roots',
    5: 'creativity, children, and romance',
    6: 'health, work, and service',
    7: 'partnerships, marriage, and open enemies',
    8: 'transformation, shared resources, and mysteries',
    9: 'higher learning, travel, and philosophy',
    10: 'career, reputation, and public image',
    11: 'friends, groups, and hopes',
    12: 'subconscious, secrets, and hidden enemies'
  }
  return meanings[houseNumber as keyof typeof meanings] ?? 'unknown matters'
}

// Helper function to get sign rulers
function getSignRuler(sign: string): string {
  const rulers: { [key: string]: string } = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
    'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
    'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
  }
  return rulers[sign] || 'unknown'
}
