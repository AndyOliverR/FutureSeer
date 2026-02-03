import { NextResponse } from 'next/server'

export async function GET() {
  // Check which environment variables are available and show partial values
  const envCheck = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 
      `✅ Set (${process.env.OPENAI_API_KEY.substring(0, 7)}...)` : 
      '❌ Missing',
    ASTROAPP_API_KEY: process.env.ASTROAPP_API_KEY ? 
      `✅ Set (${process.env.ASTROAPP_API_KEY.substring(0, 7)}...)` : 
      '❌ Missing',
    STABILITY_API_KEY: process.env.STABILITY_API_KEY ? 
      `✅ Set (${process.env.STABILITY_API_KEY.substring(0, 7)}...)` : 
      '❌ Missing',
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY ? 
      `✅ Set (${process.env.POSTHOG_API_KEY.substring(0, 7)}...)` : 
      '❌ Missing',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
      `✅ Set (${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 7)}...)` : 
      '❌ Missing',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 
      `✅ Set (${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN})` : 
      '❌ Missing',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 
      `✅ Set (${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID})` : 
      '❌ Missing',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 
      `✅ Set (${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET})` : 
      '❌ Missing',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 
      `✅ Set (${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID})` : 
      '❌ Missing',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 
      `✅ Set (${process.env.NEXT_PUBLIC_FIREBASE_APP_ID.substring(0, 7)}...)` : 
      '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
  }

  // Check for placeholder values
  const placeholderCheck = {
    hasOpenAIPlaceholder: process.env.OPENAI_API_KEY?.includes('your_') || false,
    hasAstroAppPlaceholder: process.env.ASTROAPP_API_KEY?.includes('your_') || false,
    hasFirebasePlaceholder: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.includes('your_') || false,
  }

  return NextResponse.json({
    message: 'Environment Variables Check',
    timestamp: new Date().toISOString(),
    environment: envCheck,
    placeholderCheck,
    totalSet: Object.values(envCheck).filter(v => v.includes('✅ Set')).length,
    totalMissing: Object.values(envCheck).filter(v => v === '❌ Missing').length,
    hasPlaceholders: Object.values(placeholderCheck).some(v => v),
  })
} 