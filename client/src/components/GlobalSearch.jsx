import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CreditCard, Wallet, Clock, ChevronRight } from 'lucide-react';
import { fetchICICIPaymentsApi, fetchSlicePaymentsApi } from '../services/api';
import { formatCurrency, formatMonthName } from '../utils/formatters';
import { RedlineBadge } from './RedlineComponents';

const COMMANDS = [
  { id: 'add-icici',   label: 'Add ICICI payment',   icon: CreditCard, shortcut: '' },
  { id: 'add-slice',   label: 'Add Slice repayment',  icon: Wallet,     shortcut: '' },
  { id: 'open-dash',   label: 'Go to Dashboard',      icon: null,       shortcut: '' },
  { id: 'open-analytics', label: 'Go to Analytics',   icon: null,       shortcut: '' },
  { id: 'open-goals',  label: 'Go to Goals',          icon: null,       shortcut: '' },
  { id: 'open-simulator', label: 'Open Simulator',    icon: null,       shortcut: '' },
  { id: 'open-reports','label': 'Open Reports',       icon: null,       shortcut: '' },
  { id: 'open-settings','label': 'Settings',          icon: null,       shortcut: '' },
];

export default function GlobalSearch({ isOpen, onClose, onSelectRecord, onOpenAddModal, onNavigate }) {
  const [query, setQuery]       = useState('');
  const [records, setRecords]   = useState({ icici: [], slice: [] });
  const [loading, setLoading]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) { setQuery(''); return; }
    setTimeout(() => inputRef.current?.focus(), 50);
    setLoading(true);
    Promise.all([fetchICICIPaymentsApi(), fetchSlicePaymentsApi()])
      .then(([i, s]) => setRecords({ icici: i.data || [], slice: s.data || [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCommands = q
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(q))
    : COMMANDS;

  const filteredICICI = records.icici.filter(r =>
    !q || (r.billing_month || '').includes(q) || (r.notes || '').toLowerCase().includes(q)
  ).slice(0, 4);

  const filteredSlice = records.slice.filter(r =>
    !q || (r.billing_month || '').includes(q) || (r.notes || '').toLowerCase().includes(q)
  ).slice(0, 4);

  const hasResults = filteredICICI.length || filteredSlice.length || filteredCommands.length;

  const handleCommand = (cmd) => {
    if (cmd.startsWith('add-')) {
      onOpenAddModal?.(cmd === 'add-icici' ? 'icici' : 'slice');
    } else if (cmd.startsWith('open-')) {
      const page = cmd.replace('open-', '');
      onNavigate?.(page === 'dash' ? 'dashboard' : page);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#EAEAEA]">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EAEAEA]">
            <Search size={17} className="text-[#999] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search payments, months, notes, or type a command..."
              className="flex-1 text-sm text-[#171717] placeholder:text-[#999] outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#999] hover:text-[#666]">
                <X size={15} />
              </button>
            )}
            <kbd className="hidden sm:flex text-[10px] px-1.5 py-0.5 rounded bg-[#F5F5F5] border border-[#EAEAEA] text-[#999] font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <p className="text-sm text-[#999] text-center py-8">Loading...</p>
            ) : !hasResults ? (
              <p className="text-sm text-[#999] text-center py-8">No results for "{query}"</p>
            ) : (
              <>
                {/* Commands */}
                {filteredCommands.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] font-semibold text-[#999] uppercase tracking-widest">
                      {q ? 'Commands' : 'Quick actions'}
                    </p>
                    {filteredCommands.map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => handleCommand(cmd.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors text-sm text-[#171717]"
                      >
                        <span>{cmd.label}</span>
                        <ChevronRight size={14} className="text-[#999]" />
                      </button>
                    ))}
                  </div>
                )}

                {/* ICICI Records */}
                {filteredICICI.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] font-semibold text-[#999] uppercase tracking-widest border-t border-[#EAEAEA]">
                      ICICI Records
                    </p>
                    {filteredICICI.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { onSelectRecord(r, 'icici'); onClose(); }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard size={15} className="text-orange-500 shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-[#171717]">{formatMonthName(r.billing_month)}</p>
                            <p className="text-xs text-[#999]">{formatCurrency(r.outstanding)} outstanding</p>
                          </div>
                        </div>
                        <RedlineBadge status={r.status} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Slice Records */}
                {filteredSlice.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] font-semibold text-[#999] uppercase tracking-widest border-t border-[#EAEAEA]">
                      Slice Records
                    </p>
                    {filteredSlice.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { onSelectRecord(r, 'slice'); onClose(); }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Wallet size={15} className="text-purple-500 shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-[#171717]">{formatMonthName(r.month || r.billing_month)}</p>
                            <p className="text-xs text-[#999]">{formatCurrency(r.repayment_paid)} repaid</p>
                          </div>
                        </div>
                        <RedlineBadge status={r.status} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-[#EAEAEA] flex items-center gap-3 text-[10px] text-[#999]">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">ESC</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}
