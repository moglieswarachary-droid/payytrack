import React, { useState } from 'react';
import {
  LayoutDashboard, CreditCard, Wallet, History, BarChart3,
  Calendar, FileText, Settings, Plus, Target, Zap, Heart,
  ShieldCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { RedlineLogo } from './RedlineComponents';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'icici',      label: 'ICICI Card',   icon: CreditCard },
  { id: 'slice',      label: 'Slice',        icon: Wallet },
  { id: 'history',    label: 'History',      icon: History },
  { id: 'analytics',  label: 'Analytics',    icon: BarChart3 },
  { id: 'calendar',   label: 'Calendar',     icon: Calendar },
  { id: 'goals',      label: 'Goals',        icon: Target },
  { id: 'simulator',  label: 'Simulator',    icon: Zap },
  { id: 'health',     label: 'Health',       icon: Heart },
  { id: 'reports',    label: 'Reports',      icon: FileText },
  { id: 'settings',   label: 'Settings',     icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, onOpenAddModal }) {
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
            <div className="text-[10px] text-[#999] font-medium leading-none mt-0.5">Personal Credit Manager</div>
          </div>
        )}
      </div>

      {/* Add Payment */}
      <div className={`p-3 border-b border-[#EAEAEA]`}>
        <button
          onClick={onOpenAddModal}
          title="Add Payment"
          className={`rl-btn-primary w-full text-sm ${collapsed ? 'px-0 justify-center' : ''}`}
        >
          <Plus size={16} />
          {!collapsed && <span>Add Payment</span>}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            title={collapsed ? label : undefined}
            className={`rl-nav-item ${activeTab === id ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Security note */}
      {!collapsed && (
        <div className="px-3 pb-4 pt-2 border-t border-[#EAEAEA]">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA]">
            <ShieldCheck size={14} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#666] leading-snug">
              No bank credentials stored. Your data stays private.
            </p>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-auto mb-4 w-7 h-7 rounded-full border border-[#EAEAEA] bg-white flex items-center justify-center text-[#999] hover:text-[#171717] hover:border-[#C8C8C8] transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
