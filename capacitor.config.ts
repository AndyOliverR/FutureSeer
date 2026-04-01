import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.futureseer.app',
  appName: 'FutureSeer',
  webDir: 'public',
  // Production: WebView loads the live site on Vercel (same-origin /api routes).
  // For local dev against the emulator, temporarily set url to http://10.0.2.2:3000,
  // cleartext: true, androidScheme: 'http', and matching allowNavigation — then cap sync.
  server: {
    url: 'https://futureseer.app',
    cleartext: false,
    allowNavigation: [
      'futureseer.app',
      '*.firebaseapp.com',
      '*.google.com',
      'accounts.google.com',
    ],
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#020617",
      showSpinner: true,
      spinnerColor: "#fbbf24",
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#020617'
    }
  }
};

export default config;
