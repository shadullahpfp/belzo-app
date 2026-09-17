import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

export interface CartProduct {
  id: string;
  name: string;
  unit: string;
  price: number;
  mrp?: number;
  stock?: number;
  stock_quantity?: number;
  image?: string;
  media_urls?: string[];
  category?: string;
  category_id?: string;
  description?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  recipient_name: string;
  recipient_phone: string;
  house_flat_no: string;
  floor?: string;
  apartment_road_area: string;
  landmark?: string;
  city: string;
  postal_code: string;
  lat?: number;
  lng?: number;
  is_default?: boolean;
}

interface CartStore {
  items: CartItem[];
  selectedAddress: Address | null;
  deliveryInstructions: string;
  
  // Computed values
  itemsTotal: number;
  deliveryFee: number;
  platformFee: number;
  netPayable: number;
  totalQuantity: number;
  freeDeliveryThreshold: number;
  freeDeliveryShortfall: number;

  // Actions
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setAddress: (address: Address | null) => void;
  setDeliveryInstructions: (instructions: string) => void;
  getItemQuantity: (productId: string) => number;
}

const FREE_DELIVERY_THRESHOLD = 199;
const STANDARD_DELIVERY_FEE = 25;
const PLATFORM_FEE = 5;

const DEFAULT_ADDRESS: Address = {
  id: 'addr-default-1',
  label: 'Home',
  recipient_name: 'Rahul Sharma',
  recipient_phone: '+91 98765 43210',
  house_flat_no: 'Flat 402, Tower B',
  floor: '4th Floor',
  apartment_road_area: 'Prestige Meridian, 100ft Road, Indiranagar',
  landmark: 'Near Metro Station Pillar 84',
  city: 'Bengaluru',
  postal_code: '560038',
  lat: 12.9716,
  lng: 77.5946,
  is_default: true,
};

function computeTotals(items: CartItem[]) {
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee =
    itemsTotal === 0 ? 0 : itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const platformFee = itemsTotal === 0 ? 0 : PLATFORM_FEE;
  const netPayable = itemsTotal + deliveryFee + platformFee;
  const freeDeliveryShortfall = Math.max(0, FREE_DELIVERY_THRESHOLD - itemsTotal);

  return {
    itemsTotal,
    deliveryFee,
    platformFee,
    netPayable,
    totalQuantity,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    freeDeliveryShortfall,
  };
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  selectedAddress: DEFAULT_ADDRESS,
  deliveryInstructions: 'Leave with security guard if unavailable',
  ...computeTotals([]),

  addItem: (product: CartProduct) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    let newItems: CartItem[];
    if (existingIndex > -1) {
      newItems = items.map((i, idx) =>
        idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...items, { product, quantity: 1 }];
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    set({
      items: newItems,
      ...computeTotals(newItems),
    });
  },

  removeItem: (productId: string) => {
    const { items } = get();
    const existing = items.find((i) => i.product.id === productId);
    if (!existing) return;

    let newItems: CartItem[];
    if (existing.quantity > 1) {
      newItems = items.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
      );
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    } else {
      newItems = items.filter((i) => i.product.id !== productId);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }

    set({
      items: newItems,
      ...computeTotals(newItems),
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    const { items } = get();
    let newItems: CartItem[];

    if (quantity <= 0) {
      newItems = items.filter((i) => i.product.id !== productId);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    } else {
      const existing = items.find((i) => i.product.id === productId);
      if (existing) {
        newItems = items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        );
      } else {
        return;
      }
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }

    set({
      items: newItems,
      ...computeTotals(newItems),
    });
  },

  clearCart: () => {
    set({
      items: [],
      ...computeTotals([]),
    });
  },

  setAddress: (address: Address | null) => {
    set({ selectedAddress: address });
  },

  setDeliveryInstructions: (instructions: string) => {
    set({ deliveryInstructions: instructions });
  },

  getItemQuantity: (productId: string) => {
    const item = get().items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  },
}));
