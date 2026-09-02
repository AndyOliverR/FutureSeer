/**
 * Shared first-generation timing copy for Profile + Occult tools surfaces.
 * Flow: Generate stays on Profile until all catalog reports are saved, then /tools.
 * Reports do not regenerate until the user edits profile data and clicks Generate again.
 */

export const GENERATION_ETA_PRE_GENERATE =
  "One click generates every tool report. Stay on this page until all readings are saved — usually a few minutes.";

/** Shown under the Generate button from click until natal charts finish. */
export const GENERATION_ETA_PREPARING =
  "Saving your profile and natal charts… Remaining reports generate next. Stay on this page.";

export const GENERATION_ETA_IN_PROGRESS =
  "Natal charts are ready. Generating the rest of your reports — stay on this page.";

export const GENERATION_ETA_TOOLS_BANNER =
  "Your reports are saved from Generate. Open a tool to read it — nothing regenerates until you edit your profile and generate again.";

export const GENERATION_SUCCESS_ALERT =
  "All tool reports are saved. Open Occult / Divination tools to read them. Then Ask the Seer for the cross-tool read.";

export function generationCatalogProgress(ready: number, total: number): string {
  return `Generating reports… ${ready} of ${total}. Stay on this page until every reading is saved.`;
}
