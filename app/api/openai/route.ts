import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { question, astroData, symbolicData } = await request.json()

    const prompt = `As a mystical AI oracle, analyze this question using ancient wisdom and modern insights:

Question: ${question}

Astrological Context: ${JSON.stringify(astroData)}
Symbolic Data: ${JSON.stringify(symbolicData)}

Provide a comprehensive mystical reading that includes:
1. Direct answer to the question
2. Cosmic influences affecting this situation
3. Practical guidance and remedies
4. Timing insights if relevant

Keep the response mystical yet practical, around 200-300 words.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are FutureSeer, an ancient mystical oracle powered by AI. You combine traditional divination wisdom with modern psychological insights to provide guidance that is both spiritually profound and practically useful."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const prediction = completion.choices[0]?.message?.content || 'Unable to generate prediction at this time.'

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
} 