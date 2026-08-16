import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { fetchAnalyticsApi } from '../services/api';
import { formatCurrency, formatMonthName } from '../utils/formatters';
import { RedlineCard, RedlineSkeleton, PageHeader, RedlineEmptyState } from '../components/RedlineComponents';
import { BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'icici',       label: 'ICICI' },
  { id: 'slice',       label: 'Slice' },
  { id: 'payments',    label: 'Payments' },
  { id: 'utilization', label: 'Utilization' },
];

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rl-card px-3 py-2 text-xs shadow-lg min-w-[120px]">
      <p className="text-[#999] mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : `${p.value}${p.name === 'Utilization' ? '%' : ''}`}
        </p>
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h4 className="text-sm font-semibold text-[#171717] mb-4">{children}</h4>;
}

function MonthLabel(val) {
  if (!val) return val;
  const parts = val.split('-');
  if (parts.length === 2) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1).toLocaleDateString('en-IN', { month: 'short' });
  }
  return val;
}

export default function AnalyticsPage({ privacyMode }) {
  const [data, setData]   = useState(null);
  const [tab, setTab]     = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAnalyticsApi()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
        <RedlineSkeleton height={28} width={160} />
        {[1,2].map(i => <RedlineSkeleton key={i} height={240} className="rounded-2xl" />)}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <RedlineEmptyState icon={BarChart3} title="No analytics data" description="Add payments to see analytics." />
      </div>
    );
  }

  const iciciData = (data.icici_monthly || []).map(r => ({
    month: MonthLabel(r.billing_month),
    Outstanding: r.outstanding || 0,
    Paid: r.amount_paid || 0,
    Remaining: r.remaining_outstanding || 0,
    Utilization: r.credit_utilization || 0,
  }));

  const sliceData = (data.slice_monthly || []).map(r => ({
    month: MonthLabel(r.month || r.billing_month),
    Opening: r.opening_outstanding || 0,
    Repaid: r.repayment_paid || 0,
    Remaining: r.remaining_outstanding || 0,
    Progress: r.repayment_progress || 0,
  }));

  const combinedData = iciciData.map((r, i) => ({
    month: r.month,
    ICICI: r.Outstanding,
    Slice: sliceData[i]?.Remaining || 0,
    Total: r.Outstanding + (sliceData[i]?.Remaining || 0),
  }));

  /* Summary stats */
  const totalICICIPaid  = (data.icici_monthly || []).reduce((s, r) => s + (r.amount_paid || 0), 0);
  const totalSliceRepaid = (data.slice_monthly || []).reduce((s, r) => s + (r.repayment_paid || 0), 0);
  const avgUtil = iciciData.length ? (iciciData.reduce((s, r) => s + r.Utilization, 0) / iciciData.length) : 0;

  const summaryStats = [
    { label: 'ICICI total paid',    value: formatCurrency(totalICICIPaid),    sub: `${(data.icici_monthly || []).length} months` },
    { label: 'Slice total repaid',  value: formatCurrency(totalSliceRepaid),  sub: `${(data.slice_monthly || []).length} records` },
    { label: 'Avg. utilization',    value: `${avgUtil.toFixed(1)}%`,           sub: 'ICICI average' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader title="Analytics" subtitle="Visual overview of your credit history" />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-[#C62828] text-white'
                : 'bg-white border border-[#EAEAEA] text-[#666] hover:border-[#C8C8C8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4">
            {summaryStats.map(({ label, value, sub }) => (
              <RedlineCard key={label} className="p-4">
                <p className="text-xs text-[#999]">{label}</p>
                <p className={`text-xl font-bold text-[#171717] mt-1 ${privacyMode ? 'blur-sm' : ''}`}>{value}</p>
                <p className="text-xs text-[#999] mt-0.5">{sub}</p>
              </RedlineCard>
            ))}
          </div>

          {/* Combined outstanding chart */}
          <RedlineCard className="p-5">
            <SectionTitle>Total outstanding — ICICI + Slice</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={combinedData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="iciciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C62828" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sliceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="ICICI" stroke="#C62828" fill="url(#iciciGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Slice" stroke="#8B5CF6" fill="url(#sliceGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </RedlineCard>
        </div>
      )}

      {/* ── ICICI Tab ── */}
      {tab === 'icici' && (
        <div className="space-y-4">
          <RedlineCard className="p-5">
            <SectionTitle>ICICI — Outstanding vs Paid</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={iciciData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Outstanding" fill="#FDECEC" stroke="#C62828" strokeWidth={1} radius={[4,4,0,0]} />
                <Bar dataKey="Paid" fill="#C62828" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </RedlineCard>
        </div>
      )}

      {/* ── Slice Tab ── */}
      {tab === 'slice' && (
        <div className="space-y-4">
          <RedlineCard className="p-5">
            <SectionTitle>Slice — Repayment progress over time</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sliceData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Repaid" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="Remaining" fill="#FDECEC" stroke="#C62828" strokeWidth={1} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </RedlineCard>
        </div>
      )}

      {/* ── Utilization Tab ── */}
      {tab === 'utilization' && (
        <div className="space-y-4">
          <RedlineCard className="p-5">
            <SectionTitle>ICICI credit utilization trend</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={iciciData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTip />} />
                <Line
                  type="monotone" dataKey="Utilization" name="Utilization"
                  stroke="#C62828" strokeWidth={2}
                  dot={{ fill: '#C62828', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                {/* Reference lines */}
              </LineChart>
            </ResponsiveContainer>
          </RedlineCard>
        </div>
      )}

      {/* ── Payments Tab ── */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <RedlineCard className="p-5">
            <SectionTitle>Monthly payment amounts</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={iciciData.map((r, i) => ({
                  month: r.month,
                  ICICI: r.Paid,
                  Slice: sliceData[i]?.Repaid || 0,
                }))}
                margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ICICI" fill="#C62828" radius={[4,4,0,0]} />
                <Bar dataKey="Slice" fill="#8B5CF6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </RedlineCard>
        </div>
      )}
    </div>
  );
}
