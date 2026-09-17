import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Linking,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bike,
  Building2,
  Home,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Star,
  Sparkles,
  Zap
} from 'lucide-react-native';
import { supabase } from '../../../src/lib/supabase';

const { width } = Dimensions.get('window');

type OrderStatus = 'placed' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered';

interface LiveOrderDetails {
  id: string;
  short_code: string;
  status: OrderStatus;
  store_name: string;
  store_address: string;
  customer_name: string;
  customer_address: string;
  delivery_pin: string;
  rider_name: string;
  rider_phone: string;
  rider_rating: number;
  rider_vehicle: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  created_at: string;
  items: { name: string; unit: string; quantity: number; price: number }[];
}

export default function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = params.id || 'BLZ-8492';

  const [order, setOrder] = useState<LiveOrderDetails>({
    id: orderId,
    short_code: orderId.startsWith('BLZ-') ? orderId : `BLZ-${orderId.substring(0, 4).toUpperCase()}`,
    status: 'out_for_delivery',
    store_name: 'Belzo Central Hub 01 (Koramangala)',
    store_address: '80 Feet Road, 4th Block Koramangala',
    customer_name: 'Ananya Deshmukh',
    customer_address: 'Flat 402, Lotus Orchid, 5th Main, 4th Block Koramangala',
    delivery_pin: '4421',
    rider_name: 'Suresh Kumar',
    rider_phone: '+91 98450 11223',
    rider_rating: 4.95,
    rider_vehicle: 'KA-01-EQ-9421 (EV Scooter)',
    payment_method: 'Prepaid UPI (Google Pay)',
    subtotal: 242,
    delivery_fee: 25,
    total_amount: 267,
    created_at: '6 mins ago',
    items: [
      { name: 'Farm Fresh Whole Milk', unit: '1 Litre Pouch', quantity: 2, price: 62 },
      { name: 'Artisan Sourdough Loaf', unit: '400g Pack', quantity: 1, price: 95 },
      { name: 'Belzo Cold Brew Coffee', unit: '250ml Can', quantity: 1, price: 120 }
    ]
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(372); // ~6 mins
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  // Animations
  const riderProgressAnim = useRef(new Animated.Value(0.75)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Realtime Supabase Channel Listener
  useEffect(() => {
    async function fetchOrderData() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, dark_stores(name, address)')
          .eq('id', orderId)
          .single();

        if (!error && data) {
          setOrder((prev) => ({
            ...prev,
            status: (data.status as OrderStatus) || prev.status,
            delivery_pin: data.delivery_pin || prev.delivery_pin,
            total_amount: Number(data.total_amount) || prev.total_amount,
            customer_address: data.delivery_address || prev.customer_address,
            store_name: data.dark_stores?.name || prev.store_name,
            store_address: data.dark_stores?.address || prev.store_address,
          }));
        }
      } catch {
        // Mock fallback
      }
    }

    fetchOrderData();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel(`order-track-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.status) {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}

            const nextStatus = payload.new.status as OrderStatus;
            setOrder((prev) => ({ ...prev, status: nextStatus }));

            if (nextStatus === 'delivered') {
              setShowRatingModal(true);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Elapsed Timer & Beacon Animation
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(timer);
  }, []);

  // Update progress bar based on status
  useEffect(() => {
    let target = 0.15;
    if (order.status === 'ready_for_pickup') target = 0.4;
    if (order.status === 'out_for_delivery') target = 0.75;
    if (order.status === 'delivered') target = 1.0;

    Animated.timing(riderProgressAnim, {
      toValue: target,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [order.status]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCallRider = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    Linking.openURL(`tel:${order.rider_phone}`);
  };

  // Dev state cycler for demo testing
  const handleCycleStatus = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const stages: OrderStatus[] = ['placed', 'ready_for_pickup', 'out_for_delivery', 'delivered'];
    const nextIdx = (stages.indexOf(order.status) + 1) % stages.length;
    const nextStatus = stages[nextIdx];
    setOrder((prev) => ({ ...prev, status: nextStatus }));

    if (nextStatus === 'delivered') {
      setShowRatingModal(true);
    }
  };

  const getStatusText = () => {
    switch (order.status) {
      case 'placed':
        return 'Order Received by Dark Store';
      case 'ready_for_pickup':
        return 'Packed & Sealing Dispatch Bag';
      case 'out_for_delivery':
        return 'Rider En-Route (Arriving in ~4 mins)';
      case 'delivered':
        return 'Order Delivered to Doorstep 🎉';
    }
  };

  return (
    <View style={styles.screen}>
      {/* Translucent Apple Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.replace('/(customer)/home' as any)}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarSub}>HYPERLOCAL TELEMETRY</Text>
          <Text style={styles.orderCodePill}>#{order.short_code}</Text>
        </View>

        <View style={styles.elapsedBox}>
          <Clock size={12} color="#FF7A29" />
          <Text style={styles.elapsedText}>{formatElapsed(elapsedSeconds)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Visual Route Corridor Canvas */}
        <View style={styles.canvasCard}>
          <View style={styles.canvasHeader}>
            <View style={styles.liveBeaconBadge}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.liveBeaconText}>LIVE GPS CORRIDOR</Text>
            </View>
            <TouchableOpacity onPress={handleCycleStatus} style={styles.demoCycleBtn}>
              <Zap size={11} color="#FF7A29" />
              <Text style={styles.demoCycleBtnText}>Simulate Next Stage</Text>
            </TouchableOpacity>
          </View>

          {/* Route Map Graphic Line */}
          <View style={styles.routeGraphicContainer}>
            {/* Progress Track Background */}
            <View style={styles.routeTrackBg} />
            <Animated.View
              style={[
                styles.routeTrackActive,
                {
                  width: riderProgressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />

            {/* Store Hub Node */}
            <View style={styles.hubNode}>
              <Building2 size={16} color="#FFFFFF" />
            </View>

            {/* Rider Beacon Position */}
            <Animated.View
              style={[
                styles.riderNode,
                {
                  left: riderProgressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['6%', '84%'],
                  }),
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.riderPulseRing,
                  { transform: [{ scale: pulseAnim }], opacity: 0.6 },
                ]}
              />
              <Bike size={18} color="#FFFFFF" />
            </Animated.View>

            {/* Customer House Node */}
            <View style={styles.customerNode}>
              <Home size={16} color="#FFFFFF" />
            </View>
          </View>

          {/* Hub and Customer Labels */}
          <View style={styles.routeLabelsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nodeLabelTitle}>Dark Store Hub</Text>
              <Text style={styles.nodeLabelSub} numberOfLines={1}>
                {order.store_name}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.nodeLabelTitle}>Your Doorstep</Text>
              <Text style={styles.nodeLabelSub} numberOfLines={1}>
                {order.customer_address}
              </Text>
            </View>
          </View>
        </View>

        {/* 4-Stage Delivery Milestone Tracker */}
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneHeadline}>{getStatusText()}</Text>
          <Text style={styles.milestoneSubhead}>
            10-minute speed guarantee powered by Belzo Hyperlocal Fleet
          </Text>

          <View style={styles.stepsRow}>
            {/* Step 1: Placed */}
            <View style={styles.stepCol}>
              <View
                style={[
                  styles.stepDot,
                  order.status === 'placed' ||
                  order.status === 'ready_for_pickup' ||
                  order.status === 'out_for_delivery' ||
                  order.status === 'delivered'
                    ? styles.stepDotDone
                    : styles.stepDotInactive,
                ]}
              >
                <CheckCircle2 size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTitle}>Placed</Text>
            </View>

            <View style={styles.stepLine} />

            {/* Step 2: Packed */}
            <View style={styles.stepCol}>
              <View
                style={[
                  styles.stepDot,
                  order.status === 'ready_for_pickup' ||
                  order.status === 'out_for_delivery' ||
                  order.status === 'delivered'
                    ? styles.stepDotDone
                    : styles.stepDotInactive,
                ]}
              >
                <CheckCircle2 size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTitle}>Packed</Text>
            </View>

            <View style={styles.stepLine} />

            {/* Step 3: On The Way */}
            <View style={styles.stepCol}>
              <View
                style={[
                  styles.stepDot,
                  order.status === 'out_for_delivery' || order.status === 'delivered'
                    ? styles.stepDotActivePulse
                    : styles.stepDotInactive,
                ]}
              >
                <Bike size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTitle}>On the Way</Text>
            </View>

            <View style={styles.stepLine} />

            {/* Step 4: Arrived */}
            <View style={styles.stepCol}>
              <View
                style={[
                  styles.stepDot,
                  order.status === 'delivered' ? styles.stepDotDone : styles.stepDotInactive,
                ]}
              >
                <CheckCircle2 size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTitle}>Arrived</Text>
            </View>
          </View>
        </View>

        {/* High-Visibility Delivery PIN Card */}
        <View style={styles.pinCard}>
          <View style={styles.pinHeaderRow}>
            <ShieldCheck size={18} color="#FF5E00" />
            <Text style={styles.pinHeaderTitle}>DELIVERY VERIFICATION PIN</Text>
          </View>

          <Text style={styles.pinDigits}>{order.delivery_pin}</Text>

          <Text style={styles.pinInstructions}>
            Share this 4-digit code with your courier partner only when you inspect and receive your
            order.
          </Text>
        </View>

        {/* Courier Telemetry Card */}
        {(order.status === 'out_for_delivery' || order.status === 'ready_for_pickup') && (
          <View style={styles.courierCard}>
            <View style={styles.courierAvatar}>
              <Text style={styles.courierInitials}>{order.rider_name.charAt(0)}</Text>
            </View>

            <View style={styles.courierInfo}>
              <View style={styles.courierNameRow}>
                <Text style={styles.courierName}>{order.rider_name}</Text>
                <View style={styles.ratingBadge}>
                  <Star size={11} color="#FAA307" fill="#FAA307" />
                  <Text style={styles.ratingText}>{order.rider_rating}</Text>
                </View>
              </View>
              <Text style={styles.courierVehicle}>{order.rider_vehicle}</Text>
              <Text style={styles.courierSla}>Speed partner assigned for your block</Text>
            </View>

            <TouchableOpacity onPress={handleCallRider} style={styles.callRiderBtn} activeOpacity={0.8}>
              <Phone size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Expandable Order Items Drawer */}
        <View style={styles.drawerCard}>
          <TouchableOpacity
            onPress={() => setItemsExpanded(!itemsExpanded)}
            style={styles.drawerHeader}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.drawerTitle}>
                Order Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)} items)
              </Text>
              <Text style={styles.drawerSubtitle}>{order.payment_method}</Text>
            </View>
            <View style={styles.drawerPriceGroup}>
              <Text style={styles.drawerPrice}>₹{order.total_amount}</Text>
              {itemsExpanded ? (
                <ChevronUp size={18} color="rgba(255,255,255,0.6)" />
              ) : (
                <ChevronDown size={18} color="rgba(255,255,255,0.6)" />
              )}
            </View>
          </TouchableOpacity>

          {itemsExpanded && (
            <View style={styles.drawerBody}>
              {order.items.map((it, idx) => (
                <View key={idx} style={styles.drawerItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{it.name}</Text>
                    <Text style={styles.itemUnit}>
                      {it.unit} • Qty: {it.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{it.price * it.quantity}</Text>
                </View>
              ))}

              <View style={styles.billSplit}>
                <View style={styles.billRow}>
                  <Text style={styles.billKey}>Item Total</Text>
                  <Text style={styles.billVal}>₹{order.subtotal}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billKey}>Delivery Surge Fee</Text>
                  <Text style={styles.billVal}>₹{order.delivery_fee}</Text>
                </View>
                <View style={[styles.billRow, styles.billRowTotal]}>
                  <Text style={styles.billKeyTotal}>Total Paid</Text>
                  <Text style={styles.billValTotal}>₹{order.total_amount}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Celebratory Rating Modal */}
      <Modal visible={showRatingModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.celebrateIcon}>
              <Sparkles size={28} color="#FF5E00" />
            </View>

            <Text style={styles.modalTitle}>Delivery Completed! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              Your Belzo speed pack has arrived. How was your delivery experience with {order.rider_name}?
            </Text>

            {/* 5-Star Rating Buttons */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  style={styles.starTouch}
                >
                  <Star
                    size={32}
                    color="#FAA307"
                    fill={star <= selectedRating ? '#FAA307' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowRatingModal(false);
                router.replace('/(customer)/home' as any);
              }}
              style={styles.submitRatingBtn}
            >
              <Text style={styles.submitRatingBtnText}>Submit & Return Home</Text>
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
    backgroundColor: '#0F061F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#1E0E38',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF7A29',
    letterSpacing: 0.6,
  },
  orderCodePill: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  elapsedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.3)',
  },
  elapsedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7A29',
    fontVariant: ['tabular-nums'],
  },
  content: {
    padding: 18,
  },
  canvasCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  canvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  liveBeaconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  liveBeaconText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.6,
  },
  demoCycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  demoCycleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF7A29',
  },
  routeGraphicContainer: {
    height: 52,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  routeTrackBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    marginHorizontal: 16,
  },
  routeTrackActive: {
    position: 'absolute',
    left: 16,
    height: 4,
    backgroundColor: '#FF5E00',
    borderRadius: 2,
  },
  hubNode: {
    position: 'absolute',
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A134D',
    borderWidth: 2,
    borderColor: '#FF5E00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderNode: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5E00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  riderPulseRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FF5E00',
  },
  customerNode: {
    position: 'absolute',
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  nodeLabelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
  },
  nodeLabelSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  milestoneCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  milestoneHeadline: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  milestoneSubhead: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
    marginBottom: 18,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDotDone: {
    backgroundColor: '#34C759',
  },
  stepDotActivePulse: {
    backgroundColor: '#FF5E00',
  },
  stepDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 18,
  },
  pinCard: {
    backgroundColor: '#2A134D',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FF5E00',
    alignItems: 'center',
    marginBottom: 16,
  },
  pinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pinHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7A29',
    letterSpacing: 0.8,
  },
  pinDigits: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 8,
    marginVertical: 4,
  },
  pinInstructions: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E0E38',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    gap: 12,
  },
  courierAvatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 94, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courierInitials: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF5E00',
  },
  courierInfo: {
    flex: 1,
  },
  courierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courierName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(250, 163, 7, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FAA307',
  },
  courierVehicle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  courierSla: {
    fontSize: 10,
    color: '#34C759',
    marginTop: 2,
  },
  callRiderBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  drawerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  drawerPriceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  drawerBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemUnit: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  billSplit: {
    paddingTop: 12,
    gap: 6,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billKey: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  billVal: {
    fontSize: 12,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  billRowTotal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  billKeyTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  billValTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF5E00',
    fontVariant: ['tabular-nums'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 4, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  celebrateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 94, 0, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  starTouch: {
    padding: 4,
  },
  submitRatingBtn: {
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
  },
  submitRatingBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
