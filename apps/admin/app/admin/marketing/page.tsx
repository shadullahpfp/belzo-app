'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Tag, 
  Plus, 
  Search, 
  Percent, 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  X, 
  Image as ImageIcon,
  ExternalLink,
  Layers
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

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-01',
    code: 'BELZO50',
    discount_type: 'percentage',
    discount_value: 50,
    min_order_value: 199,
    max_discount: 100,
    usage_count: 842,
    is_active: true,
    expires_at: '31 Mar 2026'
  },
  {
    id: 'c-02',
    code: 'FREEDROP',
    discount_type: 'flat',
    discount_value: 25,
    min_order_value: 149,
    max_discount: 25,
    usage_count: 1205,
    is_active: true,
    expires_at: '30 Apr 2026'
  },
  {
    id: 'c-03',
    code: 'SUPER100',
    discount_type: 'flat',
    discount_value: 100,
    min_order_value: 499,
    max_discount: 100,
    usage_count: 310,
    is_active: true,
    expires_at: '15 Apr 2026'
  },
  {
    id: 'c-04',
    code: 'EXPIRED20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_value: 200,
    max_discount: 50,
    usage_count: 95,
    is_active: false,
    expires_at: '01 Feb 2026'
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b-01',
    title: 'Instant 10-Min Rush',
    subtitle: 'Fresh Dairy & Farm Veggies delivered before your kettle boils.',
    badge: 'SUPERFAST',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    bg_gradient: 'from-orange-500/20 to-purple-600/30',
    is_active: true,
    order: 1
  },
  {
    id: 'b-02',
    title: 'Midnight Cravings Festival',
    subtitle: 'Flat 50% off on premium chocolates, gelato, and artisanal chips.',
    badge: 'UP TO 50% OFF',
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800',
    bg_gradient: 'from-purple-600/30 to-pink-600/20',
    is_active: true,
    order: 2
  },
  {
    id: 'b-03',
    title: 'Ratnagiri Alphonso Season',
    subtitle: 'Direct from orchard to your doorstep in 10 minutes.',
    badge: 'SEASON SPECIAL',
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
    bg_gradient: 'from-amber-500/20 to-orange-600/30',
    is_active: true,
    order: 3
  }
];

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState<'coupons' | 'banners'>('coupons');
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);

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

  // Banner modal state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: 'FLASH SALE',
    image_url: '',
    is_active: true
  });

  const handleToggleCoupon = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
  };

  const handleToggleBanner = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: couponForm.code.toUpperCase(),
      discount_type: couponForm.discount_type,
      discount_value: parseFloat(couponForm.discount_value) || 0,
      min_order_value: parseFloat(couponForm.min_order_value) || 0,
      max_discount: couponForm.max_discount ? parseFloat(couponForm.max_discount) : null,
      usage_count: 0,
      is_active: couponForm.is_active,
      expires_at: '30 Days'
    };
    setCoupons([newCoupon, ...coupons]);
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

  const handleDeleteCoupon = (id: string) => {
    if (!confirm('Are you sure you want to delete this promo coupon?')) return;
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const newBanner: Banner = {
      id: `b-${Date.now()}`,
      title: bannerForm.title,
      subtitle: bannerForm.subtitle,
      badge: bannerForm.badge,
      image_url: bannerForm.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
      bg_gradient: 'from-orange-500/20 to-purple-600/30',
      is_active: bannerForm.is_active,
      order: banners.length + 1
    };
    setBanners([...banners, newBanner]);
    setIsBannerModalOpen(false);
    setBannerForm({
      title: '',
      subtitle: '',
      badge: 'FLASH SALE',
      image_url: '',
      is_active: true
    });
  };

  const handleDeleteBanner = (id: string) => {
    if (!confirm('Are you sure you want to remove this home carousel banner?')) return;
    setBanners(banners.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FF5E00]" />
            Promotions & Marketing Engine
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage discount vouchers, checkout coupons, and homepage hero carousel banners.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'coupons'
                  ? 'bg-[#FF5E00] text-white shadow-md shadow-[#FF5E00]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Promo Coupons ({coupons.length})
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'banners'
                  ? 'bg-[#FF5E00] text-white shadow-md shadow-[#FF5E00]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Home Banners ({banners.length})
            </button>
          </div>

          <button
            onClick={() => activeTab === 'coupons' ? setIsCouponModalOpen(true) : setIsBannerModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#FF5E00] to-[#E05300] hover:brightness-110 text-white font-medium text-sm rounded-xl shadow-lg shadow-[#FF5E00]/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'coupons' ? 'New Coupon' : 'New Banner'}
          </button>
        </div>
      </div>

      {/* Coupons Section */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#1D0E38]/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-white/50 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Coupon Code</th>
                  <th className="px-6 py-4">Discount Mechanics</th>
                  <th className="px-6 py-4">Min Order Value</th>
                  <th className="px-6 py-4">Max Cap</th>
                  <th className="px-6 py-4">Redemptions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-lg bg-[#FF5E00]/10 border border-[#FF5E00]/30 text-[#FF5E00] font-mono font-bold text-xs tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        {coupon.discount_type === 'percentage' ? (
                          <span className="flex items-center text-purple-300">
                            <Percent className="w-3.5 h-3.5 mr-0.5" />
                            {coupon.discount_value}% OFF
                          </span>
                        ) : (
                          <span className="flex items-center text-emerald-400">
                            ₹{coupon.discount_value} FLAT OFF
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-white/70">
                      ₹{coupon.min_order_value}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-white/70">
                      {coupon.max_discount ? `₹${coupon.max_discount}` : 'No Cap'}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-white font-semibold">
                        {coupon.usage_count} uses
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleCoupon(coupon.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          coupon.is_active
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-400' : 'bg-white/30'}`} />
                        {coupon.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banners Section */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`rounded-2xl border backdrop-blur-xl overflow-hidden transition-all relative flex flex-col ${
                banner.is_active ? 'bg-[#1D0E38]/80 border-white/10' : 'bg-[#150a26]/50 border-white/5 opacity-60'
              }`}
            >
              <div className="h-36 relative overflow-hidden bg-black/40">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1D0E38] via-[#1D0E38]/40 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FF5E00] text-white shadow-md">
                  {banner.badge}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{banner.title}</h3>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">{banner.subtitle}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleToggleBanner(banner.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      banner.is_active
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-emerald-400' : 'bg-white/30'}`} />
                    {banner.is_active ? 'Visible on App' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1D0E38] border border-white/20 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF5E00]" />
                Create Promo Coupon
              </h2>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                  Coupon Voucher Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH50"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono uppercase focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#170A2D] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                    Value *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#FF5E00]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="199"
                    value={couponForm.min_order_value}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_value: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#FF5E00]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={couponForm.max_discount}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#FF5E00]/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={couponForm.is_active}
                  onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF5E00] focus:ring-[#FF5E00] border-white/20 bg-white/5"
                />
                <label htmlFor="coupon_active" className="text-sm text-white/90 cursor-pointer">
                  Activate coupon code immediately at checkout
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#E05300] text-white text-sm font-semibold shadow-lg shadow-[#FF5E00]/25"
                >
                  Create Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1D0E38] border border-white/20 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FF5E00]" />
                Add Hero Carousel Banner
              </h2>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Cravings Festival"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                  Subtitle / Sub-copy *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Flat 50% off on premium gelato and snacks"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                  Badge / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUPERFAST, 50% OFF"
                  value={bannerForm.badge}
                  onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white uppercase focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">
                  Background Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bannerForm.image_url}
                  onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="banner_active"
                  checked={bannerForm.is_active}
                  onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF5E00] focus:ring-[#FF5E00] border-white/20 bg-white/5"
                />
                <label htmlFor="banner_active" className="text-sm text-white/90 cursor-pointer">
                  Display immediately in customer mobile home carousel
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#E05300] text-white text-sm font-semibold shadow-lg shadow-[#FF5E00]/25"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
