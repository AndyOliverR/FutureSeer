/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Grant askSeerBeta custom claim to users for 72-hour internal rollout.
 * Merges with existing claims (setCustomUserClaims replaces all claims).
 *
 * Usage:
 *   ASKS_BETA_UIDS=uid1,uid2,uid3 node scripts/set-ask-seer-beta.js
 *   node scripts/set-ask-seer-beta.js uid1 uid2 uid3
 */
const admin = require('firebase-admin');
const { ensureAdminInitialized } = require('./firebase-admin-env');
ensureAdminInitialized();

async function setAskSeerBeta() {
  const uids = process.env.ASKS_BETA_UIDS?.split(',').map((s) => s.trim()).filter(Boolean)
    || process.argv.slice(2).filter(Boolean);

  if (uids.length === 0) {
    console.log('Usage: ASKS_BETA_UIDS=uid1,uid2,uid3 node scripts/set-ask-seer-beta.js');
    console.log('   or: node scripts/set-ask-seer-beta.js uid1 uid2 uid3');
    process.exit(1);
  }

  console.log('🔮 Granting askSeerBeta to', uids.length, 'user(s)\n');

  for (const uid of uids) {
    try {
      const user = await admin.auth().getUser(uid);
      const existing = user.customClaims || {};
      const merged = { ...existing, askSeerBeta: true };
      await admin.auth().setCustomUserClaims(uid, merged);
      console.log('✅', user.email || uid, '(', uid, ')');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log('❌ User not found:', uid);
      } else {
        console.log('❌', uid, err.message);
      }
    }
  }

  console.log('\nDone. Users must sign out and back in for claims to take effect.');
  process.exit(0);
}

setAskSeerBeta().catch((err) => {
  console.error(err);
  process.exit(1);
});
