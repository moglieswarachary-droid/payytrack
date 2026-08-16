import React, { useState, useEffect } from 'react';
import { Zap, Info } from 'lucide-react';
import { fetchDashboardApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { RedlineCard, PageHeader } from '../components/RedlineComponents';

function calcMonthsToFree(outstanding, monthlyPayment) {
  if (!monthlyPayment || monthlyPayment <= 0) return null;
  if (outstanding <= 0) return 0;
  return Math.ceil(outstanding / monthlyPayment);
}

function StrategyRow({ label, amount, outstanding, current }) {
  const months = calcMonthsToFree(outstanding, amount);
  const remaining = Math.max(0, outstanding - amount);
  const saved = current > amount ? formatCurrency(current - amount) : null;

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#EAEAEA] last:border-0">
      <div>
        <p className="text-sm font-semibold text-[#171717]">{label}</p>
        <p className="text-xs text-[#999] mt-0.5">Pay {formatCurrency(amount)} / month</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-[#171717]">
          {months !== null ? `${months} month${months === 1 ? '' : 's'}` : '—'}
        </p>
        <p className="text-xs text-[#999]">{formatCurrency(remaining)} remaining</p>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const [data, setData]       = useState(null);
  const [account, setAccount] = useState('icici');
  const [payment, setPayment] = useState(5000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardApi()
      .then(r => {
        setData(r.data);
        const outstanding = r.data?.icici?.current_outstanding || 0;
        setPayment(Math.round(outstanding * 0.2 / 1000) * 1000 || 5000);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const outstanding = account === 'icici'
    ? (data?.icici?.current_outstanding || 30000)
    : (data?.slice?.current_outstanding || 8500);

  const limit = data?.icici?.credit_limit || 50000;

  const remaining    = Math.max(0, outstanding - payment);
  const utilization  = account === 'icici' && limit > 0
    ? ((remaining / limit) * 100).toFixed(1)
    : null;
  const months       = calcMonthsToFree(outstanding, payment);
  const progress     = outstanding > 0 ? Math.min(100, (payment / outstanding) * 100) : 0;

  const maxPay = Math.max(outstanding, 100000);

  const strategies = [
    { label: 'Conservative',  amount: Math.round(outstanding * 0.15 / 500) * 500 },
    { label: 'Moderate',      amount: Math.round(outstanding * 0.30 / 500) * 500 },
    { label: 'Aggressive',    amount: Math.round(outstanding * 0.50 / 500) * 500 },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-2xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader
        title="Payment Simulator"
        subtitle="Explore how different payment amounts affect your balance"
      />

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 text-xs text-[#666] bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-3.5">
        <Info size={14} className="text-[#999] shrink-0 mt-0.5" />
        <p>This is a planning tool only. No interest or fees are calculated. Actual payoff may vary.</p>
      </div>

      {/* Account toggle */}
      <RedlineCard className="p-5">
        <label className="rl-label">Account to simulate</label>
        <div className="flex gap-2 mt-1">
          {[['icici', 'ICICI Card'], ['slice', 'Slice']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setAccount(id)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                account === id
                  ? 'border-[#C62828] bg-[#FFF6F6] text-[#C62828]'
                  : 'border-[#EAEAEA] text-[#666]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-[#999]">Outstanding balance</p>
              <p className="text-2xl font-bold text-[#171717] tracking-tight mt-0.5">
                {formatCurrency(outstanding)}
              </p>
            </div>
          </div>
        </div>
      </RedlineCard>

      {/* Slider */}
      <RedlineCard className="p-5">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-[#171717]">What if I pay...</h3>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#999]">₹0</span>
          <span className="text-2xl font-bold text-[#C62828] tracking-tight">
            {formatCurrency(payment)}
          </span>
          <span className="text-xs text-[#999]">{formatCurrency(maxPay)}</span>
        </div>

        <input
          type="range"
          min={0}
          max={maxPay}
          step={500}
          value={payment}
          onChange={e => setPayment(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #C62828 0%, #C62828 ${(payment/maxPay)*100}%, #EAEAEA ${(payment/maxPay)*100}%, #EAEAEA 100%)`,
            accentColor: '#C62828',
          }}
        />

        {/* Live results */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { label: 'Remaining',     value: formatCurrency(remaining),     color: remaining > 0 ? 'text-[#C62828]' : 'text-green-600' },
            { label: 'Progress',      value: `${progress.toFixed(1)}%`,     color: 'text-[#171717]' },
            ...(utilization !== null ? [{ label: 'New utilization', value: `${utilization}%`, color: parseFloat(utilization) > 50 ? 'text-amber-600' : 'text-green-600' }] : []),
            { label: 'Months to clear', value: months !== null ? `${months} mo` : '—', color: 'text-[#171717]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#FAFAFA] rounded-xl p-3 border border-[#EAEAEA]">
              <p className="text-xs text-[#999]">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {remaining === 0 && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 text-center font-medium">
            🎉 This payment would clear the balance entirely!
          </div>
        )}
      </RedlineCard>

      {/* Strategy comparison */}
      <RedlineCard className="p-5">
        <h3 className="text-sm font-semibold text-[#171717] mb-1">Strategy comparison</h3>
        <p className="text-xs text-[#999] mb-4">
          Compare different payment levels for {formatCurrency(outstanding)} outstanding
        </p>
        {strategies.map(s => (
          <StrategyRow key={s.label} label={s.label} amount={s.amount} outstanding={outstanding} current={payment} />
        ))}
      </RedlineCard>
    </div>
  );
}
