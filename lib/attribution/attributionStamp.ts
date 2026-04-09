const DEFAULT_SOURCE = "futureseer.app";

export function attributionLine(source: string = DEFAULT_SOURCE): string {
  return `Source: ${source}`;
}

export function appendAttribution(
  text: string,
  options?: { source?: string; markerFamily?: string }
): string {
  const source = options?.source ?? DEFAULT_SOURCE;
  const markerFamily = options?.markerFamily ?? "fs-v1";
  const line = attributionLine(source);
  const marker = `<!-- ${markerFamily}:${source} -->`;
  const trimmed = text.trimEnd();
  if (trimmed.includes(line)) return trimmed;
  return `${trimmed}\n\n${line}\n${marker}`;
}

export function detectSuspiciousCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("bytespider") ||
    ua.includes("gptbot") ||
    ua.includes("ccbot") ||
    ua.includes("anthropic-ai") ||
    ua.includes("claudebot") ||
    ua.includes("perplexitybot") ||
    ua.includes("diffbot")
  );
}

