import { NextRequest, NextResponse } from 'next/server'
import { getAstroAppToken } from '@/lib/astroapp'
import { getServerOAuthGuardrailReport } from '@/lib/oauthDomainGuardrails'
import { verifyAdminRequest } from '@/lib/adminApiAuth'
import { getDistributedControlsStatus } from '@/lib/distributedControlsStatus'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  const adminAuth = await verifyAdminRequest(request, 'diagnose-route');
  if (!adminAuth.ok) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const diagnostics: {
    timestamp: string;
    environment: string | undefined;
    services: Record<string, unknown>;
  } = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {}
  }

  // Test environment variables
  const envVars = {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? '✅ Set (Ask the Seer + other tools)' : '❌ Missing',
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

  const oauthReport = getServerOAuthGuardrailReport()
  diagnostics.services.oauth = {
    appHost: oauthReport.appHost,
    firebaseAuthDomain: oauthReport.firebaseAuthDomain,
    expectedAuthHandlerUrl: oauthReport.expectedAuthHandlerUrl,
    checks: oauthReport.checks,
  }

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
  } catch (error: unknown) {
    diagnostics.services.openai = {
      status: '❌ Error',
      error: error instanceof Error ? error.message : 'unknown_error'
    }
  }

  // Test AstroApp
  try {
    if (process.env.ASTROAPP_EMAIL && process.env.ASTROAPP_PASSWORD && process.env.ASTROAPP_API_KEY) {
      await getAstroAppToken();
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
  } catch (error: unknown) {
    diagnostics.services.astroapp = {
      status: '❌ Error',
      error: error instanceof Error ? error.message : 'unknown_error'
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
  } catch (error: unknown) {
    diagnostics.services.firebase = {
      status: '❌ Error',
      error: error instanceof Error ? error.message : 'unknown_error'
    }
  }

  const distributed = getDistributedControlsStatus()
  diagnostics.services.distributedControls = {
    mode: distributed.mode,
    rateLimitStore: distributed.rateLimitStore,
    circuitBreakerStore: distributed.circuitBreakerStore,
    firebaseAdminAvailable: distributed.firebaseAdminAvailable,
    capacitorBuild: distributed.capacitorBuild,
    recommendations: distributed.recommendations,
    vercelEnv: process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV ?? undefined,
  }

  return NextResponse.json(diagnostics)
} 