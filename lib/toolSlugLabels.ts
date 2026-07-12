/** Human-readable label for orchestrator pipeline slugs (e.g. esotericAstrology → Esoteric Astrology). */
export function humanizePipelineSlug(slug: string): string {
  return slug
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
