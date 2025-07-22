import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are set
    const email = process.env.ASTROAPP_EMAIL
    const password = process.env.ASTROAPP_PASSWORD
    const apiKey = process.env.ASTROAPP_API_KEY

    const envStatus = {
      email: email ? '✅ Set' : '❌ Missing',
      password: password ? '✅ Set' : '❌ Missing',
      apiKey: apiKey ? '✅ Set' : '❌ Missing',
    }

    // Test basic authentication
    if (!email || !password || !apiKey) {
      return NextResponse.json({
        status: 'Configuration Error',
        message: 'Missing AstroApp credentials',
        envStatus,
        action: 'Please check your .env.local file and ensure all AstroApp variables are set'
      }, { status: 400 })
    }

    // Test the authentication endpoint
    const credentials = Buffer.from(`${email}:${password}`).toString('base64')
    
    const response = await fetch('https://astroapp.com/astro/apis/chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'key': apiKey,
      },
      body: JSON.stringify({
        chart: {
          chartData: {
            chartName: "Test Chart",
            chartDate: "1990-01-01T12:00:00",
            elevation: 0,
            lat: 40.7128,
            lng: -74.0060,
            elev: 1,
            tz: "America/New_York",
            zodiacID: 100,
            houseSystemID: 1,
            coordSys: "G",
            version: 1
          }
        },
        calcRequestProps: {
          needImage: "N",
          needAspects: "N"
        },
        params: {
          objects: [0, 1]
        }
      }),
    })

    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    if (!response.ok) {
      return NextResponse.json({
        status: 'Authentication Failed',
        message: `AstroApp returned ${response.status}: ${response.statusText}`,
        envStatus,
        response: responseData,
        action: 'Please verify your AstroApp credentials and account status'
      }, { status: 400 })
    }

    return NextResponse.json({
      status: 'Success',
      message: 'AstroApp authentication successful',
      envStatus,
      response: responseData
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      status: 'Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      action: 'Check server logs for more details'
    }, { status: 500 })
  }
} 