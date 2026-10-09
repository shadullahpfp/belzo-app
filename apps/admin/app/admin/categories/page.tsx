'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  FolderPlus,
  Trash2,
  Edit2
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

/**
 * STRICT LOCK: The Belzo category hierarchy is fixed to exactly these 6 official IDs.
 * No custom or arbitrary categories may be created via the admin UI.
 * Any new category must be officially approved and reflected in this constant.
 */
const LOCKED_OFFICIAL_CATEGORIES = [
  'cat-01-grocery',
  'cat-02-produce',
  'cat-03-food',
  'cat-04-pharma',
  'cat-05-fashion',
  'cat-06-electronics',
] as const;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formVertical, setFormVertical] = useState('Grocery');
  const [formIcon, setFormIcon] = useState('🛒');
  const [formSortOrder, setFormSortOrder] = useState('1');

  // Load real categories and compute real product count from Supabase
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError || !catData) {
        setCategories([]);
        return;
      }

      // 2. Fetch products to calculate exact count per category
      const { data: prodData } = await supabase
        .from('products')
        .select('id, category_id');

      const productCounts: Record<string, number> = {};
      (prodData || []).forEach((p: any) => {
        if (p.category_id) {
          productCounts[p.category_id] = (productCounts[p.category_id] || 0) + 1;
        }
      });

      const mapped: CategoryItem[] = catData.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        vertical: c.vertical || 'General',
        icon: c.icon || c.icon_name || '📦',
        sortOrder: c.sort_order ?? 0,
        productCount: productCounts[c.id] || 0,
        isActive: Boolean(c.is_active ?? true),
      }));

      setCategories(mapped);
    } catch (err) {
      console.warn('[Admin Categories] Supabase load note:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();

    const channel = supabase
      .channel('admin-categories-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          loadCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCategories]);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.vertical.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    // ENFORCEMENT: Block arbitrary category creation — 6-category hierarchy is immutable
    if (categories.length >= LOCKED_OFFICIAL_CATEGORIES.length) {
      setLockWarning(
        '🔒 Category Hierarchy Locked — Belzo enforces exactly 6 official categories. ' +
        'Contact the CTO to modify the product taxonomy.'
      );
      setTimeout(() => setLockWarning(null), 5000);
      return;
    }
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
    // Block creating new categories that break the 6-category lock
    if (!editingCategory && categories.length >= LOCKED_OFFICIAL_CATEGORIES.length) {
      setShowModal(false);
      setLockWarning('🔒 Cannot create category — 6-category limit enforced.');
      setTimeout(() => setLockWarning(null), 5000);
      return;
    }

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      vertical: formVertical.trim(),
      icon: formIcon.trim(),
      sort_order: parseInt(formSortOrder) || 1,
    };

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

      try {
        await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);
      } catch (err) {
        console.warn('Update category error:', err);
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert([payload])
          .select()
          .single();

        if (error) {
          alert(`Error creating category: ${error.message}`);
        } else if (data) {
          loadCategories();
        }
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }

    setShowModal(false);
  };

  const toggleCategoryStatus = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    const nextVal = target ? !target.isActive : true;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: nextVal } : c))
    );
    try {
      await supabase.from('categories').update({ is_active: nextVal }).eq('id', id);
    } catch {}
  };

  const handleDeleteCategory = async (id: string) => {
    // ENFORCEMENT: Block deletion of official Belzo categories
    if ((LOCKED_OFFICIAL_CATEGORIES as readonly string[]).includes(id)) {
      setLockWarning(`🔒 Cannot delete official category "${id}" — locked by franchise policy.`);
      setTimeout(() => setLockWarning(null), 5000);
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#FF5E00]" />
            Commercial Verticals & Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Product groupings and navigation taxonomy with live SQL association counts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadCategories()}
            className="p-2.5 rounded-2xl bg-white border border-black/5 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5E00]' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* 6-Category Lock Warning Banner */}
      {lockWarning && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-medium">
          <span className="text-lg mt-0.5">🔒</span>
          <span>{lockWarning}</span>
        </div>
      )}

      {/* Official Category Constraint Notice */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-700">
        <span>🔐</span>
        <span>
          <strong>Category Hierarchy Locked:</strong> Belzo enforces exactly{' '}
          <strong>6 official categories</strong>. All 124+ products must belong to one of:
          grocery · produce · food · pharma · fashion · electronics
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug..."
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5E00] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-black/5 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl border border-black/5">
                  {cat.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className={`cursor-pointer px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              <h3 className="font-extrabold text-base text-gray-950 tracking-tight">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                slug: /{cat.slug}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Associated SKUs:</span>
                <span className="font-extrabold text-gray-900 tabular-nums">
                  {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apple-grade Quiet Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="bg-white border border-black/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
            <FolderPlus className="w-6 h-6 text-gray-400 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
            No Categories Created Yet
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            {search
              ? `No categories matching query "${search}".`
              : 'Create categories to structure your catalog across dairy, produce, groceries, and fast tech.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
          >
            + Create First Category
          </button>
        </div>
      )}

      {/* Modal: Add / Edit Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-950">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dairy & Eggs"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dairy-eggs"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vertical</label>
                  <input
                    type="text"
                    value={formVertical}
                    onChange={(e) => setFormVertical(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Icon (Emoji / Name)</label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
