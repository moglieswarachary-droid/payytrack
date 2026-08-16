import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Filter, IndianRupee, Phone, Mail,
  CreditCard, FileText, PlusCircle, MoreVertical, Edit2, Trash2,
  AlertCircle, CheckCircle2, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { fetchCustomersApi, deleteCustomerApi } from '../services/api';
import { formatINR } from '../services/financialEngine';
import { RedlineCard, PageHeader, LoadingSpinner } from '../components/RedlineComponents';

export default function CustomersPage({
  onRecordPayment,
  onAddCredit,
  onViewStatement,
  onAddCustomer,
  onEditCustomer,
  privacyMode = false
}) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('outstanding'); // 'outstanding', 'name', 'credit'

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCustomersApi();
      setCustomers(res.data || []);
    } catch (e) {
      console.error('Failed to load customers:', e);
      setError('Unable to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirm = window.confirm(`Are you sure you want to archive customer ${customer.name}? Their financial history will be preserved.`);
    if (!confirm) return;

    try {
      await deleteCustomerApi(customer.id);
      loadCustomers();
    } catch (e) {
      alert('Failed to archive customer.');
    }
  };

  // Filter & Sort
  const filteredCustomers = customers
    .filter(c => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'outstanding') return (b.totalOutstanding || 0) - (a.totalOutstanding || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'credit') return (b.totalCreditIssued || 0) - (a.totalCreditIssued || 0);
      return 0;
    });

  // Calculate high-level stats
  const totalCustomersCount = customers.length;
  const activeCount = customers.filter(c => (c.totalOutstanding || 0) > 0).length;
  const overdueCount = customers.filter(c => (c.totalOverdue || 0) > 0).length;
  const totalOutstandingSum = customers.reduce((sum, c) => sum + (c.totalOutstanding || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171717] tracking-tight">Customer Management</h1>
          <p className="text-sm text-[#666] mt-0.5">Directory of client profiles, credit limits, and balances</p>
        </div>
        <button
          onClick={onAddCustomer}
          className="rl-btn-primary self-start sm:self-auto py-2.5 px-4 text-xs flex items-center gap-2"
        >
          <UserPlus size={15} />
          Add Customer
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Clients</span>
            <Users size={16} className="text-[#999]" />
          </div>
          <div className="text-2xl font-bold text-[#171717]">{totalCustomersCount}</div>
          <p className="text-[11px] text-[#999] mt-1">Registered customer profiles</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Borrowers</span>
            <CreditCard size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{activeCount}</div>
          <p className="text-[11px] text-[#999] mt-1">With outstanding balance</p>
        </RedlineCard>

        <RedlineCard className="p-4">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Accounts</span>
            <AlertCircle size={16} className="text-[#C62828]" />
          </div>
          <div className="text-2xl font-bold text-[#C62828]">{overdueCount}</div>
          <p className="text-[11px] text-[#999] mt-1">Action required immediately</p>
        </RedlineCard>

        <RedlineCard className="p-4 bg-[#FFF6F6] border-[#FDECEC]">
          <div className="flex items-center justify-between text-[#8E1B1B] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outstanding</span>
            <IndianRupee size={16} className="text-[#C62828]" />
          </div>
          <div className="text-2xl font-bold text-[#C62828]">
            {privacyMode ? '••••••' : formatINR(totalOutstandingSum)}
          </div>
          <p className="text-[11px] text-[#8E1B1B] mt-1">Across all clients</p>
        </RedlineCard>
      </div>

      {/* Filter & Search Bar */}
      <RedlineCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, ID, or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rl-input pl-9 text-xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'ACTIVE', 'DUE', 'OVERDUE', 'PAID'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#171717] text-white'
                    : 'text-[#666] hover:bg-[#F5F5F5]'
                }`}
              >
                {tab === 'ALL' ? 'All Customers' : tab}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-[#999] whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-[#EAEAEA] rounded-lg px-2.5 py-1.5 text-xs text-[#171717] bg-white"
            >
              <option value="outstanding">Highest Outstanding</option>
              <option value="name">Name (A-Z)</option>
              <option value="credit">Total Credit Issued</option>
            </select>
          </div>
        </div>
      </RedlineCard>

      {/* Customer List Table */}
      <RedlineCard className="overflow-hidden p-0">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size={32} />
            <p className="text-xs text-[#999]">Loading customer profiles…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <Users size={36} className="mx-auto text-[#CCC] mb-3" />
            <h3 className="font-bold text-sm text-[#171717]">No customers found</h3>
            <p className="text-xs text-[#999] mt-1 max-w-sm mx-auto">
              {search ? 'No clients match your search query.' : 'Get started by creating your first customer profile.'}
            </p>
            <button
              onClick={onAddCustomer}
              className="rl-btn-primary mt-4 py-2 px-4 text-xs inline-flex items-center gap-1.5"
            >
              <UserPlus size={14} /> Add Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] text-[#666] border-b border-[#EAEAEA] font-semibold">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-right">Credit Limit</th>
                  <th className="py-3.5 px-4 text-right">Credit Issued</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-[#171717]">{cust.name}</div>
                      <div className="text-[11px] font-mono text-[#999]">{cust.id}</div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-[#171717] font-medium">{cust.phone}</div>
                      {cust.email && <div className="text-[11px] text-[#999] truncate max-w-[150px]">{cust.email}</div>}
                    </td>

                    {/* Limit */}
                    <td className="py-3.5 px-4 text-right font-medium text-[#666]">
                      {formatINR(cust.credit_limit || 0)}
                    </td>

                    {/* Issued */}
                    <td className="py-3.5 px-4 text-right font-semibold text-[#171717]">
                      {formatINR(cust.totalCreditIssued || 0)}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                      {formatINR(cust.totalPaid || 0)}
                    </td>

                    {/* Outstanding */}
                    <td className="py-3.5 px-4 text-right">
                      <strong className={`font-bold ${cust.totalOutstanding > 0 ? 'text-[#C62828]' : 'text-emerald-700'}`}>
                        {privacyMode ? '••••••' : formatINR(cust.totalOutstanding || 0)}
                      </strong>
                      {cust.totalOverdue > 0 && (
                        <div className="text-[10px] text-red-600 font-bold mt-0.5">
                          (Overdue: {formatINR(cust.totalOverdue)})
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        cust.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : cust.status === 'OVERDUE'
                            ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                            : cust.status === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {cust.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onRecordPayment(cust.id)}
                          title="Record Payment"
                          className="px-2.5 py-1.5 rounded-lg bg-[#FFF6F6] text-[#C62828] text-[11px] font-bold hover:bg-[#FDECEC] transition-colors"
                        >
                          Pay
                        </button>
                        <button
                          onClick={() => onAddCredit(cust.id)}
                          title="Issue Credit"
                          className="px-2 py-1.5 rounded-lg bg-[#F5F5F5] text-[#171717] text-[11px] font-semibold hover:bg-[#EAEAEA] transition-colors"
                        >
                          + Credit
                        </button>
                        <button
                          onClick={() => onViewStatement(cust.id)}
                          title="View Statement"
                          className="p-1.5 rounded-lg text-[#666] hover:text-[#171717] hover:bg-[#EAEAEA] transition-colors"
                        >
                          <FileText size={15} />
                        </button>
                        <button
                          onClick={() => onEditCustomer(cust)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-[#666] hover:text-[#171717] hover:bg-[#EAEAEA] transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cust)}
                          title="Archive Customer"
                          className="p-1.5 rounded-lg text-[#999] hover:text-red-600 hover:bg-[#FFF6F6] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </RedlineCard>
    </div>
  );
}
