import React, { useState, useEffect } from 'react';
import {
  CreditCard, PlusCircle, Search, Filter, IndianRupee, Calendar,
  AlertCircle, CheckCircle2, Clock, User, ArrowUpDown
} from 'lucide-react';
import { fetchCreditsApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import { RedlineCard, LoadingSpinner } from '../components/RedlineComponents';

export default function CreditAccountsPage({ onRecordPayment, onAddCredit, privacyMode = false }) {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCreditsApi();
      setCredits(res.data || []);
    } catch (e) {
      console.error('Failed to load credit accounts:', e);
      setError('Unable to load credit accounts.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCredits = credits.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.credit_name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.customer_name.toLowerCase().includes(q) ||
        c.customer_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalIssued = credits.reduce((sum, c) => sum + (c.principal || 0), 0);
  const totalPayable = credits.reduce((sum, c) => sum + (c.totalPayable || 0), 0);
  const totalPaid = credits.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  const totalOutstanding = credits.reduce((sum, c) => sum + (c.outstanding || 0), 0);
  const overdueCount = credits.filter(c => c.status === 'OVERDUE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171717] tracking-tight">Credit Accounts</h1>
          <p className="text-sm text-[#666] mt-0.5">Manage credit lines, principal terms, interest, and payment schedules</p>
        </div>
        <button
          onClick={onAddCredit}
          className="rl-btn-primary self-start sm:self-auto py-2.5 px-4 text-xs flex items-center gap-2"
        >
          <PlusCircle size={15} />
          Issue Credit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Principal</span>
            <IndianRupee size={16} className="text-[#999]" />
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {privacyMode ? '••••••' : formatINR(totalIssued)}
          </div>
          <p className="text-[11px] text-[#999] mt-1">{credits.length} issued credit lines</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Payable</span>
            <CreditCard size={16} className="text-[#171717]" />
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {privacyMode ? '••••••' : formatINR(totalPayable)}
          </div>
          <p className="text-[11px] text-[#999] mt-1">Including interest</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Collected</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {privacyMode ? '••••••' : formatINR(totalPaid)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Settled payments</p>
        </RedlineCard>

        <RedlineCard className="p-4 bg-[#FFF6F6] border-[#FDECEC]">
          <div className="flex items-center justify-between text-[#8E1B1B] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outstanding</span>
            <AlertCircle size={16} className="text-[#C62828]" />
          </div>
          <div className="text-2xl font-bold text-[#C62828]">
            {privacyMode ? '••••••' : formatINR(totalOutstanding)}
          </div>
          <p className="text-[11px] text-[#8E1B1B] mt-1">{overdueCount} overdue credit account(s)</p>
        </RedlineCard>
      </div>

      {/* Filter & Search Bar */}
      <RedlineCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search by credit name, credit ID, customer name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rl-input pl-9 text-xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'DUE', 'OVERDUE', 'PARTIAL', 'PAID'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#171717] text-white'
                    : 'text-[#666] hover:bg-[#F5F5F5]'
                }`}
              >
                {tab === 'ALL' ? 'All Credits' : tab}
              </button>
            ))}
          </div>
        </div>
      </RedlineCard>

      {/* Credits Table */}
      <RedlineCard className="overflow-hidden p-0">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size={32} />
            <p className="text-xs text-[#999]">Loading credit accounts…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : filteredCredits.length === 0 ? (
          <div className="p-16 text-center">
            <CreditCard size={36} className="mx-auto text-[#CCC] mb-3" />
            <h3 className="font-bold text-sm text-[#171717]">No credit accounts found</h3>
            <p className="text-xs text-[#999] mt-1 max-w-sm mx-auto">
              {search ? 'No records match your search criteria.' : 'Create a credit line for a customer.'}
            </p>
            <button
              onClick={onAddCredit}
              className="rl-btn-primary mt-4 py-2 px-4 text-xs inline-flex items-center gap-1.5"
            >
              <PlusCircle size={14} /> Issue Credit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] text-[#666] border-b border-[#EAEAEA] font-semibold">
                  <th className="py-3.5 px-4">Credit Account</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-right">Principal</th>
                  <th className="py-3.5 px-4 text-right">Interest</th>
                  <th className="py-3.5 px-4 text-right">Total Payable</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Due Info</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {filteredCredits.map(c => (
                  <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                    {/* Credit Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-[#171717]">{c.credit_name}</div>
                      <div className="text-[11px] font-mono text-[#999]">{c.id}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#171717]">{c.customer_name}</div>
                      <div className="text-[11px] text-[#999] font-mono">{c.customer_id}</div>
                    </td>

                    {/* Principal */}
                    <td className="py-3.5 px-4 text-right font-medium text-[#666]">
                      {formatINR(c.principal)}
                    </td>

                    {/* Interest */}
                    <td className="py-3.5 px-4 text-right font-mono text-[#666]">
                      {c.interestRate > 0 ? `${c.interestRate}% (+${formatINR(c.interestAmount)})` : '0%'}
                    </td>

                    {/* Total Payable */}
                    <td className="py-3.5 px-4 text-right font-semibold text-[#171717]">
                      {formatINR(c.totalPayable)}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                      {formatINR(c.totalPaid)}
                    </td>

                    {/* Outstanding */}
                    <td className="py-3.5 px-4 text-right">
                      <strong className={`font-bold ${c.outstanding > 0 ? 'text-[#C62828]' : 'text-emerald-700'}`}>
                        {privacyMode ? '••••••' : formatINR(c.outstanding)}
                      </strong>
                    </td>

                    {/* Due info */}
                    <td className="py-3.5 px-4 text-center">
                      <div className={`text-[11px] font-semibold ${
                        c.dueInfo.type === 'danger'
                          ? 'text-[#C62828]'
                          : c.dueInfo.type === 'warning'
                            ? 'text-amber-700'
                            : 'text-[#666]'
                      }`}>
                        {c.dueInfo.label}
                      </div>
                      <div className="text-[10px] text-[#999]">{c.due_date}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        c.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.status === 'OVERDUE'
                            ? 'bg-red-50 text-red-700 animate-pulse'
                            : c.status === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {c.outstanding > 0 ? (
                        <button
                          onClick={() => onRecordPayment(c.customer_id, c.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#C62828] text-white text-[11px] font-bold hover:bg-[#B71C1C] transition-colors shadow-sm"
                        >
                          Settle Payment
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">✓ Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </RedlineCard>
    </div>
  );
}
