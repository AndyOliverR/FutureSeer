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

/** Trailing block from {@link appendAttribution}: blank line(s), `Source: …`, then `<!-- … -->`. */
const ATTRIBUTION_SUFFIX_RE =
  /\n*\nSource:[^\n]+\n<!--[^>]+-->\s*$/u;

/**
 * Removes provenance footer so chat UIs do not show `Source:` / HTML marker while streams stay stamped server-side.
 */
export function stripAttributionForDisplay(text: string): string {
  const trimmed = text.trimEnd();
  return trimmed.replace(ATTRIBUTION_SUFFIX_RE, "").trimEnd();
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

