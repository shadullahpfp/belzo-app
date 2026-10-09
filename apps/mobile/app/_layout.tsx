import '../global.css';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { ActivityIndicator, View, StatusBar, Image, LogBox } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../src/lib/supabase';

// Suppress development warning overlays and yellow badges during evaluation/demos
LogBox.ignoreAllLogs(true);

import { useAuthStore, UserProfile, RiderData } from '../store/useAuthStore';

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

export default function RootLayout() {
  const {
    session,
    user,
    profile,
    rider,
    role,
    isLoading,
    isProfileSheetOpen,
    setSession,
    setUser,
    setRole,
    setIsProfileSheetOpen,
    fetchProfile,
    updateProfile,
    updateRiderDetails,
    setDemoAuth,
    signOut: storeSignOut,
  } = useAuthStore();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (!user) {
        setRole(null);
        useAuthStore.setState({ isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gatekeeper Redirect Logic
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inRiderGroup = segments[0] === '(rider)';

    if (!session && !role && !user) {
      if (!inAuthGroup) {
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
  }, [session, role, user, segments, isLoading]);

  const setDemoRole = async (newRole: 'customer' | 'rider', phone?: string) => {
    await setDemoAuth(newRole, phone);
    if (newRole === 'rider') {
      router.replace('/(rider)/dashboard');
    } else {
      router.replace('/(customer)/home');
    }
  };

  const signOut = async () => {
    await storeSignOut();
    router.replace('/(auth)/login');
  };

  if (isLoading) {
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
          isLoading,
          isProfileSheetOpen,
          setIsProfileSheetOpen,
          updateProfile,
          updateRiderDetails,
          signOut,
          setDemoRole,
        }}
      >
        <Slot />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

