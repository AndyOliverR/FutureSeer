/**
 * Central report generation service.
 * This is the only public entry point for running the full report pipeline.
 * No tool or other module should call the orchestrator or tool APIs directly for generation.
 */

import type { UserProfile } from './firebase';
import {
  runProfileGeneration,
  type GenerationResult,
} from './profileGenerationOrchestrator';

/**
 * Run the full report pipeline for a user. All tools run; output is merged
 * into a single comprehensive profile. Call this only from the generate-mystical API.
 */
export async function generateAllReports(
  userId: string,
  userProfile: UserProfile
): Promise<GenerationResult> {
  return runProfileGeneration(userId, userProfile);
}
