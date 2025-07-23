// Test Firebase Connection
// Run this in the browser console to verify Firebase is working

console.log('🧪 Testing Firebase Connection...');

// Test Firebase initialization
try {
  // Check if Firebase is available
  if (typeof window !== 'undefined' && window.firebase) {
    console.log('✅ Firebase SDK loaded');
  } else {
    console.log('❌ Firebase SDK not loaded');
  }

  // Test environment variables
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  console.log('🔧 Environment Variables Check:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`  ${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
  });

  // Test database connection
  console.log('🗄️ Testing Firestore Connection...');
  
  // This will be tested when the app loads
  console.log('📝 Check browser console for:');
  console.log('  - "Connected to Firestore database: default"');
  console.log('  - "Firebase initialized successfully"');
  console.log('  - No "WebChannelConnection RPC" errors');

} catch (error) {
  console.error('❌ Firebase test failed:', error);
}

console.log('🎯 Next Steps:');
console.log('1. Start the app: pnpm dev');
console.log('2. Open browser console');
console.log('3. Look for successful connection messages');
console.log('4. Test creating a user account or note');
console.log('5. Check if data persists in Firebase Console'); 