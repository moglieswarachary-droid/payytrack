// LocalStorage Mock Data Store for PayTrack Standalone & Vercel Deployments
// Provides complete offline & cloud-free persistence for Customers, Credits, Payments, Ledger, and Statements

import {
  calculateCreditSummary,
  calculateCustomerSummary,
  calculatePlatformMetrics,
  generateMonthlyTrends,
  generateSmartNotifications,
  formatINR
} from './financialEngine';

const SEED_CUSTOMERS = [
  {
    id: 'CUST-1001',
    name: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'rajesh.sharma@example.com',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bangalore',
    notes: 'Long-term corporate retail client. Excellent credit track record.',
    credit_limit: 200000,
    status: 'ACTIVE',
    created_at: '2026-01-15T10:00:00.000Z',
    updated_at: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'CUST-1002',
    name: 'Priya Patel',
    phone: '+91 98234 56789',
    email: 'priya.patel@example.com',
    address: 'B-12, Shivalik Residency, Satellite, Ahmedabad',
    notes: 'Boutique owner. Prefers monthly UPI settlement.',
    credit_limit: 150000,
    status: 'ACTIVE',
    created_at: '2026-02-10T11:30:00.000Z',
    updated_at: '2026-08-14T09:15:00.000Z'
  },
  {
    id: 'CUST-1003',
    name: 'Amit Kumar',
    phone: '+91 99112 23344',
    email: 'amit.kumar@example.com',
    address: 'Sector 62, Noida, Uttar Pradesh',
    notes: 'Hardware supplier. Has one partially overdue credit cycle.',
    credit_limit: 100000,
    status: 'ACTIVE',
    created_at: '2026-03-05T14:20:00.000Z',
    updated_at: '2026-08-12T16:45:00.000Z'
  },
  {
    id: 'CUST-1004',
    name: 'Sneha Reddy',
    phone: '+91 97001 12233',
    email: 'sneha.reddy@example.com',
    address: 'Road No. 36, Jubilee Hills, Hyderabad',
    notes: 'Freelance Architect. Consistent timely settlements.',
    credit_limit: 180000,
    status: 'ACTIVE',
    created_at: '2026-04-12T09:00:00.000Z',
    updated_at: '2026-08-10T11:00:00.000Z'
  },
  {
    id: 'CUST-1005',
    name: 'Vikram Malhotra',
    phone: '+91 98190 88776',
    email: 'vikram.m@example.com',
    address: '14th Road, Bandra West, Mumbai',
    notes: 'Logistics operator. High volume transactions.',
    credit_limit: 250000,
    status: 'ACTIVE',
    created_at: '2026-05-01T15:00:00.000Z',
    updated_at: '2026-08-16T08:30:00.000Z'
  }
];

const SEED_CREDITS = [
  {
    id: 'CRD-2001',
    customer_id: 'CUST-1001',
    credit_name: 'Commercial Equipment Credit',
    principal_amount: 85000,
    interest_rate: 0,
    payment_frequency: 'MONTHLY',
    credit_date: '2026-05-10',
    due_date: '2026-08-25',
    notes: 'Zero interest 90-day equipment purchase.',
    status: 'ACTIVE',
    created_at: '2026-05-10T10:00:00.000Z'
  },
  {
    id: 'CRD-2002',
    customer_id: 'CUST-1002',
    credit_name: 'Textile Inventory Advance',
    principal_amount: 50000,
    interest_rate: 2.0,
    payment_frequency: 'MONTHLY',
    credit_date: '2026-06-01',
    due_date: '2026-08-20',
    notes: 'Seasonal festive inventory advance.',
    status: 'ACTIVE',
    created_at: '2026-06-01T11:00:00.000Z'
  },
  {
    id: 'CRD-2003',
    customer_id: 'CUST-1003',
    credit_name: 'Hardware Supply Credit',
    principal_amount: 45000,
    interest_rate: 1.5,
    payment_frequency: 'MONTHLY',
    credit_date: '2026-06-15',
    due_date: '2026-08-10', // Overdue
    notes: 'Electrical supplies lot A.',
    status: 'ACTIVE',
    created_at: '2026-06-15T12:00:00.000Z'
  },
  {
    id: 'CRD-2004',
    customer_id: 'CUST-1004',
    credit_name: 'Interior Studio Setup',
    principal_amount: 60000,
    interest_rate: 0,
    payment_frequency: 'MONTHLY',
    credit_date: '2026-07-01',
    due_date: '2026-09-01',
    notes: 'Studio hardware installments.',
    status: 'ACTIVE',
    created_at: '2026-07-01T09:30:00.000Z'
  },
  {
    id: 'CRD-2005',
    customer_id: 'CUST-1005',
    credit_name: 'Fleet Maintenance Credit',
    principal_amount: 110000,
    interest_rate: 2.5,
    payment_frequency: 'MONTHLY',
    credit_date: '2026-07-15',
    due_date: '2026-08-18', // Due soon
    notes: 'Commercial vehicle quarterly overhaul.',
    status: 'ACTIVE',
    created_at: '2026-07-15T14:00:00.000Z'
  }
];

const SEED_PAYMENTS = [
  {
    id: 'TXN-3001',
    transaction_id: 'TXN-3001',
    customer_id: 'CUST-1001',
    credit_id: 'CRD-2001',
    amount: 35000,
    payment_method: 'UPI',
    payment_date: '2026-06-12',
    reference_number: 'UPI/260612/8892',
    notes: 'First installment paid via GPay.',
    status: 'COMPLETED',
    created_at: '2026-06-12T15:20:00.000Z'
  },
  {
    id: 'TXN-3002',
    transaction_id: 'TXN-3002',
    customer_id: 'CUST-1001',
    credit_id: 'CRD-2001',
    amount: 25000,
    payment_method: 'Bank Transfer',
    payment_date: '2026-07-15',
    reference_number: 'IMPS/61928374/HDFC',
    notes: 'Second installment via IMPS.',
    status: 'COMPLETED',
    created_at: '2026-07-15T11:45:00.000Z'
  },
  {
    id: 'TXN-3003',
    transaction_id: 'TXN-3003',
    customer_id: 'CUST-1002',
    credit_id: 'CRD-2002',
    amount: 20000,
    payment_method: 'UPI',
    payment_date: '2026-07-05',
    reference_number: 'UPI/260705/1123',
    notes: 'Part payment towards inventory.',
    status: 'COMPLETED',
    created_at: '2026-07-05T16:10:00.000Z'
  },
  {
    id: 'TXN-3004',
    transaction_id: 'TXN-3004',
    customer_id: 'CUST-1003',
    credit_id: 'CRD-2003',
    amount: 15000,
    payment_method: 'Cash',
    payment_date: '2026-07-18',
    reference_number: 'CSH/REC/104',
    notes: 'Counter cash deposit.',
    status: 'COMPLETED',
    created_at: '2026-07-18T10:30:00.000Z'
  },
  {
    id: 'TXN-3005',
    transaction_id: 'TXN-3005',
    customer_id: 'CUST-1004',
    credit_id: 'CRD-2004',
    amount: 30000,
    payment_method: 'Card',
    payment_date: '2026-08-02',
    reference_number: 'POS/Swipe/9018',
    notes: 'Debit card POS transaction.',
    status: 'COMPLETED',
    created_at: '2026-08-02T14:15:00.000Z'
  },
  {
    id: 'TXN-3006',
    transaction_id: 'TXN-3006',
    customer_id: 'CUST-1005',
    credit_id: 'CRD-2005',
    amount: 45000,
    payment_method: 'Bank Transfer',
    payment_date: '2026-08-10',
    reference_number: 'NEFT/N08102604/ICICI',
    notes: 'Fleet servicing tranche 1.',
    status: 'COMPLETED',
    created_at: '2026-08-10T09:40:00.000Z'
  }
];

const SEED_AUDIT_LOGS = [
  {
    id: 'AUD-4001',
    user_name: 'Rohan Sharma',
    action: 'PAYMENT_RECORDED',
    entity_type: 'PAYMENT',
    entity_id: 'TXN-3006',
    details: 'Recorded payment of ₹45,000 for Vikram Malhotra via Bank Transfer',
    timestamp: '2026-08-10T09:40:00.000Z'
  },
  {
    id: 'AUD-4002',
    user_name: 'Rohan Sharma',
    action: 'CREDIT_ISSUED',
    entity_type: 'CREDIT',
    entity_id: 'CRD-2005',
    details: 'Issued Fleet Maintenance Credit of ₹1,10,000 to Vikram Malhotra',
    timestamp: '2026-07-15T14:00:00.000Z'
  },
  {
    id: 'AUD-4003',
    user_name: 'Rohan Sharma',
    action: 'CUSTOMER_CREATED',
    entity_type: 'CUSTOMER',
    entity_id: 'CUST-1005',
    details: 'Created customer profile for Vikram Malhotra with limit ₹2,50,000',
    timestamp: '2026-05-01T15:00:00.000Z'
  }
];

// Preserved ICICI and Slice history for credit card dedicated views
const SEED_ICICI = [
  {
    id: 'icici_pay_101',
    billing_month: '2026-05',
    outstanding: 38000,
    amount_paid: 38000,
    remaining_outstanding: 0,
    credit_limit_at_payment: 120000,
    available_limit_after_payment: 120000,
    credit_limit_next_bill: 120000,
    credit_utilization: 31.67,
    payment_date: '2026-05-18',
    due_date: '2026-05-20',
    status: 'Paid',
    notes: 'Full payment made via UPI.'
  },
  {
    id: 'icici_pay_102',
    billing_month: '2026-06',
    outstanding: 42500,
    amount_paid: 42500,
    remaining_outstanding: 0,
    credit_limit_at_payment: 120000,
    available_limit_after_payment: 120000,
    credit_limit_next_bill: 150000,
    credit_utilization: 35.42,
    payment_date: '2026-06-16',
    due_date: '2026-06-20',
    status: 'Paid',
    notes: 'Limit enhancement approved.'
  },
  {
    id: 'icici_pay_103',
    billing_month: '2026-07',
    outstanding: 65000,
    amount_paid: 45000,
    remaining_outstanding: 20000,
    credit_limit_at_payment: 150000,
    available_limit_after_payment: 130000,
    credit_limit_next_bill: 150000,
    credit_utilization: 43.33,
    payment_date: '2026-07-17',
    due_date: '2026-07-20',
    status: 'Partially Paid',
    notes: 'Partial payment made.'
  },
  {
    id: 'icici_pay_104',
    billing_month: '2026-08',
    outstanding: 54500,
    amount_paid: 30000,
    remaining_outstanding: 24500,
    credit_limit_at_payment: 150000,
    available_limit_after_payment: 125500,
    credit_limit_next_bill: 150000,
    credit_utilization: 36.33,
    payment_date: '2026-08-15',
    due_date: '2026-08-25',
    status: 'Partially Paid',
    notes: 'Active billing cycle.'
  }
];

const SEED_SLICE = [
  {
    id: 'slice_pay_101',
    billing_month: '2026-05',
    month: '2026-05',
    opening_outstanding: 25000,
    repayment_paid: 10000,
    remaining_outstanding: 15000,
    repayment_progress: 40.0,
    payment_date: '2026-05-12',
    due_date: '2026-05-15',
    status: 'Paid',
    notes: 'Monthly Slice installment 1.'
  },
  {
    id: 'slice_pay_102',
    billing_month: '2026-06',
    month: '2026-06',
    opening_outstanding: 15000,
    repayment_paid: 10000,
    remaining_outstanding: 5000,
    repayment_progress: 66.67,
    payment_date: '2026-06-14',
    due_date: '2026-06-15',
    status: 'Paid',
    notes: 'Monthly Slice installment 2.'
  },
  {
    id: 'slice_pay_103',
    billing_month: '2026-07',
    month: '2026-07',
    opening_outstanding: 22000,
    repayment_paid: 12000,
    remaining_outstanding: 10000,
    repayment_progress: 54.55,
    payment_date: '2026-07-13',
    due_date: '2026-07-15',
    status: 'Partially Paid',
    notes: 'New purchase + partial installment.'
  },
  {
    id: 'slice_pay_104',
    billing_month: '2026-08',
    month: '2026-08',
    opening_outstanding: 18580,
    repayment_paid: 10000,
    remaining_outstanding: 8580,
    repayment_progress: 53.82,
    payment_date: '2026-08-14',
    due_date: '2026-08-18',
    status: 'Partially Paid',
    notes: 'Current active installment.'
  }
];

function getStorage(key, defaultVal) {
  try {
    const val = localStorage.getItem(`paytrack_${key}`);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(`paytrack_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function initMockStore() {
  if (!localStorage.getItem('paytrack_v2_initialized')) {
    setStorage('customers', SEED_CUSTOMERS);
    setStorage('credits', SEED_CREDITS);
    setStorage('payments', SEED_PAYMENTS);
    setStorage('audit_logs', SEED_AUDIT_LOGS);
    setStorage('icici', SEED_ICICI);
    setStorage('slice', SEED_SLICE);
    setStorage('settings', {
      theme: 'light',
      currency: 'INR',
      currency_symbol: '₹',
      alert_util_healthy: 30,
      alert_util_moderate: 50,
      alert_util_high: 75,
      payment_reminders: true,
      due_date_alerts: true,
      auto_calculate_interest: true,
      allow_overpayment: false
    });
    localStorage.setItem('paytrack_v2_initialized', 'true');
  }
}

export function mockResetDemo() {
  localStorage.removeItem('paytrack_customers');
  localStorage.removeItem('paytrack_credits');
  localStorage.removeItem('paytrack_payments');
  localStorage.removeItem('paytrack_audit_logs');
  localStorage.removeItem('paytrack_icici');
  localStorage.removeItem('paytrack_slice');
  localStorage.removeItem('paytrack_settings');
  localStorage.removeItem('paytrack_v2_initialized');
  initMockStore();
}

// ── CUSTOMERS CRUD ──
export function mockGetCustomers(filter = {}) {
  initMockStore();
  const customers = getStorage('customers', SEED_CUSTOMERS);
  const credits = getStorage('credits', SEED_CREDITS);
  const payments = getStorage('payments', SEED_PAYMENTS);

  let result = customers.map(c => calculateCustomerSummary(c, credits, payments));

  if (filter.status && filter.status !== 'ALL') {
    result = result.filter(c => c.status === filter.status);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  }
  return result;
}

export function mockGetCustomerById(id) {
  initMockStore();
  const customers = getStorage('customers', SEED_CUSTOMERS);
  const credits = getStorage('credits', SEED_CREDITS);
  const payments = getStorage('payments', SEED_PAYMENTS);

  const customer = customers.find(c => c.id === id);
  if (!customer) return null;

  const summary = calculateCustomerSummary(customer, credits, payments);
  const custCredits = credits.filter(c => c.customer_id === id).map(c => calculateCreditSummary(c, payments));
  const custPayments = payments.filter(p => p.customer_id === id);

  return {
    ...summary,
    credits: custCredits,
    payments: custPayments
  };
}

export function mockSaveCustomer(data) {
  initMockStore();
  const customers = getStorage('customers', SEED_CUSTOMERS);
  let updated;
  const now = new Date().toISOString();

  if (data.id) {
    updated = customers.map(c => (c.id === data.id ? { ...c, ...data, updated_at: now } : c));
    mockAddAuditLog('CUSTOMER_UPDATED', 'CUSTOMER', data.id, `Updated details for customer ${data.name}`);
  } else {
    const newId = `CUST-${1000 + customers.length + 1}`;
    const newCust = {
      ...data,
      id: newId,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now
    };
    updated = [newCust, ...customers];
    mockAddAuditLog('CUSTOMER_CREATED', 'CUSTOMER', newId, `Created customer ${data.name} with credit limit ₹${data.credit_limit || 0}`);
  }
  setStorage('customers', updated);
  return data.id ? data : updated[0];
}

export function mockDeleteCustomer(id) {
  initMockStore();
  const customers = getStorage('customers', SEED_CUSTOMERS);
  const updated = customers.filter(c => c.id !== id);
  setStorage('customers', updated);
  mockAddAuditLog('CUSTOMER_ARCHIVED', 'CUSTOMER', id, `Archived customer record ${id}`);
  return { success: true };
}

// ── CREDITS CRUD ──
export function mockGetCredits(filter = {}) {
  initMockStore();
  const credits = getStorage('credits', SEED_CREDITS);
  const payments = getStorage('payments', SEED_PAYMENTS);
  const customers = getStorage('customers', SEED_CUSTOMERS);

  let result = credits.map(c => {
    const summary = calculateCreditSummary(c, payments);
    const customer = customers.find(cust => cust.id === c.customer_id) || { name: 'Unknown Customer' };
    return { ...summary, customer_name: customer.name, customer_phone: customer.phone };
  });

  if (filter.status && filter.status !== 'ALL') {
    result = result.filter(c => c.status === filter.status);
  }
  if (filter.customerId) {
    result = result.filter(c => c.customer_id === filter.customerId);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(c =>
      c.credit_name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.customer_name.toLowerCase().includes(q)
    );
  }
  return result;
}

export function mockSaveCredit(data) {
  initMockStore();
  const credits = getStorage('credits', SEED_CREDITS);
  const now = new Date().toISOString();
  let updated;

  if (data.id) {
    updated = credits.map(c => (c.id === data.id ? { ...c, ...data, updated_at: now } : c));
    mockAddAuditLog('CREDIT_UPDATED', 'CREDIT', data.id, `Updated credit account ${data.credit_name}`);
  } else {
    const newId = `CRD-${2000 + credits.length + 1}`;
    const newCredit = {
      ...data,
      id: newId,
      status: 'ACTIVE',
      created_at: now
    };
    updated = [newCredit, ...credits];
    mockAddAuditLog('CREDIT_ISSUED', 'CREDIT', newId, `Issued credit of ₹${data.principal_amount} for customer ${data.customer_id}`);
  }
  setStorage('credits', updated);
  return data.id ? data : updated[0];
}

// ── PAYMENTS & TRANSACTIONS ──
export function mockGetTransactions(filter = {}) {
  initMockStore();
  const payments = getStorage('payments', SEED_PAYMENTS);
  const customers = getStorage('customers', SEED_CUSTOMERS);
  const credits = getStorage('credits', SEED_CREDITS);

  let result = payments.map(p => {
    const cust = customers.find(c => c.id === p.customer_id) || { name: 'Customer' };
    const cred = credits.find(c => c.id === p.credit_id) || { credit_name: 'Credit Account' };
    return {
      ...p,
      customer_name: cust.name,
      customer_phone: cust.phone,
      credit_name: cred.credit_name
    };
  });

  if (filter.method && filter.method !== 'ALL') {
    result = result.filter(p => p.payment_method === filter.method);
  }
  if (filter.status && filter.status !== 'ALL') {
    result = result.filter(p => p.status === filter.status);
  }
  if (filter.customerId) {
    result = result.filter(p => p.customer_id === filter.customerId);
  }
  if (filter.creditId) {
    result = result.filter(p => p.credit_id === filter.creditId);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(p =>
      p.id.toLowerCase().includes(q) ||
      (p.reference_number && p.reference_number.toLowerCase().includes(q)) ||
      p.customer_name.toLowerCase().includes(q)
    );
  }

  // Sort descending by date
  return result.sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at));
}

export function mockRecordPayment(data) {
  initMockStore();
  const payments = getStorage('payments', SEED_PAYMENTS);
  const now = new Date().toISOString();
  const newTxnId = `TXN-${3000 + payments.length + 1}`;

  const newPayment = {
    id: newTxnId,
    transaction_id: newTxnId,
    customer_id: data.customer_id,
    credit_id: data.credit_id,
    amount: Number(data.amount),
    payment_method: data.payment_method || 'UPI',
    payment_date: data.payment_date || now.slice(0, 10),
    reference_number: data.reference_number || `REF/${Date.now().toString().slice(-6)}`,
    notes: data.notes || '',
    status: 'COMPLETED',
    created_at: now
  };

  const updated = [newPayment, ...payments];
  setStorage('payments', updated);
  mockAddAuditLog('PAYMENT_RECORDED', 'PAYMENT', newTxnId, `Recorded payment of ₹${data.amount} via ${data.payment_method}`);
  return newPayment;
}

export function mockVoidTransaction(txnId, reason = '') {
  initMockStore();
  const payments = getStorage('payments', SEED_PAYMENTS);
  const updated = payments.map(p => (p.id === txnId || p.transaction_id === txnId ? { ...p, status: 'VOID', void_reason: reason } : p));
  setStorage('payments', updated);
  mockAddAuditLog('PAYMENT_VOIDED', 'PAYMENT', txnId, `Voided transaction ${txnId}. Reason: ${reason || 'User requested'}`);
  return { success: true };
}

// ── CUSTOMER STATEMENT ──
export function mockGetCustomerStatement(customerId, fromDate = null, toDate = null) {
  initMockStore();
  const customer = mockGetCustomerById(customerId);
  if (!customer) return null;

  const credits = customer.credits || [];
  const payments = (customer.payments || []).filter(p => p.status !== 'VOID');

  let ledger = [];

  credits.forEach(c => {
    ledger.push({
      date: c.credit_date,
      type: 'CREDIT_ISSUED',
      description: c.credit_name,
      reference: c.id,
      debit: c.totalPayable,
      credit: 0,
      dueDate: c.due_date,
      status: c.status
    });
  });

  payments.forEach(p => {
    ledger.push({
      date: p.payment_date,
      type: 'PAYMENT_RECEIVED',
      description: `Payment via ${p.payment_method} (${p.reference_number || 'Direct'})`,
      reference: p.id,
      debit: 0,
      credit: p.amount,
      status: 'PAID'
    });
  });

  // Sort chronological
  ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Running balance calculation
  let runningBalance = 0;
  ledger = ledger.map(entry => {
    runningBalance += (entry.debit - entry.credit);
    return { ...entry, balance: Math.max(0, runningBalance) };
  });

  return {
    customer,
    statementDate: new Date().toISOString().slice(0, 10),
    period: { from: fromDate || credits[0]?.credit_date || 'Start', to: toDate || new Date().toISOString().slice(0, 10) },
    openingBalance: 0,
    totalCreditIssued: customer.totalPayable,
    totalPaid: customer.totalPaid,
    closingBalance: customer.totalOutstanding,
    ledger
  };
}

// ── PLATFORM DASHBOARD ──
export function mockGetDashboard() {
  initMockStore();
  const customers = getStorage('customers', SEED_CUSTOMERS);
  const credits = getStorage('credits', SEED_CREDITS);
  const payments = getStorage('payments', SEED_PAYMENTS);

  const metrics = calculatePlatformMetrics(customers, credits, payments);
  const trends = generateMonthlyTrends(credits, payments, 6);
  const notifications = generateSmartNotifications(customers, credits, payments);

  const enrichedCredits = credits.map(c => calculateCreditSummary(c, payments));
  const overdueAccounts = enrichedCredits.filter(c => c.status === 'OVERDUE').map(c => {
    const cust = customers.find(cust => cust.id === c.customer_id) || { name: 'Customer', phone: '' };
    return { ...c, customer_name: cust.name, customer_phone: cust.phone };
  });

  const recentTransactions = mockGetTransactions().slice(0, 6);
  const recentCustomers = mockGetCustomers().slice(0, 5);

  return {
    metrics,
    trends,
    notifications,
    overdueAccounts,
    recentTransactions,
    recentCustomers,
    // ICICI & Slice cards integration
    icici: mockGetICICIPayments(),
    slice: mockGetSlicePayments()
  };
}

// ── AUDIT LOGS ──
export function mockAddAuditLog(action, entity_type, entity_id, details) {
  const logs = getStorage('audit_logs', SEED_AUDIT_LOGS);
  const newLog = {
    id: `AUD-${4000 + logs.length + 1}`,
    user_name: 'Rohan Sharma',
    action,
    entity_type,
    entity_id,
    details,
    timestamp: new Date().toISOString()
  };
  setStorage('audit_logs', [newLog, ...logs]);
}

export function mockGetAuditLogs() {
  initMockStore();
  return getStorage('audit_logs', SEED_AUDIT_LOGS);
}

// ── ICICI & SLICE ADAPTERS (PRESERVED) ──
export function mockGetICICIPayments() {
  initMockStore();
  return getStorage('icici', SEED_ICICI);
}

export function mockSaveICICIPayment(data) {
  initMockStore();
  const list = getStorage('icici', SEED_ICICI);
  let updated;
  if (data.id) {
    updated = list.map(r => (r.id === data.id ? { ...r, ...data } : r));
  } else {
    const newId = `icici_pay_${Date.now().toString().slice(-4)}`;
    updated = [{ ...data, id: newId }, ...list];
  }
  setStorage('icici', updated);
  return data.id ? data : updated[0];
}

export function mockDeleteICICIPayment(id) {
  initMockStore();
  const list = getStorage('icici', SEED_ICICI);
  setStorage('icici', list.filter(r => r.id !== id));
  return { success: true };
}

export function mockGetSlicePayments() {
  initMockStore();
  return getStorage('slice', SEED_SLICE);
}

export function mockSaveSlicePayment(data) {
  initMockStore();
  const list = getStorage('slice', SEED_SLICE);
  let updated;
  if (data.id) {
    updated = list.map(r => (r.id === data.id ? { ...r, ...data } : r));
  } else {
    const newId = `slice_pay_${Date.now().toString().slice(-4)}`;
    updated = [{ ...data, id: newId }, ...list];
  }
  setStorage('slice', updated);
  return data.id ? data : updated[0];
}

export function mockDeleteSlicePayment(id) {
  initMockStore();
  const list = getStorage('slice', SEED_SLICE);
  setStorage('slice', list.filter(r => r.id !== id));
  return { success: true };
}

export function mockLogin(email) {
  return {
    token: 'paytrack_active_session',
    user: { id: 'demo-user', name: 'Rohan Sharma', email: email || 'demo@paytrack.app', isDemo: true }
  };
}

export function mockRegister(name, email) {
  return {
    token: 'paytrack_active_session',
    user: { id: 'demo-user', name: name || 'Rohan Sharma', email: email || 'demo@paytrack.app', isDemo: true }
  };
}

export function mockGetMe() {
  return { id: 'demo-user', name: 'Rohan Sharma', email: 'demo@paytrack.app', isDemo: true };
}
