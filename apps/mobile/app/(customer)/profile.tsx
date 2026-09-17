import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Home,
  Briefcase,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import { useAuth } from '../_layout';
import { useCartStore } from '../../store/useCartStore';

const { width } = Dimensions.get('window');

interface SavedAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  label: string;
  address: string;
  is_default: boolean;
}

const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-01',
    tag: 'Home',
    label: 'Primary Residence',
    address: 'Flat 402, Lotus Orchid, 5th Main, 4th Block Koramangala, Bengaluru 560034',
    is_default: true,
  },
  {
    id: 'addr-02',
    tag: 'Work',
    label: 'WeWork Galaxy',
    address: '43 Residency Road, Shanthala Nagar, Ashok Nagar, Bengaluru 560025',
    is_default: false,
  },
];

export default function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTag, setNewTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newLabel, setNewLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');

  const handleSignOut = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert('Sign Out', 'Are you sure you want to log out of your Belzo account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          clearCart();
          await signOut();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleSupport = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    Linking.openURL('tel:+919888812345');
  };

  const handleDeleteAddress = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveAddress = () => {
    if (!newAddressText.trim()) {
      Alert.alert('Missing Address', 'Please provide a street address.');
      return;
    }

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      tag: newTag,
      label: newLabel || newTag,
      address: newAddressText,
      is_default: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setIsAddModalOpen(false);
    setNewLabel('');
    setNewAddressText('');
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
        <Text style={styles.headerTitle}>Account & Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.profileName}>Ananya Deshmukh</Text>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>Customer</Text>
              </View>
            </View>
            <Text style={styles.profilePhone}>{user?.email || '+91 98451 22334'}</Text>
            <Text style={styles.memberSince}>Belzo Member since Jan 2026 • Koramangala Hub</Text>
          </View>
        </View>

        {/* Quick Jump to Orders */}
        <TouchableOpacity
          onPress={() => router.push('/(customer)/orders' as any)}
          style={styles.orderJumpCard}
          activeOpacity={0.8}
        >
          <View style={styles.orderJumpIcon}>
            <ShoppingBag size={20} color="#FF5E00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderJumpTitle}>Order History & Invoices</Text>
            <Text style={styles.orderJumpSub}>Track live or reorder past grocery baskets</Text>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Saved Addresses Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>SAVED DELIVERY ADDRESSES</Text>
            <TouchableOpacity
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addAddrBtn}
              activeOpacity={0.7}
            >
              <Plus size={14} color="#FF5E00" />
              <Text style={styles.addAddrText}>Add New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressesList}>
            {addresses.map((addr) => (
              <View key={addr.id} style={styles.addressCard}>
                <View style={styles.addrIconBox}>
                  {addr.tag === 'Home' ? (
                    <Home size={18} color="#FF5E00" />
                  ) : (
                    <Briefcase size={18} color="#34C759" />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.addrHeaderRow}>
                    <Text style={styles.addrLabel}>{addr.label}</Text>
                    {addr.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addrText}>{addr.address}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteAddress(addr.id)}
                  style={styles.deleteAddrBtn}
                >
                  <Trash2 size={16} color="rgba(255,59,48,0.7)" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Support & Operational Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>SUPPORT & SETTINGS</Text>

          <View style={styles.menuBox}>
            <TouchableOpacity onPress={handleSupport} style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <HelpCircle size={18} color="#FF7A29" />
                <Text style={styles.menuItemText}>24/7 Hyperlocal Customer Support</Text>
              </View>
              <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Privacy & Security',
                  'Belzo guarantees strict end-to-end data encryption for your location coordinates and payment details.'
                )
              }
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Shield size={18} color="#34C759" />
                <Text style={styles.menuItemText}>Privacy Policy & Terms of Service</Text>
              </View>
              <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Action Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutBtn}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#FF3B30" />
          <Text style={styles.signOutBtnText}>Log Out of Belzo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Address Modal */}
      {isAddModalOpen && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.addModalCard}>
              <View style={styles.addModalHeader}>
                <Text style={styles.addModalTitle}>Add Delivery Address</Text>
                <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Tag Selector */}
              <View style={styles.tagRow}>
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setNewTag(t)}
                    style={[styles.tagPill, newTag === t && styles.tagPillActive]}
                  >
                    <Text style={[styles.tagPillText, newTag === t && styles.tagPillTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Label (e.g. My Apartment)"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newLabel}
                onChangeText={setNewLabel}
                style={styles.modalInput}
              />

              <TextInput
                placeholder="Flat / Building / Street Address"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newAddressText}
                onChangeText={setNewAddressText}
                multiline={true}
                numberOfLines={3}
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              />

              <TouchableOpacity
                onPress={handleSaveAddress}
                style={styles.saveAddrSubmitBtn}
              >
                <Text style={styles.saveAddrSubmitBtnText}>Save Address</Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E0E38',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    gap: 14,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 94, 0, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF5E00',
  },
  profileInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rolePill: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34C759',
  },
  profilePhone: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  memberSince: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
  },
  orderJumpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A134D',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.35)',
    marginBottom: 24,
    gap: 12,
  },
  orderJumpIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderJumpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  orderJumpSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.7,
  },
  addAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addAddrText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5E00',
  },
  addressesList: {
    gap: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E0E38',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  addrIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addrLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  defaultBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#34C759',
  },
  addrText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    lineHeight: 16,
  },
  deleteAddrBtn: {
    padding: 6,
  },
  menuBox: {
    backgroundColor: '#1E0E38',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 4, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addModalCard: {
    backgroundColor: '#1E0E38',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tagPillActive: {
    backgroundColor: '#FF5E00',
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tagPillTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 12,
  },
  saveAddrSubmitBtn: {
    backgroundColor: '#FF5E00',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  saveAddrSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
