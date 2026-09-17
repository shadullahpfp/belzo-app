import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../src/lib/supabase';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    items,
    itemsTotal,
    deliveryFee,
    platformFee,
    netPayable,
    selectedAddress,
    deliveryInstructions,
    clearCart,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const orderNum = `BLZ-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Attempt Supabase live insert
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || '00000000-0000-0000-0000-000000000001';

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNum,
            customer_id: userId,
            dark_store_id: '00000000-0000-0000-0000-000000000001',
            status: 'placed',
            items_total: itemsTotal,
            delivery_fee: deliveryFee,
            surge_fee: 0,
            tip_amount: 0,
            net_payable: netPayable,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
            delivery_address_snapshot: selectedAddress || {
              address: 'Indiranagar 100ft Road, Bengaluru',
            },
            delivery_otp: String(Math.floor(1000 + Math.random() * 9000)),
          })
          .select('id')
          .single();

        if (orderData?.id) {
          // Bulk insert line items
          const lineItems = items.map((item) => ({
            order_id: orderData.id,
            product_id: item.product.id.length === 36 ? item.product.id : '00000000-0000-0000-0000-000000000001',
            product_name: item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
            total_price: item.product.price * item.quantity,
          }));
          await supabase.from('order_items').insert(lineItems);
        }
      } catch (dbErr) {
        console.warn('Demo mode order persistence fallback:', dbErr);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();

      router.replace({
        pathname: '/(customer)/order-success',
        params: {
          orderNumber: orderNum,
          total: netPayable.toString(),
          itemsCount: items.length.toString(),
        },
      } as any);
    } catch (err) {
      console.error('Order placement error:', err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <View
        style={[
          styles.headerRow,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Pay</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 12-Minute SLA Delivery Guarantee Banner */}
        <View style={styles.slaBanner}>
          <View style={styles.slaIconCircle}>
            <Text style={styles.slaEmoji}>⚡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.slaTitle}>12-Minute Delivery Guarantee</Text>
            <Text style={styles.slaSubtitle}>
              From dark store Koramangala Hub to your doorstep. Free if late by more than 5 mins.
            </Text>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Delivery Location</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/address' as any)}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View>
              <View style={styles.addressLabelRow}>
                <Text style={styles.addressTypeBadge}>{selectedAddress.label}</Text>
                <Text style={styles.recipientName}>{selectedAddress.recipient_name}</Text>
              </View>
              <Text style={styles.addressDetail}>
                {selectedAddress.house_flat_no}
                {selectedAddress.floor ? `, ${selectedAddress.floor}` : ''},{' '}
                {selectedAddress.apartment_road_area}
              </Text>
              {selectedAddress.landmark && (
                <Text style={styles.landmarkDetail}>
                  Near: {selectedAddress.landmark}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.noAddressText}>No address selected</Text>
          )}

          {deliveryInstructions ? (
            <View style={styles.instructionBubble}>
              <Text style={styles.instructionIcon}>📝</Text>
              <Text style={styles.instructionText}>
                "{deliveryInstructions}"
              </Text>
            </View>
          ) : null}
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Payment Options</Text>

          {/* UPI / Cards */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'upi' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('upi')}
            activeOpacity={0.85}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.paymentIconBox}>
                <Text style={styles.paymentIconEmoji}>⚡</Text>
              </View>
              <View>
                <Text style={styles.paymentTitle}>UPI & Instant Online</Text>
                <Text style={styles.paymentSubtitle}>
                  Google Pay, PhonePe, Paytm, Cards & NetBanking
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'upi' && styles.radioCircleActive,
              ]}
            >
              {paymentMethod === 'upi' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Cash on Delivery */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('cod')}
            activeOpacity={0.85}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.paymentIconBox}>
                <Text style={styles.paymentIconEmoji}>💵</Text>
              </View>
              <View>
                <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
                <Text style={styles.paymentSubtitle}>
                  Pay cash or UPI directly to courier upon arrival
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'cod' && styles.radioCircleActive,
              ]}
            >
              {paymentMethod === 'cod' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Final Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Payment Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Items Total ({items.length} items)</Text>
            <Text style={styles.billVal}>₹{itemsTotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={[styles.billVal, deliveryFee === 0 && styles.freeText]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fee</Text>
            <Text style={styles.billVal}>₹{platformFee}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalVal}>₹{netPayable}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Place Order Bar */}
      <View
        style={[
          styles.bottomDock,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View>
          <Text style={styles.bottomPrice}>₹{netPayable}</Text>
          <Text style={styles.bottomSub}>
            {paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAY VIA UPI'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          activeOpacity={0.88}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order ➔</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#000000',
    lineHeight: 30,
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
  },
  scrollContainer: {
    padding: 16,
    gap: 14,
  },
  slaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2A134D',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.3)',
  },
  slaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF5E00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slaEmoji: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  slaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  slaSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.2,
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5E00',
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressTypeBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
    color: '#2A134D',
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  addressDetail: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
    marginTop: 2,
  },
  landmarkDetail: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  noAddressText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  instructionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FD',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  instructionIcon: {
    fontSize: 14,
  },
  instructionText: {
    fontSize: 12,
    color: '#636366',
    fontStyle: 'italic',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    marginTop: 10,
  },
  paymentOptionActive: {
    borderColor: '#FF5E00',
    backgroundColor: '#FFFAF6',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconEmoji: {
    fontSize: 18,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#FF5E00',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5E00',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  billLabel: {
    fontSize: 13,
    color: '#636366',
  },
  billVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
  freeText: {
    color: '#34C759',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  grandTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
  bottomSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  placeOrderButton: {
    backgroundColor: '#FF5E00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    minWidth: 160,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5E00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
