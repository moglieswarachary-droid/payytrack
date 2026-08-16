import React from 'react';
import { X, Bell, CheckCircle2, AlertCircle, Clock, Check, Trash2, ArrowRight } from 'lucide-react';

export default function NotificationsDrawer({ isOpen, onClose, notifications = [], onActionClick, onMarkAllRead }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-[#EAEAEA] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EAEAEA] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFF6F6] text-[#C62828] flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#171717]">Smart Notifications</h3>
              <p className="text-[11px] text-[#999]">Real-time payment and due date alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-[#666] hover:text-[#171717] hover:bg-[#EAEAEA] text-xs transition-colors"
              >
                <Check size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#999] hover:text-[#171717] hover:bg-[#EAEAEA] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell size={36} className="mx-auto text-[#DDD] mb-3" />
              <p className="text-sm font-semibold text-[#171717]">All caught up!</p>
              <p className="text-xs text-[#999] mt-1">No pending due date alerts or notifications.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  notif.type === 'danger'
                    ? 'bg-[#FFF6F6] border-[#FDECEC] text-[#8E1B1B]'
                    : notif.type === 'warning'
                      ? 'bg-[#FFFDF5] border-[#FEF3C7] text-[#92400E]'
                      : notif.type === 'success'
                        ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]'
                        : 'bg-[#F8F9FA] border-[#EAEAEA] text-[#171717]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'danger' && <AlertCircle size={16} className="text-[#C62828]" />}
                    {notif.type === 'warning' && <Clock size={16} className="text-amber-600" />}
                    {notif.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
                    {notif.type === 'info' && <Bell size={16} className="text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs">{notif.title}</h4>
                      <span className="text-[10px] text-[#999] font-mono">{notif.date}</span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">{notif.message}</p>

                    {notif.customerId && (
                      <button
                        onClick={() => {
                          onActionClick(notif.customerId, notif.creditId);
                          onClose();
                        }}
                        className="mt-2 text-[11px] font-bold flex items-center gap-1 hover:underline text-[#C62828]"
                      >
                        Settle Payment <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#EAEAEA] bg-[#FAFAFA] text-center text-[11px] text-[#999]">
          Notifications are automatically generated based on active due dates and payment records.
        </div>
      </div>
    </div>
  );
}
