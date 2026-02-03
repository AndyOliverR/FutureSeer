import { NextRequest, NextResponse } from 'next/server'
import { createAICompletion } from '@/lib/aiGateway'
import {
  buildMedicalAstrologyState,
  classifyMedicalAstrologyQuestion,
  getMedicalAstrologySliceForQuestionType,
  MEDICAL_DISCLAIMER,
  type MedicalAstrologyChartPayload,
} from '@/lib/medicalAstrologySeerState'

const REFUSAL_PHRASE = 'This question requires professional medical evaluation.'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, analysis, chartData, comprehensiveProfile, userProfile } = body

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Early refusal: classify question and refuse diagnosis/treatment/emergency
    const questionType = classifyMedicalAstrologyQuestion(question)
    if (questionType === 'refusal') {
      return NextResponse.json({
        response: REFUSAL_PHRASE,
        refused: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Payload normalization: derive MedicalAstrologyChartPayload from analysis, chartData, or comprehensiveProfile
    let payload: MedicalAstrologyChartPayload
    if (analysis?.data?.chart) {
      payload = { data: analysis.data }
    } else if (chartData) {
      payload = { data: { chart: chartData } }
    } else if (comprehensiveProfile?.medicalAstrology || comprehensiveProfile?.['Medical Astrology']) {
      const med = comprehensiveProfile.medicalAstrology ?? comprehensiveProfile['Medical Astrology']
      const chart = med.chart ?? med.data?.chart
      if (!chart) {
        return NextResponse.json(
          {
            error:
              'Medical Astrology requires chart data. Generate your medical astrology analysis first to use Ask the Seer.',
          },
          { status: 400 }
        )
      }
      payload = { data: { chart, timing: med.timing ?? med.data?.timing } }
    } else {
      return NextResponse.json(
        {
          error:
            'Medical Astrology requires chart data. Generate your medical astrology analysis first to use Ask the Seer.',
        },
        { status: 400 }
      )
    }

    // Build state; throw if no chart/planets
    let state
    try {
      state = buildMedicalAstrologyState(payload)
    } catch {
      return NextResponse.json(
        {
          error:
            'Medical Astrology requires chart data. Generate your medical astrology analysis first to use Ask the Seer.',
        },
        { status: 400 }
      )
    }

    // Build system prompt from discipline slice (no remedies, no treatments)
    const systemPrompt = getMedicalAstrologySliceForQuestionType(questionType, state)

    const result = await createAICompletion({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      maxTokens: 800,
    })

    let response = result.content || 'I apologize, I could not generate a response at this time.'

    // Post-process: ensure MEDICAL_DISCLAIMER is present
    if (!response.includes(MEDICAL_DISCLAIMER)) {
      response = `${response.trim()}\n\n${MEDICAL_DISCLAIMER}`
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Medical Seer API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'An error occurred processing your request.',
      },
      { status: 500 }
    )
  }
}
