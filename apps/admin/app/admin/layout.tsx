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
  Headphones,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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
  { id: 'blz-up-jon01', name: 'Belzo Joniha Central Hub (UP-01)' },
  { id: 'blz-up-bin02', name: 'Belzo Bindki Town Hub (UP-02)' },
  { id: 'blz-up-ftp03', name: 'Belzo Fatehpur City Hub (UP-03)' },
  { id: 'blz-up-knp04', name: 'Belzo Kanpur South Hub (UP-04)' },
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
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex font-sans antialiased selection:bg-[#FF5E00] selection:text-white">
      {/* Sidebar (Apple Studio Light) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white/95 backdrop-blur-xl border-r border-black/5 flex flex-col justify-between transition-all duration-300 shadow-[1px_0_4px_rgba(0,0,0,0.02)] ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-black/5">
            <Link
              href="/admin"
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 rounded-2xl bg-orange-50 p-1 flex items-center justify-center border border-orange-200 shadow-sm shrink-0">
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
                    <span className="font-extrabold text-base tracking-tight text-gray-950">
                      Belzo
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#FF5E00] text-white tracking-wider">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium truncate">
                    Enterprise Control Center
                  </p>
                </div>
              )}
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF5E00] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-950'
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
        <div className="p-3 border-t border-black/5 space-y-2">
          <Link
            href="/operator"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#FF5E00] text-xs font-bold border border-orange-200 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Headphones className="w-4 h-4 text-[#FF5E00] shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Operator Terminal</span>
                <ExternalLink className="w-3 h-3 text-[#FF5E00]/60" />
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 text-xs font-semibold transition-all"
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
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-black/5 px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Active Store Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowHubDropdown(!showHubDropdown)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 border border-black/5 text-xs font-bold text-gray-800 transition-all"
            >
              <Store className="w-3.5 h-3.5 text-[#FF5E00]" />
              <span>
                {DARK_STORES.find((s) => s.id === selectedHub)?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showHubDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-black/5 rounded-3xl p-2 shadow-2xl z-50 animate-in fade-in">
                <p className="text-[10px] font-bold uppercase text-gray-400 px-3 py-1.5">
                  Filter by Fulfillment Hub
                </p>
                {DARK_STORES.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      setSelectedHub(hub.id);
                      setShowHubDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                      selectedHub === hub.id
                        ? 'bg-[#FF5E00] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live</span>
            </div>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gray-100 border border-black/5">
              <div className="w-6 h-6 rounded-full bg-[#FF5E00] flex items-center justify-center text-white text-xs font-black">
                A
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-gray-900 leading-none">Super Admin</p>
                <p className="text-[10px] text-gray-400 font-medium">Head of Ops</p>
              </div>
            </div>

            {/* Clerk Authentication Controls */}
            <div className="flex items-center gap-2">
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 rounded-full border border-orange-200',
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 rounded-xl bg-[#FF5E00] hover:bg-[#e05300] text-white text-xs font-bold transition-all shadow-sm">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
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
