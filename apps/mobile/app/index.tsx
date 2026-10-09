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
      {/* Official Belzo Brand Hero Logo in Apple Squircle */}
      <View style={styles.logoSquircle}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="cover"
        />
      </View>
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
  logoSquircle: {
    width: 96,
    height: 96,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#FFE6D5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
