import posthog from "posthog-js"

// Initialize PostHog only if key is available
let posthogInitialized = false

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com"

  if (posthogKey && posthogKey.trim() !== "") {
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") posthog.debug()
        },
      })
      posthogInitialized = true
    } catch (error) {
      console.warn("PostHog initialization failed:", error)
      posthogInitialized = false
    }
  } else {
    console.warn("PostHog key not found. Analytics will be disabled.")
  }
}

// AstroApp API functions
export async function getAstroData(birthDate: string, birthPlace: string) {
  try {
    const response = await fetch("/api/astroapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birthDate,
        birthPlace,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch astrological data")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching astro data:", error)
    // Return fallback data
    return {
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
    }
  }
}

// Stability AI for symbolic backgrounds
export async function generateSymbolicImage(prompt: string) {
  try {
    const response = await fetch("/api/stability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate image")
    }

    const data = await response.json()
    return data.imageUrl
  } catch (error) {
    console.error("Error generating image:", error)
    return null
  }
}

// OpenAI for AI predictions and summaries - Server-side only
export async function generateAIPrediction(question: string, astroData: any, symbolicData: any) {
  try {
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        astroData,
        symbolicData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to generate prediction")
    }

    const data = await response.json()
    return data.prediction
  } catch (error) {
    console.error("Error generating prediction:", error)

    // Return fallback prediction when AI is unavailable
    return generateFallbackPrediction(question, astroData, symbolicData)
  }
}

// Fallback prediction when AI services are unavailable
function generateFallbackPrediction(question: string, astroData: any, symbolicData: any) {
  const insights = [
    "The cosmic energies surrounding your question suggest a time of transformation and growth.",
    "Your astrological chart indicates strong planetary influences that favor positive change.",
    "The universe whispers of opportunities that align with your highest good.",
    "Ancient wisdom suggests patience and mindful action will lead to favorable outcomes.",
    "The stars indicate that your intuition holds the key to navigating this situation.",
  ]

  const randomInsight = insights[Math.floor(Math.random() * insights.length)]

  return `${randomInsight} 

Based on your astrological profile with ${astroData.sun_sign} sun and ${astroData.moon_sign} moon, the cosmic forces suggest focusing on your natural strengths. The symbolic elements present in your question point toward ${symbolicData.elementalInfluence?.toLowerCase() || "balanced"} energy patterns.

Consider meditation and reflection as you move forward. The timing appears ${symbolicData.timing?.toLowerCase() || "favorable"} for taking inspired action.

*Note: This is a general cosmic reading. For personalized insights, our AI oracle will be available once configured.*`
}

// PostHog analytics - Safe wrapper functions
export function trackEvent(event: string, properties?: any) {
  if (typeof window !== "undefined" && posthogInitialized && posthog) {
    try {
      posthog.capture(event, properties)
    } catch (error) {
      console.warn("Failed to track event:", error)
    }
  }
}

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== "undefined" && posthogInitialized && posthog) {
    try {
      posthog.identify(userId, properties)
    } catch (error) {
      console.warn("Failed to identify user:", error)
    }
  }
}

// Symbolic data mapping
export function getSymbolicData(question: string, astroData: any) {
  // This function generates symbolic data based on the question and astrological context
  const symbols = [
    "🌙 Moon",
    "☀️ Sun",
    "⭐ Star",
    "🔮 Crystal",
    "🌸 Flower",
    "🌊 Water",
    "🔥 Fire",
    "🌍 Earth",
    "💎 Diamond",
    "🦋 Butterfly",
    "🐉 Dragon",
    "🦅 Eagle",
  ]

  const elements = ["Fire", "Water", "Earth", "Air"]
  const alignments = ["Harmonious", "Challenging", "Transformative", "Balanced"]
  const timings = ["Immediate", "Within a week", "Within a month", "Within a year"]
  const colors = ["red", "blue", "green", "yellow", "purple", "orange"]
  const numbers = [1, 3, 7, 9, 11, 21, 108]

  const randomSymbols = symbols.sort(() => 0.5 - Math.random()).slice(0, 3)

  return {
    primarySymbol: randomSymbols[0],
    secondarySymbols: randomSymbols.slice(1),
    elementalInfluence: elements[Math.floor(Math.random() * elements.length)],
    cosmicAlignment: alignments[Math.floor(Math.random() * alignments.length)],
    timing: timings[Math.floor(Math.random() * timings.length)],
    colors: colors.sort(() => 0.5 - Math.random()).slice(0, 2),
    numbers: numbers.sort(() => 0.5 - Math.random()).slice(0, 2),
    elements: elements.sort(() => 0.5 - Math.random()).slice(0, 2),
  }
}

// Remedy suggestions
export const getRemedies = (symbolicData: any, question: string) => {
  const remedies = []

  // Mudras based on elements
  if (symbolicData.elements?.includes("Fire") || symbolicData.elements?.includes("fire")) {
    remedies.push({
      icon: "🔥",
      title: "Agni Mudra",
      desc: "Join ring finger tip to thumb tip for 15 minutes daily to enhance fire energy",
      type: "mudra",
    })
  }

  if (symbolicData.elements?.includes("Water") || symbolicData.elements?.includes("water")) {
    remedies.push({
      icon: "🌊",
      title: "Varun Mudra",
      desc: "Join little finger tip to thumb tip for emotional balance and flow",
      type: "mudra",
    })
  }

  if (symbolicData.elements?.includes("Earth") || symbolicData.elements?.includes("earth")) {
    remedies.push({
      icon: "🌍",
      title: "Prithvi Mudra",
      desc: "Join ring finger tip to thumb tip for grounding and stability",
      type: "mudra",
    })
  }

  if (symbolicData.elements?.includes("Air") || symbolicData.elements?.includes("air")) {
    remedies.push({
      icon: "💨",
      title: "Vayu Mudra",
      desc: "Press index finger to thumb base for mental clarity and communication",
      type: "mudra",
    })
  }

  // Crystals based on colors
  if (symbolicData.colors) {
    symbolicData.colors.forEach((color: string) => {
      const crystalMap = {
        red: { name: "Red Jasper", properties: "Grounding and protection", icon: "🔴" },
        blue: { name: "Lapis Lazuli", properties: "Wisdom and communication", icon: "🔵" },
        green: { name: "Green Aventurine", properties: "Growth and abundance", icon: "🟢" },
        yellow: { name: "Citrine", properties: "Joy and manifestation", icon: "🟡" },
        purple: { name: "Amethyst", properties: "Spirituality and peace", icon: "🟣" },
        orange: { name: "Carnelian", properties: "Creativity and courage", icon: "🟠" },
      }

      const crystal = crystalMap[color as keyof typeof crystalMap]
      if (crystal) {
        remedies.push({
          icon: crystal.icon,
          title: crystal.name,
          desc: `${crystal.properties} - Carry or meditate with this crystal daily`,
          type: "crystal",
        })
      }
    })
  }

  // Mantras based on numbers
  if (symbolicData.numbers?.includes(108)) {
    remedies.push({
      icon: "🕉️",
      title: "Om Namah Shivaya",
      desc: "Chant this sacred mantra 108 times daily for spiritual awakening",
      type: "mantra",
    })
  }

  if (symbolicData.numbers?.includes(21)) {
    remedies.push({
      icon: "📿",
      title: "Gayatri Mantra",
      desc: "Recite 21 times at sunrise for divine wisdom and guidance",
      type: "mantra",
    })
  }

  // Default remedies if none generated
  if (remedies.length === 0) {
    remedies.push(
      {
        icon: "🕯️",
        title: "Sacred Candle",
        desc: "Light a white candle at sunset for 21 minutes daily",
        type: "ritual",
      },
      {
        icon: "💎",
        title: "Clear Quartz",
        desc: "Carry clear quartz for amplifying positive intentions",
        type: "crystal",
      },
      {
        icon: "🌿",
        title: "Sage Cleansing",
        desc: "Burn sage to clear negative energies from your space",
        type: "ritual",
      },
      {
        icon: "📿",
        title: "Meditation Practice",
        desc: "Practice 10 minutes of mindful meditation daily",
        type: "practice",
      },
    )
  }

  return remedies.slice(0, 4) // Return max 4 remedies
}
