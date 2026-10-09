'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Tag, 
  Plus, 
  Percent, 
  Trash2, 
  X, 
  Layers,
  RefreshCw,
  Gift
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_count: number;
  is_active: boolean;
  expires_at?: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image_url: string;
  bg_gradient: string;
  is_active: boolean;
  order: number;
}

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState<'coupons' | 'banners'>('coupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Load live coupons from Supabase
  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        setCoupons([]);
        return;
      }

      const mapped: Coupon[] = data.map((c: any) => ({
        id: c.id,
        code: c.code,
        discount_type: c.discount_type === 'percent' ? 'percentage' : c.discount_type || 'flat',
        discount_value: Number(c.discount_value) || 0,
        min_order_value: Number(c.min_order_value) || 0,
        max_discount: c.max_discount ? Number(c.max_discount) : null,
        usage_count: Number(c.usage_count) || 0,
        is_active: Boolean(c.is_active ?? true),
        expires_at: c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Active',
      }));
      setCoupons(mapped);
    } catch (err) {
      console.warn('[Admin Marketing] Coupons load note:', err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();

    const channel = supabase
      .channel('admin-coupons-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coupons' },
        () => {
          loadCoupons();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCoupons]);

  // Coupon modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'flat',
    discount_value: '',
    min_order_value: '199',
    max_discount: '100',
    is_active: true
  });

  const handleToggleCoupon = async (id: string) => {
    const target = coupons.find((c) => c.id === id);
    const nextVal = target ? !target.is_active : true;
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, is_active: nextVal } : c));
    try {
      await supabase.from('coupons').update({ is_active: nextVal }).eq('id', id);
    } catch (err) {
      console.warn('Toggle coupon error:', err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponForm.code.trim().toUpperCase();
    const discVal = parseFloat(couponForm.discount_value) || 0;
    const minVal = parseFloat(couponForm.min_order_value) || 0;
    const maxVal = couponForm.max_discount ? parseFloat(couponForm.max_discount) : null;

    try {
      const { data, error } = await supabase.from('coupons').insert([{
        code,
        discount_type: couponForm.discount_type === 'percentage' ? 'percent' : 'flat',
        discount_value: discVal,
        min_order_value: minVal,
        max_discount: maxVal,
        is_active: couponForm.is_active,
      }]).select().single();

      if (error) {
        alert(`Error creating coupon: ${error.message}`);
      } else {
        loadCoupons();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }

    setIsCouponModalOpen(false);
    setCouponForm({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '199',
      max_discount: '100',
      is_active: true
    });
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo coupon?')) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await supabase.from('coupons').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete coupon error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FF5E00]" />
            Promotions, Coupons & Banners
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure consumer discount vouchers, promotional banners, and campaign thresholds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadCoupons()}
            className="p-2.5 rounded-2xl bg-white border border-black/5 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5E00]' : ''}`} />
          </button>
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Coupon Code
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'coupons'
              ? 'bg-gray-950 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Discount Coupons ({coupons.length})</span>
        </button>
      </div>

      {/* Coupons Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white border border-black/5 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1.5 rounded-2xl bg-orange-50 text-[#FF5E00] border border-orange-200 font-mono font-extrabold text-sm tracking-wider">
                  {coupon.code}
                </span>
                <button
                  onClick={() => handleToggleCoupon(coupon.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    coupon.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {coupon.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-xl font-extrabold text-gray-950 tracking-tight">
                  {coupon.discount_type === 'percentage'
                    ? `${coupon.discount_value}% OFF`
                    : `₹${coupon.discount_value} FLAT OFF`}
                </p>
                <p className="text-xs text-gray-500">
                  Min order ₹{coupon.min_order_value}
                  {coupon.max_discount ? ` • Capped at ₹${coupon.max_discount}` : ''}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Usage Count</span>
                <span className="font-bold text-gray-900 tabular-nums font-mono">
                  {coupon.usage_count} redemptions
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">
                Expires: {coupon.expires_at || 'Never'}
              </span>
              <button
                onClick={() => handleDeleteCoupon(coupon.id)}
                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                title="Delete Coupon"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apple-grade Quiet Empty State */}
      {!loading && coupons.length === 0 && (
        <div className="bg-white border border-black/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
            <Gift className="w-6 h-6 text-gray-400 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
            No Coupons or Promo Codes Active
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Launch customer acquisition campaigns by creating your first promotional coupon voucher.
          </p>
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
          >
            + Create First Coupon
          </button>
        </div>
      )}

      {/* Modal: Add Coupon */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-950">Add Coupon Code</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BELZO50"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 uppercase font-mono tracking-wider focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="50"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={couponForm.min_order_value}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_value: e.target.value })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={couponForm.max_discount}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
