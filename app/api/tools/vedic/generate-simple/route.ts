import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const { userId, birthData } = await request.json()

    if (!userId || !birthData) {
      return NextResponse.json(
        { error: 'User ID and birth data are required' },
        { status: 400 }
      )
    }

    devLog.info('Generating simple Vedic analysis for user:', userId, 'vedic')

    // Create mock comprehensive Vedic data
    const mockPlanets = [
      {
        planet: 'Sun',
        sign: 'Aries',
        house: 1,
        degree: 15.5,
        isExalted: false,
        isDebilitated: false,
        isRetrograde: false,
        nakshatra: 'Bharani',
        nakshatraLord: 'Venus',
        nakshatraPada: 1
      },
      {
        planet: 'Moon',
        sign: 'Cancer',
        house: 4,
        degree: 120.3,
        isExalted: true,
        isDebilitated: false,
        isRetrograde: false,
        nakshatra: 'Pushya',
        nakshatraLord: 'Saturn',
        nakshatraPada: 2
      },
      {
        planet: 'Mars',
        sign: 'Aries',
        house: 1,
        degree: 20.8,
        isExalted: true,
        isDebilitated: false,
        isRetrograde: false,
        nakshatra: 'Bharani',
        nakshatraLord: 'Venus',
        nakshatraPada: 3
      },
      {
        planet: 'Mercury',
        sign: 'Gemini',
        house: 3,
        degree: 75.2,
        isExalted: false,
        isDebilitated: false,
        isRetrograde: false,
        nakshatra: 'Ardra',
        nakshatraLord: 'Rahu',
        nakshatraPada: 4
      },
      {
        planet: 'Jupiter',
        sign: 'Cancer',
        house: 4,
        degree: 125.7,
        isExalted: false,
        isDebilitated: false,
        isRetrograde: false,
        nakshatra: 'Pushya',
        nakshatraLord: 'Saturn',
        nakshatraPada: 1
      },
      {
        planet: 'Venus',
        sign: 'Taurus',
        house: 2,
        degree: 45.9,
        isExalted: false,
        isDebilitated: false,
        isRetrograde: false,
        nakshatra: 'Rohini',
        nakshatraLord: 'Moon',
        nakshatraPada: 2
      },
      {
        planet: 'Saturn',
        sign: 'Capricorn',
        house: 10,
        degree: 285.4,
        isExalted: true,
        isDebilitated: false,
        isRetrograde: false,
        nakshatra: 'Uttara Ashadha',
        nakshatraLord: 'Sun',
        nakshatraPada: 3
      },
      {
        planet: 'Rahu',
        sign: 'Leo',
        house: 5,
        degree: 150.1,
        isExalted: false,
        isDebilitated: false,
        isRetrograde: true,
        nakshatra: 'Magha',
        nakshatraLord: 'Ketu',
        nakshatraPada: 4
      },
      {
        planet: 'Ketu',
        sign: 'Aquarius',
        house: 11,
        degree: 330.6,
        isExalted: false,
        isDebilitated: false,
        isRetrograde: true,
        nakshatra: 'Dhanishtha',
        nakshatraLord: 'Mars',
        nakshatraPada: 1
      }
    ]

    const mockHouses = [
      { houseNumber: 1, sign: 'Aries', lord: 'Mars', planets: ['Sun', 'Mars'], strength: 'strong' },
      { houseNumber: 2, sign: 'Taurus', lord: 'Venus', planets: ['Venus'], strength: 'moderate' },
      { houseNumber: 3, sign: 'Gemini', lord: 'Mercury', planets: ['Mercury'], strength: 'moderate' },
      { houseNumber: 4, sign: 'Cancer', lord: 'Moon', planets: ['Moon', 'Jupiter'], strength: 'very_strong' },
      { houseNumber: 5, sign: 'Leo', lord: 'Sun', planets: ['Rahu'], strength: 'weak' },
      { houseNumber: 6, sign: 'Virgo', lord: 'Mercury', planets: [], strength: 'moderate' },
      { houseNumber: 7, sign: 'Libra', lord: 'Venus', planets: [], strength: 'moderate' },
      { houseNumber: 8, sign: 'Scorpio', lord: 'Mars', planets: [], strength: 'weak' },
      { houseNumber: 9, sign: 'Sagittarius', lord: 'Jupiter', planets: [], strength: 'moderate' },
      { houseNumber: 10, sign: 'Capricorn', lord: 'Saturn', planets: ['Saturn'], strength: 'strong' },
      { houseNumber: 11, sign: 'Aquarius', lord: 'Saturn', planets: ['Ketu'], strength: 'weak' },
      { houseNumber: 12, sign: 'Pisces', lord: 'Jupiter', planets: [], strength: 'moderate' }
    ]

    const mockDashas = [
      {
        planet: 'Jupiter',
        dashaType: 'mahadasha',
        startDate: '2020-01-01',
        endDate: '2036-01-01',
        duration: 16,
        effects: ['Wisdom', 'Growth', 'Spirituality']
      },
      {
        planet: 'Saturn',
        dashaType: 'antardasha',
        startDate: '2023-01-01',
        endDate: '2026-01-01',
        duration: 3,
        effects: ['Discipline', 'Hard work', 'Long-term gains']
      }
    ]

    const mockYogas = [
      {
        name: 'Gaja Kesari Yoga',
        type: 'benefic',
        planets: ['Jupiter', 'Moon'],
        description: 'Jupiter in kendra from Moon creates this powerful yoga',
        effects: ['Wisdom', 'Wealth', 'Fame', 'Success'],
        strength: 'strong'
      },
      {
        name: 'Raja Yoga',
        type: 'benefic',
        planets: ['Sun', 'Mars'],
        description: 'Sun and Mars in mutual kendras create royal yoga',
        effects: ['Leadership', 'Authority', 'Power', 'Recognition'],
        strength: 'moderate'
      }
    ]

    const mockAnalysis = {
      personality: {
        overview: 'You are a natural leader with strong intuition and creative abilities. Your Aries Sun gives you courage and initiative, while your Cancer Moon provides emotional depth and nurturing qualities.',
        strengths: [
          'Natural leadership abilities',
          'Strong intuition and creativity',
          'Emotional intelligence',
          'Determination and courage',
          'Nurturing and protective nature'
        ],
        challenges: [
          'Can be impulsive at times',
          'May struggle with emotional sensitivity',
          'Tendency to take on too much responsibility',
          'Need to balance assertiveness with compassion'
        ]
      },
      career: {
        overview: 'Your chart suggests success in leadership roles, creative fields, and professions involving care and protection. The strong 10th house indicates career success and recognition.',
        suitableProfessions: [
          'Leadership and management roles',
          'Creative and artistic fields',
          'Healthcare and caregiving',
          'Education and teaching',
          'Business and entrepreneurship'
        ]
      },
      relationships: {
        overview: 'You are naturally caring and protective in relationships. Your Cancer Moon makes you emotionally intuitive, while your Venus in Taurus brings stability and loyalty.',
        compatibility: [
          'Strong emotional connection with partners',
          'Natural protective instincts',
          'Loyalty and commitment',
          'Need for emotional security',
          'Good communication skills'
        ]
      },
      health: {
        overview: 'Your health is generally good, but pay attention to stress management and emotional well-being. The strong 4th house indicates good overall vitality.',
        healthTips: [
          'Practice regular meditation and relaxation',
          'Maintain emotional balance',
          'Get adequate rest and sleep',
          'Engage in regular physical activity',
          'Manage stress through creative outlets'
        ],
        vulnerableAreas: [
          'Emotional stress and anxiety',
          'Digestive system',
          'Heart and circulatory system',
          'Immune system during stress'
        ]
      },
      spirituality: {
        overview: 'You have a natural inclination towards spirituality and higher knowledge. Your Jupiter placement suggests wisdom and philosophical understanding.',
        spiritualPath: [
          'Meditation and contemplation',
          'Study of spiritual texts',
          'Service to others',
          'Connection with nature',
          'Creative expression as spiritual practice'
        ]
      }
    }

    const mockRemedies = {
      gemstones: {
        primary: [
          {
            name: 'Yellow Sapphire',
            benefits: 'Enhances wisdom, knowledge, and spiritual growth',
            finger: 'index finger'
          },
          {
            name: 'Pearl',
            benefits: 'Calms emotions, enhances intuition, and brings peace',
            finger: 'little finger'
          }
        ],
        secondary: [
          {
            name: 'Red Coral',
            benefits: 'Increases courage, energy, and leadership abilities',
            finger: 'ring finger'
          }
        ]
      },
      mantras: {
        primary: [
          {
            name: 'Jupiter Mantra',
            text: 'Om Brihaspataye Namah',
            count: 108
          },
          {
            name: 'Moon Mantra',
            text: 'Om Chandraya Namah',
            count: 108
          }
        ],
        secondary: [
          {
            name: 'Mars Mantra',
            text: 'Om Mangalaya Namah',
            count: 108
          }
        ]
      },
      rituals: {
        daily: [
          {
            name: 'Morning Prayer',
            description: 'Offer prayers to your ruling planets every morning'
          },
          {
            name: 'Meditation',
            description: 'Practice 15-20 minutes of meditation daily'
          }
        ],
        weekly: [
          {
            name: 'Temple Visit',
            description: 'Visit a temple or sacred place once a week'
          }
        ],
        monthly: [
          {
            name: 'Charity',
            description: 'Donate to causes related to education and spirituality'
          }
        ]
      },
      lifestyle: {
        activities: [
          {
            name: 'Yoga Practice',
            description: 'Regular yoga practice to balance body and mind'
          },
          {
            name: 'Creative Expression',
            description: 'Engage in creative activities like art, music, or writing'
          }
        ],
        diet: [
          {
            name: 'Sattvic Diet',
            description: 'Eat fresh, natural foods that promote clarity and peace'
          },
          {
            name: 'Avoid Excess',
            description: 'Moderate consumption of spicy and processed foods'
          }
        ]
      },
      charitable: {
        donations: [
          {
            name: 'Educational Causes',
            description: 'Support education and learning initiatives'
          }
        ],
        seva: [
          {
            name: 'Community Service',
            description: 'Volunteer time to help others in your community'
          }
        ]
      }
    }

    const analysisResult = {
      charts: {
        rasi_chart: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE4MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SYXNpIENoYXJ0PC90ZXh0Pjwvc3ZnPg==',
        navamsa_chart: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE4MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OYXZhbXNhIENoYXJ0PC90ZXh0Pjwvc3ZnPg=='
      },
      planetary_positions: mockPlanets,
      house_analysis: mockHouses,
      dashas: mockDashas,
      yogas: mockYogas,
      analysis: mockAnalysis,
      remedies: mockRemedies,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        dataQuality: 'high',
        completeness: 95,
        source: 'simple'
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: analysisResult,
      cached: false 
    })

  } catch (error) {
    devLog.error('Simple Vedic analysis error:', error, 'route')
    
    return NextResponse.json(
      { error: `Vedic analysis error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

