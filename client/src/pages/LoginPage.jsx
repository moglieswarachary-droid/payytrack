import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RedlineLogo, LoadingSpinner } from '../components/RedlineComponents';

function RedlineSVGStory() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs opacity-90">
      {/* Grid lines */}
      {[60, 120, 180, 240].map(y => (
        <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {/* Chart area */}
      <path
        d="M30 240 L80 200 L130 220 L180 160 L230 140 L280 100 L330 80 L380 60"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 240 L80 200 L130 220 L180 160 L230 140 L280 100 L330 80 L380 60 L380 280 L30 280 Z"
        fill="rgba(255,255,255,0.06)"
      />
      {/* Data points */}
      {[[80,200],[180,160],[280,100],[380,60]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="white" opacity="0.7" />
      ))}
      {/* Trend arrow */}
      <path d="M320 90 L360 60 L355 75 M360 60 L345 65" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Amount label */}
      <rect x="240" y="75" width="100" height="36" rx="8" fill="rgba(255,255,255,0.12)" />
      <text x="290" y="97" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="Inter, sans-serif">↓ ₹7,420</text>
      <text x="290" y="107" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="Inter, sans-serif">outstanding reduced</text>
    </svg>
  );
}

export default function LoginPage() {
  const { login, loginAsDemo, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err?.response?.data?.error || err?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    try {
      loginAsDemo();
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Unable to start demo session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left panel — brand story ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] rl-hero p-12 xl:p-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <RedlineLogo size={36} />
          <span className="font-bold text-xl text-white tracking-tight">PayTrack</span>
        </div>

        {/* Story */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Know your payments.<br />
              Plan what<br />
              comes next.
            </h1>
            <p className="mt-4 text-[rgba(255,255,255,0.65)] text-base leading-relaxed max-w-sm">
              Track your ICICI card and Slice outstanding in one place. Stay on top of due dates, monitor utilization, and understand your credit position clearly.
            </p>
          </div>

          <RedlineSVGStory />

          <div className="flex items-center gap-6">
            {[
              { label: 'Outstanding tracked', val: '₹33,080' },
              { label: 'Payments recorded', val: '24' },
              { label: 'Months of history', val: '6' },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="text-white font-bold text-lg">{val}</div>
                <div className="text-[rgba(255,255,255,0.55)] text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[rgba(255,255,255,0.4)] text-xs">
          No bank credentials. No auto-debits. Your data only.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 bg-[#FAFAFA]">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <RedlineLogo size={28} />
          <span className="font-bold text-[17px] text-[#171717] tracking-tight">PayTrack</span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#171717] tracking-tight">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[#666] mt-1">
              {isRegister
                ? 'Start tracking your credit journey.'
                : 'Sign in to your PayTrack workspace.'}
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-[#FFF6F6] border border-[#FDECEC] text-[#8E1B1B] text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="rl-label">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rl-input"
                />
              </div>
            )}

            <div>
              <label className="rl-label">Email address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rl-input"
              />
            </div>

            <div>
              <label className="rl-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="rl-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666]"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {!isRegister && (
                <div className="text-right mt-1.5">
                  <button type="button" className="text-xs text-[#C62828] hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {!isRegister && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[#EAEAEA] accent-[#C62828]" />
                <span className="text-sm text-[#666]">Remember me</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rl-btn-primary w-full py-3 text-sm mt-2"
            >
              {loading ? <LoadingSpinner size={18} /> : (isRegister ? 'Create account' : 'Sign in')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-[#EAEAEA]" />
            <span className="text-xs text-[#999]">or</span>
            <hr className="flex-1 border-[#EAEAEA]" />
          </div>

          {/* Demo login button — isolated completely from form validation */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="rl-btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} className="text-[#C62828]" />
            Try with demo account
          </button>

          {/* Toggle */}
          <p className="text-center text-sm text-[#666] mt-6">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="text-[#C62828] font-semibold hover:underline"
            >
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
