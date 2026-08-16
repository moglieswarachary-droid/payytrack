import React, { useState, useEffect, useRef } from 'react';
import {
  Search, X, Users, CreditCard, Receipt, FileText,
  Zap, Calendar, Settings, ArrowRight, IndianRupee
} from 'lucide-react';
import { fetchCustomersApi, fetchCreditsApi, fetchTransactionsApi } from '../services/api';
import { formatINR } from '../services/financialEngine';

const QUICK_LINKS = [
  { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation' },
  { id: 'customers', label: 'Customer Directory', category: 'Navigation' },
  { id: 'credits', label: 'Credit Accounts', category: 'Navigation' },
  { id: 'payments', label: 'Payment Ledger', category: 'Navigation' },
  { id: 'reports', label: 'Financial Reports', category: 'Navigation' },
  { id: 'simulator', label: 'Payoff Simulator', category: 'Navigation' },
  { id: 'settings', label: 'Platform Settings', category: 'Navigation' },
];

export default function GlobalSearch({
  isOpen,
  onClose,
  onNavigate,
  onRecordPayment,
  onViewStatement
}) {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [credits, setCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [custRes, credRes, txnRes] = await Promise.all([
        fetchCustomersApi(),
        fetchCreditsApi(),
        fetchTransactionsApi()
      ]);
      setCustomers(custRes.data || []);
      setCredits(credRes.data || []);
      setTransactions(txnRes.data || []);
    } catch (e) {
      console.error('Search data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCustomers = q
    ? customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredCredits = q
    ? credits.filter(c =>
        c.credit_name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.customer_name.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredTransactions = q
    ? transactions.filter(t =>
        t.id.toLowerCase().includes(q) ||
        (t.reference_number && t.reference_number.toLowerCase().includes(q)) ||
        t.customer_name.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredNav = q
    ? QUICK_LINKS.filter(l => l.label.toLowerCase().includes(q))
    : QUICK_LINKS.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#EAEAEA] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#EAEAEA] flex items-center gap-3 bg-[#FAFAFA]">
          <Search size={18} className="text-[#C62828] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search customers, phone #, credit accounts, transactions, or navigate…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#999]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-[#999] hover:text-[#171717]"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-[#EAEAEA] text-[10px] font-mono text-[#666] hover:bg-[#DDD]"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1">
          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#999] mb-1 flex items-center gap-1.5">
                <Users size={12} /> Customers
              </p>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl hover:bg-[#FAFAFA] border border-transparent hover:border-[#EAEAEA] flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{c.name}</p>
                      <p className="text-[10px] text-[#999] font-mono">{c.id} • {c.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#C62828] font-mono">
                        {formatINR(c.totalOutstanding || 0)}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onRecordPayment(c.id);
                        }}
                        className="px-2 py-1 rounded bg-[#FFF6F6] text-[#C62828] text-[10px] font-bold hover:bg-[#FDECEC]"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {filteredCredits.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#999] mb-1 flex items-center gap-1.5">
                <CreditCard size={12} /> Credit Accounts
              </p>
              <div className="space-y-1">
                {filteredCredits.map(cr => (
                  <div
                    key={cr.id}
                    className="p-2.5 rounded-xl hover:bg-[#FAFAFA] border border-transparent hover:border-[#EAEAEA] flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{cr.credit_name}</p>
                      <p className="text-[10px] text-[#999]">{cr.customer_name} ({cr.id})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#171717] font-mono">
                        {formatINR(cr.outstanding)}
                      </span>
                      <p className="text-[10px] text-[#999]">Due: {cr.due_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {filteredTransactions.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#999] mb-1 flex items-center gap-1.5">
                <Receipt size={12} /> Transactions
              </p>
              <div className="space-y-1">
                {filteredTransactions.map(t => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl hover:bg-[#FAFAFA] border border-transparent hover:border-[#EAEAEA] flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{t.customer_name}</p>
                      <p className="text-[10px] text-[#999] font-mono">{t.id} • {t.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        +{formatINR(t.amount)}
                      </span>
                      <p className="text-[10px] text-[#999]">{t.payment_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#999] mb-1">
              Navigation Shortcuts
            </p>
            <div className="space-y-1">
              {filteredNav.map(nav => (
                <button
                  key={nav.id}
                  onClick={() => {
                    onNavigate(nav.id);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F5F5F5] flex items-center justify-between text-xs text-[#171717] transition-colors"
                >
                  <span className="font-semibold">{nav.label}</span>
                  <ArrowRight size={13} className="text-[#999]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
