'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Store,
  Bike,
  Users,
  Tag,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Bell,
  Search,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard & Metrics', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Live Order Pipeline', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products & Catalog', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/stores', label: 'Dark Stores & Hubs', icon: Store },
  { href: '/admin/riders', label: 'Fleet & Rider KYC', icon: Bike },
  { href: '/admin/customers', label: 'Customers Directory', icon: Users },
  { href: '/admin/marketing', label: 'Coupons & Banners', icon: Tag },
  { href: '/admin/reports', label: 'Reports & Audit', icon: BarChart3 },
];

const DARK_STORES = [
  { id: 'all', name: 'All Dark Stores (Global View)' },
  { id: 'blr-kor-01', name: 'Belzo Central Hub - Koramangala (01)' },
  { id: 'blr-ind-02', name: 'Belzo Indiranagar Hub (02)' },
  { id: 'blr-hsr-03', name: 'Belzo HSR Layout Hub (03)' },
  { id: 'blr-mgr-04', name: 'Belzo MG Road Hub (04)' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedHub, setSelectedHub] = useState('all');
  const [showHubDropdown, setShowHubDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-[#0E0919] text-white flex font-sans antialiased selection:bg-[#FF5E00] selection:text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#160B2A]/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <Link
              href="/admin"
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/15 shadow-md shrink-0">
                <Image
                  src="/logo.png"
                  alt="Belzo Logo"
                  width={34}
                  height={34}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              {!isCollapsed && (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white">
                      Belzo
                    </span>
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[#FF5E00] text-white tracking-wider">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 font-medium truncate">
                    Enterprise Control Center
                  </p>
                </div>
              )}
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF5E00] text-white shadow-lg shadow-[#FF5E00]/25'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Operator Quick-Switch & Collapse Button */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link
            href="/operator"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-[#2A134D] hover:bg-[#3E1B6B] text-white text-xs font-bold border border-white/10 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Headphones className="w-4 h-4 text-[#FAA307] shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Operator Terminal</span>
                <ExternalLink className="w-3 h-3 text-white/40" />
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-bold transition-all"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0E0919]/90 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between">
          {/* Active Store Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowHubDropdown(!showHubDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
            >
              <Store className="w-3.5 h-3.5 text-[#FF5E00]" />
              <span className="text-white/90">
                {DARK_STORES.find((s) => s.id === selectedHub)?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </button>

            {showHubDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-[#1B0E33] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in">
                <p className="text-[10px] font-black uppercase text-white/40 px-2 py-1">
                  Filter by Fulfillment Hub
                </p>
                {DARK_STORES.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      setSelectedHub(hub.id);
                      setShowHubDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      selectedHub === hub.id
                        ? 'bg-[#FF5E00] text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{hub.name}</span>
                    {selectedHub === hub.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Area: Status & Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production Live</span>
            </div>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-[#FF5E00] flex items-center justify-center text-white text-xs font-black">
                A
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-white leading-none">Super Admin</p>
                <p className="text-[10px] text-white/40 font-medium">Head of Ops</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
