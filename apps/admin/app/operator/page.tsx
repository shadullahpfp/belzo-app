'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Package,
  Bike,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  User,
  MapPin,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Radar,
  PhoneCall,
} from 'lucide-react';
import { playDispatchChime } from '../../lib/sound';
import { buildWhatsAppOrderMessage, getWhatsAppDispatchUrl } from '../../lib/whatsapp';
import { supabase, JONIHA_HUB_ID } from '../../lib/supabase';

interface OperatorOrderItem {
  id?: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  checked?: boolean;
}

interface OperatorOrder {
  id: string;
  orderNumber: string;
  status: 'placed' | 'ready_for_pickup' | 'out_for_delivery';
  items: OperatorOrderItem[];
  customerName: string;
  customerPhone: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  paymentMethod?: string;
  totalAmount: number;
  placedAt: Date;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: string;
  transferredFrom?: string;
}

interface ActiveRider {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
}

interface DarkStoreHub {
  id: string;
  name: string;
  code: string;
  address: string;
}

export default function OperatorDashboardPage() {
  const [orders, setOrders] = useState<OperatorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available real couriers & hubs fetched from DB
  const [onlineRiders, setOnlineRiders] = useState<ActiveRider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [darkStores, setDarkStores] = useState<DarkStoreHub[]>([]);

  // Modal states
  const [selectedOrderForRider, setSelectedOrderForRider] = useState<OperatorOrder | null>(null);
  const [selectedOrderForTransfer, setSelectedOrderForTransfer] = useState<OperatorOrder | null>(null);

  // Time elapsed ticker
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Helper to normalize address snapshot
  const parseAddress = (addrRaw: any): { address: string; landmark: string; lat: number; lng: number } => {
    if (!addrRaw) {
      return { address: 'Joniha Central Zone, Bindki Road', landmark: 'Joniha Chauraha', lat: 26.035, lng: 80.465 };
    }
    if (typeof addrRaw === 'string') {
      try {
        const parsed = JSON.parse(addrRaw);
        return parseAddress(parsed);
      } catch {
        return { address: addrRaw, landmark: 'Joniha Geofence', lat: 26.035, lng: 80.465 };
      }
    }
    const street = addrRaw.house_flat_no || addrRaw.street || addrRaw.address || '';
    const area = addrRaw.apartment_road_area || addrRaw.area || addrRaw.city || 'Joniha, Bindki';
    const landmark = addrRaw.landmark || 'Near Center Point';
    const lat = Number(addrRaw.lat ?? addrRaw.latitude ?? 26.035);
    const lng = Number(addrRaw.lng ?? addrRaw.longitude ?? 80.465);
    const combined = [street, area].filter(Boolean).join(', ') || 'Joniha Chauraha, Bindki Road';
    return { address: combined, landmark, lat, lng };
  };

  // Helper to map DB order record to OperatorOrder
  const mapDbOrder = (o: any): OperatorOrder => {
    const orderNum = o.order_number
      ? String(o.order_number)
      : o.id.slice(0, 6).toUpperCase();

    const addrInfo = parseAddress(o.delivery_address || o.delivery_address_snapshot);
    const customer = o.profiles || {};
    const rider = o.riders || {};
    const riderProfile = rider.profiles || {};

    const items: OperatorOrderItem[] = (o.order_items || []).map((it: any) => ({
      id: it.id,
      name: it.product_name_snapshot || it.product_name || (it.products && it.products.name) || 'Catalog Item',
      unit: (it.products && it.products.unit) || it.unit || '1 unit',
      qty: Number(it.quantity) || 1,
      price: Number(it.unit_price ?? it.subtotal ?? 0),
      checked: o.status !== 'placed',
    }));

    return {
      id: o.id,
      orderNumber: orderNum.startsWith('BLZ-') ? orderNum : `BLZ-${orderNum}`,
      status: o.status === 'out_for_delivery'
        ? 'out_for_delivery'
        : o.status === 'ready_for_pickup' || o.status === 'ready'
        ? 'ready_for_pickup'
        : 'placed',
      items,
      customerName: customer.full_name || 'Customer',
      customerPhone: customer.phone || '+91 98765 00000',
      address: addrInfo.address,
      landmark: addrInfo.landmark,
      latitude: addrInfo.lat,
      longitude: addrInfo.lng,
      paymentMethod: o.payment_method === 'online' ? 'UPI (Online Pre-paid)' : 'Cash on Delivery',
      totalAmount: Number(o.total_amount ?? o.net_payable ?? 0),
      placedAt: new Date(o.created_at || o.placed_at || Date.now()),
      riderId: o.rider_id || undefined,
      riderName: riderProfile.full_name || rider.vehicle_number ? `Courier ${rider.vehicle_number}` : undefined,
      riderPhone: riderProfile.phone || undefined,
      riderVehicle: rider.vehicle_type ? `${rider.vehicle_type} (${rider.vehicle_number || 'UP-71'})` : undefined,
      transferredFrom: o.transferred_from_store_id || undefined,
    };
  };

  // 1. Fetch Orders from Supabase for Joniha Hub
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      // Attempt joined query
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
          )
        `)
        .or(`store_id.eq.${JONIHA_HUB_ID},dark_store_id.eq.${JONIHA_HUB_ID}`)
        .in('status', ['placed', 'ready_for_pickup', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback: simplified query if foreign key alias differs
        const { data: simpleData, error: simpleError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .in('status', ['placed', 'ready_for_pickup', 'out_for_delivery'])
          .order('created_at', { ascending: false });

        if (!simpleError && simpleData) {
          setOrders(simpleData.map(mapDbOrder));
        } else {
          setOrders([]);
        }
      } else if (data) {
        setOrders(data.map(mapDbOrder));
      }
    } catch (err) {
      console.warn('[Operator] Order fetch error, keeping clean state:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Online Riders from Supabase
  const loadOnlineRiders = async () => {
    try {
      setLoadingRiders(true);
      const { data, error } = await supabase
        .from('riders')
        .select(`
          id,
          vehicle_type,
          vehicle_number,
          is_online,
          profiles:id (full_name, phone)
        `)
        .eq('is_online', true);

      if (!error && data) {
        const mapped: ActiveRider[] = data.map((r: any) => ({
          id: r.id,
          name: r.profiles?.full_name || `Courier #${r.id.slice(0, 4)}`,
          phone: r.profiles?.phone || '+91 98765 00000',
          vehicleType: r.vehicle_type || 'Motorcycle',
          vehicleNumber: r.vehicle_number || 'UP-71',
          isOnline: r.is_online,
        }));
        setOnlineRiders(mapped);
      } else {
        setOnlineRiders([]);
      }
    } catch {
      setOnlineRiders([]);
    } finally {
      setLoadingRiders(false);
    }
  };

  // 3. Fetch Dark Stores (for transfer options)
  const loadDarkStores = async () => {
    try {
      const { data, error } = await supabase
        .from('dark_stores')
        .select('id, name, hub_code, address')
        .neq('id', JONIHA_HUB_ID)
        .eq('is_active', true);

      if (!error && data) {
        setDarkStores(
          data.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.hub_code || d.code || 'HUB',
            address: d.address || '',
          }))
        );
      }
    } catch {
      setDarkStores([]);
    }
  };

  useEffect(() => {
    loadOrders();
    loadDarkStores();

    // 4. Supabase Realtime Listener on 'orders' table
    const channel = supabase
      .channel('operator-live-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new;
            // Only handle if belonging to this hub or unassigned
            if (newRow.store_id && newRow.store_id !== JONIHA_HUB_ID && newRow.dark_store_id !== JONIHA_HUB_ID) {
              return;
            }
            playDispatchChime();
            showToast(`🔔 New Order #${newRow.order_number || newRow.id.slice(0, 6)} Arrived!`);
            loadOrders();
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id
                  ? {
                      ...o,
                      status: updated.status === 'out_for_delivery'
                        ? 'out_for_delivery'
                        : updated.status === 'ready_for_pickup' || updated.status === 'ready'
                        ? 'ready_for_pickup'
                        : 'placed',
                    }
                  : o
              )
            );
            // Re-fetch to load any new items/relations
            loadOrders();
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const formatElapsed = (date: Date) => {
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins}m ${secs}s ago`;
  };

  const isUrgent = (date: Date) => {
    return Date.now() - date.getTime() > 180 * 1000; // > 3 mins in pending
  };

  // Local checklist item toggle
  const toggleCheckItem = (orderId: string, itemIdx: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newItems = [...o.items];
        newItems[itemIdx] = {
          ...newItems[itemIdx],
          checked: !newItems[itemIdx].checked,
        };
        return { ...o, items: newItems };
      })
    );
  };

  // Interactive Action: "Mark Packed & Ready" -> Supabase UPDATE
  const handleMarkReady = async (orderId: string) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'ready_for_pickup' } : o))
    );
    playDispatchChime();
    showToast('Order marked as Packed & Ready! 🛍️');

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'ready_for_pickup' })
        .eq('id', orderId);

      if (error) {
        console.warn('Supabase mark ready error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase mark ready exception:', err);
    }
  };

  // Interactive Action: "Assign Courier Rider" -> Supabase UPDATE
  const handleAssignRider = async (rider: ActiveRider) => {
    if (!selectedOrderForRider) return;
    const targetOrder = selectedOrderForRider;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetOrder.id
          ? {
              ...o,
              status: 'out_for_delivery',
              riderId: rider.id,
              riderName: rider.name,
              riderPhone: rider.phone,
              riderVehicle: `${rider.vehicleType} (${rider.vehicleNumber})`,
            }
          : o
      )
    );
    setSelectedOrderForRider(null);
    playDispatchChime();
    showToast(`Assigned ${rider.name} to order #${targetOrder.orderNumber}! 🛵`);

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          rider_id: rider.id,
          status: 'out_for_delivery',
        })
        .eq('id', targetOrder.id);

      if (error) {
        console.warn('Supabase assign rider error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase assign rider exception:', err);
    }
  };

  // Interactive Action: "Transfer Hub" -> Supabase UPDATE
  const handleTransferHub = async (hub: DarkStoreHub) => {
    if (!selectedOrderForTransfer) return;
    const targetOrder = selectedOrderForTransfer;

    setOrders((prev) => prev.filter((o) => o.id !== targetOrder.id));
    setSelectedOrderForTransfer(null);
    showToast(`Order #${targetOrder.orderNumber} transferred to ${hub.name}! 🔄`);

    try {
      await supabase
        .from('orders')
        .update({
          store_id: hub.id,
          transferred_from_store_id: JONIHA_HUB_ID,
        })
        .eq('id', targetOrder.id);
    } catch (err) {
      console.warn('Supabase hub transfer error:', err);
    }
  };

  // Interactive Action: "WhatsApp Dispatch"
  const handleSendWhatsApp = (order: OperatorOrder) => {
    const payload = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      delivery_address: {
        street: order.address,
        landmark: order.landmark,
        latitude: order.latitude,
        longitude: order.longitude,
        phone: order.customerPhone,
      },
      items: order.items.map((it) => ({
        name: it.name,
        unit: it.unit,
        qty: it.qty,
        price: it.price,
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
    };

    const targetPhone = order.riderPhone || order.customerPhone || '';
    const message = buildWhatsAppOrderMessage(payload);
    const dispatchUrl = getWhatsAppDispatchUrl(targetPhone, message);
    window.open(dispatchUrl, '_blank');
  };

  const handleCopyOrderSummary = (order: OperatorOrder) => {
    const payload = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      delivery_address: {
        street: order.address,
        landmark: order.landmark,
        latitude: order.latitude,
        longitude: order.longitude,
        phone: order.customerPhone,
      },
      items: order.items.map((it) => ({
        name: it.name,
        unit: it.unit,
        qty: it.qty,
        price: it.price,
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
    };
    const message = buildWhatsAppOrderMessage(payload);
    navigator.clipboard.writeText(message);
    showToast(`Order #${order.orderNumber} summary copied to clipboard! 📋`);
  };

  // Column slices
  const pendingOrders = orders.filter((o) => o.status === 'placed');
  const readyOrders = orders.filter((o) => o.status === 'ready_for_pickup');
  const outOrders = orders.filter((o) => o.status === 'out_for_delivery');

  // Apple-grade Quiet Empty State component
  const renderEmptyState = (title: string, subtitle: string) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto min-h-[320px]">
      <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center text-gray-400 mb-3">
        <Radar className="w-5 h-5 text-gray-400 stroke-[1.5]" />
      </div>
      <p className="text-xs font-semibold text-gray-800 tracking-tight">{title}</p>
      <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
        {subtitle}
      </p>
    </div>
  );

  const renderOrderCard = (order: OperatorOrder) => {
    const urgent = isUrgent(order.placedAt) && order.status === 'placed';
    return (
      <div
        key={order.id}
        className={`bg-white rounded-3xl p-5 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between ${
          urgent ? 'ring-2 ring-red-400/40 bg-red-50/20' : ''
        }`}
      >
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-gray-950 tracking-tight tabular-nums">
                #{order.orderNumber}
              </span>
              {urgent && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  <AlertTriangle className="w-3 h-3" /> SLA Alert
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                order.status === 'placed'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : order.status === 'ready_for_pickup'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {order.status === 'placed'
                ? 'Pending Pick'
                : order.status === 'ready_for_pickup'
                ? 'Packed'
                : 'In Transit'}
            </span>
          </div>

          {/* Customer & Location Info */}
          <div className="space-y-1 text-xs text-gray-600 mb-3.5">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{order.customerName}</span>
              <span className="text-gray-300">•</span>
              <span className="tabular-nums font-mono text-gray-500">{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{order.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="tabular-nums">Placed {formatElapsed(order.placedAt)}</span>
            </div>
          </div>

          {/* Packing Checklist */}
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 mb-3.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Packing Checklist ({order.items.reduce((s, i) => s + i.qty, 0)} items)
            </p>
            {order.items.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Order item details syncing...</p>
            ) : (
              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleCheckItem(order.id, idx)}
                    className="flex items-center justify-between text-xs cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.checked ?? false}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-[#FF5E00] focus:ring-[#FF5E00] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span
                        className={`font-medium ${
                          item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        <span className="tabular-nums font-bold text-gray-800">{item.qty}x</span>{' '}
                        {item.name}
                      </span>
                    </div>
                    <span className="text-gray-400 text-[11px] tabular-nums font-mono">
                      {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold">
              <span className="text-gray-500 font-medium">Total ({order.paymentMethod || 'COD'})</span>
              <span className="text-gray-950 font-extrabold tabular-nums font-mono">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Rider Info Card (if in transit) */}
          {order.status === 'out_for_delivery' && (
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-3.5 flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{order.riderName || 'Assigned Courier'}</p>
                <p className="text-[11px] text-emerald-700">
                  {order.riderVehicle || 'Delivery Fleet'} {order.riderPhone ? `• ${order.riderPhone}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          {order.status === 'placed' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkReady(order.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white font-bold text-xs shadow-sm transition-all active:scale-[0.97]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Packed & Ready
              </button>
              {darkStores.length > 0 && (
                <button
                  onClick={() => setSelectedOrderForTransfer(order)}
                  title="Transfer order to adjacent Dark Store hub"
                  className="px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border border-black/5 transition-all active:scale-[0.97] flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Transfer
                </button>
              )}
            </div>
          )}

          {order.status === 'ready_for_pickup' && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedOrderForRider(order);
                  loadOnlineRiders();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05300] text-white font-bold text-xs shadow-sm transition-all active:scale-[0.97]"
              >
                <Bike className="w-3.5 h-3.5" />
                Assign Courier Rider
              </button>
              {darkStores.length > 0 && (
                <button
                  onClick={() => setSelectedOrderForTransfer(order)}
                  title="Transfer order to adjacent Dark Store hub"
                  className="px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border border-black/5 transition-all active:scale-[0.97] flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Transfer
                </button>
              )}
            </div>
          )}

          {/* 1-Click WhatsApp Dispatch Button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleSendWhatsApp(order)}
              className="flex-1 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              title="Generate encoded WhatsApp message with address, maps pin, and item list"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp Dispatch</span>
            </button>
            <button
              onClick={() => handleCopyOrderSummary(order)}
              className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 border border-black/5 text-gray-700 flex items-center justify-center transition-all active:scale-[0.97]"
              title="Copy dispatch text to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Station Control Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-black/5 rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="text-xl font-extrabold text-gray-950 tracking-tight">
            Order Queues & Dispatch Control
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Joniha Central Hub 01 • Live Supabase pipeline: pack verify, fleet allocation, and WhatsApp dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadOrders()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
            title="Refresh order pipeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Store Queue Active: {orders.length} orders</span>
          </div>
        </div>
      </div>

      {/* 3 Order Queue Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Pending Pick & Pack */}
        <div className="bg-gray-100/70 rounded-3xl p-4 border border-black/5 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E00]" />
              <h3 className="font-extrabold text-sm text-gray-900">Pending Pick & Pack</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-xs font-black text-gray-800 border border-black/5 tabular-nums">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            {pendingOrders.map(renderOrderCard)}
            {!loading && pendingOrders.length === 0 && renderEmptyState('No orders in this stage', 'New orders from the customer app will appear here instantly.')}
          </div>
        </div>

        {/* Column 2: Packed / Ready */}
        <div className="bg-gray-100/70 rounded-3xl p-4 border border-black/5 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="font-extrabold text-sm text-gray-900">Packed / Ready</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-xs font-black text-gray-800 border border-black/5 tabular-nums">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            {readyOrders.map(renderOrderCard)}
            {!loading && readyOrders.length === 0 && renderEmptyState('No packed orders waiting', 'Orders marked as packed will queue here for courier dispatch.')}
          </div>
        </div>

        {/* Column 3: Out for Delivery */}
        <div className="bg-gray-100/70 rounded-3xl p-4 border border-black/5 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-extrabold text-sm text-gray-900">Out for Delivery</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-xs font-black text-gray-800 border border-black/5 tabular-nums">
              {outOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            {outOrders.map(renderOrderCard)}
            {!loading && outOrders.length === 0 && renderEmptyState('No active deliveries', 'Orders assigned to riders currently en route will be tracked here.')}
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Modal 1: Assign Rider Modal */}
      {selectedOrderForRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-950">
                  Assign Delivery Partner
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Order #{selectedOrderForRider.orderNumber} • {selectedOrderForRider.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForRider(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Online Couriers On-Duty
              </p>
              {loadingRiders && (
                <div className="p-8 text-center text-xs text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                  Checking online fleet...
                </div>
              )}
              {!loadingRiders && onlineRiders.length === 0 && (
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <Bike className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-800">No Couriers Online</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    No active delivery partners currently marked on-duty.
                  </p>
                </div>
              )}
              {!loadingRiders &&
                onlineRiders.map((rider) => (
                  <div
                    key={rider.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200/60 hover:border-[#FF5E00] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5E00]">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{rider.name}</p>
                        <p className="text-xs text-gray-500">
                          {rider.vehicleType} • {rider.vehicleNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignRider(rider)}
                      className="px-4 py-2 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Dispatch ➔
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Transfer Order to Adjacent Hub */}
      {selectedOrderForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-950">
                  Transfer Order to Adjacent Hub
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Reroute #{selectedOrderForTransfer.orderNumber} due to local stockout or fleet congestion.
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForTransfer(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Select Receiving Dark Store Hub
              </p>
              {darkStores.length === 0 ? (
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <p className="text-xs font-semibold text-gray-600">No alternate fulfillment hubs configured.</p>
                </div>
              ) : (
                darkStores.map((hub) => (
                  <div
                    key={hub.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200/60 hover:border-amber-400 transition-all"
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-900">{hub.name}</p>
                      <p className="text-xs text-gray-500">
                        Code: {hub.code} • {hub.address}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTransferHub(hub)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all"
                    >
                      Transfer ➔
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
