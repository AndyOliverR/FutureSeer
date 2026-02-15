import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger';
import { medicalDatabaseService } from '@/lib/medical/medicalDatabaseService'
import { searchFormulas } from '@/lib/medical/astrologicalFormulas'
import { generateFertilityCalendar } from '@/lib/medical/fertilityCalculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, criteria, birthData, month, year } = body

    switch (action) {
      case 'search-icd10': {
        const results = medicalDatabaseService.searchICD10(criteria || {})
        return NextResponse.json({ success: true, data: results })
      }

      case 'search-homeopathy': {
        const results = medicalDatabaseService.searchHomeopathy(criteria || {})
        return NextResponse.json({ success: true, data: results })
      }

      case 'search-herbal': {
        const results = medicalDatabaseService.searchHerbal(criteria || {})
        return NextResponse.json({ success: true, data: results })
      }

      case 'search-acupuncture': {
        const results = medicalDatabaseService.searchAcupuncture(criteria || {})
        return NextResponse.json({ success: true, data: results })
      }

      case 'cross-reference': {
        if (!criteria.bodyPart || !criteria.formula) {
          return NextResponse.json({ success: false, error: 'Missing bodyPart or formula' }, { status: 400 })
        }
        const results = medicalDatabaseService.crossReference(criteria.bodyPart, criteria.formula)
        return NextResponse.json({ success: true, data: results })
      }

      case 'find-remedies': {
        if (!criteria.conditionCode) {
          return NextResponse.json({ success: false, error: 'Missing conditionCode' }, { status: 400 })
        }
        const results = medicalDatabaseService.findRemedies(criteria.conditionCode)
        return NextResponse.json({ success: true, data: results })
      }

      case 'formula-search': {
        const results = searchFormulas(criteria || {})
        return NextResponse.json({ success: true, data: results })
      }

      case 'fertility-calendar': {
        if (!birthData || !month || !year) {
          return NextResponse.json({ success: false, error: 'Missing birthData, month, or year' }, { status: 400 })
        }
        const calendar = generateFertilityCalendar(birthData, month, year)
        return NextResponse.json({ success: true, data: calendar })
      }

      case 'formula-query': {
        if (!criteria) {
          return NextResponse.json({ success: false, error: 'Missing formula criteria' }, { status: 400 })
        }
        const results = medicalDatabaseService.formulaSearch(criteria)
        return NextResponse.json({ success: true, data: results })
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    devLog.error('Medical Astrology API Error:', error, 'route')
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

