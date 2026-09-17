import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore, CartProduct } from '../../../store/useCartStore';
import { QuantityStepper } from '../../../components/ui/QuantityStepper';
import { BottomCartPill } from '../../../components/ui/BottomCartPill';

const { width } = Dimensions.get('window');

const ALL_PRODUCTS: Record<string, CartProduct> = {
  p1: {
    id: 'p1',
    name: 'Amul Taaza Fresh Toned Milk',
    unit: '500 ml',
    price: 34,
    mrp: 38,
    stock: 20,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description:
      'Amul Taaza pasteurized toned milk undergoes minimal processing to preserve vital nutrients, protein, and calcium. Freshly sourced and delivered in temperature-insulated cold bags directly to your kitchen.',
  },
  p2: {
    id: 'p2',
    name: 'Harvest Gold 100% Atta Brown Bread',
    unit: '400 g',
    price: 49,
    mrp: 55,
    stock: 12,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description:
      'Baked fresh daily with wholesome whole-wheat flour. Zero added maida, rich in natural dietary fiber, perfect for breakfast toasts and sandwiches.',
  },
  p3: {
    id: 'p3',
    name: 'Farm Fresh Organic Hass Avocado',
    unit: '2 pcs',
    price: 189,
    mrp: 240,
    stock: 8,
    category: 'Veggies',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
    description:
      'Nutrient-dense imported Hass avocados with a rich, buttery texture. Loaded with monounsaturated fats, potassium, and vitamins. Ripened to perfection.',
  },
  p4: {
    id: 'p4',
    name: 'Belzo Farm Red Ripe Tomatoes',
    unit: '1 kg',
    price: 38,
    mrp: 50,
    stock: 25,
    category: 'Veggies',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    description:
      'Naturally vine-ripened farm tomatoes sorted for maximum juiciness and rich lycopene content. Essential base for curries, salads, and soups.',
  },
  p5: {
    id: 'p5',
    name: 'Croissant Butter Puff (Pack of 2)',
    unit: '200 g',
    price: 120,
    mrp: 150,
    stock: 6,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    description:
      'Golden, crispy French-style puff pastry made with pure butter and slow-proofed dough. Flaky layers that melt on the tongue.',
  },
  p6: {
    id: 'p6',
    name: 'Electrolyte Hydration Powder (Lime)',
    unit: '5 sachets',
    price: 99,
    mrp: 125,
    stock: 15,
    category: 'Pharma',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description:
      'WHO-standard electrolyte formulation with natural lime flavor and zinc. Recharges energy, balances fluids, and prevents dehydration.',
  },
  p7: {
    id: 'p7',
    name: 'Classic Cotton Crew Socks (3 Pairs)',
    unit: '3 pairs',
    price: 249,
    mrp: 399,
    stock: 10,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
    description:
      'Premium combed long-staple cotton with ribbed arch support and reinforced heel. Odor-resistant and all-day sweat-wicking.',
  },
  p8: {
    id: 'p8',
    name: 'Type-C Fast Braided Charging Cable',
    unit: '1.2 m',
    price: 299,
    mrp: 499,
    stock: 14,
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    description:
      'Military-grade nylon braided 65W Power Delivery cable. Certified for rapid smartphone, tablet, and laptop charging with 480Mbps data sync.',
  },
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const product =
    ALL_PRODUCTS[id as string] || {
      id: id || 'unknown',
      name: 'Curated Essentials',
      unit: 'Standard Pack',
      price: 99,
      mrp: 120,
      stock: 10,
      category: 'Grocery',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      description: 'Handpicked, high quality item delivered with lightning speed.',
    };

  const {
    addItem,
    removeItem,
    getItemQuantity,
    totalQuantity,
    netPayable,
  } = useCartStore();

  const currentQty = getItemQuantity(product.id);
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Sticky Floating Close / Back Button */}
      <View
        style={[
          styles.floatingHeader,
          { top: insets.top + 8 },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeCircle}
          activeOpacity={0.8}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1:1 Aspect Ratio Image Viewport */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.heroImage}
          />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discount}% SAVINGS</Text>
            </View>
          )}
        </View>

        {/* Product Details Section */}
        <View style={styles.bodyContent}>
          {/* Delivery SLA Tag */}
          <View style={styles.slaBadge}>
            <Text style={styles.slaIcon}>⚡</Text>
            <Text style={styles.slaText}>11 MINS LIGHTNING DISPATCH</Text>
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.unitBadge}>{product.unit}</Text>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={styles.sellingPrice}>₹{product.price}</Text>
            {product.mrp && product.mrp > product.price && (
              <>
                <Text style={styles.mrpPrice}>MRP ₹{product.mrp}</Text>
                <View style={styles.savingsPill}>
                  <Text style={styles.savingsText}>
                    Save ₹{product.mrp - product.price}
                  </Text>
                </View>
              </>
            )}
          </View>
          <Text style={styles.taxInclusiveText}>(Inclusive of all taxes)</Text>

          <View style={styles.divider} />

          {/* Highlights */}
          <Text style={styles.sectionHeading}>Product Highlights</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          {/* Quality & Cold Chain Guarantee */}
          <View style={styles.guaranteeCard}>
            <Text style={styles.guaranteeIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>Belzo Fresh & Direct Guarantee</Text>
              <Text style={styles.guaranteeSubtitle}>
                Cold-chain stored at 4°C, sealed in tamper-evident packaging, and checked by dark store quality inspectors.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Dock */}
      <View
        style={[
          styles.bottomDock,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View style={styles.bottomDockLeft}>
          <Text style={styles.bottomDockLabel}>Selling Price</Text>
          <Text style={styles.bottomDockPrice}>₹{product.price}</Text>
        </View>

        <QuantityStepper
          quantity={currentQty}
          stock={product.stock || 20}
          onIncrement={() => addItem(product)}
          onDecrement={() => removeItem(product.id)}
        />
      </View>

      {/* Bottom Cart Pill (if items exist in bag) */}
      {totalQuantity > 0 && (
        <BottomCartPill
          itemCount={totalQuantity}
          totalPrice={netPayable}
          bottomOffset={insets.bottom + 76}
          onPress={() => router.push('/(customer)/cart' as any)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  imageContainer: {
    width,
    height: width,
    backgroundColor: '#F8F9FD',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FF5E00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bodyContent: {
    padding: 20,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  slaIcon: {
    fontSize: 12,
    color: '#FF5E00',
  },
  slaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5E00',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  unitBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  sellingPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
  mrpPrice: {
    fontSize: 16,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  savingsPill: {
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savingsText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '800',
  },
  taxInclusiveText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 22,
    fontWeight: '400',
  },
  guaranteeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8F9FD',
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  guaranteeIcon: {
    fontSize: 22,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A134D',
    marginBottom: 4,
  },
  guaranteeSubtitle: {
    fontSize: 12,
    color: '#636366',
    lineHeight: 17,
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
  bottomDockLeft: {
    justifyContent: 'center',
  },
  bottomDockLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  bottomDockPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
});
