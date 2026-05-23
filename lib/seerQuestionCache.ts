/**
 * Server-side similar-question cache for tool Seer chats (Admin Firestore).
 * Legacy layout: `{collectionName}/{userId}/questions/{entryId}`.
 */

import 'server-only';

import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';
import { scoreKeywordSimilarity } from '@/lib/seerQuestionSimilarity';
import type {
  SeerQuestionCacheConfig,
  SeerQuestionCacheOptions,
} from '@/lib/seerQuestionCacheTypes';

export type { SeerQuestionCacheConfig, SeerQuestionCacheOptions } from '@/lib/seerQuestionCacheTypes';

const DEFAULT_LIMIT = 20;
const SIMILARITY_THRESHOLD = 5;
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function findCachedSeerAnswer(
  options: SeerQuestionCacheOptions,
): Promise<{ answer: string; question?: string } | null> {
  if (!adminDb) return null;

  const {
    userId,
    collectionName,
    question,
    keywords,
    similarityThreshold = SIMILARITY_THRESHOLD,
  } = options;

  try {
    const snap = await adminDb
      .collection(collectionName)
      .doc(userId)
      .collection('questions')
      .orderBy('timestamp', 'desc')
      .limit(DEFAULT_LIMIT)
      .get();

    for (const doc of snap.docs) {
      const data = doc.data();
      const cachedQ = typeof data.question === 'string' ? data.question : '';
      const cachedA = typeof data.answer === 'string' ? data.answer : '';
      if (!cachedQ || !cachedA) continue;

      const score = scoreKeywordSimilarity(question, cachedQ, keywords);
      if (score >= similarityThreshold) {
        return { answer: cachedA, question: cachedQ };
      }
    }
    return null;
  } catch (e) {
    devLog.warn('[seerQuestionCache] find failed', e, 'seerQuestionCache');
    return null;
  }
}

export async function cacheSeerQuestionAnswer(options: {
  userId: string;
  collectionName: string;
  question: string;
  answer: string;
}): Promise<void> {
  if (!adminDb) return;

  const { userId, collectionName, question, answer } = options;
  const now = Date.now();

  try {
    await adminDb
      .collection(collectionName)
      .doc(userId)
      .collection('questions')
      .doc(`qa_${now}`)
      .set({
        question,
        answer,
        timestamp: now,
        ttl: now + TTL_MS,
      });
  } catch (e) {
    devLog.warn('[seerQuestionCache] write failed', e, 'seerQuestionCache');
  }
}
