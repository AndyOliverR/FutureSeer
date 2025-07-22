// 1. Import and initialize Firebase Admin SDK
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')) // Make sure the path is correct
});

// 2. Replace with your actual UID
const uid = '5bkccyY14NSU4ykMwOV3xcAcN5t1'; // <-- paste your full UID here

// 3. Set the custom claim
admin.auth().setCustomUserClaims(uid, { role: 'admin' })
  .then(() => {
    console.log('Custom claim set for admin!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });