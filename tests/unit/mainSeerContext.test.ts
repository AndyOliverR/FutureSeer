/**
 * @jest-environment node
 */

import { loadMainSeerContext } from '@/lib/mainSeerContext';
import { getDocument } from '@/lib/firebase-admin';

jest.mock('@/lib/firebase-admin', () => ({
  getDocument: jest.fn(),
}));

const mockGetDocument = getDocument as jest.MockedFunction<typeof getDocument>;

describe('loadMainSeerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('includes stored vedic, western, and numerology slices for a generic question', async () => {
    mockGetDocument.mockImplementation(async (collection: string) => {
      if (collection === 'comprehensiveMysticalProfiles') {
        return {
          vedic: { planets: [{ name: 'Sun', sign: 'Leo' }], placeholder: false },
          western: { planets: [{ name: 'Sun', sign: 'Virgo' }], placeholder: false },
          numerology: { lifePathNumber: 8, placeholder: false },
          tarot: { profile: { birthCard: { name: 'The Sun' } }, placeholder: false },
        };
      }
      if (collection === 'seerMaster') return {};
      return undefined;
    });

    const packed = await loadMainSeerContext({
      userId: 'user-1',
      question: 'What does my natal chart say about my career?',
      profile: {
        uid: 'user-1',
        fullName: 'Test User',
        birthDate: '1990-02-11',
        birthTime: '14:15',
        birthPlace: 'Mysore, Karnataka, India',
        gender: 'male',
        currentLocation: 'Bangalore, Karnataka, India',
      } as never,
    });

    expect(packed.reportSlicesText).not.toContain('No matching stored tool reports');
    expect(packed.reportSlicesText).toContain('### vedic');
    expect(packed.readySlugs).toEqual(expect.arrayContaining(['vedic', 'western', 'numerology']));
    expect(packed.identityText).toContain('Mysore');
  });
});
