/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const { ensureAdminInitialized } = require('./firebase-admin-env');

// Initialize Firebase Admin SDK
ensureAdminInitialized();

async function setupUserModes() {
  try {
    console.log('🚀 Setting up user modes...\n');

    // Get all users
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;

    console.log(`Found ${users.length} users in Firebase:\n`);

    // Display all users
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.uid})`);
      if (user.customClaims) {
        console.log(`   Claims: ${JSON.stringify(user.customClaims)}`);
      }
      console.log('');
    });

    // Ask for user input
    console.log('Please enter the email addresses for each mode:');
    console.log('1. God Mode (Superadmin) - Full access to everything');
    console.log('2. Mary Mode (Admin) - Limited admin access');
    console.log('3. Normal User - Regular user access\n');

    // Require env — never hardcode personal emails in the repo
    const userModes = {
      godMode: process.env.GOD_MODE_EMAIL || '',
      maryMode: process.env.MARY_MODE_EMAIL || '',
      normalUser: process.env.NORMAL_USER_EMAIL || '',
    };

    if (!userModes.godMode || !userModes.maryMode || !userModes.normalUser) {
      console.error('Set GOD_MODE_EMAIL, MARY_MODE_EMAIL, and NORMAL_USER_EMAIL in the environment.');
      process.exit(1);
    }

    console.log('Using these email addresses:');
    console.log(`God Mode: ${userModes.godMode}`);
    console.log(`Mary Mode: ${userModes.maryMode}`);
    console.log(`Normal User: ${userModes.normalUser}\n`);

    // Find users by email and set claims
    for (const [mode, email] of Object.entries(userModes)) {
      try {
        const user = await admin.auth().getUserByEmail(email);
        console.log(`✅ Found user: ${email} (${user.uid})`);

        let claims = {};
        
        switch (mode) {
          case 'godMode':
            claims = {
              superadmin: true,
              admin: true,
              support: true,
              userManagement: true,
              logs: true,
              codeEditor: true,
              billing: true,
              featureFlags: true,
              dataExport: true,
              impersonate: true,
              deleteUser: true,
              askSeerBeta: true
            };
            console.log('   Setting God Mode claims (full access)');
            break;

          case 'maryMode':
            claims = {
              admin: true,
              support: true,
              userManagement: false,
              logs: true,
              codeEditor: false,
              billing: false,
              featureFlags: false,
              dataExport: false,
              impersonate: false,
              deleteUser: false,
              askSeerBeta: true
            };
            console.log('   Setting Mary Mode claims (limited admin)');
            break;

          case 'normalUser':
            claims = {
              admin: false,
              support: false,
              userManagement: false,
              logs: false,
              codeEditor: false,
              billing: false,
              featureFlags: false,
              dataExport: false,
              impersonate: false,
              deleteUser: false,
              askSeerBeta: true
            };
            console.log('   Setting Normal User claims (no admin access)');
            break;
        }

        await admin.auth().setCustomUserClaims(user.uid, claims);
        console.log(`   ✅ Successfully set claims for ${email}\n`);

      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log(`❌ User not found: ${email}`);
          console.log('   Please create this user account first or update the email address\n');
        } else {
          console.log(`❌ Error setting claims for ${email}: ${error.message}\n`);
        }
      }
    }

    console.log('🎉 User mode setup complete!');
    console.log('\nTo use different email addresses, set these environment variables:');
    console.log('GOD_MODE_EMAIL=your-god-email@example.com');
    console.log('MARY_MODE_EMAIL=your-mary-email@example.com');
    console.log('NORMAL_USER_EMAIL=your-normal-email@example.com\n');
    console.log('Then run this script again to update the claims.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

setupUserModes(); 