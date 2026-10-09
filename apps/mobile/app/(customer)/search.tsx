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
import { VERIFIED_CATALOG_PRODUCTS } from '../../constants/catalog';

const CATEGORIES = [
  'All',
  'Grocery',
  'Fruits & Vegetables',
  'Food & Restaurant',
  'Medicine & Healthcare',
  'Fashion',
  'Electronics',
];


/**
 * Localized search taxonomy covering English, transliterated Hindi, and regional terms.
 */
const SEARCH_SYNONYMS: Record<string, string[]> = {
  // Vegetables & Mandi
  aloo: ['alu', 'potato', 'potatoes', 'pahadi aloo', 'desi aloo', 'anand aloo'],
  alu: ['aloo', 'potato', 'potatoes'],
  potato: ['aloo', 'alu'],
  pyaz: ['pyaj', 'onion', 'onions', 'lal pyaz', 'kanda'],
  pyaj: ['pyaz', 'onion', 'onions', 'lal pyaz', 'kanda'],
  onion: ['pyaz', 'pyaj', 'lal pyaz'],
  tamatar: ['tomato', 'tomatoes', 'desi tamatar', 'lal tamatar'],
  tomato: ['tamatar', 'desi tamatar'],
  baingan: ['baigan', 'brinjal', 'eggplant', 'gol baingan', 'nemi baingan', 'bharta'],
  baigan: ['baingan', 'brinjal', 'eggplant'],
  brinjal: ['baingan', 'baigan'],
  kheera: ['cucumber', 'kakdi', 'salad'],
  cucumber: ['kheera', 'kakdi'],
  bhindi: ['okra', 'lady finger', 'komal bhindi', 'bhendi'],
  okra: ['bhindi', 'lady finger'],
  lauki: ['bottle gourd', 'ghiya', 'doodhi', 'taza lauki'],
  mirch: ['chilli', 'chili', 'hari mirch', 'teekhi', 'green chilli', 'lal mirch'],
  chilli: ['mirch', 'hari mirch', 'lal mirch'],
  adrak: ['ginger', 'desi adrak', 'chai adrak'],
  ginger: ['adrak', 'desi adrak'],
  karela: ['bitter gourd', 'desi karela'],
  kaddu: ['pumpkin', 'sitaphal', 'meetha kaddu'],
  parwal: ['parval', 'pointed gourd'],
  tori: ['turai', 'ridge gourd'],
  gobhi: ['phoolgobhi', 'cauliflower', 'gobi'],
  phoolgobhi: ['cauliflower', 'gobhi', 'gobi'],
  dhaniya: ['coriander', 'cilantro', 'hara dhaniya'],
  mushroom: ['button mushroom', 'mashroom'],

  // Pizza, Momos & Bakery
  'kulhad pizza': ['kulhad', 'pizza', 'paradise'],
  'cheese pizza': ['cheese', 'pizza', 'mozzarella', 'overloaded'],
  pizza: ['kulhad pizza', 'cheese pizza', 'paneer tikka pizza', 'combo'],
  pasta: ['macaroni', 'penne', 'white sauce', 'red sauce'],
  momos: ['momo', 'paneer momos', 'dimsum', 'fried momos'],
  momo: ['momos', 'fried momos'],
  cake: ['birthday cake', 'lava cake', 'black forest'],
  'lava cake': ['choco lava', 'lava', 'cake', 'chocolate cake'],

  // Dhaba Kitchen & Meals
  thali: ['dhaba thali', 'saada thali', 'special thali', 'meal', 'lunch', 'dinner'],
  paneer: ['paneer tikka', 'kadhai paneer', 'paneer pizza', 'paneer momos'],
  'dal tadka': ['dal', 'daal', 'yellow dal', 'tadka', 'butter dal'],
  dal: ['dal tadka', 'arhar daal', 'daal', 'toor dal'],
  daal: ['dal', 'dal tadka', 'arhar daal'],
  roti: ['tandoor', 'butter roti', 'chapati', 'tandoori'],
  paratha: ['aloo paratha', 'desi paratha', 'parantha'],
  chawal: ['rice', 'basmati', 'jeera rice', 'fried rice'],
  rice: ['chawal', 'basmati', 'jeera rice'],

  // Mithai & Chocolates
  'gulab jamun': ['gulab', 'jamun', 'mithai', 'sweet'],
  rasgulla: ['chena rasgulla', 'rosogolla', 'mithai', 'white rasgulla'],
  rajbhog: ['kesar rajbhog', 'mithai', 'saffron sweet'],
  laddu: ['ladoo', 'besan laddu', 'mithai', 'shuddh besan'],
  ladoo: ['laddu', 'besan laddu'],
  kitkat: ['kit kat', 'wafer', 'nestle', 'chocolate'],
  'dairy milk': ['cadbury', 'crackle', 'chocolate', 'milk chocolate'],
  '5 star': ['five star', '5star', 'cadbury', 'chocolate'],
  chocolate: ['dairy milk', 'kitkat', '5 star', 'dark fantasy', 'lava cake'],

  // Kirana, Oils & Spices
  'sarso tel': ['mustard oil', 'kachi ghani', 'tel', 'sarson'],
  sarson: ['sarso tel', 'mustard oil'],
  tel: ['oil', 'sarso', 'fortune', 'nutrela', 'mustard oil'],
  oil: ['tel', 'sarso', 'fortune', 'nutrela', 'refined oil'],
  fortune: ['refined oil', 'oil', 'tel', 'sunflower'],
  goldi: ['haldi', 'mirch', 'dhaniya', 'masala', 'garam masala', 'chaat masala', 'kitchen king', 'sabji masala'],
  haldi: ['turmeric', 'goldi haldi'],
  turmeric: ['haldi'],
  maggi: ['noodles', 'masala noodles', 'instant noodles', '2 minute'],
  noodles: ['maggi', 'chowmein', 'hakka noodles'],
  campa: ['campa cola', 'cola', 'cold drink', 'desi cola'],
  sting: ['energy drink', 'beverage', 'red drink', 'cold drink'],
  kaju: ['cashew', 'cashews', 'tukda', 'dry fruit'],
  cashew: ['kaju'],
  badam: ['almond', 'almonds', 'california badam', 'dry fruit'],
  almond: ['badam'],
  makhana: ['fox nuts', 'phool makhana', 'lotus seeds'],
  namkeen: ['bhujia', 'bikaner bhujia', 'sev'],
  bhujia: ['namkeen', 'bikaner bhujia', 'sev'],
  biscuit: ['parle-g', 'dark fantasy', 'cookie'],
  chai: ['tea', 'tata agni', 'taaza tea', 'patti'],
  tea: ['chai', 'tata tea', 'taaza'],
  cheeni: ['sugar', 'shakkar', 'chini'],
  sugar: ['cheeni', 'shakkar'],
  namak: ['salt', 'tata namak', 'tata salt'],
  salt: ['namak', 'tata namak'],
  besan: ['chana besan', 'gram flour'],
  maida: ['fine flour', 'flour'],
  sooji: ['suji', 'rawa', 'semolina'],
  poha: ['thick poha', 'chiwda'],

  // Electronics & Mobiles
  vivo: ['vivo v60e', 'vivo v40 pro', 'smartphone', 'mobile', '5g phone'],
  nokia: ['nokia 105', 'keypad phone', 'feature phone', 'classic', 'phone'],
  realme: ['realme 15x', 'realme buds', 'neckband', 'smartphone', '5g phone'],
  oppo: ['oppo k14x', 'smartphone', 'mobile', '5g phone'],
  redmi: ['redmi 15c', 'xiaomi', 'smartphone', 'mobile', '5g phone'],
  mobile: ['smartphone', 'phone', '5g', 'vivo', 'realme', 'oppo', 'redmi', 'nokia'],
  smartphone: ['mobile', 'phone', '5g', 'vivo', 'realme', 'oppo', 'redmi'],
  phone: ['mobile', 'smartphone', 'nokia', 'vivo', 'realme', 'oppo', 'redmi'],
  charger: ['power adapter', 'fast power adapter', 'dock charger', 'apple 20w', 'supervooc', '120w', 'tc-21', 'erd'],
  adapter: ['charger', 'power adapter', 'supervooc', 'apple 20w', '120w', 'tc-21', 'erd'],
  earbuds: ['tws', 'air dopes', 'nord buds', 'nothing buds', 'cmf', 'boat', 'wireless'],
  tws: ['earbuds', 'nord buds', 'nothing buds', 'cmf', 'boat', 'airdopes'],
  neckband: ['realme buds', 'wireless z3', 'earphones', 'bluetooth'],
  headphones: ['p9 wireless', 'headphone', 'over-ear', 'bluetooth'],
  soundbar: ['soroo', 'speaker', 'tv soundbar', 'bluetooth'],
  speaker: ['cricket ball speaker', 'cyomi', 'soundbar', 'megaphone', 'bhonpu'],
  bhonpu: ['megaphone', 'da bhonpu', 'yoroto', 'loud'],
  smartwatch: ['watch', 'protec', 'fall detection', 'safety watch'],
  vacuum: ['car vacuum', 'mini vacuum', 'cleaner', 'cordless'],
  dryer: ['hair dryer', 'nova-nx', 'blower'],

  // Medicine & Baby Healthcare
  cerelac: ['nestle cerelac', 'baby food', 'baby cereal', 'wheat apple', 'mixed fruit'],
  horlicks: ['chocolate delight', 'nutrition drink', 'health drink', 'malt'],
  complan: ['chocolate drink', 'milk protein', 'nutrition formula'],
  amulspray: ['infant milk', 'baby milk', 'milk powder', 'amul'],
  dettol: ['antiseptic', 'first aid', 'liquid', 'germ defence'],
  chyawanprash: ['dabur', 'ayurvedic', 'immunity', '3x immunity'],
  zandu: ['zandu balm', 'pain relief', 'balm', 'headache'],
  iodex: ['iodex balm', 'body pain', 'balm', 'back pain'],
  candid: ['dusting powder', 'antifungal', 'skin solution', 'powder'],
  eno: ['acidity', 'gas relief', 'sixer pack', 'sachet'],
  'dermi cool': ['dermicool', 'cooling powder', 'prickly heat', 'neem tulsi'],
  'all out': ['mosquito', 'refill', 'liquid refill', 'machhar'],
  gripe: ['gripe water', 'dabur gripe', 'infant digestive'],
  ghunti: ['janma ghunti', 'dabur ghunti', 'infant tonic'],

  // Beverages & Cold Drinks
  'red bull': ['redbull', 'energy drink', 'energy can'],
  'mountain dew': ['dew', 'cold drink', 'soft drink', 'soda'],
  'thums up': ['toofan', 'charged cola', 'cold drink', 'cola'],
  sprite: ['lemon lime', 'soda', 'cold drink'],
  maaza: ['mango drink', 'frooti', 'cold drink', 'mango pulp'],

  // Fast Food & Snacks
  frankie: ['paneer frankie', 'roll', 'wrap', 'bala ji'],
  burger: ['aloo tikki burger', 'tikki burger', 'burger'],
  'garlic bread': ['stuffed garlic bread', 'bread', 'pizza paradise'],

  // Fashion & Lifestyle
  sofa: ['inflatable sofa', 'ottoman', 'chair', 'lounge'],
  socks: ['cotton socks', 'ankle socks', 'pure cotton'],
};

/**
 * Checks whether a product matches a search query using direct text and taxonomy expansion.
 */
function productMatchesQuery(p: CartProduct, rawQuery: string): boolean {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;

  const pName = p.name.toLowerCase();
  const pDesc = (p.description || '').toLowerCase();
  const pCat = (p.category || '').toLowerCase();
  const pCatId = (p.category_id || '').toLowerCase();
  const pTags = (p.tags || []).map((t) => t.toLowerCase());
  const pSearchTags = (p.search_tags || []).map((t) => t.toLowerCase());

  // 1. Direct text inclusion
  if (
    pName.includes(q) ||
    pDesc.includes(q) ||
    pCat.includes(q) ||
    pCatId.includes(q) ||
    pTags.some((t) => t.includes(q)) ||
    pSearchTags.some((t) => t.includes(q))
  ) {
    return true;
  }

  // 2. Query words token match
  const qTokens = q.split(/\s+/).filter(Boolean);
  const allProductText = `${pName} ${pDesc} ${pCat} ${pTags.join(' ')} ${pSearchTags.join(' ')}`;
  const allTokensMatch = qTokens.every((token) => allProductText.includes(token));
  if (allTokensMatch) {
    return true;
  }

  // 3. Synonym / Taxonomy expansion match
  const expandedTerms = new Set<string>();
  if (SEARCH_SYNONYMS[q]) {
    SEARCH_SYNONYMS[q].forEach((s) => expandedTerms.add(s.toLowerCase()));
  }
  for (const token of qTokens) {
    if (SEARCH_SYNONYMS[token]) {
      SEARCH_SYNONYMS[token].forEach((s) => expandedTerms.add(s.toLowerCase()));
    }
  }

  for (const term of expandedTerms) {
    if (
      pName.includes(term) ||
      pDesc.includes(term) ||
      pTags.some((t) => t.includes(term)) ||
      pSearchTags.some((t) => t.includes(term))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Filter product by selected category pill.
 */
function productMatchesCategory(p: CartProduct, category: string): boolean {
  if (category === 'All') return true;
  const sel = category.toLowerCase();
  const cat = (p.category || '').toLowerCase();
  const catId = (p.category_id || '').toLowerCase();

  if (sel === 'grocery') {
    return (
      catId === 'cat-01-grocery' ||
      cat === 'grocery' ||
      catId === 'grocery' ||
      catId === 'c0000000-0000-0000-0000-000000000002' ||
      catId === 'staples' ||
      catId === 'spices' ||
      catId === 'drinks' ||
      catId === 'sweets' ||
      catId === 'munchies' ||
      cat.includes('kirana') ||
      cat.includes('staple') ||
      cat.includes('masale') ||
      cat.includes('spice') ||
      cat.includes('drink') ||
      cat.includes('mithai') ||
      cat.includes('munchies')
    );
  }

  if (sel === 'fruits & vegetables') {
    return (
      catId === 'cat-02-produce' ||
      cat === 'fruits & vegetables' ||
      catId === 'produce' ||
      catId === 'fruits-vegetables' ||
      catId === 'c0000000-0000-0000-0000-000000000001' ||
      cat.includes('sabzi') ||
      cat.includes('mandi') ||
      cat.includes('produce') ||
      cat.includes('vegetable')
    );
  }

  if (sel === 'food & restaurant') {
    return (
      catId === 'cat-03-food' ||
      cat === 'food & restaurant' ||
      catId === 'food' ||
      catId === 'food-restaurant' ||
      catId === 'fastfood' ||
      catId === 'meals' ||
      catId === 'c0000000-0000-0000-0000-000000000006' ||
      catId === 'c0000000-0000-0000-0000-000000000007' ||
      cat.includes('pizza') ||
      cat.includes('dhaba') ||
      cat.includes('restaurant') ||
      cat.includes('momos')
    );
  }

  if (sel === 'medicine & healthcare') {
    return (
      catId === 'cat-04-pharma' ||
      cat === 'medicine & healthcare' ||
      catId === 'pharma' ||
      cat.includes('medicine') ||
      cat.includes('pharma') ||
      cat.includes('health')
    );
  }

  if (sel === 'fashion') {
    return (
      catId === 'cat-05-fashion' ||
      cat === 'fashion' ||
      catId === 'fashion' ||
      cat.includes('fashion') ||
      cat.includes('wear') ||
      cat.includes('cloth')
    );
  }

  if (sel === 'electronics') {
    return (
      catId === 'cat-06-electronics' ||
      cat === 'electronics' ||
      catId === 'electronics' ||
      cat.includes('electronic') ||
      cat.includes('tech')
    );
  }

  return cat.includes(sel) || catId.includes(sel);
}

/**
 * Executes a Supabase search with an enforced 500ms timeout race.
 * Prevents hanging DNS/network requests from holding the UI in infinite skeleton loading.
 */
async function fetchSupabaseProductsWithTimeout(searchQuery: string, timeoutMs = 500) {
  const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
    setTimeout(() => resolve({ data: null, error: new Error('Supabase search timeout') }), timeoutMs)
  );

  const queryPromise = (async () => {
    try {
      const response = await supabase
        .from('products')
        .select('*')
        .or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category_id.ilike.%${searchQuery}%`
        )
        .limit(30);
      return response;
    } catch (err: any) {
      return { data: null, error: err };
    }
  })();

  return Promise.race([queryPromise, timeoutPromise]);
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<CartProduct[]>(VERIFIED_CATALOG_PRODUCTS);

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
        const cleanQuery = query.trim();

        // 1. Initial filtered baseline from verified in-memory catalog
        let fallbackMatches = VERIFIED_CATALOG_PRODUCTS;

        if (selectedCategory !== 'All') {
          fallbackMatches = fallbackMatches.filter((p) =>
            productMatchesCategory(p, selectedCategory)
          );
        }

        if (cleanQuery) {
          fallbackMatches = fallbackMatches.filter((p) =>
            productMatchesQuery(p, cleanQuery)
          );
        }

        // 2. Attempt Supabase direct live lookup with strict 500ms race
        if (cleanQuery) {
          try {
            const { data, error } = await fetchSupabaseProductsWithTimeout(cleanQuery, 500);

            if (!error && data && data.length > 0) {
              const mapped: CartProduct[] = data.map((d: any) => ({
                id: d.id,
                name: d.name,
                unit: d.unit || '1 pc',
                price: Number(d.discount_price ?? d.price),
                mrp: Number(d.price),
                stock: d.stock_quantity || 20,
                stock_quantity: d.stock_quantity || 20,
                is_available: d.is_available ?? true,
                image:
                  d.image_url ||
                  d.media_urls?.[0] ||
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
                description: d.description || '',
                category: d.category_id || 'Grocery',
                category_id: d.category_id,
              }));

              let finalResults = mapped;
              if (selectedCategory !== 'All') {
                finalResults = mapped.filter((p) =>
                  productMatchesCategory(p, selectedCategory)
                );
              }

              // Use Supabase data if matches found, otherwise fallback cleanly
              setResults(finalResults.length > 0 ? finalResults : fallbackMatches);
              return;
            }
          } catch (supaErr) {
            console.warn('[Search] Falling back to in-memory catalog:', supaErr);
          }
        }

        // Fallback or empty query results
        setResults(fallbackMatches);
      } catch (err) {
        console.warn('[Search] Unhandled search error:', err);
        setResults(VERIFIED_CATALOG_PRODUCTS);
      } finally {
        // ALWAYS clear skeleton loading in finally block
        setIsSearching(false);
      }
    }, 200);

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
      {/* Top Search Sticky Bar (Apple HIG Glass) */}
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
              placeholder="Search vivo, pizza, horlicks, dettol, aloo, tel..."
              placeholderTextColor="#8E8E93"
              autoFocus
              clearButtonMode="while-editing"
              style={styles.searchInput}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter Pills */}
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
              Try searching for "Vivo", "Kulhad Pizza", "Horlicks", "Dettol", or "Maggi".
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
                  activeOpacity={0.92}
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
          etaMinutes={12}
          onPress={() => router.push('/(customer)/cart' as any)}
          bottomOffset={insets.bottom + 12}
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
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
    backgroundColor: '#FF5E00',
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
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
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
