# 🚀 Vercel Deployment Guide for FutureSeer

## 🔧 **Critical Fixes Required**

### **Issue 1: AuthProvider Context Error (Fixed)**
✅ **Status**: Fixed in `app/layout.tsx`
- Added `ClientProviders` wrapper to provide `AuthProvider` context
- This resolves the "useAuth must be used within an AuthProvider" error

### **Issue 2: Firebase Connection Errors (400 Bad Request)**

The Firebase errors you're seeing on Vercel are due to missing or incorrect environment variables.

## 📋 **Environment Variables Setup**

### **Step 1: Vercel Dashboard Configuration**

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables:**

```env
# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI API (REQUIRED for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Groq API (REQUIRED for fast AI responses)
GROQ_API_KEY=your_groq_api_key_here

# Vercel AI Gateway (Optional - enables centralized monitoring and budget controls)
# Get your API key from: https://vercel.com/ai-gateway
# If not set, the app will use direct provider APIs (Groq/OpenAI)
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here

# AstroApp API (Optional but recommended)
ASTROAPP_API_KEY=your_astroapp_api_key_here
ASTROAPP_EMAIL=your_astroapp_email_here
ASTROAPP_PASSWORD=your_astroapp_password_here

# Stability AI (Optional for image generation)
STABILITY_API_KEY=your_stability_api_key_here

# PostHog Analytics (Optional)
POSTHOG_API_KEY=your_posthog_api_key_here
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_public_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_APP_NAME=FutureSeer
```

### **Step 2: Firebase Project Setup**

1. **Go to Firebase Console** → Your Project
2. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Google" provider
   - Enable "Email/Password" provider
   - Add your Vercel domain to authorized domains

3. **Set up Firestore Database**:
   - Go to Firestore Database
   - Create database if not exists
   - Set security rules (see below)

4. **Get Firebase Config**:
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Copy the config values

### **Step 3: Firestore Security Rules**

Replace your Firestore rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Ask history - users can only access their own
    match /askHistory/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Notes - users can only access their own
    match /notes/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Astro data - users can only access their own
    match /astroData/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

## 🔍 **Verification Steps**

### **Step 1: Check Environment Variables**

After adding environment variables in Vercel:

1. **Redeploy your application**
2. **Check the browser console** for Firebase initialization messages
3. **Look for these success messages**:
   ```
   Firebase configuration status: ► object
   Connected to Firestore database: "default"
   Firebase initialized successfully
   ```

### **Step 2: Test Authentication**

1. **Try to sign in** with Google or email
2. **Check if user profile is created** in Firestore
3. **Verify no more 400 errors** in console

### **Step 3: Test Features**

1. **Navigate to different pages**
2. **Try using divination tools**
3. **Check if data is being saved** to Firestore

## 🚨 **Common Issues & Solutions**

### **Issue: Still getting 400 Bad Request**

**Solution**: 
1. **Double-check Firebase config** in Vercel environment variables
2. **Ensure project ID matches** exactly
3. **Verify domain is authorized** in Firebase Console
4. **Check if Firestore is enabled** in Firebase Console

### **Issue: "Failed to get document because the client is offline"**

**Solution**:
1. **Check internet connection**
2. **Verify Firebase project is active**
3. **Ensure Firestore rules allow read access**
4. **Check if user is authenticated**

### **Issue: Authentication not working**

**Solution**:
1. **Verify Google OAuth is enabled** in Firebase
2. **Check authorized domains** in Firebase Console
3. **Ensure API key is correct**
4. **Test with email/password authentication**

## 📱 **Local Development vs Production**

### **Local Development**
- Use `.env.local` file
- All environment variables work as expected
- Firebase connects to your project

### **Production (Vercel)**
- Environment variables must be set in Vercel dashboard
- `NEXT_PUBLIC_` variables are exposed to client
- Server-side variables are secure

## 🔄 **Deployment Process**

1. **Set environment variables** in Vercel dashboard
2. **Push code changes** to your repository
3. **Vercel auto-deploys** with new environment variables
4. **Test the application** thoroughly
5. **Monitor console** for any remaining errors

## 📊 **Monitoring & Debugging**

### **Vercel Logs**
- Check Vercel dashboard → Functions → Logs
- Look for server-side errors
- Monitor API route performance

### **Browser Console**
- Check for client-side errors
- Verify Firebase initialization
- Monitor authentication flow

### **Firebase Console**
- Monitor authentication events
- Check Firestore usage
- Review security rules

## ✅ **Success Indicators**

When everything is working correctly, you should see:

1. **No 400 errors** in browser console
2. **Firebase initialized successfully** message
3. **Authentication working** (Google + Email)
4. **Data saving to Firestore** correctly
5. **All features functioning** properly

## 🆘 **Support**

If you continue to have issues:

1. **Check Vercel deployment logs**
2. **Verify all environment variables** are set correctly
3. **Test with a fresh Firebase project**
4. **Contact support** with specific error messages

---

**Remember**: Environment variables in Vercel are case-sensitive and must match exactly with what's expected in the code. 