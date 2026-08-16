import React from 'react';

/* ─────────────────────────────────────────────
   PayTrack SVG Logo
───────────────────────────────────────────── */
export function RedlineLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PayTrack logo"
    >
      <rect width="32" height="32" rx="8" fill="#C62828" />
      {/* P letterform for PayTrack */}
      <path d="M10 8h6.5a4.5 4.5 0 0 1 0 9H10V8zm0 5h6.5a1.5 1.5 0 0 0 0-3H10v3z" fill="white" />
      <path d="M10 8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Trend line */}
      <path d="M14 24 Q18 20 22 22 Q25 23 27 21" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Alias for convenience
export const PayTrackLogo = RedlineLogo;

/* ─────────────────────────────────────────────
   RedlineButton
───────────────────────────────────────────── */
export function RedlineButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) {
  const base = size === 'sm'
    ? 'px-3 py-1.5 text-xs'
    : size === 'lg'
    ? 'px-6 py-3 text-sm'
    : 'px-4 py-2.5 text-sm';

  const variants = {
    primary:   'rl-btn-primary',
    secondary: 'rl-btn-secondary',
    ghost:     'rl-btn-ghost',
    danger:    'rl-btn-primary bg-red-800 hover:bg-red-900',
  };

  return (
    <button className={`${variants[variant]} ${base} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   RedlineCard
───────────────────────────────────────────── */
export function RedlineCard({ children, className = '', hoverable = false, ...props }) {
  return (
    <div
      className={`rl-card ${hoverable ? 'rl-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RedlineBadge
───────────────────────────────────────────── */
const BADGE_VARIANTS = {
  paid:     'rl-badge rl-badge-paid',
  partial:  'rl-badge rl-badge-partial',
  pending:  'rl-badge rl-badge-pending',
  overdue:  'rl-badge rl-badge-overdue',
  default:  'rl-badge bg-gray-100 text-gray-600',
};

export function RedlineBadge({ status, children, className = '' }) {
  const statusKey = status?.toLowerCase().replace(/\s+/g, '') || 'default';
  const styleMap = {
    paid:          BADGE_VARIANTS.paid,
    fullypaid:     BADGE_VARIANTS.paid,
    partiallypaid: BADGE_VARIANTS.partial,
    partial:       BADGE_VARIANTS.partial,
    pending:       BADGE_VARIANTS.pending,
    overdue:       BADGE_VARIANTS.overdue,
  };
  const cls = styleMap[statusKey] || BADGE_VARIANTS.default;

  const icons = {
    paid:          '✓',
    fullypaid:     '✓',
    partiallypaid: '◑',
    partial:       '◑',
    pending:       '○',
    overdue:       '!',
  };
  const icon = icons[statusKey] || '';

  return (
    <span className={`${cls} ${className}`}>
      {icon && <span>{icon}</span>}
      {children || status}
    </span>
  );
}

/* ─────────────────────────────────────────────
   RedlineProgress
───────────────────────────────────────────── */
export function RedlineProgress({ value = 0, max = 100, color = 'red', height = 6, label, showValue = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorCls = color === 'green' ? 'rl-progress-bar green'
    : color === 'amber' ? 'rl-progress-bar amber'
    : 'rl-progress-bar red';

  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-[#666]">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-[#171717]">{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div className="rl-progress-track" style={{ height }}>
        <div className={colorCls} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RedlineSkeleton
───────────────────────────────────────────── */
export function RedlineSkeleton({ width = '100%', height = 20, className = '' }) {
  return (
    <div
      className={`rl-skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

/* ─────────────────────────────────────────────
   RedlineEmptyState
───────────────────────────────────────────── */
export function RedlineEmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[#FFF6F6] flex items-center justify-center mb-4">
          <Icon size={24} className="text-[#C62828] opacity-60" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#171717] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#666] max-w-xs leading-relaxed">{description}</p>}
      {action && actionLabel && (
        <button onClick={action} className="rl-btn-primary mt-6 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RedlineKV — Key/Value info row
───────────────────────────────────────────── */
export function RedlineKV({ label, value, valueClass = '', mono = false }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#EAEAEA] last:border-0">
      <span className="text-sm text-[#666]">{label}</span>
      <span className={`text-sm font-medium text-[#171717] ${mono ? 'font-mono' : ''} ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RedlineAlert
───────────────────────────────────────────── */
export function RedlineAlert({ type = 'info', title, message, onDismiss }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error:   'bg-[#FFF6F6] border-[#FDECEC] text-[#8E1B1B]',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  const icons = { info: 'ℹ', warning: '!', error: '!', success: '✓' };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}>
      <span className="font-bold text-base leading-none mt-0.5 shrink-0">{icons[type]}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {message && <p className="mt-0.5 opacity-80">{message}</p>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 text-lg leading-none">×</button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LoadingSpinner
───────────────────────────────────────────── */
export function LoadingSpinner({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ color: '#C62828' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   PageHeader
───────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-[#171717] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#666] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
