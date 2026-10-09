import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export type OrderProgressStatus =
  | 'placed'
  | 'accepted'
  | 'out_for_delivery'
  | 'delivered';

export interface OrderTimelineTrackerProps {
  status: OrderProgressStatus;
  etaTime?: string;
  deliveryPin?: string;
  riderName?: string;
  riderVehicle?: string;
  riderRating?: string;
  onCallRider?: () => void;
}

const STAGES: { key: OrderProgressStatus; label: string; icon: string }[] = [
  { key: 'placed', label: 'Order Placed', icon: '✔' },
  { key: 'accepted', label: 'Packed', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '⚡' },
  { key: 'delivered', label: 'Delivered', icon: '🏁' },
];

const STATUS_INDEX_MAP: Record<OrderProgressStatus, number> = {
  placed: 0,
  accepted: 1,
  out_for_delivery: 2,
  delivered: 3,
};

/**
 * OrderTimelineTracker - 4-Stage Live Delivery Progress Tracker
 * Features an active pulsating radar beacon on the current milestone,
 * courier info card, and a prominent 4-digit delivery PIN display.
 */
export const OrderTimelineTracker: React.FC<OrderTimelineTrackerProps> = ({
  status,
  etaTime = '12 Mins',
  deliveryPin = '4912',
  riderName = 'Ramesh K.',
  riderVehicle = 'KA 01 EK 4920',
  riderRating = '4.9 ★',
  onCallRider,
}) => {
  const activeIndex = STATUS_INDEX_MAP[status] ?? 0;

  // Radar Pulse Animation for 'out_for_delivery' or current active step
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 2.2,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();

    return () => pulseAnim.stop();
  }, [pulseScale, pulseOpacity]);

  const handleCall = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fallback
    }
    if (onCallRider) onCallRider();
  };

  return (
    <View style={styles.card}>
      {/* Top Header with Live ETA */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSubtitle}>ESTIMATED ARRIVAL</Text>
          <Text style={styles.headerTitle}>{etaTime}</Text>
        </View>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE TRACKING</Text>
        </View>
      </View>

      {/* 4-Step Horizontal Timeline */}
      <View style={styles.timelineContainer}>
        {STAGES.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isPending = index > activeIndex;

          return (
            <React.Fragment key={stage.key}>
              {/* Connector Bar before node (except first node) */}
              {index > 0 && (
                <View
                  style={[
                    styles.connectorLine,
                    index <= activeIndex
                      ? styles.connectorActive
                      : styles.connectorInactive,
                  ]}
                />
              )}

              {/* Step Node */}
              <View style={styles.nodeWrapper}>
                {/* Radar Ring for active step */}
                {isCurrent && (
                  <Animated.View
                    style={[
                      styles.radarRing,
                      {
                        transform: [{ scale: pulseScale }],
                        opacity: pulseOpacity,
                      },
                    ]}
                  />
                )}

                {/* Main Node Circle */}
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted && styles.nodeCircleCompleted,
                    isCurrent && styles.nodeCircleCurrent,
                    isPending && styles.nodeCirclePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.nodeIconText,
                      isPending && styles.nodeIconPendingText,
                    ]}
                  >
                    {isCompleted ? '✓' : stage.icon}
                  </Text>
                </View>

                {/* Step Label */}
                <Text
                  style={[
                    styles.nodeLabel,
                    isCurrent && styles.nodeLabelCurrent,
                    isCompleted && styles.nodeLabelCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {stage.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Delivery PIN & Rider Info Box */}
      <View style={styles.deliveryDetailsRow}>
        {/* Left: 4-digit Delivery PIN */}
        <View style={styles.pinContainer}>
          <Text style={styles.pinSubheader}>SHARE AT DOORSTEP</Text>
          <View style={styles.pinBox}>
            <Text style={styles.pinLabel}>PIN</Text>
            <Text style={styles.pinDigits}>{deliveryPin}</Text>
          </View>
        </View>

        {/* Right: Rider Card */}
        <View style={styles.riderCard}>
          <View style={styles.riderAvatar}>
            <Text style={styles.riderAvatarText}>
              {riderName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.riderInfo}>
            <View style={styles.riderNameRow}>
              <Text style={styles.riderName}>{riderName}</Text>
              <Text style={styles.riderRatingBadge}>{riderRating}</Text>
            </View>
            <Text style={styles.riderVehicle}>{riderVehicle}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCall}
            style={styles.callButton}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E85D04',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  nodeWrapper: {
    alignItems: 'center',
    width: 68,
    position: 'relative',
  },
  radarRing: {
    position: 'absolute',
    top: -2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E85D04',
    zIndex: 1,
  },
  nodeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCircleCompleted: {
    backgroundColor: '#10B981',
  },
  nodeCircleCurrent: {
    backgroundColor: '#E85D04',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nodeCirclePending: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  nodeIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  nodeIconPendingText: {
    color: '#94A3B8',
  },
  nodeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 14,
  },
  nodeLabelCompleted: {
    color: '#0F172A',
    fontWeight: '600',
  },
  nodeLabelCurrent: {
    color: '#E85D04',
    fontWeight: '800',
  },
  connectorLine: {
    flex: 1,
    height: 3,
    marginTop: 16,
    marginHorizontal: -4,
    borderRadius: 2,
  },
  connectorActive: {
    backgroundColor: '#10B981',
  },
  connectorInactive: {
    backgroundColor: '#E2E8F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  deliveryDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pinContainer: {
    flex: 1,
  },
  pinSubheader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  pinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EB',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.5,
  },
  pinDigits: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1C1E',
    letterSpacing: 3,
    fontVariant: ['tabular-nums'],
  },
  riderCard: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  riderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF4EB',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: {
    color: '#FF5E00',
    fontSize: 14,
    fontWeight: '800',
  },
  riderInfo: {
    flex: 1,
  },
  riderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  riderRatingBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  riderVehicle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: {
    fontSize: 14,
  },
});

export default OrderTimelineTracker;
