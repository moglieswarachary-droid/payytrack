import React from 'react';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status }) {
  let bgClass = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Clock;

  switch (status) {
    case 'Paid':
      bgClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
      Icon = CheckCircle2;
      break;
    case 'Partially Paid':
      bgClass = 'bg-amber-950/60 text-amber-400 border-amber-500/30';
      Icon = AlertCircle;
      break;
    case 'Pending':
      bgClass = 'bg-blue-950/60 text-blue-400 border-blue-500/30';
      Icon = Clock;
      break;
    case 'Overdue':
      bgClass = 'bg-rose-950/60 text-rose-400 border-rose-500/30';
      Icon = AlertTriangle;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClass}`}>
      <Icon className="w-3.5 h-3.5" />
      {status || 'Pending'}
    </span>
  );
}
