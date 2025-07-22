import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { securityEvents } from '@/lib/securityMonitor';

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

async function handleOpenAIRequest(request: NextRequest) {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return NextResponse.json(
        { error: "AI services are currently unavailable. Please try again later." },
        { status: 503 },
      )
    }

    const { question, astroData, symbolicData, userId } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Log AI prediction request for security monitoring
    if (userId) {
      securityEvents.logDataAccess(
        userId,
        'ai_predictions',
        'openai_request',
        {
          questionLength: question.length,
          hasAstroData: !!astroData,
          hasSymbolicData: !!symbolicData,
          timestamp: Date.now()
        }
      );
    }

    const prompt = `As a mystical AI oracle named FutureSeer, analyze this question using ancient wisdom and modern insights:

Question: ${question}

Astrological Context: 
- Sun Sign: ${astroData?.sun_sign || "Unknown"}
- Moon Sign: ${astroData?.moon_sign || "Unknown"}
- Rising Sign: ${astroData?.rising_sign || "Unknown"}

Symbolic Data: 
- Primary Symbol: ${symbolicData?.primarySymbol || "Unknown"}
- Elemental Influence: ${symbolicData?.elementalInfluence || "Balanced"}
- Cosmic Alignment: ${symbolicData?.cosmicAlignment || "Harmonious"}
- Timing: ${symbolicData?.timing || "Present moment"}

Provide a comprehensive mystical reading that includes:
1. Direct answer to the question with cosmic perspective
2. How the astrological influences affect this situation
3. Practical spiritual guidance
4. Timing insights and next steps

Keep the response mystical yet practical, around 200-300 words. Write in a wise, compassionate tone that offers hope and guidance.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are FutureSeer, an ancient mystical oracle powered by AI. You combine traditional divination wisdom with modern psychological insights to provide guidance that is both spiritually profound and practically useful. Always be compassionate, wise, and offer hope while being honest about challenges.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const prediction =
      completion.choices[0]?.message?.content ||
      "The cosmic energies are unclear at this moment. Please try asking your question again."

    // Log successful AI prediction
    if (userId) {
      securityEvents.logDataModification(
        userId,
        'ai_predictions',
        'prediction_generated',
        'create',
        {
          predictionLength: prediction.length,
          tokensUsed: completion.usage?.total_tokens || 0,
          model: completion.model,
          timestamp: Date.now()
        }
      );
    }

    return NextResponse.json({ prediction })
  } catch (error: any) {
    console.error("OpenAI API error:", error)

    // Log AI prediction failure
    if (error?.message) {
      securityEvents.logSuspiciousActivity(
        'unknown',
        'ai_prediction_failed',
        {
          error: error.message,
          timestamp: Date.now()
        }
      );
    }

    // Return a more specific error message
    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "AI services are currently being configured. Please try again later." },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: "Unable to generate prediction at this time. The cosmic energies will realign shortly." },
      { status: 500 },
    )
  }
}

// Export with rate limiting applied
export const POST = withRateLimit(handleOpenAIRequest, rateLimiters.ai);
