import { NextRequest, NextResponse } from 'next/server'
import { generateVedicChart, generateDivisionalChart, BirthData, VedicChart } from '@/lib/vedicAstrology'
import { devLog } from '@/lib/devLogger'

export const dynamic = 'force-static'

// Vedic Chart Image Generation API
// Generates chart images for divisional charts using proper Vedic astrology calculations

// Generate chart image data URL for divisional charts using proper Vedic calculations
async function loadTemplateInnerSvg(style: 'north' | 'south' | 'east' | 'western' = 'north'): Promise<{ width: number; height: number; content: string }> {
  const templateMap: Record<string, { width: number; height: number; content: string }> = {
    north: {
      width: 560,
      height: 400,
      content: '<rect width="560" height="400" fill="#ffffff" stroke="#111827" stroke-width="1.5"/><line x1="0" y1="0" x2="560" y2="400" stroke="#111827" stroke-width="1.2"/><line x1="560" y1="0" x2="0" y2="400" stroke="#111827" stroke-width="1.2"/><polygon points="280,0 560,200 280,400 0,200" fill="none" stroke="#111827" stroke-width="1.2"/>'
    },
    south: {
      width: 560,
      height: 400,
      content: '<rect width="560" height="400" fill="#ffffff" stroke="#111827" stroke-width="1.5"/><g stroke="#111827" stroke-width="1.1" fill="none"><line x1="140" y1="0" x2="140" y2="400"/><line x1="280" y1="0" x2="280" y2="400"/><line x1="420" y1="0" x2="420" y2="400"/><line x1="0" y1="100" x2="560" y2="100"/><line x1="0" y1="200" x2="560" y2="200"/><line x1="0" y1="300" x2="560" y2="300"/></g>'
    },
    east: {
      width: 560,
      height: 400,
      content: '<rect width="560" height="400" fill="#ffffff" stroke="#111827" stroke-width="1.5"/><g stroke="#111827" stroke-width="1.1" fill="none"><line x1="186.6667" y1="0" x2="186.6667" y2="400"/><line x1="373.3333" y1="0" x2="373.3333" y2="400"/><line x1="0" y1="133.3333" x2="560" y2="133.3333"/><line x1="0" y1="266.6667" x2="560" y2="266.6667"/><line x1="0" y1="0" x2="186.6667" y2="133.3333"/><line x1="560" y1="0" x2="373.3333" y2="133.3333"/><line x1="0" y1="400" x2="186.6667" y2="266.6667"/><line x1="560" y1="400" x2="373.3333" y2="266.6667"/></g>'
    },
    western: {
      width: 520,
      height: 520,
      content: '<rect width="520" height="520" fill="#ffffff"/><circle cx="260" cy="260" r="220" fill="none" stroke="#111827" stroke-width="1.4"/><circle cx="260" cy="260" r="165" fill="none" stroke="#111827" stroke-width="1"/><circle cx="260" cy="260" r="120" fill="none" stroke="#111827" stroke-width="0.8"/>'
    },
  }
  const selected = templateMap[style] ?? templateMap.north
  return { width: selected.width, height: selected.height, content: selected.content }
}

// Generate chart image data URL for divisional charts using proper Vedic calculations
async function generateChartImage(chartType: string, birthData: BirthData, style: 'north' | 'south' | 'east' = 'north'): Promise<string> {
  try {
    // Generate proper Vedic chart using astronomia
    const chart = chartType === 'D1' 
      ? generateVedicChart(birthData, chartType)
      : generateDivisionalChart(birthData, chartType)
    
    const template = await loadTemplateInnerSvg(style)
    const centerX = template.width / 2
    const centerY = template.height / 2
    const radius = Math.min(template.width, template.height) * 0.36
    
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
    const planetPositions = chart.planets.map((planet) => {
      const angle = planet.longitude * Math.PI / 180
      const x = centerX + Math.cos(angle) * (radius - 40)
      const y = centerY + Math.sin(angle) * (radius - 40)
      const planetSymbol = getPlanetSymbol(planet.name)
      return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700">${planetSymbol}</text>`
    }).join('')
    
    // Generate sign symbols around the circle
    const signSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
    const signPositions = signSymbols.map((symbol, index) => {
      const angle = (index * 30) * Math.PI / 180
      const x = centerX + Math.cos(angle) * (radius - 10)
      const y = centerY + Math.sin(angle) * (radius - 10)
      return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle" fill="#6b7280" font-family="Arial, Helvetica, sans-serif" font-size="14">${symbol}</text>`
    }).join('')
    
    const svg = `
      <svg width="${template.width}" height="${template.height}" viewBox="0 0 ${template.width} ${template.height}" xmlns="http://www.w3.org/2000/svg">
        ${template.content}
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#c0841a" stroke-width="1.2"/>
        <circle cx="${centerX}" cy="${centerY}" r="${radius - 22}" fill="none" stroke="#c0841a" stroke-width="0.9"/>
        ${houseLines.join('')}
        ${signPositions}
        ${planetPositions}
        <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" fill="#1f2937" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700">${chartType}</text>
      </svg>
    `
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  } catch (error) {
    devLog.error('Error generating chart image:', error, 'route')
    // Return fallback image
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="560" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="560" height="400" fill="#ffffff"/>
        <text x="280" y="200" text-anchor="middle" fill="#1f2937" font-family="Arial, Helvetica, sans-serif" font-size="16">${chartType} Chart</text>
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
    const style = (searchParams.get('style') as 'north' | 'south' | 'east') || 'north'
    
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
    const imageDataUrl = await generateChartImage(chartType, birthData, style)

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
    devLog.error('Error generating chart image:', error, 'route')
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
    const imageDataUrl = await generateChartImage(type, birthData, style)

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
    devLog.error('Error generating chart image:', error, 'route')
    return NextResponse.json(
      { 
        error: 'Failed to generate chart image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
