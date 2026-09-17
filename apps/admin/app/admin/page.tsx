'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Bike,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Package,
} from 'lucide-react';

const HOURLY_VELOCITY = [
  { hour: '06:00', orders: 24, gmv: 8200 },
  { hour: '07:00', orders: 58, gmv: 19400 },
  { hour: '08:00', orders: 112, gmv: 38200 },
  { hour: '09:00', orders: 145, gmv: 49800 },
  { hour: '10:00', orders: 132, gmv: 44200 },
  { hour: '11:00', orders: 98, gmv: 32600 },
  { hour: '12:00', orders: 86, gmv: 29100 },
  { hour: '13:00', orders: 104, gmv: 35400 },
  { hour: '14:00', orders: 78, gmv: 26500 },
  { hour: '15:00', orders: 64, gmv: 21800 },
  { hour: '16:00', orders: 92, gmv: 31200 },
  { hour: '17:00', orders: 138, gmv: 47100 },
  { hour: '18:00', orders: 184, gmv: 62800 },
  { hour: '19:00', orders: 210, gmv: 71400 },
  { hour: '20:00', orders: 196, gmv: 66800 },
  { hour: '21:00', orders: 140, gmv: 47600 },
  { hour: '22:00', orders: 82, gmv: 27900 },
];

const DARK_STORES_STATUS = [
  {
    id: '1',
    name: 'Belzo Central Hub 01 - Koramangala',
    code: 'BLZ-BLR-KOR-01',
    activeOrders: 42,
    readyOrders: 18,
    onlineRiders: 19,
    loadPct: 68,
    status: 'Optimal',
    avgSla: '10.8 mins',
  },
  {
    id: '2',
    name: 'Belzo Indiranagar Hub 02',
    code: 'BLZ-BLR-IND-02',
    activeOrders: 56,
    readyOrders: 24,
    onlineRiders: 22,
    loadPct: 84,
    status: 'High Load',
    avgSla: '12.1 mins',
  },
  {
    id: '3',
    name: 'Belzo HSR Layout Hub 03',
    code: 'BLZ-BLR-HSR-03',
    activeOrders: 28,
    readyOrders: 8,
    onlineRiders: 14,
    loadPct: 45,
    status: 'Optimal',
    avgSla: '9.6 mins',
  },
  {
    id: '4',
    name: 'Belzo MG Road Hub 04',
    code: 'BLZ-BLR-MGR-04',
    activeOrders: 31,
    readyOrders: 11,
    onlineRiders: 12,
    loadPct: 52,
    status: 'Optimal',
    avgSla: '11.2 mins',
  },
];

const TOP_PRODUCTS = [
  { name: 'Amul Taaza Toned Milk (500 ml)', orders: 384, revenue: '₹13,056', category: 'Grocery' },
  { name: 'Harvest Gold Brown Bread (400 g)', orders: 212, revenue: '₹10,388', category: 'Grocery' },
  { name: 'Organic Hass Avocado (2 pcs)', orders: 146, revenue: '₹27,594', category: 'Veggies' },
  { name: 'Belzo Farm Tomatoes (1 kg)', orders: 198, revenue: '₹7,524', category: 'Veggies' },
  { name: 'Type-C Braided Cable (1.2 m)', orders: 94, revenue: '₹28,106', category: 'Tech' },
];

export default function AdminExecutiveDashboard() {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const maxOrders = Math.max(...HOURLY_VELOCITY.map((d) => d.orders));

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Operations & Executive Command
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Real-time telemetry across 4 Dark Stores, courier fleets, and instant order pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-black shadow-lg shadow-[#FF5E00]/25 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Inspect Live Orders
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-[#170A2D] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue (GMV)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">₹4,82,950</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% WoW</span>
            <span className="text-white/40 font-normal">vs last Thursday</span>
          </div>
        </div>

        {/* Total Orders Today */}
        <div className="bg-[#170A2D] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Today</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF5E00]/10 flex items-center justify-center text-[#FF5E00]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">1,482</p>
          <div className="flex items-center gap-2 text-xs font-semibold mt-2">
            <span className="text-emerald-400 font-bold">1,310 Delivered</span>
            <span className="text-white/30">•</span>
            <span className="text-[#FF5E00] font-bold">157 Active</span>
            <span className="text-white/30">•</span>
            <span className="text-red-400 font-bold">15 Cancelled</span>
          </div>
        </div>

        {/* Active Fleet */}
        <div className="bg-[#170A2D] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Fleet On-Duty</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">67 Riders</p>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold mt-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>56 in active delivery • 11 at hub buffer</span>
          </div>
        </div>

        {/* Avg Delivery Time */}
        <div className="bg-[#170A2D] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Average SLA Time</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAA307]/10 flex items-center justify-center text-[#FAA307]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">11.4 Mins</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>97.2% under 15m guarantee SLA</span>
          </div>
        </div>
      </div>

      {/* Hourly Velocity Chart Card */}
      <div className="bg-[#170A2D] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-black text-white">
              Hourly Order Velocity & Intake Flow
            </h2>
            <p className="text-xs text-white/50">
              Orders placed per hour across all active dark store micro-hubs (06:00 - 22:00)
            </p>
          </div>
          {activeBar !== null && (
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#FF5E00]">
                {HOURLY_VELOCITY[activeBar].hour}: {HOURLY_VELOCITY[activeBar].orders} orders
              </span>
              <span className="text-xs text-white/50 ml-2 font-mono">
                (₹{HOURLY_VELOCITY[activeBar].gmv.toLocaleString('en-IN')})
              </span>
            </div>
          )}
        </div>

        {/* SVG / Flex Bar Chart */}
        <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-white/10">
          {HOURLY_VELOCITY.map((item, idx) => {
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
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    isHovered
                      ? 'bg-[#FF5E00] shadow-lg shadow-[#FF5E00]/40'
                      : 'bg-white/15 group-hover:bg-white/30'
                  }`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-white/40 pt-2">
          <span>06:00</span>
          <span>10:00</span>
          <span>14:00</span>
          <span>18:00 (Peak)</span>
          <span>22:00</span>
        </div>
      </div>

      {/* Dark Stores Status Matrix */}
      <div className="bg-[#170A2D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white">
              Dark Stores Operational Matrix
            </h2>
            <p className="text-xs text-white/50">
              Live capacity and packing load across distributed urban micro-fulfillment centers.
            </p>
          </div>
          <Link
            href="/admin/stores"
            className="text-xs font-bold text-[#FF5E00] hover:text-[#FFA066] flex items-center gap-1"
          >
            Manage Stores
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 border-b border-white/10 text-white/40 uppercase font-black tracking-wider">
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
            <tbody className="divide-y divide-white/5">
              {DARK_STORES_STATUS.map((store) => (
                <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {store.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-white/50">
                    {store.code}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {store.activeOrders}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#FAA307]">
                    {store.readyOrders}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-blue-400">
                    {store.onlineRiders}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-white/80">
                    {store.avgSla}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-28 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${store.loadPct}%` }}
                          className={`h-full rounded-full ${
                            store.loadPct > 80
                              ? 'bg-red-500'
                              : store.loadPct > 60
                              ? 'bg-[#FF5E00]'
                              : 'bg-emerald-400'
                          }`}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-white/60">
                        {store.loadPct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        store.status === 'Optimal'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          store.status === 'Optimal' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      {store.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
