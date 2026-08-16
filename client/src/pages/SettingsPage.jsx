import React, { useState } from 'react';
import {
  Settings, Shield, Bell, Database, Eye, EyeOff,
  Download, Trash2, LogOut, ChevronRight, Moon, Sun, Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RedlineCard, PageHeader } from '../components/RedlineComponents';

function SettingRow({ icon: Icon, label, description, children, onClick }) {
  const isClickable = !!onClick;
  const Wrapper = isClickable ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-4 py-4 border-b border-[#EAEAEA] last:border-0 ${
        isClickable ? 'hover:bg-[#FAFAFA] rounded-lg -mx-1 px-1 transition-colors text-left' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#666]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#171717]">{label}</p>
          {description && <p className="text-xs text-[#999] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">
        {children || (isClickable && <ChevronRight size={16} className="text-[#999]" />)}
      </div>
    </Wrapper>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#C62828]' : 'bg-[#EAEAEA]'
      }`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-1'
      }`} />
    </button>
  );
}

export default function SettingsPage({ privacyMode, onPrivacyToggle }) {
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [dueDateAlerts, setDueDateAlerts]  = useState(true);
  const [pinEnabled, setPinEnabled]         = useState(false);

  const handleExport = () => {
    const localData = { user: user?.name, exported: new Date().toISOString(), note: 'Export from PayTrack' };
    const blob = new Blob([JSON.stringify(localData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'paytrack-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader title="Settings" subtitle="App preferences and account" />

      {/* Profile */}
      <RedlineCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C62828] flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-base font-bold text-[#171717]">{user?.name || 'User'}</p>
            <p className="text-sm text-[#999]">{user?.email || '—'}</p>
          </div>
        </div>
      </RedlineCard>

      {/* Privacy */}
      <RedlineCard className="px-4 py-2">
        <p className="rl-section-title py-3">Privacy</p>
        <SettingRow
          icon={privacyMode ? EyeOff : Eye}
          label="Privacy mode"
          description="Hide all currency amounts"
        >
          <Toggle checked={privacyMode} onChange={onPrivacyToggle} />
        </SettingRow>
        <SettingRow
          icon={Shield}
          label="App PIN / Biometric"
          description="Require PIN on launch"
        >
          <Toggle checked={pinEnabled} onChange={setPinEnabled} />
        </SettingRow>
      </RedlineCard>

      {/* Notifications */}
      <RedlineCard className="px-4 py-2">
        <p className="rl-section-title py-3">Notifications</p>
        <SettingRow
          icon={Bell}
          label="Browser notifications"
          description="Enable payment reminders"
        >
          <Toggle checked={notifications} onChange={setNotifications} />
        </SettingRow>
        <SettingRow
          icon={Bell}
          label="Due date alerts"
          description="Alert 3 days before due date"
        >
          <Toggle checked={dueDateAlerts} onChange={setDueDateAlerts} />
        </SettingRow>
      </RedlineCard>

      {/* Data */}
      <RedlineCard className="px-4 py-2">
        <p className="rl-section-title py-3">Data &amp; backup</p>
        <SettingRow
          icon={Download}
          label="Export backup"
          description="Download your data as JSON"
          onClick={handleExport}
        />
        <SettingRow
          icon={Database}
          label="Data storage"
          description="Your data is stored locally on this server"
        />
      </RedlineCard>

      {/* About */}
      <RedlineCard className="px-4 py-2">
        <p className="rl-section-title py-3">About</p>
        <SettingRow
          icon={Settings}
          label="PayTrack"
          description="Personal credit management platform"
        >
          <span className="text-xs text-[#999] font-mono bg-[#F5F5F5] px-2 py-1 rounded">v2.0</span>
        </SettingRow>
        <SettingRow
          icon={Shield}
          label="Your data stays private"
          description="No analytics, no tracking, no cloud sync"
        />
      </RedlineCard>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#EAEAEA] text-sm font-medium text-[#C62828] hover:bg-[#FFF6F6] hover:border-[#FDECEC] transition-colors"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  );
}
