/** @jest-environment node */

import type { UserProfile } from '@/lib/firebase';
import {
  ALL_TOOL_SLUGS,
  type ToolReports,
} from '@/lib/profileGenerationOrchestrator';

const mockDocs = new Map<string, Record<string, unknown>>();
const mockRunProfileGenerationToolSlugs = jest.fn();

jest.mock('server-only', () => ({}));

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: null,
  getDocument: async (collection: string, docId: string) =>
    mockDocs.get(`${collection}/${docId}`) ?? null,
  setDocument: async (
    collection: string,
    docId: string,
    data: Record<string, unknown>,
  ) => {
    const key = `${collection}/${docId}`;
    mockDocs.set(key, { ...(mockDocs.get(key) ?? {}), ...data });
    return true;
  },
  batchSetDocuments: async (
    writes: Array<{ collection: string; docId: string; data: Record<string, unknown> }>,
  ) => {
    for (const write of writes) {
      const key = `${write.collection}/${write.docId}`;
      mockDocs.set(key, { ...(mockDocs.get(key) ?? {}), ...write.data });
    }
    return true;
  },
}));

jest.mock('@/lib/userSubcollectionFirestore', () => ({
  userRootDocSet: async (
    uid: string,
    data: Record<string, unknown>,
  ) => {
    const key = `users/${uid}`;
    mockDocs.set(key, { ...(mockDocs.get(key) ?? {}), ...data });
  },
}));

jest.mock('@/lib/universalDataAggregator', () => ({
  clearCachedDivinationData: jest.fn(),
}));

jest.mock('@/lib/profileGenerationOrchestrator', () => {
  const actual = jest.requireActual('@/lib/profileGenerationOrchestrator');
  return {
    ...actual,
    runProfileGenerationToolSlugs: (...args: unknown[]) =>
      mockRunProfileGenerationToolSlugs(...args),
    finalizeProfileGenerationFromToolReports: async (
      _uid: string,
      _profile: UserProfile,
      toolReports: ToolReports,
      existingProfile: Record<string, unknown>,
    ) => ({
      success: true,
      toolReports,
      seerMaster: {
        core_identity: [],
        life_purpose: [],
        career_themes: [],
        relationship_patterns: [],
        health_tendencies: [],
        timing_windows: [],
        remedies: { gemstones: [], mudras: [], colors: [], mantras: [], behaviors: [] },
      },
      comprehensiveProfile: { ...existingProfile, toolReports },
      failedTools: [],
      systemsUsed: Object.keys(toolReports),
      phase: 'final',
    }),
  };
});

import { processMysticalStageBQueue } from '@/lib/mysticalStageBQueue';

function displayableReportForSlug(slug: string, profileHash: string): Record<string, unknown> {
  const key = { generationIdempotencyKey: profileHash };
  switch (slug) {
    case 'vedic':
    case 'western':
    case 'hellenistic':
    case 'kp':
      return { ...key, planets: [{ name: 'Sun' }] };
    case 'tarot':
      return { ...key, profile: { birthCard: { name: 'The Fool' } } };
    case 'numerology':
      return { ...key, lifePathNumber: 7 };
    case 'iching':
      return { ...key, hexagram: 1 };
    case 'runes':
      return { ...key, runes: [{ name: 'Fehu' }] };
    case 'bazi':
      return { ...key, pillars: { year: 'Jia Zi' } };
    case 'humanDesign':
      return { ...key, type: 'Generator' };
    default:
      return { ...key, reading: 'ready' };
  }
}

describe('Stage B generation without photos', () => {
  it('persists next-step reports and completes the queue as ready', async () => {
    const uid = 'no-photo-user';
    const profileHash = 'no-photo-hash';
    const profileWithUid = {
      uid,
      birthDate: '1990-01-15',
      birthTime: '10:30:00',
      birthPlace: 'New York, NY',
      displayName: 'Test User',
    } as UserProfile;
    const storedProfile = Object.fromEntries(
      ALL_TOOL_SLUGS
        .filter((slug) => slug !== 'faceReading' && slug !== 'palmistry')
        .map((slug) => [slug, displayableReportForSlug(slug, profileHash)]),
    );
    mockDocs.set(`comprehensiveMysticalProfiles/${uid}`, storedProfile);
    mockDocs.set(`generationJobs/${uid}`, {
      status: 'running',
      profileHash,
      profileSnapshot: profileWithUid,
    });
    mockDocs.set(`users/${uid}`, {
      mysticalProfileGenerated: true,
      allReportsReady: false,
    });
    mockRunProfileGenerationToolSlugs.mockImplementation(
      async (_uid: string, _profile: UserProfile, slugs: string[]) => ({
        toolReports: Object.fromEntries(
          slugs.map((slug) => [
            slug,
            {
              status: 'success',
              data: {
                baselineReady: true,
                requiresNextStep: true,
                nextStepLabel: 'Complete Next Step',
                reason:
                  slug === 'faceReading'
                    ? 'Upload a face photo to generate a face reading.'
                    : 'Upload hand images to generate a palmistry reading.',
              },
              generatedAt: '2026-07-16T00:00:00.000Z',
            },
          ]),
        ),
        failedTools: [],
        aggregateUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      }),
    );

    const outcome = await processMysticalStageBQueue({
      uid,
      profileWithUid,
      profileHash,
      claimId: 'claim-1',
      attempt: 1,
    });

    const finalProfile = mockDocs.get(`comprehensiveMysticalProfiles/${uid}`) ?? {};
    const finalJob = mockDocs.get(`generationJobs/${uid}`) ?? {};
    const finalUser = mockDocs.get(`users/${uid}`) ?? {};
    const tasks = finalJob.toolTasks as Record<string, { attempts: number; status: string }>;

    expect(outcome).toEqual({
      done: true,
      processedTools: 2,
      remainingTools: 0,
      finalized: true,
    });
    expect(tasks.faceReading).toMatchObject({ attempts: 1, status: 'ready' });
    expect(tasks.palmistry).toMatchObject({ attempts: 1, status: 'ready' });
    expect(finalProfile.faceReading).toMatchObject({
      baselineReady: true,
      requiresNextStep: true,
      reason: 'Upload a face photo to generate a face reading.',
    });
    expect(finalProfile.palmistry).toMatchObject({
      baselineReady: true,
      requiresNextStep: true,
      reason: 'Upload hand images to generate a palmistry reading.',
    });
    expect(finalJob).toMatchObject({
      status: 'completed',
      queueDrained: true,
      allReportsReady: true,
    });
    expect(finalJob.pendingToolSlugs).toEqual([]);
    expect(finalUser).toMatchObject({
      profileStatus: 'completed',
      allReportsReady: true,
    });
  });
});
