import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ShieldCheck, CheckCircle2, X, AlertTriangle, KeyRound } from 'lucide-react-native';
import { useRiderStore, RiderOrder } from '../../store/useRiderStore';

interface DeliveryPinModalProps {
  visible: boolean;
  order: RiderOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeliveryPinModal: React.FC<DeliveryPinModalProps> = ({
  visible,
  order,
  onClose,
  onSuccess,
}) => {
  const { verifyPinAndDeliver } = useRiderStore();
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pinInputs = useRef<Array<TextInput | null>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setPin(['', '', '', '']);
      setPinError(null);
      setIsSubmitting(false);
      setIsSuccess(false);
      checkmarkScaleAnim.setValue(0);
      setTimeout(() => {
        pinInputs.current[0]?.focus();
      }, 250);
    }
  }, [visible]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigitChange = (text: string, index: number) => {
    setPinError(null);
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    // Auto-advance
    if (text && index < 3) {
      pinInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!order) return;
    const enteredPin = pin.join('');
    if (enteredPin.length < 4) {
      setPinError('Please enter all 4 digits');
      triggerShake();
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      return;
    }

    setIsSubmitting(true);
    const success = await verifyPinAndDeliver(order.id, enteredPin);
    setIsSubmitting(false);

    if (success) {
      setIsSuccess(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      Animated.spring(checkmarkScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      triggerShake();
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      setPinError('Invalid PIN. Please ask customer for the 4-digit PIN on their screen.');
    }
  };

  if (!visible || !order) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Bar with Dismiss */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.shieldBadge}>
                <ShieldCheck size={18} color="#FF5E00" />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Delivery PIN Verification</Text>
                <Text style={styles.sheetSubtitle}>
                  Order #{order.short_code} • {order.customer_name}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              disabled={isSuccess}
            >
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          {isSuccess ? (
            /* Celebratory Completion State */
            <View style={styles.successState}>
              <Animated.View
                style={[
                  styles.checkmarkCircle,
                  { transform: [{ scale: checkmarkScaleAnim }] },
                ]}
              >
                <CheckCircle2 size={56} color="#047857" />
              </Animated.View>
              <Text style={styles.successTitle}>Handoff Verified!</Text>
              <Text style={styles.successSubtitle}>
                Order marked delivered. ₹{order.payout} credited to your shift.
              </Text>
            </View>
          ) : (
            /* PIN Input Form */
            <View style={styles.formContainer}>
              <Text style={styles.promptText}>
                Ask the customer for their 4-digit verification code to confirm handoff.
              </Text>

              {/* 4 Separate Tabular Input Boxes */}
              <Animated.View
                style={[
                  styles.digitsRow,
                  { transform: [{ translateX: shakeAnim }] },
                ]}
              >
                {pin.map((digit, index) => {
                  const isFilled = Boolean(digit);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.digitBox,
                        isFilled && styles.digitBoxFilled,
                        pinError ? styles.digitBoxError : null,
                      ]}
                    >
                      <TextInput
                        ref={(el) => {
                          pinInputs.current[index] = el;
                        }}
                        value={digit}
                        onChangeText={(val) => handleDigitChange(val, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        style={styles.digitInput}
                        selectionColor="#FF5E00"
                      />
                    </View>
                  );
                })}
              </Animated.View>

              {pinError && (
                <View style={styles.errorRow}>
                  <AlertTriangle size={14} color="#DC2626" />
                  <Text style={styles.errorText}>{pinError}</Text>
                </View>
              )}

              {/* Apple Pill Verify Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[
                  styles.verifyBtn,
                  pin.join('').length === 4 ? styles.verifyBtnActive : styles.verifyBtnDisabled,
                ]}
                activeOpacity={0.9}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <KeyRound size={16} color="#FFFFFF" />
                    <Text style={styles.verifyBtnText}>Confirm Handshake & Complete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 28, // rounded-3xl squircle
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 0.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    alignItems: 'center',
  },
  promptText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  digitsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  digitBox: {
    width: 58,
    height: 66,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    borderColor: '#FF5E00',
    backgroundColor: '#FFF7ED',
  },
  digitBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  digitInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  verifyBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  verifyBtnActive: {
    backgroundColor: '#FF5E00',
  },
  verifyBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  checkmarkCircle: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
