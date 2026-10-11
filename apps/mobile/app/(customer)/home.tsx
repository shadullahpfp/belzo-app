import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../_layout';
import { useCartStore, CartProduct } from '../../store/useCartStore';
import { useLocationStore } from '../../store/useLocationStore';
import { BottomCartPill } from '../../components/ui/BottomCartPill';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { ShimmerSkeleton } from '../../components/ui/ShimmerSkeleton';
import { LocationNotServiceableModal } from '../../components/ui/LocationNotServiceableModal';
import { CompleteProfileSheet } from '../../components/profile/CompleteProfileSheet';
import { LocationDisclosureModal } from '../../components/LocationDisclosureModal';
import {
  INSTAMART_BENTO_CATEGORIES,
  VERIFIED_CATALOG_PRODUCTS,
  BentoCategory,
  CATEGORIES,
} from '../../constants/catalog';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

// 1. Promo banners (Apple Squircle 24px)
const PROMO_BANNERS = [
  {
    id: 'banner-1',
    badge: '100% SPEED SLA',
    title: '⚡ 12-Min Delivery Guarantee',
    subtitle: 'Farm fresh milk, veggies & fast tech at your doorstep in Joniha.',
    gradient: ['#1C1C1E', '#2C2C2E'] as [string, string],
    tag: 'Joniha Central Hub',
  },
  {
    id: 'banner-2',
    badge: 'WELCOME OFFER',
    title: '🎉 FLAT ₹30 OFF',
    subtitle: 'Use code BELZO30 on your first grocery basket above ₹149.',
    gradient: ['#7A1428', '#D9381E'] as [string, string],
    tag: 'Use Code: BELZO30',
  },
  {
    id: 'banner-3',
    badge: 'DIRECT SOURCING',
    title: '🥬 Farm Direct Daily Harvest',
    subtitle: '100% natural, pesticide-free harvest direct from local farmer groups.',
    gradient: ['#0F3826', '#1E6B47'] as [string, string],
    tag: 'Zero Chemical Residue',
  },
];

import { useCatalogStore } from '../../store/useCatalogStore';

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, profile } = useAuth();

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [showNotServiceableModal, setShowNotServiceableModal] = useState(false);
  const [showLocationDisclosure, setShowLocationDisclosure] = useState(false);

  const {
    coords,
    addressText,
    isServiceable,
    distanceFromHubKm,
    isLoading: isLocationLoading,
    fetchCurrentLocation,
  } = useLocationStore();

  const {
    addItem,
    removeItem,
    getItemQuantity,
    totalQuantity,
    netPayable,
  } = useCartStore();

  const { products, fetchCatalog, subscribeToRealtime } = useCatalogStore();

  // Initialize live Supabase catalog & Realtime WebSocket stream
  useEffect(() => {
    fetchCatalog();
    const unsubscribe = subscribeToRealtime();
    return () => {
      unsubscribe();
    };
  }, []);

  // 1. Farm Fresh Harvest (cat-02-produce)
  const VEGGIES_PRODUCTS = products.filter(
    (p) =>
      p.category_id === 'cat-02-produce' ||
      p.category_id === 'produce' ||
      p.category === 'Fruits & Vegetables' ||
      p.category?.toLowerCase().includes('sabzi')
  );

  // 2. Daily Kitchen Staples (cat-01-grocery)
  const STAPLES_PRODUCTS = products.filter((p) => {
    if (
      p.category_id === 'cat-01-grocery' ||
      p.category_id === 'grocery' ||
      p.category === 'Grocery'
    ) {
      const name = (p.name || '').toLowerCase();
      const isMunchie =
        name.includes('drink') ||
        name.includes('cola') ||
        name.includes('sprite') ||
        name.includes('dew') ||
        name.includes('maaza') ||
        name.includes('sting') ||
        name.includes('red bull') ||
        name.includes('biscuit') ||
        name.includes('cookie') ||
        name.includes('maggi') ||
        name.includes('noodles') ||
        name.includes('chocolate') ||
        name.includes('kitkat') ||
        name.includes('crackle') ||
        name.includes('5 star') ||
        name.includes('gulab jamun') ||
        name.includes('rasgulla') ||
        name.includes('laddu') ||
        name.includes('badam') ||
        name.includes('kaju');
      return !isMunchie;
    }
    return false;
  });

  // 3. Pizza, Burgers & Dhaba Meals (cat-03-food)
  const FOOD_PRODUCTS = products.filter(
    (p) =>
      p.category_id === 'cat-03-food' ||
      p.category_id === 'food' ||
      p.category === 'Food & Restaurant' ||
      p.category_id === 'fastfood' ||
      p.category_id === 'meals'
  );

  // 4. Chilled Drinks & Instant Munchies (cat-01-grocery)
  const DRINKS_MUNCHIES_PRODUCTS = products.filter((p) => {
    if (
      p.category_id === 'cat-01-grocery' ||
      p.category_id === 'grocery' ||
      p.category === 'Grocery'
    ) {
      const name = (p.name || '').toLowerCase();
      return (
        name.includes('drink') ||
        name.includes('cola') ||
        name.includes('sprite') ||
        name.includes('dew') ||
        name.includes('maaza') ||
        name.includes('sting') ||
        name.includes('red bull') ||
        name.includes('biscuit') ||
        name.includes('cookie') ||
        name.includes('maggi') ||
        name.includes('noodles') ||
        name.includes('chocolate') ||
        name.includes('kitkat') ||
        name.includes('crackle') ||
        name.includes('5 star') ||
        name.includes('gulab jamun') ||
        name.includes('rasgulla') ||
        name.includes('laddu') ||
        name.includes('badam') ||
        name.includes('kaju')
      );
    }
    return false;
  });

  // Fetch location on mount — show mandatory Play Store disclosure dialog first
  useEffect(() => {
    if (!coords) {
      // Show prominent disclosure before triggering OS permission prompt
      setShowLocationDisclosure(true);
    }
  }, []);

  // Auto-trigger Apple modal when customer is outside Joniha 5 KM geofence
  useEffect(() => {
    if (!isLocationLoading && isServiceable === false && coords !== null) {
      setShowNotServiceableModal(true);
    }
  }, [isServiceable, isLocationLoading, coords]);

  const handleBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / BANNER_WIDTH
    );
    if (slide !== activeBannerIndex && slide >= 0 && slide < PROMO_BANNERS.length) {
      setActiveBannerIndex(slide);
    }
  };

  const handleBentoPress = async (cat: BentoCategory) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/(customer)/search' as any);
  };

  const renderProductCard = (product: CartProduct, isRail = false) => {
    const qty = getItemQuantity(product.id);
    const discount =
      product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const isAvailable = product.is_available !== false && (product.stock_quantity === undefined || product.stock_quantity > 0) && (product.stock === undefined || product.stock > 0);
    const effectiveStock = isAvailable ? (product.stock_quantity ?? product.stock ?? 20) : 0;

    return (
      <TouchableOpacity
        key={product.id}
        style={[
          styles.productCard, 
          isRail && styles.productCardRail,
          !isAvailable && { opacity: 0.85 }
        ]}
        activeOpacity={0.92}
        onPress={() => router.push(`/(customer)/product/${product.id}` as any)}
      >
        {discount > 0 && isAvailable && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
          </View>
        )}

        <Image
          source={{ uri: product.image_url || product.image }}
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
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrpText}>₹{product.mrp}</Text>
            )}
          </View>

          <QuantityStepper
            quantity={qty}
            stock={effectiveStock}
            disabled={!isAvailable}
            onIncrement={() => addItem(product)}
            onDecrement={() => removeItem(product.id)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 14, paddingBottom: totalQuantity > 0 ? 120 : 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Apple Store-Grade Editorial Header */}
        <View style={styles.topBar}>
          <View style={styles.brandHeaderGroup}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogoMark}
            />
            <View>
              <Text style={styles.dateLabel}>HYPERLOCAL DISPATCH</Text>
              <Text style={styles.headerTitle}>Belzo</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/orders' as any)}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>🛍️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(customer)/profile' as any)}
              style={[
                styles.headerIconBtn,
                profile?.full_name ? styles.headerAvatarActive : null,
              ]}
              activeOpacity={0.7}
            >
              {profile?.full_name?.trim() ? (
                <Text style={styles.headerAvatarInitial}>
                  {profile.full_name.trim().charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Text style={{ fontSize: 16 }}>👤</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Location & Serviceability SLA Badge */}
        {isLocationLoading ? (
          <View style={styles.locationPillLoading}>
            <ShimmerSkeleton width={18} height={18} borderRadius={9} />
            <ShimmerSkeleton width={190} height={14} borderRadius={7} />
          </View>
        ) : isServiceable ? (
          <TouchableOpacity
            style={styles.locationPillServiceable}
            activeOpacity={0.75}
            onPress={() => setShowNotServiceableModal(true)}
          >
            <Text style={styles.lightningIcon}>⚡</Text>
            <Text numberOfLines={1} style={styles.locationTextServiceable}>
              Delivery in 12 Mins to{' '}
              <Text style={styles.boldAddress}>
                {addressText || 'Shahbajpur, Joniha'}
              </Text>
            </Text>
            <Text style={styles.chevronIcon}>▾</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.locationPillUnserviceable}
            activeOpacity={0.75}
            onPress={() => setShowNotServiceableModal(true)}
          >
            <Text style={styles.unserviceablePin}>📍</Text>
            <Text numberOfLines={1} style={styles.locationTextUnserviceable}>
              <Text style={styles.boldUnserviceable}>Not Delivering Here</Text>{' '}
              (Outside 5 KM)
            </Text>
            <Text style={styles.chevronIconUnserviceable}>▾</Text>
          </TouchableOpacity>
        )}

        {/* Search Bar (Tappable Glass Field) */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => router.push('/(customer)/search' as any)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search milk, bread, avocados, tech...
          </Text>
        </TouchableOpacity>

        {/* 1. Offer & Guarantee Carousel (Apple Squircles) */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleBannerScroll}
            contentContainerStyle={styles.carouselContainer}
          >
            {PROMO_BANNERS.map((banner) => (
              <LinearGradient
                key={banner.id}
                colors={banner.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoBanner}
              >
                <View style={styles.promoTagCapsule}>
                  <Text style={styles.promoTagText}>{banner.badge}</Text>
                </View>

                <Text style={styles.promoTitle}>{banner.title}</Text>
                <Text style={styles.promoSubtitle}>{banner.subtitle}</Text>

                <View style={styles.promoFooterRow}>
                  <View style={styles.hubChip}>
                    <Text style={styles.hubChipDot}>●</Text>
                    <Text style={styles.hubChipText}>{banner.tag}</Text>
                  </View>
                  <Text style={styles.promoOrderNow}>Tap to explore ➔</Text>
                </View>
              </LinearGradient>
            ))}
          </ScrollView>

          {/* Carousel Pagination Dots */}
          <View style={styles.paginationRow}>
            {PROMO_BANNERS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === activeBannerIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 2. Instamart 8-Grid Bento Category Matrix */}
        <View style={styles.bentoSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Explore Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/search' as any)}>
              <Text style={styles.seeAllText}>See all ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bentoGrid}>
            {INSTAMART_BENTO_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.88}
                onPress={() => handleBentoPress(cat)}
                style={[
                  styles.bentoCard,
                  { backgroundColor: cat.bgColor, borderColor: cat.borderColor },
                ]}
              >
                <View style={styles.bentoTopRow}>
                  <View style={styles.bentoImageWrapper}>
                    <Image
                      source={{ uri: cat.image }}
                      style={styles.bentoImage}
                    />
                  </View>
                </View>

                <View style={styles.bentoBottomContent}>
                  <Text numberOfLines={1} style={styles.bentoTitle}>
                    {cat.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.bentoSubtitle}>
                    {cat.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Shelf 1: Farm Fresh Harvest (cat-02-produce) */}
        <View style={styles.railSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>Farm Fresh Harvest</Text>
              <Text style={styles.sectionSubHeader}>
                Cold-Chain Verified • Harvested Today
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(customer)/search' as any)}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railScroll}
          >
            {VEGGIES_PRODUCTS.map((p) => renderProductCard(p, true))}
          </ScrollView>
        </View>

        {/* Shelf 2: Daily Kitchen Staples (cat-01-grocery) */}
        <View style={styles.railSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>Daily Kitchen Staples</Text>
              <Text style={styles.sectionSubHeader}>
                Joniha Essentials • Atta, Daal & Pure Oils
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(customer)/search' as any)}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railScroll}
          >
            {STAPLES_PRODUCTS.map((p) => renderProductCard(p, true))}
          </ScrollView>
        </View>

        {/* Shelf 3: Pizza, Burgers & Dhaba Meals (cat-03-food) */}
        <View style={styles.railSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>Pizza, Burgers & Dhaba Meals</Text>
              <Text style={styles.sectionSubHeader}>
                Warm Kulhad Pizza, Hot Thalis & Fresh Momos
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(customer)/search' as any)}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railScroll}
          >
            {FOOD_PRODUCTS.map((p) => renderProductCard(p, true))}
          </ScrollView>
        </View>

        {/* Shelf 4: Chilled Drinks & Instant Munchies (cat-01-grocery) */}
        <View style={styles.railSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>Chilled Drinks & Instant Munchies</Text>
              <Text style={styles.sectionSubHeader}>
                Chilled Sodas, Biscuits, Maggi & Sweet Treats
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(customer)/search' as any)}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railScroll}
          >
            {DRINKS_MUNCHIES_PRODUCTS.map((p) => renderProductCard(p, true))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating Apple Acrylic Cart Dock */}
      {totalQuantity > 0 && (
        <BottomCartPill
          itemCount={totalQuantity}
          totalPrice={netPayable}
          etaMinutes={12}
          onPress={() => router.push('/(customer)/cart' as any)}
          bottomOffset={insets.bottom + 12}
        />
      )}

      {/* Apple-grade Location Not Serviceable Modal */}
      <LocationNotServiceableModal
        visible={showNotServiceableModal}
        onClose={() => setShowNotServiceableModal(false)}
      />

      {/* Play Store Mandatory Prominent Location Disclosure */}
      <LocationDisclosureModal
        visible={showLocationDisclosure}
        onAllow={() => {
          setShowLocationDisclosure(false);
          fetchCurrentLocation();
        }}
        onDeny={() => setShowLocationDisclosure(false)}
      />

      {/* Elegant Complete Profile Sheet Modal */}
      <CompleteProfileSheet />
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
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  headerAvatarActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  headerAvatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF5E00',
  },
  locationPillLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 14,
    alignSelf: 'flex-start',
    gap: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  locationPillServiceable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 14,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  locationPillUnserviceable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 14,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 59, 48, 0.28)',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  lightningIcon: {
    fontSize: 13,
  },
  unserviceablePin: {
    fontSize: 13,
  },
  locationTextServiceable: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#1C1C1E',
    flexShrink: 1,
  },
  boldAddress: {
    fontWeight: '800',
    color: '#1C1C1E',
  },
  locationTextUnserviceable: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#D70015',
    flexShrink: 1,
  },
  boldUnserviceable: {
    fontWeight: '800',
    color: '#D70015',
  },
  chevronIcon: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 1,
  },
  chevronIconUnserviceable: {
    fontSize: 11,
    color: '#D70015',
    marginLeft: 1,
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

  // Carousel Styles
  carouselWrapper: {
    marginBottom: 20,
  },
  carouselContainer: {
    gap: 12,
  },
  promoBanner: {
    width: BANNER_WIDTH,
    borderRadius: 24, // 24px continuous squircle
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 145,
  },
  promoTagCapsule: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  promoTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 18,
  },
  promoFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hubChipDot: {
    color: '#FF5E00',
    fontSize: 9,
  },
  hubChipText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  promoOrderNow: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FF5E00',
  },

  // 8-Grid Bento Section
  bentoSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
  },
  sectionSubHeader: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    color: '#FF5E00',
    fontWeight: '700',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  bentoCard: {
    width: (width - 32 - 10) / 2, // 2-columns
    borderRadius: 24, // Apple continuous squircle (rounded-3xl)
    padding: 12,
    borderWidth: 0.5,
    minHeight: 114,
    justifyContent: 'space-between',
  },
  bentoTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  bentoImageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16, // rounded-2xl
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bentoImage: {
    width: 52,
    height: 52,
    resizeMode: 'cover',
  },
  bentoBottomContent: {
    marginTop: 6,
  },
  bentoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827', // text-gray-900
    letterSpacing: -0.2,
  },
  bentoSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280', // text-gray-500
    marginTop: 2,
  },

  // Product Rails
  railSection: {
    marginBottom: 26,
  },
  railScroll: {
    gap: 12,
    paddingRight: 16,
  },
  productCardRail: {
    width: 164,
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
    borderRadius: 22,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
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
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
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
