import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, IndianRupee, Calendar, CreditCard, User, Hash, FileText } from 'lucide-react';
import { fetchCustomersApi, fetchCreditsApi, recordPaymentApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import { LoadingSpinner } from './RedlineComponents';

export default function RecordPaymentModal({ isOpen, onClose, onSuccess, initialCustomerId = null, initialCreditId = null }) {
  const [customers, setCustomers] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [customerId, setCustomerId] = useState(initialCustomerId || '');
  const [creditId, setCreditId] = useState(initialCreditId || '');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setSubmitting(false);
      loadData();
    }
  }, [isOpen, initialCustomerId, initialCreditId]);

  const loadData = async () => {
    setLoadingInit(true);
    try {
      const [custRes, credRes] = await Promise.all([fetchCustomersApi(), fetchCreditsApi()]);
      const custList = custRes.data || [];
      const credList = credRes.data || [];
      setCustomers(custList);
      setCredits(credList);

      const targetCustId = initialCustomerId || (custList[0]?.id || '');
      setCustomerId(targetCustId);

      const availableCredits = credList.filter(c => c.customer_id === targetCustId && c.outstanding > 0);
      const targetCredId = initialCreditId || (availableCredits[0]?.id || credList.find(c => c.customer_id === targetCustId)?.id || '');
      setCreditId(targetCredId);

      const selectedCredit = credList.find(c => c.id === targetCredId);
      if (selectedCredit && selectedCredit.outstanding > 0) {
        setAmount(selectedCredit.outstanding.toString());
      } else {
        setAmount('');
      }
    } catch (e) {
      console.error('Error loading payment form data:', e);
      setError('Unable to load customer accounts.');
    } finally {
      setLoadingInit(false);
    }
  };

  const handleCustomerChange = (newCustId) => {
    setCustomerId(newCustId);
    const available = credits.filter(c => c.customer_id === newCustId);
    const active = available.find(c => c.outstanding > 0) || available[0];
    const newCredId = active?.id || '';
    setCreditId(newCredId);
    if (active && active.outstanding > 0) {
      setAmount(active.outstanding.toString());
    } else {
      setAmount('');
    }
  };

  const handleCreditChange = (newCredId) => {
    setCreditId(newCredId);
    const selected = credits.find(c => c.id === newCredId);
    if (selected && selected.outstanding > 0) {
      setAmount(selected.outstanding.toString());
    }
  };

  const selectedCredit = credits.find(c => c.id === creditId);
  const selectedCustomer = customers.find(c => c.id === customerId);
  const customerCredits = credits.filter(c => c.customer_id === customerId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    if (selectedCredit && paymentAmount > selectedCredit.outstanding && selectedCredit.outstanding > 0) {
      const confirmOverpay = window.confirm(
        `Payment of ${formatINR(paymentAmount)} exceeds current outstanding balance of ${formatINR(selectedCredit.outstanding)}. Proceed anyway?`
      );
      if (!confirmOverpay) return;
    }

    setSubmitting(true);
    try {
      await recordPaymentApi({
        customer_id: customerId,
        credit_id: creditId || null,
        amount: paymentAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || `REF/${Date.now().toString().slice(-6)}`,
        notes: notes.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError(err?.response?.data?.error || err?.message || 'Unable to record payment. Please try again.');
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
              <IndianRupee size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#171717]">Record Payment</h3>
              <p className="text-xs text-[#666]">Add an official collection entry to the ledger</p>
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
        {loadingInit ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size={28} />
            <p className="text-xs text-[#999]">Loading accounts…</p>
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
                <span>Payment recorded successfully! Balance updated.</span>
              </div>
            )}

            {/* Customer Select */}
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <User size={13} className="text-[#999]" />
                Customer
              </label>
              <select
                value={customerId}
                onChange={e => handleCustomerChange(e.target.value)}
                required
                className="rl-input"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) — Outstanding: {formatINR(c.totalOutstanding || 0)}
                  </option>
                ))}
              </select>
            </div>

            {/* Credit Account Select */}
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <CreditCard size={13} className="text-[#999]" />
                Credit Account
              </label>
              <select
                value={creditId}
                onChange={e => handleCreditChange(e.target.value)}
                className="rl-input"
              >
                {customerCredits.length === 0 ? (
                  <option value="">General Account (No active credits)</option>
                ) : (
                  customerCredits.map(cr => (
                    <option key={cr.id} value={cr.id}>
                      {cr.credit_name} ({cr.id}) — Bal: {formatINR(cr.outstanding || 0)} (Due: {cr.due_date})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Outstanding Summary banner */}
            {selectedCredit && (
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#EAEAEA] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#666]">Total Payable: </span>
                  <strong className="text-[#171717]">{formatINR(selectedCredit.totalPayable)}</strong>
                </div>
                <div>
                  <span className="text-[#666]">Already Paid: </span>
                  <strong className="text-emerald-700">{formatINR(selectedCredit.totalPaid)}</strong>
                </div>
                <div>
                  <span className="text-[#666]">Current Outstanding: </span>
                  <strong className="text-[#C62828] font-bold">{formatINR(selectedCredit.outstanding)}</strong>
                </div>
              </div>
            )}

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="rl-label flex items-center gap-1.5">
                  <IndianRupee size={13} className="text-[#999]" />
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="rl-input text-base font-semibold"
                />
              </div>

              <div>
                <label className="rl-label flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#999]" />
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="rl-input"
                />
              </div>
            </div>

            {/* Method & Ref */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="rl-label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="rl-input"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="rl-label flex items-center gap-1.5">
                  <Hash size={13} className="text-[#999]" />
                  Reference / UTR / Receipt #
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/260816/9941"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  className="rl-input font-mono text-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <FileText size={13} className="text-[#999]" />
                Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Part payment towards August installment"
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
                Confirm & Record Payment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
