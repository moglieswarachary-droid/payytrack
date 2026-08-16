import React, { useEffect, useState } from 'react';
import { Heart, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchDashboardApi, fetchICICIPaymentsApi } from '../services/api';
import { RedlineCard, PageHeader } from '../components/RedlineComponents';

function ScoreDimension({ label, score, description, expanded, onToggle }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#C62828';
  return (
    <div className="py-4 border-b border-[#EAEAEA] last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18` }}>
            <span className="text-sm font-bold" style={{ color }}>{score}</span>
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-[#171717]">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-20 h-2 rounded-full bg-[#EAEAEA] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, background: color }} />
          </div>
          {expanded ? <ChevronUp size={14} className="text-[#999]" /> : <ChevronDown size={14} className="text-[#999]" />}
        </div>
      </button>
      {expanded && (
        <p className="text-sm text-[#666] mt-3 ml-13 pl-1 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#C62828';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs work';

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#EAEAEA" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x="70" y="65" textAnchor="middle" fill="#171717" fontSize="28" fontWeight="700" fontFamily="Inter, sans-serif">
          {score}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="#999" fontSize="11" fontFamily="Inter, sans-serif">
          / 100
        </text>
      </svg>
      <p className="text-base font-semibold mt-1" style={{ color }}>{label}</p>
      <p className="text-xs text-[#999]">PayTrack Health Score</p>
    </div>
  );
}

export default function HealthPage() {
  const [data, setData]       = useState(null);
  const [records, setRecords] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([fetchDashboardApi(), fetchICICIPaymentsApi()])
      .then(([d, r]) => { setData(d.data); setRecords(r.data || []); })
      .catch(() => {});
  }, []);

  /* Score calculation (client-side, no official credit score) */
  const utilization   = data?.icici?.utilization || 0;
  const paidOnTime    = records.filter(r => r.status === 'Paid').length;
  const totalRecords  = records.length || 1;
  const hasData       = records.length >= 2;

  const dimConsistency    = Math.round(Math.min(100, (paidOnTime / totalRecords) * 100));
  const dimData           = hasData ? Math.min(100, records.length * 16) : 20;
  const dimTrend          = records.length >= 2
    ? (records[0]?.outstanding < records[1]?.outstanding ? 80 : 50)
    : 50;
  const dimUtilization    = utilization <= 30 ? 90 : utilization <= 50 ? 70 : utilization <= 75 ? 45 : 25;

  const overallScore = Math.round((dimConsistency * 0.35 + dimData * 0.20 + dimTrend * 0.25 + dimUtilization * 0.20));

  const dimensions = [
    {
      id: 'consistency',
      label: 'Payment consistency',
      score: dimConsistency,
      description: `${paidOnTime} of ${totalRecords} recorded payments have been marked as Paid. Paying on time every month is the strongest indicator of healthy credit behaviour.`,
    },
    {
      id: 'data',
      label: 'Data completeness',
      score: dimData,
      description: `You have ${records.length} ICICI record${records.length !== 1 ? 's' : ''} entered. More historical data allows for better trend analysis and score accuracy.`,
    },
    {
      id: 'trend',
      label: 'Outstanding trend',
      score: dimTrend,
      description: records.length >= 2
        ? `Your most recent outstanding (${data?.icici?.current_outstanding?.toLocaleString('en-IN') || '—'}) compared to the previous month indicates a ${records[0]?.outstanding < records[1]?.outstanding ? 'positive downward' : 'upward'} trend.`
        : 'Add at least 2 months of data to see your outstanding trend score.',
    },
    {
      id: 'utilization',
      label: 'Utilization tracking',
      score: dimUtilization,
      description: `Your current ICICI utilization is ${utilization.toFixed(1)}%. Below 30% is considered excellent. Between 30–50% is moderate. Above 50% puts pressure on your credit health.`,
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-2xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader
        title="Financial Health"
        subtitle="Your PayTrack Health Score — based on your own data"
      />

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 text-xs text-[#666] bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-3.5">
        <Info size={14} className="text-[#999] shrink-0 mt-0.5" />
        <p>This is not an official credit score. It reflects consistency and quality of data you've entered in PayTrack. It has no connection to CIBIL or any external credit bureau.</p>
      </div>

      {/* Score ring */}
      <RedlineCard className="p-6 flex flex-col sm:flex-row items-center gap-8">
        <ScoreRing score={overallScore} />
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#171717] mb-3">What this score means</h3>
          <p className="text-sm text-[#666] leading-relaxed">
            Your PayTrack Health Score reflects how consistently and completely you've been tracking your payments.
            A higher score means you're recording payments on time, keeping utilization healthy, and maintaining clean data.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[['80–100', 'Excellent', '#10B981'], ['60–79', 'Good', '#F59E0B'], ['40–59', 'Fair', '#F97316'], ['0–39', 'Needs work', '#C62828']].map(([range, label, color]) => (
              <div key={range} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-[#666]">{range} — <span className="font-medium" style={{ color }}>{label}</span></span>
              </div>
            ))}
          </div>
        </div>
      </RedlineCard>

      {/* Dimensions */}
      <RedlineCard className="px-5 py-2">
        {dimensions.map(dim => (
          <ScoreDimension
            key={dim.id}
            label={dim.label}
            score={dim.score}
            description={dim.description}
            expanded={expanded === dim.id}
            onToggle={() => setExpanded(expanded === dim.id ? null : dim.id)}
          />
        ))}
      </RedlineCard>
    </div>
  );
}
