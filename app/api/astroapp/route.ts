import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { birth_date, birth_place } = await request.json()

    const astroApiKey = process.env.ASTROAPP_API_KEY

    if (!astroApiKey || astroApiKey.trim() === "" || astroApiKey === "undefined") {
      console.warn("[FutureSeer] AstroApp API key not configured, using fallback data")
      return NextResponse.json(generateFallbackAstroData(birth_date, birth_place))
    }

    // Make request to AstroApp API
    const response = await fetch("https://api.astroapp.com/v1/chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${astroApiKey}`,
      },
      body: JSON.stringify({
        birth_date,
        birth_place,
        chart_type: "natal",
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      throw new Error(`AstroApp API error: ${response.status}`)
    }
  } catch (error) {
    console.warn("[FutureSeer] AstroApp API failed, using fallback data:", error)
    const { birth_date, birth_place } = await request.json()
    return NextResponse.json(generateFallbackAstroData(birth_date, birth_place))
  }
}

// Generate fallback astrological data
function generateFallbackAstroData(birthDate: string, birthPlace: string) {
  const date = new Date(birthDate)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

  const zodiacSigns = [
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

  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]
  const houses = Array.from({ length: 12 }, (_, i) => i + 1)

  // Generate consistent data based on birth date
  const sunSignIndex = Math.floor((dayOfYear / 30.44) % 12)
  const moonSignIndex = (sunSignIndex + Math.floor(dayOfYear / 7)) % 12
  const risingSignIndex = (sunSignIndex + Math.floor(dayOfYear / 3)) % 12

  return {
    sun_sign: zodiacSigns[sunSignIndex],
    moon_sign: zodiacSigns[moonSignIndex],
    rising_sign: zodiacSigns[risingSignIndex],
    planetary_positions: planets.reduce(
      (acc, planet, index) => {
        acc[planet.toLowerCase()] = {
          sign: zodiacSigns[(sunSignIndex + index) % 12],
          house: houses[(index * 3 + Math.floor(dayOfYear / 10)) % 12],
          degree: Math.floor((dayOfYear * (index + 1)) % 30),
          retrograde: Math.random() > 0.8, // 20% chance of retrograde
        }
        return acc
      },
      {} as Record<string, any>,
    ),
    houses: houses.map((house) => ({
      house_number: house,
      sign: zodiacSigns[(house + sunSignIndex - 1) % 12],
      lord: planets[house % planets.length],
      significance: getHouseSignificance(house),
    })),
    birth_date: birthDate,
    birth_place: birthPlace,
    generated_at: Date.now(),
    source: "fallback",
  }
}

function getHouseSignificance(house: number): string {
  const significances = [
    "Self, personality, physical appearance, first impressions",
    "Wealth, family, speech, values, material possessions",
    "Communication, siblings, short journeys, courage",
    "Home, mother, emotional foundation, property",
    "Creativity, children, romance, speculation, education",
    "Health, service, daily routines, enemies, obstacles",
    "Partnerships, marriage, business relationships, legal matters",
    "Transformation, occult, longevity, hidden knowledge",
    "Higher learning, philosophy, long journeys, spirituality",
    "Career, reputation, public image, authority figures",
    "Gains, friendships, hopes and wishes, elder siblings",
    "Losses, spirituality, foreign lands, subconscious mind",
  ]
  return significances[house - 1] || "Unknown significance"
}
