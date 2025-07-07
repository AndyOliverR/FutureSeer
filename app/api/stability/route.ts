import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: `${prompt}, mystical, cosmic, ethereal, high quality, detailed`,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    })

    if (!response.ok) {
      throw new Error(`Stability API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      imageUrl: data.artifacts?.[0]?.base64 || null,
    })
  } catch (error) {
    console.error('Stability API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
} 