import React, { useState, useEffect } from 'react';
import {
  FileText, IndianRupee, Search, Download, Printer, PlusCircle,
  AlertCircle, CheckCircle2, RotateCcw, Filter, Calendar
} from 'lucide-react';
import { fetchTransactionsApi, voidTransactionApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import { RedlineCard, LoadingSpinner } from '../components/RedlineComponents';

export default function PaymentsPage({ onRecordPayment, privacyMode = false }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTransactionsApi();
      setTransactions(res.data || []);
    } catch (e) {
      console.error('Failed to load transactions:', e);
      setError('Unable to load payment transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async (txn) => {
    const reason = window.prompt(`Are you sure you want to void transaction ${txn.id} of ${formatINR(txn.amount)}? Please provide a reason:`, 'Incorrect entry');
    if (reason === null) return;

    try {
      await voidTransactionApi(txn.id, reason);
      loadTransactions();
    } catch (e) {
      alert('Failed to void transaction.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer Name', 'Credit Account', 'Amount (₹)', 'Payment Method', 'Payment Date', 'Reference #', 'Status', 'Notes'];
    const rows = filteredTransactions.map(t => [
      t.id,
      `"${t.customer_name}"`,
      `"${t.credit_name}"`,
      t.amount,
      t.payment_method,
      t.payment_date,
      t.reference_number || '',
      t.status,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PayTrack_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(t => {
    if (methodFilter !== 'ALL' && t.payment_method !== methodFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        (t.reference_number && t.reference_number.toLowerCase().includes(q)) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.credit_name.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const validTransactions = transactions.filter(t => t.status !== 'VOID');
  const totalCollections = validTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const upiTotal = validTransactions.filter(t => t.payment_method === 'UPI').reduce((sum, t) => sum + (t.amount || 0), 0);
  const bankTotal = validTransactions.filter(t => t.payment_method === 'Bank Transfer').reduce((sum, t) => sum + (t.amount || 0), 0);
  const cashCardTotal = validTransactions.filter(t => t.payment_method === 'Cash' || t.payment_method === 'Card').reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171717] tracking-tight">Payment Ledger</h1>
          <p className="text-sm text-[#666] mt-0.5">Authoritative audit log of all customer payments and settlements</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-[#EAEAEA] text-xs font-semibold text-[#171717] hover:bg-[#F5F5F5] flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={onRecordPayment}
            className="rl-btn-primary py-2 px-4 text-xs flex items-center gap-2"
          >
            <PlusCircle size={15} /> Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RedlineCard className="p-4 bg-[#FFF6F6] border-[#FDECEC]">
          <div className="flex items-center justify-between text-[#8E1B1B] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Received</span>
            <IndianRupee size={16} className="text-[#C62828]" />
          </div>
          <div className="text-2xl font-bold text-[#C62828]">
            {privacyMode ? '••••••' : formatINR(totalCollections)}
          </div>
          <p className="text-[11px] text-[#8E1B1B] mt-1">{validTransactions.length} settled transactions</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">UPI Collections</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">UPI</span>
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {privacyMode ? '••••••' : formatINR(upiTotal)}
          </div>
          <p className="text-[11px] text-[#999] mt-1">Instant digital transfers</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bank Transfer</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">IMPS/NEFT</span>
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {privacyMode ? '••••••' : formatINR(bankTotal)}
          </div>
          <p className="text-[11px] text-[#999] mt-1">Corporate settlements</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash & Cards</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">POS/Counter</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {privacyMode ? '••••••' : formatINR(cashCardTotal)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Counter collections</p>
        </RedlineCard>
      </div>

      {/* Filters & Search */}
      <RedlineCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search by transaction ID, UTR #, customer, or notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rl-input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="border border-[#EAEAEA] rounded-lg px-2.5 py-1.5 text-xs text-[#171717] bg-white"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-[#EAEAEA] rounded-lg px-2.5 py-1.5 text-xs text-[#171717] bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="VOID">Voided / Reversed</option>
            </select>
          </div>
        </div>
      </RedlineCard>

      {/* Transactions Table */}
      <RedlineCard className="overflow-hidden p-0">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size={32} />
            <p className="text-xs text-[#999]">Loading transaction ledger…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center">
            <FileText size={36} className="mx-auto text-[#CCC] mb-3" />
            <h3 className="font-bold text-sm text-[#171717]">No transactions found</h3>
            <p className="text-xs text-[#999] mt-1 max-w-sm mx-auto">
              {search ? 'No transactions match your search filter.' : 'Record your first customer payment.'}
            </p>
            <button
              onClick={onRecordPayment}
              className="rl-btn-primary mt-4 py-2 px-4 text-xs inline-flex items-center gap-1.5"
            >
              <PlusCircle size={14} /> Record Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] text-[#666] border-b border-[#EAEAEA] font-semibold">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Credit Account</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Reference / UTR</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {filteredTransactions.map(txn => (
                  <tr
                    key={txn.id}
                    className={`hover:bg-[#FAFAFA] transition-colors ${txn.status === 'VOID' ? 'opacity-60 bg-[#FFFDFD]' : ''}`}
                  >
                    {/* Transaction ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#171717]">
                      {txn.id}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#171717]">{txn.customer_name}</div>
                      <div className="text-[11px] text-[#999] font-mono">{txn.customer_id}</div>
                    </td>

                    {/* Credit Account */}
                    <td className="py-3.5 px-4 text-[#666]">
                      {txn.credit_name}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <strong className={`font-bold ${txn.status === 'VOID' ? 'line-through text-[#999]' : 'text-emerald-700 font-mono text-sm'}`}>
                        {privacyMode ? '••••••' : formatINR(txn.amount)}
                      </strong>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#F5F5F5] text-[#171717] font-medium text-[11px]">
                        {txn.payment_method}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#666] font-mono text-xs whitespace-nowrap">
                      {txn.payment_date}
                    </td>

                    {/* Reference # */}
                    <td className="py-3.5 px-4 text-[11px] font-mono text-[#999]">
                      {txn.reference_number || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        txn.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {txn.status !== 'VOID' ? (
                        <button
                          onClick={() => handleVoid(txn)}
                          title="Void / Reverse payment entry"
                          className="px-2 py-1 rounded text-[11px] text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          Void
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#999] italic">{txn.void_reason || 'Voided'}</span>
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
