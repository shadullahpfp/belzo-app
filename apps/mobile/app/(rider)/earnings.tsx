import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
  MapPin,
} from 'lucide-react-native';
import { useRiderStore } from '../../store/useRiderStore';

export default function RiderEarningsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { shiftMetrics, completedOrders } = useRiderStore();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#111827" />
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
            <TrendingUp size={12} color="#047857" />
            <Text style={styles.heroBadgeText}>LIVE SHIFT ACCRUAL</Text>
          </View>

          <Text style={styles.heroEarnings}>₹{shiftMetrics.todayEarnings}</Text>
          <Text style={styles.heroSubtitle}>Total Credited for Today's Active Shift</Text>

          {/* Transparent Earnings Breakdown */}
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Award size={12} color="#6B7280" />
                <Text style={styles.breakdownLabel}>Base Pay</Text>
              </View>
              <Text style={styles.breakdownValue}>₹{shiftMetrics.basePay}</Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Zap size={12} color="#FF5E00" />
                <Text style={styles.breakdownLabel}>Surge Pay</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#FF5E00' }]}>
                ₹{shiftMetrics.surgePay}
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelRow}>
                <Heart size={12} color="#E11D48" />
                <Text style={styles.breakdownLabel}>Tips</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#E11D48' }]}>
                ₹{shiftMetrics.tips}
              </Text>
            </View>
          </View>
        </View>

        {/* Secondary KPI Stats (3-Card Layout) */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <ShoppingBag size={16} color="#FF5E00" />
            <Text style={styles.kpiVal}>{shiftMetrics.completedCount}</Text>
            <Text style={styles.kpiLabel}>Deliveries</Text>
          </View>

          <View style={styles.kpiBox}>
            <MapPin size={16} color="#047857" />
            <Text style={styles.kpiVal}>{shiftMetrics.totalDistanceKm} km</Text>
            <Text style={styles.kpiLabel}>Distance Done</Text>
          </View>

          <View style={styles.kpiBox}>
            <Calendar size={16} color="#D97706" />
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
                    <ShoppingBag size={14} color="#047857" />
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
            Earnings are automatically credited every Monday morning directly to your verified bank account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 18,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // squircle
    padding: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  heroEarnings: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    marginBottom: 18,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  ledgerSection: {
    marginBottom: 20,
  },
  ledgerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tripsList: {
    gap: 10,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tripCheckDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tripTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  tripCustomer: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  tripDistance: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  tripRight: {
    alignItems: 'flex-end',
  },
  tripPayout: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
    fontVariant: ['tabular-nums'],
  },
  tripSettled: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3,
  },
  emptyTrips: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  emptyTripsText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  payoutScheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 16,
  },
});
