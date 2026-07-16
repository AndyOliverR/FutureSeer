/** @jest-environment node */

import type { UserProfile } from '@/lib/firebase';
import { runProfileGenerationToolSlugs } from '@/lib/profileGenerationOrchestrator';

describe('profile generation without photos', () => {
  it('returns displayable next-step reports with actionable upload instructions', async () => {
    const profile = {
      uid: 'no-photo-user',
      birthDate: '1990-01-15',
      birthTime: '10:30:00',
      birthPlace: 'New York, NY',
      displayName: 'Test User',
    } as UserProfile;

    const result = await runProfileGenerationToolSlugs(
      profile.uid,
      profile,
      ['faceReading', 'palmistry'],
    );

    expect(result.toolReports.faceReading).toMatchObject({
      status: 'success',
      data: {
        baselineReady: true,
        requiresNextStep: true,
        reason: 'Upload a face photo to generate a face reading.',
      },
    });
    expect(result.toolReports.palmistry).toMatchObject({
      status: 'success',
      data: {
        baselineReady: true,
        requiresNextStep: true,
        reason: 'Upload hand images to generate a palmistry reading.',
      },
    });
    expect(result.failedTools).toEqual([]);
  });
});
