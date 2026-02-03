import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OPENAI_API_KEY is not set',
        status: 'missing_key'
      })
    }

    // Check if it's a placeholder
    if (process.env.OPENAI_API_KEY.includes('your_')) {
      return NextResponse.json({ 
        error: 'OPENAI_API_KEY contains placeholder text',
        status: 'placeholder_key'
      })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'Hello from FutureSeer'",
        },
      ],
      max_tokens: 10,
    })

    return NextResponse.json({ 
      success: true,
      message: completion.choices[0]?.message?.content,
      status: 'working'
    })

  } catch (error: any) {
    console.error('OpenAI test error:', error)
    
    return NextResponse.json({ 
      error: error.message,
      status: error.status || 'unknown_error',
      details: error.response?.data || error.cause || 'No additional details'
    })
  }
} 