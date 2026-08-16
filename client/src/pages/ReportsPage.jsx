import React, { useState } from 'react';
import { FileText, Download, CreditCard, Wallet, Layers } from 'lucide-react';
import { fetchICICIPaymentsApi, fetchSlicePaymentsApi } from '../services/api';
import { formatCurrency, formatMonthName, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/formatters';
import { RedlineCard, PageHeader, RedlineBadge } from '../components/RedlineComponents';

const REPORT_TYPES = [
  { id: 'combined',  label: 'Combined',    icon: Layers,     desc: 'All accounts combined' },
  { id: 'icici',     label: 'ICICI Card',  icon: CreditCard, desc: 'ICICI billing records' },
  { id: 'slice',     label: 'Slice',       icon: Wallet,     desc: 'Slice repayment records' },
];

export default function ReportsPage({ privacyMode }) {
  const [type, setType]       = useState('combined');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const [iciciRes, sliceRes] = await Promise.all([
        fetchICICIPaymentsApi(),
        fetchSlicePaymentsApi(),
      ]);
      const icici = iciciRes.data || [];
      const slice = sliceRes.data || [];

      let reportData = [];
      if (type === 'icici' || type === 'combined') {
        reportData.push(...icici.map(r => ({
          Account:      'ICICI',
          Month:        formatMonthName(r.billing_month),
          Outstanding:  r.outstanding,
          Paid:         r.amount_paid,
          Remaining:    r.remaining_outstanding,
          'Credit Limit': r.credit_limit_at_payment,
          Utilization:  `${r.credit_utilization || 0}%`,
          'Due Date':   formatDate(r.due_date),
          Status:       r.status,
          Notes:        r.notes || '',
        })));
      }
      if (type === 'slice' || type === 'combined') {
        reportData.push(...slice.map(r => ({
          Account:      'Slice',
          Month:        formatMonthName(r.month || r.billing_month),
          Outstanding:  r.opening_outstanding,
          Paid:         r.repayment_paid,
          Remaining:    r.remaining_outstanding,
          'Credit Limit': '—',
          Utilization:  `${(r.repayment_progress || 0).toFixed(0)}%`,
          'Due Date':   formatDate(r.due_date),
          Status:       r.status,
          Notes:        r.notes || '',
        })));
      }

      setPreview(reportData);
    } catch {
      alert('Unable to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!preview?.length) return;
    exportToCSV(`paytrack-report-${type}-${new Date().toISOString().slice(0,10)}.csv`, preview);
  };

  const downloadJSON = () => {
    if (!preview?.length) return;
    const blob = new Blob([JSON.stringify(preview, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `paytrack-report-${type}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Generate and export your payment data"
      />

      {/* Report type selector */}
      <RedlineCard className="p-5">
        <h3 className="text-sm font-semibold text-[#171717] mb-3">Report type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {REPORT_TYPES.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => { setType(id); setPreview(null); }}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                type === id
                  ? 'border-[#C62828] bg-[#FFF6F6]'
                  : 'border-[#EAEAEA] hover:border-[#C8C8C8]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                type === id ? 'bg-[#FDECEC]' : 'bg-[#FAFAFA]'
              }`}>
                <Icon size={16} className={type === id ? 'text-[#C62828]' : 'text-[#999]'} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${type === id ? 'text-[#C62828]' : 'text-[#171717]'}`}>{label}</p>
                <p className="text-xs text-[#999]">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={generateReport}
            disabled={loading}
            className="rl-btn-primary text-sm"
          >
            {loading ? 'Generating...' : 'Generate report'}
          </button>
        </div>
      </RedlineCard>

      {/* Preview table */}
      {preview && (
        <RedlineCard className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Report preview</h3>
              <p className="text-xs text-[#999] mt-0.5">{preview.length} records</p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadCSV} className="rl-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                <Download size={13} /> CSV
              </button>
              <button onClick={downloadJSON} className="rl-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                <Download size={13} /> JSON
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="rl-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Month</th>
                  <th>Outstanding</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        row.Account === 'ICICI' ? 'text-orange-600' : 'text-purple-600'
                      }`}>
                        {row.Account === 'ICICI' ? <CreditCard size={12} /> : <Wallet size={12} />}
                        {row.Account}
                      </span>
                    </td>
                    <td className="font-medium">{row.Month}</td>
                    <td className={privacyMode ? 'blur-sm' : ''}>{formatCurrency(row.Outstanding)}</td>
                    <td className={`text-green-600 font-medium ${privacyMode ? 'blur-sm' : ''}`}>{formatCurrency(row.Paid)}</td>
                    <td className={`text-[#C62828] font-medium ${privacyMode ? 'blur-sm' : ''}`}>{formatCurrency(row.Remaining)}</td>
                    <td>{row.Utilization}</td>
                    <td><RedlineBadge status={row.Status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 20 && (
              <p className="text-xs text-[#999] text-center py-3">
                Showing 20 of {preview.length} rows. Export to see all.
              </p>
            )}
          </div>
        </RedlineCard>
      )}
    </div>
  );
}
