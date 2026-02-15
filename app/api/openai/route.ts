import { type NextRequest, NextResponse } from "next/server"
import { devLog } from '@/lib/devLogger';
import { createAICompletion } from '@/lib/aiGateway';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { securityEvents } from '@/lib/securityMonitor';

async function handleOpenAIRequest(request: NextRequest) {
  try {
    // Check if OpenAI is configured (either via Gateway or direct API)
    if (!process.env.OPENAI_API_KEY && !process.env.AI_GATEWAY_API_KEY) {
      devLog.error("OpenAI not configured - missing API key", undefined, 'route');
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please add OPENAI_API_KEY or AI_GATEWAY_API_KEY to your .env.local file." },
        { status: 503 },
      )
    }

    // Additional check for API key validity
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length < 10) {
      devLog.error("OpenAI API key is invalid or too short", undefined, 'route');
      return NextResponse.json(
        { error: "OpenAI API key is invalid. Please check your .env.local file." },
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

For comprehensive interpretations, provide detailed analysis covering all life areas. For specific questions, keep responses focused and practical. Write in a wise, compassionate tone that offers hope and guidance.`

    const result = await createAICompletion({
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
      maxTokens: 2000, // Increased for comprehensive interpretations
      temperature: 0.7,
    })

    const prediction =
      result.content ||
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
          tokensUsed: result.usage?.totalTokens || 0,
          model: "gpt-4",
          timestamp: Date.now()
        }
      );
    }

    return NextResponse.json({ prediction })
  } catch (error: any) {
    devLog.error("OpenAI API error:", error, 'route')

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

    // Return more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "OpenAI API key is not configured or invalid. Please check your .env.local file." },
          { status: 503 },
        )
      }
      
      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "OpenAI API quota exceeded. Please try again later." },
          { status: 429 },
        )
      }
      
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { error: "Request timeout. Please try again." },
          { status: 408 },
        )
      }
      
      // Log the actual error for debugging
      devLog.error("Detailed OpenAI error:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      }, 'route');
    }

    return NextResponse.json(
      { 
        error: "Unable to generate prediction at this time. Please check your OpenAI API configuration.",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 },
    )
  }
}

// Export with rate limiting applied
export const POST = withRateLimit(handleOpenAIRequest, rateLimiters.ai);
