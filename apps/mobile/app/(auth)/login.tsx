import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../_layout';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { setDemoRole } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const fullPhone = `+91${phone}`;

      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) {
        console.warn('Supabase SMS OTP Notice:', error.message);
        // Still transition to OTP step for development demo testing
      }
      setStep('otp');
    } catch (err: any) {
      console.error('OTP request error:', err);
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = async (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value.length > 0) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }

    // If all 6 filled, trigger verification
    if (newOtp.every((digit) => digit.length === 1)) {
      verifyCode(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (enteredOtp: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const fullPhone = `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: enteredOtp,
        type: 'sms',
      });

      if (error) {
        console.warn('Live verifyOtp note:', error.message);
        // Fallback for development demo: detect rider demo phone number
        if (phone === '9999999999') {
          setDemoRole('rider');
        } else {
          setDemoRole('customer');
        }
      } else if (data.session) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setDemoRole('customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F2F2F7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Official Brand Logo */}
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 140, height: 90, resizeMode: 'contain', alignSelf: 'center', marginBottom: 16 }}
        />

        {/* Header */}
        <Text style={styles.headerTitle}>Belzo</Text>
        <Text style={styles.headerSubtitle}>
          {step === 'phone'
            ? 'Enter your mobile number to get started with 15-minute delivery'
            : `Enter the 6-digit code sent to +91 ${phone}`}
        </Text>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Step 1: Phone Input */}
        {step === 'phone' ? (
          <View style={styles.formSection}>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneTextInput}
                placeholder="98765 43210"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/\D/g, ''))}
                autoFocus
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handlePhoneSubmit}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue with OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Step 2: 6-Digit OTP Input */
          <View style={styles.formSection}>
            <View style={styles.otpBoxesRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => verifyCode(otp.join(''))}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStep('phone');
                setOtp(['', '', '', '', '', '']);
              }}
              style={styles.changeNumberBtn}
            >
              <Text style={styles.changeNumberText}>Change Mobile Number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Demo Mode Bypasses for Rapid Day 1 QA */}
        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>DAY 1 INSTANT ROLE PREVIEW</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDemoRole('customer')}
              style={styles.demoBtnCustomer}
            >
              <Text style={styles.demoBtnText}>Launch Customer App</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDemoRole('rider')}
              style={styles.demoBtnRider}
            >
              <Text style={styles.demoBtnText}>Launch Rider Console</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  brandIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#2A134D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.4)',
    shadowColor: '#2A134D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  brandLetter: {
    color: '#FF5E00',
    fontSize: 34,
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2A134D',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 290,
  },
  errorBox: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFEBEA',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    marginTop: 32,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 58,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
    gap: 6,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  phoneTextInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
  primaryButton: {
    height: 54,
    backgroundColor: '#FF5E00',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#2A134D',
    fontVariant: ['tabular-nums'],
    elevation: 1,
  },
  otpBoxFilled: {
    borderColor: '#FF5E00',
    backgroundColor: '#FFF9F5',
  },
  changeNumberBtn: {
    alignItems: 'center',
    marginTop: 18,
  },
  changeNumberText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  demoSection: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 40,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 12,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtnCustomer: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnRider: {
    flex: 1,
    height: 44,
    backgroundColor: '#2A134D',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
});
