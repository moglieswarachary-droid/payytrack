import React, { useState, useEffect } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, AlertCircle, Calendar, User, IndianRupee } from 'lucide-react';
import { fetchCustomerStatementApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import { LoadingSpinner, RedlineLogo } from './RedlineComponents';

export default function CustomerStatementModal({ isOpen, onClose, customerId }) {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && customerId) {
      loadStatement();
    }
  }, [isOpen, customerId]);

  const loadStatement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCustomerStatementApi(customerId);
      setStatement(res.data);
    } catch (e) {
      console.error('Failed to load statement:', e);
      setError('Unable to load customer statement.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!statement || !statement.ledger) return;

    const headers = ['Date', 'Transaction Type', 'Description', 'Reference', 'Debit (₹)', 'Credit (₹)', 'Running Balance (₹)', 'Status'];
    const rows = statement.ledger.map(entry => [
      entry.date,
      entry.type,
      `"${entry.description.replace(/"/g, '""')}"`,
      entry.reference,
      entry.debit,
      entry.credit,
      entry.balance,
      entry.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${statement.customer.id}_${statement.statementDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#EAEAEA] overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        {/* Header toolbar (Hidden when printing) */}
        <div className="px-6 py-4 border-b border-[#EAEAEA] flex items-center justify-between bg-[#FAFAFA] print:hidden">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#C62828]" />
            <h3 className="font-bold text-sm text-[#171717]">Customer Account Statement</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={loading || !statement}
              className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-semibold text-[#171717] hover:bg-[#EAEAEA] flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || !statement}
              className="px-3 py-1.5 rounded-lg bg-[#C62828] text-white text-xs font-semibold hover:bg-[#B71C1C] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer size={13} />
              Print Statement
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#999] hover:text-[#171717] hover:bg-[#EAEAEA] transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Statement Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size={32} />
            <p className="text-xs text-[#999]">Generating account statement…</p>
          </div>
        ) : error || !statement ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 font-medium">{error || 'Statement not found.'}</p>
          </div>
        ) : (
          <div className="p-8 overflow-y-auto flex-1 font-sans text-[#171717] print:p-0">
            {/* Header Brand */}
            <div className="flex items-start justify-between border-b pb-6 border-[#EAEAEA]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RedlineLogo size={28} />
                  <span className="text-xl font-black tracking-tight text-[#171717]">PayTrack</span>
                </div>
                <p className="text-xs text-[#666]">Smart Credit & Payment Management</p>
                <p className="text-xs text-[#999] mt-0.5">support@paytrack.app • Confidential</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-[#FFF6F6] text-[#C62828] text-xs font-bold font-mono">
                  STATEMENT OF ACCOUNT
                </span>
                <p className="text-xs text-[#666] mt-2">Statement Date: <strong className="text-[#171717]">{statement.statementDate}</strong></p>
                <p className="text-xs text-[#666]">Period: {statement.period.from} to {statement.period.to}</p>
              </div>
            </div>

            {/* Customer & Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              {/* Customer details */}
              <div className="p-4 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999] mb-2">Billed To</p>
                <h4 className="font-bold text-base text-[#171717]">{statement.customer.name}</h4>
                <p className="text-xs text-[#666] mt-1 font-mono">Customer ID: {statement.customer.id}</p>
                <p className="text-xs text-[#666]">{statement.customer.phone}</p>
                <p className="text-xs text-[#666]">{statement.customer.email}</p>
                {statement.customer.address && <p className="text-xs text-[#666] mt-1">{statement.customer.address}</p>}
              </div>

              {/* Balances summary */}
              <div className="p-4 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999] mb-2">Account Position</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-[#EAEAEA]">
                    <span className="text-[10px] text-[#999] uppercase block font-semibold">Total Credit</span>
                    <strong className="text-xs font-bold text-[#171717]">{formatINR(statement.totalCreditIssued)}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#EAEAEA]">
                    <span className="text-[10px] text-[#999] uppercase block font-semibold">Total Paid</span>
                    <strong className="text-xs font-bold text-emerald-700">{formatINR(statement.totalPaid)}</strong>
                  </div>
                  <div className="p-2 bg-[#FFF6F6] rounded-lg border border-[#FDECEC]">
                    <span className="text-[10px] text-[#C62828] uppercase block font-semibold">Outstanding</span>
                    <strong className="text-xs font-bold text-[#C62828]">{formatINR(statement.closingBalance)}</strong>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    statement.closingBalance <= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : statement.customer.totalOverdue > 0
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-800'
                  }`}>
                    Status: {statement.closingBalance <= 0 ? 'Fully Settled' : statement.customer.totalOverdue > 0 ? 'Overdue Payment' : 'Active Balance'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="my-6">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#999] mb-3">Transaction History</h5>
              <div className="overflow-x-auto border border-[#EAEAEA] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] text-[#666] border-b border-[#EAEAEA] font-semibold">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3 text-right">Debit (+)</th>
                      <th className="py-3 px-3 text-right">Credit (-)</th>
                      <th className="py-3 px-3 text-right">Balance</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {statement.ledger.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-[#999]">No transactions recorded for this customer.</td>
                      </tr>
                    ) : (
                      statement.ledger.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="py-3 px-3 font-mono text-[#666] whitespace-nowrap">{entry.date}</td>
                          <td className="py-3 px-3 font-medium text-[#171717]">{entry.description}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#999]">{entry.reference}</td>
                          <td className="py-3 px-3 text-right font-medium text-[#C62828]">
                            {entry.debit > 0 ? formatINR(entry.debit) : '—'}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-emerald-700">
                            {entry.credit > 0 ? formatINR(entry.credit) : '—'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-[#171717]">
                            {formatINR(entry.balance)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                              entry.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700'
                                : entry.status === 'OVERDUE'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Terms */}
            <div className="border-t pt-4 border-[#EAEAEA] text-[11px] text-[#999] flex items-center justify-between">
              <p>This is a computer-generated statement. For disputes, please contact accounts within 7 days.</p>
              <p>Generated by PayTrack</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
