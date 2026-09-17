'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Box,
  Truck,
  Store,
  Layers,
  Sparkles,
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
    <div className="min-h-screen bg-[#0F0A1C] text-white flex flex-col font-sans">
      {/* Operator Station Top Bar */}
      <header className="sticky top-0 z-50 bg-[#170A2D]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand & Store Node Badge */}
          <div className="flex items-center gap-4">
            <Link href="/operator" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/15 shadow-md">
                <Image
                  src="/logo.png"
                  alt="Belzo Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base tracking-tight text-white">
                    Belzo Dispatch Terminal
                  </h1>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#FF5E00]/20 text-[#FF5E00] border border-[#FF5E00]/30">
                    Operator
                  </span>
                </div>
                <p className="text-xs text-white/60 font-medium">
                  Belzo Central Hub 01 • Koramangala Micro-Fulfillment
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Tabs & Live Controls */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <Link
                href="/operator"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pathname === '/operator'
                    ? 'bg-[#FF5E00] text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Live Dispatch
              </Link>
              <Link
                href="/operator/inventory"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pathname === '/operator/inventory'
                    ? 'bg-[#FF5E00] text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
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
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#34C759]" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/40" />
              )}
            </button>

            {/* Live WebSocket CDC Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden sm:inline">CDC Realtime:</span> Live
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Subbar */}
      <div className="md:hidden flex items-center justify-around bg-[#170A2D] border-b border-white/10 p-2 text-xs font-bold">
        <Link
          href="/operator"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            pathname === '/operator' ? 'bg-[#FF5E00] text-white' : 'text-white/70'
          }`}
        >
          <Truck className="w-4 h-4" />
          Live Orders
        </Link>
        <Link
          href="/operator/inventory"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            pathname === '/operator/inventory'
              ? 'bg-[#FF5E00] text-white'
              : 'text-white/70'
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
