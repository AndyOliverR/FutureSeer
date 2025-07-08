import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

let openai: OpenAI | null = null

// Initialize OpenAI only if API key is available
const initializeOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    console.warn("[FutureSeer] OpenAI API key not configured")
    return null
  }

  try {
    return new OpenAI({ apiKey })
  } catch (error) {
    console.error("[FutureSeer] OpenAI initialization failed:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, astroData, symbolicData } = await request.json()

    // Initialize OpenAI if not already done
    if (!openai) {
      openai = initializeOpenAI()
    }

    // If OpenAI is not available, return fallback response
    if (!openai) {
      return NextResponse.json({
        prediction: generateFallbackPrediction(question, astroData, symbolicData),
        source: "fallback",
      })
    }

    // Create AI prompt
    const prompt = `As a wise cosmic oracle, provide mystical guidance for this question: "${question}"

Astrological Context:
- Sun Sign: ${astroData.sun_sign}
- Moon Sign: ${astroData.moon_sign}
- Rising Sign: ${astroData.rising_sign}

Symbolic Elements:
- Primary Element: ${symbolicData.primaryElement}
- Sacred Color: ${symbolicData.sacredColor}
- Lucky Number: ${symbolicData.luckyNumber}
- Symbol: ${symbolicData.symbol}

Provide a mystical, insightful response that weaves together the astrological and symbolic elements. Be wise, compassionate, and spiritually uplifting. Keep the response between 100-200 words.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a wise, mystical oracle who provides spiritual guidance through the synthesis of astrology, numerology, and symbolic wisdom. Your responses are insightful, compassionate, and spiritually uplifting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    })

    const prediction =
      completion.choices[0]?.message?.content || generateFallbackPrediction(question, astroData, symbolicData)

    return NextResponse.json({
      prediction,
      source: "openai",
    })
  } catch (error) {
    console.error("[FutureSeer] OpenAI API error:", error)

    // Return fallback prediction on error
    const { question, astroData, symbolicData } = await request.json()
    return NextResponse.json({
      prediction: generateFallbackPrediction(question, astroData, symbolicData),
      source: "fallback_error",
    })
  }
}

// Fallback prediction generator
function generateFallbackPrediction(question: string, astroData: any, symbolicData: any) {
  const templates = [
    `The cosmic energies surrounding your ${astroData.sun_sign} essence reveal profound insights. Your ${symbolicData.primaryElement} nature, illuminated by ${symbolicData.sacredColor} light, suggests a path of ${symbolicData.guidance}. The universe whispers through the symbol of the ${symbolicData.symbol}, encouraging you to embrace transformation. Trust in the sacred number ${symbolicData.luckyNumber} as it appears in your journey, for it carries the vibration of your soul's purpose.`,

    `As the celestial dance unfolds, your ${astroData.moon_sign} moon guides your emotional wisdom while your ${astroData.rising_sign} rising shapes how the world perceives your light. The ${symbolicData.primaryElement} element flows through your question, bringing clarity through ${symbolicData.sacredColor} energy. The ${symbolicData.symbol} appears as your spiritual guide, reminding you that ${symbolicData.guidance} leads to your highest good.`,

    `The ancient wisdom speaks through your astrological blueprint - ${astroData.sun_sign} sun, ${astroData.moon_sign} moon, and ${astroData.rising_sign} rising create a sacred trinity of purpose. Your connection to ${symbolicData.primaryElement} energy, blessed by ${symbolicData.sacredColor} vibrations, reveals that this is a time for ${symbolicData.action}. The mystical ${symbolicData.symbol} emerges as your talisman, carrying the power of ${symbolicData.luckyNumber} to manifest your desires.`,
  ]

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
  return randomTemplate
}
