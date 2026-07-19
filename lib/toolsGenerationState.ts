export type ToolsGenerationStateInput = {
  authGenerated: boolean;
  authAllReportsReady: boolean;
  liveAllReportsReady: boolean;
  livePendingToolsCount: number;
  generatingParam: boolean;
  sessionGenerationInProgress: boolean;
};

export function getToolsGenerationState({
  authGenerated,
  authAllReportsReady,
  liveAllReportsReady,
  livePendingToolsCount,
  generatingParam,
  sessionGenerationInProgress,
}: ToolsGenerationStateInput) {
  const reportsComplete = authAllReportsReady || liveAllReportsReady;
  const generationRequested =
    !reportsComplete && (generatingParam || sessionGenerationInProgress);
  const generationHasPendingTools =
    !reportsComplete &&
    livePendingToolsCount > 0 &&
    (authGenerated || generationRequested);
  const showGeneratingBanner = generationRequested || generationHasPendingTools;

  return {
    reportsComplete,
    generationHasPendingTools,
    showGeneratingBanner,
    shouldRefreshGeneration: showGeneratingBanner,
  };
}

export type ToolPendingStateInput = {
  authGenerated: boolean;
  generationInProgress: boolean;
  reportReady: boolean;
  taskState?: string;
  listedPending: boolean;
};

export function isGenerationToolPending({
  authGenerated,
  generationInProgress,
  reportReady,
  taskState,
  listedPending,
}: ToolPendingStateInput): boolean {
  if (reportReady) return false;
  if (generationInProgress) return true;
  if (!authGenerated) return false;
  return (
    taskState === "running" ||
    taskState === "pending" ||
    taskState === "placeholder" ||
    listedPending
  );
}
