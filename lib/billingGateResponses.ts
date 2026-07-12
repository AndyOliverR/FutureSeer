import { NextResponse } from 'next/server';
import type { ConsumeBillingFailure } from '@/lib/billingTypes';

export function billingInsufficientCreditsResponse(
  failure: ConsumeBillingFailure,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Add credits to continue',
      code: 'insufficient_credits',
      creditBalance: failure.creditBalance,
      creditsRequired: failure.creditsRequired,
      addCreditsUrl: '/credits',
      ...extra,
    },
    { status: 402 },
  );
}

export function billingInsufficientCreditsStreamBody(failure: ConsumeBillingFailure): string {
  const payload = {
    type: 'billing_required',
    message: 'Add credits to continue asking the Seer.',
    creditBalance: failure.creditBalance,
    creditsRequired: failure.creditsRequired,
    addCreditsUrl: '/credits',
  };
  return `data: ${JSON.stringify(payload)}\n\ndata: [DONE]\n\n`;
}

export function billingInsufficientCreditsStreamResponse(
  failure: ConsumeBillingFailure,
): Response {
  return new Response(billingInsufficientCreditsStreamBody(failure), {
    status: 402,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
