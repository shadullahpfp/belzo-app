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
  Dimensions,
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
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import { useRiderStore } from '../../store/useRiderStore';
import { openTurnByTurnNavigation } from '../../utils/navigation';

const { width } = Dimensions.get('window');

export default function ActiveOrderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentOrder, toggleItemCheck, confirmPickup, verifyPinAndDeliver } = useRiderStore();

  // 4-digit PIN input states
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputs = useRef<Array<TextInput | null>>([]);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentOrder) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 20, paddingHorizontal: 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Delivery Trip</Text>
          <Text style={styles.emptySubtitle}>You do not have any active delivery assigned currently.</Text>
          <TouchableOpacity
            onPress={() => router.replace('/(rider)/dashboard')}
            style={styles.returnBtn}
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

    // Auto-advance to next input
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
      return;
    }

    setIsSubmitting(true);
    const success = await verifyPinAndDeliver(currentOrder.id, enteredPin);
    setIsSubmitting(false);

    if (success) {
      Alert.alert('Delivery Completed! 🎉', `₹${currentOrder.payout} credited to your shift earnings.`, [
        {
          text: 'Great!',
          onPress: () => router.replace('/(rider)/dashboard'),
        },
      ]);
    } else {
      setPinError(`Incorrect PIN. (Hint for demo: ${currentOrder.delivery_pin})`);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTag}>DELIVERY DISPATCH CONSOLE</Text>
          <Text style={styles.headerCode}>{currentOrder.short_code}</Text>
        </View>

        <View style={styles.slaBadge}>
          <Clock size={13} color="#FF7A29" />
          <Text style={styles.slaBadgeText}>10-MIN SLA</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stage Progress Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepNumber, isPickupStage ? styles.stepNumberActive : styles.stepNumberDone]}>
              {isPickupStage ? (
                <Text style={styles.stepNumberText}>1</Text>
              ) : (
                <CheckCircle2 size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={[styles.stepLabel, isPickupStage && styles.stepLabelActive]}>
              Store Hub Pickup
            </Text>
          </View>

          <View style={[styles.stepConnector, !isPickupStage && styles.stepConnectorDone]} />

          <View style={styles.stepIndicator}>
            <View style={[styles.stepNumber, !isPickupStage ? styles.stepNumberActive : styles.stepNumberInactive]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.stepLabel, !isPickupStage && styles.stepLabelActive]}>
              Customer Transit
            </Text>
          </View>
        </View>

        {/* STAGE 1: Store Pickup Card */}
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

            {/* Quick Actions for Hub */}
            <View style={styles.hubActionRow}>
              <TouchableOpacity
                onPress={handleOpenStoreNav}
                style={styles.navActionBtn}
                activeOpacity={0.8}
              >
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.navActionBtnText}>Navigate to Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCall(currentOrder.store_phone)}
                style={styles.callHubBtn}
                activeOpacity={0.8}
              >
                <Phone size={16} color="#FFFFFF" />
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
                      <CheckSquare size={20} color="#34C759" />
                    ) : (
                      <Square size={20} color="rgba(255,255,255,0.4)" />
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
              activeOpacity={0.85}
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
                <User size={20} color="#34C759" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageTitle}>Deliver to Customer</Text>
                <Text style={styles.stageSubtitle}>{currentOrder.customer_name}</Text>
              </View>
            </View>

            <View style={styles.customerAddressBox}>
              <MapPin size={16} color="#34C759" style={{ marginTop: 2 }} />
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
                style={styles.navActionBtnCustomer}
                activeOpacity={0.8}
              >
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.navActionBtnText}>Turn-by-Turn GPS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCall(currentOrder.customer_phone)}
                style={styles.callHubBtn}
                activeOpacity={0.8}
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.callHubBtnText}>Call Customer</Text>
              </TouchableOpacity>
            </View>

            {/* STAGE 3: Secure Delivery PIN Verification */}
            <View style={styles.pinSection}>
              <View style={styles.pinHeader}>
                <ShieldCheck size={18} color="#FF7A29" />
                <Text style={styles.pinSectionTitle}>SECURE DELIVERY PIN</Text>
              </View>
              <Text style={styles.pinSectionSubtitle}>
                Ask the customer for their 4-digit delivery PIN (or last 4 digits of phone) to complete handoff.
              </Text>

              {/* 4 Square Input Boxes */}
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

              <TouchableOpacity
                onPress={handleVerifyDelivery}
                disabled={isSubmitting}
                style={styles.verifyDeliveryBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.verifyDeliveryBtnText}>
                  {isSubmitting ? 'Verifying...' : 'Verify PIN & Complete Delivery'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF7A29',
    letterSpacing: 0.6,
  },
  headerCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  slaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7A29',
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
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumberActive: {
    backgroundColor: '#FF5E00',
  },
  stepNumberDone: {
    backgroundColor: '#34C759',
  },
  stepNumberInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepConnector: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
    marginBottom: 18,
  },
  stepConnectorDone: {
    backgroundColor: '#34C759',
  },
  stageCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageIconBgCustomer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stageSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  customerAddressBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  customerAddressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  deliveryNotesText: {
    fontSize: 11,
    color: '#FAA307',
    marginTop: 6,
    fontStyle: 'italic',
  },
  hubActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  navActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5E00',
    paddingVertical: 13,
    borderRadius: 14,
  },
  navActionBtnCustomer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#34C759',
    paddingVertical: 13,
    borderRadius: 14,
  },
  navActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  callHubBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 13,
    borderRadius: 14,
  },
  callHubBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checklistSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  checklistTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.6,
  },
  checklistSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
    marginBottom: 12,
  },
  checklistItems: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  checklistItemChecked: {
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderColor: 'rgba(52, 199, 89, 0.25)',
  },
  itemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  itemSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 1,
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    paddingVertical: 15,
  },
  primaryCtaBtnDisabled: {
    opacity: 0.45,
  },
  primaryCtaBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pinSection: {
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 20,
    marginTop: 8,
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
    color: '#FF7A29',
    letterSpacing: 0.7,
  },
  pinSectionSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
    marginBottom: 16,
  },
  pinInputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
  },
  pinBox: {
    width: 54,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  pinBoxFilled: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
  },
  pinBoxError: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  pinErrorText: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  verifyDeliveryBtn: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  verifyDeliveryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  returnBtn: {
    backgroundColor: '#FF5E00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  returnBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
