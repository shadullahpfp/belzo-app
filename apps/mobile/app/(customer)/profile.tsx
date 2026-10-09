import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
  ShoppingBag,
  Home,
  Briefcase,
  Plus,
  Trash2,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  X,
  Edit2,
} from 'lucide-react-native';
import { useAuth } from '../_layout';
import { useCartStore } from '../../store/useCartStore';
import { CompleteProfileSheet } from '../../components/profile/CompleteProfileSheet';

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
    address: 'Ward No. 4, Shahbajpur, Joniha, Bindki Road, Fatehpur 212635',
    is_default: true,
  },
  {
    id: 'addr-02',
    tag: 'Work',
    label: 'Joniha Central Office',
    address: 'Shop 12, Bindki Road, Joniha Chauraha, Fatehpur 212635',
    is_default: false,
  },
];

export default function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, user, profile } = useAuth();
  const { clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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
          <ArrowLeft size={20} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account & Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Card (Pure White Squircle) */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.trim() ? profile.full_name.trim().charAt(0).toUpperCase() : 'B'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.profileName}>
                {profile?.full_name || 'Belzo Member'}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {profile?.role ? profile.role.toUpperCase() : 'CUSTOMER'}
                </Text>
              </View>
            </View>
            <Text style={styles.profilePhone}>
              {profile?.phone || (user as any)?.phone || user?.email || '+91 98765 43210'}
            </Text>
            <Text style={styles.memberSince}>Belzo Member • Joniha Hub • 212635</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsEditProfileOpen(true)}
            style={styles.editProfileBtn}
            activeOpacity={0.7}
          >
            <Edit2 size={16} color="#FF5E00" />
          </TouchableOpacity>
        </View>

        {/* Quick Jump to Orders Card */}
        <TouchableOpacity
          onPress={() => router.push('/(customer)/orders' as any)}
          style={styles.orderJumpCard}
          activeOpacity={0.85}
        >
          <View style={styles.orderJumpIcon}>
            <ShoppingBag size={20} color="#FF5E00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderJumpTitle}>Order History & Invoices</Text>
            <Text style={styles.orderJumpSub}>Track live or view previous deliveries</Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Saved Delivery Addresses Section */}
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
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Support & Operational Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>SUPPORT & POLICIES</Text>

          <View style={styles.menuBox}>
            <TouchableOpacity onPress={handleSupport} style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <HelpCircle size={18} color="#FF5E00" />
                <Text style={styles.menuItemText}>24/7 Customer Care Helpline</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPrivacyModalOpen(true)}
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Shield size={18} color="#34C759" />
                <Text style={styles.menuItemText}>Privacy Policy & Terms</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Action Button (Apple System Red Pill) */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutBtn}
          activeOpacity={0.85}
        >
          <LogOut size={16} color="#DC2626" />
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
                  <X size={20} color="#1C1C1E" />
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
                placeholderTextColor="#8E8E93"
                value={newLabel}
                onChangeText={setNewLabel}
                style={styles.modalInput}
              />

              <TextInput
                placeholder="Flat / Building / Street Address"
                placeholderTextColor="#8E8E93"
                value={newAddressText}
                onChangeText={setNewAddressText}
                multiline={true}
                numberOfLines={3}
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              />

              <TouchableOpacity
                onPress={handleSaveAddress}
                style={styles.saveAddrSubmitBtn}
                activeOpacity={0.92}
              >
                <Text style={styles.saveAddrSubmitBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Privacy Policy Clean Sheet Modal */}
      {isPrivacyModalOpen && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.addModalCard, { maxHeight: '80%' }]}>
              <View style={styles.addModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Shield size={20} color="#34C759" />
                  <Text style={styles.addModalTitle}>Privacy & Data Protection</Text>
                </View>
                <TouchableOpacity onPress={() => setIsPrivacyModalOpen(false)}>
                  <X size={20} color="#1C1C1E" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 }}>
                  Hyperlocal Privacy Architecture
                </Text>
                <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 12 }}>
                  Belzo stores delivery coordinates strictly for dispatch routing during active order lifecycles. Your live location is shared only with the assigned courier partner.
                </Text>

                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 }}>
                  Delivery PIN Verification
                </Text>
                <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 12 }}>
                  Every delivery requires a 4-digit zero-trust verification PIN generated directly on your device. Orders cannot be marked completed without this handshake.
                </Text>

                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 }}>
                  Payment Security
                </Text>
                <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20 }}>
                  We never store UPI PINs, credit card numbers, or CVVs. All transactions pass through RBI-compliant secure banking gateways.
                </Text>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setIsPrivacyModalOpen(false)}
                style={styles.saveAddrSubmitBtn}
                activeOpacity={0.92}
              >
                <Text style={styles.saveAddrSubmitBtnText}>Understood</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Inline Profile Completion / Editing Sheet */}
      <CompleteProfileSheet
        visible={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  content: {
    padding: 18,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // rounded-3xl
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  editProfileBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: '#FFF7ED', // bg-orange-50
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
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
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E', // text-gray-900
  },
  roleBadge: {
    backgroundColor: '#ECFDF5', // bg-emerald-50
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#A7F3D0', // border-emerald-200
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857', // text-emerald-700
  },
  profilePhone: {
    fontSize: 13,
    color: '#8E8E93', // text-gray-500
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  memberSince: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  orderJumpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22, // rounded-3xl
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  orderJumpIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderJumpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  orderJumpSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  addAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addAddrText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5E00',
  },
  addressesList: {
    gap: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // squircle
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  addrIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addrLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  defaultBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  defaultBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#047857',
  },
  addrText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 16,
  },
  deleteAddrBtn: {
    padding: 6,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2', // bg-red-50
    borderWidth: 1,
    borderColor: '#FECACA', // border-red-200
    borderRadius: 16, // rounded-2xl
    paddingVertical: 16, // py-4
    marginTop: 8,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626', // text-red-600
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
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
    backgroundColor: '#F2F2F7',
  },
  tagPillActive: {
    backgroundColor: '#FF5E00',
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tagPillTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1C1C1E',
    fontSize: 14,
    marginBottom: 12,
  },
  saveAddrSubmitBtn: {
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveAddrSubmitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
