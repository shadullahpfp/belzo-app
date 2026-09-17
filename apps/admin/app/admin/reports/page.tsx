'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  ShieldAlert, 
  Tag, 
  Package, 
  Bike, 
  Building2, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock, 
  UserCheck
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: 'Super Admin' | 'Dark Store Lead' | 'Automated System';
  category: 'catalog' | 'fleet' | 'security' | 'financial' | 'operations';
  action: string;
  details: string;
  ip_address: string;
}

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: 'Today, 17:42:10',
    actor: 'admin@belzo.com',
    role: 'Super Admin',
    category: 'fleet',
    action: 'KYC Approved',
    details: 'Approved driving license and onboarded Suresh Kumar (KA-01-EQ-9421)',
    ip_address: '106.51.78.14'
  },
  {
    id: 'log-02',
    timestamp: 'Today, 16:15:02',
    actor: 'Koramangala Station 01',
    role: 'Dark Store Lead',
    category: 'catalog',
    action: 'Stock Replenished',
    details: 'Added +50 units of Farm Fresh Whole Milk (SKU: prod-01)',
    ip_address: '106.51.78.20'
  },
  {
    id: 'log-03',
    timestamp: 'Today, 15:30:45',
    actor: 'admin@belzo.com',
    role: 'Super Admin',
    category: 'security',
    action: 'Customer Account Blocked',
    details: 'Blocked suspicious user +91 91234 56789 for automated checkout bot abuse',
    ip_address: '106.51.78.14'
  },
  {
    id: 'log-04',
    timestamp: 'Today, 14:10:19',
    actor: 'admin@belzo.com',
    role: 'Super Admin',
    category: 'financial',
    action: 'Promo Coupon Created',
    details: 'Published new 50% discount voucher code "BELZO50" (Cap ₹100)',
    ip_address: '106.51.78.14'
  },
  {
    id: 'log-05',
    timestamp: 'Today, 12:05:33',
    actor: 'Automated Dispatch Engine',
    role: 'Automated System',
    category: 'operations',
    action: 'Order Transferred',
    details: 'Re-routed ORD-8940 from Koramangala Hub to HSR Layout due to traffic surge',
    ip_address: 'Internal VPC'
  },
  {
    id: 'log-06',
    timestamp: 'Yesterday, 22:45:11',
    actor: 'admin@belzo.com',
    role: 'Super Admin',
    category: 'catalog',
    action: 'Price Adjusted',
    details: 'Discounted Alphonso Mango Box from ₹650 to ₹599',
    ip_address: '106.51.78.14'
  }
];

export default function AdminReportsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.actor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Actor,Role,Category,Action,Details,IP\n';
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.category}","${l.action}","${l.details}","${l.ip_address}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `belzo-audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getCategoryBadge = (category: AuditLog['category']) => {
    switch (category) {
      case 'catalog':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">Catalog</span>;
      case 'fleet':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">Fleet KYC</span>;
      case 'security':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/20">Security</span>;
      case 'financial':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Financial</span>;
      case 'operations':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-500/10 text-orange-300 border border-orange-500/20">Operations</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#FF5E00]" />
            Reports & Operational Audit Log
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Immutable regulatory compliance log tracking price modifications, KYC audits, and security interventions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-gradient-to-r from-[#FF5E00] to-[#E05300] hover:brightness-110 text-white font-medium text-sm rounded-xl shadow-lg shadow-[#FF5E00]/25 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Audit Trail (.CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">Logged Audit Events</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{logs.length}</div>
          <div className="text-xs text-white/40 mt-1">In past 24 hours</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Fleet & KYC Audits</div>
          <div className="text-2xl font-bold text-blue-400 font-mono mt-1">
            {logs.filter(l => l.category === 'fleet').length}
          </div>
          <div className="text-xs text-white/40 mt-1">Partner verifications</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">Security Interventions</div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {logs.filter(l => l.category === 'security').length}
          </div>
          <div className="text-xs text-white/40 mt-1">Fraud blacklists enforced</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Price & Stock Edits</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {logs.filter(l => l.category === 'catalog').length}
          </div>
          <div className="text-xs text-white/40 mt-1">Inventory updates logged</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1D0E38]/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action description or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5E00]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1D0E38] text-white">All Events</option>
              <option value="catalog" className="bg-[#1D0E38] text-white">Catalog & Inventory</option>
              <option value="fleet" className="bg-[#1D0E38] text-white">Fleet & KYC</option>
              <option value="security" className="bg-[#1D0E38] text-white">Security & Trust</option>
              <option value="financial" className="bg-[#1D0E38] text-white">Financial & Promos</option>
              <option value="operations" className="bg-[#1D0E38] text-white">Hub Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-[#1D0E38]/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-white/50 tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor / System</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Action Taken</th>
                <th className="px-6 py-4">Audit Details</th>
                <th className="px-6 py-4 text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-white/50 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-xs">{log.actor}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">{log.role}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {getCategoryBadge(log.category)}
                  </td>

                  <td className="px-6 py-4 font-semibold text-white text-xs">
                    {log.action}
                  </td>

                  <td className="px-6 py-4 text-xs text-white/70 max-w-md">
                    {log.details}
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-xs text-white/40">
                    {log.ip_address}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    No audit records matched your filter.
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
