/**
 * Pure JSON parse/validate helpers for structured LLM outputs (no provider imports).
 */

import type { z } from 'zod';
import { isGroqParsedRecord, type GroqStructuredParseInput } from '@/lib/groqStructuredParse';
import {
  extractJsonCandidate,
  parseJsonWithRepairs,
  stripMarkdownCodeFences,
} from '@/lib/westernJsonParser';

export type StructuredFailureMode =
  | 'none'
  | 'empty_response'
  | 'json_parse_error'
  | 'schema_violation'
  | 'constraint_violation'
  | 'provider_error'
  | 'circuit_open'
  | 'prompt_injection';

export interface StructuredOutputSchema {
  requiredKeys?: string[];
  zodSchema?: z.ZodType<Record<string, unknown>>;
}

/** Parse LLM output to a JSON object (record path or shared extract/repair). */
export function parseLlmJsonRecord(input: GroqStructuredParseInput): Record<string, unknown> | null {
  if (isGroqParsedRecord(input)) {
    return input;
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const result = parseStructuredJsonFromResponse(trimmed);
  return result.ok && result.data ? result.data : null;
}

export function parseStructuredJsonFromResponse(response: string): {
  ok: boolean;
  data?: Record<string, unknown>;
  failureMode: StructuredFailureMode;
} {
  const trimmed = response.trim();
  if (!trimmed) {
    return { ok: false, failureMode: 'empty_response' };
  }

  let candidate = extractJsonCandidate(trimmed);
  if (!candidate) {
    const fenced = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
    if (fenced?.[1]) candidate = fenced[1];
  }

  if (!candidate || candidate.length < 2) {
    return { ok: false, failureMode: 'json_parse_error' };
  }

  candidate = stripMarkdownCodeFences(candidate);
  const extracted = extractJsonCandidate(candidate);
  if (extracted) candidate = extracted;

  try {
    const data = parseJsonWithRepairs(candidate) as Record<string, unknown>;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, failureMode: 'json_parse_error' };
    }
    return { ok: true, data, failureMode: 'none' };
  } catch {
    return { ok: false, failureMode: 'json_parse_error' };
  }
}

export function validateStructuredPayload(
  data: Record<string, unknown>,
  schema?: StructuredOutputSchema,
): StructuredFailureMode {
  if (schema?.requiredKeys?.length) {
    for (const key of schema.requiredKeys) {
      if (!(key in data) || data[key] === undefined || data[key] === null) {
        return 'schema_violation';
      }
    }
  }

  if (schema?.zodSchema) {
    const parsed = schema.zodSchema.safeParse(data);
    if (!parsed.success) {
      return 'schema_violation';
    }
  }

  return 'none';
}
