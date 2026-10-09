'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Edit3, 
  Trash2, 
  X,
  RefreshCw,
  ShoppingBag,
  Bike
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DarkStore {
  id: string;
  name: string;
  code: string;
  address: string;
  latitude: number;
  longitude: number;
  service_radius_km: number;
  contact_phone: string;
  is_active: boolean;
  active_orders_count?: number;
  active_riders_count?: number;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<DarkStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<DarkStore | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    latitude: '26.0350',
    longitude: '80.4650',
    service_radius_km: '5.0',
    contact_phone: '',
    is_active: true
  });

  // Fetch dark stores with live real active orders and riders count from Supabase
  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      const { data: storesData, error } = await supabase
        .from('dark_stores')
        .select('*')
        .order('name');

      if (error || !storesData) {
        setStores([]);
        return;
      }

      // Fetch live active orders and riders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, store_id, dark_store_id, status');

      const { data: ridersData } = await supabase
        .from('riders')
        .select('id, store_id, assigned_dark_store_id, is_online');

      const allOrders: any[] = ordersData || [];
      const allRiders: any[] = ridersData || [];

      const mapped: DarkStore[] = storesData.map((s: any, idx: number) => {
        const storeActiveOrders = allOrders.filter(
          (o) => (o.store_id === s.id || o.dark_store_id === s.id) && 
                 ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(o.status)
        ).length;
        const storeActiveRiders = allRiders.filter(
          (r) => (r.store_id === s.id || r.assigned_dark_store_id === s.id) && r.is_online
        ).length;

        return {
          id: s.id,
          name: s.name,
          code: s.hub_code || s.code || `BEL-HUB-${idx + 1}`,
          address: s.address || '',
          latitude: Number(s.latitude) || 26.0350,
          longitude: Number(s.longitude) || 80.4650,
          service_radius_km: Number(s.service_radius_km) || 5.0,
          contact_phone: s.contact_phone || '+91 98765 43210',
          is_active: s.is_active ?? true,
          active_orders_count: storeActiveOrders,
          active_riders_count: storeActiveRiders,
        };
      });
      setStores(mapped);
    } catch (err) {
      console.warn('[Admin Stores] Load note:', err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();

    const channel = supabase
      .channel('admin-stores-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dark_stores' },
        () => {
          loadStores();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadStores();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders' },
        () => {
          loadStores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStores]);

  const filteredStores = stores.filter((s) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      latitude: '26.0350',
      longitude: '80.4650',
      service_radius_km: '5.0',
      contact_phone: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: DarkStore) => {
    setEditingStore(s);
    setFormData({
      name: s.name,
      code: s.code,
      address: s.address,
      latitude: s.latitude.toString(),
      longitude: s.longitude.toString(),
      service_radius_km: s.service_radius_km.toString(),
      contact_phone: s.contact_phone,
      is_active: s.is_active
    });
    setIsModalOpen(true);
  };

  const handleToggleStoreStatus = async (id: string, current: boolean) => {
    const nextVal = !current;
    setStores((prev) => prev.map((s) => s.id === id ? { ...s, is_active: nextVal } : s));
    try {
      await supabase.from('dark_stores').update({ is_active: nextVal }).eq('id', id);
    } catch {
      // Local fallback
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(formData.latitude) || 26.0350;
    const lng = parseFloat(formData.longitude) || 80.4650;
    const radius = parseFloat(formData.service_radius_km) || 5.0;

    const payload = {
      name: formData.name.trim(),
      hub_code: formData.code.trim(),
      address: formData.address.trim(),
      latitude: lat,
      longitude: lng,
      service_radius_km: radius,
      contact_phone: formData.contact_phone.trim(),
      is_active: formData.is_active
    };

    if (editingStore) {
      setStores((prev) => prev.map((s) => s.id === editingStore.id ? { ...s, ...payload, code: formData.code } : s));
      try {
        await supabase
          .from('dark_stores')
          .update(payload)
          .eq('id', editingStore.id);
      } catch (err) {
        console.warn('Update dark store error:', err);
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('dark_stores')
          .insert([payload])
          .select()
          .single();

        if (error) {
          alert(`Error creating hub: ${error.message}`);
        } else if (data) {
          loadStores();
        }
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }

    setIsModalOpen(false);
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to remove this dark store fulfillment hub?')) return;
    setStores((prev) => prev.filter((s) => s.id !== id));
    try {
      await supabase.from('dark_stores').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete dark store error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#FF5E00]" />
            Dark Store Fulfillment Hubs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real micro-fulfillment network nodes, geo-fenced delivery radii, and live courier allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStores()}
            className="p-2.5 rounded-2xl bg-white border border-black/5 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            title="Refresh Dark Stores"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5E00]' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Dark Store Hub
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by hub name, code, area..."
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5E00] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>
      </div>

      {/* Dark Stores Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white border border-black/5 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-extrabold text-base text-gray-950 tracking-tight">
                    {store.name}
                  </h3>
                  <span className="inline-block mt-0.5 text-[11px] font-mono font-bold text-gray-400 uppercase">
                    {store.code}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStoreStatus(store.id, store.is_active)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    store.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {store.is_active ? 'Operational' : 'Deactivated'}
                </button>
              </div>

              {/* Location & Details */}
              <div className="space-y-2 text-xs text-gray-600 mt-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-mono text-gray-700">{store.contact_phone}</span>
                </div>
              </div>

              {/* Real-time SQL metrics */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100">
                <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5E00]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400">Active Orders</p>
                    <p className="text-sm font-extrabold text-gray-950 tabular-nums">
                      {store.active_orders_count ?? 0}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400">Couriers Online</p>
                    <p className="text-sm font-extrabold text-gray-950 tabular-nums">
                      {store.active_riders_count ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-400 font-medium">
                Radius: <strong className="text-gray-700">{store.service_radius_km} km</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(store)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteStore(store.id)}
                  className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                  title="Remove Hub"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Apple-grade Quiet Empty State */}
      {!loading && filteredStores.length === 0 && (
        <div className="bg-white border border-black/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
            <Building2 className="w-6 h-6 text-gray-400 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
            No Dark Stores Registered
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            {searchTerm
              ? `No hubs matching query "${searchTerm}".`
              : 'Add your primary dispatch hub or micro-fulfillment center to enable hyperlocal 10-minute routing.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
          >
            + Add Dark Store Hub
          </button>
        </div>
      )}

      {/* Add / Edit Hub Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-950">
                {editingStore ? 'Edit Dark Store Hub' : 'Add Dark Store Hub'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belzo Joniha Central Hub 01"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hub Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLZ-UP-JON01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Physical Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Joniha Chauraha, Bindki Road, Fatehpur, UP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Radius (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.service_radius_km}
                    onChange={(e) => setFormData({ ...formData, service_radius_km: e.target.value })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all"
                >
                  Save Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
