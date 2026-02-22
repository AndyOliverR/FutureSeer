import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.futureseer.app',
  appName: 'FutureSeer',
  webDir: 'public',
  server: {
    // Reverted to local host for development testing
    url: 'http://10.0.2.2:3000',
    cleartext: true,
    androidScheme: 'http',
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
      backgroundColor: "#0a001e",
      showSpinner: true,
      spinnerColor: "#f9c922"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a001e'
    }
  }
};

export default config;
