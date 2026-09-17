'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Package,
  Bike,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { playDispatchChime } from '../../lib/sound';

interface OperatorOrderItem {
  name: string;
  unit: string;
  qty: number;
  price: number;
}

interface OperatorOrder {
  id: string;
  orderNumber: string;
  status: 'placed' | 'ready_for_pickup' | 'out_for_delivery';
  items: OperatorOrderItem[];
  customerName: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  placedAt: Date;
  riderId?: string;
  riderName?: string;
  riderVehicle?: string;
  transferredFrom?: string;
}

interface ActiveRider {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'EV Bike' | 'Motorcycle' | 'Scooter' | 'Bicycle';
  distanceKm: number;
  batteryPct?: number;
}

interface DarkStoreHub {
  id: string;
  name: string;
  code: string;
  distanceKm: number;
}

const NEARBY_HUBS: DarkStoreHub[] = [
  {
    id: 'hub-indiranagar',
    name: 'Belzo Indiranagar Hub',
    code: 'BLZ-BLR-IND-02',
    distanceKm: 3.2,
  },
  {
    id: 'hub-hsr',
    name: 'Belzo HSR Layout Hub',
    code: 'BLZ-BLR-HSR-03',
    distanceKm: 4.1,
  },
  {
    id: 'hub-mgroad',
    name: 'Belzo MG Road Hub',
    code: 'BLZ-BLR-MGR-04',
    distanceKm: 5.0,
  },
];

const ONLINE_RIDERS: ActiveRider[] = [
  {
    id: 'r1',
    name: 'Vikram Patel',
    phone: '+91 98765 11223',
    vehicleType: 'EV Bike',
    distanceKm: 0.4,
    batteryPct: 88,
  },
  {
    id: 'r2',
    name: 'Sunil Kumar',
    phone: '+91 98765 22334',
    vehicleType: 'Motorcycle',
    distanceKm: 0.9,
  },
  {
    id: 'r3',
    name: 'Anand Verma',
    phone: '+91 98765 33445',
    vehicleType: 'Scooter',
    distanceKm: 1.2,
  },
];

const INITIAL_ORDERS: OperatorOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'BLZ-9182',
    status: 'placed',
    customerName: 'Aarav Mehta',
    customerPhone: '+91 98765 99881',
    address: 'Flat 304, Tower 2, Koramangala 4th Block',
    totalAmount: 320,
    placedAt: new Date(Date.now() - 45 * 1000), // 45s ago
    items: [
      { name: 'Amul Taaza Toned Milk', unit: '500 ml', qty: 2, price: 68 },
      { name: 'Harvest Gold Atta Bread', unit: '400 g', qty: 1, price: 49 },
      { name: 'Organic Hass Avocado', unit: '2 pcs', qty: 1, price: 189 },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'BLZ-7634',
    status: 'placed',
    customerName: 'Priya Nambiar',
    customerPhone: '+91 98765 44332',
    address: 'Villa 14, Palm Meadows, 80ft Road',
    totalAmount: 189,
    placedAt: new Date(Date.now() - 110 * 1000), // 1m 50s ago
    items: [
      { name: 'Belzo Farm Red Tomatoes', unit: '1 kg', qty: 1, price: 38 },
      { name: 'Croissant Butter Puff', unit: '200 g', qty: 1, price: 120 },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 'BLZ-5521',
    status: 'ready_for_pickup',
    customerName: 'Deepak Rao',
    customerPhone: '+91 98765 11998',
    address: 'Flat 102, Embassy Habitat',
    totalAmount: 448,
    placedAt: new Date(Date.now() - 320 * 1000),
    items: [
      { name: 'Type-C Fast Charging Cable', unit: '1.2 m', qty: 1, price: 299 },
      { name: 'Electrolyte Hydration Powder', unit: '5 sachets', qty: 1, price: 99 },
    ],
  },
  {
    id: 'ord-4',
    orderNumber: 'BLZ-3319',
    status: 'out_for_delivery',
    customerName: 'Meera Sen',
    customerPhone: '+91 98765 77665',
    address: '401, 7th Cross, Koramangala 1st Block',
    totalAmount: 249,
    placedAt: new Date(Date.now() - 650 * 1000),
    riderName: 'Vikram Patel',
    riderVehicle: 'EV Bike (KA-01-EQ-9812)',
    items: [
      { name: 'Classic Cotton Crew Socks', unit: '3 pairs', qty: 1, price: 249 },
    ],
  },
];

export default function OperatorDashboardPage() {
  const [orders, setOrders] = useState<OperatorOrder[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'all' | 'placed' | 'ready_for_pickup' | 'out_for_delivery'>('all');

  // Modal States
  const [selectedOrderForRider, setSelectedOrderForRider] = useState<OperatorOrder | null>(null);
  const [selectedOrderForTransfer, setSelectedOrderForTransfer] = useState<OperatorOrder | null>(null);

  // Time elapsed refresher
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (date: Date) => {
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins}m ${secs}s ago`;
  };

  const isUrgent = (date: Date) => {
    return Date.now() - date.getTime() > 120 * 1000; // > 2 mins
  };

  // Actions
  const handleMarkReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'ready_for_pickup' } : o))
    );
    playDispatchChime();
  };

  const handleAssignRider = (rider: ActiveRider) => {
    if (!selectedOrderForRider) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForRider.id
          ? {
              ...o,
              status: 'out_for_delivery',
              riderId: rider.id,
              riderName: rider.name,
              riderVehicle: `${rider.vehicleType} (KA-01-BLZ)`,
            }
          : o
      )
    );
    setSelectedOrderForRider(null);
    playDispatchChime();
  };

  const handleTransferHub = (hub: DarkStoreHub) => {
    if (!selectedOrderForTransfer) return;
    setOrders((prev) =>
      prev.filter((o) => o.id !== selectedOrderForTransfer.id)
    );
    alert(
      `Order #${selectedOrderForTransfer.orderNumber} successfully rerouted to ${hub.name} (${hub.code}). Receiving dispatcher notified!`
    );
    setSelectedOrderForTransfer(null);
  };

  // Simulate receiving a test order with chime
  const handleSimulateNewOrder = () => {
    const newOrderNum = `BLZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OperatorOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNum,
      status: 'placed',
      customerName: 'Sneha Kapoor',
      customerPhone: '+91 98765 88776',
      address: 'Plot 88, 17th Main Road, Koramangala 4th Block',
      totalAmount: 279,
      placedAt: new Date(),
      items: [
        { name: 'Organic Hass Avocado', unit: '2 pcs', qty: 1, price: 189 },
        { name: 'Electrolyte Hydration Powder', unit: '5 sachets', qty: 1, price: 99 },
      ],
    };

    setOrders([newOrder, ...orders]);
    playDispatchChime();
  };

  const newOrdersCount = orders.filter((o) => o.status === 'placed').length;
  const readyOrdersCount = orders.filter((o) => o.status === 'ready_for_pickup').length;
  const outOrdersCount = orders.filter((o) => o.status === 'out_for_delivery').length;

  const filteredOrders =
    activeTab === 'all'
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Station Control Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Order Queues & Dispatch Control
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            Single-operator station: Pack verify, rider allocation, and instant hub transfers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateNewOrder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-extrabold shadow-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Simulate Incoming Order
          </button>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('placed')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'placed'
              ? 'bg-[#FF5E00]/15 border-[#FF5E00]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Pending / Incoming
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF5E00] animate-pulse" />
          </div>
          <p className="text-3xl font-black text-white mt-2">{newOrdersCount}</p>
          <p className="text-[11px] text-[#FF5E00] font-semibold mt-1">
            Requires pick & bag packing
          </p>
        </button>

        <button
          onClick={() => setActiveTab('ready_for_pickup')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'ready_for_pickup'
              ? 'bg-[#FAA307]/15 border-[#FAA307]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Packed / Ready for Pickup
            </span>
            <Package className="w-4 h-4 text-[#FAA307]" />
          </div>
          <p className="text-3xl font-black text-white mt-2">{readyOrdersCount}</p>
          <p className="text-[11px] text-[#FAA307] font-semibold mt-1">
            Assign or handover to rider
          </p>
        </button>

        <button
          onClick={() => setActiveTab('out_for_delivery')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'out_for_delivery'
              ? 'bg-[#34C759]/15 border-[#34C759]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
              In Transit with Rider
            </span>
            <Bike className="w-4 h-4 text-[#34C759]" />
          </div>
          <p className="text-3xl font-black text-white mt-2">{outOrdersCount}</p>
          <p className="text-[11px] text-[#34C759] font-semibold mt-1">
            En route to doorstep (SLA &lt; 12m)
          </p>
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('placed')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'placed'
              ? 'bg-[#FF5E00] text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          New ({newOrdersCount})
        </button>
        <button
          onClick={() => setActiveTab('ready_for_pickup')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'ready_for_pickup'
              ? 'bg-[#FAA307] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Ready ({readyOrdersCount})
        </button>
        <button
          onClick={() => setActiveTab('out_for_delivery')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'out_for_delivery'
              ? 'bg-[#34C759] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Dispatched ({outOrdersCount})
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((order) => {
          const urgent = isUrgent(order.placedAt) && order.status === 'placed';
          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                urgent
                  ? 'bg-red-950/20 border-red-500/50 shadow-lg shadow-red-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">
                      #{order.orderNumber}
                    </span>
                    {urgent && (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                        <AlertTriangle className="w-3 h-3" /> SLA ALERT
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      order.status === 'placed'
                        ? 'bg-[#FF5E00]/20 text-[#FF5E00] border-[#FF5E00]/30'
                        : order.status === 'ready_for_pickup'
                        ? 'bg-[#FAA307]/20 text-[#FAA307] border-[#FAA307]/30'
                        : 'bg-[#34C759]/20 text-[#34C759] border-[#34C759]/30'
                    }`}
                  >
                    {order.status === 'placed'
                      ? 'New'
                      : order.status === 'ready_for_pickup'
                      ? 'Ready'
                      : 'In Transit'}
                  </span>
                </div>

                {/* Customer & Time Info */}
                <div className="space-y-1 text-xs text-white/70 mb-4">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <User className="w-3.5 h-3.5 text-white/40" />
                    <span>{order.customerName}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="truncate">{order.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span>Placed {formatElapsed(order.placedAt)}</span>
                  </div>
                </div>

                {/* Itemized Checklist */}
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                  <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider mb-2">
                    Packing Checklist ({order.items.reduce((s, i) => s + i.qty, 0)} items)
                  </p>
                  <div className="space-y-1.5 text-xs">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-white/90"
                      >
                        <span className="font-medium">
                          {item.qty}x {item.name}
                        </span>
                        <span className="text-white/50 font-mono text-[11px]">
                          {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                    <span className="text-white/60">Total Order Value</span>
                    <span className="text-white font-mono">₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Assigned Rider Info (if in transit) */}
                {order.status === 'out_for_delivery' && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 mb-4 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold">{order.riderName}</p>
                      <p className="text-[10px] text-emerald-300/70">{order.riderVehicle}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                {order.status === 'placed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkReady(order.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2EB04F] text-black font-extrabold text-xs shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Packed & Ready
                    </button>
                    <button
                      onClick={() => setSelectedOrderForTransfer(order)}
                      title="Transfer order to adjacent Dark Store hub"
                      className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Transfer
                    </button>
                  </div>
                )}

                {order.status === 'ready_for_pickup' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrderForRider(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white font-extrabold text-xs shadow-md transition-all"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      Assign Online Rider
                    </button>
                    <button
                      onClick={() => setSelectedOrderForTransfer(order)}
                      title="Transfer order to adjacent Dark Store hub"
                      className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Transfer
                    </button>
                  </div>
                )}

                {order.status === 'out_for_delivery' && (
                  <div className="flex items-center justify-between text-xs py-1 text-white/60">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Courier Verified
                    </span>
                    <span className="text-[11px] font-mono text-[#FF5E00]">
                      SLA ETA: 8 Mins
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Assign Rider Modal */}
      {selectedOrderForRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#170A2D] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Assign Delivery Partner
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Order #{selectedOrderForRider.orderNumber} • {selectedOrderForRider.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForRider(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                Online Couriers Nearby (within 1.5 km)
              </p>
              {ONLINE_RIDERS.map((rider) => (
                <div
                  key={rider.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF5E00] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5E00]/20 border border-[#FF5E00]/30 flex items-center justify-center text-[#FF5E00]">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{rider.name}</p>
                      <p className="text-xs text-white/60">
                        {rider.vehicleType} • {rider.distanceKm} km away
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignRider(rider)}
                    className="px-4 py-2 rounded-xl bg-[#FF5E00] hover:bg-[#E05300] text-white text-xs font-black transition-all"
                  >
                    Dispatch ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Transfer Order to Nearby Dark Store Hub */}
      {selectedOrderForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#170A2D] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Transfer Order to Adjacent Hub
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Reroute #{selectedOrderForTransfer.orderNumber} due to local stockout or fleet congestion.
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForTransfer(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                Select Receiving Dark Store Hub
              </p>
              {NEARBY_HUBS.map((hub) => (
                <div
                  key={hub.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FAA307] transition-all"
                >
                  <div>
                    <p className="font-bold text-sm text-white">{hub.name}</p>
                    <p className="text-xs text-white/60">
                      Code: {hub.code} • {hub.distanceKm} km transit
                    </p>
                  </div>
                  <button
                    onClick={() => handleTransferHub(hub)}
                    className="px-4 py-2 rounded-xl bg-[#FAA307] hover:bg-[#E09000] text-black text-xs font-black transition-all"
                  >
                    Transfer ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
