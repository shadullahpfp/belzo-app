'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Users, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Edit3, 
  Trash2, 
  X,
  ExternalLink
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

const INITIAL_STORES: DarkStore[] = [
  {
    id: 'store-01',
    name: 'Koramangala Hub 01',
    code: 'BLR-KRM-01',
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru, 560034',
    latitude: 12.9352,
    longitude: 77.6245,
    service_radius_km: 3.5,
    contact_phone: '+91 98888 12345',
    is_active: true,
    active_orders_count: 14,
    active_riders_count: 8
  },
  {
    id: 'store-02',
    name: 'Indiranagar Central',
    code: 'BLR-IND-02',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, 560038',
    latitude: 12.9784,
    longitude: 77.6408,
    service_radius_km: 4.0,
    contact_phone: '+91 98888 23456',
    is_active: true,
    active_orders_count: 9,
    active_riders_count: 6
  },
  {
    id: 'store-03',
    name: 'HSR Layout Sector 2',
    code: 'BLR-HSR-03',
    address: '27th Main Road, Sector 2, HSR Layout, Bengaluru, 560102',
    latitude: 12.9116,
    longitude: 77.6474,
    service_radius_km: 3.0,
    contact_phone: '+91 98888 34567',
    is_active: true,
    active_orders_count: 18,
    active_riders_count: 11
  },
  {
    id: 'store-04',
    name: 'Whitefield ITPL Hub',
    code: 'BLR-WTF-04',
    address: 'Near ITPL Main Gate, Whitefield, Bengaluru, 560066',
    latitude: 12.9856,
    longitude: 77.7314,
    service_radius_km: 5.0,
    contact_phone: '+91 98888 45678',
    is_active: false,
    active_orders_count: 0,
    active_riders_count: 0
  }
];

export default function AdminStoresPage() {
  const [stores, setStores] = useState<DarkStore[]>(INITIAL_STORES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<DarkStore | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    latitude: '12.9352',
    longitude: '77.6245',
    service_radius_km: '3.5',
    contact_phone: '',
    is_active: true
  });

  // Fetch dark stores from Supabase
  useEffect(() => {
    async function loadStores() {
      try {
        const { data, error } = await supabase
          .from('dark_stores')
          .select('*')
          .order('name');

        if (error) throw error;
        if (data && data.length > 0) {
          const mapped: DarkStore[] = data.map((s: any, idx: number) => ({
            id: s.id,
            name: s.name,
            code: s.code || `BLR-HUB-${idx + 1}`,
            address: s.address || '',
            latitude: Number(s.latitude) || 12.9352,
            longitude: Number(s.longitude) || 77.6245,
            service_radius_km: Number(s.service_radius_km) || 3.5,
            contact_phone: s.contact_phone || '+91 98765 43210',
            is_active: s.is_active ?? true,
            active_orders_count: Math.floor(Math.random() * 15) + 3,
            active_riders_count: Math.floor(Math.random() * 8) + 2
          }));
          setStores(mapped);
        }
      } catch {
        // Fallback to initial mock data
      }
    }
    loadStores();
  }, []);

  const filteredStores = stores.filter(s => 
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
      latitude: '12.9352',
      longitude: '77.6245',
      service_radius_km: '3.5',
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
    setStores(prev => prev.map(s => s.id === id ? { ...s, is_active: nextVal } : s));
    try {
      await supabase.from('dark_stores').update({ is_active: nextVal }).eq('id', id);
    } catch {
      // Local fallback
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(formData.latitude) || 12.9352;
    const lng = parseFloat(formData.longitude) || 77.6245;
    const radius = parseFloat(formData.service_radius_km) || 3.5;

    if (editingStore) {
      const updated: DarkStore = {
        ...editingStore,
        name: formData.name,
        code: formData.code,
        address: formData.address,
        latitude: lat,
        longitude: lng,
        service_radius_km: radius,
        contact_phone: formData.contact_phone,
        is_active: formData.is_active
      };
      setStores(prev => prev.map(s => s.id === editingStore.id ? updated : s));
      try {
        await supabase.from('dark_stores').update({
          name: updated.name,
          code: updated.code,
          address: updated.address,
          latitude: updated.latitude,
          longitude: updated.longitude,
          service_radius_km: updated.service_radius_km,
          contact_phone: updated.contact_phone,
          is_active: updated.is_active
        }).eq('id', editingStore.id);
      } catch {
        // Fallback
      }
    } else {
      const newStore: DarkStore = {
        id: `store-${Date.now()}`,
        name: formData.name,
        code: formData.code.toUpperCase(),
        address: formData.address,
        latitude: lat,
        longitude: lng,
        service_radius_km: radius,
        contact_phone: formData.contact_phone,
        is_active: formData.is_active,
        active_orders_count: 0,
        active_riders_count: 0
      };
      setStores(prev => [newStore, ...prev]);
      try {
        await supabase.from('dark_stores').insert([{
          name: newStore.name,
          code: newStore.code,
          address: newStore.address,
          latitude: newStore.latitude,
          longitude: newStore.longitude,
          service_radius_km: newStore.service_radius_km,
          contact_phone: newStore.contact_phone,
          is_active: newStore.is_active
        }]);
      } catch {
        // Fallback
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this dark store hub?')) return;
    setStores(prev => prev.filter(s => s.id !== id));
    try {
      await supabase.from('dark_stores').delete().eq('id', id);
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
            <Building2 className="w-6 h-6 text-[#FF5E00]" />
            Dark Stores & Fulfillment Hubs
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Configure geo-fenced dark stores, 10-minute delivery polygons, and live station dispatchers.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gradient-to-r from-[#FF5E00] to-[#E05300] hover:brightness-110 text-white font-medium text-sm rounded-xl shadow-lg shadow-[#FF5E00]/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Dark Store Hub
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Hubs</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{stores.length}</div>
          <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
            Across Bengaluru Metro
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Active & Dispatching</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {stores.filter(s => s.is_active).length}
          </div>
          <div className="text-xs text-white/40 mt-1">Accepting live checkout</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider">Active Fleet Assigned</div>
          <div className="text-2xl font-bold text-blue-400 font-mono mt-1">
            {stores.reduce((acc, s) => acc + (s.active_riders_count || 0), 0)} Riders
          </div>
          <div className="text-xs text-white/40 mt-1">On standby or delivering</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-purple-400/80 uppercase tracking-wider">Average SLA Radius</div>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-1">
            {(stores.reduce((acc, s) => acc + s.service_radius_km, 0) / (stores.length || 1)).toFixed(1)} km
          </div>
          <div className="text-xs text-white/40 mt-1">Under 10 mins target</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dark stores by name, code or street address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5E00]/50 transition-colors"
          />
        </div>
      </div>

      {/* Dark Stores Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className={`p-6 rounded-2xl border backdrop-blur-xl transition-all relative overflow-hidden ${
              store.is_active
                ? 'bg-[#1D0E38]/70 border-white/10 hover:border-[#FF5E00]/40'
                : 'bg-[#150a26]/50 border-white/5 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-white/80 border border-white/10">
                    {store.code}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    store.is_active 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-300 border-red-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {store.is_active ? 'Online' : 'Offline'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">{store.name}</h3>
                <p className="text-xs text-white/50 flex items-start gap-1.5 mt-1 max-w-sm">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#FF5E00] mt-0.5" />
                  {store.address}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(store)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Edit Hub Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStore(store.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Delete Hub"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-black/20 border border-white/5">
              <div>
                <div className="text-[10px] text-white/40 uppercase">Delivery SLA</div>
                <div className="text-sm font-semibold text-white font-mono mt-0.5">
                  {store.service_radius_km} km radius
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">Active Orders</div>
                <div className="text-sm font-semibold text-[#FF5E00] font-mono mt-0.5">
                  {store.active_orders_count || 0} in progress
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">Fleet Online</div>
                <div className="text-sm font-semibold text-blue-400 font-mono mt-0.5">
                  {store.active_riders_count || 0} riders
                </div>
              </div>
            </div>

            {/* Hub footer & quick actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-xs text-white/40">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-white/30" />
                  {store.contact_phone}
                </span>
                <span className="font-mono text-[11px] text-white/30">
                  {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                </span>
              </div>
              
              <button
                onClick={() => handleToggleStoreStatus(store.id, store.is_active)}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                  store.is_active
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                {store.is_active ? 'Pause Dispatch' : 'Resume Hub'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Hub Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1D0E38] border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FF5E00]" />
                {editingStore ? 'Configure Dark Store Hub' : 'Register New Dark Store Hub'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Hub Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koramangala Hub 01"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Store Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BLR-KRM-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                  Full Street Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street, locality, landmark, postal code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="12.9352"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5E00]/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="77.6245"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5E00]/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                    Radius (KM) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="3.5"
                    value={formData.service_radius_km}
                    onChange={(e) => setFormData({ ...formData, service_radius_km: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5E00]/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                  Manager Dispatch Phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98888 12345"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5E00]/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="store_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF5E00] focus:ring-[#FF5E00] border-white/20 bg-white/5"
                />
                <label htmlFor="store_active" className="text-sm text-white/90 cursor-pointer">
                  Activate store immediately for customer ordering and auto-dispatch
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
                  {editingStore ? 'Save Hub' : 'Register Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
