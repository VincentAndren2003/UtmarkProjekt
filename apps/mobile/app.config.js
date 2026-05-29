const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

export default {
  expo: {
    name: 'Utmark',
    slug: 'mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.utmark.app',
      config: {
        googleMapsApiKey,
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      usesCleartextTraffic: true,
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.utmark.app',
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      '@maplibre/maplibre-react-native',
      'expo-secure-store',
      'expo-asset',
    ],
    extra: {
      eas: {
        projectId: '947c6cd2-14d5-406a-8822-86bab8a0db5b',
      },
    },
  },
};
