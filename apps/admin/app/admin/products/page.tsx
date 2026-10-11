'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  X, 
  Minus, 
  RefreshCw, 
  CheckCircle2, 
  Tag 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ImageUploader } from '../../../components/ImageUploader';

interface Product {
  id: string;
  store_id?: string;
  name: string;
  category_id: string;
  category_name?: string;
  unit: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  is_available: boolean;
  image_url: string;
  description: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

const PRIMARY_STORE_ID = 'a0000000-0000-0000-0000-000000000001';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    unit: '',
    price: '',
    discount_price: '',
    stock_quantity: '25',
    is_available: true,
    image_url: '',
    description: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Live Categories & Products from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch categories (no is_active filter so all 6 verticals are visible)
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('sort_order', { ascending: true });

      const fetchedCategories: CategoryOption[] = catData || [];
      setCategories(fetchedCategories);

      const resolveCatName = (p: any): string => {
        if (p.categories?.name) return p.categories.name;
        if (p.category_id) {
          const matched = fetchedCategories.find((c) => c.id === p.category_id);
          if (matched) return matched.name;
          if (p.category_id.includes('produce')) return 'Fruits & Vegetables';
          if (p.category_id.includes('grocery')) return 'Grocery';
          if (p.category_id.includes('food')) return 'Food & Restaurant';
          if (p.category_id.includes('pharma')) return 'Medicine';
          if (p.category_id.includes('fashion')) return 'Fashion';
          if (p.category_id.includes('electronics')) return 'Electronics';
        }
        return 'General';
      };

      // 2. Fetch products joined with categories
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .order('created_at', { ascending: false });

      if (prodErr || !prodData) {
        // Fallback without join alias
        const { data: fallbackData } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (fallbackData) {
          const formatted: Product[] = fallbackData.map((p: any) => ({
            id: p.id,
            store_id: p.store_id || PRIMARY_STORE_ID,
            name: p.name,
            category_id: p.category_id,
            category_name: resolveCatName(p),
            unit: p.unit || '1 pc',
            price: Number(p.price) || 0,
            discount_price: p.discount_price ? Number(p.discount_price) : null,
            stock_quantity: p.stock_quantity ?? p.stock ?? 0,
            is_available: Boolean(p.is_available),
            image_url: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
            description: p.description || ''
          }));
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } else if (prodData) {
        const formatted: Product[] = prodData.map((p: any) => ({
          id: p.id,
          store_id: p.store_id || PRIMARY_STORE_ID,
          name: p.name,
          category_id: p.category_id,
          category_name: resolveCatName(p),
          unit: p.unit || '1 pc',
          price: Number(p.price) || 0,
          discount_price: p.discount_price ? Number(p.discount_price) : null,
          stock_quantity: p.stock_quantity ?? p.stock ?? 0,
          is_available: Boolean(p.is_available),
          image_url: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
          description: p.description || ''
        }));
        setProducts(formatted);
      }
    } catch (err) {
      console.warn('[Admin Products] Live query note:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to Supabase Realtime channel for live updates across clients
    const channel = supabase
      .channel('admin-products-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            setProducts((prev) =>
              prev.map((p) =>
                p.id === updated.id
                  ? {
                      ...p,
                      name: updated.name,
                      unit: updated.unit,
                      price: Number(updated.price),
                      discount_price: updated.discount_price ? Number(updated.discount_price) : null,
                      stock_quantity: updated.stock_quantity ?? p.stock_quantity,
                      is_available: Boolean(updated.is_available),
                      image_url: updated.image_url || p.image_url,
                      description: updated.description || p.description,
                    }
                  : p
              )
            );
          } else if (payload.eventType === 'INSERT') {
            loadData();
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      p.category_id === selectedCategory ||
      p.category_name === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.stock_quantity <= 10;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categoriesList = categories.length > 0 
    ? categories 
    : [
        { id: 'c0000000-0000-0000-0000-000000000001', name: 'Dairy & Eggs' },
        { id: 'c0000000-0000-0000-0000-000000000002', name: 'Fresh Produce' },
        { id: 'c0000000-0000-0000-0000-000000000003', name: 'Bakery & Bread' },
        { id: 'c0000000-0000-0000-0000-000000000004', name: 'Snacks & Drinks' },
        { id: 'c0000000-0000-0000-0000-000000000005', name: 'Pharmacy & Care' },
        { id: 'c0000000-0000-0000-0000-000000000006', name: 'Fast Tech & Cable' },
      ];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categoriesList[0]?.id || '',
      unit: '',
      price: '',
      discount_price: '',
      stock_quantity: '25',
      is_available: true,
      image_url: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      unit: p.unit,
      price: p.price.toString(),
      discount_price: p.discount_price ? p.discount_price.toString() : '',
      stock_quantity: p.stock_quantity.toString(),
      is_available: p.is_available,
      image_url: p.image_url,
      description: p.description
    });
    setIsModalOpen(true);
  };

  // Availability Toggle
  const handleToggleAvailability = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_available: newVal } : p));
    showToast(`Product ${newVal ? 'listed' : 'hidden'} successfully`);
    try {
      await supabase
        .from('products')
        .update({ is_available: newVal, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (err) {
      console.warn('Availability update note:', err);
    }
  };

  // Stock Steppers (- / +)
  const handleQuickStockAdjust = async (id: string, delta: number) => {
    let nextStock = 0;
    setProducts((prev) => prev.map((p) => {
      if (p.id === id) {
        nextStock = Math.max(0, p.stock_quantity + delta);
        return { 
          ...p, 
          stock_quantity: nextStock, 
          is_available: nextStock > 0 ? p.is_available : false 
        };
      }
      return p;
    }));

    try {
      await supabase
        .from('products')
        .update({ 
          stock_quantity: nextStock,
          is_available: nextStock > 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Stock update note:', err);
    }
  };

  // Save (Create / Update) Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price) || 0;
    const discountNum = formData.discount_price ? parseFloat(formData.discount_price) : null;
    const stockNum = parseInt(formData.stock_quantity, 10) || 0;
    const matchedCategory = categoriesList.find((c) => c.id === formData.category_id);

    if (editingProduct) {
      // Update
      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        category_id: formData.category_id,
        category_name: matchedCategory?.name || editingProduct.category_name,
        unit: formData.unit || '1 pc',
        price: priceNum,
        discount_price: discountNum,
        stock_quantity: stockNum,
        is_available: formData.is_available && stockNum > 0,
        image_url: formData.image_url || editingProduct.image_url,
        description: formData.description
      };

      setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? updatedProduct : p));
      showToast('Product updated successfully');
      setIsModalOpen(false);

      try {
        await supabase
          .from('products')
          .update({
            name: updatedProduct.name,
            category_id: updatedProduct.category_id,
            unit: updatedProduct.unit,
            price: updatedProduct.price,
            discount_price: updatedProduct.discount_price,
            stock_quantity: updatedProduct.stock_quantity,
            is_available: updatedProduct.is_available,
            image_url: updatedProduct.image_url,
            description: updatedProduct.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id);
      } catch (err) {
        console.warn('Update product error:', err);
      }
    } else {
      // Add new product
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        store_id: PRIMARY_STORE_ID,
        name: formData.name,
        category_id: formData.category_id || categoriesList[0]?.id || 'c0000000-0000-0000-0000-000000000001',
        category_name: matchedCategory?.name || 'General',
        unit: formData.unit || '1 pc',
        price: priceNum,
        discount_price: discountNum,
        stock_quantity: stockNum,
        is_available: formData.is_available && stockNum > 0,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
        description: formData.description
      };

      setProducts((prev) => [newProduct, ...prev]);
      showToast('New product created in catalog');
      setIsModalOpen(false);

      try {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            store_id: PRIMARY_STORE_ID,
            category_id: newProduct.category_id,
            name: newProduct.name,
            unit: newProduct.unit,
            price: newProduct.price,
            discount_price: newProduct.discount_price,
            stock_quantity: newProduct.stock_quantity,
            is_available: newProduct.is_available,
            image_url: newProduct.image_url,
            description: newProduct.description
          }])
          .select();

        if (data && data[0]) {
          setProducts((prev) => prev.map((p) => p.id === newProduct.id ? { ...p, id: data[0].id } : p));
        }
      } catch (err) {
        console.warn('Insert product error:', err);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product SKU?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog');
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete product error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-950 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF5E00]" />
            Products & Master Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global catalog ledger with live dark store inventory, pricing controls, and real-time mobile sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsLoading(true);
              loadData();
            }}
            className="p-2.5 rounded-2xl bg-white border border-black/5 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            title="Refresh Live Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF5E00]' : ''}`} />
          </button>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all border ${
              onlyLowStock 
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm' 
                : 'bg-white text-gray-700 border-black/5 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Low Stock Only (≤ 10)
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Product SKU
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, SKU, description..."
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5E00] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                : 'bg-white text-gray-600 border-black/5 hover:bg-gray-50'
            }`}
          >
            All Verticals ({products.length})
          </button>
          {categoriesList.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id || p.category_name === cat.name).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                    : 'bg-white text-gray-600 border-black/5 hover:bg-gray-50'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Product Details</th>
                <th className="py-3.5 px-6">Vertical</th>
                <th className="py-3.5 px-6">Pack Unit</th>
                <th className="py-3.5 px-6">Selling Price</th>
                <th className="py-3.5 px-6">Stock Level</th>
                <th className="py-3.5 px-6">Store Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
                const isOutOfStock = product.stock_quantity === 0;

                return (
                  <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <ImageUploader
                          productId={product.id}
                          currentImageUrl={product.image_url}
                          onUploadComplete={(newUrl) => {
                            setProducts((prev) =>
                              prev.map((p) =>
                                p.id === product.id ? { ...p, image_url: newUrl } : p
                              )
                            );
                            showToast(`Updated image for "${product.name}"! 📸`);
                          }}
                        />
                        <div>
                          <p className="font-extrabold text-gray-950 text-xs">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            ID: {product.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px] border border-black/5">
                        {product.category_name}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-600">{product.unit}</td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {product.discount_price ? (
                          <>
                            <span className="font-mono font-bold text-gray-950 tabular-nums">
                              ₹{product.discount_price}
                            </span>
                            <span className="font-mono text-[11px] text-gray-400 line-through tabular-nums">
                              ₹{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono font-bold text-gray-950 tabular-nums">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock Steppers (- / +) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 rounded-xl border border-gray-200 p-0.5">
                          <button
                            onClick={() => handleQuickStockAdjust(product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-xs transition-transform active:scale-95"
                            title="Decrease Stock"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`px-2.5 text-xs font-mono font-bold tabular-nums ${
                            isOutOfStock 
                              ? 'text-red-600' 
                              : isLowStock 
                              ? 'text-amber-600' 
                              : 'text-gray-900'
                          }`}>
                            {product.stock_quantity}
                          </span>
                          <button
                            onClick={() => handleQuickStockAdjust(product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-xs transition-transform active:scale-95"
                            title="Increase Stock"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {isOutOfStock ? (
                          <span className="text-[11px] text-red-600 font-semibold">Sold Out</span>
                        ) : isLowStock ? (
                          <span className="text-[11px] text-amber-600 font-semibold">Low</span>
                        ) : null}
                      </div>
                    </td>

                    {/* Availability Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAvailability(product.id, product.is_available)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          product.is_available
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.is_available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {product.is_available ? 'Listed' : 'Hidden'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Apple-grade Quiet Empty State */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
                <Package className="w-6 h-6 text-gray-400 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                No Products Found in Master Catalog
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No products match "${searchTerm}".`
                  : 'Start expanding the Belzo catalog by onboarding your first product SKU.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
              >
                + Create Product SKU
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-black/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                {editingProduct ? <Edit3 className="w-5 h-5 text-[#FF5E00]" /> : <Plus className="w-5 h-5 text-[#FF5E00]" />}
                {editingProduct ? 'Edit Product SKU' : 'Create New Product SKU'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alphonso Mango Grade A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Pack Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg / 500 ml / 6 pcs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="49.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="45.00"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Product Photo (Direct File / Camera)
                </label>
                <ImageUploader
                  productId={editingProduct ? editingProduct.id : `temp-${Date.now()}`}
                  currentImageUrl={formData.image_url}
                  onUploadComplete={(url) => {
                    setFormData((prev) => ({ ...prev, image_url: url }));
                    showToast('Product photo uploaded successfully! 📸');
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Item details and specifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF5E00] focus:ring-[#FF5E00] border-gray-300"
                />
                <label htmlFor="is_available" className="text-xs font-medium text-gray-700">
                  Immediately available for orders
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
                >
                  {editingProduct ? 'Save Updates' : 'Publish SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
