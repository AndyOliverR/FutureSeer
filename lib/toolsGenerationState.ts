export const TOOLS_GENERATION_RESUME_POLL_MS = 15_000;

/** True only while this specific tool is actively generating on visit. */
export function isReportGenerationActive(state: string | undefined): boolean {
  return state === 'running';
}

export function resolveReportGenerationState(
  taskState: string | undefined,
  reportState: string | undefined,
): string | undefined {
  return taskState ?? reportState;
}

export function shouldPollGeneration(
  explicitGenerating: boolean,
  hasPendingTools: boolean,
): boolean {
  return explicitGenerating || hasPendingTools;
}
