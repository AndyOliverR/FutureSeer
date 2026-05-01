/**
 * Parse JSON from LLM output (handles markdown fences and trailing commas).
 */
export function parseJsonObjectFromLLM(response: string): Record<string, unknown> {
  const trimmed = response.trim();
  let jsonStr = trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlock?.[1]) jsonStr = codeBlock[1];
  else {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match?.[0]) jsonStr = match[0];
  }
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(jsonStr) as Record<string, unknown>;
}
