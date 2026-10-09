'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bike, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Star, 
  Phone, 
  MapPin, 
  Eye, 
  X,
  Ban,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  kyc_status: 'verified' | 'pending' | 'rejected';
  is_online: boolean;
  rating: number;
  total_deliveries: number;
  assigned_hub: string;
  license_number?: string;
  joined_date: string;
  kyc_rejection_reason?: string;
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  
  // Inspection Drawer
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Live Supabase query from riders joined with profiles and dark_stores
  const loadRiders = useCallback(async () => {
    try {
      setLoading(true);
      const { data: ridersData, error: ridersErr } = await supabase
        .from('riders')
        .select(`
          *,
          profiles:id (full_name, phone, avatar_url, is_active),
          dark_stores:store_id (name)
        `);

      if (!ridersErr && ridersData && ridersData.length > 0) {
        const formatted: Rider[] = ridersData.map((r: any) => ({
          id: r.id,
          name: r.profiles?.full_name || `Courier #${r.id.slice(0, 5)}`,
          phone: r.profiles?.phone || '+91 90000 00000',
          vehicle_type: r.vehicle_type || 'Motorcycle',
          vehicle_number: r.vehicle_number || 'UP-71',
          kyc_status: r.kyc_status || (r.is_verified ? 'verified' : 'pending'),
          is_online: Boolean(r.is_online),
          rating: Number(r.rating) || 5.0,
          total_deliveries: Number(r.total_deliveries) || 0,
          assigned_hub: r.dark_stores?.name || 'Belzo Joniha Central Hub 01',
          license_number: r.license_number || r.driving_license_no || 'DL-ON-RECORD',
          joined_date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Active Partner',
        }));
        setRiders(formatted);
      } else {
        // Check if there are profiles with role = 'rider'
        const { data: profileRiders } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'rider');

        if (profileRiders && profileRiders.length > 0) {
          const formatted: Rider[] = profileRiders.map((p: any) => ({
            id: p.id,
            name: p.full_name || 'Courier Partner',
            phone: p.phone || '+91 90000 00000',
            vehicle_type: 'Motorcycle',
            vehicle_number: 'UP-71',
            kyc_status: p.is_active ? 'verified' : 'pending',
            is_online: Boolean(p.is_active),
            rating: 5.0,
            total_deliveries: 0,
            assigned_hub: 'Belzo Joniha Central Hub 01',
            license_number: 'KYC-PENDING',
            joined_date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Registered',
          }));
          setRiders(formatted);
        } else {
          setRiders([]);
        }
      }
    } catch (err) {
      console.warn('[Admin Riders] Supabase sync note:', err);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRiders();

    const channel = supabase
      .channel('admin-riders-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders' },
        () => {
          loadRiders();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadRiders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRiders]);

  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKyc = kycFilter === 'all' || r.kyc_status === kycFilter;
    return matchesSearch && matchesKyc;
  });

  const handleApproveKyc = async (riderId: string) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, kyc_status: 'verified', is_online: true } : r))
    );
    if (selectedRider && selectedRider.id === riderId) {
      setSelectedRider((prev) => (prev ? { ...prev, kyc_status: 'verified', is_online: true } : null));
    }
    try {
      await Promise.all([
        supabase.from('riders').update({ kyc_status: 'verified', is_online: true }).eq('id', riderId),
        supabase.from('profiles').update({ is_active: true }).eq('id', riderId),
      ]);
    } catch (err) {
      console.warn('KYC approval error:', err);
    }
  };

  const handleRejectKyc = async (riderId: string) => {
    if (!rejectReason.trim()) {
      alert('Please state a rejection reason.');
      return;
    }
    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? { 
              ...r, 
              kyc_status: 'rejected', 
              is_online: false,
              kyc_rejection_reason: rejectReason 
            }
          : r
      )
    );
    if (selectedRider && selectedRider.id === riderId) {
      setSelectedRider((prev) =>
        prev
          ? { 
              ...prev, 
              kyc_status: 'rejected', 
              is_online: false,
              kyc_rejection_reason: rejectReason 
            }
          : null
      );
    }
    setIsRejecting(false);
    setRejectReason('');
    try {
      await Promise.all([
        supabase.from('riders').update({ kyc_status: 'rejected', is_online: false }).eq('id', riderId),
        supabase.from('profiles').update({ is_active: false }).eq('id', riderId),
      ]);
    } catch (err) {
      console.warn('KYC reject error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            <Bike className="w-6 h-6 text-[#FF5E00]" />
            Fleet & Courier KYC Desk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Verification pipeline, on-duty duty tracking, and license audits for 10-minute dispatchers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadRiders()}
            className="p-2.5 rounded-2xl bg-white border border-black/5 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5E00]' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>On-Duty: {riders.filter((r) => r.is_online).length}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Total Registered Fleet</p>
          <p className="text-2xl font-extrabold text-gray-950 mt-1 tracking-tight tabular-nums">
            {riders.length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Delivery couriers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">KYC Verified</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1 tracking-tight tabular-nums">
            {riders.filter((r) => r.kyc_status === 'verified').length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Authorized for drops</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1 tracking-tight tabular-nums">
            {riders.filter((r) => r.kyc_status === 'pending').length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Action required</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Suspended / Rejected</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1 tracking-tight tabular-nums">
            {riders.filter((r) => r.kyc_status === 'rejected').length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Deactivated profiles</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search couriers by name, phone, plate..."
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5E00] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setKycFilter(filter)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                kycFilter === filter
                  ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                  : 'bg-white text-gray-600 border-black/5 hover:bg-gray-50'
              }`}
            >
              {filter === 'all'
                ? `All Partners (${riders.length})`
                : filter.replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Couriers Table Card */}
      <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Courier Identity</th>
                <th className="py-3.5 px-6">Vehicle / Reg</th>
                <th className="py-3.5 px-6">KYC Status</th>
                <th className="py-3.5 px-6">Duty Status</th>
                <th className="py-3.5 px-6">Total Deliveries</th>
                <th className="py-3.5 px-6 text-right">KYC Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredRiders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5E00]">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-950 text-xs">{rider.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{rider.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{rider.vehicle_number}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{rider.vehicle_type}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        rider.kyc_status === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rider.kyc_status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {rider.kyc_status === 'verified' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : rider.kyc_status === 'pending' ? (
                        <Clock className="w-3 h-3 text-amber-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span>{rider.kyc_status.toUpperCase()}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        rider.is_online
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          rider.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                        }`}
                      />
                      <span>{rider.is_online ? 'On-Duty' : 'Offline'}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4 font-bold text-gray-950 tabular-nums">
                    {rider.total_deliveries} drops
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {rider.kyc_status !== 'verified' && (
                        <button
                          onClick={() => handleApproveKyc(rider.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}
                      {rider.kyc_status !== 'rejected' && (
                        <button
                          onClick={() => {
                            setSelectedRider(rider);
                            setIsRejecting(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-all flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Apple-grade Quiet Empty State */}
          {!loading && filteredRiders.length === 0 && (
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
                <Bike className="w-6 h-6 text-gray-400 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                No Delivery Partners Registered Yet
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No couriers matching query "${searchTerm}".`
                  : 'Riders who register via the Belzo Courier mobile app will appear here for KYC verification.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection / Suspension Modal */}
      {isRejecting && selectedRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-950">
                Reject / Suspend Partner
              </h3>
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setSelectedRider(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Suspend partner <strong>{selectedRider.name}</strong> ({selectedRider.vehicle_number}). This immediately revokes order dispatch permissions.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Expired driving license or failed vehicle inspection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-2xl p-3 text-xs text-gray-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsRejecting(false);
                  setSelectedRider(null);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectKyc(selectedRider.id)}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
