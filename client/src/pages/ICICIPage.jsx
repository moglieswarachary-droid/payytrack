import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, Copy, Edit2, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchICICIPaymentsApi, duplicateICICIPaymentApi } from '../services/api';
import { formatCurrency, formatMonthName, formatDate } from '../utils/formatters';
import {
  RedlineCard, RedlineBadge, RedlineProgress,
  RedlineSkeleton, RedlineEmptyState, PageHeader, RedlineKV
} from '../components/RedlineComponents';

function UtilizationMeter({ value = 0, limit = 0, used = 0 }) {
  const pct = Math.min(100, value || 0);
  const color = pct > 75 ? 'red' : pct > 50 ? 'amber' : 'green';
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold text-[#171717] tracking-tight">{pct.toFixed(1)}%</span>
          <span className="text-sm text-[#666] ml-2">credit used</span>
        </div>
        <span className={`text-sm font-medium ${pct > 75 ? 'text-[#C62828]' : pct > 50 ? 'text-amber-600' : 'text-green-600'}`}>
          {pct > 75 ? 'High' : pct > 50 ? 'Moderate' : 'Healthy'}
        </span>
      </div>
      <div className="rl-progress-track" style={{ height: 8 }}>
        <div className={`rl-progress-bar ${color}`} style={{ width: `${pct}%`, height: '100%' }} />
      </div>
      <div className="flex justify-between text-xs text-[#999]">
        <span>{formatCurrency(used)} used</span>
        <span>{formatCurrency(limit)} limit</span>
      </div>
      <div className="pt-1">
        <span className="text-xs text-[#666]">Available credit: </span>
        <span className="text-sm font-semibold text-green-600">{formatCurrency(limit - used)}</span>
      </div>
    </div>
  );
}

export default function ICICIPage({ onOpenAddModal, onEditRecord, onDeleteRecord, privacyMode }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = () => {
    setLoading(true);
    fetchICICIPaymentsApi()
      .then(res => setRecords(res.data || []))
      .catch(() => setError('Unable to load ICICI records.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDuplicate = async (id) => {
    try { await duplicateICICIPaymentApi(id); load(); }
    catch { alert('Unable to duplicate record.'); }
  };

  const latest = records[0];
  const prev   = records[1];
  const util   = latest?.credit_utilization || 0;

  /* Credit limit history — detect changes */
  const limitHistory = records.reduce((acc, r) => {
    const lim = r.credit_limit_at_payment;
    if (!acc.length || acc[acc.length - 1].limit !== lim) {
      acc.push({ month: r.billing_month, limit: lim });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
        <RedlineSkeleton height={28} width={200} />
        <RedlineSkeleton height={140} className="rounded-2xl" />
        <RedlineSkeleton height={240} className="rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader
        title="ICICI Credit Card"
        subtitle="Billing cycles, payments, and credit utilization"
        action={
          <button onClick={() => onOpenAddModal('icici')} className="rl-btn-primary text-sm">
            <Plus size={15} /> Add Record
          </button>
        }
      />

      {/* ── Top summary ── */}
      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Outstanding + paid */}
          <RedlineCard className="p-5 sm:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#999] mb-1">Current outstanding</p>
                <p className={`text-2xl font-bold text-[#171717] tracking-tight ${privacyMode ? 'blur-sm' : ''}`}>
                  {formatCurrency(latest.outstanding)}
                </p>
                {prev && (
                  <div className="flex items-center gap-1 mt-1">
                    {latest.outstanding < prev.outstanding
                      ? <TrendingDown size={12} className="text-green-600" />
                      : <TrendingUp size={12} className="text-[#C62828]" />
                    }
                    <span className="text-xs text-[#999]">
                      {formatCurrency(Math.abs(latest.outstanding - prev.outstanding))} vs last month
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-[#999] mb-1">Amount paid</p>
                <p className={`text-2xl font-bold text-green-600 tracking-tight ${privacyMode ? 'blur-sm' : ''}`}>
                  {formatCurrency(latest.amount_paid)}
                </p>
                <p className="text-xs text-[#999] mt-1">{formatMonthName(latest.billing_month)}</p>
              </div>
              <div>
                <p className="text-xs text-[#999] mb-1">Remaining</p>
                <p className={`text-2xl font-bold text-[#C62828] tracking-tight ${privacyMode ? 'blur-sm' : ''}`}>
                  {formatCurrency(latest.remaining_outstanding)}
                </p>
                <RedlineBadge status={latest.status} className="mt-1" />
              </div>
            </div>

            <hr className="rl-divider my-4" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-[#999]">Credit limit</p>
                <p className="font-semibold mt-0.5">{formatCurrency(latest.credit_limit_at_payment)}</p>
              </div>
              <div>
                <p className="text-xs text-[#999]">Available limit</p>
                <p className="font-semibold text-green-600 mt-0.5">{formatCurrency(latest.available_limit_after_payment)}</p>
              </div>
              <div>
                <p className="text-xs text-[#999]">Due date</p>
                <p className="font-semibold mt-0.5">{formatDate(latest.due_date)}</p>
              </div>
              <div>
                <p className="text-xs text-[#999]">Payment date</p>
                <p className="font-semibold mt-0.5">{formatDate(latest.payment_date) || '—'}</p>
              </div>
            </div>
          </RedlineCard>

          {/* Utilization ring */}
          <RedlineCard className="p-5">
            <p className="text-xs text-[#999] mb-4 font-medium uppercase tracking-wide">Credit utilization</p>
            <UtilizationMeter
              value={util}
              limit={latest.credit_limit_at_payment}
              used={latest.outstanding}
            />
          </RedlineCard>
        </div>
      )}

      {/* ── Credit limit history ── */}
      {limitHistory.length > 0 && (
        <RedlineCard className="p-5">
          <h3 className="text-sm font-semibold text-[#171717] mb-4">Credit limit history</h3>
          <div className="flex flex-wrap gap-3">
            {limitHistory.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-center px-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA]">
                  <p className="text-xs text-[#999]">{formatMonthName(item.month).split(' ')[0]}</p>
                  <p className="text-sm font-bold text-[#171717] mt-0.5">{formatCurrency(item.limit)}</p>
                </div>
                {i < limitHistory.length - 1 && (
                  <span className="text-[#EAEAEA] text-lg">→</span>
                )}
              </div>
            ))}
          </div>
        </RedlineCard>
      )}

      {/* ── Records table ── */}
      <RedlineCard className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <h3 className="text-sm font-semibold text-[#171717]">Billing records</h3>
          <button onClick={load} className="rl-btn-ghost text-xs p-2 rounded-lg">
            <RefreshCw size={13} />
          </button>
        </div>

        {records.length === 0 ? (
          <RedlineEmptyState
            icon={CreditCard}
            title="No ICICI records yet"
            description="Add your first billing cycle to start tracking."
            action={() => onOpenAddModal('icici')}
            actionLabel="Add ICICI Record"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="rl-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Outstanding</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Limit</th>
                    <th>Utilization</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(item => {
                    const util = item.credit_utilization || 0;
                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="font-semibold text-[#171717]">{formatMonthName(item.billing_month)}</span>
                          {item.difference_flag && (
                            <span className="block text-[10px] text-amber-600 mt-0.5">⚠ Limit discrepancy</span>
                          )}
                        </td>
                        <td className={privacyMode ? 'blur-sm' : ''}>{formatCurrency(item.outstanding)}</td>
                        <td className={`font-semibold text-green-600 ${privacyMode ? 'blur-sm' : ''}`}>{formatCurrency(item.amount_paid)}</td>
                        <td className={`font-semibold text-[#C62828] ${privacyMode ? 'blur-sm' : ''}`}>{formatCurrency(item.remaining_outstanding)}</td>
                        <td className={privacyMode ? 'blur-sm' : ''}>{formatCurrency(item.credit_limit_at_payment)}</td>
                        <td>
                          <span className={`font-semibold ${util > 75 ? 'text-[#C62828]' : util > 50 ? 'text-amber-600' : 'text-green-600'}`}>
                            {util}%
                          </span>
                        </td>
                        <td><RedlineBadge status={item.status} /></td>
                        <td>
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => handleDuplicate(item.id)} title="Duplicate" className="rl-btn-ghost p-2 rounded-lg">
                              <Copy size={13} />
                            </button>
                            <button onClick={() => onEditRecord(item, 'icici')} title="Edit" className="rl-btn-ghost p-2 rounded-lg">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => onDeleteRecord(item, 'icici')} title="Delete" className="rl-btn-ghost p-2 rounded-lg text-[#C62828] hover:bg-[#FFF6F6]">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#EAEAEA]">
              {records.map(item => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#171717]">{formatMonthName(item.billing_month)}</span>
                    <RedlineBadge status={item.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[#999]">Outstanding</p>
                      <p className="font-semibold">{formatCurrency(item.outstanding)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#999]">Paid</p>
                      <p className="font-semibold text-green-600">{formatCurrency(item.amount_paid)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => onEditRecord(item, 'icici')} className="rl-btn-secondary text-xs flex-1 py-2">Edit</button>
                    <button onClick={() => onDeleteRecord(item, 'icici')} className="rl-btn-ghost text-xs text-[#C62828] px-3">Delete</button>
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
