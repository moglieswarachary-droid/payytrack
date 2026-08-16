import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'default',
  progress,
  progressColor = 'bg-indigo-500',
  variant = 'default'
}) {
  let cardClass = 'glass-panel text-slate-100';
  if (variant === 'icici') cardClass = 'glass-card-icici text-slate-100';
  if (variant === 'slice') cardClass = 'glass-card-slice text-slate-100';
  if (variant === 'combined') cardClass = 'glass-card-combined text-slate-100';

  let badgeColorClass = 'bg-slate-800 text-slate-300';
  if (badgeType === 'emerald') badgeColorClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  if (badgeType === 'amber') badgeColorClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
  if (badgeType === 'rose') badgeColorClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';

  return (
    <div className={`p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] ${cardClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badgeText && (
        <div className="mt-3">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColorClass}`}>
            {badgeText}
          </span>
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
            <span>Utilization / Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
