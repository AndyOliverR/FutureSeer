/**
 * @jest-environment node
 */

import {
  isFirebaseAuthInternalAssertionError,
  isUserDismissedAuthError,
} from '@/lib/firebase';

describe('OAuth stability helpers', () => {
  it('detects Firebase internal assertion messages', () => {
    const err = new Error(
      'INTERNAL ASSERTION FAILED: Pending promise was never set'
    );
    expect(isFirebaseAuthInternalAssertionError(err)).toBe(true);
    expect(
      isFirebaseAuthInternalAssertionError(
        'INTERNAL ASSERTION FAILED: Pending promise was never set'
      )
    ).toBe(true);
    expect(isFirebaseAuthInternalAssertionError(new Error('other'))).toBe(false);
  });

  it('does not treat dismiss as internal assertion', () => {
    expect(
      isFirebaseAuthInternalAssertionError({ code: 'auth/popup-closed-by-user' })
    ).toBe(false);
    expect(isUserDismissedAuthError({ code: 'auth/popup-closed-by-user' })).toBe(true);
  });
});
