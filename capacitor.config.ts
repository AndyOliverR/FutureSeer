import { CapacitorConfig } from '@capacitor/cli';

// This logic ensures that for production builds, we don't point to a local server.
// If CAPACITOR_BUILD is set (which we'll use for the final APK), it uses local files.
const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.futureseer.app',
  appName: 'FutureSeer',
  webDir: 'public',
  server: {
    // ONLY use the local server in development.
    // For the final APK, remove these lines or use the bundled files.
    ...(isDev ? {
      url: 'http://10.0.2.2:3000',
      cleartext: true
    } : {
      // In production, we use the local bundled assets for maximum speed and zero glitch.
      androidScheme: 'https'
    }),
    allowNavigation: [
      '10.0.2.2:3000',
      'localhost:3000',
      'futureseer.app'
    ]
  },
  plugins: {
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#020617", // Matches your new deep blue
      showSpinner: true,
      spinnerColor: "#fbbf24", // Matches your glossy gold
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#020617'
    }
  }
};

export default config;
