/**
 * Shared input type for routes that map LLM JSON into tool-specific report shapes.
 */

export type GroqStructuredParseInput = string | Record<string, unknown>;

export function isGroqParsedRecord(
  input: GroqStructuredParseInput,
): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
