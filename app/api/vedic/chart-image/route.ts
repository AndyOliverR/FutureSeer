import { NextRequest, NextResponse } from 'next/server'
import { generateVedicChart, generateDivisionalChart, BirthData, VedicChart } from '@/lib/vedicAstrology'
import { devLog } from '@/lib/devLogger'

export const dynamic = 'force-static'

// Vedic Chart Image Generation API
// Generates chart images for divisional charts using proper Vedic astrology calculations

interface ChartImageRequest {
  type: string
  birthDate: string
  birthTime: string
  birthPlace: string
  style?: 'north' | 'south'
}

// Generate chart image data URL for divisional charts using proper Vedic calculations
function generateChartImage(chartType: string, birthData: BirthData, style: 'north' | 'south' = 'north'): string {
  try {
    // Generate proper Vedic chart using astronomia
    const chart = chartType === 'D1' 
      ? generateVedicChart(birthData, chartType)
      : generateDivisionalChart(birthData, chartType)
    
    const centerX = 200
    const centerY = 200
    const radius = 150
    
    // Generate house divisions
    const houseLines = []
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * Math.PI / 180
      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius - 20)
      const y2 = centerY + Math.sin(angle) * (radius - 20)
      houseLines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffd700" stroke-width="1"/>`)
    }
    
    // Generate planetary positions using real data
    const planetPositions = chart.planets.map((planet, index) => {
      const angle = planet.longitude * Math.PI / 180
      const x = centerX + Math.cos(angle) * (radius - 40)
      const y = centerY + Math.sin(angle) * (radius - 40)
      const planetSymbol = getPlanetSymbol(planet.name)
      return `<text x="${x}" y="${y}" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="12" font-weight="bold">${planetSymbol}</text>`
    }).join('')
    
    // Generate sign symbols around the circle
    const signSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
    const signPositions = signSymbols.map((symbol, index) => {
      const angle = (index * 30) * Math.PI / 180
      const x = centerX + Math.cos(angle) * (radius - 10)
      const y = centerY + Math.sin(angle) * (radius - 10)
      return `<text x="${x}" y="${y}" text-anchor="middle" fill="#ffd700" font-family="Arial" font-size="16">${symbol}</text>`
    }).join('')
    
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#1a1a2e" stroke="#16213e" stroke-width="2"/>
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#ffd700" stroke-width="2"/>
        <circle cx="${centerX}" cy="${centerY}" r="${radius - 20}" fill="none" stroke="#ffd700" stroke-width="1"/>
        ${houseLines.join('')}
        ${signPositions}
        ${planetPositions}
        <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" fill="#ffd700" font-family="Arial" font-size="14" font-weight="bold">${chartType}</text>
      </svg>
    `
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  } catch (error) {
    console.error('Error generating chart image:', error)
    // Return fallback image
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#1a1a2e"/>
        <text x="200" y="200" text-anchor="middle" fill="#ffd700" font-family="Arial" font-size="16">${chartType} Chart</text>
      </svg>
    `).toString('base64')}`
  }
}

// Get planet symbol
function getPlanetSymbol(planetName: string): string {
  const symbols: { [key: string]: string } = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
  }
  return symbols[planetName] || '●'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chartType = searchParams.get('type') || 'D1'
    const birthDate = searchParams.get('birthDate')
    const birthTime = searchParams.get('birthTime')
    const birthPlace = searchParams.get('birthPlace')
    const style = (searchParams.get('style') as 'north' | 'south') || 'north'
    
    if (!birthDate || !birthTime || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required parameters: birthDate, birthTime, birthPlace' },
        { status: 400 }
      )
    }
    
    devLog.info(`Generating ${chartType} chart image for:`, { birthDate, birthTime, birthPlace, style }, 'vedic')
    
    // Create birth data object
    const birthData: BirthData = {
      birthDate,
      birthTime,
      birthPlace,
      latitude: 19.0760, // Default to Mumbai - should be geocoded
      longitude: 72.8777,
      timezone: 'Asia/Kolkata'
    }
    
    // Generate the chart for metadata and the chart image
    const chart: VedicChart = chartType === 'D1'
      ? generateVedicChart(birthData, chartType)
      : generateDivisionalChart(birthData, chartType)
    const imageDataUrl = generateChartImage(chartType, birthData, style)

    return NextResponse.json({
      success: true,
      chartType,
      imageUrl: imageDataUrl,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer Internal API',
        style,
        planetsCount: chart.planets?.length ?? 0,
        housesCount: chart.houses?.length ?? 0
      }
    })
    
  } catch (error) {
    console.error('Error generating chart image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate chart image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, birthDate, birthTime, birthPlace, style = 'north' } = body
    
    if (!type || !birthDate || !birthTime || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields: type, birthDate, birthTime, birthPlace' },
        { status: 400 }
      )
    }
    
    devLog.info(`Generating ${type} chart image via POST:`, { birthDate, birthTime, birthPlace, style }, 'vedic')
    
    // Create birth data object
    const birthData: BirthData = {
      birthDate,
      birthTime,
      birthPlace,
      latitude: 19.0760, // Default to Mumbai - should be geocoded
      longitude: 72.8777,
      timezone: 'Asia/Kolkata'
    }
    
    // Generate the chart for metadata and the chart image
    const chart: VedicChart = type === 'D1'
      ? generateVedicChart(birthData, type)
      : generateDivisionalChart(birthData, type)
    const imageDataUrl = generateChartImage(type, birthData, style)

    return NextResponse.json({
      success: true,
      chartType: type,
      imageUrl: imageDataUrl,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer Internal API',
        style,
        planetsCount: chart.planets?.length ?? 0,
        housesCount: chart.houses?.length ?? 0
      }
    })
    
  } catch (error) {
    console.error('Error generating chart image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate chart image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
