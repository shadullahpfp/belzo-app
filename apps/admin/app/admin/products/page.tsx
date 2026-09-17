'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  CheckCircle2, 
  X, 
  Image as ImageIcon,
  Minus,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  unit: string;
  price: number;
  discount_price: number | null;
  stock: number;
  is_available: boolean;
  image_url: string;
  description: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Farm Fresh Whole Milk',
    category_id: 'cat-01',
    category_name: 'Dairy & Breakfast',
    unit: '1 Litre Pouch',
    price: 66,
    discount_price: 62,
    stock: 48,
    is_available: true,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    description: 'Pasteurized homogenized toned cow milk rich in calcium.'
  },
  {
    id: 'prod-02',
    name: 'Artisan Sourdough Loaf',
    category_id: 'cat-01',
    category_name: 'Dairy & Breakfast',
    unit: '400g Pack',
    price: 110,
    discount_price: 95,
    stock: 12,
    is_available: true,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    description: 'Slow-fermented artisan sourdough bread with crispy crust.'
  },
  {
    id: 'prod-03',
    name: 'Alphonso Mango Box (Grade A)',
    category_id: 'cat-02',
    category_name: 'Fresh Produce',
    unit: '6 Pieces (~1.5kg)',
    price: 650,
    discount_price: 599,
    stock: 4,
    is_available: true,
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
    description: 'Hand-picked Ratnagiri Alphonso mangoes, sweet and aromatic.'
  },
  {
    id: 'prod-04',
    name: 'Baby Spinach Leaves (Hydroponic)',
    category_id: 'cat-02',
    category_name: 'Fresh Produce',
    unit: '200g Box',
    price: 60,
    discount_price: 52,
    stock: 0,
    is_available: false,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    description: 'Pesticide-free hydroponically grown tender baby spinach.'
  },
  {
    id: 'prod-05',
    name: 'Belzo Sparkling Cold Brew Coffee',
    category_id: 'cat-03',
    category_name: 'Snacks & Munchies',
    unit: '250ml Can',
    price: 140,
    discount_price: 120,
    stock: 35,
    is_available: true,
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400',
    description: 'Single-origin Arabica 18-hour cold brew infused with subtle fizz.'
  },
  {
    id: 'prod-06',
    name: 'Avocado Hass Ready-to-Eat',
    category_id: 'cat-02',
    category_name: 'Fresh Produce',
    unit: 'Pack of 2',
    price: 240,
    discount_price: 199,
    stock: 8,
    is_available: true,
    image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
    description: 'Creamy Hass avocados perfect for toast and guacamole.'
  }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_name: 'Dairy & Breakfast',
    unit: '',
    price: '',
    discount_price: '',
    stock: '25',
    is_available: true,
    image_url: '',
    description: ''
  });

  // Fetch from Supabase with fallback
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('name');

        if (error) throw error;
        if (data && data.length > 0) {
          const formatted: Product[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category_id: p.category_id,
            category_name: p.categories?.name || 'General',
            unit: p.unit || '1 pc',
            price: Number(p.price),
            discount_price: p.discount_price ? Number(p.discount_price) : null,
            stock: p.stock ?? 20,
            is_available: p.is_available ?? true,
            image_url: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
            description: p.description || ''
          }));
          setProducts(formatted);
        }
      } catch {
        // Use initial mock products
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_name === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.stock <= 10;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categoriesList = Array.from(new Set(products.map(p => p.category_name || 'General')));

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_name: categoriesList[0] || 'Dairy & Breakfast',
      unit: '',
      price: '',
      discount_price: '',
      stock: '25',
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
      category_name: p.category_name || 'Dairy & Breakfast',
      unit: p.unit,
      price: p.price.toString(),
      discount_price: p.discount_price ? p.discount_price.toString() : '',
      stock: p.stock.toString(),
      is_available: p.is_available,
      image_url: p.image_url,
      description: p.description
    });
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: newVal } : p));
    try {
      await supabase.from('products').update({ is_available: newVal }).eq('id', id);
    } catch {
      // Local optimistic update
    }
  };

  const handleQuickStockAdjust = async (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStock = Math.max(0, p.stock + delta);
        return { ...p, stock: nextStock, is_available: nextStock > 0 };
      }
      return p;
    }));
    try {
      const target = products.find(p => p.id === id);
      if (target) {
        const nextStock = Math.max(0, target.stock + delta);
        await supabase.from('products').update({ 
          stock: nextStock,
          is_available: nextStock > 0 
        }).eq('id', id);
      }
    } catch {
      // Local optimistic update
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price) || 0;
    const discountNum = formData.discount_price ? parseFloat(formData.discount_price) : null;
    const stockNum = parseInt(formData.stock, 10) || 0;

    if (editingProduct) {
      // Update
      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        category_name: formData.category_name,
        unit: formData.unit || '1 pc',
        price: priceNum,
        discount_price: discountNum,
        stock: stockNum,
        is_available: formData.is_available && stockNum > 0,
        image_url: formData.image_url || editingProduct.image_url,
        description: formData.description
      };
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      try {
        await supabase.from('products').update({
          name: updatedProduct.name,
          unit: updatedProduct.unit,
          price: updatedProduct.price,
          discount_price: updatedProduct.discount_price,
          stock: updatedProduct.stock,
          is_available: updatedProduct.is_available,
          image_url: updatedProduct.image_url,
          description: updatedProduct.description
        }).eq('id', editingProduct.id);
      } catch {
        // Fallback
      }
    } else {
      // Add new
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        category_id: 'cat-new',
        category_name: formData.category_name,
        unit: formData.unit || '1 pc',
        price: priceNum,
        discount_price: discountNum,
        stock: stockNum,
        is_available: formData.is_available && stockNum > 0,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
        description: formData.description
      };
      setProducts(prev => [newProduct, ...prev]);
      try {
        await supabase.from('products').insert([{
          name: newProduct.name,
          unit: newProduct.unit,
          price: newProduct.price,
          discount_price: newProduct.discount_price,
          stock: newProduct.stock,
          is_available: newProduct.is_available,
          image_url: newProduct.image_url,
          description: newProduct.description
        }]);
      } catch {
        // Fallback
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product SKU?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF5E00]" />
            Products & Master Catalog
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Global catalog ledger with live dark store inventory, pricing controls, and availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
              onlyLowStock 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10' 
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Only (≤ 10)
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-[#FF5E00] to-[#E05300] hover:brightness-110 text-white font-medium text-sm rounded-xl shadow-lg shadow-[#FF5E00]/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5E00]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1D0E38] text-white">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat} className="bg-[#1D0E38] text-white">{cat}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-white/40 px-2">
            Showing <strong className="text-white">{filteredProducts.length}</strong> items
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#1D0E38]/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-white/50 tracking-wider">
              <tr>
                <th className="px-6 py-4">Item & Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Unit & Pack</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Inventory Level</th>
                <th className="px-6 py-4">Live Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= 10;
                const isOutOfStock = product.stock === 0;

                return (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative group-hover:border-[#FF5E00]/40 transition-colors">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="max-w-xs">
                          <div className="font-semibold text-white group-hover:text-[#FF5E00] transition-colors line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-xs text-white/40 line-clamp-1 mt-0.5">
                            {product.description || 'No description provided'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {product.category_name}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-white/70 font-mono text-xs">
                      {product.unit}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {product.discount_price ? (
                          <>
                            <span className="font-semibold text-white font-mono">
                              ₹{product.discount_price}
                            </span>
                            <span className="text-xs text-white/40 line-through font-mono">
                              ₹{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-white font-mono">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col min-w-[70px]">
                          <span className={`font-mono font-semibold text-sm ${
                            isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {product.stock} units
                          </span>
                          <span className="text-[10px] text-white/30 uppercase tracking-wider">
                            {isOutOfStock ? 'Depleted' : isLowStock ? 'Low Reserve' : 'Healthy'}
                          </span>
                        </div>
                        {/* Quick adjust buttons */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Subtract 10 units"
                            disabled={product.stock === 0}
                            onClick={() => handleQuickStockAdjust(product.id, -10)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-mono px-1.5"
                          >
                            -10
                          </button>
                          <button
                            title="Add 10 units"
                            onClick={() => handleQuickStockAdjust(product.id, 10)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-mono px-1.5"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAvailability(product.id, product.is_available)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          product.is_available
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-300 border-red-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {product.is_available ? 'Listed' : 'Hidden'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/40">
                    No products matched your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1D0E38] border border-white/20 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingProduct ? <Edit3 className="w-5 h-5 text-[#FF5E00]" /> : <Plus className="w-5 h-5 text-[#FF5E00]" />}
                {editingProduct ? 'Edit Product SKU' : 'Create New Product SKU'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alphonso Mango Grade A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#170A2D] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Unit / Size *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500g, 1 Litre, 2 pcs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Price (MRP ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="100"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                  Product Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Key features, ingredients, origin..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF5E00] focus:ring-[#FF5E00] border-white/20 bg-white/5"
                />
                <label htmlFor="is_available" className="text-sm text-white/90 cursor-pointer">
                  Mark product active and immediately visible to customers
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#E05300] hover:brightness-110 text-white text-sm font-semibold shadow-lg shadow-[#FF5E00]/25 transition-all"
                >
                  {editingProduct ? 'Save Changes' : 'Create SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
