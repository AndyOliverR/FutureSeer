/**
 * Referral System Utilities
 * Handles referral code generation, validation, and tracking
 */

import { devLog } from '@/lib/devLogger';
import {
  rootCollectionQueryWhere,
  userRootDocGet,
  userRootDocUpdate,
} from '@/lib/userSubcollectionFirestore';

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
export async function validateReferralCode(code: string): Promise<{ valid: boolean; userId?: string }> {
  try {
    if (!code || !code.startsWith('FUTURE_')) {
      return { valid: false };
    }

    const rows = await rootCollectionQueryWhere(
      'users',
      [{ field: 'referralCode', op: '==', value: code }],
      { limitCount: 1 }
    );

    if (rows.length === 0) {
      return { valid: false };
    }

    return { valid: true, userId: rows[0].id };
  } catch (error) {
    devLog.error('Error validating referral code:', error, 'referralUtils');
    return { valid: false };
  }
}

/**
 * Apply referral credit to the referrer
 * Awards 1 free month (₹99 credit) to the user who referred someone
 */
export async function applyReferralCredit(referrerId: string): Promise<void> {
  try {
    const userData = await userRootDocGet(referrerId);

    if (!userData) {
      devLog.error('Referrer user not found:', referrerId, 'referralUtils');
      return;
    }

    const currentFreeMonths = (userData.freeMonthsRemaining as number | undefined) || 0;
    const referralCount = (userData.referralCount as number | undefined) || 0;

    await userRootDocUpdate(referrerId, {
      freeMonthsRemaining: currentFreeMonths + 1,
      referralCount: referralCount + 1,
      updatedAt: Date.now(),
    });

    devLog.debug(`✅ Applied referral credit to user ${referrerId}: +1 free month`);
  } catch (error) {
    devLog.error('Error applying referral credit:', error, 'referralUtils');
    throw error;
  }
}

/**
 * Track a referral signup
 * Links the new user to their referrer and awards the referrer credit
 */
export async function trackReferralSignup(newUserId: string, referralCode: string): Promise<void> {
  try {
    const validation = await validateReferralCode(referralCode);

    if (!validation.valid || !validation.userId) {
      devLog.error('Invalid referral code:', referralCode, 'referralUtils');
      return;
    }

    const referrerId = validation.userId;

    if (referrerId === newUserId) {
      devLog.error('Cannot refer yourself', undefined, 'referralUtils');
      return;
    }

    await userRootDocUpdate(newUserId, {
      referredBy: referrerId,
      referredByRewardClaimed: false,
      updatedAt: Date.now(),
    });

    await applyReferralCredit(referrerId);

    await userRootDocUpdate(newUserId, {
      referredByRewardClaimed: true,
      updatedAt: Date.now(),
    });

    devLog.debug(`✅ Referral tracked: ${newUserId} referred by ${referrerId}`);
  } catch (error) {
    devLog.error('Error tracking referral signup:', error, 'referralUtils');
    throw error;
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<{
  referralCode: string;
  referralCount: number;
  freeMonthsRemaining: number;
}> {
  try {
    const userData = await userRootDocGet(userId);

    if (!userData) {
      return {
        referralCode: '',
        referralCount: 0,
        freeMonthsRemaining: 0,
      };
    }

    return {
      referralCode: (userData.referralCode as string) || '',
      referralCount: (userData.referralCount as number) || 0,
      freeMonthsRemaining: (userData.freeMonthsRemaining as number) || 0,
    };
  } catch (error) {
    devLog.error('Error getting referral stats:', error, 'referralUtils');
    return {
      referralCode: '',
      referralCount: 0,
      freeMonthsRemaining: 0,
    };
  }
}
