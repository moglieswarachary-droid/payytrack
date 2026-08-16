import React, { useState, useEffect, useCallback } from 'react';
import { X, CreditCard, Wallet, ChevronRight } from 'lucide-react';
import { saveICICIPaymentApi, saveSlicePaymentApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { RedlineBadge, LoadingSpinner } from './RedlineComponents';

const STATUS_OPTIONS = [
  { value: 'Paid',          icon: '✓', label: 'Paid' },
  { value: 'Partially Paid',icon: '◑', label: 'Partially paid' },
  { value: 'Pending',       icon: '○', label: 'Pending' },
  { value: 'Overdue',       icon: '!', label: 'Overdue' },
];

function FormField({ label, children, hint }) {
  return (
    <div>
      <label className="rl-label">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#999] mt-1">{hint}</p>}
    </div>
  );
}

function CurrencyInput({ value, onChange, placeholder = '0', ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] text-sm font-medium">₹</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="rl-input pl-7"
        {...props}
      />
    </div>
  );
}

/* ── Preview box ── */
function ICICIPreview({ form }) {
  const outstanding = parseFloat(form.outstanding) || 0;
  const paid        = parseFloat(form.amount_paid) || 0;
  const limit       = parseFloat(form.credit_limit_at_payment) || 0;
  const remaining   = outstanding - paid;
  const util        = limit > 0 ? ((outstanding / limit) * 100) : 0;
  const available   = limit - outstanding;

  if (!outstanding && !paid) return null;

  return (
    <div className="rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] p-4 space-y-2.5">
      <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3">Preview</p>
      {[
        { label: 'Remaining', value: formatCurrency(Math.max(0, remaining)), valueClass: remaining > 0 ? 'text-[#C62828]' : 'text-green-600' },
        { label: 'Utilization', value: `${util.toFixed(1)}%`, valueClass: util > 75 ? 'text-[#C62828]' : util > 50 ? 'text-amber-600' : 'text-green-600' },
        { label: 'Available credit', value: formatCurrency(Math.max(0, available)), valueClass: 'text-green-600' },
      ].map(({ label, value, valueClass }) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span className="text-[#666]">{label}</span>
          <span className={`font-semibold ${valueClass}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function SlicePreview({ form }) {
  const opening  = parseFloat(form.opening_outstanding) || 0;
  const repaid   = parseFloat(form.repayment_paid) || 0;
  const remaining = opening - repaid;
  const pct      = opening > 0 ? Math.min(100, (repaid / opening) * 100) : 0;

  if (!opening && !repaid) return null;

  return (
    <div className="rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] p-4 space-y-2.5">
      <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3">Preview</p>
      {[
        { label: 'Remaining',  value: formatCurrency(Math.max(0, remaining)), valueClass: 'text-[#C62828]' },
        { label: 'Progress',   value: `${pct.toFixed(1)}%`, valueClass: 'text-green-600' },
      ].map(({ label, value, valueClass }) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span className="text-[#666]">{label}</span>
          <span className={`font-semibold ${valueClass}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AddPaymentModal({ isOpen, onClose, onSuccess, initialData = null, initialAccount = 'icici' }) {
  const [accountType, setAccountType] = useState(initialAccount);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const todayStr        = new Date().toISOString().split('T')[0];
  const defaultDueDate  = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const defaultIcici = {
    id: '', billing_month: currentMonthStr, outstanding: '',
    amount_paid: '', credit_limit_at_payment: '150000',
    available_limit_after_payment: '', credit_limit_next_bill: '150000',
    payment_date: todayStr, due_date: defaultDueDate,
    status: 'Pending', notes: '', allow_overpayment: false
  };
  const defaultSlice = {
    id: '', billing_month: currentMonthStr, opening_outstanding: '',
    repayment_paid: '', payment_date: todayStr,
    due_date: defaultDueDate, status: 'Pending', notes: ''
  };

  const [iciciForm, setIciciForm] = useState(defaultIcici);
  const [sliceForm, setSliceForm] = useState(defaultSlice);

  useEffect(() => {
    if (!isOpen) { setError(null); setSuccess(false); return; }
    if (initialData) {
      if (initialData.credit_limit_at_payment !== undefined) {
        setAccountType('icici');
        setIciciForm({
          id: initialData.id || '',
          billing_month: initialData.billing_month || currentMonthStr,
          outstanding: String(initialData.outstanding ?? ''),
          amount_paid: String(initialData.amount_paid ?? ''),
          credit_limit_at_payment: String(initialData.credit_limit_at_payment ?? '150000'),
          available_limit_after_payment: String(initialData.available_limit_after_payment ?? ''),
          credit_limit_next_bill: String(initialData.credit_limit_next_bill ?? '150000'),
          payment_date: initialData.payment_date || todayStr,
          due_date: initialData.due_date || defaultDueDate,
          status: initialData.status || 'Pending',
          notes: initialData.notes || '',
          allow_overpayment: false,
        });
      } else {
        setAccountType('slice');
        setSliceForm({
          id: initialData.id || '',
          billing_month: initialData.billing_month || currentMonthStr,
          opening_outstanding: String(initialData.opening_outstanding ?? ''),
          repayment_paid: String(initialData.repayment_paid ?? ''),
          payment_date: initialData.payment_date || todayStr,
          due_date: initialData.due_date || defaultDueDate,
          status: initialData.status || 'Pending',
          notes: initialData.notes || '',
        });
      }
    } else {
      setAccountType(initialAccount);
      setIciciForm(defaultIcici);
      setSliceForm(defaultSlice);
    }
  }, [isOpen, initialData, initialAccount]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const patchIcici = (field, value) => setIciciForm(p => ({ ...p, [field]: value }));
  const patchSlice = (field, value) => setSliceForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (accountType === 'icici') {
        const payload = {
          ...iciciForm,
          outstanding: parseFloat(iciciForm.outstanding) || 0,
          amount_paid: parseFloat(iciciForm.amount_paid) || 0,
          credit_limit_at_payment: parseFloat(iciciForm.credit_limit_at_payment) || 0,
          available_limit_after_payment: parseFloat(iciciForm.available_limit_after_payment) || 0,
          credit_limit_next_bill: parseFloat(iciciForm.credit_limit_next_bill) || 0,
        };
        await saveICICIPaymentApi(payload);
      } else {
        const payload = {
          ...sliceForm,
          opening_outstanding: parseFloat(sliceForm.opening_outstanding) || 0,
          repayment_paid: parseFloat(sliceForm.repayment_paid) || 0,
        };
        await saveSlicePaymentApi(payload);
      }
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => { onClose(); setSuccess(false); }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEdit = !!initialData?.id;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer — slides from right on desktop, full screen sheet on mobile */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:max-w-md bg-white shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#171717]">
              {isEdit ? 'Edit payment' : 'Add payment'}
            </h2>
            <p className="text-xs text-[#999] mt-0.5">
              {accountType === 'icici' ? 'ICICI Credit Card' : 'Slice Repayment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#999] hover:bg-[#F5F5F5] hover:text-[#171717] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Account selector (new records only) */}
        {!isEdit && (
          <div className="px-5 pt-4 pb-0 shrink-0">
            <label className="rl-label">Account</label>
            <div className="flex gap-2">
              {[
                { id: 'icici', label: 'ICICI Card', icon: CreditCard },
                { id: 'slice', label: 'Slice',      icon: Wallet },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAccountType(id)}
                  className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    accountType === id
                      ? 'border-[#C62828] bg-[#FFF6F6] text-[#C62828]'
                      : 'border-[#EAEAEA] text-[#666] hover:border-[#C8C8C8]'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form id="payment-form" onSubmit={handleSubmit}>
            <div className="px-5 py-4 space-y-4">

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-[#FFF6F6] border border-[#FDECEC] text-sm text-[#8E1B1B]">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                  ✓ Saved successfully!
                </div>
              )}

              {/* ── ICICI Fields ── */}
              {accountType === 'icici' && (
                <>
                  <FormField label="Billing month">
                    <input type="month" value={iciciForm.billing_month}
                      onChange={e => patchIcici('billing_month', e.target.value)}
                      className="rl-input" required />
                  </FormField>

                  <FormField label="Current outstanding">
                    <CurrencyInput value={iciciForm.outstanding}
                      onChange={v => patchIcici('outstanding', v)} required />
                  </FormField>

                  <FormField label="Amount paid">
                    <CurrencyInput value={iciciForm.amount_paid}
                      onChange={v => patchIcici('amount_paid', v)} required />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Credit limit at payment">
                      <CurrencyInput value={iciciForm.credit_limit_at_payment}
                        onChange={v => patchIcici('credit_limit_at_payment', v)} required />
                    </FormField>
                    <FormField label="Available after payment">
                      <CurrencyInput value={iciciForm.available_limit_after_payment}
                        onChange={v => patchIcici('available_limit_after_payment', v)} />
                    </FormField>
                  </div>

                  <FormField label="Credit limit next bill"
                    hint="Only update if your limit changed">
                    <CurrencyInput value={iciciForm.credit_limit_next_bill}
                      onChange={v => patchIcici('credit_limit_next_bill', v)} />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Payment date">
                      <input type="date" value={iciciForm.payment_date}
                        onChange={e => patchIcici('payment_date', e.target.value)}
                        className="rl-input" />
                    </FormField>
                    <FormField label="Due date">
                      <input type="date" value={iciciForm.due_date}
                        onChange={e => patchIcici('due_date', e.target.value)}
                        className="rl-input" required />
                    </FormField>
                  </div>

                  <FormField label="Payment status">
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map(({ value, icon, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => patchIcici('status', value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                            iciciForm.status === value
                              ? 'border-[#C62828] bg-[#FFF6F6] text-[#C62828] font-medium'
                              : 'border-[#EAEAEA] text-[#666]'
                          }`}
                        >
                          <span>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Notes (optional)">
                    <textarea value={iciciForm.notes}
                      onChange={e => patchIcici('notes', e.target.value)}
                      rows={2} placeholder="e.g. Paid via UPI"
                      className="rl-input resize-none" />
                  </FormField>

                  {/* Preview */}
                  <ICICIPreview form={iciciForm} />
                </>
              )}

              {/* ── Slice Fields ── */}
              {accountType === 'slice' && (
                <>
                  <FormField label="Month">
                    <input type="month" value={sliceForm.billing_month}
                      onChange={e => patchSlice('billing_month', e.target.value)}
                      className="rl-input" required />
                  </FormField>

                  <FormField label="Opening outstanding"
                    hint="Outstanding balance at start of this period">
                    <CurrencyInput value={sliceForm.opening_outstanding}
                      onChange={v => patchSlice('opening_outstanding', v)} required />
                  </FormField>

                  <FormField label="Repayment paid">
                    <CurrencyInput value={sliceForm.repayment_paid}
                      onChange={v => patchSlice('repayment_paid', v)} required />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Payment date">
                      <input type="date" value={sliceForm.payment_date}
                        onChange={e => patchSlice('payment_date', e.target.value)}
                        className="rl-input" />
                    </FormField>
                    <FormField label="Due date">
                      <input type="date" value={sliceForm.due_date}
                        onChange={e => patchSlice('due_date', e.target.value)}
                        className="rl-input" required />
                    </FormField>
                  </div>

                  <FormField label="Payment status">
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map(({ value, icon, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => patchSlice('status', value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                            sliceForm.status === value
                              ? 'border-[#C62828] bg-[#FFF6F6] text-[#C62828] font-medium'
                              : 'border-[#EAEAEA] text-[#666]'
                          }`}
                        >
                          <span>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Notes (optional)">
                    <textarea value={sliceForm.notes}
                      onChange={e => patchSlice('notes', e.target.value)}
                      rows={2} placeholder="e.g. Paid via bank transfer"
                      className="rl-input resize-none" />
                  </FormField>

                  {/* Preview */}
                  <SlicePreview form={sliceForm} />
                </>
              )}
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-[#EAEAEA] flex gap-3 shrink-0 bg-white">
          <button type="button" onClick={onClose} className="rl-btn-secondary flex-1 py-2.5 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={loading || success}
            className="rl-btn-primary flex-1 py-2.5 text-sm"
          >
            {loading ? <LoadingSpinner size={16} /> : (isEdit ? 'Save changes' : 'Add payment')}
          </button>
        </div>
      </div>
    </>
  );
}
