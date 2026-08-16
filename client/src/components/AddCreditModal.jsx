import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle2, User, IndianRupee, Calendar, Percent, Clock, FileText } from 'lucide-react';
import { fetchCustomersApi, saveCreditApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import { LoadingSpinner } from './RedlineComponents';

export default function AddCreditModal({ isOpen, onClose, onSuccess, initialCustomerId = null }) {
  const [customers, setCustomers] = useState([]);
  const [loadingCust, setLoadingCust] = useState(true);

  const [customerId, setCustomerId] = useState(initialCustomerId || '');
  const [creditName, setCreditName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [paymentFrequency, setPaymentFrequency] = useState('MONTHLY');
  const [creditDate, setCreditDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setSubmitting(false);
      loadCustomers();
    }
  }, [isOpen, initialCustomerId]);

  const loadCustomers = async () => {
    setLoadingCust(true);
    try {
      const res = await fetchCustomersApi();
      const list = res.data || [];
      setCustomers(list);
      if (initialCustomerId) {
        setCustomerId(initialCustomerId);
      } else if (list.length > 0) {
        setCustomerId(list[0].id);
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
      setError('Unable to load customers list.');
    } finally {
      setLoadingCust(false);
    }
  };

  const principal = Number(principalAmount) || 0;
  const rate = Number(interestRate) || 0;
  const interestAmount = (principal * rate) / 100;
  const totalPayable = principal + interestAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (!creditName.trim()) {
      setError('Credit account name or description is required.');
      return;
    }
    if (principal <= 0) {
      setError('Principal amount must be greater than ₹0.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    setSubmitting(true);
    try {
      await saveCreditApi({
        customer_id: customerId,
        credit_name: creditName.trim(),
        principal_amount: principal,
        interest_rate: rate,
        payment_frequency: paymentFrequency,
        credit_date: creditDate,
        due_date: dueDate,
        notes: notes.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 750);
    } catch (err) {
      console.error('Failed to issue credit:', err);
      setError(err?.response?.data?.error || err?.message || 'Unable to issue credit account.');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#EAEAEA] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF6F6] flex items-center justify-center text-[#C62828]">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#171717]">Issue New Credit</h3>
              <p className="text-xs text-[#666]">Add a new credit line or invoice for a customer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#999] hover:text-[#171717] hover:bg-[#EAEAEA] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {loadingCust ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size={28} />
            <p className="text-xs text-[#999]">Loading customers…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF6F6] border border-[#FDECEC] text-[#8E1B1B] text-xs font-medium">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] text-xs font-medium">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Credit issued and added to customer ledger!</span>
              </div>
            )}

            {/* Customer Select */}
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <User size={13} className="text-[#999]" />
                Customer *
              </label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                required
                className="rl-input"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) — Credit Limit: {formatINR(c.credit_limit || 0)}
                  </option>
                ))}
              </select>
            </div>

            {/* Credit Name */}
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <CreditCard size={13} className="text-[#999]" />
                Credit Title / Invoice Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Commercial Inventory Advance"
                value={creditName}
                onChange={e => setCreditName(e.target.value)}
                className="rl-input"
              />
            </div>

            {/* Principal & Interest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="rl-label flex items-center gap-1.5">
                  <IndianRupee size={13} className="text-[#999]" />
                  Principal Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 50000"
                  value={principalAmount}
                  onChange={e => setPrincipalAmount(e.target.value)}
                  className="rl-input font-semibold text-base"
                />
              </div>

              <div>
                <label className="rl-label flex items-center gap-1.5">
                  <Percent size={13} className="text-[#999]" />
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0 for zero interest"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value)}
                  className="rl-input font-mono"
                />
              </div>
            </div>

            {/* Calculation summary banner */}
            {principal > 0 && (
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#EAEAEA] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#666]">Principal: </span>
                  <strong className="text-[#171717]">{formatINR(principal)}</strong>
                </div>
                {rate > 0 && (
                  <div>
                    <span className="text-[#666]">Interest ({rate}%): </span>
                    <strong className="text-amber-700">+{formatINR(interestAmount)}</strong>
                  </div>
                )}
                <div>
                  <span className="text-[#666]">Total Payable: </span>
                  <strong className="text-[#C62828] font-bold">{formatINR(totalPayable)}</strong>
                </div>
              </div>
            )}

            {/* Dates & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="rl-label flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#999]" />
                  Issue Date
                </label>
                <input
                  type="date"
                  required
                  value={creditDate}
                  onChange={e => setCreditDate(e.target.value)}
                  className="rl-input text-xs"
                />
              </div>

              <div>
                <label className="rl-label flex items-center gap-1.5">
                  <Clock size={13} className="text-[#999]" />
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="rl-input text-xs"
                />
              </div>

              <div>
                <label className="rl-label">Frequency</label>
                <select
                  value={paymentFrequency}
                  onChange={e => setPaymentFrequency(e.target.value)}
                  className="rl-input text-xs"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="ONE_TIME">Bullet / One-Time</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <FileText size={13} className="text-[#999]" />
                Terms / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. 60 days credit term agreed with customer"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="rl-input"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EAEAEA]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-[#EAEAEA] text-xs font-semibold text-[#666] hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || success}
                className="rl-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
              >
                {submitting ? <LoadingSpinner size={15} /> : <CheckCircle2 size={15} />}
                Issue Credit Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
