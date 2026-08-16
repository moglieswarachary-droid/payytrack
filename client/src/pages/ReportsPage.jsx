import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, Users, CreditCard,
  IndianRupee, AlertTriangle, Layers, Calendar, Filter, CheckCircle2
} from 'lucide-react';
import { fetchCustomersApi, fetchCreditsApi, fetchTransactionsApi, fetchICICIPaymentsApi, fetchSlicePaymentsApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import { RedlineCard, LoadingSpinner } from '../components/RedlineComponents';

const REPORT_CATEGORIES = [
  { id: 'customers', label: 'Customer Portfolio', icon: Users, desc: 'Client balances, limits, and settlement status' },
  { id: 'credits', label: 'Credit Accounts', icon: CreditCard, desc: 'Issued credit lines, interest rates, and due dates' },
  { id: 'collections', label: 'Collections Ledger', icon: IndianRupee, desc: 'Payment transactions grouped by payment method' },
  { id: 'overdue', label: 'Overdue & Risk Report', icon: AlertTriangle, desc: 'Accounts with pending overdue payments' },
  { id: 'cards', label: 'ICICI & Slice Cards', icon: Layers, desc: 'Dedicated bank cards billing history' },
];

export default function ReportsPage({ privacyMode = false }) {
  const [selectedType, setSelectedType] = useState('customers');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    generateReport(selectedType);
  }, [selectedType, dateRange]);

  const generateReport = async (type) => {
    setLoading(true);
    try {
      if (type === 'customers') {
        const res = await fetchCustomersApi();
        const list = res.data || [];
        setReportData({
          title: 'Customer Balances & Portfolio Report',
          summary: {
            totalClients: list.length,
            totalIssued: list.reduce((s, c) => s + (c.totalCreditIssued || 0), 0),
            totalCollected: list.reduce((s, c) => s + (c.totalPaid || 0), 0),
            totalOutstanding: list.reduce((s, c) => s + (c.totalOutstanding || 0), 0)
          },
          headers: ['Customer ID', 'Customer Name', 'Phone', 'Credit Limit', 'Total Issued', 'Total Paid', 'Outstanding', 'Status'],
          rows: list.map(c => [
            c.id,
            c.name,
            c.phone,
            formatINR(c.credit_limit || 0),
            formatINR(c.totalCreditIssued || 0),
            formatINR(c.totalPaid || 0),
            formatINR(c.totalOutstanding || 0),
            c.status
          ]),
          raw: list
        });
      } else if (type === 'credits') {
        const res = await fetchCreditsApi();
        const list = res.data || [];
        setReportData({
          title: 'Credit Accounts & Terms Report',
          summary: {
            totalAccounts: list.length,
            totalPrincipal: list.reduce((s, c) => s + (c.principal || 0), 0),
            totalPayable: list.reduce((s, c) => s + (c.totalPayable || 0), 0),
            totalOutstanding: list.reduce((s, c) => s + (c.outstanding || 0), 0)
          },
          headers: ['Credit ID', 'Credit Name', 'Customer', 'Issue Date', 'Due Date', 'Principal', 'Interest', 'Payable', 'Paid', 'Balance', 'Status'],
          rows: list.map(c => [
            c.id,
            c.credit_name,
            c.customer_name,
            c.credit_date,
            c.due_date,
            formatINR(c.principal),
            `${c.interestRate}%`,
            formatINR(c.totalPayable),
            formatINR(c.totalPaid),
            formatINR(c.outstanding),
            c.status
          ]),
          raw: list
        });
      } else if (type === 'collections') {
        const res = await fetchTransactionsApi();
        const list = (res.data || []).filter(t => t.status !== 'VOID');
        setReportData({
          title: 'Collections & Settlements Report',
          summary: {
            totalEntries: list.length,
            totalCollected: list.reduce((s, t) => s + (t.amount || 0), 0),
            upiTotal: list.filter(t => t.payment_method === 'UPI').reduce((s, t) => s + (t.amount || 0), 0),
            bankTotal: list.filter(t => t.payment_method === 'Bank Transfer').reduce((s, t) => s + (t.amount || 0), 0)
          },
          headers: ['Txn ID', 'Customer', 'Credit Line', 'Date', 'Method', 'Reference #', 'Amount (₹)', 'Status'],
          rows: list.map(t => [
            t.id,
            t.customer_name,
            t.credit_name,
            t.payment_date,
            t.payment_method,
            t.reference_number || 'Direct',
            formatINR(t.amount),
            t.status
          ]),
          raw: list
        });
      } else if (type === 'overdue') {
        const res = await fetchCreditsApi();
        const list = (res.data || []).filter(c => c.status === 'OVERDUE');
        setReportData({
          title: 'Overdue & Risk Analysis Report',
          summary: {
            overdueAccounts: list.length,
            totalOverdueAmount: list.reduce((s, c) => s + (c.outstanding || 0), 0)
          },
          headers: ['Credit ID', 'Customer', 'Phone', 'Credit Title', 'Due Date', 'Overdue Amount', 'Delay'],
          rows: list.map(c => [
            c.id,
            c.customer_name,
            c.customer_phone || '—',
            c.credit_name,
            c.due_date,
            formatINR(c.outstanding),
            c.dueInfo?.label || 'Overdue'
          ]),
          raw: list
        });
      } else if (type === 'cards') {
        const [iciciRes, sliceRes] = await Promise.all([fetchICICIPaymentsApi(), fetchSlicePaymentsApi()]);
        const icici = iciciRes.data || [];
        const slice = sliceRes.data || [];
        const combined = [
          ...icici.map(r => ({ account: 'ICICI Bank', month: r.billing_month, out: r.outstanding, paid: r.amount_paid, rem: r.remaining_outstanding, date: r.payment_date, status: r.status })),
          ...slice.map(r => ({ account: 'Slice Borrow', month: r.billing_month || r.month, out: r.opening_outstanding, paid: r.repayment_paid, rem: r.remaining_outstanding, date: r.payment_date, status: r.status }))
        ];
        setReportData({
          title: 'ICICI & Slice Credit Cards Billing Report',
          summary: {
            billingCycles: combined.length,
            totalPaid: combined.reduce((s, r) => s + (r.paid || 0), 0),
            totalRemaining: combined.reduce((s, r) => s + (r.rem || 0), 0)
          },
          headers: ['Account', 'Billing Month', 'Statement Balance', 'Amount Paid', 'Remaining', 'Payment Date', 'Status'],
          rows: combined.map(r => [
            r.account,
            r.month,
            formatINR(r.out),
            formatINR(r.paid),
            formatINR(r.rem),
            r.date || '—',
            r.status
          ]),
          raw: combined
        });
      }
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const headers = reportData.headers;
    const rows = reportData.rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PayTrack_${selectedType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#171717] tracking-tight">Financial Reports</h1>
          <p className="text-sm text-[#666] mt-0.5">Exportable statements, audit summaries, and risk analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={loading || !reportData}
            className="px-3.5 py-2 rounded-xl border border-[#EAEAEA] text-xs font-semibold text-[#171717] hover:bg-[#F5F5F5] flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            disabled={loading || !reportData}
            className="rl-btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 print:hidden">
        {REPORT_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedType === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-[#C62828] shadow-sm ring-1 ring-[#C62828]'
                  : 'bg-[#FAFAFA] border-[#EAEAEA] hover:bg-white hover:border-[#CCC]'
              }`}
            >
              <Icon size={18} className={isSelected ? 'text-[#C62828]' : 'text-[#666]'} />
              <p className="font-bold text-xs text-[#171717] mt-2">{cat.label}</p>
              <p className="text-[10px] text-[#999] mt-0.5 leading-tight">{cat.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Report Canvas */}
      <RedlineCard className="p-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size={32} />
            <p className="text-xs text-[#999]">Generating financial report…</p>
          </div>
        ) : !reportData ? (
          <div className="py-12 text-center text-xs text-[#999]">Select a report category above.</div>
        ) : (
          <div className="space-y-6">
            {/* Title & Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAEAEA] gap-3">
              <div>
                <h3 className="font-bold text-base text-[#171717]">{reportData.title}</h3>
                <p className="text-xs text-[#999] mt-0.5">
                  Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • PayTrack Certified
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs bg-[#FAFAFA] p-2.5 rounded-xl border border-[#EAEAEA]">
                {Object.entries(reportData.summary || {}).map(([key, val], idx) => (
                  <div key={idx} className="text-right">
                    <span className="text-[10px] text-[#999] uppercase block font-semibold">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <strong className="text-xs font-bold text-[#171717]">
                      {typeof val === 'number' && key.toLowerCase().includes('total') ? formatINR(val) : val}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#EAEAEA] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] text-[#666] border-b border-[#EAEAEA] font-semibold">
                    {reportData.headers.map((h, i) => (
                      <th key={i} className="py-3 px-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {reportData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={reportData.headers.length} className="py-8 text-center text-[#999]">
                        No records matching report filters.
                      </td>
                    </tr>
                  ) : (
                    reportData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#FAFAFA] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-3 px-3.5 whitespace-nowrap text-[#171717]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </RedlineCard>
    </div>
  );
}
