import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
  X,
  CreditCard,
  MapPin,
} from 'lucide-react-native';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../src/lib/supabase';

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
    delivery_address: 'Ward No. 4, Shahbajpur, Joniha, Bindki',
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
    delivery_address: 'Ward No. 4, Shahbajpur, Joniha, Bindki',
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
    delivery_address: 'Ward No. 4, Shahbajpur, Joniha, Bindki',
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
        const { data: { session } } = await supabase.auth.getSession();
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (session?.user?.id) {
          query = query.eq('customer_id', session.user.id);
        } else {
          query = query.limit(10);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: OrderSummary[] = data.map((o: any) => {
            const parsedItems = (o.order_items || []).map((it: any) => ({
              id: it.id || it.product_id || 'p-1',
              name: it.product_name_snapshot || 'Item',
              unit: '1 unit',
              price: Number(it.unit_price) || 50,
              quantity: Number(it.quantity) || 1,
            }));

            let addressStr = 'Ward No. 4, Shahbajpur, Joniha, Bindki';
            if (o.delivery_address) {
              if (typeof o.delivery_address === 'string') {
                addressStr = o.delivery_address;
              } else {
                addressStr = [o.delivery_address.house_flat_no, o.delivery_address.apartment_road_area, o.delivery_address.city].filter(Boolean).join(', ') || addressStr;
              }
            }

            return {
              id: o.id,
              short_code: o.order_number ? `BLZ-${o.order_number}` : `BLZ-${o.id.substring(0, 4).toUpperCase()}`,
              created_at: new Date(o.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),
              status: o.status || 'placed',
              total_amount: Number(o.total_amount) || 299,
              subtotal: (Number(o.total_amount) || 299) - (Number(o.delivery_fee) || 25),
              delivery_fee: Number(o.delivery_fee) || 25,
              items_count: parsedItems.length || 1,
              delivery_address: addressStr,
              items: parsedItems.length > 0 ? parsedItems : [
                { id: 'p1', name: 'Hyperlocal Speed Basket', unit: '1 Pack', price: (Number(o.total_amount) || 299) - 25, quantity: 1 }
              ],
            };
          });
          setOrders(mapped);
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
          <View style={[styles.statusBadge, styles.statusBadgeAmber]}>
            <Clock size={11} color="#B45309" />
            <Text style={styles.statusTextAmber}>Packing</Text>
          </View>
        );
      case 'out_for_delivery':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeAmber]}>
            <Truck size={11} color="#B45309" />
            <Text style={styles.statusTextAmber}>On the Way</Text>
          </View>
        );
      case 'delivered':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeEmerald]}>
            <CheckCircle2 size={11} color="#047857" />
            <Text style={styles.statusTextEmerald}>Delivered</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeRed]}>
            <XCircle size={11} color="#B91C1C" />
            <Text style={styles.statusTextRed}>Cancelled</Text>
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
          <ArrowLeft size={20} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History & Invoices</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionSubtitle}>
          Past and active quick-commerce orders from your nearby Joniha hub.
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

                {/* Price & Items Meta */}
                <View style={styles.cardMetaRow}>
                  <Text style={styles.totalPrice}>₹{order.total_amount}</Text>
                  <Text style={styles.itemsCountText}>{order.items_count} items</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  {isActive ? (
                    <TouchableOpacity
                      onPress={() => router.push(`/(customer)/track-order/${order.id || order.short_code}` as any)}
                      style={styles.trackLiveBtn}
                      activeOpacity={0.9}
                    >
                      <Truck size={15} color="#FFFFFF" />
                      <Text style={styles.trackLiveBtnText}>Track Live Order</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleReorder(order)}
                      style={styles.reorderBtn}
                      activeOpacity={0.85}
                    >
                      <RotateCcw size={14} color="#FF5E00" />
                      <Text style={styles.reorderBtnText}>Reorder Items</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => setSelectedReceipt(order)}
                    style={styles.receiptBtn}
                    activeOpacity={0.85}
                  >
                    <FileText size={14} color="#374151" />
                    <Text style={styles.receiptBtnText}>Download Receipt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Invoice / Receipt Modal */}
      {selectedReceipt && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.receiptModalCard}>
              <View style={styles.receiptHeader}>
                <View>
                  <Text style={styles.receiptModalTitle}>Order Invoice</Text>
                  <Text style={styles.receiptModalSub}>#{selectedReceipt.short_code}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                  <X size={20} color="#1C1C1E" />
                </TouchableOpacity>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptMetaLabel}>Date & Time:</Text>
                <Text style={styles.receiptMetaVal}>{selectedReceipt.created_at}</Text>
              </View>
              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptMetaLabel}>Store Hub:</Text>
                <Text style={styles.receiptMetaVal}>Belzo Joniha Central Hub 01</Text>
              </View>
              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptMetaLabel}>Delivery To:</Text>
                <Text style={styles.receiptMetaVal} numberOfLines={1}>
                  {selectedReceipt.delivery_address}
                </Text>
              </View>

              <View style={styles.receiptItemsList}>
                {selectedReceipt.items.map((it, idx) => (
                  <View key={idx} style={styles.receiptItemRow}>
                    <Text style={styles.receiptItemName}>
                      {it.quantity}x {it.name}
                    </Text>
                    <Text style={styles.receiptItemPrice}>₹{it.price * it.quantity}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptTotalRow}>
                <Text style={styles.receiptTotalLabel}>Grand Total (Incl. Taxes)</Text>
                <Text style={styles.receiptTotalVal}>₹{selectedReceipt.total_amount}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedReceipt(null)}
                style={styles.closeReceiptBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.closeReceiptBtnText}>Done</Text>
              </TouchableOpacity>
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
    color: '#1C1C1E',
  },
  content: {
    padding: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 14,
    lineHeight: 18,
  },
  ordersList: {
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // rounded-3xl
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: '700', // font-bold
    color: '#111827', // text-gray-900
    fontVariant: ['tabular-nums'],
  },
  orderDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  statusBadgeEmerald: {
    backgroundColor: '#ECFDF5', // bg-emerald-50
  },
  statusTextEmerald: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857', // text-emerald-700
  },
  statusBadgeAmber: {
    backgroundColor: '#FFFBEB', // bg-amber-50
  },
  statusTextAmber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309', // text-amber-700
  },
  statusBadgeRed: {
    backgroundColor: '#FEF2F2',
  },
  statusTextRed: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  itemsSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  itemsSnippetText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  itemsCountText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trackLiveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF5E00', // #FF5E00 pill
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  trackLiveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reorderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 0.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    paddingVertical: 12,
  },
  reorderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5E00',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  receiptBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937', // text-gray-800
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  receiptModalSub: {
    fontSize: 12,
    color: '#8E8E93',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  receiptDivider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 14,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptMetaLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  receiptMetaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    maxWidth: '65%',
    textAlign: 'right',
  },
  receiptItemsList: {
    marginVertical: 8,
    gap: 6,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptItemName: {
    fontSize: 13,
    color: '#374151',
  },
  receiptItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  receiptTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF5E00',
    fontVariant: ['tabular-nums'],
  },
  closeReceiptBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeReceiptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
});
