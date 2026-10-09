import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '../../store/useCartStore';
import { useLocationStore } from '../../store/useLocationStore';
import { QuantityStepper } from '../../components/ui/QuantityStepper';

const INSTRUCTION_PRESETS = [
  'Avoid ringing bell',
  'Leave with guard',
  'Don’t call',
  'Leave at doorstep',
];

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { isServiceable } = useLocationStore();

  const {
    items,
    itemsTotal,
    deliveryFee,
    platformFee,
    netPayable,
    freeDeliveryThreshold,
    freeDeliveryShortfall,
    addItem,
    removeItem,
    clearCart,
    deliveryInstructions,
    setDeliveryInstructions,
    selectedAddress,
  } = useCartStore();

  const [customNote, setCustomNote] = useState(deliveryInstructions);

  const handleSelectPreset = async (preset: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const nextVal = customNote === preset ? '' : preset;
    setCustomNote(nextVal);
    setDeliveryInstructions(nextVal);
  };

  const handleProceedToCheckout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setDeliveryInstructions(customNote);
    router.push('/(customer)/checkout' as any);
  };

  const handleClearCart = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    clearCart();
    if (router.canGoBack()) {
      router.back();
    }
  };

  const totalMrp = items.reduce(
    (sum, item) => sum + (item.product.mrp || item.product.price) * item.quantity,
    0
  );
  const totalSavings = Math.max(0, totalMrp - itemsTotal);

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyHeading}>Your bag is empty</Text>
          <Text style={styles.emptySubheading}>
            Add grocery, fresh farm veggies, tech, or daily medicine to enjoy 12-minute delivery.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.replace('/(customer)/home' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.browseButtonText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      {/* Top Header */}
      <View
        style={[
          styles.headerRow,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart ({items.length} items)</Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Free Delivery SLA Banner / Progress */}
        {freeDeliveryShortfall > 0 ? (
          <View style={styles.freeDeliveryBanner}>
            <Text style={styles.freeDeliveryIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.freeDeliveryTitle}>
                Add ₹{freeDeliveryShortfall} more for FREE delivery!
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        100,
                        (itemsTotal / freeDeliveryThreshold) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.freeDeliveryUnlockedBanner}>
            <Text style={styles.unlockedIcon}>🎉</Text>
            <Text style={styles.unlockedText}>
              FREE lightning delivery applied to your order!
            </Text>
          </View>
        )}

        {/* Itemized Cart List Card */}
        <View style={styles.cardSection}>
          <Text style={styles.cardSectionHeading}>Items Added</Text>
          {items.map((item, index) => (
            <View
              key={item.product.id}
              style={[
                styles.itemRow,
                index < items.length - 1 && styles.itemRowBorder,
              ]}
            >
              <Image
                source={{
                  uri:
                    item.product.image ||
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.itemThumb}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemUnit}>{item.product.unit}</Text>
                <Text style={styles.itemPrice}>
                  ₹{item.product.price * item.quantity}
                </Text>
              </View>
              <QuantityStepper
                quantity={item.quantity}
                stock={item.product.stock || 20}
                onIncrement={() => addItem(item.product)}
                onDecrement={() => removeItem(item.product.id)}
              />
            </View>
          ))}
        </View>

        {/* Delivery Instructions Section */}
        <View style={styles.cardSection}>
          <Text style={styles.cardSectionHeading}>Delivery Instructions</Text>
          <View style={styles.chipsRow}>
            {INSTRUCTION_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => handleSelectPreset(preset)}
                style={[
                  styles.presetChip,
                  customNote === preset && styles.presetChipActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    customNote === preset && styles.presetChipTextActive,
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={customNote}
            onChangeText={(text) => {
              setCustomNote(text);
              setDeliveryInstructions(text);
            }}
            placeholder="Add note for delivery partner (optional)..."
            placeholderTextColor="#8E8E93"
            style={styles.instructionsInput}
          />
        </View>

        {/* Bill Breakdown Card */}
        <View style={styles.cardSection}>
          <Text style={styles.cardSectionHeading}>Bill Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{itemsTotal}</Text>
          </View>

          <View style={styles.billRow}>
            <View style={styles.rowWithIcon}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              {deliveryFee === 0 && (
                <View style={styles.freePill}>
                  <Text style={styles.freePillText}>FREE</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.billValue,
                deliveryFee === 0 && styles.strikethroughFee,
              ]}
            >
              {deliveryFee === 0 ? '₹25' : `₹${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Handling Fee</Text>
            <Text style={styles.billValue}>₹{platformFee}</Text>
          </View>

          {totalSavings > 0 && (
            <View style={styles.savingsRow}>
              <Text style={styles.savingsLabel}>Total Savings</Text>
              <Text style={styles.savingsAmount}>-₹{totalSavings}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billRowTotal}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{netPayable}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Dock */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        {!isServiceable && (
          <View style={styles.unserviceableBanner}>
            <Text style={styles.unserviceableBannerIcon}>⚠️</Text>
            <Text style={styles.unserviceableBannerText}>
              Delivery unavailable at your current location. Please select an address within Joniha 5 KM zone.
            </Text>
          </View>
        )}

        <View style={styles.addressPreview}>
          <Text style={styles.deliverToTag}>DELIVERING TO</Text>
          <Text numberOfLines={1} style={styles.addressLine}>
            {selectedAddress
              ? `${selectedAddress.label} • ${selectedAddress.house_flat_no}, ${selectedAddress.apartment_road_area}`
              : 'Select your delivery address'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.proceedButton,
            !isServiceable && styles.disabledProceedButton,
          ]}
          onPress={isServiceable ? handleProceedToCheckout : undefined}
          activeOpacity={isServiceable ? 0.88 : 1}
          disabled={!isServiceable}
        >
          <View>
            <Text style={[styles.proceedPrice, !isServiceable && styles.disabledButtonText]}>₹{netPayable}</Text>
            <Text style={[styles.proceedSub, !isServiceable && styles.disabledButtonText]}>TOTAL</Text>
          </View>
          <View style={styles.proceedRight}>
            <Text style={[styles.proceedText, !isServiceable && styles.disabledButtonText]}>
              {isServiceable ? 'Proceed to Pay' : 'Delivery Unavailable'}
            </Text>
            {isServiceable && <Text style={styles.proceedArrow}>➔</Text>}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
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
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  freeDeliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF4EB',
    padding: 14,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 94, 0, 0.2)',
  },
  freeDeliveryIcon: {
    fontSize: 20,
  },
  freeDeliveryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5E00',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE5D1',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5E00',
    borderRadius: 3,
  },
  freeDeliveryUnlockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F8EE',
    padding: 14,
    borderRadius: 18,
  },
  unlockedIcon: {
    fontSize: 18,
  },
  unlockedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34C759',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // rounded-3xl
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  itemRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8F9FD',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  presetChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF5E00',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  presetChipTextActive: {
    color: '#FF5E00',
    fontWeight: '700',
  },
  instructionsInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  billLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  freePillText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
  },
  strikethroughFee: {
    color: '#047857',
    textDecorationLine: 'line-through',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '700',
  },
  savingsAmount: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  billDivider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 10,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  unserviceableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  unserviceableBannerIcon: {
    fontSize: 16,
  },
  unserviceableBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#D70015',
    fontWeight: '600',
    lineHeight: 16,
  },
  addressPreview: {
    marginBottom: 10,
  },
  deliverToTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  addressLine: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  proceedButton: {
    height: 52,
    backgroundColor: '#FF5E00',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5E00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  proceedPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  proceedSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  proceedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proceedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  proceedArrow: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  disabledProceedButton: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubheading: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FF5E00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
