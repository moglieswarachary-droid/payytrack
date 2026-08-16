import React, { useState } from 'react';
import {
  LayoutDashboard, Users, CreditCard, Receipt, Wallet, History,
  BarChart3, Calendar, FileText, Settings, Plus, Target, Zap, Heart,
  ShieldCheck, ChevronLeft, ChevronRight, IndianRupee
} from 'lucide-react';
import { RedlineLogo } from './RedlineComponents';

const NAV_GROUPS = [
  {
    title: 'Core Platform',
    items: [
      { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
      { id: 'customers',  label: 'Customers',   icon: Users },
      { id: 'credits',    label: 'Credit Accounts', icon: CreditCard },
      { id: 'payments',   label: 'Payments & Ledger', icon: Receipt },
    ]
  },
  {
    title: 'Bank Accounts',
    items: [
      { id: 'icici',      label: 'ICICI Sapphiro', icon: CreditCard },
      { id: 'slice',      label: 'Slice Borrow',   icon: Wallet },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'analytics',  label: 'Analytics',    icon: BarChart3 },
      { id: 'calendar',   label: 'Due Calendar', icon: Calendar },
      { id: 'simulator',  label: 'Simulator',    icon: Zap },
      { id: 'goals',      label: 'Payoff Goals', icon: Target },
      { id: 'health',     label: 'Credit Health', icon: Heart },
      { id: 'reports',    label: 'Reports',      icon: FileText },
      { id: 'settings',   label: 'Settings',     icon: Settings },
    ]
  }
];

export default function Sidebar({ activeTab, setActiveTab, onRecordPayment }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col min-h-screen sticky top-0 h-screen z-20 bg-white border-r border-[#EAEAEA] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#EAEAEA] ${collapsed ? 'justify-center' : ''}`}>
        <RedlineLogo size={32} className="shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-[15px] tracking-tight text-[#171717]">PayTrack</div>
            <div className="text-[10px] text-[#999] font-medium leading-none mt-0.5">Smart Credit & Payments</div>
          </div>
        )}
      </div>

      {/* Record Payment Button */}
      <div className="p-3 border-b border-[#EAEAEA]">
        <button
          onClick={onRecordPayment}
          title="Record Payment"
          className={`rl-btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 ${collapsed ? 'px-0' : ''}`}
        >
          <IndianRupee size={15} />
          {!collapsed && <span>Record Payment</span>}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#999] mb-1">
                {group.title}
              </p>
            )}
            {group.items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={collapsed ? label : undefined}
                className={`rl-nav-item ${activeTab === id ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Security note */}
      {!collapsed && (
        <div className="px-3 pb-3 pt-2 border-t border-[#EAEAEA]">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA]">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#666] leading-snug">
              Secure Ledger Engine. Authoritative calculations.
            </p>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-auto mb-3 w-7 h-7 rounded-full border border-[#EAEAEA] bg-white flex items-center justify-center text-[#999] hover:text-[#171717] hover:border-[#C8C8C8] transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
