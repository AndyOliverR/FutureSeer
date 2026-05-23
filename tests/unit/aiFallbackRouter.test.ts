/**
 * @jest-environment node
 */

jest.mock('@/lib/aiAuditEvents', () => ({
  recordAiAuditEvent: jest.fn(),
}));

import { recordAiAuditEvent } from '@/lib/aiAuditEvents';
import { mapStructuredReportRun, resolveAiReportWithFallback } from '@/lib/aiFallbackRouter';

describe('resolveAiReportWithFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns LLM data when tryLlm succeeds', async () => {
    const result = await resolveAiReportWithFallback({
      label: 'test-report',
      tryLlm: async () => ({
        data: { ok: true },
        attempts: 1,
        failureMode: 'none',
      }),
      buildDeterministic: () => ({ ok: false }),
    });

    expect(result.source).toBe('llm');
    expect(result.degraded).toBe(false);
    expect(result.data).toEqual({ ok: true });
  });

  it('falls back to Firestore cache when LLM fails', async () => {
    const result = await resolveAiReportWithFallback({
      label: 'test-report',
      tryLlm: async () => ({
        data: null,
        attempts: 3,
        failureMode: 'json_parse_error',
      }),
      readFirestoreCache: async () => ({ from: 'cache' }),
      buildDeterministic: () => ({ from: 'deterministic' }),
    });

    expect(result.source).toBe('firestore_cache');
    expect(result.degraded).toBe(true);
    expect(result.data).toEqual({ from: 'cache' });
    expect(recordAiAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ fallbackSource: 'firestore_cache' }),
    );
  });

  it('uses deterministic fallback when LLM and cache fail', async () => {
    const result = await resolveAiReportWithFallback({
      label: 'test-report',
      tryLlm: async () => ({
        data: null,
        attempts: 2,
        failureMode: 'provider_error',
      }),
      readFirestoreCache: async () => null,
      buildDeterministic: () => ({ from: 'deterministic' }),
    });

    expect(result.source).toBe('deterministic');
    expect(result.degraded).toBe(true);
    expect(result.data).toEqual({ from: 'deterministic' });
  });
});

describe('mapStructuredReportRun', () => {
  it('maps raw JSON when normalize succeeds', () => {
    const result = mapStructuredReportRun(
      { raw: { a: 1 }, attempts: 1, failureMode: 'none' },
      (raw) => ({ value: raw.a as number }),
    );
    expect(result.data).toEqual({ value: 1 });
    expect(result.failureMode).toBe('none');
  });

  it('returns null data when map throws', () => {
    const result = mapStructuredReportRun(
      { raw: { bad: true }, attempts: 2, failureMode: 'schema_violation' },
      () => {
        throw new Error('normalize failed');
      },
    );
    expect(result.data).toBeNull();
    expect(result.parsingFailed).toBe(true);
  });
});
