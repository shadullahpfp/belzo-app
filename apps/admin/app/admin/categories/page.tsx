'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  icon: string;
  sortOrder: number;
  productCount: number;
  isActive: boolean;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Grocery & Staples',
    slug: 'grocery-staples',
    vertical: 'Grocery',
    icon: '🛒',
    sortOrder: 1,
    productCount: 148,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Fresh Fruits & Vegetables',
    slug: 'fruits-vegetables',
    vertical: 'Fruits & Vegetables',
    icon: '🥦',
    sortOrder: 2,
    productCount: 86,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Food & Restaurant Kitchen',
    slug: 'food-restaurant',
    vertical: 'Food & Restaurant',
    icon: '🍔',
    sortOrder: 3,
    productCount: 42,
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'Medicine & Daily Health',
    slug: 'medicine-healthcare',
    vertical: 'Medicine & Healthcare',
    icon: '💊',
    sortOrder: 4,
    productCount: 65,
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'Fashion & Daily Wear',
    slug: 'fashion-lifestyle',
    vertical: 'Fashion',
    icon: '👕',
    sortOrder: 5,
    productCount: 54,
    isActive: true,
  },
  {
    id: 'cat-6',
    name: 'Electronics & Accessories',
    slug: 'electronics-appliances',
    vertical: 'Electronics',
    icon: '🎧',
    sortOrder: 6,
    productCount: 39,
    isActive: true,
  },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formVertical, setFormVertical] = useState('Grocery');
  const [formIcon, setFormIcon] = useState('🛒');
  const [formSortOrder, setFormSortOrder] = useState('1');

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.vertical.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormVertical('Grocery');
    setFormIcon('📦');
    setFormSortOrder((categories.length + 1).toString());
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormVertical(cat.vertical);
    setFormIcon(cat.icon);
    setFormSortOrder(cat.sortOrder.toString());
    setShowModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      alert('Please fill all required fields');
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName,
                slug: formSlug,
                vertical: formVertical,
                icon: formIcon,
                sortOrder: parseInt(formSortOrder) || 1,
              }
            : c
        )
      );
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug: formSlug,
        vertical: formVertical,
        icon: formIcon,
        sortOrder: parseInt(formSortOrder) || categories.length + 1,
        productCount: 0,
        isActive: true,
      };
      setCategories([...categories, newCat]);
    }

    // Try live Supabase sync
    try {
      await supabase.from('categories').upsert({
        name: formName,
        slug: formSlug,
        vertical: formVertical,
        sort_order: parseInt(formSortOrder) || 1,
      });
    } catch {}

    setShowModal(false);
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#170A2D] border border-white/10 rounded-2xl p-5 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Commercial Verticals & Categories
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Manage the 6 commercial retail divisions and customer navigation structure.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-black shadow-lg shadow-[#FF5E00]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter categories by name, slug, or vertical..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF5E00]"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-[#170A2D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 border-b border-white/10 text-white/40 uppercase font-black tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Icon</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Belzo Vertical</th>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 text-xl">{cat.icon}</td>
                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    {cat.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-white/50">
                    /{cat.slug}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white/70">
                    {cat.vertical}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-white/60">
                    #{cat.sortOrder}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                    {cat.productCount} items
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleCategoryStatus(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all ${
                        cat.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cat.isActive ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                      />
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[11px] font-bold transition-all"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1B0E33] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) {
                      setFormSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                      );
                    }
                  }}
                  placeholder="e.g. Organic Dairy & Eggs"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. organic-dairy"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF5E00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Belzo Vertical *
                  </label>
                  <select
                    value={formVertical}
                    onChange={(e) => setFormVertical(e.target.value)}
                    className="w-full bg-[#170A2D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Food & Restaurant">Food & Restaurant</option>
                    <option value="Medicine & Healthcare">Medicine & Healthcare</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Display Icon / Emoji *
                  </label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="🛒"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Sort Order Rank
                </label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-black shadow-lg"
                >
                  Save Category ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
