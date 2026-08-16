import React, { useEffect, useState } from 'react';
import { Wallet, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { fetchSlicePaymentsApi } from '../services/api';
import { formatCurrency, formatMonthName, formatDate } from '../utils/formatters';
import {
  RedlineCard, RedlineBadge, RedlineProgress,
  RedlineSkeleton, RedlineEmptyState, PageHeader
} from '../components/RedlineComponents';

export default function SlicePage({ onOpenAddModal, onEditRecord, onDeleteRecord, privacyMode }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = () => {
    setLoading(true);
    fetchSlicePaymentsApi()
      .then(res => setRecords(res.data || []))
      .catch(() => setError('Unable to load Slice records.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const latest = records[0];

  /* Compute totals */
  const totalRepaid = records.reduce((s, r) => s + (r.repayment_paid || 0), 0);
  const originalDebt = records.length ? records[records.length - 1].opening_outstanding || 0 : 0;
  const repayPct = originalDebt > 0 ? Math.min(100, (totalRepaid / originalDebt) * 100) : (latest?.repayment_progress || 0);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
        <RedlineSkeleton height={28} width={160} />
        <RedlineSkeleton height={160} className="rounded-2xl" />
        <RedlineSkeleton height={240} className="rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader
        title="Slice"
        subtitle="Repayment tracker — outstanding balance and payment history"
        action={
          <button onClick={() => onOpenAddModal('slice')} className="rl-btn-primary text-sm">
            <Plus size={15} /> Add Record
          </button>
        }
      />

      {/* ── Summary ── */}
      {latest ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Outstanding */}
          <RedlineCard className="p-5">
            <p className="text-xs text-[#999] mb-2">Current outstanding</p>
            <p className={`text-3xl font-bold text-[#171717] tracking-tight ${privacyMode ? 'blur-sm' : ''}`}>
              {formatCurrency(latest.remaining_outstanding || latest.opening_outstanding)}
            </p>
            <p className="text-xs text-[#999] mt-1">{formatMonthName(latest.month)}</p>
            <div className="mt-3">
              <RedlineBadge status={latest.status} />
            </div>
          </RedlineCard>

          {/* Repaid */}
          <RedlineCard className="p-5">
            <p className="text-xs text-[#999] mb-2">Total repaid</p>
            <p className={`text-3xl font-bold text-green-600 tracking-tight ${privacyMode ? 'blur-sm' : ''}`}>
              {formatCurrency(totalRepaid)}
            </p>
            <p className="text-xs text-[#999] mt-1">Across {records.length} payment{records.length !== 1 ? 's' : ''}</p>
            <div className="mt-3 text-xs text-[#666]">
              Due {formatDate(latest.due_date)}
            </div>
          </RedlineCard>

          {/* Progress */}
          <RedlineCard className="p-5">
            <p className="text-xs text-[#999] mb-3">Repayment progress</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-[#171717] tracking-tight">{repayPct.toFixed(0)}%</span>
              <span className="text-sm text-[#999] mb-1">cleared</span>
            </div>
            <div className="rl-progress-track" style={{ height: 8 }}>
              <div className="rl-progress-bar green" style={{ width: `${repayPct}%`, height: '100%' }} />
            </div>
            {originalDebt > 0 && (
              <div className="flex justify-between text-xs text-[#999] mt-2">
                <span>{formatCurrency(totalRepaid)} paid</span>
                <span>{formatCurrency(originalDebt)} original</span>
              </div>
            )}
          </RedlineCard>
        </div>
      ) : null}

      {/* ── Records ── */}
      <RedlineCard className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <h3 className="text-sm font-semibold text-[#171717]">Repayment records</h3>
          <button onClick={load} className="rl-btn-ghost p-2 rounded-lg text-[#999]">
            <RefreshCw size={13} />
          </button>
        </div>

        {records.length === 0 ? (
          <RedlineEmptyState
            icon={Wallet}
            title="No Slice records yet"
            description="Add your first Slice repayment record to start tracking."
            action={() => onOpenAddModal('slice')}
            actionLabel="Add Slice Record"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="rl-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Opening</th>
                    <th>Repaid</th>
                    <th>Remaining</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span className="font-semibold text-[#171717]">{formatMonthName(item.month)}</span>
                        <span className="block text-xs text-[#999] mt-0.5">Due {formatDate(item.due_date)}</span>
                      </td>
                      <td className={privacyMode ? 'blur-sm' : ''}>{formatCurrency(item.opening_outstanding)}</td>
                      <td className={`font-semibold text-green-600 ${privacyMode ? 'blur-sm' : ''}`}>
                        {formatCurrency(item.repayment_paid)}
                      </td>
                      <td className={`font-semibold text-[#C62828] ${privacyMode ? 'blur-sm' : ''}`}>
                        {formatCurrency(item.remaining_outstanding)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="rl-progress-track w-16">
                            <div
                              className="rl-progress-bar green"
                              style={{ width: `${item.repayment_progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-[#666]">
                            {(item.repayment_progress || 0).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td><RedlineBadge status={item.status} /></td>
                      <td>
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => onEditRecord(item, 'slice')} title="Edit" className="rl-btn-ghost p-2 rounded-lg">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => onDeleteRecord(item, 'slice')} title="Delete" className="rl-btn-ghost p-2 rounded-lg text-[#C62828] hover:bg-[#FFF6F6]">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-[#EAEAEA]">
              {records.map(item => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#171717]">{formatMonthName(item.month)}</span>
                    <RedlineBadge status={item.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[#999]">Repaid</p>
                      <p className="font-semibold text-green-600">{formatCurrency(item.repayment_paid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#999]">Remaining</p>
                      <p className="font-semibold text-[#C62828]">{formatCurrency(item.remaining_outstanding)}</p>
                    </div>
                  </div>
                  <RedlineProgress value={item.repayment_progress || 0} color="green" showValue />
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => onEditRecord(item, 'slice')} className="rl-btn-secondary text-xs flex-1 py-2">Edit</button>
                    <button onClick={() => onDeleteRecord(item, 'slice')} className="rl-btn-ghost text-xs text-[#C62828] px-3">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </RedlineCard>
    </div>
  );
}
