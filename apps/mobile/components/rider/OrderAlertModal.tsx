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

    // Trigger audible haptic warning
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    // Pulsing animation
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

    // 30s Countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          rejectOrder(order.id);
          return 0;
        }
        // Subtly pulse haptics on final 5 seconds
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
        <View style={styles.sheetContainer}>
          {/* Pulsing Capsule Header */}
          <Animated.View style={[styles.headerCapsule, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.liveIndicator} />
            <Text style={styles.headerCapsuleText}>NEW PRIORITY DISPATCH OFFER</Text>
          </Animated.View>

          {/* Countdown & Earnings Badge */}
          <View style={styles.metricsRow}>
            {/* Circular Timer Ring */}
            <View style={styles.timerWrapper}>
              <Svg width={68} height={68} viewBox="0 0 68 68">
                <Circle
                  cx="34"
                  cy="34"
                  r={RADIUS}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="5"
                  fill="transparent"
                />
                <Circle
                  cx="34"
                  cy="34"
                  r={RADIUS}
                  stroke="#FF5E00"
                  strokeWidth="5"
                  strokeDasharray={`${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform="rotate(-90 34 34)"
                />
              </Svg>
              <View style={styles.timerCenterText}>
                <Text style={styles.timerDigits}>{timeLeft}</Text>
                <Text style={styles.timerSec}>SEC</Text>
              </View>
            </View>

            {/* Guaranteed Earnings Display */}
            <View style={styles.payoutCard}>
              <Text style={styles.payoutLabel}>GUARANTEED PAYOUT</Text>
              <Text style={styles.payoutValue}>₹{order.payout}</Text>
              <Text style={styles.payoutSubtext}>Includes surge & drop bonus</Text>
            </View>
          </View>

          {/* Trip Geometry & Distance Matrix */}
          <View style={styles.tripCard}>
            <View style={styles.tripStep}>
              <View style={styles.stepDotStore} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Pickup: {order.store_name}</Text>
                <Text style={styles.stepSubtitle} numberOfLines={1}>
                  {order.store_address}
                </Text>
              </View>
              <Text style={styles.stepDistance}>{order.distance_to_store}</Text>
            </View>

            <View style={styles.stepDivider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerTag}>
                <Navigation size={12} color="#FF5E00" />
                <Text style={styles.dividerTagText}>3.6 km Total Trip</Text>
              </View>
            </View>

            <View style={styles.tripStep}>
              <View style={styles.stepDotCustomer} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Deliver: {order.customer_name}</Text>
                <Text style={styles.stepSubtitle} numberOfLines={1}>
                  {order.customer_address}
                </Text>
              </View>
              <Text style={styles.stepDistance}>{order.distance_to_customer}</Text>
            </View>
          </View>

          {/* Items Preview */}
          <View style={styles.itemsPreview}>
            <ShoppingBag size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.itemsPreviewText}>
              {order.items.reduce((acc, it) => acc + it.quantity, 0)} Items (
              {order.items.map((i) => i.name).join(', ')})
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleDecline}
              style={styles.declineButton}
              activeOpacity={0.7}
            >
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              style={styles.acceptButton}
              activeOpacity={0.85}
            >
              <Text style={styles.acceptText}>Accept Delivery</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 4, 20, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1E0E38',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  headerCapsule: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 94, 0, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.45)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 18,
    gap: 7,
  },
  liveIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF5E00',
  },
  headerCapsuleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7A29',
    letterSpacing: 0.8,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  timerSec: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  payoutCard: {
    flex: 1,
    marginLeft: 16,
  },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  payoutValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#34C759',
    fontVariant: ['tabular-nums'],
    marginVertical: 1,
  },
  payoutSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tripCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
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
    backgroundColor: '#34C759',
    marginRight: 10,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },
  stepDistance: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: 14,
  },
  dividerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dividerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF7A29',
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    marginBottom: 20,
  },
  itemsPreviewText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  declineText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#FF5E00',
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  acceptText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
