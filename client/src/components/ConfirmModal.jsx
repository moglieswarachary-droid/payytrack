import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { LoadingSpinner } from './RedlineComponents';

export default function ConfirmModal({ isOpen, onClose, onConfirm, loading, title, message }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#FFF6F6] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-[#C62828]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#171717]">{title}</h3>
              <p className="text-sm text-[#666] mt-1 leading-snug">{message}</p>
            </div>
            <button onClick={onClose} className="text-[#999] hover:text-[#171717] p-1">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="rl-btn-secondary flex-1 py-2.5 text-sm">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="rl-btn-primary flex-1 py-2.5 text-sm bg-[#C62828] hover:bg-[#D32F2F]"
            >
              {loading ? <LoadingSpinner size={16} /> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
