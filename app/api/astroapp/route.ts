import { type NextRequest, NextResponse } from "next/server"

// Mock astrological data generator
function generateMockAstroData(birthDate: string, birthPlace: string) {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ]
  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]

  // Generate consistent data based on birth date
  const dateHash = new Date(birthDate).getTime()
  const random = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280

  return {
    sun_sign: signs[Math.floor(random(dateHash) * signs.length)],
    moon_sign: signs[Math.floor(random(dateHash + 1) * signs.length)],
    rising_sign: signs[Math.floor(random(dateHash + 2) * signs.length)],
    planets: {
      sun: {
        sign: signs[Math.floor(random(dateHash) * signs.length)],
        house: Math.floor(random(dateHash + 10) * 12) + 1,
        degree: Math.floor(random(dateHash + 20) * 30),
      },
      moon: {
        sign: signs[Math.floor(random(dateHash + 1) * signs.length)],
        house: Math.floor(random(dateHash + 11) * 12) + 1,
        degree: Math.floor(random(dateHash + 21) * 30),
      },
      mercury: {
        sign: signs[Math.floor(random(dateHash + 2) * signs.length)],
        house: Math.floor(random(dateHash + 12) * 12) + 1,
        degree: Math.floor(random(dateHash + 22) * 30),
      },
      venus: {
        sign: signs[Math.floor(random(dateHash + 3) * signs.length)],
        house: Math.floor(random(dateHash + 13) * 12) + 1,
        degree: Math.floor(random(dateHash + 23) * 30),
      },
      mars: {
        sign: signs[Math.floor(random(dateHash + 4) * signs.length)],
        house: Math.floor(random(dateHash + 14) * 12) + 1,
        degree: Math.floor(random(dateHash + 24) * 30),
      },
      jupiter: {
        sign: signs[Math.floor(random(dateHash + 5) * signs.length)],
        house: Math.floor(random(dateHash + 15) * 12) + 1,
        degree: Math.floor(random(dateHash + 25) * 30),
      },
    },
    houses: {
      1: {
        sign: signs[Math.floor(random(dateHash + 100) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 200) * planets.length)],
      },
      2: {
        sign: signs[Math.floor(random(dateHash + 101) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 201) * planets.length)],
      },
      3: {
        sign: signs[Math.floor(random(dateHash + 102) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 202) * planets.length)],
      },
      4: {
        sign: signs[Math.floor(random(dateHash + 103) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 203) * planets.length)],
      },
      5: {
        sign: signs[Math.floor(random(dateHash + 104) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 204) * planets.length)],
      },
      6: {
        sign: signs[Math.floor(random(dateHash + 105) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 205) * planets.length)],
      },
      7: {
        sign: signs[Math.floor(random(dateHash + 106) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 206) * planets.length)],
      },
      8: {
        sign: signs[Math.floor(random(dateHash + 107) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 207) * planets.length)],
      },
      9: {
        sign: signs[Math.floor(random(dateHash + 108) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 208) * planets.length)],
      },
      10: {
        sign: signs[Math.floor(random(dateHash + 109) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 209) * planets.length)],
      },
      11: {
        sign: signs[Math.floor(random(dateHash + 110) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 210) * planets.length)],
      },
      12: {
        sign: signs[Math.floor(random(dateHash + 111) * signs.length)],
        lord: planets[Math.floor(random(dateHash + 211) * planets.length)],
      },
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { birthDate, birthPlace } = await request.json()

    if (!birthDate) {
      return NextResponse.json({ error: "Birth date is required" }, { status: 400 })
    }

    // Check if AstroApp API key is available
    if (process.env.ASTROAPP_API_KEY) {
      // TODO: Implement actual AstroApp API call here
      // For now, return mock data even when API key is available
    }

    // Generate mock astrological data
    const astroData = generateMockAstroData(birthDate, birthPlace || "Unknown")

    return NextResponse.json(astroData)
  } catch (error) {
    console.error("AstroApp API error:", error)

    // Return fallback data on error
    return NextResponse.json({
      sun_sign: "Capricorn",
      moon_sign: "Pisces",
      rising_sign: "Virgo",
      planets: {
        sun: { sign: "Capricorn", house: 5, degree: 15 },
        moon: { sign: "Pisces", house: 7, degree: 22 },
        mercury: { sign: "Sagittarius", house: 4, degree: 8 },
        venus: { sign: "Aquarius", house: 6, degree: 12 },
        mars: { sign: "Scorpio", house: 3, degree: 28 },
        jupiter: { sign: "Taurus", house: 9, degree: 5 },
      },
      houses: {
        1: { sign: "Virgo", lord: "Mercury" },
        2: { sign: "Libra", lord: "Venus" },
        3: { sign: "Scorpio", lord: "Mars" },
        4: { sign: "Sagittarius", lord: "Jupiter" },
        5: { sign: "Capricorn", lord: "Saturn" },
        6: { sign: "Aquarius", lord: "Saturn" },
        7: { sign: "Pisces", lord: "Jupiter" },
        8: { sign: "Aries", lord: "Mars" },
        9: { sign: "Taurus", lord: "Venus" },
        10: { sign: "Gemini", lord: "Mercury" },
        11: { sign: "Cancer", lord: "Moon" },
        12: { sign: "Leo", lord: "Sun" },
      },
    })
  }
}
