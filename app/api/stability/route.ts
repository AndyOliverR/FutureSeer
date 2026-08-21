import { type NextRequest, NextResponse } from "next/server"
import { devLog } from '@/lib/devLogger'
import { verifyUserRequest } from '@/lib/userApiAuth'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

const MAX_PROMPT_CHARS = 2_000

async function handleStabilityRequest(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'stability');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null)
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: "Prompt is required",
        imageUrl: null,
      }, { status: 400 })
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      return NextResponse.json({
        success: false,
        error: `Prompt too long (max ${MAX_PROMPT_CHARS} characters)`,
        imageUrl: null,
      }, { status: 400 })
    }

    const stabilityApiKey = process.env.STABILITY_API_KEY

    if (!stabilityApiKey || stabilityApiKey.trim() === "" || stabilityApiKey === "undefined") {
      devLog.warn("[FutureSeer] Stability AI API key not configured", undefined, 'stability')
      return NextResponse.json({
        success: false,
        error: "Image generation not configured",
        imageUrl: null,
      })
    }

    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${stabilityApiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: `${prompt}, mystical, ethereal, cosmic, spiritual art style, high quality`,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const imageBase64 = data.artifacts[0].base64
      const imageUrl = `data:image/png;base64,${imageBase64}`

      return NextResponse.json({
        success: true,
        imageUrl,
      })
    } else {
      throw new Error(`Stability AI API error: ${response.status}`)
    }
  } catch (error) {
    devLog.error("[FutureSeer] Stability AI API failed:", error, 'route')
    return NextResponse.json({
      success: false,
      error: "Image generation failed",
      imageUrl: null,
    })
  }
}

export const POST = withRateLimit(handleStabilityRequest, rateLimiters.ai, 'stability_post');
