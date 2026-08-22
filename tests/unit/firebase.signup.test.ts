/**
 * @jest-environment jsdom
 */

const mockCreateUserWithEmailAndPassword = jest.fn();
const mockUpdateProfile = jest.fn();
const mockSetDoc = jest.fn();
const mockDoc = jest.fn((_db: unknown, collection: string, uid: string) => `${collection}/${uid}`);

process.env.NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'test.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:test';

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
  EmailAuthProvider: jest.fn(),
  OAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  indexedDBLocalPersistence: {},
  initializeAuth: jest.fn(() => ({})),
  browserPopupRedirectResolver: {},
  browserSessionPersistence: {},
  signInWithCredential: jest.fn(),
  getRedirectResult: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  enableNetwork: jest.fn().mockResolvedValue(undefined),
  disableNetwork: jest.fn(),
  onSnapshot: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
  waitForPendingWrites: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('@/lib/localStorage', () => ({
  saveLocalAskHistory: jest.fn(),
  getLocalAskHistory: jest.fn(() => []),
  saveLocalNote: jest.fn(),
  getLocalNotes: jest.fn(() => []),
  updateLocalNote: jest.fn(),
  deleteLocalNote: jest.fn(),
  saveLocalUserProfile: jest.fn(),
  getLocalUserProfile: jest.fn(() => null),
}));

jest.mock('@/lib/astroDataService', () => ({
  clearAstroDataCache: jest.fn(),
}));

jest.mock('@/lib/referralUtils', () => ({
  generateReferralCode: jest.fn(() => 'REF123'),
  trackReferralSignup: jest.fn(),
}));

jest.mock('@/lib/oauthWebView', () => ({
  shouldPreferOAuthRedirect: jest.fn(() => false),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('signUpWithEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        providerData: [],
      },
    });
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);
  });

  it('omits undefined keys from Firestore payload (including subscriptionId)', async () => {
    const { signUpWithEmail } = await import('@/lib/firebase');

    await signUpWithEmail(
      'test@example.com',
      'secret123',
      'Test User',
      'IN',
      'power-user-trial',
      'none',
      false,
      undefined
    );

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const payload = mockSetDoc.mock.calls[0][1] as Record<string, unknown>;

    expect(payload).not.toHaveProperty('subscriptionId');
    expect(Object.values(payload).some((value) => value === undefined)).toBe(false);
  });
});

