/**
 * Shared types for Seer question cache (no server-only — safe for client/type-only imports).
 */

export interface SeerQuestionCacheConfig {
  collectionName: string;
  question: string;
  keywords: string[];
  similarityThreshold?: number;
}

export interface SeerQuestionCacheOptions extends SeerQuestionCacheConfig {
  userId: string;
}
