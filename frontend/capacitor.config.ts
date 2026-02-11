import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartnutrition.app',
  appName: 'Smart Nutrition',
  webDir: 'dist',
  server: {
    // Live Updates: Load from Render server for instant updates
    url: 'https://smart-nutrition-platform.onrender.com',
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e293b',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e293b',
    },
  },
};

export default config;
