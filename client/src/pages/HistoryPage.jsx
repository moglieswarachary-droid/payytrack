import React, { useEffect, useState } from 'react';
import { Clock, Search, Filter, Edit2, Trash2, CreditCard, Wallet, Lock } from 'lucide-react';
import { fetchICICIPaymentsApi, fetchSlicePaymentsApi } from '../services/api';
import { formatCurrency, formatMonthName, formatDate } from '../utils/formatters';
import {
  RedlineCard, RedlineBadge, RedlineSkeleton,
  RedlineEmptyState, PageHeader
} from '../components/RedlineComponents';

function groupByYear(records) {
  return records.reduce((acc, r) => {
    const year = (r.billing_month || r.month || '2026').slice(0, 4);
    if (!acc[year]) acc[year] = [];
    acc[year].push(r);
    return acc;
  }, {});
}

export default function HistoryPage({ onEditRecord, onDeleteRecord, privacyMode }) {
  const [icici, setIcici] = useState([]);
  const [slice, setSlice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lockedMonths, setLockedMonths] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchICICIPaymentsApi(), fetchSlicePaymentsApi()])
      .then(([i, s]) => { setIcici(i.data || []); setSlice(s.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleLock = (month) => {
    setLockedMonths(prev => {
      const next = new Set(prev);
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  };

  /* Merge and filter */
  const all = [
    ...icici.map(r => ({ ...r, _type: 'icici', _month: r.billing_month })),
    ...slice.map(r => ({ ...r, _type: 'slice', _month: r.month || r.billing_month })),
  ].sort((a, b) => (b._month > a._month ? 1 : -1));

  const filtered = all.filter(r => {
    if (filter !== 'all' && r._type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r._month || '').includes(q) || (r.notes || '').toLowerCase().includes(q)
        || (r.status || '').toLowerCase().includes(q);
    }
    return true;
  });

  /* Group by month */
  const grouped = filtered.reduce((acc, r) => {
    const key = r._month || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const months = Object.keys(grouped).sort((a, b) => b > a ? 1 : -1);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-4 max-w-4xl mx-auto">
        <RedlineSkeleton height={28} width={160} />
        {[1,2,3].map(i => <RedlineSkeleton key={i} height={80} className="rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-5 max-w-4xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader
        title="Payment History"
        subtitle="All ICICI and Slice records"
      />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            placeholder="Search month, notes, status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rl-input pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {[['all','All'],['icici','ICICI'],['slice','Slice']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === val
                  ? 'bg-[#C62828] text-white'
                  : 'bg-white border border-[#EAEAEA] text-[#666] hover:border-[#C8C8C8]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {months.length === 0 ? (
        <RedlineEmptyState
          icon={Clock}
          title="No records yet"
          description="Add ICICI or Slice payments to see them here."
        />
      ) : (
        <div className="space-y-6">
          {months.map(month => {
            const monthRecords = grouped[month];
            const isLocked = lockedMonths.has(month);
            return (
              <div key={month}>
                {/* Month heading */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xs font-bold text-[#999] uppercase tracking-widest">
                    {formatMonthName(month)}
                  </h3>
                  <hr className="flex-1 border-[#EAEAEA]" />
                  <button
                    onClick={() => toggleLock(month)}
                    title={isLocked ? 'Unlock month' : 'Lock month'}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                      isLocked
                        ? 'text-[#C62828] bg-[#FFF6F6]'
                        : 'text-[#999] hover:text-[#666]'
                    }`}
                  >
                    <Lock size={11} />
                    {isLocked ? 'Locked' : 'Lock'}
                  </button>
                </div>

                {/* Desktop table */}
                <RedlineCard className="overflow-hidden hidden md:block">
                  <table className="rl-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Outstanding</th>
                        <th>Paid</th>
                        <th>Remaining</th>
                        <th>Due date</th>
                        <th>Status</th>
                        {!isLocked && <th></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {monthRecords.map(r => (
                        <tr key={r.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              {r._type === 'icici'
                                ? <CreditCard size={14} className="text-orange-500" />
                                : <Wallet size={14} className="text-purple-500" />
                              }
                              <span className="font-medium">{r._type === 'icici' ? 'ICICI' : 'Slice'}</span>
                            </div>
                          </td>
                          <td className={privacyMode ? 'blur-sm' : ''}>
                            {formatCurrency(r._type === 'icici' ? r.outstanding : r.opening_outstanding)}
                          </td>
                          <td className={`text-green-600 font-medium ${privacyMode ? 'blur-sm' : ''}`}>
                            {formatCurrency(r._type === 'icici' ? r.amount_paid : r.repayment_paid)}
                          </td>
                          <td className={`text-[#C62828] font-medium ${privacyMode ? 'blur-sm' : ''}`}>
                            {formatCurrency(r._type === 'icici' ? r.remaining_outstanding : r.remaining_outstanding)}
                          </td>
                          <td className="text-[#666]">{formatDate(r.due_date)}</td>
                          <td><RedlineBadge status={r.status} /></td>
                          {!isLocked && (
                            <td>
                              <div className="flex items-center gap-1 justify-end">
                                <button onClick={() => onEditRecord(r, r._type)} className="rl-btn-ghost p-2 rounded-lg">
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => onDeleteRecord(r, r._type)} className="rl-btn-ghost p-2 rounded-lg text-[#C62828] hover:bg-[#FFF6F6]">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </RedlineCard>

                {/* Mobile cards */}
                <div className="md:hidden space-y-2">
                  {monthRecords.map(r => (
                    <RedlineCard key={r.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {r._type === 'icici'
                            ? <CreditCard size={15} className="text-orange-500" />
                            : <Wallet size={15} className="text-purple-500" />
                          }
                          <span className="text-sm font-semibold">{r._type === 'icici' ? 'ICICI Card' : 'Slice'}</span>
                        </div>
                        <RedlineBadge status={r.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-[#999]">Paid</p>
                          <p className="font-semibold text-green-600">{formatCurrency(r._type === 'icici' ? r.amount_paid : r.repayment_paid)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#999]">Remaining</p>
                          <p className="font-semibold text-[#C62828]">{formatCurrency(r.remaining_outstanding)}</p>
                        </div>
                      </div>
                      {!isLocked && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-[#EAEAEA]">
                          <button onClick={() => onEditRecord(r, r._type)} className="rl-btn-secondary flex-1 text-xs py-1.5">Edit</button>
                          <button onClick={() => onDeleteRecord(r, r._type)} className="rl-btn-ghost text-xs text-[#C62828] px-3">Delete</button>
                        </div>
                      )}
                      {isLocked && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#EAEAEA] text-xs text-[#999]">
                          <Lock size={11} /> Month locked — read only
                        </div>
                      )}
                    </RedlineCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
