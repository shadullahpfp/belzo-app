'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Check,
  X,
  Package,
  RefreshCw,
  Tag,
  DollarSign,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { supabase, JONIHA_HUB_ID } from '../../../lib/supabase';
import { ImageUploader } from '../../../components/ImageUploader';

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category: string;
  unit: string;
  price: number;
  discount_price?: number;
  mrp: number;
  stock: number;
  is_available: boolean;
  image: string;
  sku: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const CANONICAL_CATEGORIES = [
  'Grocery',
  'Fruits & Vegetables',
  'Food & Restaurant',
  'Medicine',
  'Fashion',
  'Electronics',
];

export default function InventoryPricingPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDiscountPrice, setEditDiscountPrice] = useState<string>('');

  // Quick Add Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newMrp, setNewMrp] = useState('');
  const [newStock, setNewStock] = useState('25');
  const [newImageUrl, setNewImageUrl] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch live categories & products from Supabase (Zero-Cache, Full-Catalog, Resilient Query)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Fetch all active/existing Categories
      const { data: catsData, error: catsErr } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('sort_order', { ascending: true });

      if (catsErr) {
        console.warn('[Operator Inventory] Categories query notice:', catsErr.message);
      }

      const cats: CategoryOption[] = catsData || [];
      setCategoriesList(cats);
      if (cats.length > 0 && !newCatId) {
        setNewCatId(cats[0].id);
      }

      // Helper to resolve category display name without join dependency
      const resolveCategoryName = (p: any): string => {
        if (p.categories?.name) return p.categories.name;
        if (p.category_id) {
          const matched = cats.find(
            (c) => c.id === p.category_id || c.slug === p.category_id
          );
          if (matched) return matched.name;
          const cid = String(p.category_id).toLowerCase();
          if (cid.includes('produce') || cid.includes('sabzi')) return 'Fruits & Vegetables';
          if (cid.includes('grocery') || cid.includes('kirana')) return 'Grocery';
          if (cid.includes('food') || cid.includes('meals')) return 'Food & Restaurant';
          if (cid.includes('pharma') || cid.includes('medicine')) return 'Medicine';
          if (cid.includes('fashion')) return 'Fashion';
          if (cid.includes('electronics')) return 'Electronics';
        }
        return 'General';
      };

      // Resilient Product Query: select('*') prevents PostgREST relationship join errors
      let { data: prodsData, error: prodsErr } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', JONIHA_HUB_ID)
        .order('name', { ascending: true });

      // Fallback: If store_id query returned nothing or errored, fetch all products across store
      if (prodsErr || !prodsData || prodsData.length === 0) {
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (fallbackData && fallbackData.length > 0) {
          prodsData = fallbackData;
          prodsErr = null;
        } else if (fallbackErr) {
          prodsErr = fallbackErr;
        }
      }

      if (prodsErr) {
        setErrorMessage(prodsErr.message || 'Failed to retrieve products from Supabase');
      }

      if (prodsData && prodsData.length > 0) {
        const mapped: InventoryItem[] = prodsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category_id: p.category_id,
          category: resolveCategoryName(p),
          unit: p.unit || '1 pc',
          price: Number(p.price) || 0,
          discount_price: p.discount_price ? Number(p.discount_price) : undefined,
          mrp: Number(p.price) ? Math.round(Number(p.price) * 1.2) : 0,
          stock: Number(p.stock_quantity ?? p.stock ?? 0),
          is_available: p.is_available ?? true,
          image:
            p.image_url ||
            (p.media_urls && p.media_urls[0]) ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
          sku: `SKU-${p.id.slice(0, 6).toUpperCase()}`,
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.warn('[Operator Inventory] Error fetching products:', err);
      setErrorMessage(err?.message || 'Unexpected network error fetching catalog');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [newCatId]);

  useEffect(() => {
    loadData();

    // Subscribe to products table realtime updates
    const channel = supabase
      .channel('operator-products-stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Robust category matching for tabs
  const matchesCategoryTab = (itemCategory: string, tab: string) => {
    if (tab.startsWith('All')) return true;
    const itemNorm = itemCategory.toLowerCase();
    const tabNorm = tab.toLowerCase();

    if (itemNorm === tabNorm) return true;
    if (tabNorm === 'fruits & vegetables' || tabNorm === 'produce') {
      return (
        itemNorm.includes('fruit') ||
        itemNorm.includes('vegetable') ||
        itemNorm.includes('sabzi') ||
        itemNorm.includes('produce')
      );
    }
    if (tabNorm === 'medicine' || tabNorm === 'pharma') {
      return (
        itemNorm.includes('medicine') ||
        itemNorm.includes('pharma') ||
        itemNorm.includes('healthcare')
      );
    }
    if (tabNorm === 'food & restaurant' || tabNorm === 'food') {
      return (
        itemNorm.includes('food') ||
        itemNorm.includes('restaurant') ||
        itemNorm.includes('kitchen') ||
        itemNorm.includes('meal') ||
        itemNorm.includes('pizza')
      );
    }
    if (tabNorm === 'grocery') {
      return (
        itemNorm.includes('grocery') ||
        itemNorm.includes('kirana') ||
        itemNorm.includes('staples') ||
        itemNorm.includes('oil') ||
        itemNorm.includes('spices')
      );
    }
    if (tabNorm === 'fashion') return itemNorm.includes('fashion');
    if (tabNorm === 'electronics') return itemNorm.includes('electronic');

    return itemNorm.includes(tabNorm);
  };

  // Build category tabs with total item count
  const allTabs = [
    `All (${items.length})`,
    ...CANONICAL_CATEGORIES,
    ...categoriesList
      .map((c) => c.name)
      .filter((n) => !CANONICAL_CATEGORIES.some((canon) => canon.toLowerCase() === n.toLowerCase())),
  ];

  const filteredItems = items.filter((item) => {
    const matchesCat = matchesCategoryTab(item.category, selectedCat);
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Single-Click Stock Switch: In Stock vs Sold Out -> Live Supabase UPDATE
  const handleToggleStock = async (itemId: string) => {
    const currentItem = items.find((i) => i.id === itemId);
    if (!currentItem) return;
    const nextAvailability = !currentItem.is_available;

    // Optimistic local state update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              is_available: nextAvailability,
              stock: nextAvailability ? Math.max(i.stock, 5) : 0,
            }
          : i
      )
    );

    showToast(
      nextAvailability
        ? `Marked "${currentItem.name}" as In Stock`
        : `Marked "${currentItem.name}" as Sold Out`
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_available: nextAvailability,
          stock_quantity: nextAvailability ? Math.max(currentItem.stock, 5) : 0,
        })
        .eq('id', itemId);

      if (error) {
        console.warn('Supabase stock toggle error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase stock update error:', err);
    }
  };

  // Start inline editing
  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditPrice(item.price.toString());
    setEditDiscountPrice(
      item.discount_price ? item.discount_price.toString() : ''
    );
  };

  // Save inline edit -> commits update to Supabase products & broadcasts
  const saveEditing = async (itemId: string) => {
    const p = parseFloat(editPrice);
    const dp = editDiscountPrice ? parseFloat(editDiscountPrice) : undefined;

    if (!isNaN(p) && p > 0) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                price: p,
                discount_price: dp && !isNaN(dp) ? dp : undefined,
              }
            : i
        )
      );

      try {
        const { error } = await supabase
          .from('products')
          .update({
            price: p,
            discount_price: dp && !isNaN(dp) ? dp : null,
          })
          .eq('id', itemId);

        if (error) {
          console.warn('Supabase price update error:', error.message);
        } else {
          showToast('Price updated & broadcast live! 🏷️');
        }
      } catch (err) {
        console.warn('Supabase price update error:', err);
      }
    }
    setEditingId(null);
  };

  // Quick Add Product -> inserts real row into Supabase products table
  const handleQuickAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim() || !newUnit.trim()) {
      alert('Please fill in Product Name, Unit, and Price.');
      return;
    }

    const p = parseFloat(newPrice);
    const m = newMrp ? parseFloat(newMrp) : undefined;
    const stk = parseInt(newStock) || 25;
    const resolvedCatId =
      newCatId || (categoriesList[0] ? categoriesList[0].id : null);

    setIsSubmitting(true);
    try {
      const payload: any = {
        store_id: JONIHA_HUB_ID,
        category_id: resolvedCatId,
        name: newName.trim(),
        unit: newUnit.trim(),
        price: p,
        discount_price: m ? p : null,
        stock_quantity: stk,
        is_available: stk > 0,
        image_url:
          newImageUrl.trim() ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        description:
          newDescription.trim() ||
          `Fresh stock available at Joniha Central Hub. Unit: ${newUnit.trim()}.`,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert(`Error adding product: ${error.message}`);
      } else {
        showToast(`Added "${newName.trim()}" to Joniha Catalog! ✨`);
        setShowAddModal(false);
        setNewName('');
        setNewDescription('');
        setNewUnit('');
        setNewPrice('');
        setNewMrp('');
        setNewImageUrl('');
        loadData();
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search & Quick Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-black/5 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="text-xl font-extrabold text-gray-950 tracking-tight">
            Catalog & Price Controller
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Joniha Central Hub 01 • Instant stock switches, direct image file uploads, and real-time prices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
            title="Refresh catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.97] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Quick Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog, SKU, category, electronics..."
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5E00] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {allTabs.map((cat) => {
            const isSelected =
              selectedCat === cat || (cat.startsWith('All') && selectedCat === 'All');
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat.startsWith('All') ? 'All' : cat)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                    : 'bg-white text-gray-600 border-black/5 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Informative Error Banner if Supabase query encounters issues */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-700 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-bold">Catalog Sync Notice</p>
              <p className="text-red-600 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs shrink-0 transition-all cursor-pointer shadow-sm"
          >
            Retry Database Sync
          </button>
        </div>
      )}

      {/* Inventory Table Container */}
      <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Item / Direct Photo Upload</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pack Unit</th>
                <th className="py-3.5 px-4">Selling Price (₹)</th>
                <th className="py-3.5 px-4">Stock Qty</th>
                <th className="py-3.5 px-4">Store Availability</th>
                <th className="py-3.5 px-4 text-right">Quick Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50/60 transition-colors ${
                    !item.is_available ? 'bg-gray-50/30 opacity-70' : ''
                  }`}
                >
                  {/* Item / Direct Photo Upload */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <ImageUploader
                        productId={item.id}
                        currentImageUrl={item.image}
                        onUploadComplete={(newUrl) => {
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, image: newUrl } : i
                            )
                          );
                          showToast(`Updated image for "${item.name}"! 📸`);
                        }}
                      />
                      <div>
                        <p className="font-extrabold text-gray-950 text-xs">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px] border border-black/5">
                      {item.category}
                    </span>
                  </td>

                  {/* Pack Unit */}
                  <td className="py-3.5 px-4 font-medium text-gray-600">{item.unit}</td>

                  {/* Pricing (Inline Editable) */}
                  <td className="py-3.5 px-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-col gap-1">
                          <input
                            type="number"
                            value={editPrice}
                            placeholder="Price"
                            onChange={(e) => setEditPrice(e.target.value)}
                            onBlur={() => saveEditing(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(item.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-20 px-2 py-1 bg-white border border-[#FF5E00] rounded-xl text-xs font-bold text-gray-950 focus:outline-none"
                            autoFocus
                          />
                          <input
                            type="number"
                            value={editDiscountPrice}
                            placeholder="Discount ₹"
                            onChange={(e) => setEditDiscountPrice(e.target.value)}
                            onBlur={() => saveEditing(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(item.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-20 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-xl text-[10px] text-gray-600 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => saveEditing(item.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                          title="Save price"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => startEditing(item)}
                        className="cursor-pointer group flex items-center gap-1.5"
                        title="Click to edit price"
                      >
                        <span className="font-extrabold text-gray-950 tabular-nums">
                          ₹{item.price}
                        </span>
                        {item.discount_price && item.discount_price < item.price && (
                          <span className="text-[10px] text-emerald-600 font-bold tabular-nums">
                            (Sale ₹{item.discount_price})
                          </span>
                        )}
                        <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-[#FF5E00] transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                    )}
                  </td>

                  {/* Stock Quantity */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold tabular-nums ${
                        item.stock === 0
                          ? 'text-red-500'
                          : item.stock < 10
                          ? 'text-amber-500'
                          : 'text-gray-800'
                      }`}
                    >
                      {item.stock} units
                    </span>
                  </td>

                  {/* In Stock vs Sold Out Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStock(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all active:scale-[0.97] cursor-pointer ${
                        item.is_available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.is_available ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      <span>{item.is_available ? 'In Stock' : 'Sold Out'}</span>
                    </button>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => startEditing(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition-all cursor-pointer"
                    >
                      Edit Price
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quiet Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
                <Package className="w-6 h-6 text-gray-400 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                No Products Found in Catalog
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {search
                  ? `No items match the filter "${search}". Clear search to view all items.`
                  : 'The Joniha Central Hub catalog currently has no products configured in Supabase.'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                + Add First Product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Quick Add Product Modal with Direct Image Uploader */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-950">Add Catalog Product</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Insert a real SKU into Supabase `products` with direct file upload.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddProduct} className="space-y-3.5">
              {/* Product Direct Image Uploader */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Product Image (Direct File / Camera)
                </label>
                <ImageUploader
                  productId={`temp-${Date.now()}`}
                  currentImageUrl={newImageUrl}
                  onUploadComplete={(url) => {
                    setNewImageUrl(url);
                    showToast('Photo uploaded successfully! 📸');
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amul Taaza Fresh Toned Milk / boAt Wave Call Smartwatch"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short product overview or specifications..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit Specification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 ml / 1 kg / 1 pc"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="34"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">MRP / Discount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="38"
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Inserting...' : 'Commit to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
