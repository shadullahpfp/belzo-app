import { initializeApp, getApps, getApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '';
const isFirebaseConfigured =
  apiKey.length > 10 && !apiKey.includes('Placeholder') && !apiKey.includes('your-');

const firebaseConfig = {
  apiKey: apiKey || 'AIzaSyPlaceholderKeyForBelzo2026',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'belzo-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'belzo-app',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'belzo-app.appspot.com',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

// Initialize or get existing Firebase App (handles React Native Fast Refresh)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Sentinel: tells login.tsx whether Firebase SMS is actually provisioned
export { isFirebaseConfigured };

// Initialize Auth with AsyncStorage persistence for React Native
let authInstance: FirebaseAuth.Auth;

try {
  if (Platform.OS === 'web') {
    authInstance = FirebaseAuth.getAuth(app);
  } else {
    const getReactNativePersistence = (FirebaseAuth as any).getReactNativePersistence;
    if (typeof getReactNativePersistence === 'function') {
      authInstance = FirebaseAuth.initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      authInstance = FirebaseAuth.getAuth(app);
    }
  }
} catch {
  // If already initialized during hot reload
  authInstance = FirebaseAuth.getAuth(app);
}

export const auth = authInstance;
