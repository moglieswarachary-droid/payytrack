import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { RedlineCard, RedlineProgress, RedlineEmptyState, PageHeader } from '../components/RedlineComponents';
import { formatCurrency } from '../utils/formatters';

const PRESET_GOALS = [
  { id: 'clear-slice',    label: 'Clear Slice',             icon: '🎯', category: 'outstanding' },
  { id: 'utilization-30', label: 'Keep utilization < 30%',  icon: '📉', category: 'utilization' },
  { id: 'payment-streak', label: '3-month payment streak',  icon: '🔥', category: 'streak' },
  { id: 'reduce-25',      label: 'Reduce total by 25%',     icon: '💪', category: 'reduction' },
];

const BADGES = [
  { id: 'first-payment',   label: 'First payment',       icon: '🌟', earned: true },
  { id: '10k-paid',        label: '₹10K paid',           icon: '💰', earned: true },
  { id: '3m-streak',       label: '3-month streak',       icon: '🔥', earned: false },
  { id: '25-reduced',      label: '25% reduction',        icon: '📉', earned: false },
  { id: '50-reduced',      label: '50% reduction',        icon: '🎉', earned: false },
  { id: 'goal-complete',   label: 'Goal completed',       icon: '✅', earned: false },
];

function GoalCard({ goal, onDelete }) {
  const pct = Math.min(100, Math.max(0, goal.progress || 0));
  const done = pct >= 100;

  return (
    <RedlineCard className={`p-5 ${done ? 'border-green-200 bg-green-50' : ''}`} hoverable>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goal.icon}</span>
          <div>
            <h4 className="text-sm font-semibold text-[#171717]">{goal.name}</h4>
            {goal.target && (
              <p className="text-xs text-[#999] mt-0.5">Target: {goal.target}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {done && <CheckCircle size={16} className="text-green-600 shrink-0" />}
          <button onClick={() => onDelete(goal.id)} className="text-[#999] hover:text-[#C62828] p-1">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#666]">Progress</span>
          <span className={`font-bold ${done ? 'text-green-600' : 'text-[#171717]'}`}>{pct.toFixed(0)}%</span>
        </div>
        <div className="rl-progress-track" style={{ height: 6 }}>
          <div
            className={`rl-progress-bar ${done ? 'green' : 'red'}`}
            style={{ width: `${pct}%`, height: '100%' }}
          />
        </div>
        {goal.current !== undefined && goal.targetAmount !== undefined && (
          <div className="flex justify-between text-xs text-[#999]">
            <span>{formatCurrency(goal.current)} now</span>
            <span>{formatCurrency(goal.targetAmount)} target</span>
          </div>
        )}
      </div>

      {done && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-700 font-medium">✓ Goal achieved!</p>
        </div>
      )}
    </RedlineCard>
  );
}

function AddGoalForm({ onAdd, onCancel }) {
  const [name, setName]     = useState('');
  const [target, setTarget] = useState('');
  const [progress, setProg] = useState(0);
  const [icon, setIcon]     = useState('🎯');

  return (
    <RedlineCard className="p-5 border-[#C62828] border-2">
      <h4 className="text-sm font-semibold text-[#171717] mb-4">New Goal</h4>
      <div className="space-y-3">
        <div>
          <label className="rl-label">Goal name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Clear Slice balance" className="rl-input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="rl-label">Target description</label>
            <input value={target} onChange={e => setTarget(e.target.value)}
              placeholder="e.g. ₹0" className="rl-input" />
          </div>
          <div>
            <label className="rl-label">Starting progress (%)</label>
            <input type="number" min="0" max="100" value={progress}
              onChange={e => setProg(Number(e.target.value))} className="rl-input" />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => { if (name.trim()) onAdd({ id: Date.now().toString(), name: name.trim(), target, progress, icon }); }}
            className="rl-btn-primary text-sm flex-1"
          >
            Add goal
          </button>
          <button onClick={onCancel} className="rl-btn-secondary text-sm">Cancel</button>
        </div>
      </div>
    </RedlineCard>
  );
}

export default function GoalsPage() {
  const [goals, setGoals]       = useState([
    { id: '1', name: 'Clear Slice balance', icon: '🎯', progress: 32, target: '₹0', current: 8500, targetAmount: 0 },
    { id: '2', name: 'Keep ICICI below 50% utilization', icon: '📉', progress: 50, target: '<50%' },
    { id: '3', name: 'Pay 3 months in a row before due date', icon: '🔥', progress: 67, target: '3 months' },
  ]);
  const [showAdd, setShowAdd]   = useState(false);

  const addGoal = (goal) => { setGoals(p => [goal, ...p]); setShowAdd(false); };
  const delGoal = (id)   => setGoals(p => p.filter(g => g.id !== id));

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader
        title="Goals"
        subtitle="Track your progress toward financial milestones"
        action={
          <button onClick={() => setShowAdd(!showAdd)} className="rl-btn-primary text-sm">
            <Plus size={15} /> New Goal
          </button>
        }
      />

      {showAdd && <AddGoalForm onAdd={addGoal} onCancel={() => setShowAdd(false)} />}

      {/* Quick preset buttons */}
      {!showAdd && goals.length === 0 && (
        <div>
          <p className="rl-section-title mb-3">Quick start</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_GOALS.map(preset => (
              <button
                key={preset.id}
                onClick={() => addGoal({ id: preset.id, name: preset.label, icon: preset.icon, progress: 0, target: '' })}
                className="flex items-center gap-2 p-3 rounded-xl border border-[#EAEAEA] hover:border-[#C62828] hover:bg-[#FFF6F6] text-sm text-left transition-colors"
              >
                <span className="text-lg">{preset.icon}</span>
                <span className="text-[#171717] font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} onDelete={delGoal} />
          ))}
        </div>
      ) : !showAdd && (
        <RedlineEmptyState
          icon={Target}
          title="No goals yet"
          description="Create a goal to track your progress toward paying off debt or reducing utilization."
          action={() => setShowAdd(true)}
          actionLabel="Add your first goal"
        />
      )}

      {/* Achievements */}
      <div>
        <p className="rl-section-title">Achievements</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {BADGES.map(b => (
            <div
              key={b.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
                b.earned
                  ? 'bg-[#FFF6F6] border-[#FDECEC] text-[#C62828]'
                  : 'bg-[#FAFAFA] border-[#EAEAEA] text-[#999] opacity-60'
              }`}
            >
              <span>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
