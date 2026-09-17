import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../_layout';
import { useCartStore } from '../../store/useCartStore';
import { BottomCartPill } from '../../components/ui/BottomCartPill';
import { QuantityStepper } from '../../components/ui/QuantityStepper';

const CATEGORIES = [
  { id: '1', name: 'Grocery', icon: '🛒' },
  { id: '2', name: 'Veggies', icon: '🥦' },
  { id: '3', name: 'Food', icon: '🍔' },
  { id: '4', name: 'Pharma', icon: '💊' },
  { id: '5', name: 'Fashion', icon: '👕' },
  { id: '6', name: 'Tech', icon: '🎧' },
];

interface ProductItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  image: string;
}

const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Amul Taaza Toned Milk',
    unit: '500 ml',
    price: 34,
    mrp: 38,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p2',
    name: 'Harvest Gold Brown Bread',
    unit: '400 g',
    price: 49,
    mrp: 55,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p3',
    name: 'Organic Hass Avocado',
    unit: '2 pcs',
    price: 189,
    mrp: 240,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p4',
    name: 'Belkin 100W USB-C Cable',
    unit: '1 pc (2m)',
    price: 899,
    mrp: 1299,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
  },
];

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();

  const [activeCategory, setActiveCategory] = useState('1');

  const {
    addItem,
    removeItem,
    getItemQuantity,
    totalQuantity,
    netPayable,
  } = useCartStore();

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: 110 },
        ]}
      >
        {/* Editorial Date Bar with Brand Logo */}
        <View style={styles.topBar}>
          <View style={styles.brandHeaderGroup}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogoMark}
            />
            <View>
              <Text style={styles.dateLabel}>BELZO INSTANT DISPATCH</Text>
              <Text style={styles.headerTitle}>Belzo</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/orders' as any)}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>🛍️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(customer)/profile' as any)}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location & Speed SLA Badge */}
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>⚡</Text>
          <Text style={styles.locationText}>Delivery in 11 Mins to Indiranagar, 100ft Rd</Text>
        </View>

        {/* Search Bar (Tappable Button) */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/search' as any)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search milk, bread, tech, medicine...
          </Text>
        </TouchableOpacity>

        {/* Editorial Story Card (App Store Style) */}
        <View style={styles.editorialCard}>
          <Text style={styles.editorialTag}>FARM TO TABLE</Text>
          <Text style={styles.editorialTitle}>Fresh Morning Harvest</Text>
          <Text style={styles.editorialSubtitle}>
            Handpicked farm produce delivered in under 15 minutes.
          </Text>
        </View>

        {/* Categories Bar */}
        <Text style={styles.sectionHeader}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Product Grid (Double Column Editorial Cards) */}
        <Text style={styles.sectionHeader}>Popular in Your Hub</Text>
        <View style={styles.productGrid}>
          {SAMPLE_PRODUCTS.map((product) => {
            const qty = getItemQuantity(product.id);
            return (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                activeOpacity={0.92}
                onPress={() => router.push(`/(customer)/product/${product.id}` as any)}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <Text style={styles.unitBadge}>{product.unit}</Text>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.name}
                </Text>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceText}>₹{product.price}</Text>
                    <Text style={styles.mrpText}>₹{product.mrp}</Text>
                  </View>
                  <QuantityStepper
                    quantity={qty}
                    stock={product.stock}
                    onIncrement={() => addItem(product)}
                    onDecrement={() => removeItem(product.id)}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Persistent Floating Bottom Cart Pill */}
      {totalQuantity > 0 && (
        <BottomCartPill
          itemCount={totalQuantity}
          totalPrice={netPayable}
          etaMinutes={11}
          onPress={() => router.push('/(customer)/cart' as any)}
          bottomOffset={insets.bottom + 12}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoMark: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  locationPin: {
    fontSize: 14,
    color: '#FF5E00',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A134D',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 16,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  editorialCard: {
    backgroundColor: '#2A134D',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.3)',
  },
  editorialTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 1,
  },
  editorialTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  editorialSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 20,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#2A134D',
    borderColor: '#2A134D',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
  },
  unitBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    minHeight: 34,
    lineHeight: 17,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
  mrpText: {
    fontSize: 11,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
});
