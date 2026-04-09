/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function buildServiceAccountFromEnv() {
  const projectId = required('FIREBASE_ADMIN_PROJECT_ID');
  const clientEmail = required('FIREBASE_ADMIN_CLIENT_EMAIL');
  const privateKeyRaw = required('FIREBASE_ADMIN_PRIVATE_KEY');
  const privateKey = privateKeyRaw.includes('\\n')
    ? privateKeyRaw.replace(/\\n/g, '\n')
    : privateKeyRaw;
  return { projectId, clientEmail, privateKey };
}

function ensureAdminInitialized() {
  if (admin.apps.length) return admin;
  admin.initializeApp({
    credential: admin.credential.cert(buildServiceAccountFromEnv()),
  });
  return admin;
}

module.exports = {
  ensureAdminInitialized,
};

