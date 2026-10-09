'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  Ban,
  RefreshCw,
  UserX
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Supabase live sync
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch profiles where role = customer
      const { data: profilesData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .neq('role', 'store_operator')
        .order('created_at', { ascending: false });

      if (profError || !profilesData) {
        setCustomers([]);
        return;
      }

      // 2. Fetch orders to calculate customer GMV and order counts
      const { data: ordersData } = await supabase
        .from('orders')
        .select('customer_id, total_amount, created_at, status');

      const allOrders: any[] = ordersData || [];

      const formatted: Customer[] = profilesData.map((c: any, idx: number) => {
        const userOrders = allOrders.filter((o) => o.customer_id === c.id);
        const validOrders = userOrders.filter((o) => o.status !== 'cancelled');
        const totalOrders = userOrders.length;
        const lifetimeGmv = validOrders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
        
        // Find most recent order date
        const sortedOrders = [...userOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastOrder = sortedOrders[0];
        const lastOrderDate = lastOrder?.created_at
          ? new Date(lastOrder.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            })
          : 'No orders yet';

        return {
          id: c.id,
          name: c.full_name || `Customer #${c.id.slice(0, 5)}`,
          phone: c.phone || '+91 90000 00000',
          email: c.email || undefined,
          member_since: new Date(c.created_at || Date.now()).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          total_orders: totalOrders,
          lifetime_gmv: lifetimeGmv,
          last_order_date: lastOrderDate,
          is_active: c.is_active ?? true,
          risk_level: c.is_active === false ? 'high' : 'low'
        };
      });

      setCustomers(formatted);
    } catch (err) {
      console.warn('[Admin Customers] Query exception:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();

    const channel = supabase
      .channel('admin-customers-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadCustomers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadCustomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCustomers]);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' 
        ? true 
        : statusFilter === 'active' ? c.is_active : !c.is_active;
    return matchesSearch && matchesStatus;
  });

  const handleToggleBlock = async (id: string, currentlyActive: boolean) => {
    const nextState = !currentlyActive;
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, is_active: nextState } : c));
    try {
      await supabase
        .from('profiles')
        .update({ is_active: nextState, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (err) {
      console.warn('Block account error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FF5E00]" />
            Customer Directory & Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registered customer profiles, ordering telemetry, and automated security fraud gatekeeping.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadCustomers()}
            className="p-2.5 rounded-2xl bg-white border border-black/5 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5E00]' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Total Customers: {customers.length}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Total User Base</p>
          <p className="text-2xl font-extrabold text-gray-950 mt-1 tracking-tight tabular-nums">
            {customers.length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Registered consumers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Active Accounts</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1 tracking-tight tabular-nums">
            {customers.filter((c) => c.is_active).length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Authorized for checkout</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Blocked / Suspended</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1 tracking-tight tabular-nums">
            {customers.filter((c) => !c.is_active).length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Restricted from orders</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Lifetime Consumer GMV</p>
          <p className="text-2xl font-extrabold text-gray-950 mt-1 tracking-tight tabular-nums">
            ₹{customers.reduce((sum, c) => sum + c.lifetime_gmv, 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Across all order items</p>
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
            placeholder="Search by name, phone, or email..."
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5E00] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {(['all', 'active', 'blocked'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                statusFilter === filter
                  ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                  : 'bg-white text-gray-600 border-black/5 hover:bg-gray-50'
              }`}
            >
              {filter === 'all'
                ? `All Accounts (${customers.length})`
                : filter.replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer Details</th>
                <th className="py-3.5 px-6">Contact / Phone</th>
                <th className="py-3.5 px-6">Member Since</th>
                <th className="py-3.5 px-6">Total Orders</th>
                <th className="py-3.5 px-6">Lifetime GMV</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold border border-black/5 shrink-0">
                        {customer.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-950 text-xs">{customer.name}</p>
                        {customer.email && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{customer.email}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-mono text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {customer.member_since}
                  </td>

                  <td className="px-6 py-4 font-extrabold text-gray-950 tabular-nums">
                    {customer.total_orders} orders
                  </td>

                  <td className="px-6 py-4 font-extrabold text-gray-950 tabular-nums">
                    ₹{customer.lifetime_gmv.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        customer.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {customer.is_active ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 text-red-600" />
                      )}
                      <span>{customer.is_active ? 'Active' : 'Blocked'}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleBlock(customer.id, customer.is_active)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        customer.is_active
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {customer.is_active ? 'Block Account' : 'Unblock Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Apple-grade Quiet Empty State */}
          {!loading && filteredCustomers.length === 0 && (
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
                <Users className="w-6 h-6 text-gray-400 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                No Customers Registered Yet
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No customer profiles matching query "${searchTerm}".`
                  : 'Customers signing up on the Belzo mobile app will automatically appear in this directory.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
