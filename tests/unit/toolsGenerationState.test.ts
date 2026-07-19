import {
  getToolsGenerationState,
  isGenerationToolPending,
} from "@/lib/toolsGenerationState";

describe("tools generation state", () => {
  it("keeps recovery active when first-run auth data is stale", () => {
    const state = getToolsGenerationState({
      authGenerated: false,
      authAllReportsReady: false,
      liveAllReportsReady: false,
      livePendingToolsCount: 42,
      generatingParam: true,
      sessionGenerationInProgress: true,
    });

    expect(state).toEqual({
      reportsComplete: false,
      generationHasPendingTools: true,
      showGeneratingBanner: true,
      shouldRefreshGeneration: true,
    });
    expect(
      isGenerationToolPending({
        authGenerated: false,
        generationInProgress: state.showGeneratingBanner,
        reportReady: false,
        listedPending: true,
      }),
    ).toBe(true);
  });

  it("clears stale generation UI from the live completed profile", () => {
    expect(
      getToolsGenerationState({
        authGenerated: false,
        authAllReportsReady: false,
        liveAllReportsReady: true,
        livePendingToolsCount: 0,
        generatingParam: true,
        sessionGenerationInProgress: true,
      }),
    ).toEqual({
      reportsComplete: true,
      generationHasPendingTools: false,
      showGeneratingBanner: false,
      shouldRefreshGeneration: false,
    });
  });

  it("unlocks each displayable report while other reports generate", () => {
    expect(
      isGenerationToolPending({
        authGenerated: false,
        generationInProgress: true,
        reportReady: true,
        taskState: "pending",
        listedPending: true,
      }),
    ).toBe(false);
  });

  it("does not lock the catalog before generation starts", () => {
    const state = getToolsGenerationState({
      authGenerated: false,
      authAllReportsReady: false,
      liveAllReportsReady: false,
      livePendingToolsCount: 42,
      generatingParam: false,
      sessionGenerationInProgress: false,
    });

    expect(state.showGeneratingBanner).toBe(false);
    expect(
      isGenerationToolPending({
        authGenerated: false,
        generationInProgress: state.showGeneratingBanner,
        reportReady: false,
        listedPending: true,
      }),
    ).toBe(false);
  });
});
