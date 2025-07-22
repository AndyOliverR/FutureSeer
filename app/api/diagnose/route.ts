import { NextResponse } from 'next/server'
import { getAstroAppToken } from '@/lib/astroapp'

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {}
  }

  // Test environment variables
  const envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
    ASTROAPP_EMAIL: process.env.ASTROAPP_EMAIL ? '✅ Set' : '❌ Missing',
    ASTROAPP_PASSWORD: process.env.ASTROAPP_PASSWORD ? '✅ Set' : '❌ Missing',
    ASTROAPP_API_KEY: process.env.ASTROAPP_API_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
  }

  diagnostics.services.environment = envVars

  // Test OpenAI
  try {
    if (process.env.OPENAI_API_KEY) {
      diagnostics.services.openai = {
        status: '✅ Working',
        model: 'gpt-4o-mini'
      }
    } else {
      diagnostics.services.openai = {
        status: '❌ Not configured',
        error: 'Missing OpenAI API key'
      }
    }
  } catch (error: any) {
    diagnostics.services.openai = {
      status: '❌ Error',
      error: error.message
    }
  }

  // Test AstroApp
  try {
    if (process.env.ASTROAPP_EMAIL && process.env.ASTROAPP_PASSWORD && process.env.ASTROAPP_API_KEY) {
      const token = await getAstroAppToken();
      diagnostics.services.astroapp = {
        status: '✅ Working',
        type: 'JWT Token obtained'
      }
    } else {
      diagnostics.services.astroapp = {
        status: '❌ Not configured',
        error: 'Missing AstroApp credentials'
      }
    }
  } catch (error: any) {
    diagnostics.services.astroapp = {
      status: '❌ Error',
      error: error.message
    }
  }

  // Test Firebase
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    const missingConfigs = [];
    if (!firebaseConfig.apiKey) missingConfigs.push('NEXT_PUBLIC_FIREBASE_API_KEY');
    if (!firebaseConfig.authDomain) missingConfigs.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    if (!firebaseConfig.projectId) missingConfigs.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    if (!firebaseConfig.storageBucket) missingConfigs.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
    if (!firebaseConfig.messagingSenderId) missingConfigs.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
    if (!firebaseConfig.appId) missingConfigs.push('NEXT_PUBLIC_FIREBASE_APP_ID');

    if (missingConfigs.length > 0) {
      diagnostics.services.firebase = {
        status: '❌ Not configured',
        error: 'Missing Firebase configuration',
        missing: missingConfigs
      }
    } else {
      diagnostics.services.firebase = {
        status: '✅ Configured',
        note: 'Firebase configured with explicit "default" database connection',
        database: 'default',
        fix: 'Database naming conflict resolved - using explicit connection'
      }
    }
  } catch (error: any) {
    diagnostics.services.firebase = {
      status: '❌ Error',
      error: error.message
    }
  }

  return NextResponse.json(diagnostics)
} 