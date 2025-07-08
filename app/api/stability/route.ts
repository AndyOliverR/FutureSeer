import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if Stability API key is available
    if (!process.env.STABILITY_API_KEY) {
      return NextResponse.json({ error: "Stability AI not configured" }, { status: 503 })
    }

    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
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

    if (!response.ok) {
      throw new Error("Failed to generate image")
    }

    const data = await response.json()

    // Convert base64 to blob URL (simplified for demo)
    const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Stability API error:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
