import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { User, Phone, MapPin, Sparkles, Check, X } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

export function CompleteProfileSheet({ visible, onClose }: Props) {
  const {
    profile,
    user,
    isProfileSheetOpen,
    setIsProfileSheetOpen,
    updateProfile,
  } = useAuthStore();

  const isVisible = visible !== undefined ? visible : isProfileSheetOpen;

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Ward No. 4, Shahbajpur, Joniha, Bindki (212635)'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.phone) setPhoneNumber(profile.phone);
      if (profile.default_address) {
        if (typeof profile.default_address === 'string') {
          setDeliveryAddress(profile.default_address);
        } else if (profile.default_address.address) {
          setDeliveryAddress(profile.default_address.address);
        }
      }
    } else if (user) {
      const uPhone = (user as any).phone || (user as any).user_metadata?.phone;
      if (uPhone) setPhoneNumber(uPhone);
    }
  }, [profile, user]);

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else {
      setIsProfileSheetOpen(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter your full name');
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const cleanPhone = phoneNumber.trim() || profile?.phone || '+91 98765 43210';
    const addressObj = {
      label: 'Home',
      recipient_name: trimmedName,
      recipient_phone: cleanPhone,
      city: 'Bindki',
      area: 'Joniha',
      address: deliveryAddress.trim() || 'Ward No. 4, Shahbajpur, Joniha, Bindki (212635)',
    };

    const success = await updateProfile({
      full_name: trimmedName,
      phone: cleanPhone,
      default_address: addressObj,
    });

    setIsSubmitting(false);

    if (success) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      handleDismiss();
    } else {
      setErrorMsg('Failed to save profile. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <View style={styles.sheetCard}>
              {/* Top Handle */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.badgeRow}>
                  <View style={styles.iconChip}>
                    <Sparkles size={16} color="#FF5E00" />
                  </View>
                  <Text style={styles.badgeText}>AUTHENTIC PROFILE</Text>
                </View>

                {profile?.full_name ? (
                  <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                    <X size={18} color="#8E8E93" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Set your name and delivery address to enable real-time 10-minute dispatch from Joniha Central Hub.
              </Text>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Input Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#FF5E00" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Mohammad Shadullah"
                    placeholderTextColor="#A0A0A5"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoFocus={!profile?.full_name}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#FF5E00" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#A0A0A5"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>DELIVERY ADDRESS / LANDMARK</Text>
                <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 10 }]}>
                  <MapPin size={18} color="#FF5E00" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                    placeholder="Ward No. 4, Shahbajpur, Joniha, Bindki"
                    placeholderTextColor="#A0A0A5"
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    multiline
                  />
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSubmitting}
                style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.btnContent}>
                    <Check size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Save Profile & Continue</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  iconChip: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
    marginBottom: 18,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    paddingVertical: 10,
  },
  saveBtn: {
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
