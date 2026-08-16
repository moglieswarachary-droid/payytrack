import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, User, Phone, Mail, MapPin, IndianRupee, FileText } from 'lucide-react';
import { saveCustomerApi } from '../services/api';
import { LoadingSpinner } from './RedlineComponents';

export default function AddCustomerModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('100000');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setSubmitting(false);
      if (initialData) {
        setName(initialData.name || '');
        setPhone(initialData.phone || '');
        setEmail(initialData.email || '');
        setAddress(initialData.address || '');
        setCreditLimit(initialData.credit_limit ? initialData.credit_limit.toString() : '100000');
        setNotes(initialData.notes || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setCreditLimit('100000');
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    setSubmitting(true);
    try {
      await saveCustomerApi({
        id: initialData?.id || undefined,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        credit_limit: Number(creditLimit) || 0,
        notes: notes.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 750);
    } catch (err) {
      console.error('Failed to save customer:', err);
      setError(err?.response?.data?.error || err?.message || 'Unable to save customer profile.');
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
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#171717]">
                {initialData ? 'Edit Customer Profile' : 'Add New Customer'}
              </h3>
              <p className="text-xs text-[#666]">
                {initialData ? `Updating ${initialData.id}` : 'Create a new customer account in the ledger'}
              </p>
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
              <span>Customer saved successfully!</span>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <User size={13} className="text-[#999]" />
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={name}
                onChange={e => setName(e.target.value)}
                className="rl-input"
              />
            </div>

            <div>
              <label className="rl-label flex items-center gap-1.5">
                <Phone size={13} className="text-[#999]" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="rl-input font-mono text-xs"
              />
            </div>
          </div>

          {/* Email & Credit Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="rl-label flex items-center gap-1.5">
                <Mail size={13} className="text-[#999]" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. ramesh@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rl-input"
              />
            </div>

            <div>
              <label className="rl-label flex items-center gap-1.5">
                <IndianRupee size={13} className="text-[#999]" />
                Credit Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                placeholder="e.g. 150000"
                value={creditLimit}
                onChange={e => setCreditLimit(e.target.value)}
                className="rl-input font-semibold"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="rl-label flex items-center gap-1.5">
              <MapPin size={13} className="text-[#999]" />
              Address / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Shop 14, Commercial Complex, MG Road"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="rl-input"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="rl-label flex items-center gap-1.5">
              <FileText size={13} className="text-[#999]" />
              Account Notes & Terms
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Reliable trade client. 30 days credit cycle."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="rl-input resize-none"
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
              {initialData ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
