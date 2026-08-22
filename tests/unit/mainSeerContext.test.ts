import { getDocument } from '@/lib/firebase-admin';
import { loadMainSeerContext } from '@/lib/mainSeerContext';
import type { UserProfile } from '@/lib/firebase';

jest.mock('@/lib/firebase-admin', () => ({
  getDocument: jest.fn(),
}));

const mockGetDocument = getDocument as jest.MockedFunction<typeof getDocument>;

describe('loadMainSeerContext hash freshness', () => {
  const profile = {
    uid: 'user-1',
    birthDate: '1992-06-20',
    profileDataHash: 'new-hash',
  } as UserProfile;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('omits stored reports stamped with a previous profile hash', async () => {
    mockGetDocument.mockImplementation(async (collection: string) => {
      if (collection === 'comprehensiveMysticalProfiles') {
        return {
          profileDataHash: 'new-hash',
          vedic: { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'new-hash' },
          tarot: { cards: [{ name: 'The Fool' }], generationIdempotencyKey: 'old-hash' },
        };
      }
      if (collection === 'seerMaster') {
        return { core_identity: ['stale synthesis'] };
      }
      return null;
    });

    const packed = await loadMainSeerContext({
      userId: 'user-1',
      question: 'What does my tarot say about love?',
      profile,
    });

    expect(packed.readySlugs).toContain('vedic');
    expect(packed.readySlugs).not.toContain('tarot');
    expect(packed.reportSlicesText).toContain('vedic');
    expect(packed.reportSlicesText).not.toContain('The Fool');
    expect(packed.seerMasterText).toContain('not generated yet');
  });
});
