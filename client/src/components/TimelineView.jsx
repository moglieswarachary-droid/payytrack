import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatMonthName } from '../utils/formatters';

export default function TimelineView({ records = [] }) {
  // Sort chronologically ascending for timeline flow
  const sorted = [...records].sort((a, b) => (a.billing_month || '').localeCompare(b.billing_month || ''));

  if (!sorted.length) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl border border-white/5 text-slate-400">
        <p className="text-sm">No monthly payment timeline data available yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>ICICI Credit Limit & Payment Timeline</span>
          </h3>
          <p className="text-xs text-slate-400">Month-over-Month limit migration & debt progression</p>
        </div>
      </div>

      {/* Horizontal Scroll Timeline */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="flex items-center gap-4 min-w-max">
          {sorted.map((item, idx) => {
            const limitChange = item.limit_change || 0;
            let limitIcon = <Minus className="w-3.5 h-3.5 text-slate-400" />;
            let limitBadge = 'Unchanged';
            let limitBadgeClass = 'bg-slate-800/60 text-slate-400 border-slate-700/50';

            if (limitChange > 0) {
              limitIcon = <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
              limitBadge = `Increased (+${formatCurrency(limitChange)})`;
              limitBadgeClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
            } else if (limitChange < 0) {
              limitIcon = <TrendingDown className="w-3.5 h-3.5 text-rose-400" />;
              limitBadge = `Decreased (${formatCurrency(limitChange)})`;
              limitBadgeClass = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
            }

            return (
              <React.Fragment key={item.id || idx}>
                {/* Timeline Card */}
                <div className="w-64 glass-panel p-4 rounded-2xl border border-white/10 space-y-3 relative group hover:border-orange-500/40 transition-all">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-extrabold text-sm text-white">{formatMonthName(item.billing_month)}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${limitBadgeClass}`}>
                      {limitIcon}
                      <span>{limitBadge}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Outstanding:</span>
                      <span className="font-semibold text-white">{formatCurrency(item.outstanding)}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Paid:</span>
                      <span className="font-semibold text-emerald-400">{formatCurrency(item.amount_paid)}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Remaining:</span>
                      <span className="font-semibold text-orange-400">{formatCurrency(item.remaining_outstanding)}</span>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Limit at Payment:</span>
                        <span className="font-mono text-slate-200">{formatCurrency(item.credit_limit_at_payment)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Next Bill Limit:</span>
                        <span className="font-mono text-indigo-300 font-bold">{formatCurrency(item.credit_limit_next_bill)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector */}
                {idx < sorted.length - 1 && (
                  <div className="text-slate-600">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
