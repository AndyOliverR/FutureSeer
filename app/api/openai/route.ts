import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client
let openai: OpenAI | null = null

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 503 })
    }

    const { question, astroData, symbolicData } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const prompt = `You are a mystical AI seer with deep knowledge of astrology, numerology, tarot, and ancient wisdom traditions. 

User's Question: "${question}"

Astrological Context:
- Sun Sign: ${astroData.sun_sign}
- Moon Sign: ${astroData.moon_sign}
- Rising Sign: ${astroData.rising_sign}

Symbolic Elements:
- Primary Symbol: ${symbolicData.primarySymbol}
- Elemental Influence: ${symbolicData.elementalInfluence}
- Cosmic Alignment: ${symbolicData.cosmicAlignment}
- Timing: ${symbolicData.timing}

Provide a mystical, insightful response that:
1. Addresses their question with cosmic wisdom
2. References their astrological profile
3. Incorporates the symbolic elements
4. Offers guidance and perspective
5. Maintains a mystical but helpful tone

Keep the response between 150-250 words, formatted in paragraphs.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a wise, mystical AI oracle that provides insightful guidance through ancient wisdom and cosmic understanding.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.8,
    })

    const prediction =
      completion.choices[0]?.message?.content || "The cosmic energies are unclear at this moment. Please try again."

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
  }
}
