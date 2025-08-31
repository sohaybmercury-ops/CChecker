import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calculator.app',
  appName: 'Calculator App',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      keystorePassword: undefined,
      releaseType: "APK"
    }
  },
  plugins: {
    App: {
      launchShowDuration: 500
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a1a'
    },
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
