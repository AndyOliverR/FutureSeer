/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * One-time script: Cancel Razorpay subscriptions for no-charge accounts
 * (god mode, mary mode, special test admin) and set their Firestore status to active
 * so they keep app access without being charged.
 *
 * Run from project root with:
 *   node -r dotenv/config scripts/cancel-no-charge-subscriptions.js
 *   (ensure .env.local is loaded: dotenv/config uses .env by default; for .env.local use:
 *    node -r dotenv/config scripts/cancel-no-charge-subscriptions.js
 *    with DOTENV_CONFIG_PATH=.env.local, or copy RAZORPAY_* into .env)
 *
 * Or: DOTENV_CONFIG_PATH=.env.local node -r dotenv/config scripts/cancel-no-charge-subscriptions.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const Razorpay = require('razorpay');
const { ensureAdminInitialized } = require('./firebase-admin-env');

const NO_CHARGE_EMAILS = (process.env.NO_CHARGE_SUBSCRIPTION_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

if (NO_CHARGE_EMAILS.length === 0) {
  console.error('Set NO_CHARGE_SUBSCRIPTION_EMAILS in .env.local (comma-separated).');
  process.exit(1);
}

async function main() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET. Set in .env.local and run again.');
    process.exit(1);
  }

  ensureAdminInitialized();
  const db = admin.firestore();
  const auth = admin.auth();

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  for (const email of NO_CHARGE_EMAILS) {
    try {
      const user = await auth.getUserByEmail(email);
      const uid = user.uid;
      const userRef = db.collection('users').doc(uid);
      const snap = await userRef.get();
      const data = snap.exists ? snap.data() : {};
      const subscriptionId = data.subscriptionId || data.subscription_id;
      if (!subscriptionId) {
        console.log(`[${email}] No subscriptionId in Firestore, setting status to active only.`);
        await userRef.update({
          subscriptionStatus: 'active',
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`[${email}] Firestore set to subscriptionStatus: active.`);
        continue;
      }
      try {
        await razorpay.subscriptions.cancel(subscriptionId, 0);
        console.log(`[${email}] Razorpay subscription ${subscriptionId} cancelled.`);
      } catch (err) {
        if (err.statusCode === 400 && err.error?.description?.includes('already')) {
          console.log(`[${email}] Razorpay subscription already cancelled.`);
        } else {
          console.error(`[${email}] Razorpay cancel failed:`, err.message || err);
          continue;
        }
      }
      await userRef.update({
        subscriptionStatus: 'active',
        subscriptionId: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`[${email}] Firestore set to subscriptionStatus: active (subscriptionId removed).`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log(`[${email}] User not found in Firebase Auth, skipping.`);
      } else {
        console.error(`[${email}] Error:`, err.message || err);
      }
    }
  }
  console.log('Done.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
