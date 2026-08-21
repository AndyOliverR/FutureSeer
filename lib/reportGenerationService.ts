/**
 * Central report generation service.
 * Natal/on-demand generation goes through lib/onDemandToolReports.ts.
 * generateAllReports remains for admin/legacy full-catalog runs only.
 */

import type { UserProfile } from './firebase';
import {
  getCoreToolSlugsCore10,
  type GenerationProgressUpdate,
  type ToolHeartbeatUpdate,
  type ToolRunUpdate,
  runProfileGeneration,
  runProfileGenerationStageA,
  type GenerationResult,
} from './profileGenerationOrchestrator';

/**
 * Run the full report pipeline for a user. All tools run; output is merged
 * into a single comprehensive profile. Call this only from the generate-mystical API.
 */
export async function generateAllReports(
  userId: string,
  userProfile: UserProfile,
  options?: {
    onProgress?: (update: GenerationProgressUpdate) => void | Promise<void>;
    onToolRun?: (update: ToolRunUpdate) => void | Promise<void>;
    onToolHeartbeat?: (update: ToolHeartbeatUpdate) => void | Promise<void>;
  },
): Promise<GenerationResult> {
  return runProfileGeneration(userId, userProfile, options);
}

export async function generateCoreReportsStageA(
  userId: string,
  userProfile: UserProfile,
): Promise<GenerationResult> {
  return runProfileGenerationStageA(userId, userProfile);
}

export function getCoreStageToolCount(): number {
  return getCoreToolSlugsCore10().length;
}
