import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { MapPin, Navigation, ShoppingBag, ArrowRight, X } from 'lucide-react-native';
import { useRiderStore, RiderOrder } from '../../store/useRiderStore';

const { width } = Dimensions.get('window');
const COUNTDOWN_SECONDS = 30;
const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface OrderAlertModalProps {
  order: RiderOrder | null;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const OrderAlertModal: React.FC<OrderAlertModalProps> = ({
  order,
  onAccept,
  onDecline,
}) => {
  const { acceptOrder, rejectOrder } = useRiderStore();
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (!order) {
      setTimeLeft(COUNTDOWN_SECONDS);
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          rejectOrder(order.id);
          return 0;
        }
        if (prev <= 6) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  if (!order) return null;

  const strokeDashoffset = CIRCUMFERENCE - (timeLeft / COUNTDOWN_SECONDS) * CIRCUMFERENCE;

  const handleAccept = () => {
    acceptOrder(order.id);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    rejectOrder(order.id);
    if (onDecline) onDecline();
  };

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {/* Header Row */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerCapsule}>
              <View style={styles.headerCapsuleDot} />
              <Text style={styles.headerCapsuleText}>INCOMING DISPATCH CALL</Text>
            </View>

            <TouchableOpacity
              onPress={handleDecline}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Countdown & Payout Bento Card */}
          <View style={styles.metricsRow}>
            {/* SVG Countdown Radial Progress */}
            <View style={styles.timerWrapper}>
              <Svg width={68} height={68} viewBox="0 0 68 68">
                <Circle
                  cx="34"
                  cy="34"
                  r={RADIUS}
                  stroke="#E5E7EB"
                  strokeWidth="5"
                  fill="transparent"
                />
                <Circle
                  cx="34"
                  cy="34"
                  r={RADIUS}
                  stroke="#FF5E00"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 34 34)"
                />
              </Svg>
              <View style={styles.timerCenterText}>
                <Text style={styles.timerDigits}>{timeLeft}</Text>
                <Text style={styles.timerSec}>SEC</Text>
              </View>
            </View>

            {/* Payout Hero Value */}
            <View style={styles.payoutCard}>
              <Text style={styles.payoutLabel}>TRIP PAYOUT</Text>
              <Text style={styles.payoutValue}>₹{order.payout}</Text>
              <Text style={styles.payoutSubtext}>Instant shift credit on delivery</Text>
            </View>
          </View>

          {/* 2-Step Route Preview Card */}
          <View style={styles.tripCard}>
            {/* Step 1: Store Hub */}
            <View style={styles.tripStep}>
              <View style={styles.stepDotStore} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Pick up at Store Hub</Text>
                <Text style={styles.stepSubtitle} numberOfLines={1}>
                  {order.store_name}
                </Text>
              </View>
              <Text style={styles.stepDistance}>{order.distance_to_store}</Text>
            </View>

            <View style={styles.stepDivider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerTag}>
                <ShoppingBag size={11} color="#FF5E00" />
                <Text style={styles.dividerTagText}>
                  {order.items.length} items packed & sealed
                </Text>
              </View>
            </View>

            {/* Step 2: Customer */}
            <View style={styles.tripStep}>
              <View style={styles.stepDotCustomer} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Drop to Customer</Text>
                <Text style={styles.stepSubtitle} numberOfLines={1}>
                  {order.customer_address}
                </Text>
              </View>
              <Text style={styles.stepDistance}>{order.distance_to_customer}</Text>
            </View>
          </View>

          {/* Action CTAs */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleDecline}
              style={styles.declineBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.declineBtnText}>Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              style={styles.acceptBtn}
              activeOpacity={0.9}
            >
              <Text style={styles.acceptBtnText}>Accept Order</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    marginBottom: 16,
  },
  headerCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#FED7AA',
  },
  headerCapsuleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5E00',
  },
  headerCapsuleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  timerWrapper: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCenterText: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerDigits: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  timerSec: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8E8E93',
  },
  payoutCard: {
    flex: 1,
    marginLeft: 16,
  },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  payoutValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#047857',
    fontVariant: ['tabular-nums'],
    marginVertical: 1,
  },
  payoutSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
  tripCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  tripStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDotStore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5E00',
    marginRight: 10,
  },
  stepDotCustomer: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#047857',
    marginRight: 10,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  stepDistance: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  stepDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginLeft: 4,
  },
  dividerLine: {
    width: 2,
    height: 18,
    backgroundColor: '#E5E7EB',
    marginRight: 14,
  },
  dividerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dividerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5E00',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    width: 90,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
