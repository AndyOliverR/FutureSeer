import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { birthDate, birthPlace } = await request.json()

    const response = await fetch('https://json.freeastrologyapi.com/v1/birth-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ASTROAPP_API_KEY}`,
      },
      body: JSON.stringify({
        day: parseInt(birthDate.split('-')[2]),
        month: parseInt(birthDate.split('-')[1]),
        year: parseInt(birthDate.split('-')[0]),
        hour: 12,
        min: 0,
        lat: 0, // You might want to geocode the birth place
        lon: 0,
        tzone: 5.5, // Default to IST
      }),
    })

    if (!response.ok) {
      throw new Error(`AstroApp API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      sun_sign: data.sun_sign || 'Unknown',
      moon_sign: data.moon_sign || 'Unknown',
      rising_sign: data.ascendant || 'Unknown',
      planets: data.planets || {},
      houses: data.houses || {},
    })
  } catch (error) {
    console.error('AstroApp API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch astrological data' },
      { status: 500 }
    )
  }
}
