export const TOOLS_GENERATION_RESUME_POLL_MS = 15_000;

export function isReportGenerationActive(state: string | undefined): boolean {
  return state === undefined || state === 'pending' || state === 'running';
}

export function resolveReportGenerationState(
  taskState: string | undefined,
  reportState: string | undefined,
): string | undefined {
  return taskState ?? reportState;
}
