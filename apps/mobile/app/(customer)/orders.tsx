import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  FileText,
  ChevronRight,
  X,
  CreditCard,
  MapPin
} from 'lucide-react-native';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../src/lib/supabase';

const { width } = Dimensions.get('window');

interface OrderSummary {
  id: string;
  short_code: string;
  created_at: string;
  status: 'placed' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  items_count: number;
  delivery_address: string;
  items: {
    id: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
}

const INITIAL_ORDERS: OrderSummary[] = [
  {
    id: 'ord-8492',
    short_code: 'BLZ-8492',
    created_at: 'Today, 17:30 PM',
    status: 'out_for_delivery',
    total_amount: 267,
    subtotal: 242,
    delivery_fee: 25,
    items_count: 3,
    delivery_address: 'Flat 402, Lotus Orchid, 5th Main, 4th Block Koramangala',
    items: [
      { id: 'p1', name: 'Farm Fresh Whole Milk', unit: '1 Litre Pouch', price: 62, quantity: 2 },
      { id: 'p2', name: 'Artisan Sourdough Loaf', unit: '400g Pack', price: 95, quantity: 1 },
      { id: 'p3', name: 'Belzo Cold Brew Coffee', unit: '250ml Can', price: 120, quantity: 1 }
    ]
  },
  {
    id: 'ord-8104',
    short_code: 'BLZ-8104',
    created_at: 'Yesterday, 14:15 PM',
    status: 'delivered',
    total_amount: 599,
    subtotal: 574,
    delivery_fee: 25,
    items_count: 1,
    delivery_address: 'Flat 402, Lotus Orchid, 5th Main, 4th Block Koramangala',
    items: [
      { id: 'p4', name: 'Alphonso Mango Box (Grade A)', unit: '6 Pieces (~1.5kg)', price: 599, quantity: 1 }
    ]
  },
  {
    id: 'ord-7940',
    short_code: 'BLZ-7940',
    created_at: '14 Feb 2026, 09:20 AM',
    status: 'delivered',
    total_amount: 340,
    subtotal: 315,
    delivery_fee: 25,
    items_count: 3,
    delivery_address: 'Flat 402, Lotus Orchid, 5th Main, 4th Block Koramangala',
    items: [
      { id: 'p1', name: 'Farm Fresh Whole Milk', unit: '1 Litre Pouch', price: 62, quantity: 1 },
      { id: 'p5', name: 'Avocado Hass Ready-to-Eat', unit: 'Pack of 2', price: 199, quantity: 1 },
      { id: 'p6', name: 'Baby Spinach Leaves', unit: '200g Box', price: 52, quantity: 1 }
    ]
  }
];

export default function OrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clearCart, addItem, updateQuantity } = useCartStore();

  const [orders, setOrders] = useState<OrderSummary[]>(INITIAL_ORDERS);
  const [selectedReceipt, setSelectedReceipt] = useState<OrderSummary | null>(null);

  // Sync Supabase orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped: OrderSummary[] = data.map((o: any) => ({
              id: o.id,
              short_code: `BLZ-${o.id.substring(0, 4).toUpperCase()}`,
              created_at: new Date(o.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),
              status: o.status || 'placed',
              total_amount: Number(o.total_amount) || 299,
              subtotal: (Number(o.total_amount) || 299) - 25,
              delivery_fee: 25,
              items_count: 2,
              delivery_address: o.delivery_address || 'Koramangala, Bengaluru',
              items: [
                { id: 'p1', name: 'Hyperlocal Speed Basket', unit: '1 Pack', price: (Number(o.total_amount) || 299) - 25, quantity: 1 }
              ]
            }));
            setOrders(mapped);
          }
        }
      } catch {
        // Fallback to initial mock orders
      }
    }
    loadOrders();
  }, []);

  const handleReorder = (order: OrderSummary) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    clearCart();
    order.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        unit: item.unit,
        price: item.price,
        mrp: item.price + 10,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      });
      if (item.quantity > 1) {
        updateQuantity(item.id, item.quantity);
      }
    });

    router.push('/(customer)/cart' as any);
  };

  const getStatusBadge = (status: OrderSummary['status']) => {
    switch (status) {
      case 'placed':
      case 'ready_for_pickup':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
            <Clock size={12} color="#FAA307" />
            <Text style={[styles.statusText, { color: '#FAA307' }]}>Packing</Text>
          </View>
        );
      case 'out_for_delivery':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeOrange]}>
            <Truck size={12} color="#FF7A29" />
            <Text style={[styles.statusText, { color: '#FF7A29' }]}>On the Way</Text>
          </View>
        );
      case 'delivered':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeGreen]}>
            <CheckCircle2 size={12} color="#34C759" />
            <Text style={[styles.statusText, { color: '#34C759' }]}>Delivered</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeRed]}>
            <XCircle size={12} color="#FF3B30" />
            <Text style={[styles.statusText, { color: '#FF3B30' }]}>Cancelled</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.replace('/(customer)/home' as any)}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History & Ledger</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionSubtitle}>
          Past and active quick-commerce orders from your nearby dark stores.
        </Text>

        <View style={styles.ordersList}>
          {orders.map((order) => {
            const isActive =
              order.status === 'placed' ||
              order.status === 'ready_for_pickup' ||
              order.status === 'out_for_delivery';

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderCode}>#{order.short_code}</Text>
                    <Text style={styles.orderDate}>{order.created_at}</Text>
                  </View>
                  {getStatusBadge(order.status)}
                </View>

                {/* Items preview snippet */}
                <View style={styles.itemsSnippet}>
                  <ShoppingBag size={14} color="#FF5E00" />
                  <Text style={styles.itemsSnippetText} numberOfLines={1}>
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </Text>
                </View>

                {/* Price & Address */}
                <View style={styles.cardMetaRow}>
                  <Text style={styles.totalPrice}>₹{order.total_amount}</Text>
                  <Text style={styles.itemsCountText}>{order.items_count} items</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  {isActive ? (
                    <TouchableOpacity
                      onPress={() => router.push(`/(customer)/track-order/${order.short_code}` as any)}
                      style={styles.trackLiveBtn}
                      activeOpacity={0.85}
                    >
                      <Truck size={15} color="#FFFFFF" />
                      <Text style={styles.trackLiveBtnText}>Track Live Order</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleReorder(order)}
                      style={styles.reorderBtn}
                      activeOpacity={0.8}
                    >
                      <RotateCcw size={14} color="#FFFFFF" />
                      <Text style={styles.reorderBtnText}>Reorder All Items</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => setSelectedReceipt(order)}
                    style={styles.receiptBtn}
                    activeOpacity={0.7}
                  >
                    <FileText size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.receiptBtnText}>Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Invoice & Receipt Modal */}
      {selectedReceipt && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <View>
                  <Text style={styles.receiptTitle}>Order Receipt</Text>
                  <Text style={styles.receiptSub}>#{selectedReceipt.short_code} • {selectedReceipt.created_at}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedReceipt(null)}
                  style={styles.closeBtn}
                >
                  <X size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.receiptScroll} showsVerticalScrollIndicator={false}>
                {/* Delivery destination */}
                <View style={styles.receiptSection}>
                  <Text style={styles.sectionLabel}>Delivered To</Text>
                  <Text style={styles.addressVal}>{selectedReceipt.delivery_address}</Text>
                </View>

                {/* Items */}
                <View style={styles.receiptSection}>
                  <Text style={styles.sectionLabel}>Itemized Products</Text>
                  {selectedReceipt.items.map((it, idx) => (
                    <View key={idx} style={styles.receiptItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.receiptItemName}>{it.name}</Text>
                        <Text style={styles.receiptItemSub}>
                          {it.unit} • Qty: {it.quantity}
                        </Text>
                      </View>
                      <Text style={styles.receiptItemPrice}>₹{it.price * it.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Bill Breakdown */}
                <View style={styles.billBox}>
                  <View style={styles.billLine}>
                    <Text style={styles.billLineKey}>Items Subtotal</Text>
                    <Text style={styles.billLineVal}>₹{selectedReceipt.subtotal}</Text>
                  </View>
                  <View style={styles.billLine}>
                    <Text style={styles.billLineKey}>Delivery Surge Fee</Text>
                    <Text style={styles.billLineVal}>₹{selectedReceipt.delivery_fee}</Text>
                  </View>
                  <View style={[styles.billLine, styles.billLineTotal]}>
                    <Text style={styles.billLineKeyTotal}>Grand Total Paid</Text>
                    <Text style={styles.billLineValTotal}>₹{selectedReceipt.total_amount}</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    padding: 18,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
  },
  ordersList: {
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  orderDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(250, 163, 7, 0.12)',
  },
  statusBadgeOrange: {
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
  },
  statusBadgeGreen: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  statusBadgeRed: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemsSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  itemsSnippetText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    flex: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  itemsCountText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trackLiveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5E00',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  trackLiveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reorderBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.35)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  reorderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF7A29',
  },
  receiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  receiptBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 4, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
    maxHeight: '80%',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  receiptTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  receiptSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptScroll: {
    maxHeight: 380,
  },
  receiptSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7A29',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  addressVal: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  receiptItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  receiptItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  receiptItemSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 1,
  },
  receiptItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  billBox: {
    paddingTop: 12,
    gap: 6,
  },
  billLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLineKey: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  billLineVal: {
    fontSize: 12,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  billLineTotal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  billLineKeyTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  billLineValTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF5E00',
    fontVariant: ['tabular-nums'],
  },
});
