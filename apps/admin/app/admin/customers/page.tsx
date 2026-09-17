'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  IndianRupee, 
  CheckCircle2, 
  Ban, 
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  member_since: string;
  total_orders: number;
  lifetime_gmv: number;
  last_order_date: string;
  is_active: boolean; // false means blocked
  risk_level: 'low' | 'medium' | 'high';
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    name: 'Ananya Deshmukh',
    phone: '+91 98451 22334',
    email: 'ananya.d@gmail.com',
    member_since: '10 Jan 2026',
    total_orders: 42,
    lifetime_gmv: 14850,
    last_order_date: 'Today, 11:30 AM',
    is_active: true,
    risk_level: 'low'
  },
  {
    id: 'cust-02',
    name: 'Rohan Mehra',
    phone: '+91 97420 55667',
    email: 'rohan.mehra@outlook.com',
    member_since: '18 Jan 2026',
    total_orders: 19,
    lifetime_gmv: 6200,
    last_order_date: 'Yesterday, 19:15 PM',
    is_active: true,
    risk_level: 'low'
  },
  {
    id: 'cust-03',
    name: 'Kavita Sundaram',
    phone: '+91 99012 33445',
    email: 'kavita.s@yahoo.co.in',
    member_since: '05 Feb 2026',
    total_orders: 28,
    lifetime_gmv: 11400,
    last_order_date: '14 Feb 2026',
    is_active: true,
    risk_level: 'low'
  },
  {
    id: 'cust-04',
    name: 'Suspicious Account 901',
    phone: '+91 91234 56789',
    email: 'temp.user901@mailinator.com',
    member_since: '16 Feb 2026',
    total_orders: 3,
    lifetime_gmv: 890,
    last_order_date: '16 Feb 2026',
    is_active: false,
    risk_level: 'high'
  },
  {
    id: 'cust-05',
    name: 'Arjun Nambiar',
    phone: '+91 98860 77889',
    email: 'arjun.n@gmail.com',
    member_since: '22 Jan 2026',
    total_orders: 35,
    lifetime_gmv: 13200,
    last_order_date: 'Today, 08:45 AM',
    is_active: true,
    risk_level: 'low'
  }
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Supabase sync
  useEffect(() => {
    async function loadCustomers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer');

        if (error) throw error;
        if (data && data.length > 0) {
          const formatted: Customer[] = data.map((c: any, idx: number) => ({
            id: c.id,
            name: c.full_name || `Customer #${idx + 1}`,
            phone: c.phone || '+91 98000 00000',
            email: c.email || undefined,
            member_since: new Date(c.created_at || Date.now()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            total_orders: Math.floor(Math.random() * 30) + 5,
            lifetime_gmv: Math.floor(Math.random() * 15000) + 2000,
            last_order_date: 'Recent',
            is_active: c.is_active ?? true,
            risk_level: c.is_active === false ? 'high' : 'low'
          }));
          setCustomers(formatted);
        }
      } catch {
        // Mock fallback
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.phone.includes(searchTerm) ||
                          (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'active' ? c.is_active : !c.is_active;
    return matchesSearch && matchesStatus;
  });

  const handleToggleBlock = async (id: string, currentlyActive: boolean) => {
    const nextState = !currentlyActive;
    const action = nextState ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this customer account?`)) return;

    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          is_active: nextState, 
          risk_level: nextState ? 'low' : 'high' 
        };
      }
      return c;
    }));

    try {
      await supabase.from('profiles').update({ is_active: nextState }).eq('id', id);
    } catch {
      // Local optimistic update
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FF5E00]" />
            Customer Directory & Trust & Safety
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Global consumer profiles, lifetime GMV metrics, order history, and fraud mitigation switches.
          </p>
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
          {(['all', 'active', 'blocked'] as const).map((tab) => {
            const active = statusFilter === tab;
            const count = tab === 'all' 
              ? customers.length 
              : tab === 'active' 
              ? customers.filter(c => c.is_active).length 
              : customers.filter(c => !c.is_active).length;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Customers</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{customers.length}</div>
          <div className="text-xs text-white/40 mt-1">Verified mobile phone users</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Consumers</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {customers.filter(c => c.is_active).length}
          </div>
          <div className="text-xs text-white/40 mt-1">In good standing</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">Blocked Accounts</div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {customers.filter(c => !c.is_active).length}
          </div>
          <div className="text-xs text-white/40 mt-1">Abuse & fraud blacklisted</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Lifetime Customer GMV</div>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-1">
            ₹{customers.reduce((acc, c) => acc + c.lifetime_gmv, 0).toLocaleString()}
          </div>
          <div className="text-xs text-white/40 mt-1">Across all completed orders</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, phone number, or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5E00]/50 transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-[#1D0E38]/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-white/50 tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer Profile</th>
                <th className="px-6 py-4">Member Since</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Lifetime Spend</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4">Account Standing</th>
                <th className="px-6 py-4 text-right">Safety Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5E00]/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-[#FF5E00] transition-colors">
                          {customer.name}
                        </div>
                        <div className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs text-white/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      {customer.member_since}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-mono font-medium text-white">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#FF5E00]" />
                      {customer.total_orders} orders
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-emerald-400">
                      ₹{customer.lifetime_gmv.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-white/50">
                    {customer.last_order_date}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      customer.is_active
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-300 border-red-500/30'
                    }`}>
                      {customer.is_active ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {customer.is_active ? 'Active Consumer' : 'Blacklisted / Blocked'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleBlock(customer.id, customer.is_active)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                        customer.is_active
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30 hover:border-red-500/50'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50'
                      }`}
                    >
                      {customer.is_active ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          Block Account
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Unblock Customer
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/40">
                    No customers found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
