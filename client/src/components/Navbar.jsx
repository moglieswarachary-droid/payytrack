import React, { useState } from 'react';
import {
  Search, Bell, Eye, EyeOff, Plus, User,
  RotateCcw, Shield, CheckCircle2, ChevronDown, IndianRupee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RedlineLogo } from './RedlineComponents';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onRecordPayment,
  privacyMode,
  togglePrivacy,
  onOpenNotifications,
  unreadCount = 0
}) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const tabTitles = {
    dashboard: 'Platform Overview',
    customers: 'Customer Directory',
    credits: 'Credit Accounts',
    payments: 'Payment Ledger',
    icici: 'ICICI Bank Sapphiro Card',
    slice: 'Slice Borrow Account',
    analytics: 'Financial Analytics',
    calendar: 'Payment Calendar',
    simulator: 'Payoff Simulator',
    goals: 'Debt Goals',
    health: 'Credit Health Score',
    reports: 'Financial Reports',
    settings: 'Platform Settings'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Brand & Active title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <RedlineLogo size={24} />
          <span className="font-bold text-sm text-[#171717]">PayTrack</span>
        </div>
        <div className="hidden md:block">
          <h2 className="text-sm font-bold text-[#171717] tracking-tight">
            {tabTitles[activeTab] || 'PayTrack'}
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] text-[#999] hover:text-[#171717] hover:border-[#CCC] transition-all text-xs"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search customers, credits, txns…</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-[#EAEAEA] text-[10px] font-mono text-[#999]">
            Ctrl K
          </kbd>
        </button>

        {/* Record Payment Button */}
        <button
          onClick={onRecordPayment}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C62828] text-white text-xs font-bold hover:bg-[#B71C1C] transition-colors shadow-sm"
        >
          <IndianRupee size={13} />
          <span>Pay</span>
        </button>

        {/* Privacy Toggle */}
        <button
          onClick={togglePrivacy}
          title={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
          className={`p-2 rounded-xl border transition-colors ${
            privacyMode
              ? 'bg-[#FFF6F6] border-[#FDECEC] text-[#C62828]'
              : 'border-[#EAEAEA] text-[#666] hover:bg-[#F5F5F5]'
          }`}
        >
          {privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>

        {/* Smart Notifications */}
        <button
          onClick={onOpenNotifications}
          title="Notifications"
          className="relative p-2 rounded-xl border border-[#EAEAEA] text-[#666] hover:bg-[#F5F5F5] transition-colors"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C62828] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F5F5F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFF6F6] text-[#C62828] font-bold text-xs flex items-center justify-center border border-[#FDECEC]">
              {initials}
            </div>
            <ChevronDown size={13} className="text-[#999] hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-11 w-56 bg-white border border-[#EAEAEA] rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in text-xs">
                <div className="px-4 py-3 border-b border-[#EAEAEA] bg-[#FAFAFA]">
                  <p className="font-bold text-[#171717] truncate">{user?.name || 'Demo User'}</p>
                  <p className="text-[11px] text-[#999] truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('settings');
                    }}
                    className="w-full text-left px-3 py-2 text-[#171717] hover:bg-[#F5F5F5] rounded-lg transition-colors"
                  >
                    Platform Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      togglePrivacy();
                    }}
                    className="w-full text-left px-3 py-2 text-[#171717] hover:bg-[#F5F5F5] rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>Privacy Mode</span>
                    <span className="text-[10px] font-bold text-[#999]">{privacyMode ? 'ON' : 'OFF'}</span>
                  </button>
                  <div className="border-t border-[#EAEAEA] my-1" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-[#C62828] hover:bg-[#FFF6F6] rounded-lg font-medium transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    Reset Workspace Data
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
