import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Image,
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  TrendingUp,
  Star,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Radio,
  ChevronRight,
  ShieldCheck,
  Zap,
  Edit2,
  Bike,
  User,
  Check,
  X,
} from 'lucide-react-native';
import { useRiderStore, RiderOrder } from '../../store/useRiderStore';
import { OrderAlertModal } from '../../components/rider/OrderAlertModal';
import { useAuth } from '../_layout';
import { supabase } from '../../src/lib/supabase';

export default function RiderDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, profile, rider, updateProfile, updateRiderDetails } = useAuth();
  
  const {
    isOnline,
    toggleDutyStatus,
    currentOrder,
    incomingAlert,
    setIncomingAlert,
    shiftMetrics,
    triggerDemoBroadcast,
  } = useRiderStore();

  const [radarAnim] = useState(new Animated.Value(0.4));
  const [liveShiftMetrics, setLiveShiftMetrics] = useState({
    todayEarnings: shiftMetrics.todayEarnings || 0,
    completedCount: shiftMetrics.completedCount || 0,
  });

  const [isEditRiderModalOpen, setIsEditRiderModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editVehicleNumber, setEditVehicleNumber] = useState(rider?.vehicle_number || 'UP-71-AB-1234');
  const [editVehicleType, setEditVehicleType] = useState(rider?.vehicle_type || 'Motorcycle');
  const [isSavingRider, setIsSavingRider] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setEditName(profile.full_name);
    if (rider?.vehicle_number) setEditVehicleNumber(rider.vehicle_number);
    if (rider?.vehicle_type) setEditVehicleType(rider.vehicle_type);
  }, [profile, rider]);

  const handleSaveRider = async () => {
    setIsSavingRider(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (editName.trim()) {
      await updateProfile({ full_name: editName.trim() });
    }
    await updateRiderDetails({
      vehicle_number: editVehicleNumber.trim() || 'UP-71-AB-1234',
      vehicle_type: editVehicleType || 'Motorcycle',
    });

    setIsSavingRider(false);
    setIsEditRiderModalOpen(false);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  // Calculate live shift metrics from delivered orders
  const refreshShiftMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, delivery_fee, total_amount, status')
        .eq('status', 'delivered');

      if (!error && data) {
        const count = data.length;
        const earnings = data.reduce((sum, o) => sum + (Number(o.delivery_fee) || 45), 0);
        setLiveShiftMetrics({
          todayEarnings: earnings > 0 ? earnings : 1240,
          completedCount: count > 0 ? count : 9,
        });
      }
    } catch {}
  };

  useEffect(() => {
    refreshShiftMetrics();

    // Supabase Realtime listener on orders for incoming dispatch calls (ready_for_pickup)
    const channel = supabase
      .channel('rider-live-dispatch-listener')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload: any) => {
          const newRow = payload.new;
          if (newRow?.status === 'delivered') {
            refreshShiftMetrics();
          }

          if (newRow && newRow.status === 'ready_for_pickup' && isOnline && !currentOrder) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}

            let custAddr = 'Ward No. 4, Shahbajpur, Joniha, Bindki';
            if (newRow.delivery_address) {
              if (typeof newRow.delivery_address === 'string') {
                try {
                  const p = JSON.parse(newRow.delivery_address);
                  custAddr = [p.house_flat_no, p.apartment_road_area, p.city].filter(Boolean).join(', ') || custAddr;
                } catch {
                  custAddr = newRow.delivery_address;
                }
              } else {
                custAddr = [
                  newRow.delivery_address.house_flat_no,
                  newRow.delivery_address.apartment_road_area,
                  newRow.delivery_address.city,
                ].filter(Boolean).join(', ') || custAddr;
              }
            }

            const alertPayload: RiderOrder = {
              id: newRow.id,
              short_code: newRow.order_number
                ? `BLZ-${newRow.order_number}`
                : `BLZ-${newRow.id.substring(0, 4).toUpperCase()}`,
              status: 'ready_for_pickup',
              store_name: 'Belzo Joniha Central Hub 01',
              store_address: 'Joniha Chauraha, Bindki Road, Fatehpur (212635)',
              store_phone: '+91 98765 00001',
              store_latitude: 26.0350,
              store_longitude: 80.4650,
              customer_name: 'Customer',
              customer_phone: '+91 98765 11223',
              customer_address: custAddr,
              customer_latitude: 26.0365,
              customer_longitude: 80.4672,
              delivery_notes: 'Leave at doorstep if unavailable',
              delivery_pin: newRow.delivery_pin || '4421',
              payout: Number(newRow.delivery_fee) || 65,
              distance_to_store: '0.8 km',
              distance_to_customer: '1.4 km',
              items: [
                { name: 'Dispatched Grocery Items', unit: '1 Bag', quantity: 1, checked: false },
              ],
            };

            setIncomingAlert(alertPayload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, currentOrder]);

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

  const handleToggleDuty = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await toggleDutyStatus();
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoMark}
            />
            <View>
              <Text style={styles.hubTag}>COURIER DISPATCH CONSOLE</Text>
              <Text style={styles.appTitle}>Belzo Courier</Text>
            </View>
          </View>

          <TouchableOpacity onPress={signOut} style={styles.signOutBtn} activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Rider Identity & Fleet Profile Card */}
        <View style={styles.riderProfileCard}>
          <View style={styles.riderAvatarBox}>
            <Text style={styles.riderAvatarText}>
              {profile?.full_name?.trim() ? profile.full_name.trim().charAt(0).toUpperCase() : 'R'}
            </Text>
          </View>

          <View style={styles.riderProfileInfo}>
            <View style={styles.riderNameRow}>
              <Text style={styles.riderNameText}>
                {profile?.full_name || 'Fleet Partner'}
              </Text>
              <View style={styles.fleetRatingBadge}>
                <Star size={11} color="#D97706" fill="#D97706" />
                <Text style={styles.fleetRatingText}>{rider?.rating || '4.95'}</Text>
              </View>
            </View>

            <Text style={styles.riderVehicleText}>
              {rider?.vehicle_number || 'UP-71-AB-1234'} • {rider?.vehicle_type || 'Motorcycle'}
            </Text>
            <Text style={styles.riderHubText}>Joniha Central Hub • Active Courier</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsEditRiderModalOpen(true)}
            style={styles.editRiderBtn}
            activeOpacity={0.7}
          >
            <Edit2 size={16} color="#FF5E00" />
          </TouchableOpacity>
        </View>

        {/* Duty Switch Card (Pure White Squircle) */}
        <View style={styles.dutyCard}>
          <View style={styles.dutyInfo}>
            <View style={[styles.beaconDot, isOnline ? styles.beaconOnline : styles.beaconOffline]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.dutyTitle}>
                {isOnline ? 'You are Online' : 'You are Offline'}
              </Text>
              <Text style={styles.dutySubtitle}>
                {isOnline 
                  ? 'Receiving priority dispatch calls in Joniha Central Hub' 
                  : 'Flip switch to go on-duty and receive orders'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleDuty}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Shift Metrics Bento Grid (3-Card Layout) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>TODAY'S SHIFT METRICS</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(rider)/earnings')}
            style={styles.viewLedgerBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.viewLedgerText}>View Ledger</Text>
            <ChevronRight size={14} color="#FF5E00" />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          {/* Earnings Card */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/(rider)/earnings')}
            activeOpacity={0.85}
          >
            <View style={styles.metricIconBgEarnings}>
              <TrendingUp size={16} color="#047857" />
            </View>
            <Text style={styles.metricValue}>₹{liveShiftMetrics.todayEarnings || shiftMetrics.todayEarnings || 1240}</Text>
            <Text style={styles.metricLabel}>Earned Today</Text>
          </TouchableOpacity>

          {/* Deliveries Completed Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconBgOrders}>
              <ShoppingBag size={16} color="#FF5E00" />
            </View>
            <Text style={styles.metricValue}>{liveShiftMetrics.completedCount || shiftMetrics.completedCount || 9}</Text>
            <Text style={styles.metricLabel}>Deliveries</Text>
          </View>

          {/* Rating Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricIconBgRating}>
              <Star size={16} color="#D97706" fill="#D97706" />
            </View>
            <Text style={styles.metricValue}>{rider?.rating || shiftMetrics.rating || '4.95'}</Text>
            <Text style={styles.metricLabel}>Fleet Rating</Text>
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
                <Text style={styles.activeOrderCode}>#{currentOrder.short_code}</Text>
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
                activeOpacity={0.9}
              >
                <Text style={styles.openConsoleBtnText}>Open Delivery Console</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Standby Container: Soft gray radar container */
          <View style={styles.standbySection}>
            <View style={styles.radarBox}>
              <Animated.View
                style={[
                  styles.radarCircleOuter,
                  {
                    transform: [{ scale: radarAnim }],
                    opacity: radarAnim.interpolate({
                      inputRange: [0.4, 1],
                      outputRange: [0.5, 0],
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
              {isOnline ? 'Waiting for nearby store dispatch calls...' : 'Console is Offline'}
            </Text>
            <Text style={styles.standbyDesc}>
              {isOnline 
                ? 'High-priority dispatch algorithms are matching store orders within 5.0 KM.' 
                : 'Turn your status online to start receiving instant delivery dispatches.'}
            </Text>
          </View>
        )}

        {/* Fleet Compliance & Safety Card */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyIconWrapper}>
            <ShieldCheck size={20} color="#047857" />
          </View>
          <View style={styles.safetyContent}>
            <Text style={styles.safetyTitle}>Safety & Compliance Active</Text>
            <Text style={styles.safetySubtitle}>
              Helmet check, driving license, and vehicle registration verified.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Incoming Order Alert Modal */}
      <OrderAlertModal 
        order={incomingAlert}
        onAccept={() => router.push('/(rider)/active-order')}
      />

      {/* Edit Rider Profile Modal */}
      <Modal
        visible={isEditRiderModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditRiderModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleGroup}>
                <Bike size={20} color="#FF5E00" />
                <Text style={styles.modalTitleText}>Edit Courier Profile</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditRiderModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubText}>
              Update your courier identity and vehicle registration for Joniha Central Hub.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.inputFieldLabel}>FULL NAME</Text>
              <View style={styles.inputBox}>
                <User size={16} color="#FF5E00" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInputField}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g. Vikram Singh"
                  placeholderTextColor="#A0A0A5"
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.inputFieldLabel}>VEHICLE NUMBER</Text>
              <View style={styles.inputBox}>
                <Bike size={16} color="#FF5E00" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInputField}
                  value={editVehicleNumber}
                  onChangeText={setEditVehicleNumber}
                  placeholder="UP-71-AB-1234"
                  placeholderTextColor="#A0A0A5"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.inputFieldLabel}>VEHICLE TYPE</Text>
              <View style={styles.vehicleTypeRow}>
                {['Motorcycle', 'Scooter', 'EV Bike', 'Bicycle'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setEditVehicleType(type)}
                    style={[
                      styles.vehicleTypeChip,
                      editVehicleType === type && styles.vehicleTypeChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.vehicleTypeChipText,
                        editVehicleType === type && styles.vehicleTypeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveRider}
              disabled={isSavingRider}
              style={[styles.saveRiderBtn, isSavingRider && { opacity: 0.7 }]}
              activeOpacity={0.88}
            >
              {isSavingRider ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.btnRow}>
                  <Check size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveRiderBtnText}>Save Fleet Details</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  riderProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  riderAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  riderAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5E00',
  },
  riderProfileInfo: {
    flex: 1,
  },
  riderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  riderNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  fleetRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  fleetRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  riderVehicleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 1,
  },
  riderHubText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  editRiderBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 46,
  },
  textInputField: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vehicleTypeChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF5E00',
  },
  vehicleTypeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  vehicleTypeChipTextActive: {
    color: '#FF5E00',
    fontWeight: '700',
  },
  saveRiderBtn: {
    backgroundColor: '#FF5E00',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveRiderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  container: {
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827', // text-gray-900
    letterSpacing: -0.3,
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  dutyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 24, // rounded-3xl squircle
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  dutyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  beaconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  beaconOnline: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  beaconOffline: {
    backgroundColor: '#8E8E93',
  },
  dutyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  dutySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  viewLedgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewLedgerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5E00',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22, // rounded-3xl squircle
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  metricIconBgEarnings: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricIconBgOrders: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricIconBgRating: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  activeOrderSection: {
    marginBottom: 20,
  },
  activeOrderBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // squircle
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeOrderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activeOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulsingRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
  },
  activeOrderBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  activeOrderCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  activeOrderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  activeOrderSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  destPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 14,
  },
  destPillText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  openConsoleBtn: {
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
  openConsoleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  standbySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // squircle
    padding: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  radarBox: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  radarCircleOuter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
  },
  radarCircleMid: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 94, 0, 0.08)',
  },
  radarCenterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  standbyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  standbyDesc: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 16,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  safetyIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  safetySubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
    lineHeight: 15,
  },
});
