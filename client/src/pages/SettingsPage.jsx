import React, { useState, useEffect } from 'react';
import {
  Settings, Shield, Bell, Database, Eye, EyeOff,
  Download, Trash2, ChevronRight, CheckCircle2, History, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAuditLogsApi } from '../services/api';
import { RedlineCard, PageHeader } from '../components/RedlineComponents';

function SettingRow({ icon: Icon, label, description, children, onClick }) {
  const isClickable = !!onClick;
  const Wrapper = isClickable ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-4 py-3.5 border-b border-[#EAEAEA] last:border-0 ${
        isClickable ? 'hover:bg-[#FAFAFA] rounded-lg -mx-1 px-1 transition-colors text-left' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
          <Icon size={15} className="text-[#666]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#171717]">{label}</p>
          {description && <p className="text-[11px] text-[#999] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">
        {children || (isClickable && <ChevronRight size={15} className="text-[#999]" />)}
      </div>
    </Wrapper>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#C62828]' : 'bg-[#EAEAEA]'
      }`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

export default function SettingsPage({ privacyMode, onPrivacyToggle }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [dueAlerts, setDueAlerts] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    fetchAuditLogsApi().then(res => setAuditLogs(res.data || [])).catch(() => {});
  }, []);

  const handleExportBackup = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      user: user?.name,
      customers: JSON.parse(localStorage.getItem('paytrack_customers') || '[]'),
      credits: JSON.parse(localStorage.getItem('paytrack_credits') || '[]'),
      payments: JSON.parse(localStorage.getItem('paytrack_payments') || '[]'),
      auditLogs: JSON.parse(localStorage.getItem('paytrack_audit_logs') || '[]')
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PayTrack_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    const confirm = window.confirm('Are you sure you want to reset all workspace data to factory demo records?');
    if (confirm) {
      logout();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#171717] tracking-tight">Platform Settings</h1>
        <p className="text-sm text-[#666] mt-0.5">Workspace configuration, security, and audit history</p>
      </div>

      {/* Profile Banner */}
      <RedlineCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF6F6] text-[#C62828] border border-[#FDECEC] flex items-center justify-center font-bold text-lg">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#171717]">{user?.name || 'Demo User'}</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Active Session
              </span>
            </div>
            <p className="text-xs text-[#999] mt-0.5">{user?.email || 'demo@paytrack.app'}</p>
          </div>
        </div>
      </RedlineCard>

      {/* Preferences */}
      <RedlineCard className="p-5 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-[#999] pb-2">Preferences & Privacy</p>
        <SettingRow
          icon={privacyMode ? EyeOff : Eye}
          label="Privacy Mode (Mask Balances)"
          description="Hide numeric financial amounts on shared screens"
        >
          <Toggle checked={privacyMode} onChange={onPrivacyToggle} />
        </SettingRow>
        <SettingRow
          icon={Bell}
          label="Due Date Alerts"
          description="Generate daily reminders for upcoming due accounts"
        >
          <Toggle checked={dueAlerts} onChange={setDueAlerts} />
        </SettingRow>
        <SettingRow
          icon={Shield}
          label="Authoritative Calculation Engine"
          description="Strict ledger validation with zero floating point drift"
        >
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Enabled
          </span>
        </SettingRow>
      </RedlineCard>

      {/* Backup & Audit */}
      <RedlineCard className="p-5 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-[#999] pb-2">Data & Audit</p>
        <SettingRow
          icon={Download}
          label="Export Complete Workspace Backup"
          description="Download all customer profiles, credits, and transaction ledger (JSON)"
          onClick={handleExportBackup}
        />
        <SettingRow
          icon={History}
          label="View Audit Trail"
          description={`Inspect ${auditLogs.length} logged system events and financial modifications`}
          onClick={() => setShowAudit(!showAudit)}
        />
      </RedlineCard>

      {/* Audit Logs Table Modal / Accordion */}
      {showAudit && (
        <RedlineCard className="p-5 space-y-3 border-l-4 border-l-[#171717]">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#171717] uppercase tracking-wider">Recent Audit Trail</h4>
            <span className="text-[11px] text-[#999] font-mono">{auditLogs.length} Events</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded-lg border border-[#EAEAEA] bg-[#FAFAFA] text-xs flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-[10px] text-[#C62828] uppercase">{log.action}</span>
                  <p className="text-[#171717] font-medium mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-[#999] font-mono mt-0.5">By {log.user_name} • ID: {log.entity_id}</p>
                </div>
                <span className="text-[10px] font-mono text-[#999] shrink-0">
                  {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </RedlineCard>
      )}

      {/* Factory Reset */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#EAEAEA] text-xs font-bold text-[#C62828] hover:bg-[#FFF6F6] hover:border-[#FDECEC] transition-colors"
      >
        <RotateCcw size={14} />
        Reset Workspace to Default Factory Data
      </button>
    </div>
  );
}
