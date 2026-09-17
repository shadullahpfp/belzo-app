import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Zap,
  TrendingUp,
  Star,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Clock,
  Radio,
  Navigation,
  ChevronRight,
  ShieldCheck,
  Phone
} from 'lucide-react-native';
import { useRiderStore } from '../../store/useRiderStore';
import { OrderAlertModal } from '../../components/rider/OrderAlertModal';
import { useAuth } from '../_layout';

const { width } = Dimensions.get('window');

export default function RiderDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  
  const {
    isOnline,
    toggleDutyStatus,
    currentOrder,
    incomingAlert,
    shiftMetrics,
    triggerDemoBroadcast
  } = useRiderStore();

  const [radarAnim] = useState(new Animated.Value(0.4));

  useEffect(() => {
    if (isOnline && !currentOrder) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(radarAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(radarAnim, {
            toValue: 0.4,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isOnline, currentOrder]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoMark}
            />
            <View>
              <Text style={styles.hubTag}>CENTRAL DISPATCH CONSOLE</Text>
              <Text style={styles.appTitle}>Rider Console</Text>
            </View>
          </View>

          <TouchableOpacity onPress={signOut} style={styles.signOutBtn} activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Duty Status Switch Card */}
        <View style={[styles.dutyCard, isOnline ? styles.dutyCardOnline : styles.dutyCardOffline]}>
          <View style={styles.dutyInfo}>
            <View style={[styles.dutyDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <View>
              <Text style={styles.dutyTitle}>
                {isOnline ? 'You are Online' : 'You are Offline'}
              </Text>
              <Text style={styles.dutySubtitle}>
                {isOnline 
                  ? 'Receiving priority dispatch calls in Koramangala Hub' 
                  : 'Flip switch to go on-duty and receive orders'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={() => toggleDutyStatus()}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Shift Metrics Bento Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>TODAY'S SHIFT METRICS</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(rider)/earnings')}
            style={styles.viewLedgerBtn}
          >
            <Text style={styles.viewLedgerText}>View Ledger</Text>
            <ChevronRight size={14} color="#FF5E00" />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          {/* Earnings Pill */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/(rider)/earnings')}
            activeOpacity={0.8}
          >
            <View style={styles.metricIconBgEarnings}>
              <TrendingUp size={16} color="#34C759" />
            </View>
            <Text style={styles.metricValue}>₹{shiftMetrics.todayEarnings}</Text>
            <Text style={styles.metricLabel}>Earned Today</Text>
          </TouchableOpacity>

          {/* Deliveries Completed Pill */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconBgOrders}>
              <ShoppingBag size={16} color="#FF7A29" />
            </View>
            <Text style={styles.metricValue}>{shiftMetrics.completedCount}</Text>
            <Text style={styles.metricLabel}>Drops Done</Text>
          </View>

          {/* Rating Pill */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconBgRating}>
              <Star size={16} color="#FAA307" fill="#FAA307" />
            </View>
            <Text style={styles.metricValue}>{shiftMetrics.rating}</Text>
            <Text style={styles.metricLabel}>Fleet Score</Text>
          </View>
        </View>

        {/* Active Order Card or Standby Radar */}
        {currentOrder ? (
          <View style={styles.activeOrderSection}>
            <View style={styles.activeOrderBanner}>
              <View style={styles.activeOrderHeaderRow}>
                <View style={styles.activeOrderBadge}>
                  <View style={styles.pulsingRedDot} />
                  <Text style={styles.activeOrderBadgeText}>ACTIVE TRIP ASSIGNMENT</Text>
                </View>
                <Text style={styles.activeOrderCode}>{currentOrder.short_code}</Text>
              </View>

              <Text style={styles.activeOrderTitle}>
                {currentOrder.status === 'ready_for_pickup' 
                  ? 'Step 1: Pick Up at Store Hub' 
                  : 'Step 2: En-Route to Customer'}
              </Text>
              <Text style={styles.activeOrderSubtitle}>
                {currentOrder.status === 'ready_for_pickup'
                  ? currentOrder.store_name
                  : currentOrder.customer_name}
              </Text>

              {/* Destination Pill */}
              <View style={styles.destPill}>
                <MapPin size={14} color="#FF5E00" />
                <Text style={styles.destPillText} numberOfLines={1}>
                  {currentOrder.status === 'ready_for_pickup' 
                    ? currentOrder.store_address 
                    : currentOrder.customer_address}
                </Text>
              </View>

              {/* Enter Console CTA */}
              <TouchableOpacity
                onPress={() => router.push('/(rider)/active-order')}
                style={styles.openConsoleBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.openConsoleBtnText}>Open Delivery Console</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Standby State with Radar Search */
          <View style={styles.standbySection}>
            <View style={styles.radarBox}>
              <Animated.View
                style={[
                  styles.radarCircleOuter,
                  {
                    transform: [{ scale: radarAnim }],
                    opacity: radarAnim.interpolate({
                      inputRange: [0.4, 1],
                      outputRange: [0.6, 0],
                    }),
                  },
                ]}
              />
              <View style={styles.radarCircleMid} />
              <View style={styles.radarCenterIcon}>
                <Radio size={24} color="#FF5E00" />
              </View>
            </View>

            <Text style={styles.standbyTitle}>
              {isOnline ? 'Standby for Dispatches' : 'Console is Offline'}
            </Text>
            <Text style={styles.standbyDesc}>
              {isOnline 
                ? 'High priority algorithms are matching nearby orders within 3.5 km.' 
                : 'Turn your status online to start receiving instant delivery orders.'}
            </Text>

            {/* Test Simulation Button */}
            {isOnline && (
              <TouchableOpacity
                onPress={triggerDemoBroadcast}
                style={styles.simulateBtn}
                activeOpacity={0.8}
              >
                <Zap size={15} color="#FF7A29" />
                <Text style={styles.simulateBtnText}>Simulate New Dispatch Alert</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Fleet Compliance & Safety Card */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyIconWrapper}>
            <ShieldCheck size={20} color="#34C759" />
          </View>
          <View style={styles.safetyContent}>
            <Text style={styles.safetyTitle}>Safety & Compliance Verified</Text>
            <Text style={styles.safetySubtitle}>
              Helmet check, driving license, and vehicle registration are active.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Incoming Order Alert Modal */}
      <OrderAlertModal 
        order={incomingAlert}
        onAccept={() => router.push('/(rider)/active-order')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F061F',
  },
  container: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  hubTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF7A29',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  signOutText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dutyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
  },
  dutyCardOnline: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderColor: 'rgba(52, 199, 89, 0.35)',
  },
  dutyCardOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dutyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  dutyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotOnline: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  dotOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dutyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dutySubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.7,
  },
  viewLedgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewLedgerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5E00',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E0E38',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'flex-start',
  },
  metricIconBgEarnings: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    padding: 6,
    borderRadius: 10,
    marginBottom: 8,
  },
  metricIconBgOrders: {
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
    padding: 6,
    borderRadius: 10,
    marginBottom: 8,
  },
  metricIconBgRating: {
    backgroundColor: 'rgba(250, 163, 7, 0.15)',
    padding: 6,
    borderRadius: 10,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  activeOrderSection: {
    marginBottom: 24,
  },
  activeOrderBanner: {
    backgroundColor: '#2A134D',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FF5E00',
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  activeOrderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activeOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 94, 0, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulsingRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5E00',
  },
  activeOrderBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF7A29',
    letterSpacing: 0.5,
  },
  activeOrderCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  activeOrderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activeOrderSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  destPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  destPillText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  openConsoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5E00',
    borderRadius: 14,
    paddingVertical: 13,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  openConsoleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  standbySection: {
    backgroundColor: '#1E0E38',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  radarBox: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  radarCircleOuter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#FF5E00',
    backgroundColor: 'rgba(255, 94, 0, 0.08)',
  },
  radarCircleMid: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.3)',
  },
  radarCenterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  standbyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  standbyDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.35)',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  simulateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A29',
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  safetyIconWrapper: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    padding: 8,
    borderRadius: 10,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  safetySubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },
});
