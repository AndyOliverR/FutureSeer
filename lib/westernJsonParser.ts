/**
 * Low-level JSON extraction/repair. Prefer `parseStructuredJsonFromResponse` /
 * `callStructuredAI` from `@/lib/aiStructuredOutput` for LLM comprehensive reports.
 */
export function stripMarkdownCodeFences(input: string): string {
  return input.replace(/```(?:json)?/gi, '').replace(/```/g, '');
}

export function extractJsonCandidate(input: string): string | null {
  const cleaned = stripMarkdownCodeFences(input);
  const start = cleaned.indexOf('{');
  if (start < 0) return null;
  const end = cleaned.lastIndexOf('}');
  if (end > start) return cleaned.slice(start, end + 1);
  return cleaned.slice(start);
}

export function closeOpenJsonStructures(input: string): string {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{' || ch === '[') {
      stack.push(ch);
      continue;
    }
    if (ch === '}') {
      if (stack[stack.length - 1] === '{') stack.pop();
      continue;
    }
    if (ch === ']') {
      if (stack[stack.length - 1] === '[') stack.pop();
      continue;
    }
  }

  if (inString) input += '"';
  while (stack.length > 0) {
    const open = stack.pop();
    input += open === '{' ? '}' : ']';
  }
  return input;
}

export function parseJsonWithRepairs(raw: string): any {
  const base = raw
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  try {
    return JSON.parse(base);
  } catch {
    const closed = closeOpenJsonStructures(base).replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(closed);
  }
}
