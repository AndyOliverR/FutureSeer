import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.futureseer.app',
  appName: 'FutureSeer',
  webDir: 'public',
  server: {
    // Explicitly point to your local machine for the emulator
    url: 'http://10.0.2.2:3000',
    cleartext: true,
    androidScheme: 'http',
    allowNavigation: [
      '10.0.2.2:3000',
      'localhost:3000',
      'futureseer.app',
      '*.firebaseapp.com',
      '*.google.com',
      'accounts.google.com'
    ]
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
