import '../global.css';
import React, { useEffect, createContext, useContext } from 'react';
import { ActivityIndicator, View, StatusBar, Image, LogBox } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { ClerkProvider, useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { supabase } from '../src/lib/supabase';
import { useAuthStore, UserProfile, RiderData } from '../store/useAuthStore';
import { CompleteProfileSheet } from '../components/profile/CompleteProfileSheet';

// Complete WebBrowser OAuth redirects
WebBrowser.maybeCompleteAuthSession();

// Suppress development warning overlays and yellow badges during evaluation/demos
LogBox.ignoreAllLogs(true);

import { tokenCache } from '../lib/tokenCache';

interface AuthContextType {
  session: Session | null;
  user: User | any | null;
  profile: UserProfile | null;
  rider: RiderData | null;
  role: 'customer' | 'rider' | 'store_operator' | 'admin' | null;
  isLoading: boolean;
  isProfileSheetOpen: boolean;
  setIsProfileSheetOpen: (open: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateRiderDetails: (updates: Partial<RiderData>) => Promise<boolean>;
  signOut: () => Promise<void>;
  setDemoRole: (role: 'customer' | 'rider', phone?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  rider: null,
  role: null,
  isLoading: true,
  isProfileSheetOpen: false,
  setIsProfileSheetOpen: () => {},
  updateProfile: async () => false,
  updateRiderDetails: async () => false,
  signOut: async () => {},
  setDemoRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

function AppNavigation() {
  const { isLoaded: isClerkLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const {
    session,
    user,
    profile,
    rider,
    role,
    isLoading,
    isProfileSheetOpen,
    setIsProfileSheetOpen,
    fetchProfile,
    syncClerkUser,
    updateProfile,
    updateRiderDetails,
    setDemoAuth,
    signOut: storeSignOut,
  } = useAuthStore();

  const segments = useSegments();
  const router = useRouter();

  // Sync Clerk authenticated user with Supabase
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isSignedIn && clerkUser) {
      syncClerkUser(clerkUser);
    } else if (!user && !role) {
      // Check legacy Supabase session if any
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          useAuthStore.getState().setSession(session);
          useAuthStore.getState().setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          useAuthStore.setState({ isLoading: false });
        }
      });
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);

  // Gatekeeper Redirect Logic
  useEffect(() => {
    if (isLoading || !isClerkLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inRiderGroup = segments[0] === '(rider)';
    const inSSOCallback = (segments[0] as string) === 'sso-callback';

    const hasAuth = (isSignedIn && !!clerkUser) || (!!role && !!user);

    if (!hasAuth) {
      if (!inAuthGroup && !inSSOCallback) {
        router.replace('/(auth)/login');
      }
    } else {
      if (role === 'rider') {
        if (!inRiderGroup) {
          router.replace('/(rider)/dashboard');
        }
      } else {
        // Customer (default)
        if (!inCustomerGroup) {
          router.replace('/(customer)/home');
        }
      }
    }
  }, [isSignedIn, clerkUser, role, user, segments, isLoading, isClerkLoaded]);

  const setDemoRole = async (newRole: 'customer' | 'rider', phone?: string) => {
    await setDemoAuth(newRole, phone);
    if (newRole === 'rider') {
      router.replace('/(rider)/dashboard');
    } else {
      router.replace('/(customer)/home');
    }
  };

  const signOut = async () => {
    try {
      if (isSignedIn) {
        await clerkSignOut();
      }
    } catch {}
    await storeSignOut();
    router.replace('/(auth)/login');
  };

  if (isLoading || !isClerkLoaded) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }}>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 140, height: 140, resizeMode: 'contain' }}
            className="mb-4"
          />
          <ActivityIndicator size="small" color="#FF5E00" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AuthContext.Provider
        value={{
          session,
          user,
          profile,
          rider,
          role,
          isLoading: isLoading || !isClerkLoaded,
          isProfileSheetOpen,
          setIsProfileSheetOpen,
          updateProfile,
          updateRiderDetails,
          signOut,
          setDemoRole,
        }}
      >
        <Slot />
        <CompleteProfileSheet />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y2xlcmsuYmVsem8uZGV2JA';

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <AppNavigation />
    </ClerkProvider>
  );
}

