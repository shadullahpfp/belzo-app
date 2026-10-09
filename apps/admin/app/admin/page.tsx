'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Bike,
  Clock,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DarkStoreRow {
  id: string;
  name: string;
  code: string;
  activeOrders: number;
  readyOrders: number;
  onlineRiders: number;
  loadPct: number;
  status: 'Optimal' | 'High Load' | 'Offline';
  avgSla: string;
}

interface OrderMetrics {
  gmv: number;
  totalOrdersToday: number;
  deliveredToday: number;
  activeToday: number;
  cancelledToday: number;
  activeRiders: number;
  avgSlaMinutes: number | null;
  hourlyVelocity: { hour: string; orders: number; gmv: number }[];
  darkStores: DarkStoreRow[];
}

const DEFAULT_HOURLY = [
  { hour: '06:00', orders: 0, gmv: 0 },
  { hour: '08:00', orders: 0, gmv: 0 },
  { hour: '10:00', orders: 0, gmv: 0 },
  { hour: '12:00', orders: 0, gmv: 0 },
  { hour: '14:00', orders: 0, gmv: 0 },
  { hour: '16:00', orders: 0, gmv: 0 },
  { hour: '18:00', orders: 0, gmv: 0 },
  { hour: '20:00', orders: 0, gmv: 0 },
  { hour: '22:00', orders: 0, gmv: 0 },
];

export default function AdminExecutiveDashboard() {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<OrderMetrics>({
    gmv: 0,
    totalOrdersToday: 0,
    deliveredToday: 0,
    activeToday: 0,
    cancelledToday: 0,
    activeRiders: 0,
    avgSlaMinutes: null,
    hourlyVelocity: DEFAULT_HOURLY,
    darkStores: [],
  });

  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Start of today in UTC / local
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayIso = startOfToday.toISOString();

      // 2. Fetch Orders
      const { data: allOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('*');

      // 3. Fetch Riders
      const { data: ridersData, error: ridersErr } = await supabase
        .from('riders')
        .select('*');

      // 4. Fetch Dark Stores
      const { data: storesData, error: storesErr } = await supabase
        .from('dark_stores')
        .select('*');

      const orders: any[] = (allOrders as any[]) || [];
      const riders: any[] = (ridersData as any[]) || [];
      const stores: any[] = (storesData as any[]) || [];

      // Calculate GMV (excluding cancelled)
      const gmv = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      // Orders today filter
      const ordersToday = orders.filter((o) => {
        const createdAt = new Date(o.created_at || o.placed_at || 0).getTime();
        return createdAt >= startOfToday.getTime();
      });

      const deliveredToday = ordersToday.filter((o) => o.status === 'delivered').length;
      const activeToday = ordersToday.filter((o) =>
        ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(o.status)
      ).length;
      const cancelledToday = ordersToday.filter((o) => o.status === 'cancelled').length;

      // Active Riders On-Duty
      const activeRiders = riders.filter((r) => r.is_online === true).length;

      // Avg SLA for delivered orders (updated_at - created_at)
      const deliveredOrders = orders.filter((o) => o.status === 'delivered' && o.updated_at && o.created_at);
      let avgSlaMinutes: number | null = null;
      if (deliveredOrders.length > 0) {
        const totalMinutes = deliveredOrders.reduce((sum, o) => {
          const diffMs = new Date(o.updated_at).getTime() - new Date(o.created_at).getTime();
          return sum + Math.max(1, Math.round(diffMs / 60000));
        }, 0);
        avgSlaMinutes = parseFloat((totalMinutes / deliveredOrders.length).toFixed(1));
      }

      // Hourly velocity distribution for today
      const hourlyMap: Record<string, { orders: number; gmv: number }> = {
        '06:00': { orders: 0, gmv: 0 },
        '08:00': { orders: 0, gmv: 0 },
        '10:00': { orders: 0, gmv: 0 },
        '12:00': { orders: 0, gmv: 0 },
        '14:00': { orders: 0, gmv: 0 },
        '16:00': { orders: 0, gmv: 0 },
        '18:00': { orders: 0, gmv: 0 },
        '20:00': { orders: 0, gmv: 0 },
        '22:00': { orders: 0, gmv: 0 },
      };

      ordersToday.forEach((o) => {
        const date = new Date(o.created_at || o.placed_at || Date.now());
        const hour = date.getHours();
        let bucket = '06:00';
        if (hour >= 21) bucket = '22:00';
        else if (hour >= 19) bucket = '20:00';
        else if (hour >= 17) bucket = '18:00';
        else if (hour >= 15) bucket = '16:00';
        else if (hour >= 13) bucket = '14:00';
        else if (hour >= 11) bucket = '12:00';
        else if (hour >= 9) bucket = '10:00';
        else if (hour >= 7) bucket = '08:00';
        else bucket = '06:00';

        hourlyMap[bucket].orders += 1;
        if (o.status !== 'cancelled') {
          hourlyMap[bucket].gmv += Number(o.total_amount) || 0;
        }
      });

      const hourlyVelocity = Object.entries(hourlyMap).map(([hour, data]) => ({
        hour,
        orders: data.orders,
        gmv: data.gmv,
      }));

      // Dark stores status matrix
      const darkStores: DarkStoreRow[] = stores.map((s) => {
        const storeOrders = orders.filter(
          (o) => o.store_id === s.id || o.dark_store_id === s.id
        );
        const storeActiveOrders = storeOrders.filter((o) =>
          ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(o.status)
        ).length;
        const storeReadyOrders = storeOrders.filter((o) =>
          ['ready_for_pickup', 'preparing'].includes(o.status)
        ).length;
        const storeRiders = riders.filter(
          (r) => (r.store_id === s.id || r.assigned_dark_store_id === s.id) && r.is_online
        ).length;

        const maxStoreCapacity = 50;
        const loadPct = Math.min(100, Math.round((storeActiveOrders / maxStoreCapacity) * 100));

        return {
          id: s.id,
          name: s.name || 'Belzo Dark Store',
          code: s.hub_code || s.code || 'BLZ-HUB',
          activeOrders: storeActiveOrders,
          readyOrders: storeReadyOrders,
          onlineRiders: storeRiders,
          loadPct,
          status: !s.is_active ? 'Offline' : loadPct > 80 ? 'High Load' : 'Optimal',
          avgSla: avgSlaMinutes ? `${avgSlaMinutes} mins` : '--',
        };
      });

      setMetrics({
        gmv,
        totalOrdersToday: ordersToday.length,
        deliveredToday,
        activeToday,
        cancelledToday,
        activeRiders,
        avgSlaMinutes,
        hourlyVelocity,
        darkStores,
      });
    } catch (err) {
      console.warn('[Admin Dashboard] Query error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Supabase Realtime Channel Subscription for live zero-reload dashboard sync
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders' },
        () => {
          loadDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dark_stores' },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboardData]);

  const maxOrders = Math.max(1, ...metrics.hourlyVelocity.map((d) => d.orders));

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
            Operations & Executive Command
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time telemetry across Joniha Central Hub and regional dark store micro-fulfillment centers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsLoading(true);
              loadDashboardData();
            }}
            className="p-2.5 rounded-2xl bg-white border border-black/5 hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF5E00]' : ''}`} />
          </button>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.97]"
          >
            <ShoppingBag className="w-4 h-4" />
            Inspect Live Orders
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards (Apple Studio Light Standard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue (GMV)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-950 font-mono tabular-nums">
            ₹{metrics.gmv.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Live Sync</span>
            <span className="text-gray-400 font-normal">• All settled orders</span>
          </div>
        </div>

        {/* Total Orders Today */}
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Today</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF5E00] border border-orange-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-950 font-mono tabular-nums">
            {metrics.totalOrdersToday.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold mt-2">
            <span className="text-emerald-700 font-bold tabular-nums">
              {metrics.deliveredToday} Delivered
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[#FF5E00] font-bold tabular-nums">
              {metrics.activeToday} Active
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-red-600 font-bold tabular-nums">
              {metrics.cancelledToday} Cancelled
            </span>
          </div>
        </div>

        {/* Active Fleet */}
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Fleet On-Duty</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-950 font-mono tabular-nums">
            {metrics.activeRiders} {metrics.activeRiders === 1 ? 'Rider' : 'Riders'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                metrics.activeRiders > 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span>
              {metrics.activeRiders > 0
                ? `${metrics.activeRiders} active couriers online`
                : 'No couriers currently on-duty'}
            </span>
          </div>
        </div>

        {/* Avg Delivery Time */}
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Average SLA Time</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-950 font-mono tabular-nums">
            {metrics.avgSlaMinutes !== null ? `${metrics.avgSlaMinutes} Mins` : '--'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target: 12-Minute Instant SLA</span>
          </div>
        </div>
      </div>

      {/* Hourly Velocity Chart Card */}
      <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-950">
              Hourly Order Velocity & Intake Flow
            </h2>
            <p className="text-xs text-gray-500">
              Orders placed per hour across all active dark store micro-hubs today
            </p>
          </div>
          {activeBar !== null && (
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#FF5E00]">
                {metrics.hourlyVelocity[activeBar].hour}: {metrics.hourlyVelocity[activeBar].orders} orders
              </span>
              <span className="text-xs text-gray-400 ml-2 font-mono">
                (₹{metrics.hourlyVelocity[activeBar].gmv.toLocaleString('en-IN')})
              </span>
            </div>
          )}
        </div>

        {/* SVG / Flex Bar Chart */}
        <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-gray-100">
          {metrics.hourlyVelocity.map((item, idx) => {
            const heightPct = (item.orders / maxOrders) * 100;
            const isHovered = activeBar === idx;
            return (
              <div
                key={item.hour}
                onMouseEnter={() => setActiveBar(idx)}
                onMouseLeave={() => setActiveBar(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div
                  style={{ height: item.orders > 0 ? `${Math.max(6, heightPct)}%` : '4px' }}
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    item.orders === 0
                      ? 'bg-gray-100 group-hover:bg-gray-200'
                      : isHovered
                      ? 'bg-[#FF5E00] shadow-md shadow-[#FF5E00]/30'
                      : 'bg-orange-100/80 group-hover:bg-[#FF5E00]/60'
                  }`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-400 pt-2">
          <span>06:00</span>
          <span>10:00</span>
          <span>14:00</span>
          <span>18:00 (Peak)</span>
          <span>22:00</span>
        </div>
      </div>

      {/* Dark Stores Status Matrix */}
      <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-950">
              Dark Stores Operational Matrix
            </h2>
            <p className="text-xs text-gray-500">
              Live capacity and packing load across distributed regional micro-fulfillment centers.
            </p>
          </div>
          <Link
            href="/admin/stores"
            className="text-xs font-bold text-[#FF5E00] hover:text-[#E05300] flex items-center gap-1"
          >
            Manage Stores
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-black/5 text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Dark Store Hub</th>
                <th className="py-3.5 px-4">Hub Code</th>
                <th className="py-3.5 px-4">Active Orders</th>
                <th className="py-3.5 px-4">Packing / Ready</th>
                <th className="py-3.5 px-4">Couriers Online</th>
                <th className="py-3.5 px-4">Avg SLA</th>
                <th className="py-3.5 px-4">Capacity Load</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.darkStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {store.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">
                    {store.code}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900 tabular-nums">
                    {store.activeOrders}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-600 font-bold tabular-nums">
                    {store.readyOrders}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-blue-600 font-bold tabular-nums">
                    {store.onlineRiders}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-700 tabular-nums">
                    {store.avgSla}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-28 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${store.loadPct}%` }}
                          className={`h-full rounded-full ${
                            store.loadPct > 80
                              ? 'bg-red-500'
                              : store.loadPct > 60
                              ? 'bg-[#FF5E00]'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-gray-500 tabular-nums">
                        {store.loadPct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        store.status === 'Optimal'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : store.status === 'High Load'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          store.status === 'Optimal'
                            ? 'bg-emerald-500'
                            : store.status === 'High Load'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      {store.status}
                    </span>
                  </td>
                </tr>
              ))}
              {metrics.darkStores.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="text-xs font-semibold text-gray-700">No Fulfillment Hubs Registered</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Configure your first dark store hub in Store Operations.</p>
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
