import { NextRequest, NextResponse } from 'next/server'
import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate';
import { devLog } from '@/lib/devLogger';
import { callTextAI } from '@/lib/aiStructuredOutput'
import {
  buildMedicalAstrologyState,
  classifyMedicalAstrologyQuestion,
  getMedicalAstrologySliceForQuestionType,
  medicalSeerMissingChartError,
  resolveMedicalSeerChartPayload,
  MEDICAL_DISCLAIMER,
  MEDICAL_SEER_CHART_REQUIRED,
} from '@/lib/medicalAstrologySeerState'
import { buildMedicalAstrologySeerSystemPrompt } from '@/lib/medicalAstrologySeerPrompts'
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
import { buildToolSeerMessages } from '@/lib/aiPromptBuilder'
import { historyFromSeerBody } from '@/lib/seerChatVoice'

const REFUSAL_PHRASE = 'This question requires professional medical evaluation.'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, userProfile } = body
    const missingContextError = medicalSeerMissingChartError(body)
    const __toolSeerGate = await enforceToolSeerGate(request, body, 'medical_astrology_seer', {
      blockedResponseFormat: 'json',
      missingContextError,
    })
    if (__toolSeerGate) return __toolSeerGate

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

    const payload = resolveMedicalSeerChartPayload(body)
    if (!payload) {
      return NextResponse.json(
        { error: MEDICAL_SEER_CHART_REQUIRED },
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

    const slice = getMedicalAstrologySliceForQuestionType(questionType, state)
    const displayName = (userProfile?.displayName ?? '').trim()
    const systemPrompt = buildMedicalAstrologySeerSystemPrompt(slice, questionType, {
      displayName: displayName || undefined,
    })

    const { messages } = buildToolSeerMessages({
      systemContent: systemPrompt,
      userMessage: question,
      history: historyFromSeerBody(body),
    })

    const result = await callTextAI({
      label: 'medical-seer-chat',
      messages,
      model: GROQ_DEFAULT_TEXT_MODEL,
      temperature: 0.6,
      maxTokens: 800,
      maxAttempts: 2,
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
    devLog.error('Medical Seer API error:', error, 'route')
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'An error occurred processing your request.',
      },
      { status: 500 }
    )
  }
}
