import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userApiAuth';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { runPalmVisionAnalysis } from '@/lib/palmistry/runPalmVisionAnalysis';
import { devLog } from '@/lib/devLogger';

interface PalmAnalysisRequest {
  imageUrl: string;
  dominantHand?: 'left' | 'right';
  gender?: 'male' | 'female' | 'non-binary';
  age?: number;
}

interface PalmAnalysisResponse {
  success: boolean;
  data?: Awaited<ReturnType<typeof runPalmVisionAnalysis>>['data'];
  error?: string;
  parsingFailed?: boolean;
  fallbackSource?: string;
  retryable?: boolean;
  technical?: string;
}

/** Cap image URL / data-URI size to reduce abuse payload size. */
const MAX_IMAGE_URL_CHARS = 6_000_000;

function isAllowedPalmImageUrl(imageUrl: string): boolean {
  if (imageUrl.startsWith('https://')) return true;
  if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('http://127.0.0.1')) {
    return process.env.NODE_ENV === 'development';
  }
  if (imageUrl.startsWith('data:image/')) return true;
  return false;
}

/**
 * Palm Image Analysis Endpoint
 *
 * Uses Groq vision model (default qwen/qwen3.6-27b; override GROQ_VISION_MODEL) to analyze palm images.
 * Requires a signed-in Firebase user — must not be an unauthenticated paid proxy.
 *
 * Trusted server callers (Stage B, update-palmistry) should import
 * `runPalmVisionAnalysis` directly instead of HTTP-looping through this route.
 */
async function handlePalmistryAnalysis(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'palmistry-analysis');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as PalmAnalysisRequest | null;
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (imageUrl.length > MAX_IMAGE_URL_CHARS) {
      return NextResponse.json(
        { success: false, error: `Image URL too long (max ${MAX_IMAGE_URL_CHARS} characters)` },
        { status: 400 }
      );
    }

    if (!isAllowedPalmImageUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, error: 'Image URL must be https or a data:image URI' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const resolved = await runPalmVisionAnalysis(imageUrl);
    const validatedData = resolved.data;

    devLog.info('✅ Palm analysis completed successfully', { uid: auth.uid }, 'palmistry');

    if (resolved.degraded) {
      devLog.warn(
        `⚠️ Palm vision analysis degraded (${resolved.source}) — returning validated defaults`,
        undefined,
        'palmistry',
      );
      return NextResponse.json({
        success: true,
        data: validatedData,
        parsingFailed: resolved.parsingFailed ?? true,
        fallbackSource: resolved.source,
        error: 'Failed to parse vision AI response, using palmistry field defaults',
      } satisfies PalmAnalysisResponse);
    }

    return NextResponse.json({
      success: true,
      data: validatedData,
    } satisfies PalmAnalysisResponse);

  } catch (error: any) {
    // Detailed error handling with user-friendly messages
    let userMessage = 'Failed to analyze palm image';
    let statusCode = 500;

    if (error.message?.includes('GROQ_API_KEY')) {
      userMessage = 'Service configuration error. Please contact support.';
      statusCode = 503;
    } else if (error.message?.includes('context_length_exceeded') ||
        error.message?.includes('reduce the length')) {
      userMessage = 'Analysis request too complex. The palm image may be too large or detailed. Please try uploading a clearer, simpler image.';
      statusCode = 400;
    } else if (error.message?.includes('rate_limit')) {
      userMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.message?.includes('authentication') || error.message?.includes('API key')) {
      userMessage = 'Service configuration error. Please contact support.';
      statusCode = 503;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    } else if (error.message?.includes('timeout')) {
      userMessage = 'Analysis timed out. Please try again with a clearer image.';
      statusCode = 504;
    }

    devLog.error('❌ Palm analysis error:', {
      error: error.message,
      stack: error.stack,
      userMessage
    }, 'route');

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        retryable: statusCode >= 500 || statusCode === 429, // Indicate if retry is recommended
        technical: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

export const POST = withRateLimit(handlePalmistryAnalysis, rateLimiters.ai, 'palmistry_analysis_post');
