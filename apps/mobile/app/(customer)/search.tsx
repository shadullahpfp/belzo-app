import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCartStore, CartProduct } from '../../store/useCartStore';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { BottomCartPill } from '../../components/ui/BottomCartPill';
import { ProductCardSkeleton } from '../../components/ui/ShimmerSkeleton';
import { supabase } from '../../src/lib/supabase';

const CATEGORIES = [
  'All',
  'Grocery',
  'Veggies',
  'Food',
  'Pharma',
  'Fashion',
  'Tech',
];

const FALLBACK_PRODUCTS: CartProduct[] = [
  {
    id: 'p1',
    name: 'Amul Taaza Fresh Toned Milk',
    unit: '500 ml',
    price: 34,
    mrp: 38,
    stock: 20,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Pasteurized homogenized toned milk with essential vitamins and calcium.',
  },
  {
    id: 'p2',
    name: 'Harvest Gold 100% Atta Brown Bread',
    unit: '400 g',
    price: 49,
    mrp: 55,
    stock: 12,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Zero maida, baked fresh with whole wheat fiber for a wholesome breakfast.',
  },
  {
    id: 'p3',
    name: 'Farm Fresh Organic Hass Avocado',
    unit: '2 pcs',
    price: 189,
    mrp: 240,
    stock: 8,
    category: 'Veggies',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
    description: 'Rich and creamy buttery avocados handpicked for salads, guacamole, and toast.',
  },
  {
    id: 'p4',
    name: 'Belzo Farm Red Ripe Tomatoes',
    unit: '1 kg',
    price: 38,
    mrp: 50,
    stock: 25,
    category: 'Veggies',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    description: 'Hydroponic, sun-ripened farm fresh tomatoes bursting with natural flavor.',
  },
  {
    id: 'p5',
    name: 'Croissant Butter Puff (Pack of 2)',
    unit: '200 g',
    price: 120,
    mrp: 150,
    stock: 6,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80',
    description: 'Flaky, artisanal French-style butter croissants baked freshly every morning.',
  },
  {
    id: 'p6',
    name: 'Electrolyte Hydration Powder (Lime)',
    unit: '5 sachets',
    price: 99,
    mrp: 125,
    stock: 15,
    category: 'Pharma',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    description: 'Instant energy and oral rehydration salt formula with essential zinc.',
  },
  {
    id: 'p7',
    name: 'Classic Cotton Crew Socks (3 Pairs)',
    unit: '3 pairs',
    price: 249,
    mrp: 399,
    stock: 10,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=400&q=80',
    description: 'Breathable combed cotton cushion crew socks with reinforced heel and toe.',
  },
  {
    id: 'p8',
    name: 'Type-C Fast Braided Charging Cable',
    unit: '1.2 m',
    price: 299,
    mrp: 499,
    stock: 14,
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    description: 'Heavy duty 65W PD fast charging braided cord with gold-plated connectors.',
  },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<CartProduct[]>(FALLBACK_PRODUCTS);

  const {
    items,
    totalQuantity,
    netPayable,
    addItem,
    removeItem,
    getItemQuantity,
  } = useCartStore();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        let filtered = FALLBACK_PRODUCTS;

        if (selectedCategory !== 'All') {
          filtered = filtered.filter(
            (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        if (query.trim()) {
          const q = query.trim().toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q)
          );

          // Attempt Supabase fetch if connected
          try {
            const { data } = await supabase
              .from('products')
              .select('*')
              .ilike('name', `%${query.trim()}%`)
              .limit(15);

            if (data && data.length > 0) {
              const mapped: CartProduct[] = data.map((d: any) => ({
                id: d.id,
                name: d.name,
                unit: d.unit,
                price: Number(d.price),
                mrp: Number(d.mrp || d.price * 1.2),
                stock: d.stock_quantity || 10,
                image: d.media_urls?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
                description: d.description || '',
                category: 'Grocery',
              }));
              filtered = mapped;
            }
          } catch {}
        }

        setResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, selectedCategory]);

  const handleCategoryPress = async (cat: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedCategory(cat);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      {/* Top Search Sticky Bar */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <View style={styles.searchBarRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search milk, bread, avocados..."
              placeholderTextColor="#8E8E93"
              autoFocus
              clearButtonMode="while-editing"
              style={styles.searchInput}
            />
            {query.length > 0 && Platform.OS === 'android' && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ color: '#8E8E93', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategoryPress(cat)}
                style={[styles.pill, isActive && styles.pillActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.pillText, isActive && styles.pillTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Results Body */}
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: totalQuantity > 0 ? 120 : 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isSearching ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No matching products</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for "Milk", "Bread", or browse all categories.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {results.map((product) => {
              const qty = getItemQuantity(product.id);
              const discount =
                product.mrp && product.mrp > product.price
                  ? Math.round(
                      ((product.mrp - product.price) / product.mrp) * 100
                    )
                  : 0;

              return (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/(customer)/product/${product.id}` as any)}
                  style={styles.card}
                >
                  {discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discount}% OFF</Text>
                    </View>
                  )}

                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                  />

                  <Text style={styles.unitText}>{product.unit}</Text>
                  <Text numberOfLines={2} style={styles.productName}>
                    {product.name}
                  </Text>

                  <View style={styles.priceAndStepperRow}>
                    <View>
                      <Text style={styles.priceText}>₹{product.price}</Text>
                      {product.mrp && product.mrp > product.price && (
                        <Text style={styles.mrpText}>₹{product.mrp}</Text>
                      )}
                    </View>

                    <QuantityStepper
                      quantity={qty}
                      stock={product.stock || 20}
                      onIncrement={() => addItem(product)}
                      onDecrement={() => removeItem(product.id)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Cart Pill */}
      {totalQuantity > 0 && (
        <BottomCartPill
          itemCount={totalQuantity}
          totalPrice={netPayable}
          onPress={() => router.push('/(customer)/cart' as any)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
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
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  pillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
  },
  pillActive: {
    backgroundColor: '#2A134D',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: '#FF5E00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    resizeMode: 'cover',
    marginBottom: 8,
    backgroundColor: '#F8F9FD',
  },
  unitText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 17,
    height: 34,
    marginBottom: 8,
  },
  priceAndStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  priceText: {
    fontSize: 15,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: 260,
  },
});
