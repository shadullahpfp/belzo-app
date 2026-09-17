import React, { useEffect, useState, createContext, useContext } from 'react';
import { ActivityIndicator, View, StatusBar, Image } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../src/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'customer' | 'rider' | 'admin' | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setDemoRole: (role: 'customer' | 'rider') => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
  setDemoRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'customer' | 'rider' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const segments = useSegments();
  const router = useRouter();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setRole('customer');
      } else {
        setRole((data as any).role || 'customer');
      }
    } catch {
      setRole('customer');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setIsLoading(true);
        await fetchUserProfile(session.user.id);
      } else {
        setRole(null);
        setIsLoading(false);
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

    if (!session && !role) {
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
  }, [session, role, segments, isLoading]);

  const setDemoRole = (newRole: 'customer' | 'rider') => {
    setRole(newRole);
    if (newRole === 'rider') {
      router.replace('/(rider)/dashboard');
    } else {
      router.replace('/(customer)/home');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setSession(null);
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
          user: session?.user ?? null,
          role,
          isLoading,
          signOut,
          setDemoRole,
        }}
      >
        <Slot />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
