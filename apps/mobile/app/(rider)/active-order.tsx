import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Navigation,
  Phone,
  CheckSquare,
  Square,
  ShieldCheck,
  Building2,
  User,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import { useRiderStore } from '../../store/useRiderStore';
import { openTurnByTurnNavigation } from '../../utils/navigation';
import { DeliveryPinModal } from '../../components/rider/DeliveryPinModal';

export default function ActiveOrderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentOrder, toggleItemCheck, confirmPickup, verifyPinAndDeliver } = useRiderStore();

  // 4-digit PIN input states & Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputs = useRef<Array<TextInput | null>>([]);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentOrder) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 20, paddingHorizontal: 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Delivery Trip</Text>
          <Text style={styles.emptySubtitle}>You do not have any active delivery assigned currently.</Text>
          <TouchableOpacity
            onPress={() => router.replace('/(rider)/dashboard')}
            style={styles.returnBtn}
            activeOpacity={0.9}
          >
            <Text style={styles.returnBtnText}>Return to Console</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isPickupStage = currentOrder.status === 'ready_for_pickup';
  const allItemsChecked = currentOrder.items.every((i) => i.checked);

  const handleCall = (phoneNumber: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleOpenStoreNav = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    openTurnByTurnNavigation(
      currentOrder.store_latitude,
      currentOrder.store_longitude,
      currentOrder.store_name
    );
  };

  const handleOpenCustomerNav = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    openTurnByTurnNavigation(
      currentOrder.customer_latitude,
      currentOrder.customer_longitude,
      currentOrder.customer_name
    );
  };

  const handlePinChange = (text: string, index: number) => {
    setPinError(null);
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    try {
      Haptics.selectionAsync();
    } catch {}

    if (text && index < 3) {
      pinInputs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyDelivery = async () => {
    const enteredPin = pin.join('');
    if (enteredPin.length < 4) {
      setPinError('Please enter the full 4-digit customer PIN');
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      return;
    }

    setIsSubmitting(true);
    const success = await verifyPinAndDeliver(currentOrder.id, enteredPin);
    setIsSubmitting(false);

    if (success) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Alert.alert('Delivery Completed! 🎉', `₹${currentOrder.payout} credited to your shift earnings.`, [
        {
          text: 'Return to Console',
          onPress: () => router.replace('/(rider)/dashboard'),
        },
      ]);
    } else {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      setPinError('Invalid PIN. Please ask customer for the 4-digit PIN on their screen.');
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTag}>ACTIVE DISPATCH</Text>
          <Text style={styles.headerCode}>#{currentOrder.short_code}</Text>
        </View>
        <View style={styles.slaBadge}>
          <Clock size={12} color="#C2410C" />
          <Text style={styles.slaBadgeText}>12m SLA</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepNumber, !isPickupStage ? styles.stepNumberDone : styles.stepNumberActive]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.stepLabel, isPickupStage && styles.stepLabelActive]}>Store Hub</Text>
          </View>

          <View style={[styles.stepDivider, !isPickupStage && styles.stepDividerDone]} />

          <View style={styles.stepIndicator}>
            <View style={[styles.stepNumber, !isPickupStage ? styles.stepNumberActive : styles.stepNumberInactive]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.stepLabel, !isPickupStage && styles.stepLabelActive]}>Customer Drop</Text>
          </View>
        </View>

        {/* STAGE 1: Store Hub Pickup Card */}
        {isPickupStage ? (
          <View style={styles.stageCard}>
            <View style={styles.stageCardHeader}>
              <View style={styles.stageIconBg}>
                <Building2 size={20} color="#FF5E00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageTitle}>Pick Up at Store Hub</Text>
                <Text style={styles.stageSubtitle}>{currentOrder.store_name}</Text>
              </View>
            </View>

            <Text style={styles.addressText}>{currentOrder.store_address}</Text>

            {/* Quick Actions: Navigation in #007AFF & Call in bg-gray-100 */}
            <View style={styles.hubActionRow}>
              <TouchableOpacity
                onPress={handleOpenStoreNav}
                style={styles.navActionBtn}
                activeOpacity={0.88}
              >
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.navActionBtnText}>Navigate to Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCall(currentOrder.store_phone)}
                style={styles.callHubBtn}
                activeOpacity={0.85}
              >
                <Phone size={16} color="#111827" />
                <Text style={styles.callHubBtnText}>Call Hub</Text>
              </TouchableOpacity>
            </View>

            {/* Order Checklist */}
            <View style={styles.checklistSection}>
              <Text style={styles.checklistTitle}>
                BAG VERIFICATION CHECKLIST ({currentOrder.items.filter((i) => i.checked).length}/
                {currentOrder.items.length})
              </Text>
              <Text style={styles.checklistSubtitle}>
                Verify items with the store operator before sealing the bag.
              </Text>

              <View style={styles.checklistItems}>
                {currentOrder.items.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => toggleItemCheck(idx)}
                    style={[styles.checklistItem, item.checked && styles.checklistItemChecked]}
                    activeOpacity={0.7}
                  >
                    {item.checked ? (
                      <CheckSquare size={20} color="#047857" />
                    ) : (
                      <Square size={20} color="#9CA3AF" />
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemSubtext}>
                        {item.unit} • Qty: {item.quantity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Confirm Pickup CTA */}
            <TouchableOpacity
              onPress={() => confirmPickup(currentOrder.id)}
              disabled={!allItemsChecked}
              style={[
                styles.primaryCtaBtn,
                !allItemsChecked && styles.primaryCtaBtnDisabled,
              ]}
              activeOpacity={0.9}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.primaryCtaBtnText}>
                {allItemsChecked ? 'Confirm Pickup & Bag Sealed' : 'Check All Items to Proceed'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* STAGE 2: Customer Transit Card */
          <View style={styles.stageCard}>
            <View style={styles.stageCardHeader}>
              <View style={styles.stageIconBgCustomer}>
                <User size={20} color="#047857" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageTitle}>Deliver to Customer</Text>
                <Text style={styles.stageSubtitle}>{currentOrder.customer_name}</Text>
              </View>
            </View>

            <View style={styles.customerAddressBox}>
              <MapPin size={16} color="#047857" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.customerAddressText}>{currentOrder.customer_address}</Text>
                {currentOrder.delivery_notes ? (
                  <Text style={styles.deliveryNotesText}>
                    📝 Note: "{currentOrder.delivery_notes}"
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Customer Contact & Navigation */}
            <View style={styles.hubActionRow}>
              <TouchableOpacity
                onPress={handleOpenCustomerNav}
                style={styles.navActionBtn}
                activeOpacity={0.88}
              >
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.navActionBtnText}>Turn-by-Turn GPS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCall(currentOrder.customer_phone)}
                style={styles.callHubBtn}
                activeOpacity={0.85}
              >
                <Phone size={16} color="#111827" />
                <Text style={styles.callHubBtnText}>Call Customer</Text>
              </TouchableOpacity>
            </View>

            {/* STAGE 3: Secure Delivery PIN Verification */}
            <View style={styles.pinSection}>
              <View style={styles.pinHeader}>
                <ShieldCheck size={18} color="#FF5E00" />
                <Text style={styles.pinSectionTitle}>SECURE DELIVERY PIN</Text>
              </View>
              <Text style={styles.pinSectionSubtitle}>
                Ask customer for 4-digit PIN to confirm handoff and receive credit.
              </Text>

              {/* 4 Separate Tabular Input Boxes */}
              <View style={styles.pinInputsRow}>
                {pin.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => {
                      pinInputs.current[index] = el;
                    }}
                    value={digit}
                    onChangeText={(val) => handlePinChange(val, index)}
                    onKeyPress={(e) => handlePinKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={[
                      styles.pinBox,
                      digit ? styles.pinBoxFilled : null,
                      pinError ? styles.pinBoxError : null,
                    ]}
                  />
                ))}
              </View>

              {pinError && <Text style={styles.pinErrorText}>{pinError}</Text>}

              {/* Verify & Complete CTA */}
              <TouchableOpacity
                onPress={handleVerifyDelivery}
                disabled={isSubmitting || pin.join('').length < 4}
                style={[
                  styles.primaryCtaBtn,
                  pin.join('').length < 4 && styles.primaryCtaBtnDisabled,
                ]}
                activeOpacity={0.9}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.primaryCtaBtnText}>
                  {isSubmitting ? 'Verifying...' : 'Complete Delivery & Collect Payout'}
                </Text>
              </TouchableOpacity>

              {/* Fast PIN Modal Trigger Button */}
              <TouchableOpacity
                onPress={() => setShowPinModal(true)}
                style={styles.openModalTriggerBtn}
                activeOpacity={0.85}
              >
                <ShieldCheck size={16} color="#FF5E00" />
                <Text style={styles.openModalTriggerText}>Launch Handshake PIN Sheet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Apple Squircle Delivery PIN Modal */}
      <DeliveryPinModal
        visible={showPinModal}
        order={currentOrder}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          router.replace('/(rider)/dashboard');
        }}
      />
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
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.6,
  },
  headerCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#FED7AA',
  },
  slaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
  },
  content: {
    padding: 18,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumberActive: {
    backgroundColor: '#FF5E00',
  },
  stepNumberDone: {
    backgroundColor: '#047857',
  },
  stepNumberInactive: {
    backgroundColor: '#D1D5DB',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#111827',
    fontWeight: '700',
  },
  stepDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
    marginBottom: 16,
  },
  stepDividerDone: {
    backgroundColor: '#047857',
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // rounded-3xl squircle
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  stageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stageIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconBgCustomer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  stageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addressText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 16,
  },
  customerAddressBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginVertical: 14,
  },
  customerAddressText: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
    fontWeight: '500',
  },
  deliveryNotesText: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 4,
    fontStyle: 'italic',
  },
  hubActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  navActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#007AFF', // Apple Maps #007AFF capsule
    paddingVertical: 12,
    borderRadius: 14,
  },
  navActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  callHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6', // bg-gray-100 text-gray-900
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  callHubBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  checklistSection: {
    marginBottom: 20,
  },
  checklistTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.7,
  },
  checklistSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  checklistItems: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  checklistItemChecked: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  itemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  itemTextChecked: {
    color: '#047857',
  },
  itemSubtext: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCtaBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryCtaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pinSection: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pinSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.8,
  },
  pinSectionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 16,
  },
  pinInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pinBox: {
    width: 58,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  pinBoxFilled: {
    borderColor: '#FF5E00',
    backgroundColor: '#FFF7ED',
  },
  pinBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  pinErrorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  openModalTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
  },
  openModalTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5E00',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  returnBtn: {
    backgroundColor: '#FF5E00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
