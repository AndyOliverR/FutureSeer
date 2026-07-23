/* eslint-disable @typescript-eslint/no-require-imports */
// Firebase Admin Script to Fix Birth Time Data
// Updates incorrect timestamp to correct HH:MM format

const admin = require('firebase-admin');
const { ensureAdminInitialized } = require('./firebase-admin-env');

// Initialize Firebase Admin
ensureAdminInitialized();

const db = admin.firestore();

async function fixBirthTime() {
  try {
    console.log('🔧 Starting birth time fix...');
    
    // User ID from env — never hardcode personal UIDs in the repo
    const userId = process.env.FOUNDER_UID || process.env.FIX_BIRTH_TIME_UID;
    if (!userId) {
      console.error('Set FOUNDER_UID or FIX_BIRTH_TIME_UID in the environment.');
      process.exit(1);
    }
    
    // Get current user document
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error('❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    console.log('📊 Current birthTime:', userData.birthTime);
    console.log('📊 Current birthDate:', userData.birthDate);
    
    // Update birthTime to correct format
    await userRef.update({
      birthTime: '14:15',
      birthTimeKnown: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Birth time updated successfully!');
    console.log('🔄 New birthTime: 14:15 (2:15 PM)');
    console.log('📅 Birth date: 1983-02-24');
    
    // Verify the update
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    console.log('🔍 Verification - Updated birthTime:', updatedData.birthTime);
    
  } catch (error) {
    console.error('❌ Error fixing birth time:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixBirthTime();
