'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Truck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { playDispatchChime } from '../../lib/sound';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    if (!soundEnabled) {
      playDispatchChime();
    }
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col font-sans antialiased">
      {/* Operator Station Top Bar (Clean White Frosted Bar) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 px-4 sm:px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand & Store Node Badge */}
          <div className="flex items-center gap-4">
            <Link href="/operator" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-transparent p-1 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Belzo Logo"
                  width={38}
                  height={38}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base tracking-tight text-gray-950">
                    Belzo Dispatch Terminal
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5E00] border border-orange-200">
                    Operator
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Belzo Central Hub 01 • Joniha Chauraha, Bindki (5 KM Radius)
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Tabs & Live Controls */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-black/5">
              <Link
                href="/operator"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/operator'
                    ? 'bg-[#FF5E00] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Live Dispatch
              </Link>
              <Link
                href="/operator/inventory"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/operator/inventory'
                    ? 'bg-[#FF5E00] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                Inventory & Pricing
              </Link>
            </nav>

            {/* Chime Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Order Chime' : 'Unmute Order Chime'}
              className="p-2.5 rounded-xl bg-gray-100 border border-black/5 text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#047857]" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Live WebSocket CDC Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="hidden sm:inline">CDC Realtime:</span> Live
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Subbar */}
      <div className="md:hidden flex items-center justify-around bg-white border-b border-black/5 p-2 text-xs font-bold">
        <Link
          href="/operator"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            pathname === '/operator' ? 'bg-[#FF5E00] text-white' : 'text-gray-600'
          }`}
        >
          <Truck className="w-4 h-4" />
          Live Orders
        </Link>
        <Link
          href="/operator/inventory"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            pathname === '/operator/inventory'
              ? 'bg-[#FF5E00] text-white'
              : 'text-gray-600'
          }`}
        >
          <Box className="w-4 h-4" />
          Catalog & Stock
        </Link>
      </div>

      {/* Main Terminal Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
