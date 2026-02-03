import { type NextRequest, NextResponse } from "next/server"
import { devLog } from '@/lib/devLogger'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

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
    console.error("[FutureSeer] Stability AI API failed:", error)
    return NextResponse.json({
      success: false,
      error: "Image generation failed",
      imageUrl: null,
    })
  }
}
