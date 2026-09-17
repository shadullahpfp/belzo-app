import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './_layout';

export default function IndexPage() {
  const { session, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!session && !role) {
        router.replace('/(auth)/login');
      } else if (role === 'rider') {
        router.replace('/(rider)/dashboard');
      } else {
        router.replace('/(customer)/home');
      }
    }
  }, [session, role, isLoading]);

  return (
    <View style={styles.container}>
      {/* Official Belzo Brand Hero Logo */}
      <Image
        source={require('../assets/logo.png')}
        style={{ width: 140, height: 140, resizeMode: 'contain' }}
        className="mb-4"
      />
      <Text style={styles.brandTitle}>Belzo</Text>
      <Text style={styles.brandTagline}>Lightning Hyperlocal Delivery</Text>
      <View style={styles.loader}>
        <ActivityIndicator size="small" color="#FF5E00" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    marginTop: 20,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 6,
  },
  loader: {
    marginTop: 32,
  },
});
