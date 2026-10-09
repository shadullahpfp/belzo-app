import { create } from 'zustand';
import { supabase } from '../src/lib/supabase';
import { CartProduct, useCartStore } from './useCartStore';
import { VERIFIED_CATALOG_PRODUCTS } from '../constants/catalog';

interface CatalogStore {
  products: CartProduct[];
  isLoading: boolean;
  isRealtimeActive: boolean;
  
  // Actions
  setProducts: (products: CartProduct[]) => void;
  updateProductInState: (updated: any) => void;
  addProductToState: (added: any) => void;
  fetchCatalog: () => Promise<void>;
  subscribeToRealtime: () => () => void;
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  products: VERIFIED_CATALOG_PRODUCTS,
  isLoading: false,
  isRealtimeActive: false,

  setProducts: (products) => set({ products }),

  updateProductInState: (updated) => {
    const { products } = get();
    const updatedId = updated.id;
    const newPrice = Number(updated.price);
    const newDiscountPrice = updated.discount_price ? Number(updated.discount_price) : undefined;
    const isAvailable = updated.is_available !== undefined 
      ? Boolean(updated.is_available) 
      : (updated.stock_quantity !== undefined ? updated.stock_quantity > 0 : true);
    const newStock = updated.stock_quantity !== undefined ? Number(updated.stock_quantity) : undefined;

    const nextProducts = products.map((p) => {
      // Match by id or by slug if id was mapped
      if (p.id === updatedId || (p.slug && p.slug === updated.slug)) {
        return {
          ...p,
          price: newDiscountPrice ?? newPrice ?? p.price,
          mrp: newPrice > (newDiscountPrice ?? newPrice) ? newPrice : p.mrp,
          stock: newStock ?? p.stock,
          stock_quantity: newStock ?? p.stock_quantity,
          is_available: isAvailable,
          unit: updated.unit || p.unit,
          name: updated.name || p.name,
          image: updated.image_url || p.image,
          description: updated.description || p.description,
        };
      }
      return p;
    });

    set({ products: nextProducts });

    // Instantly notify and sync customer cart
    useCartStore.getState().handleProductUpdate({
      id: updatedId,
      price: newDiscountPrice ?? newPrice,
      is_available: isAvailable,
      stock_quantity: newStock,
      name: updated.name,
    });
  },

  addProductToState: (added) => {
    const { products } = get();
    if (products.some((p) => p.id === added.id)) return;

    const newProd: CartProduct = {
      id: added.id,
      name: added.name,
      unit: added.unit || '1 pc',
      price: added.discount_price ? Number(added.discount_price) : Number(added.price),
      mrp: Number(added.price),
      stock: added.stock_quantity ?? 20,
      stock_quantity: added.stock_quantity ?? 20,
      is_available: Boolean(added.is_available ?? true),
      image: added.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      category_id: added.category_id || 'grocery',
      description: added.description || '',
    };

    set({ products: [newProd, ...products] });
  },

  fetchCatalog: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Merge Supabase catalog with verified local catalog
        const remoteMap = new Map(data.map((p) => [p.id, p]));
        const merged = get().products.map((p) => {
          const remote = remoteMap.get(p.id);
          if (remote) {
            remoteMap.delete(p.id);
            return {
              ...p,
              price: remote.discount_price ? Number(remote.discount_price) : Number(remote.price),
              mrp: Number(remote.price),
              stock: remote.stock_quantity ?? p.stock,
              stock_quantity: remote.stock_quantity ?? p.stock_quantity,
              is_available: Boolean(remote.is_available),
              unit: remote.unit || p.unit,
              name: remote.name || p.name,
              image: remote.image_url || p.image,
              description: remote.description || p.description,
            };
          }
          return p;
        });

        // Add any remaining remote products not present locally
        remoteMap.forEach((remote) => {
          merged.push({
            id: remote.id,
            name: remote.name,
            unit: remote.unit || '1 pc',
            price: remote.discount_price ? Number(remote.discount_price) : Number(remote.price),
            mrp: Number(remote.price),
            stock: remote.stock_quantity ?? 20,
            stock_quantity: remote.stock_quantity ?? 20,
            is_available: Boolean(remote.is_available),
            image: remote.image_url,
            category_id: remote.category_id,
            description: remote.description,
          });
        });

        set({ products: merged });
      }
    } catch (err) {
      console.warn('[useCatalogStore] Fetch catalog note:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToRealtime: () => {
    // Establish a Supabase Realtime subscription on public:products
    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          const updatedProduct = payload.new;
          get().updateProductInState(updatedProduct);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload) => {
          get().addProductToState(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ isRealtimeActive: true });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      set({ isRealtimeActive: false });
    };
  },
}));
