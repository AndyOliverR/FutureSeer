# Authentication Fix Guide

## Issues Identified

1. **Blank Pop-up Issue**: The app was manually creating pop-up windows, which conflicts with Firebase's built-in pop-up handling
2. **Cross-Origin Policy**: Complex error suppression was masking the real authentication flow issues
3. **Redirect URI Configuration**: Firebase project may not have localhost:3000 in authorized domains

## Changes Made

### 1. Simplified Google Authentication Flow (`lib/firebase.ts`)

**Before:**
```javascript
// Configure popup to handle cross-origin issues
const popupWindow = window.open('', 'google-signin', 'width=500,height=600,scrollbars=yes,resizable=yes');
if (!popupWindow) {
  throw new Error('Popup blocked');
}
result = await signInWithPopup(auth, googleProvider);
```

**After:**
```javascript
// Simplified popup approach - let Firebase handle the popup creation
result = await signInWithPopup(auth, googleProvider);
```

### 2. Simplified Google Provider Configuration

**Before:**
```javascript
googleProvider.setCustomParameters({
  prompt: 'select_account',
  auth_type: 'reauthenticate',
  'cross-origin-opener-policy': 'same-origin-allow-popups',
  'popup-redirect': 'true',
  'popup-blocked-fallback': 'redirect'
});
```

**After:**
```javascript
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
```

## Required Firebase Console Configuration

### Step 1: Enable Google Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication > Sign-in method
4. Enable Google provider
5. Add your project's OAuth consent screen information

### Step 2: Add Authorized Domains
1. In Firebase Console > Authentication > Settings
2. Add these domains to "Authorized domains":
   - `localhost` (for development)
   - `your-domain.com` (for production)
   - `127.0.0.1` (alternative localhost)

### Step 3: Configure OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to APIs & Services > OAuth consent screen
4. Add these authorized redirect URIs:
   - `http://localhost:3000/__/auth/handler`
   - `https://your-domain.com/__/auth/handler`

## Testing the Fix

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Test Authentication Flow
1. Navigate to `http://localhost:3000/signin`
2. Click "Continue with Google"
3. The pop-up should now work properly
4. If pop-up is blocked, it will automatically fall back to redirect

### 3. Expected Behavior
- **Success**: Pop-up opens, you sign in, pop-up closes, you're redirected to dashboard
- **Popup Blocked**: Browser redirects to Google sign-in, then back to your app
- **No More Blank Pop-ups**: Firebase handles pop-up creation properly

## Troubleshooting

### If you still see blank pop-ups:
1. Clear browser cache and cookies
2. Disable pop-up blockers for localhost:3000
3. Try in incognito mode
4. Check browser console for errors

### If redirect doesn't work:
1. Verify authorized domains in Firebase Console
2. Check OAuth consent screen configuration
3. Ensure redirect URIs are correct

### If you get "redirect initiated" error:
This is normal behavior - the auth state listener will handle the redirect result automatically.

## Environment Variables Check

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Next Steps

1. **Test the authentication flow** in your browser
2. **Configure Firebase Console** with the settings above
3. **Deploy to production** and add your production domain to authorized domains
4. **Monitor authentication** for any remaining issues

The authentication should now work smoothly without blank pop-ups or cross-origin issues!
