import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
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
  MapPin,
} from 'lucide-react-native';
import { useAuth } from '../_layout';
import { useCartStore } from '../../store/useCartStore';
import { CompleteProfileSheet } from '../../components/profile/CompleteProfileSheet';
import { supabase } from '../../src/lib/supabase';

interface SavedAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  label: string;
  address: string;
  is_default: boolean;
}

export default function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, user, profile } = useAuth();
  const { clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newTag, setNewTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newLabel, setNewLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // ─── Load addresses from Supabase ─────────────────────────────────────────
  useEffect(() => {
    loadAddresses();
  }, [user?.id]);

  async function loadAddresses() {
    if (!user?.id) {
      setLoadingAddresses(false);
      return;
    }
    try {
      setLoadingAddresses(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (!error && data) {
        const mapped: SavedAddress[] = data.map((a: any) => ({
          id: a.id,
          tag: (a.tag as SavedAddress['tag']) || 'Home',
          label: a.label || a.tag || 'Address',
          address:
            [a.house_flat_no, a.apartment_road_area, a.city, a.pincode]
              .filter(Boolean)
              .join(', ') ||
            a.address_text ||
            'Saved Address',
          is_default: Boolean(a.is_default),
        }));
        setAddresses(mapped);
      } else {
        setAddresses([]);
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }

  // ─── GPS auto-fill ─────────────────────────────────────────────────────────
  const handleUseGpsLocation = async () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setIsFetchingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location in Settings to use GPS auto-fill.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo && geo.length > 0) {
        const g = geo[0];
        const parts = [g.streetNumber, g.street, g.district || g.subregion, g.city, g.postalCode].filter(Boolean);
        setNewAddressText(parts.join(', '));
        if (!newLabel) setNewLabel(newTag);
      } else {
        Alert.alert('GPS Unavailable', 'Could not resolve location. Please type manually.');
      }
    } catch {
      Alert.alert('GPS Error', 'Unable to fetch location. Please type your address manually.');
    } finally {
      setIsFetchingGps(false);
    }
  };

  // ─── Delete address ────────────────────────────────────────────────────────
  const handleDeleteAddress = async (id: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (user?.id) {
      await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id);
    }
  };

  // ─── Save address ──────────────────────────────────────────────────────────
  const handleSaveAddress = async () => {
    if (!newAddressText.trim()) {
      Alert.alert('Missing Address', 'Please provide a street address.');
      return;
    }
    setIsSavingAddress(true);
    try {
      const isFirstAddress = addresses.length === 0;
      if (user?.id) {
        const { data, error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            tag: newTag,
            label: newLabel || newTag,
            address_text: newAddressText,
            apartment_road_area: newAddressText,
            is_default: isFirstAddress,
          })
          .select()
          .single();
        if (!error && data) {
          setAddresses((prev) => [
            ...prev,
            {
              id: data.id,
              tag: (data.tag as SavedAddress['tag']) || newTag,
              label: data.label || newTag,
              address: data.address_text || newAddressText,
              is_default: Boolean(data.is_default),
            },
          ]);
        } else {
          setAddresses((prev) => [...prev, { id: `tmp-${Date.now()}`, tag: newTag, label: newLabel || newTag, address: newAddressText, is_default: isFirstAddress }]);
        }
      } else {
        setAddresses((prev) => [...prev, { id: `local-${Date.now()}`, tag: newTag, label: newLabel || newTag, address: newAddressText, is_default: addresses.length === 0 }]);
      }
      setIsAddModalOpen(false);
      setNewLabel('');
      setNewAddressText('');
      setNewTag('Home');
    } finally {
      setIsSavingAddress(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    Alert.alert(
      'Delete Account & Data',
      'Are you sure you want to permanently delete your Belzo account? All saved addresses, profile details, and active sessions will be deleted immediately in accordance with data safety guidelines.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?.id) {
                await supabase.from('addresses').delete().eq('user_id', user.id);
                await supabase.from('profiles').delete().eq('id', user.id);
              }
              clearCart();
              await signOut();
              Alert.alert('Account Deleted', 'Your account and personal data have been removed.');
              router.replace('/(auth)/login' as any);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Unable to delete account at this time. Please contact support@belzo.in');
            }
          },
        },
      ]
    );
  };

  const handleSupport = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    Linking.openURL('tel:+919888812345');
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
            {loadingAddresses ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="small" color="#FF5E00" />
                <Text style={styles.emptyStateText}>Loading addresses…</Text>
              </View>
            ) : addresses.length === 0 ? (
              <View style={styles.emptyState}>
                <MapPin size={28} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>No Saved Addresses</Text>
                <Text style={styles.emptyStateText}>
                  Tap "Add New" to save a delivery location.
                </Text>
              </View>
            ) : (
            addresses.map((addr) => (
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
            ))
            )}
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

        {/* Delete Account & Data Button (Google Play Data Safety Mandate) */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={styles.deleteAccountBtn}
          activeOpacity={0.8}
        >
          <Trash2 size={15} color="#9CA3AF" />
          <Text style={styles.deleteAccountBtnText}>Delete Account & Data</Text>
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

              {/* GPS Auto-fill Button */}
              <TouchableOpacity
                onPress={handleUseGpsLocation}
                style={styles.gpsBtn}
                activeOpacity={0.85}
                disabled={isFetchingGps}
              >
                {isFetchingGps ? (
                  <ActivityIndicator size="small" color="#FF5E00" />
                ) : (
                  <MapPin size={16} color="#FF5E00" />
                )}
                <Text style={styles.gpsBtnText}>
                  {isFetchingGps ? 'Fetching GPS…' : '📍 Use Current GPS Location'}
                </Text>
              </TouchableOpacity>

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
                style={[styles.saveAddrSubmitBtn, isSavingAddress && { opacity: 0.7 }]}
                activeOpacity={0.92}
                disabled={isSavingAddress}
              >
                {isSavingAddress ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveAddrSubmitBtnText}>Save Address</Text>
                )}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  emptyStateText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 20,
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
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    paddingVertical: 11,
    marginBottom: 12,
  },
  gpsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C2410C',
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
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  deleteAccountBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
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
