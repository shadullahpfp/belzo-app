import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Zap,
  Heart,
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  IndianRupee,
} from 'lucide-react-native';
import { useRiderStore } from '../../store/useRiderStore';

const { width } = Dimensions.get('window');

export default function RiderEarningsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { shiftMetrics, completedOrders } = useRiderStore();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shift Ledger & Earnings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Payout Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <TrendingUp size={12} color="#34C759" />
            <Text style={styles.heroBadgeText}>LIVE SHIFT ACCRUAL</Text>
          </View>

          <Text style={styles.heroEarnings}>₹{shiftMetrics.todayEarnings}</Text>
          <Text style={styles.heroSubtitle}>Total Credited for Today's Active Shift</Text>

          {/* Transparent Earnings Breakdown */}
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Award size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.breakdownLabel}>Base Pay</Text>
              </View>
              <Text style={styles.breakdownValue}>₹{shiftMetrics.basePay}</Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Zap size={12} color="#FF7A29" />
                <Text style={styles.breakdownLabel}>Surge Pay</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#FF7A29' }]}>
                ₹{shiftMetrics.surgePay}
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Heart size={12} color="#FF2D55" />
                <Text style={styles.breakdownLabel}>Tips</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#FF2D55' }]}>
                ₹{shiftMetrics.tips}
              </Text>
            </View>
          </View>
        </View>

        {/* Secondary KPI Stats */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <ShoppingBag size={16} color="#FF5E00" />
            <Text style={styles.kpiVal}>{shiftMetrics.completedCount}</Text>
            <Text style={styles.kpiLabel}>Deliveries</Text>
          </View>

          <View style={styles.kpiBox}>
            <MapPin size={16} color="#34C759" />
            <Text style={styles.kpiVal}>{shiftMetrics.totalDistanceKm} km</Text>
            <Text style={styles.kpiLabel}>Distance Done</Text>
          </View>

          <View style={styles.kpiBox}>
            <Calendar size={16} color="#FAA307" />
            <Text style={styles.kpiVal}>₹{(shiftMetrics.todayEarnings * 5.5).toFixed(0)}</Text>
            <Text style={styles.kpiLabel}>Weekly Est.</Text>
          </View>
        </View>

        {/* Completed Trips Ledger */}
        <View style={styles.ledgerSection}>
          <Text style={styles.ledgerTitle}>
            COMPLETED TRIPS TODAY ({completedOrders.length})
          </Text>

          <View style={styles.tripsList}>
            {completedOrders.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripLeft}>
                  <View style={styles.tripCheckDot}>
                    <ShoppingBag size={14} color="#34C759" />
                  </View>
                  <View>
                    <View style={styles.tripCodeRow}>
                      <Text style={styles.tripCode}>{trip.short_code}</Text>
                      <Text style={styles.tripTime}>• {trip.completed_at}</Text>
                    </View>
                    <Text style={styles.tripCustomer}>{trip.customer_name}</Text>
                    <Text style={styles.tripDistance}>{trip.distance} transit</Text>
                  </View>
                </View>

                <View style={styles.tripRight}>
                  <Text style={styles.tripPayout}>+₹{trip.payout}</Text>
                  <Text style={styles.tripSettled}>SETTLED</Text>
                </View>
              </View>
            ))}

            {completedOrders.length === 0 && (
              <View style={styles.emptyTrips}>
                <Text style={styles.emptyTripsText}>No deliveries completed yet today.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bank Settlement Footer Card */}
        <View style={styles.payoutScheduleCard}>
          <Text style={styles.scheduleTitle}>Weekly Automated Direct Deposit</Text>
          <Text style={styles.scheduleSubtitle}>
            Earnings are automatically credited every Monday morning directly to your verified HDFC bank account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F061F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#1E0E38',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    padding: 18,
  },
  heroCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.7,
  },
  heroEarnings: {
    fontSize: 42,
    fontWeight: '900',
    color: '#34C759',
    fontVariant: ['tabular-nums'],
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
    marginBottom: 20,
  },
  breakdownGrid: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 12,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#1E0E38',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  ledgerSection: {
    marginBottom: 20,
  },
  ledgerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.7,
    marginBottom: 12,
  },
  tripsList: {
    gap: 10,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E0E38',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tripCheckDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  tripTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  tripCustomer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  tripDistance: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 1,
  },
  tripRight: {
    alignItems: 'flex-end',
  },
  tripPayout: {
    fontSize: 16,
    fontWeight: '900',
    color: '#34C759',
    fontVariant: ['tabular-nums'],
  },
  tripSettled: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(52, 199, 89, 0.8)',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  emptyTrips: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTripsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  payoutScheduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  scheduleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
  },
});
