import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPin, Bell, Radio, Check, X, Navigation } from 'lucide-react-native';
import { useLocationStore } from '../../store/useLocationStore';

const { width } = Dimensions.get('window');

export interface LocationNotServiceableModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationNotServiceableModal: React.FC<LocationNotServiceableModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    distanceFromHubKm,
    addressText,
    setDemoJonihaLocation,
  } = useLocationStore();

  const [notified, setNotified] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const radarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setNotified(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      // Radar pulsating ring loop
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(radarAnim, {
            toValue: 1.4,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(radarAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      scaleAnim.setValue(0.92);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleNotifyMe = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setNotified(true);
  };

  const handleDemoSwitch = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setDemoJonihaLocation();
    onClose();
  };

  const handleDismiss = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onClose();
  };

  const displayDistance =
    distanceFromHubKm !== null ? `${distanceFromHubKm.toFixed(1)} km` : 'Over 5.0 km';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        {/* Semi-transparent dark frosted backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleDismiss}
        />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleDismiss}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={18} color="#8E8E93" />
          </TouchableOpacity>

          {/* Radar ring & map pin icon */}
          <View style={styles.radarContainer}>
            <Animated.View
              style={[
                styles.radarOuterRing,
                { transform: [{ scale: radarAnim }] },
              ]}
            />
            <View style={styles.radarInnerRing} />
            <View style={styles.iconCircle}>
              <MapPin size={28} color="#FF3B30" strokeWidth={2.3} />
            </View>
          </View>

          {/* Modal Header */}
          <Text style={styles.title}>Out of Delivery Zone</Text>

          {/* Modal Body */}
          <Text style={styles.bodyText}>
            Belzo is currently hyper-focused on delivering within 5 KM of{' '}
            <Text style={styles.boldSpan}>Joniha Central Hub (Bindki, UP)</Text>. We're
            expanding rapidly to your area!
          </Text>

          {/* Live Metric Capsule */}
          <View style={styles.metricCapsule}>
            <View style={styles.metricDot} />
            <Text style={styles.metricText}>
              Your distance: <Text style={styles.metricValue}>{displayDistance} away</Text>{' '}
              (Limit: 5.0 km)
            </Text>
          </View>

          {/* Detected address preview */}
          {addressText ? (
            <View style={styles.detectedAddressBox}>
              <Navigation size={13} color="#8E8E93" />
              <Text numberOfLines={1} style={styles.detectedAddressText}>
                {addressText}
              </Text>
            </View>
          ) : null}

          {/* Action CTAs */}
          <View style={styles.actionsGroup}>
            {/* Primary Capsule CTA: Notify Me */}
            <TouchableOpacity
              style={[styles.primaryCapsuleBtn, notified && styles.notifiedBtn]}
              onPress={handleNotifyMe}
              activeOpacity={0.88}
              disabled={notified}
            >
              {notified ? (
                <View style={styles.btnRow}>
                  <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.primaryBtnText}>We'll Notify You at Launch!</Text>
                </View>
              ) : (
                <View style={styles.btnRow}>
                  <Bell size={18} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.primaryBtnText}>Notify Me When Live 🔔</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Secondary Capsule CTA: Enter a Different Delivery Address */}
            <TouchableOpacity
              style={styles.secondaryCapsuleBtn}
              onPress={handleDemoSwitch}
              activeOpacity={0.85}
            >
              <View style={styles.btnRow}>
                <Radio size={16} color="#1C1C1E" strokeWidth={2.2} />
                <Text style={styles.secondaryBtnText}>
                  Enter a Different Delivery Address
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 40, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
      },
      android: {
        elevation: 12,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  radarContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  radarOuterRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
  },
  radarInnerRing: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255, 59, 48, 0.18)',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#636366',
    textAlign: 'center',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  boldSpan: {
    fontWeight: '700',
    color: '#1C1C1E',
  },
  metricCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 94, 0, 0.3)',
    marginBottom: 10,
    gap: 7,
  },
  metricDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
  },
  metricText: {
    fontSize: 12,
    color: '#5C2D00',
    fontWeight: '500',
  },
  metricValue: {
    fontWeight: '800',
    color: '#FF3B30',
  },
  detectedAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 6,
    maxWidth: '92%',
  },
  detectedAddressText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  actionsGroup: {
    width: '100%',
    gap: 10,
  },
  primaryCapsuleBtn: {
    width: '100%',
    backgroundColor: '#FF5E00',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  notifiedBtn: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  secondaryCapsuleBtn: {
    width: '100%',
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
});

export default LocationNotServiceableModal;
