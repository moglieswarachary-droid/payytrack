import React, { useState } from 'react';
import { Search, Bell, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  icici:      'ICICI Credit Card',
  slice:      'Slice',
  history:    'Payment History',
  analytics:  'Analytics',
  calendar:   'Calendar',
  goals:      'Goals',
  simulator:  'Payment Simulator',
  health:     'Financial Health',
  reports:    'Reports',
  settings:   'Settings',
};

export default function Navbar({ activeTab, onOpenSearch, onOpenAddModal, privacyMode, onPrivacyToggle, onTogglePrivacy }) {
  // support both prop names for backwards compat
  const togglePrivacy = onPrivacyToggle || onTogglePrivacy;
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#EAEAEA] h-14 flex items-center px-4 gap-4 shrink-0">
      {/* Page title (desktop) */}
      <div className="flex-1 min-w-0 hidden md:block">
        <h2 className="text-sm font-semibold text-[#171717] tracking-tight truncate">
          {PAGE_TITLES[activeTab] || 'PayTrack'}
        </h2>
      </div>

      {/* PayTrack wordmark (mobile only) */}
      <div className="flex-1 md:hidden">
        <span className="font-bold text-[15px] text-[#171717] tracking-tight">PayTrack</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search */}
        <button
          onClick={onOpenSearch}
          title="Search (Ctrl+K)"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#666] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors"
        >
          <Search size={17} />
        </button>

        {/* Privacy toggle */}
        <button
          onClick={togglePrivacy}
          title={privacyMode ? 'Show amounts' : 'Hide amounts (Privacy Mode)'}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            privacyMode
              ? 'text-[#C62828] bg-[#FFF6F6]'
              : 'text-[#666] hover:bg-[#F5F5F5] hover:text-[#171717]'
          }`}
        >
          {privacyMode ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>

        {/* Notifications placeholder */}
        <button
          title="Notifications"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#666] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors relative"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C62828]" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFF6F6] text-[#C62828] font-bold text-xs hover:bg-[#FDECEC] transition-colors ml-1"
          >
            {initials}
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-11 w-52 bg-white border border-[#EAEAEA] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-20 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-[#EAEAEA]">
                  <p className="text-sm font-semibold text-[#171717] truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-[#999] truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setShowUserMenu(false); togglePrivacy(); }}
                    className="w-full text-left px-3 py-2 text-sm text-[#171717] hover:bg-[#F5F5F5] rounded-lg flex items-center gap-2"
                  >
                    {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
                    {privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-[#FFF6F6] rounded-lg"
                  >
                    Sign out
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
