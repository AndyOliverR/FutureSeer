/**
 * Referral System Utilities
 * Handles referral code generation, validation, and tracking
 */

import { getFirebaseDB } from './firebase';
import { devLog } from '@/lib/devLogger';

/**
 * Generate a unique referral code for a user
 * Format: FUTURE_XXXXX (5 random alphanumeric characters)
 */
export function generateReferralCode(userId: string): string {
  // Use part of userId + random string for uniqueness
  const userPart = userId.substring(0, 3).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `FUTURE_${userPart}${randomPart}`;
}

/**
 * Validate if a referral code exists in the database
 */
export async function validateReferralCode(code: string, db: any): Promise<{ valid: boolean; userId?: string }> {
  try {
    if (!code || !code.startsWith('FUTURE_')) {
      return { valid: false };
    }

    // Query users collection for matching referral code
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const snapshot = await db.collection('users')
        .where('referralCode', '==', code)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return { valid: false };
      }

      const userDoc = snapshot.docs[0];
      return { valid: true, userId: userDoc.id };
    } else {
      // Client-side: Use Firestore SDK
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', code), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { valid: false };
      }

      const userDoc = snapshot.docs[0];
      return { valid: true, userId: userDoc.id };
    }
  } catch (error) {
    devLog.error('Error validating referral code:', error, 'referralUtils');
    return { valid: false };
  }
}

/**
 * Apply referral credit to the referrer
 * Awards 1 free month (₹99 credit) to the user who referred someone
 */
export async function applyReferralCredit(referrerId: string, db: any): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const userRef = db.collection('users').doc(referrerId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        devLog.error('Referrer user not found:', referrerId, 'referralUtils');
        return;
      }

      const userData = userDoc.data();
      const currentFreeMonths = userData?.freeMonthsRemaining || 0;
      const referralCount = userData?.referralCount || 0;

      await userRef.update({
        freeMonthsRemaining: currentFreeMonths + 1,
        referralCount: referralCount + 1,
        updatedAt: Date.now()
      });

      devLog.debug(`✅ Applied referral credit to user ${referrerId}: +1 free month`);
    } else {
      // Client-side: Use Firestore SDK
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      
      const userRef = doc(db, 'users', referrerId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        devLog.error('Referrer user not found:', referrerId, 'referralUtils');
        return;
      }

      const userData = userDoc.data();
      const currentFreeMonths = userData?.freeMonthsRemaining || 0;
      const referralCount = userData?.referralCount || 0;

      await updateDoc(userRef, {
        freeMonthsRemaining: currentFreeMonths + 1,
        referralCount: referralCount + 1,
        updatedAt: Date.now()
      });

      devLog.debug(`✅ Applied referral credit to user ${referrerId}: +1 free month`);
    }
  } catch (error) {
    devLog.error('Error applying referral credit:', error, 'referralUtils');
    throw error;
  }
}

/**
 * Track a referral signup
 * Links the new user to their referrer and awards the referrer credit
 */
export async function trackReferralSignup(
  newUserId: string,
  referralCode: string,
  db: any
): Promise<void> {
  try {
    // Validate the referral code
    const validation = await validateReferralCode(referralCode, db);
    
    if (!validation.valid || !validation.userId) {
      devLog.error('Invalid referral code:', referralCode, 'referralUtils');
      return;
    }

    const referrerId = validation.userId;

    // Don't allow self-referrals
    if (referrerId === newUserId) {
      devLog.error('Cannot refer yourself', undefined, 'referralUtils');
      return;
    }

    // Update new user's profile with referredBy
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const newUserRef = db.collection('users').doc(newUserId);
      await newUserRef.update({
        referredBy: referrerId,
        referredByRewardClaimed: false,
        updatedAt: Date.now()
      });
    } else {
      // Client-side: Use Firestore SDK
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const newUserRef = doc(db, 'users', newUserId);
      await updateDoc(newUserRef, {
        referredBy: referrerId,
        referredByRewardClaimed: false,
        updatedAt: Date.now()
      });
    }

    // Award credit to referrer
    await applyReferralCredit(referrerId, db);

    // Mark reward as claimed
    if (typeof window === 'undefined') {
      const newUserRef = db.collection('users').doc(newUserId);
      await newUserRef.update({
        referredByRewardClaimed: true,
        updatedAt: Date.now()
      });
    } else {
      const { doc, updateDoc } = await import('firebase/firestore');
      const newUserRef = doc(db, 'users', newUserId);
      await updateDoc(newUserRef, {
        referredByRewardClaimed: true,
        updatedAt: Date.now()
      });
    }

    devLog.debug(`✅ Referral tracked: ${newUserId} referred by ${referrerId}`);
  } catch (error) {
    devLog.error('Error tracking referral signup:', error, 'referralUtils');
    throw error;
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string, db: any): Promise<{
  referralCode: string;
  referralCount: number;
  freeMonthsRemaining: number;
}> {
  try {
    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return {
          referralCode: '',
          referralCount: 0,
          freeMonthsRemaining: 0
        };
      }

      const userData = userDoc.data();
      return {
        referralCode: userData?.referralCode || '',
        referralCount: userData?.referralCount || 0,
        freeMonthsRemaining: userData?.freeMonthsRemaining || 0
      };
    } else {
      // Client-side: Use Firestore SDK
      const { doc, getDoc } = await import('firebase/firestore');
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return {
          referralCode: '',
          referralCount: 0,
          freeMonthsRemaining: 0
        };
      }

      const userData = userDoc.data();
      return {
        referralCode: userData?.referralCode || '',
        referralCount: userData?.referralCount || 0,
        freeMonthsRemaining: userData?.freeMonthsRemaining || 0
      };
    }
  } catch (error) {
    devLog.error('Error getting referral stats:', error, 'referralUtils');
    return {
      referralCode: '',
      referralCount: 0,
      freeMonthsRemaining: 0
    };
  }
}
