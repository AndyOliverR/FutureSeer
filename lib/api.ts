// PostHog Analytics (Client-side with safety checks)
let posthogInitialized = false

const initializePostHog = () => {
  if (typeof window === "undefined") return false

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!posthogKey || posthogKey.trim() === "" || posthogKey === "undefined") {
    console.warn("[FutureSeer] PostHog key not configured - analytics disabled")
    return false
  }

  try {
    const { posthog } = require("posthog-js")
    posthog.init(posthogKey, {
      api_host: posthogHost || "https://app.posthog.com",
      loaded: (posthog: any) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[FutureSeer] PostHog initialized successfully")
        }
      },
    })
    posthogInitialized = true
    return true
  } catch (error) {
    console.warn("[FutureSeer] PostHog initialization failed:", error)
    return false
  }
}

// Safe event tracking function
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    if (typeof window === "undefined") return

    if (!posthogInitialized) {
      const initialized = initializePostHog()
      if (!initialized) return
    }

    const { posthog } = require("posthog-js")
    posthog.capture(eventName, {
      ...properties,
      timestamp: Date.now(),
      source: "futureseer_web",
    })
  } catch (error) {
    console.warn("[FutureSeer] Event tracking failed:", error)
  }
}

// Astrological Data API
export const getAstroData = async (birthDate: string, birthPlace: string) => {
  try {
    const response = await fetch("/api/astroapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birth_date: birthDate,
        birth_place: birthPlace,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error("Astro API failed")
    }
  } catch (error) {
    console.warn("[FutureSeer] Using fallback astrological data")
    // Fallback astrological data
    return generateFallbackAstroData(birthDate, birthPlace)
  }
}

// Generate fallback astrological data
const generateFallbackAstroData = (birthDate: string, birthPlace: string) => {
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

  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]
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
        }
        return acc
      },
      {} as Record<string, any>,
    ),
    houses: houses.map((house) => ({
      house_number: house,
      sign: zodiacSigns[(house + sunSignIndex - 1) % 12],
      lord: planets[house % 7],
      significance: getHouseSignificance(house),
    })),
    birth_date: birthDate,
    birth_place: birthPlace,
    generated_at: Date.now(),
    source: "fallback",
  }
}

const getHouseSignificance = (house: number): string => {
  const significances = [
    "Self, personality, physical appearance",
    "Wealth, family, speech, values",
    "Communication, siblings, short journeys",
    "Home, mother, emotional foundation",
    "Creativity, children, romance, speculation",
    "Health, service, daily routines, enemies",
    "Partnerships, marriage, business relationships",
    "Transformation, occult, longevity",
    "Higher learning, philosophy, long journeys",
    "Career, reputation, public image",
    "Gains, friendships, hopes and wishes",
    "Losses, spirituality, foreign lands",
  ]
  return significances[house - 1] || "Unknown significance"
}

// AI Prediction Generation
export const generateAIPrediction = async (question: string, astroData: any, symbolicData: any) => {
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

    if (response.ok) {
      const data = await response.json()
      return data.prediction
    } else {
      throw new Error("OpenAI API failed")
    }
  } catch (error) {
    console.warn("[FutureSeer] Using fallback AI prediction")
    return generateFallbackPrediction(question, astroData, symbolicData)
  }
}

// Generate fallback prediction using symbolic interpretation
const generateFallbackPrediction = (question: string, astroData: any, symbolicData: any) => {
  const questionLower = question.toLowerCase()

  // Analyze question type
  let theme = "general"
  if (questionLower.includes("love") || questionLower.includes("relationship")) theme = "love"
  else if (questionLower.includes("career") || questionLower.includes("job") || questionLower.includes("work"))
    theme = "career"
  else if (questionLower.includes("health") || questionLower.includes("body")) theme = "health"
  else if (questionLower.includes("money") || questionLower.includes("wealth") || questionLower.includes("finance"))
    theme = "wealth"
  else if (questionLower.includes("travel") || questionLower.includes("journey")) theme = "travel"

  // Generate prediction based on astrological data and theme
  const sunSign = astroData.sun_sign
  const moonSign = astroData.moon_sign
  const risingSign = astroData.rising_sign

  const predictions = {
    love: [
      `With your ${sunSign} sun and ${moonSign} moon, the cosmic energies suggest a period of emotional growth in relationships. Your ${risingSign} rising indicates how others perceive your romantic energy.`,
      `The planetary alignments in your chart indicate that matters of the heart require patience and understanding. Your ${sunSign} nature seeks harmony, while your ${moonSign} emotions guide you toward deeper connections.`,
      `Venus's influence through your ${sunSign} placement suggests that love comes through authentic self-expression. Trust your ${moonSign} intuition in matters of romance.`,
    ],
    career: [
      `Your ${sunSign} determination combined with ${risingSign} presentation skills creates opportunities for professional advancement. The cosmic timing favors bold career moves.`,
      `With ${moonSign} emotional intelligence and ${sunSign} leadership qualities, you're positioned for success in collaborative endeavors. Trust your professional instincts.`,
      `The planetary positions suggest that your ${risingSign} public image aligns well with your ${sunSign} core purpose. Career growth comes through authentic expression.`,
    ],
    health: [
      `Your ${sunSign} vitality is supported by ${moonSign} emotional balance. Focus on holistic wellness approaches that honor both body and spirit.`,
      `The cosmic energies suggest that your ${risingSign} physical constitution benefits from ${sunSign}-aligned activities. Listen to your body's wisdom.`,
      `With ${moonSign} governing your emotional health and ${sunSign} your vital force, balance is key to optimal wellbeing.`,
    ],
    wealth: [
      `Your ${sunSign} approach to resources, guided by ${moonSign} intuition, reveals opportunities for financial growth. The universe supports practical abundance.`,
      `The planetary alignments suggest that your ${risingSign} public image can attract prosperity. Your ${sunSign} values guide wise financial decisions.`,
      `With ${moonSign} emotional relationship to money and ${sunSign} core values, wealth flows through aligned action and patient cultivation.`,
    ],
    travel: [
      `Your ${sunSign} adventurous spirit, supported by ${moonSign} emotional needs, points toward transformative journeys. The cosmos encourages exploration.`,
      `The planetary positions suggest that travel serves your ${risingSign} growth and ${sunSign} life purpose. New horizons await your discovery.`,
      `With ${moonSign} guiding your emotional needs and ${sunSign} your core desires, journeys bring both adventure and inner wisdom.`,
    ],
    general: [
      `The cosmic tapestry weaves together your ${sunSign} essence, ${moonSign} emotional nature, and ${risingSign} outer expression. This is a time of integration and growth.`,
      `Your astrological blueprint reveals a soul journey guided by ${sunSign} purpose, ${moonSign} intuition, and ${risingSign} presentation to the world.`,
      `The universe speaks through the harmony of your ${sunSign} core self, ${moonSign} inner world, and ${risingSign} external manifestation. Trust the cosmic flow.`,
    ],
  }

  const themePredictions = predictions[theme as keyof typeof predictions] || predictions.general
  const randomPrediction = themePredictions[Math.floor(Math.random() * themePredictions.length)]

  return `${randomPrediction} The symbolic elements in your question resonate with ${symbolicData.primaryElement} energy, suggesting ${symbolicData.guidance}. This is a time for ${symbolicData.action} and embracing the wisdom of ${symbolicData.symbol}.`
}

// Symbolic Data Generation
export const getSymbolicData = (question: string, astroData: any) => {
  const questionLower = question.toLowerCase()

  // Determine primary element based on question and astro data
  const elements = ["Fire", "Earth", "Air", "Water"]
  const colors = ["Red", "Gold", "Blue", "Green", "Purple", "Silver", "White"]
  const numbers = [1, 3, 7, 9, 11, 22, 33]
  const symbols = ["Star", "Moon", "Sun", "Tree", "Mountain", "Ocean", "Phoenix", "Dragon", "Lotus", "Key"]

  // Generate consistent symbolic data based on question content and astro data
  const questionHash = question.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
  const astroHash = astroData.sun_sign.length + astroData.moon_sign.length
  const combinedHash = questionHash + astroHash

  const primaryElement = elements[combinedHash % elements.length]
  const sacredColor = colors[combinedHash % colors.length]
  const luckyNumber = numbers[combinedHash % numbers.length]
  const symbol = symbols[combinedHash % symbols.length]

  // Generate guidance based on symbolic elements
  const guidanceMap = {
    Fire: "passion and decisive action",
    Earth: "grounding and practical steps",
    Air: "communication and mental clarity",
    Water: "emotional flow and intuitive wisdom",
  }

  const actionMap = {
    Fire: "taking bold initiative",
    Earth: "building solid foundations",
    Air: "seeking knowledge and connection",
    Water: "trusting your emotions",
  }

  return {
    primaryElement,
    sacredColor,
    luckyNumber,
    symbol,
    guidance: guidanceMap[primaryElement as keyof typeof guidanceMap],
    action: actionMap[primaryElement as keyof typeof actionMap],
    timestamp: Date.now(),
  }
}

// Remedies Generation
export const getRemedies = (symbolicData: any, question: string) => {
  const remedyDatabase = {
    Fire: [
      {
        icon: "🕯️",
        title: "Sacred Flame Meditation",
        desc: "Light a red candle and meditate for 11 minutes at sunrise",
        type: "ritual",
      },
      {
        icon: "💎",
        title: "Ruby Crystal",
        desc: "Carry a ruby or red jasper for courage and vitality",
        type: "crystal",
      },
      { icon: "📿", title: "Mars Mantra", desc: 'Chant "Om Angarakaya Namaha" 108 times', type: "mantra" },
    ],
    Earth: [
      { icon: "🌱", title: "Grounding Ritual", desc: "Walk barefoot on earth for 15 minutes daily", type: "ritual" },
      {
        icon: "💎",
        title: "Green Aventurine",
        desc: "Keep green aventurine in your workspace for stability",
        type: "crystal",
      },
      {
        icon: "🏠",
        title: "Vastu Harmony",
        desc: "Place a small plant in the northeast corner of your home",
        type: "vastu",
      },
    ],
    Air: [
      {
        icon: "💨",
        title: "Breath of Clarity",
        desc: "Practice pranayama breathing for 10 minutes twice daily",
        type: "ritual",
      },
      { icon: "💎", title: "Clear Quartz", desc: "Meditate with clear quartz for mental clarity", type: "crystal" },
      {
        icon: "📿",
        title: "Mercury Mantra",
        desc: 'Recite "Om Budhaya Namaha" 108 times on Wednesdays',
        type: "mantra",
      },
    ],
    Water: [
      {
        icon: "🌊",
        title: "Moon Water Blessing",
        desc: "Drink water charged under moonlight for 3 nights",
        type: "ritual",
      },
      { icon: "💎", title: "Moonstone", desc: "Wear moonstone jewelry to enhance intuition", type: "crystal" },
      { icon: "🛁", title: "Sacred Bath", desc: "Add sea salt and lavender to your bath on Mondays", type: "ritual" },
    ],
  }

  const colorRemedies = {
    Red: { icon: "👕", title: "Wear Red", desc: "Incorporate red clothing or accessories on Tuesdays", type: "color" },
    Gold: { icon: "✨", title: "Golden Hour", desc: "Spend time in golden sunlight between 6-7 AM", type: "color" },
    Blue: {
      icon: "💙",
      title: "Blue Meditation",
      desc: "Visualize blue light surrounding you during meditation",
      type: "color",
    },
    Green: { icon: "🍃", title: "Nature Connection", desc: "Spend time in green natural spaces weekly", type: "color" },
    Purple: {
      icon: "🔮",
      title: "Third Eye Activation",
      desc: "Focus on purple light at your third eye center",
      type: "color",
    },
    Silver: { icon: "🌙", title: "Lunar Energy", desc: "Wear silver jewelry during the full moon", type: "color" },
    White: { icon: "🤍", title: "Purification", desc: "Wear white on Mondays for spiritual cleansing", type: "color" },
  }

  const numberRemedies = {
    1: { icon: "1️⃣", title: "Unity Meditation", desc: "Meditate alone for enhanced self-awareness", type: "number" },
    3: { icon: "3️⃣", title: "Triple Blessing", desc: "Perform your chosen ritual 3 times daily", type: "number" },
    7: {
      icon: "7️⃣",
      title: "Seven Chakras",
      desc: "Balance all seven chakras with colored light meditation",
      type: "number",
    },
    9: { icon: "9️⃣", title: "Completion Cycle", desc: "Practice gratitude for 9 things daily", type: "number" },
    11: { icon: "🔢", title: "Master Number", desc: "Set intentions at 11:11 AM and PM", type: "number" },
    22: { icon: "🔢", title: "Master Builder", desc: "Focus on manifesting your dreams for 22 days", type: "number" },
    33: { icon: "🔢", title: "Master Teacher", desc: "Share your wisdom with others through service", type: "number" },
  }

  const elementRemedies =
    remedyDatabase[symbolicData.primaryElement as keyof typeof remedyDatabase] || remedyDatabase.Fire
  const colorRemedy = colorRemedies[symbolicData.sacredColor as keyof typeof colorRemedies]
  const numberRemedy = numberRemedies[symbolicData.luckyNumber as keyof typeof numberRemedies]

  return [...elementRemedies, colorRemedy, numberRemedy].filter(Boolean)
}

// Image Generation (Stability AI)
export const generateImage = async (prompt: string) => {
  try {
    const response = await fetch("/api/stability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.imageUrl
    } else {
      throw new Error("Image generation failed")
    }
  } catch (error) {
    console.warn("[FutureSeer] Image generation unavailable")
    return null
  }
}

// Utility function to get trial time left
export const getTrialTimeLeft = (trialEndTime: number) => {
  const now = Date.now()
  const timeLeft = trialEndTime - now
  return Math.max(0, timeLeft)
}

// Format time remaining
export const formatTimeRemaining = (milliseconds: number) => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}
