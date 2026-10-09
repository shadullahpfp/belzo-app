import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderNumber?: string;
    total?: string;
    itemsCount?: string;
  }>();

  const orderNum = params.orderNumber || 'BLZ-8492';
  const totalAmount = params.total || '287';
  const itemsCount = params.itemsCount || '3';

  // Apple-grade spring scale animation for success checkmark
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 12-minute countdown timer (720 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(714);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 14,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleTrackLive = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.replace(`/(customer)/track-order/${orderNum}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Official Brand Logo */}
        <Image
          source={require('../../assets/logo.png')}
          style={styles.brandLogo}
        />

        {/* Animated Checkmark Circle */}
        <Animated.View
          style={[
            styles.checkmarkCircle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.checkmarkIcon}>✓</Text>
        </Animated.View>

        {/* Success Headlines */}
        <Text style={styles.successTitle}>Order Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Dark Store Belzo Joniha Hub is packing your items right now.
        </Text>

        {/* Order ID Pill */}
        <View style={styles.orderIdPill}>
          <Text style={styles.orderIdLabel}>ORDER NUMBER</Text>
          <Text style={styles.orderIdText}>#{orderNum}</Text>
        </View>

        {/* Live 12-Minute Countdown Card */}
        <View style={styles.countdownCard}>
          <View style={styles.countdownTopRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.countdownHeader}>ESTIMATED ARRIVAL IN</Text>
          </View>
          <Text style={styles.countdownTimer}>
            {formatCountdown(secondsRemaining)}
          </Text>
          <Text style={styles.countdownSub}>
            Guaranteed Belzo 12-Minute Hyperlocal Dispatch
          </Text>

          {/* Stepper Progress Bar */}
          <View style={styles.timelineRow}>
            <View style={[styles.timelineNode, styles.timelineNodeDone]}>
              <Text style={styles.timelineNodeText}>1</Text>
            </View>
            <View style={[styles.timelineTrack, styles.timelineTrackDone]} />
            <View style={[styles.timelineNode, styles.timelineNodeActive]}>
              <Text style={styles.timelineNodeText}>2</Text>
            </View>
            <View style={styles.timelineTrack} />
            <View style={styles.timelineNode}>
              <Text style={styles.timelineNodeText}>3</Text>
            </View>
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabelActive}>Order Placed</Text>
            <Text style={styles.timelineLabelActive}>Packing</Text>
            <Text style={styles.timelineLabel}>Dispatched</Text>
          </View>
        </View>

        {/* Order Details Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Items in Order</Text>
            <Text style={styles.summaryVal}>{itemsCount} Items</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Total Amount Paid</Text>
            <Text style={styles.summaryVal}>₹{totalAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Delivery Hub</Text>
            <Text style={styles.summaryVal}>Belzo Central Hub 01</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Delivery OTP</Text>
            <Text style={styles.otpPill}>
              {Math.floor(1000 + Math.random() * 9000)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.trackButton}
          onPress={handleTrackLive}
          activeOpacity={0.88}
        >
          <Text style={styles.trackButtonText}>Track Live Delivery</Text>
          <Text style={styles.trackArrow}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(customer)/home' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.homeButtonText}>Return to Catalog</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brandLogo: {
    width: 70,
    height: 45,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: 20,
  },
  orderIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    marginBottom: 20,
  },
  orderIdLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
  },
  countdownCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countdownTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5E00',
  },
  countdownHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 1,
  },
  countdownTimer: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  countdownSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeDone: {
    backgroundColor: '#34C759',
  },
  timelineNodeActive: {
    backgroundColor: '#FF5E00',
  },
  timelineNodeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  timelineTrack: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E5EA',
  },
  timelineTrackDone: {
    backgroundColor: '#34C759',
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  timelineLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  timelineLabelActive: {
    fontSize: 11,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryKey: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  otpPill: {
    backgroundColor: '#FFF4EB',
    color: '#FF5E00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  trackButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#FF5E00',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5E00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  trackArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  homeButton: {
    paddingVertical: 10,
  },
  homeButtonText: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '700',
  },
});
