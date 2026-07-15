/**
 * Shared first-generation timing copy for Profile + Occult tools surfaces.
 * Flow: Profile Generate → /tools (Occult / Divination tools) as reports unlock.
 *
 * One Generate enqueues the full catalog; workers finish tools over time (serverless
 * limits). Never claim a fixed short finish time for every tool.
 */

export const GENERATION_ETA_PRE_GENERATE =
  "Core charts usually unlock within a few minutes. The full catalog fills in the background — open Occult / Divination tools and check tool cards as they unlock.";

/** Shown under the Generate button from click until redirect to /tools. */
export const GENERATION_ETA_PREPARING =
  "Starting report generation… Tools unlock as each reading finishes. You'll open Occult / Divination tools next — leave the page open or check back as more cards unlock.";

export const GENERATION_ETA_IN_PROGRESS =
  "Generating readings across divination systems… Tools unlock as each reading finishes. Open Occult / Divination tools to use unlocked reports while others keep filling.";

export const GENERATION_ETA_TOOLS_BANNER =
  "Reports unlock over time — open a tool when its card is ready. Leave this page open or return later; generation keeps filling the rest.";

export const GENERATION_SUCCESS_ALERT =
  "Generation is running—open Occult / Divination tools to use unlocked reports while others keep filling. Then Ask the Seer for the cross-tool read.";
