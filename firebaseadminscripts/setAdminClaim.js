/* eslint-disable @typescript-eslint/no-require-imports */
// 1. Import and initialize Firebase Admin SDK
const { ensureAdminInitialized } = require('../scripts/firebase-admin-env');
const admin = ensureAdminInitialized();

// 2. UID from env (FOUNDER_UID) — never hardcode personal UIDs in the repo
const uid = process.env.FOUNDER_UID || process.env.ADMIN_UID;
if (!uid) {
  console.error('Set FOUNDER_UID (or ADMIN_UID) in the environment before running.');
  process.exit(1);
}

// 3. Set the custom claim
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Custom claim set for admin!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });