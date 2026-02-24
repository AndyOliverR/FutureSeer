import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import { devLog } from './devLogger';

export const signInWithGoogleNative = async () => {
  devLog.debug('🔄 Attempting Native Google sign-in...');
  const result = await FirebaseAuthentication.signInWithGoogle();

  if (!result.credential) {
    throw new Error('Native sign-in failed - no credentials returned');
  }

  const credential = GoogleAuthProvider.credential(result.credential.idToken);
  const auth = getFirebaseAuth();
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
};

export const signOutNative = async () => {
  await FirebaseAuthentication.signOut();
};
