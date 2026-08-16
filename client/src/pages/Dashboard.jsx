import React, { useEffect, useState } from 'react';
import {
  TrendingDown, TrendingUp, ArrowRight, Plus,
  CreditCard, Wallet, RefreshCw, AlertTriangle,
  ChevronRight, Calendar, Minus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { fetchDashboardApi, fetchAnalyticsApi } from '../services/api';
import { formatCurrency, formatMonthName, formatDate } from '../utils/formatters';
import {
  RedlineCard, RedlineBadge, RedlineProgress,
  RedlineSkeleton, RedlineEmptyState, RedlineAlert
} from '../components/RedlineComponents';
import { useAuth } from '../context/AuthContext';

/* ── Greeting ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Custom Tooltip for chart ── */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rl-card px-3 py-2 text-xs shadow-lg">
      <p className="text-[#666] mb-1">{payload[0]?.payload?.month}</p>
      <p className="font-semibold text-[#171717]">{formatCurrency(payload[0]?.value)}</p>
    </div>
  );
}

/* ── Account card (ICICI / Slice) ── */
function AccountSummaryCard({ title, type, outstanding, paid, limit, available, utilization, progress, status, dueDate, daysUntilDue, onNavigate }) {
  const isICICI = type === 'icici';
  const utilizationColor = utilization > 75 ? 'red' : utilization > 50 ? 'amber' : 'green';

  return (
    <RedlineCard className="p-5 flex flex-col gap-4" hoverable>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isICICI ? 'bg-orange-50' : 'bg-purple-50'
          }`}>
            {isICICI
              ? <CreditCard size={16} className="text-orange-600" />
              : <Wallet size={16} className="text-purple-600" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-[#171717]">{title}</p>
            {status && <RedlineBadge status={status} className="mt-0.5" />}
          </div>
        </div>
        <button
          onClick={onNavigate}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#999] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Primary number */}
      <div>
        <div className="text-[28px] font-bold text-[#171717] leading-none tracking-tight font-[tabular-nums]">
          {formatCurrency(outstanding)}
        </div>
        <div className="text-xs text-[#999] mt-1">Outstanding</div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {isICICI ? (
          <>
            <div>
              <p className="text-xs text-[#999]">Credit limit</p>
              <p className="text-sm font-semibold text-[#171717] mt-0.5">{formatCurrency(limit)}</p>
            </div>
            <div>
              <p className="text-xs text-[#999]">Available</p>
              <p className="text-sm font-semibold text-green-600 mt-0.5">{formatCurrency(available)}</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-[#999]">Repaid</p>
              <p className="text-sm font-semibold text-[#171717] mt-0.5">{formatCurrency(paid)}</p>
            </div>
            <div>
              <p className="text-xs text-[#999]">Progress</p>
              <p className="text-sm font-semibold text-[#171717] mt-0.5">{progress?.toFixed(0)}%</p>
            </div>
          </>
        )}
      </div>

      {/* Progress bar (ICICI = utilization, Slice = repayment) */}
      {isICICI ? (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-[#666]">Credit used</span>
            <span className="text-xs font-semibold text-[#171717]">{utilization?.toFixed(1)}%</span>
          </div>
          <div className="rl-progress-track">
            <div
              className={`rl-progress-bar ${utilizationColor}`}
              style={{ width: `${Math.min(100, utilization || 0)}%` }}
            />
          </div>
        </div>
      ) : (
        <RedlineProgress value={progress || 0} max={100} color="green" label="Repayment progress" showValue />
      )}

      {/* Due date */}
      {dueDate && (
        <div className={`flex items-center gap-2 text-xs p-2.5 rounded-lg ${
          (daysUntilDue !== undefined && daysUntilDue <= 3)
            ? 'bg-[#FFF6F6] text-[#C62828]'
            : 'bg-[#F9F9F9] text-[#666]'
        }`}>
          <Calendar size={13} />
          <span>
            Due {formatDate(dueDate)}
            {daysUntilDue !== undefined && daysUntilDue >= 0 && (
              <span className="font-semibold ml-1">
                · {daysUntilDue === 0 ? 'Today' : `${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`}
              </span>
            )}
          </span>
        </div>
      )}
    </RedlineCard>
  );
}

/* ── Insight chip ── */
function InsightItem({ text, trend }) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const color = trend === 'down' ? 'text-green-600' : trend === 'up' ? 'text-[#C62828]' : 'text-[#999]';
  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-[#EAEAEA] last:border-0">
      <Icon size={15} className={`${color} shrink-0 mt-0.5`} />
      <p className="text-sm text-[#171717] leading-snug">{text}</p>
    </div>
  );
}

/* ── Dashboard skeleton ── */
function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <RedlineSkeleton height={14} width={120} />
        <RedlineSkeleton height={32} width={220} />
      </div>
      <RedlineSkeleton height={160} className="rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RedlineSkeleton height={260} className="rounded-2xl" />
        <RedlineSkeleton height={260} className="rounded-2xl" />
      </div>
      <RedlineSkeleton height={200} className="rounded-2xl" />
    </div>
  );
}

export default function Dashboard({ onOpenAddModal, setActiveTab, privacyMode }) {
  const { user } = useAuth();
  const [data, setData]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        fetchDashboardApi(),
        fetchAnalyticsApi().catch(() => ({ data: null })),
      ]);
      setData(dashRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="p-6">
        <RedlineAlert
          type="error"
          title="Unable to load dashboard"
          message={error}
        />
        <button onClick={load} className="rl-btn-secondary mt-4 text-sm">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const { icici, slice, combined, utilization_status, alerts } = data;

  /* Trend chart data from analytics */
  const trendData = analytics?.icici_monthly
    ? analytics.icici_monthly.slice(-6).map(r => ({
        month: r.billing_month ? formatMonthName(r.billing_month).split(' ')[0] : '',
        outstanding: r.outstanding || 0,
      }))
    : [];

  const hasNoData = !icici?.billing_month && !slice?.billing_month;

  /* Calculate days until due */
  const calcDays = (dateStr) => {
    if (!dateStr) return undefined;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    return Math.round((due - today) / 86400000);
  };

  const icicDays  = calcDays(icici?.due_date);
  const sliceDays = calcDays(slice?.due_date);

  /* Generate insights */
  const insights = [];
  if (icici?.current_outstanding < (combined?.prev_outstanding || Infinity)) {
    insights.push({ text: `Your ICICI outstanding is lower than last month.`, trend: 'down' });
  }
  if (icici?.utilization > 50) {
    insights.push({ text: `ICICI utilization is at ${icici.utilization?.toFixed(1)}% — consider paying before the due date.`, trend: 'up' });
  }
  if (slice?.repayment_progress >= 50) {
    insights.push({ text: `You're ${slice.repayment_progress?.toFixed(0)}% through repaying your Slice balance — great progress.`, trend: 'down' });
  }
  if (icicDays !== undefined && icicDays <= 7 && icicDays >= 0) {
    insights.push({ text: `ICICI payment is due in ${icicDays === 0 ? 'today' : `${icicDays} day${icicDays === 1 ? '' : 's'}`}.`, trend: 'neutral' });
  }

  /* Privacy helper */
  const show = (val) => privacyMode ? '₹••,•••' : val;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8 animate-fade-in">

      {/* ── Greeting ── */}
      <div>
        <p className="text-sm text-[#666]">
          {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </p>
        <h1 className="text-xl font-bold text-[#171717] mt-0.5 tracking-tight">Your credit overview</h1>
      </div>

      {/* ── Alerts ── */}
      {alerts?.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <RedlineAlert
              key={i}
              type={a.type === 'danger' ? 'error' : 'warning'}
              title={a.title}
              message={a.message}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {hasNoData ? (
        <RedlineCard className="p-8">
          <RedlineEmptyState
            icon={CreditCard}
            title="Your dashboard starts here."
            description="Add your first payment to begin tracking your credit position."
            action={() => onOpenAddModal('icici')}
            actionLabel="Add first payment"
          />
          <div className="flex gap-3 justify-center mt-2">
            <button onClick={() => onOpenAddModal('slice')} className="rl-btn-secondary text-sm">
              Add Slice Repayment
            </button>
          </div>
        </RedlineCard>
      ) : (
        <>
          {/* ── RED HERO — Total outstanding ── */}
          <div className="rl-hero p-6 sm:p-8">
            <div className="relative z-10">
              <p className="text-xs font-semibold text-[rgba(255,255,255,0.6)] uppercase tracking-widest mb-3">
                Your credit position
              </p>
              <div className={`text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none mb-2 ${privacyMode ? 'blur-sm' : ''}`}>
                {formatCurrency(combined?.total_outstanding)}
              </div>
              <p className="text-[rgba(255,255,255,0.65)] text-sm">Total outstanding</p>

              <div className="flex flex-wrap items-center gap-4 mt-5">
                <div>
                  <p className="text-xs text-[rgba(255,255,255,0.55)] mb-0.5">ICICI</p>
                  <p className={`text-white font-semibold ${privacyMode ? 'blur-sm' : ''}`}>
                    {formatCurrency(icici?.current_outstanding)}
                  </p>
                </div>
                <div className="w-px h-8 bg-[rgba(255,255,255,0.2)]" />
                <div>
                  <p className="text-xs text-[rgba(255,255,255,0.55)] mb-0.5">Slice</p>
                  <p className={`text-white font-semibold ${privacyMode ? 'blur-sm' : ''}`}>
                    {formatCurrency(slice?.current_outstanding)}
                  </p>
                </div>
                <div className="w-px h-8 bg-[rgba(255,255,255,0.2)]" />
                <div>
                  <p className="text-xs text-[rgba(255,255,255,0.55)] mb-0.5">Total paid</p>
                  <p className={`text-white font-semibold ${privacyMode ? 'blur-sm' : ''}`}>
                    {formatCurrency(combined?.total_paid)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => onOpenAddModal('icici')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#C62828] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
                >
                  <Plus size={15} />
                  Add Payment
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[rgba(255,255,255,0.15)] text-white rounded-lg text-sm font-medium hover:bg-[rgba(255,255,255,0.2)] transition-colors"
                >
                  View analytics
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Account cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AccountSummaryCard
              title="ICICI Credit Card"
              type="icici"
              outstanding={icici?.current_outstanding}
              limit={icici?.credit_limit}
              available={icici?.available_credit}
              utilization={icici?.utilization}
              status={icici?.status}
              dueDate={icici?.due_date}
              daysUntilDue={icicDays}
              onNavigate={() => setActiveTab('icici')}
            />
            <AccountSummaryCard
              title="Slice"
              type="slice"
              outstanding={slice?.current_outstanding}
              paid={slice?.total_repaid}
              progress={slice?.repayment_progress}
              status={slice?.status}
              dueDate={slice?.due_date}
              daysUntilDue={sliceDays}
              onNavigate={() => setActiveTab('slice')}
            />
          </div>

          {/* ── Trend chart + Insights ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Chart */}
            <RedlineCard className="lg:col-span-3 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#171717]">Outstanding trend</h3>
                  <p className="text-xs text-[#999] mt-0.5">ICICI outstanding over past months</p>
                </div>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs text-[#C62828] font-medium hover:underline flex items-center gap-1"
                >
                  Full analytics <ChevronRight size={13} />
                </button>
              </div>
              {trendData.length >= 2 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C62828" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="outstanding"
                      stroke="#C62828"
                      strokeWidth={2}
                      fill="url(#redGrad)"
                      dot={{ fill: '#C62828', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#C62828' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-[#999]">
                  Add more months to see the trend
                </div>
              )}
            </RedlineCard>

            {/* Insights */}
            <RedlineCard className="lg:col-span-2 p-5">
              <h3 className="text-sm font-semibold text-[#171717] mb-1">What changed?</h3>
              <p className="text-xs text-[#999] mb-3">Observations from your recent activity</p>
              {insights.length > 0 ? (
                insights.map((ins, i) => (
                  <InsightItem key={i} text={ins.text} trend={ins.trend} />
                ))
              ) : (
                <p className="text-sm text-[#999] py-4">No insights yet. Add more payment data.</p>
              )}
            </RedlineCard>
          </div>

          {/* ── Upcoming payments ── */}
          <RedlineCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#171717]">Coming up</h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-[#C62828] font-medium hover:underline flex items-center gap-1"
              >
                Calendar <ChevronRight size={13} />
              </button>
            </div>
            <div className="space-y-0">
              {[
                { name: 'ICICI Credit Card', due: icici?.due_date, days: icicDays, amount: icici?.current_outstanding },
                { name: 'Slice',             due: slice?.due_date,  days: sliceDays, amount: slice?.current_outstanding },
              ].filter(p => p.due).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-b border-[#EAEAEA] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      p.days !== undefined && p.days <= 3 ? 'bg-[#C62828]' : 'bg-[#EAEAEA]'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-[#171717]">{p.name}</p>
                      <p className="text-xs text-[#999]">Due {formatDate(p.due)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${privacyMode ? 'blur-sm' : 'text-[#171717]'}`}>
                      {formatCurrency(p.amount)}
                    </p>
                    {p.days !== undefined && p.days >= 0 && (
                      <p className={`text-xs font-medium ${p.days <= 3 ? 'text-[#C62828]' : 'text-[#999]'}`}>
                        {p.days === 0 ? 'Today' : `${p.days}d`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {![icici?.due_date, slice?.due_date].some(Boolean) && (
                <p className="text-sm text-[#999] py-4 text-center">No upcoming due dates.</p>
              )}
            </div>
          </RedlineCard>
        </>
      )}
    </div>
  );
}
