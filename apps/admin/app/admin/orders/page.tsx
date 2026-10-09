'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  Phone, 
  MapPin, 
  Eye, 
  X, 
  Building2, 
  Bike, 
  User, 
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Package
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface OrderItem {
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  short_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  store_name: string;
  rider_name?: string;
  rider_phone?: string;
  status: 'placed' | 'confirmed' | 'packing' | 'ready' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  discount_amount: number;
  created_at: string;
  raw_created_at: string;
  eta_minutes: number;
  items: OrderItem[];
  cancellation_reason?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Helper to normalize address snapshot
  const parseAddress = (addrRaw: any): string => {
    if (!addrRaw) return 'Joniha Central Geofence, UP';
    if (typeof addrRaw === 'string') {
      try {
        const parsed = JSON.parse(addrRaw);
        return parseAddress(parsed);
      } catch {
        return addrRaw;
      }
    }
    const street = addrRaw.house_flat_no || addrRaw.street || addrRaw.address || '';
    const area = addrRaw.apartment_road_area || addrRaw.area || addrRaw.city || 'Joniha, Bindki';
    return [street, area].filter(Boolean).join(', ') || 'Joniha Chauraha, Bindki Road';
  };

  const mapDbOrder = (o: any): Order => {
    const rawCreated = o.created_at || o.placed_at || new Date().toISOString();
    const createdDate = new Date(rawCreated);
    const diffMins = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / 60000));
    const timeFormatted = diffMins < 60 ? `${diffMins} mins ago` : createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const orderNum = o.order_number
      ? String(o.order_number)
      : o.id.slice(0, 6).toUpperCase();

    const customer = o.profiles || {};
    const rider = o.riders || {};
    const riderProfile = rider.profiles || {};
    const store = o.dark_stores || {};

    const items: OrderItem[] = (o.order_items || []).map((it: any) => ({
      name: it.product_name_snapshot || it.product_name || (it.products && it.products.name) || 'Catalog Item',
      unit: (it.products && it.products.unit) || it.unit || '1 unit',
      quantity: Number(it.quantity) || 1,
      price: Number(it.unit_price ?? it.subtotal ?? 0),
    }));

    const total = Number(o.total_amount ?? o.net_payable ?? 0);
    const delFee = Number(o.delivery_fee ?? 0);
    const platFee = Number(o.platform_fee ?? 5);

    return {
      id: o.id,
      short_code: orderNum.startsWith('ORD-') ? orderNum : `ORD-${orderNum}`,
      customer_name: customer.full_name || 'Customer',
      customer_phone: customer.phone || '+91 98765 00000',
      delivery_address: parseAddress(o.delivery_address || o.delivery_address_snapshot),
      store_name: store.name || 'Belzo Joniha Central Hub 01',
      rider_name: riderProfile.full_name || (rider.vehicle_number ? `Rider ${rider.vehicle_number}` : undefined),
      rider_phone: riderProfile.phone || undefined,
      status: o.status,
      total_amount: total,
      subtotal: Math.max(0, total - delFee - platFee),
      delivery_fee: delFee,
      platform_fee: platFee,
      discount_amount: Number(o.discount_amount ?? 0),
      created_at: timeFormatted,
      raw_created_at: rawCreated,
      eta_minutes: o.status === 'out_for_delivery' ? 7 : o.status === 'delivered' ? 0 : 10,
      items,
      cancellation_reason: o.cancellation_reason || undefined,
    };
  };

  // 1. Fetch Orders from Supabase
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name_snapshot,
            unit_price,
            quantity,
            subtotal,
            products (name, unit)
          ),
          profiles:customer_id (full_name, phone),
          riders:rider_id (
            id,
            vehicle_type,
            vehicle_number,
            profiles:id (full_name, phone)
          ),
          dark_stores:store_id (name, hub_code)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback simplified query
        const { data: simpleData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (simpleData) {
          setOrders(simpleData.map(mapDbOrder));
        } else {
          setOrders([]);
        }
      } else if (data) {
        setOrders(data.map(mapDbOrder));
      }
    } catch (err) {
      console.warn('[Admin Orders] Fetch exception, rendering clean empty state:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Realtime listener to auto-insert new incoming orders
    const channel = supabase
      .channel('admin-orders-pipeline')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  // Dynamic summary metrics calculated strictly from live rows
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const totalPipeline = orders.length;
  const liveOnRoad = orders.filter((o) => o.status === 'out_for_delivery').length;
  
  const completedTodayOrders = orders.filter((o) => {
    if (o.status !== 'delivered') return false;
    const t = new Date(o.raw_created_at).getTime();
    return t >= startOfToday;
  });
  const completedToday = completedTodayOrders.length;

  const todayOrders = orders.filter((o) => {
    const t = new Date(o.raw_created_at).getTime();
    return t >= startOfToday && o.status !== 'cancelled';
  });
  const totalValueToday = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      (order.rider_name && order.rider_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && ['placed', 'confirmed', 'packing', 'ready', 'ready_for_pickup', 'out_for_delivery'].includes(order.status)) ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Placed</span>;
      case 'confirmed':
      case 'packing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Packing</span>;
      case 'ready':
      case 'ready_for_pickup':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Ready</span>;
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF5E00]/10 text-[#FF5E00] border border-[#FF5E00]/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00]" />
            On Road
          </span>
        );
      case 'delivered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Realtime Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">
            Global Order Pipeline
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Realtime dispatch monitoring and lifecycle tracking across all fulfillment centers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
            title="Refresh pipeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Dynamically computed from live rows) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Total Pipeline</p>
          <p className="text-2xl font-extrabold text-gray-950 mt-1 tracking-tight tabular-nums">
            {totalPipeline}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">All recorded orders</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Live on Road</p>
          <p className="text-2xl font-extrabold text-[#FF5E00] mt-1 tracking-tight tabular-nums">
            {liveOnRoad}
          </p>
          <p className="text-[11px] text-[#FF5E00] font-medium mt-1">En route to customers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Completed Today</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1 tracking-tight tabular-nums">
            {completedToday}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Delivered successfully</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-medium text-gray-500">Total Value (Today)</p>
          <p className="text-2xl font-extrabold text-gray-950 mt-1 tracking-tight tabular-nums">
            ₹{totalValueToday.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Processed today</p>
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
            placeholder="Search Order ID, Customer, Rider..."
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5E00] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'active', 'placed', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                statusFilter === tab
                  ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                  : 'bg-white text-gray-600 border-black/5 hover:bg-gray-50'
              }`}
            >
              {tab === 'all'
                ? 'All Orders'
                : tab === 'active'
                ? 'Active Only'
                : tab === 'ready_for_pickup'
                ? 'Ready'
                : tab.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Assigned Hub</th>
                <th className="py-3.5 px-4">Courier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-extrabold text-gray-950 tabular-nums">
                      {order.short_code}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{order.created_at}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-gray-900">{order.customer_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{order.customer_phone}</p>
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px]">
                    <p className="text-gray-600 truncate">{order.delivery_address}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-gray-700 font-medium">{order.store_name}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    {order.rider_name ? (
                      <div>
                        <p className="font-bold text-gray-900">{order.rider_name}</p>
                        {order.rider_phone && (
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{order.rider_phone}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-gray-950 tabular-nums">
                    ₹{order.total_amount}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition-all inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Apple-grade Quiet Empty State */}
          {!loading && filteredOrders.length === 0 && (
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 mb-3.5 shadow-sm">
                <ShoppingBag className="w-6 h-6 text-gray-400 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                No Orders in Pipeline
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No orders matching query "${searchTerm}".`
                  : 'Orders placed on the consumer app will appear here in sub-second latency.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-gray-950">
                    {selectedOrder.short_code}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed {selectedOrder.created_at} • {selectedOrder.store_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Customer & Location */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-900">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {selectedOrder.customer_name}
                </span>
                <span className="text-gray-500 font-mono">{selectedOrder.customer_phone}</span>
              </div>
              <div className="flex items-start gap-1.5 text-gray-600 pt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>{selectedOrder.delivery_address}</span>
              </div>
            </div>

            {/* Items Checklist */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Itemized Basket ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} units)
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {selectedOrder.items.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No items attached</p>
                ) : (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400">{item.unit}</p>
                      </div>
                      <span className="font-extrabold text-gray-950 tabular-nums">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="tabular-nums">₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="tabular-nums">₹{selectedOrder.delivery_fee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span className="tabular-nums">₹{selectedOrder.platform_fee}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-950 pt-2 border-t border-gray-200 text-sm">
                <span>Net Total</span>
                <span className="tabular-nums">₹{selectedOrder.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
