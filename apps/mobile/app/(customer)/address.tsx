import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useCartStore, Address } from '../../store/useCartStore';

const INITIAL_SAVED_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    recipient_name: 'Rahul Sharma',
    recipient_phone: '+91 98765 43210',
    house_flat_no: 'Flat 402, Tower B',
    floor: '4th Floor',
    apartment_road_area: 'Prestige Meridian, 100ft Road, Indiranagar',
    landmark: 'Near Metro Pillar 84',
    city: 'Bengaluru',
    postal_code: '560038',
    is_default: true,
  },
  {
    id: 'addr-2',
    label: 'Office',
    recipient_name: 'Rahul Sharma',
    recipient_phone: '+91 98765 43210',
    house_flat_no: 'Bay 12, WeWork Galaxy',
    floor: '3rd Floor',
    apartment_road_area: '43 Residency Road, Shanthala Nagar',
    landmark: 'Opposite Ritz Carlton',
    city: 'Bengaluru',
    postal_code: '560025',
    is_default: false,
  },
];

export default function AddressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { selectedAddress, setAddress } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>(INITIAL_SAVED_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Form Fields
  const [label, setLabel] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [name, setName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('9876543210');
  const [houseNo, setHouseNo] = useState('');
  const [floor, setFloor] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');

  const handleSelectAddress = async (addr: Address) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setAddress(addr);
    router.push('/(customer)/checkout' as any);
  };

  const handleDetectGPSLocation = async () => {
    setIsLocating(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow Belzo location access to pinpoint your doorstep for 12-minute delivery.'
        );
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode) {
        const detectedArea = [
          geocode.street,
          geocode.district || geocode.subregion,
          geocode.city,
        ]
          .filter(Boolean)
          .join(', ');

        setArea(detectedArea || 'Indiranagar 100ft Road, Bengaluru');
        setShowAddForm(true);
      } else {
        setArea('Indiranagar, Bengaluru, 560038');
        setShowAddForm(true);
      }
    } catch (err) {
      // Fallback
      setArea('Indiranagar 100ft Road, Bengaluru, 560038');
      setShowAddForm(true);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveNewAddress = async () => {
    if (!houseNo.trim() || !area.trim()) {
      Alert.alert('Required Information', 'Please provide your Flat/House No and Area.');
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label,
      recipient_name: name,
      recipient_phone: `+91 ${phone}`,
      house_flat_no: houseNo.trim(),
      floor: floor.trim() || undefined,
      apartment_road_area: area.trim(),
      landmark: landmark.trim() || undefined,
      city: 'Bengaluru',
      postal_code: '560038',
      is_default: false,
    };

    setAddresses([newAddr, ...addresses]);
    setAddress(newAddr);
    setShowAddForm(false);
    router.push('/(customer)/checkout' as any);
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
        <Text style={styles.headerTitle}>Select Delivery Address</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* GPS Instant Locate Button */}
        <TouchableOpacity
          style={styles.gpsCard}
          onPress={handleDetectGPSLocation}
          activeOpacity={0.88}
          disabled={isLocating}
        >
          <View style={styles.gpsIconCircle}>
            {isLocating ? (
              <ActivityIndicator size="small" color="#FF5E00" />
            ) : (
              <Text style={styles.gpsPinEmoji}>🎯</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsTitle}>Use Current Location</Text>
            <Text style={styles.gpsSubtitle}>
              Using device GPS for millimeter-accurate dispatch
            </Text>
          </View>
          <Text style={styles.gpsArrow}>➔</Text>
        </TouchableOpacity>

        {/* Saved Addresses List */}
        <Text style={styles.sectionHeader}>Saved Addresses</Text>

        {addresses.map((addr) => {
          const isSelected = selectedAddress?.id === addr.id;
          return (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressCard, isSelected && styles.addressCardActive]}
              onPress={() => handleSelectAddress(addr)}
              activeOpacity={0.85}
            >
              <View style={styles.addressTopRow}>
                <View style={styles.labelGroup}>
                  <Text style={styles.labelBadgeIcon}>
                    {addr.label === 'Home'
                      ? '🏠'
                      : addr.label === 'Office'
                      ? '🏢'
                      : '📍'}
                  </Text>
                  <Text style={styles.labelBadgeText}>{addr.label}</Text>
                  {addr.is_default && (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultPillText}>DEFAULT</Text>
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleActive,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              <Text style={styles.recipientName}>{addr.recipient_name}</Text>
              <Text style={styles.addressLine}>
                {addr.house_flat_no}
                {addr.floor ? `, ${addr.floor}` : ''}, {addr.apartment_road_area}
              </Text>
              {addr.landmark ? (
                <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
              ) : null}
              <Text style={styles.phoneText}>Phone: {addr.recipient_phone}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Add New Address Toggle / Form */}
        {!showAddForm ? (
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addNewPlus}>+ </Text>
            <Text style={styles.addNewText}>Add New Address</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formTitle}>New Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Text style={styles.cancelFormText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Label Chips */}
            <View style={styles.chipRow}>
              {(['Home', 'Office', 'Other'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setLabel(t)}
                  style={[styles.typeChip, label === t && styles.typeChipActive]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      label === t && styles.typeChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Flat / House No / Floor *</Text>
              <TextInput
                value={houseNo}
                onChangeText={setHouseNo}
                placeholder="e.g. Flat 301, 3rd Floor"
                placeholderTextColor="#8E8E93"
                style={styles.fieldInput}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Apartment / Street / Area *</Text>
              <TextInput
                value={area}
                onChangeText={setArea}
                placeholder="e.g. 100ft Road, Indiranagar"
                placeholderTextColor="#8E8E93"
                style={styles.fieldInput}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Nearby Landmark (Optional)</Text>
              <TextInput
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Near Indiranagar Metro Station"
                placeholderTextColor="#8E8E93"
                style={styles.fieldInput}
              />
            </View>

            <TouchableOpacity
              style={styles.saveAddressButton}
              onPress={handleSaveNewAddress}
              activeOpacity={0.88}
            >
              <Text style={styles.saveAddressButtonText}>
                Save Address & Proceed ➔
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    gap: 16,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5E00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF4EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsPinEmoji: {
    fontSize: 20,
  },
  gpsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF5E00',
    marginBottom: 2,
  },
  gpsSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  gpsArrow: {
    color: '#FF5E00',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  addressCardActive: {
    borderColor: '#FF5E00',
    backgroundColor: '#FFFAF6',
  },
  addressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelBadgeIcon: {
    fontSize: 14,
  },
  labelBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A134D',
  },
  defaultPill: {
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultPillText: {
    color: '#34C759',
    fontSize: 9,
    fontWeight: '800',
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
  recipientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
    marginBottom: 4,
  },
  landmarkText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderStyle: 'dashed',
  },
  addNewPlus: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A134D',
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A134D',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  cancelFormText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: '#2A134D',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formField: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#636366',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
  },
  saveAddressButton: {
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveAddressButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
