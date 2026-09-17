'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Edit2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Save,
  Package,
} from 'lucide-react';
import { playDispatchChime } from '../../../lib/sound';
import { supabase } from '../../../lib/supabase';

interface InventoryItem {
  id: string;
  name: string;
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

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'prod-1',
    name: 'Amul Taaza Fresh Toned Milk',
    category: 'Grocery',
    unit: '500 ml',
    price: 34,
    discount_price: 32,
    mrp: 38,
    stock: 24,
    is_available: true,
    sku: 'SKU-DAIRY-01',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'prod-2',
    name: 'Harvest Gold 100% Atta Brown Bread',
    category: 'Grocery',
    unit: '400 g',
    price: 49,
    mrp: 55,
    stock: 12,
    is_available: true,
    sku: 'SKU-BAKE-02',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'prod-3',
    name: 'Farm Fresh Organic Hass Avocado',
    category: 'Fruits & Veggies',
    unit: '2 pcs',
    price: 189,
    mrp: 240,
    stock: 0,
    is_available: false,
    sku: 'SKU-VEG-03',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'prod-4',
    name: 'Belzo Farm Red Ripe Tomatoes',
    category: 'Fruits & Veggies',
    unit: '1 kg',
    price: 38,
    mrp: 50,
    stock: 35,
    is_available: true,
    sku: 'SKU-VEG-04',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'prod-5',
    name: 'Croissant Butter Puff (Pack of 2)',
    category: 'Food',
    unit: '200 g',
    price: 120,
    mrp: 150,
    stock: 4,
    is_available: true,
    sku: 'SKU-FOOD-05',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'prod-6',
    name: 'Electrolyte Hydration Powder (Lime)',
    category: 'Pharma',
    unit: '5 sachets',
    price: 99,
    mrp: 125,
    stock: 18,
    is_available: true,
    sku: 'SKU-PHARM-06',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'prod-7',
    name: 'Type-C Fast Braided Charging Cable',
    category: 'Electronics',
    unit: '1.2 m',
    price: 299,
    mrp: 499,
    stock: 9,
    is_available: true,
    sku: 'SKU-ELEC-07',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=200&q=80',
  },
];

export default function InventoryPricingPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  // Inline editing state: itemId -> { price: string, discount_price: string }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDiscountPrice, setEditDiscountPrice] = useState<string>('');

  // Quick Add Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Grocery');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newMrp, setNewMrp] = useState('');
  const [newStock, setNewStock] = useState('15');
  const [newImageUrl, setNewImageUrl] = useState('');

  const categories = ['All', 'Grocery', 'Fruits & Veggies', 'Food', 'Pharma', 'Electronics'];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Toggle In Stock / Out of Stock
  const handleToggleStock = async (itemId: string) => {
    const currentItem = items.find((i) => i.id === itemId);
    const nextAvailability = currentItem ? !currentItem.is_available : false;

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              is_available: !i.is_available,
              stock: !i.is_available ? Math.max(i.stock, 5) : 0,
            }
          : i
      )
    );

    try {
      if (itemId.length === 36) {
        await supabase
          .from('products')
          .update({ is_available: nextAvailability })
          .eq('id', itemId);
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

  // Save inline edit
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
        if (itemId.length === 36) {
          await supabase
            .from('products')
            .update({
              price: p,
              discount_price: dp && !isNaN(dp) ? dp : null,
            })
            .eq('id', itemId);
        }
      } catch (err) {
        console.warn('Supabase price update error:', err);
      }
    }
    setEditingId(null);
  };

  // Quick Add Product
  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim() || !newUnit.trim()) {
      alert('Please enter Name, Unit, and Price.');
      return;
    }

    const p = parseFloat(newPrice);
    const m = newMrp ? parseFloat(newMrp) : Math.round(p * 1.2);
    const stk = parseInt(newStock) || 10;

    const newItem: InventoryItem = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      unit: newUnit.trim(),
      price: p,
      mrp: m,
      stock: stk,
      is_available: stk > 0,
      sku: `SKU-MANUAL-${Math.floor(100 + Math.random() * 900)}`,
      image:
        newImageUrl.trim() ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    };

    setItems([newItem, ...items]);
    setShowAddModal(false);
    playDispatchChime();

    // Reset Form
    setNewName('');
    setNewUnit('');
    setNewPrice('');
    setNewMrp('');
    setNewStock('15');
    setNewImageUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Search & Quick Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Fast Inventory & Real-Time Price Controller
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            Instant click-to-edit pricing, live stock toggles, and emergency product creation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-black shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Quick Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF5E00]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-[#FF5E00] text-white'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Realtime Inventory Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 border-b border-white/10 text-white/50 uppercase font-black tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Item & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-4">Selling Price (₹)</th>
                <th className="py-3.5 px-4">Discount Price</th>
                <th className="py-3.5 px-4">MRP</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Item & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-white/10 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-mono text-white/40">
                            {item.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-white/70">
                      {item.category}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 text-white/60 font-mono">
                      {item.unit}
                    </td>

                    {/* Selling Price (Inline Editable) */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing(item.id)}
                          className="w-20 bg-black/60 border border-[#FF5E00] rounded-lg px-2 py-1 text-white font-mono font-bold text-sm focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => startEditing(item)}
                          className="cursor-pointer group flex items-center gap-1.5 font-bold font-mono text-sm text-white"
                        >
                          <span>₹{item.price}</span>
                          <Edit2 className="w-3 h-3 text-white/30 group-hover:text-[#FF5E00] transition-colors" />
                        </div>
                      )}
                    </td>

                    {/* Discount Price */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editDiscountPrice}
                          onChange={(e) => setEditDiscountPrice(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing(item.id)}
                          placeholder="Optional"
                          className="w-20 bg-black/60 border border-[#FF5E00] rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-white/60">
                          {item.discount_price ? `₹${item.discount_price}` : '—'}
                        </span>
                      )}
                    </td>

                    {/* MRP */}
                    <td className="py-3.5 px-4 font-mono text-white/40 line-through">
                      ₹{item.mrp}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.stock}
                    </td>

                    {/* Stock Status Switch */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStock(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border transition-all ${
                          item.is_available
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.is_available ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        {item.is_available ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEditing(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(item)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[11px] font-bold transition-all"
                        >
                          Edit Price
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#170A2D] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Quick Add Emergency Product
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Register new local arrival into Belzo Central Hub 01 inventory.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Organic Strawberries (Box)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-[#170A2D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Fruits & Veggies">Fruits & Veggies</option>
                    <option value="Food">Food</option>
                    <option value="Pharma">Pharma</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Unit Measurement *
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. 250 g / 1 pc"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. 99"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="15"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Product Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-black shadow-lg transition-all"
                >
                  Add to Catalog ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
