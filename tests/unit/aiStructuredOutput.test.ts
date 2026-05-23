import {
  parseStructuredJsonFromResponse,
  validateStructuredPayload,
} from '@/lib/aiStructuredOutputParse';

describe('aiStructuredOutput', () => {
  it('parses JSON wrapped in markdown fences', () => {
    const result = parseStructuredJsonFromResponse(
      'Here is the analysis:\n```json\n{"chartOverview":"ok","score":1}\n```',
    );
    expect(result.ok).toBe(true);
    expect(result.data?.chartOverview).toBe('ok');
  });

  it('returns json_parse_error for non-JSON text', () => {
    const result = parseStructuredJsonFromResponse('No structured data here.');
    expect(result.ok).toBe(false);
    expect(result.failureMode).toBe('json_parse_error');
  });

  it('validates required keys', () => {
    const mode = validateStructuredPayload(
      { chartOverview: 'x' },
      { requiredKeys: ['chartOverview', 'missingKey'] },
    );
    expect(mode).toBe('schema_violation');
  });

  it('passes when required keys are present', () => {
    const mode = validateStructuredPayload(
      { chartOverview: 'x', score: 1 },
      { requiredKeys: ['chartOverview'] },
    );
    expect(mode).toBe('none');
  });
});
