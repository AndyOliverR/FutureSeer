/**
 * SessionStorage keys for lightweight metrics prompts (e.g. SEQ after profile generation).
 * Cleared after the prompt is shown or dismissed so we do not nag on every visit.
 */
export const SEQ_PROMPT_AFTER_PROFILE_GEN = 'futureSeer:seqAfterProfileGen' as const;
