import React, { useState, useEffect, useCallback } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useOAuth, useSSO } from '@clerk/clerk-expo';
import Svg, { Path } from 'react-native-svg';
import { Shield, Sparkles, Zap, Bike } from 'lucide-react-native';

// Handle external OAuth browser redirects
WebBrowser.maybeCompleteAuthSession();

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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Warm up the browser on Android/iOS to eliminate initial load delay
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const { startSSOFlow } = useSSO();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'belzo',
        path: 'sso-callback',
      });

      // Try startSSOFlow first (built-in null checks), fall back to startOAuthFlow if needed
      let sessionId: string | null = null;
      let activateFn: ((opts: { session: string }) => Promise<void>) | undefined = undefined;

      try {
        const ssoResult = await startSSOFlow({
          strategy: 'oauth_google',
          redirectUrl,
        });
        sessionId = ssoResult.createdSessionId;
        activateFn = ssoResult.setActive;
      } catch (ssoErr: any) {
        console.warn('SSO Flow note, attempting direct OAuth flow:', ssoErr?.message || ssoErr);
        const oauthResult = await startOAuthFlow({
          redirectUrl,
        });
        sessionId = oauthResult.createdSessionId;
        activateFn = oauthResult.setActive;
      }

      if (sessionId && activateFn) {
        await activateFn({ session: sessionId });
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
  }, [startSSOFlow, startOAuthFlow]);

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
            By continuing, you agree to Belzo's Terms of Service &amp; Privacy Policy. Safe and encrypted with Clerk.
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
    width: 72,
    height: 72,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#FFEDD5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
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
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    lineHeight: 16,
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
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
});
