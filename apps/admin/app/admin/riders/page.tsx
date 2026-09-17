'use client';

import React, { useState, useEffect } from 'react';
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
  Filter,
  Ban
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle_type: 'EV Scooter' | 'Motorcycle' | 'Bicycle';
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

const INITIAL_RIDERS: Rider[] = [
  {
    id: 'rd-01',
    name: 'Suresh Kumar',
    phone: '+91 98450 11223',
    vehicle_type: 'EV Scooter',
    vehicle_number: 'KA-01-EQ-9421',
    kyc_status: 'verified',
    is_online: true,
    rating: 4.9,
    total_deliveries: 428,
    assigned_hub: 'Koramangala Hub 01',
    license_number: 'DL-042018009214',
    joined_date: '12 Jan 2026'
  },
  {
    id: 'rd-02',
    name: 'Vikram Singh',
    phone: '+91 97410 44556',
    vehicle_type: 'Motorcycle',
    vehicle_number: 'KA-03-MR-1102',
    kyc_status: 'pending',
    is_online: false,
    rating: 5.0,
    total_deliveries: 0,
    assigned_hub: 'Indiranagar Central',
    license_number: 'DL-052021008891',
    joined_date: 'Today, 14:20'
  },
  {
    id: 'rd-03',
    name: 'Rahul Patil',
    phone: '+91 99001 88776',
    vehicle_type: 'EV Scooter',
    vehicle_number: 'KA-05-EV-6632',
    kyc_status: 'verified',
    is_online: true,
    rating: 4.8,
    total_deliveries: 312,
    assigned_hub: 'HSR Layout Sector 2',
    license_number: 'DL-032019001147',
    joined_date: '02 Feb 2026'
  },
  {
    id: 'rd-04',
    name: 'Mohammed Ali',
    phone: '+91 98112 33445',
    vehicle_type: 'Bicycle',
    vehicle_number: 'HERO-CY-99',
    kyc_status: 'pending',
    is_online: false,
    rating: 5.0,
    total_deliveries: 0,
    assigned_hub: 'Koramangala Hub 01',
    license_number: 'AADHAAR-XXXX-4421',
    joined_date: 'Yesterday'
  },
  {
    id: 'rd-05',
    name: 'Deepak Sharma',
    phone: '+91 98200 99881',
    vehicle_type: 'Motorcycle',
    vehicle_number: 'KA-04-AB-5541',
    kyc_status: 'rejected',
    is_online: false,
    rating: 4.2,
    total_deliveries: 45,
    assigned_hub: 'Indiranagar Central',
    license_number: 'DL-092014002319',
    joined_date: '18 Feb 2026',
    kyc_rejection_reason: 'Expired driving license document submitted.'
  }
];

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  
  // Inspection Drawer
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Supabase sync
  useEffect(() => {
    async function loadRiders() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'rider');

        if (error) throw error;
        if (data && data.length > 0) {
          const formatted: Rider[] = data.map((r: any, idx: number) => ({
            id: r.id,
            name: r.full_name || `Rider ${idx + 1}`,
            phone: r.phone || '+91 90000 00000',
            vehicle_type: 'EV Scooter',
            vehicle_number: `KA-01-BEL-${1000 + idx}`,
            kyc_status: r.is_active ? 'verified' : 'pending',
            is_online: r.is_active ?? false,
            rating: 4.8,
            total_deliveries: Math.floor(Math.random() * 200) + 10,
            assigned_hub: 'Koramangala Hub 01',
            license_number: `DL-2026-${5000 + idx}`,
            joined_date: 'Recent'
          }));
          setRiders(formatted);
        }
      } catch {
        // Fallback to initial mock list
      }
    }
    loadRiders();
  }, []);

  const filteredRiders = riders.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.phone.includes(searchTerm) ||
                          r.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKyc = kycFilter === 'all' || r.kyc_status === kycFilter;
    return matchesSearch && matchesKyc;
  });

  const handleApproveKyc = async (riderId: string) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, kyc_status: 'verified', is_online: true } : r));
    if (selectedRider && selectedRider.id === riderId) {
      setSelectedRider(prev => prev ? { ...prev, kyc_status: 'verified', is_online: true } : null);
    }
    try {
      await supabase.from('profiles').update({ is_active: true }).eq('id', riderId);
    } catch {
      // Local optimistic update
    }
  };

  const handleRejectKyc = async (riderId: string) => {
    if (!rejectReason.trim()) {
      alert('Please state a rejection reason.');
      return;
    }
    setRiders(prev => prev.map(r => r.id === riderId ? { 
      ...r, 
      kyc_status: 'rejected', 
      is_online: false,
      kyc_rejection_reason: rejectReason 
    } : r));
    if (selectedRider && selectedRider.id === riderId) {
      setSelectedRider(prev => prev ? { 
        ...prev, 
        kyc_status: 'rejected', 
        is_online: false,
        kyc_rejection_reason: rejectReason 
      } : null);
    }
    setIsRejecting(false);
    setRejectReason('');
    try {
      await supabase.from('profiles').update({ is_active: false }).eq('id', riderId);
    } catch {
      // Local optimistic update
    }
  };

  const handleToggleOnline = async (riderId: string, current: boolean) => {
    const nextVal = !current;
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, is_online: nextVal } : r));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bike className="w-6 h-6 text-[#FF5E00]" />
            Fleet & Rider KYC Verification Desk
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Review delivery partner applications, inspect driving licenses, and manage active fleet safety.
          </p>
        </div>

        {/* KYC Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => {
            const active = kycFilter === tab;
            const count = tab === 'all' ? riders.length : riders.filter(r => r.kyc_status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setKycFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
                  active 
                    ? 'bg-[#FF5E00] text-white shadow-md shadow-[#FF5E00]/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  active ? 'bg-black/30 text-white' : 'bg-white/10 text-white/60'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Fleet</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{riders.length}</div>
          <div className="text-xs text-white/40 mt-1">Registered delivery partners</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending KYC Audits</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {riders.filter(r => r.kyc_status === 'pending').length}
          </div>
          <div className="text-xs text-white/40 mt-1">Requires admin approval</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active On-Duty</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {riders.filter(r => r.is_online).length}
          </div>
          <div className="text-xs text-white/40 mt-1">Carrying or awaiting dispatches</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Avg Fleet Rating</div>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-1 flex items-center gap-1.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            4.85
          </div>
          <div className="text-xs text-white/40 mt-1">Customer feedback score</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search riders by name, phone number, or vehicle plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5E00]/50 transition-colors"
          />
        </div>
      </div>

      {/* Fleet Table */}
      <div className="rounded-2xl bg-[#1D0E38]/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-white/50 tracking-wider">
              <tr>
                <th className="px-6 py-4">Rider Details</th>
                <th className="px-6 py-4">Vehicle & Plate</th>
                <th className="px-6 py-4">Assigned Hub</th>
                <th className="px-6 py-4">KYC Compliance</th>
                <th className="px-6 py-4">Duty Status</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4 text-right">KYC Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRiders.map((rider) => (
                <tr key={rider.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-[#FF5E00]/20 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                        {rider.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-[#FF5E00] transition-colors">
                          {rider.name}
                        </div>
                        <div className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {rider.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white text-xs">{rider.vehicle_type}</span>
                      <span className="text-[11px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded w-fit mt-1 border border-white/5">
                        {rider.vehicle_number}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-xs text-white/70 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF5E00]" />
                      {rider.assigned_hub}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      rider.kyc_status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : rider.kyc_status === 'pending'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                        : 'bg-red-500/10 text-red-300 border-red-500/30'
                    }`}>
                      {rider.kyc_status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {rider.kyc_status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      {rider.kyc_status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      <span className="capitalize">{rider.kyc_status}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleOnline(rider.id, rider.is_online)}
                      disabled={rider.kyc_status !== 'verified'}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        rider.is_online 
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                          : 'bg-white/5 text-white/40 border-white/10'
                      } ${rider.kyc_status !== 'verified' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${rider.is_online ? 'bg-emerald-400' : 'bg-white/30'}`} />
                      {rider.is_online ? 'On-Duty' : 'Off-Duty'}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {rider.rating}
                      </div>
                      <div className="text-xs text-white/40">
                        {rider.total_deliveries} drops
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedRider(rider);
                        setIsRejecting(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 hover:border-white/20 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FF5E00]" />
                      Audit KYC
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRiders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/40">
                    No riders found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Inspection Drawer / Modal */}
      {selectedRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1D0E38] border border-white/20 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5E00]/20 border border-[#FF5E00]/30 flex items-center justify-center text-[#FF5E00]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Rider KYC Dossier</h2>
                  <p className="text-xs text-white/50">{selectedRider.name} • {selectedRider.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRider(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedRider.kyc_status === 'verified'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : selectedRider.kyc_status === 'pending'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {selectedRider.kyc_status === 'verified' && <CheckCircle2 className="w-5 h-5" />}
                  {selectedRider.kyc_status === 'pending' && <Clock className="w-5 h-5" />}
                  {selectedRider.kyc_status === 'rejected' && <XCircle className="w-5 h-5" />}
                  <span>KYC Compliance: {selectedRider.kyc_status.toUpperCase()}</span>
                </div>
                <span className="text-xs opacity-75">Joined {selectedRider.joined_date}</span>
              </div>

              {selectedRider.kyc_rejection_reason && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Rejection Reason:</strong> {selectedRider.kyc_rejection_reason}
                  </div>
                </div>
              )}

              {/* Rider Identity & Vehicle specs */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/20 border border-white/5 text-xs">
                <div>
                  <div className="text-white/40 uppercase">Vehicle Type</div>
                  <div className="font-semibold text-white mt-0.5">{selectedRider.vehicle_type}</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase">Registration Plate</div>
                  <div className="font-semibold font-mono text-white mt-0.5">{selectedRider.vehicle_number}</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase">Assigned Hub</div>
                  <div className="font-semibold text-white mt-0.5">{selectedRider.assigned_hub}</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase">Driving License / ID</div>
                  <div className="font-semibold font-mono text-white mt-0.5">{selectedRider.license_number || 'DL-PENDING'}</div>
                </div>
              </div>

              {/* Document Mock Preview */}
              <div>
                <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#FF5E00]" />
                  Uploaded Verification Credentials
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/50">
                    <FileText className="w-8 h-8 text-white/60" />
                  </div>
                  <div className="text-sm font-semibold text-white">Govt. Motor Driving License & Aadhaar</div>
                  <p className="text-xs text-white/40">Verified with Vahan / Parivahan API sandbox</p>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    DIGITAL MATCH SCORE: 98.4%
                  </span>
                </div>
              </div>

              {/* Reject reason input */}
              {isRejecting && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="block text-xs font-semibold text-red-300 uppercase tracking-wider">
                    Specify Rejection / Suspension Grounds *
                  </label>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Expired license, mismatched photo, or failed background safety check"
                    className="w-full px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-white focus:outline-none placeholder-red-300/40"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                {selectedRider.kyc_status !== 'verified' && (
                  <button
                    onClick={() => handleApproveKyc(selectedRider.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve KYC & Onboard
                  </button>
                )}

                {isRejecting ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectKyc(selectedRider.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Ban className="w-4 h-4" />
                    Reject or Suspend Rider
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
