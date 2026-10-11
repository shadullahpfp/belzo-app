import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useOAuth } from '@clerk/clerk-expo';
import Svg, { Path } from 'react-native-svg';
import { Shield, Sparkles, Zap, Bike, User } from 'lucide-react-native';
import { useAuth } from '../_layout';

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { setDemoRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleGoogleSignIn = React.useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const redirectUrl = Linking.createURL('/(customer)/home', { scheme: 'belzo' });
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
        }
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } catch (err: any) {
      console.warn('Google OAuth error:', err);
      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        'Google Sign-In was cancelled or failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow]);

  const handleDemoSelect = async (role: 'customer' | 'rider', phone?: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setDemoRole(role, phone);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Official Brand Logo */}
        <View style={styles.logoBadgeContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand Headline */}
        <Text style={styles.brandTitle}>Belzo</Text>
        <Text style={styles.brandSubtitle}>
          10-Minute Hyperlocal Delivery in Joniha
        </Text>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Zap size={16} color="#FF5E00" />
            </View>
            <Text style={styles.featureText}>10-Min Dark Store</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Bike size={16} color="#FF5E00" />
            </View>
            <Text style={styles.featureText}>Direct Dispatch</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Shield size={16} color="#FF5E00" />
            </View>
            <Text style={styles.featureText}>4-Digit PIN Security</Text>
          </View>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Sparkles size={14} color="#FF5E00" />
            <Text style={styles.badgeText}>INSTANT ACCESS</Text>
          </View>

          <Text style={styles.cardTitle}>Sign in to your account</Text>
          <Text style={styles.cardSubtitle}>
            Continue with your Google account for secure 1-tap sign-in and real-time order tracking.
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Continue with Google Button */}
          <TouchableOpacity
            style={[styles.googleButton, loading && { opacity: 0.75 }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FF5E00" size="small" />
            ) : (
              <View style={styles.googleButtonContent}>
                <GoogleIcon size={20} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.legalNotice}>
            By continuing, you agree to Belzo's Terms of Service & Privacy Policy. Safe and encrypted with Clerk.
          </Text>
        </View>

        {/* Developer Demo Bypass Pills */}
        <View style={styles.demoSection}>
          <Text style={styles.demoSectionTitle}>
            DEMO BYPASS: JONIHA RAPID TESTING
          </Text>
          <View style={styles.demoPillsRow}>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => handleDemoSelect('customer', '9876543210')}
              activeOpacity={0.8}
            >
              <User size={13} color="#FF5E00" />
              <Text style={styles.demoPillText}>Customer (Joniha)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => handleDemoSelect('rider', '9999999999')}
              activeOpacity={0.8}
            >
              <Bike size={13} color="#FF5E00" />
              <Text style={styles.demoPillText}>Rider Console</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.demoHintText}>
            Pre-configured dev credentials for instant reviewer pass.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoBadgeContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1C1C1E',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF5E00',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 5,
  },
  featureIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF4EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  legalNotice: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  demoSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  demoPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  demoHintText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
