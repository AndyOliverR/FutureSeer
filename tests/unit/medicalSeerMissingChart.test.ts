/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import {
  MEDICAL_SEER_CHART_REQUIRED,
  medicalSeerMissingChartError,
} from '@/lib/medicalAstrologySeerState';
import { consumeBillingAction } from '@/lib/billingCreditsServer';
import { callTextAI } from '@/lib/aiStructuredOutput';

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: jest.fn(async () => ({ ok: true, uid: 'user-1' })),
  resolveOwnedUserId: jest.fn((requested: string, authUid: string) =>
    requested === authUid ? requested : null,
  ),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: jest.fn(async () => ({
    allowed: true,
    resetTime: Date.now() + 60_000,
  })),
}));

jest.mock('@/lib/aiAuditEvents', () => ({
  recordAiAuditEvent: jest.fn(),
}));

jest.mock('@/lib/billingCreditsServer', () => ({
  consumeBillingAction: jest.fn(async () => ({
    ok: true,
    charged: true,
    creditsCharged: 1,
    creditBalance: 9,
    usedFreeInstance: false,
  })),
}));

jest.mock('@/lib/aiStructuredOutput', () => ({
  callTextAI: jest.fn(),
}));

const consumeBillingActionMock = consumeBillingAction as jest.MockedFunction<
  typeof consumeBillingAction
>;
const callTextAIMock = callTextAI as jest.MockedFunction<typeof callTextAI>;

describe('medicalSeerMissingChartError', () => {
  it('flags the Medical Ask-the-Seer UI payload when analysis is null', () => {
    expect(
      medicalSeerMissingChartError({
        analysis: null,
        userProfile: { displayName: 'Ada' },
      }),
    ).toBe(MEDICAL_SEER_CHART_REQUIRED);
  });

  it('accepts a chart with planets from the medical page analysis shape', () => {
    expect(
      medicalSeerMissingChartError({
        analysis: {
          chart: {
            ascendant: 'Aries',
            planets: { Sun: { sign: 'Aries', house: 1 }, Moon: { sign: 'Taurus', house: 2 } },
            houses: [{ house: 1, sign: 'Aries' }],
          },
        },
      }),
    ).toBeNull();
  });
});

describe('POST /api/chat/medical-seer', () => {
  beforeEach(() => {
    consumeBillingActionMock.mockClear();
    callTextAIMock.mockReset();
  });

  async function postMedicalSeer(body: Record<string, unknown>) {
    const { POST } = await import('@/app/api/chat/medical-seer/route');
    const req = new NextRequest('http://localhost/api/chat/medical-seer', {
      method: 'POST',
      headers: { Authorization: 'Bearer test', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(req);
  }

  it('does not debit credits when Ask the Seer is used without a medical chart', async () => {
    const res = await postMedicalSeer({
      question: 'What health tendencies does my chart show?',
      analysis: null,
      userProfile: { displayName: 'Ada' },
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/chart data/i);
    expect(consumeBillingActionMock).not.toHaveBeenCalled();
    expect(callTextAIMock).not.toHaveBeenCalled();
  });

  it('still bills when a usable medical chart is present', async () => {
    callTextAIMock.mockResolvedValueOnce({
      content: 'Your 6th house shows a tendency toward caution.',
      attempts: 1,
      failureMode: 'none',
    });

    const res = await postMedicalSeer({
      question: 'What health tendencies does my chart show?',
      analysis: {
        chart: {
          ascendant: 'Aries',
          planets: { Sun: { sign: 'Aries', house: 1 }, Moon: { sign: 'Taurus', house: 2 } },
          houses: [{ house: 1, sign: 'Aries' }],
        },
      },
      userProfile: { displayName: 'Ada' },
    });

    expect(res.status).toBe(200);
    expect(consumeBillingActionMock).toHaveBeenCalledTimes(1);
    expect(callTextAIMock).toHaveBeenCalledTimes(1);
  });
});
