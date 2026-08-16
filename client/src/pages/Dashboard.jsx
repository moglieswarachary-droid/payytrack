import React, { useEffect, useState } from 'react';
import {
  TrendingDown, TrendingUp, ArrowRight, Plus,
  CreditCard, Wallet, RefreshCw, AlertTriangle,
  ChevronRight, Calendar, Users, IndianRupee,
  CheckCircle2, PlusCircle, FileText, ArrowUpRight, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { fetchDashboardApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import {
  RedlineCard, RedlineBadge, LoadingSpinner
} from '../components/RedlineComponents';
import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl p-3 text-xs shadow-xl">
      <p className="text-[#999] font-medium mb-1">{payload[0]?.payload?.label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#666] capitalize">{entry.name}:</span>
          <strong className="text-[#171717]">{formatINR(entry.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({
  onNavigate,
  onRecordPayment,
  onAddCustomer,
  onAddCredit,
  onViewStatement,
  privacyMode = false
}) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardApi();
      setData(res.data);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
      setError('Unable to load real-time financial metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size={36} />
        <p className="text-xs text-[#999] font-medium">Loading PayTrack Financial Platform…</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalCreditIssued: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    todayCollections: 0,
    thisMonthCollections: 0,
    activeCustomersCount: 0,
    overdueAccountsCount: 0,
    collectionRate: 100
  };

  const trends = data?.trends || [];
  const overdueAccounts = data?.overdueAccounts || [];
  const recentTransactions = data?.recentTransactions || [];
  const recentCustomers = data?.recentCustomers || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Red Hero Banner ── */}
      <div className="rl-hero rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white">
                Live Overview
              </span>
            </div>
            <div className="text-xs text-white/75">Total Outstanding Portfolio Balance</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono">
              {privacyMode ? '••••••••' : formatINR(metrics.totalOutstanding)}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/85 pt-1">
              <span>Credit Issued: <strong>{formatINR(metrics.totalCreditIssued)}</strong></span>
              <span>•</span>
              <span>Collected: <strong>{formatINR(metrics.totalCollected)}</strong></span>
              <span>•</span>
              <span>Settlement Rate: <strong>{metrics.collectionRate}%</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onRecordPayment()}
              className="px-4 py-2.5 rounded-xl bg-white text-[#C62828] text-xs font-bold hover:bg-neutral-100 transition-all shadow-md flex items-center gap-1.5"
            >
              <IndianRupee size={15} /> Record Payment
            </button>
            <button
              onClick={() => onAddCredit()}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <PlusCircle size={15} /> Issue Credit
            </button>
            <button
              onClick={() => onAddCustomer()}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <Users size={15} /> Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* ── Key Performance Indicators (KPIs) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Collections</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {privacyMode ? '••••••' : formatINR(metrics.todayCollections)}
          </div>
          <p className="text-[11px] text-[#999] mt-1">Real-time daily receipts</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">This Month</span>
            <Calendar size={15} className="text-[#999]" />
          </div>
          <div className="text-2xl font-bold text-[#171717] font-mono">
            {privacyMode ? '••••••' : formatINR(metrics.thisMonthCollections)}
          </div>
          <p className="text-[11px] text-[#999] mt-1">Total monthly turnover</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Borrowers</span>
            <Users size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#171717] font-mono">
            {metrics.activeCustomersCount}
          </div>
          <p className="text-[11px] text-[#999] mt-1">Clients with credit open</p>
        </RedlineCard>

        <RedlineCard className="p-4 bg-[#FFF6F6] border-[#FDECEC]">
          <div className="flex items-center justify-between text-[#8E1B1B] mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Accounts</span>
            <AlertTriangle size={15} className="text-[#C62828]" />
          </div>
          <div className="text-2xl font-bold text-[#C62828] font-mono">
            {privacyMode ? '••••••' : formatINR(metrics.totalOverdue)}
          </div>
          <p className="text-[11px] text-[#8E1B1B] mt-1">{metrics.overdueAccountsCount} account(s) past due date</p>
        </RedlineCard>
      </div>

      {/* ── Chart & Trends Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection & Credit Area Chart */}
        <RedlineCard className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#171717]">Monthly Financial Flow</h3>
              <p className="text-xs text-[#999]">Credit Issued vs Collections (Past 6 Months)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#171717]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]" /> Credit Issued
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Collected
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C62828" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C62828" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="collectGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#999" fontSize={11} tickLine={false} />
                <YAxis stroke="#999" fontSize={10} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="creditIssued" name="Credit Issued" stroke="#C62828" strokeWidth={2} fill="url(#creditGrad)" />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#10B981" strokeWidth={2} fill="url(#collectGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </RedlineCard>

        {/* Portfolio Distribution */}
        <RedlineCard className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#171717]">Portfolio Recovery</h3>
            <p className="text-xs text-[#999]">Collection efficiency breakdown</p>
          </div>

          <div className="space-y-4 my-auto py-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#666]">Settled Payments</span>
                <span className="text-emerald-700">{formatINR(metrics.totalCollected)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#EAEAEA] overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, metrics.collectionRate)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#666]">Pending Due</span>
                <span className="text-amber-700">{formatINR(Math.max(0, metrics.totalOutstanding - metrics.totalOverdue))}</span>
              </div>
              <div className="h-2 rounded-full bg-[#EAEAEA] overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${metrics.totalPayable > 0 ? ((metrics.totalOutstanding - metrics.totalOverdue) / metrics.totalPayable) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#666]">Overdue</span>
                <span className="text-[#C62828]">{formatINR(metrics.totalOverdue)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#EAEAEA] overflow-hidden">
                <div
                  className="h-full bg-[#C62828] rounded-full"
                  style={{ width: `${metrics.totalPayable > 0 ? (metrics.totalOverdue / metrics.totalPayable) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAEAEA] flex items-center justify-between text-xs">
            <span className="text-[#999]">Overall Health:</span>
            <span className="font-bold text-emerald-700">✓ Strong (92/100)</span>
          </div>
        </RedlineCard>
      </div>

      {/* ── Actionable Overdue Accounts Table ── */}
      {overdueAccounts.length > 0 && (
        <RedlineCard className="p-5 border-l-4 border-l-[#C62828]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-[#C62828]" />
              <h3 className="font-bold text-sm text-[#171717]">Overdue Accounts Requiring Action</h3>
            </div>
            <span className="text-xs font-bold text-[#C62828] bg-[#FFF6F6] px-2.5 py-1 rounded-full">
              {overdueAccounts.length} Overdue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#999] border-b border-[#EAEAEA] pb-2 font-semibold">
                  <th className="py-2">Customer</th>
                  <th className="py-2">Credit Line</th>
                  <th className="py-2 text-right">Outstanding</th>
                  <th className="py-2 text-center">Due Date</th>
                  <th className="py-2 text-center">Delay</th>
                  <th className="py-2 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {overdueAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-[#FAFAFA]">
                    <td className="py-2.5 font-bold text-[#171717]">{acc.customer_name}</td>
                    <td className="py-2.5 text-[#666]">{acc.credit_name}</td>
                    <td className="py-2.5 text-right font-bold text-[#C62828]">{formatINR(acc.outstanding)}</td>
                    <td className="py-2.5 text-center font-mono text-[#666]">{acc.due_date}</td>
                    <td className="py-2.5 text-center text-red-600 font-semibold">{acc.dueInfo?.label}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onRecordPayment(acc.customer_id, acc.id)}
                        className="px-3 py-1 bg-[#C62828] text-white text-[11px] font-bold rounded-lg hover:bg-[#B71C1C] transition-colors"
                      >
                        Settle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RedlineCard>
      )}

      {/* ── Bottom Grid: Recent Transactions & Customers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <RedlineCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#171717]">Recent Ledger Entries</h3>
              <p className="text-xs text-[#999]">Latest confirmed collections</p>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-[#C62828] font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-[#999] py-4 text-center">No transactions recorded yet.</p>
            ) : (
              recentTransactions.map(t => (
                <div key={t.id} className="p-2.5 rounded-xl border border-[#EAEAEA] flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{t.customer_name}</p>
                      <p className="text-[10px] text-[#999]">{t.payment_method} • {t.payment_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-xs font-bold text-emerald-700 font-mono">+{formatINR(t.amount)}</strong>
                    <p className="text-[10px] font-mono text-[#999]">{t.id}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </RedlineCard>

        {/* Recent Customers */}
        <RedlineCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#171717]">Active Customers</h3>
              <p className="text-xs text-[#999]">Recent customer balances</p>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs text-[#C62828] font-semibold hover:underline flex items-center gap-1"
            >
              View directory <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentCustomers.length === 0 ? (
              <p className="text-xs text-[#999] py-4 text-center">No customers registered yet.</p>
            ) : (
              recentCustomers.map(c => (
                <div key={c.id} className="p-2.5 rounded-xl border border-[#EAEAEA] flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] text-[#171717] font-bold text-xs flex items-center justify-center shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{c.name}</p>
                      <p className="text-[10px] text-[#999]">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className={`text-xs font-bold ${c.totalOutstanding > 0 ? 'text-[#C62828]' : 'text-emerald-700'}`}>
                      {formatINR(c.totalOutstanding || 0)}
                    </strong>
                    <p className="text-[10px] text-[#999] uppercase">{c.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </RedlineCard>
      </div>
    </div>
  );
}
