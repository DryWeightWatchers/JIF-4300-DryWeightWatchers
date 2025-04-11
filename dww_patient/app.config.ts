import 'dotenv/config';

export default ({ config }) => {
  const ENV = process.env.EXPO_ENV || 'dev';  // Ensure correct environment
  require('dotenv').config({ path: `.env.${ENV}` });  // Load correct .env file
  console.log("🔧 ENV:", process.env.EXPO_PUBLIC_DEV_SERVER_URL); 

  return {
    ...config,
    name: "Dry Weight Watchers",
    slug: "dww_patient",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dryweightwatchers.patient",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff"
      },
      package: "com.dryweightwatchers.patient"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification_logo.png",
          color: "#fff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false
        }
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "67555a01-7ba6-4484-9838-2d2fd1e46b9f"
      },
      apiBaseUrl: process.env.EXPO_PUBLIC_DEV_SERVER_URL
    }
  };
};
