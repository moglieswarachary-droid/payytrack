// LocalStorage Mock Data Store for PayTrack Standalone & Vercel Deployments

const SEED_DATA = {
  user: {
    id: 'demo-user',
    name: 'Demo User (Rohan Sharma)',
    email: 'demo@paytrack.app',
    role: 'user',
    isDemo: true
  },
  icici: [
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
      notes: 'Requested limit enhancement from ICICI app.'
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
      notes: 'Partial payment made due to gadget purchase.'
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
  ],
  slice: [
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
      opening_outstanding: 18000,
      repayment_paid: 6000,
      remaining_outstanding: 12000,
      repayment_progress: 33.33,
      payment_date: '2026-07-14',
      due_date: '2026-07-15',
      status: 'Paid',
      notes: 'Refreshed borrow power.'
    },
    {
      id: 'slice_pay_104',
      billing_month: '2026-08',
      month: '2026-08',
      opening_outstanding: 12000,
      repayment_paid: 4000,
      remaining_outstanding: 8000,
      repayment_progress: 33.33,
      payment_date: '2026-08-10',
      due_date: '2026-08-18',
      status: 'Partially Paid',
      notes: 'Remaining installment due soon.'
    }
  ],
  settings: {
    theme: 'light',
    currency: 'INR',
    currency_symbol: '₹',
    alert_util_healthy: 30,
    alert_util_moderate: 50,
    alert_util_high: 75,
    payment_reminders: true,
    due_date_alerts: true
  }
};

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
  } catch {}
}

export function initMockStore() {
  if (!localStorage.getItem('paytrack_initialized')) {
    setStorage('icici', SEED_DATA.icici);
    setStorage('slice', SEED_DATA.slice);
    setStorage('settings', SEED_DATA.settings);
    setStorage('user', SEED_DATA.user);
    localStorage.setItem('paytrack_initialized', 'true');
  }
}

export function mockLogin(email, password) {
  initMockStore();
  // Allow demo credentials or any email for instant accessibility
  let user = getStorage('user', SEED_DATA.user);
  if (email && email.toLowerCase() !== 'demo@fintech.local') {
    user = { id: `usr_${Date.now()}`, name: email.split('@')[0], email };
    setStorage('user', user);
  }
  const token = `paytrack_token_${Date.now()}`;
  localStorage.setItem('fintech_token', token);
  return { token, user };
}

export function mockRegister(name, email) {
  initMockStore();
  const user = { id: `usr_${Date.now()}`, name: name || 'User', email };
  setStorage('user', user);
  const token = `paytrack_token_${Date.now()}`;
  localStorage.setItem('fintech_token', token);
  return { token, user };
}

export function mockGetMe() {
  initMockStore();
  const user = getStorage('user', SEED_DATA.user);
  return { user };
}

export function mockGetICICIPayments() {
  initMockStore();
  return getStorage('icici', SEED_DATA.icici);
}

export function mockSaveICICIPayment(data) {
  initMockStore();
  const list = getStorage('icici', SEED_DATA.icici);
  const outstanding = parseFloat(data.outstanding) || 0;
  const paid = parseFloat(data.amount_paid) || 0;
  const limit = parseFloat(data.credit_limit_at_payment) || 150000;
  const remaining = Math.max(0, outstanding - paid);
  const util = limit > 0 ? parseFloat(((outstanding / limit) * 100).toFixed(2)) : 0;
  const status = paid >= outstanding ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending';

  const record = {
    ...data,
    id: data.id || `icici_pay_${Date.now()}`,
    outstanding,
    amount_paid: paid,
    remaining_outstanding: remaining,
    credit_limit_at_payment: limit,
    credit_utilization: util,
    status: data.status || status,
    billing_month: data.billing_month || new Date().toISOString().slice(0, 7)
  };

  const idx = list.findIndex(r => r.id === record.id);
  if (idx >= 0) list[idx] = record;
  else list.unshift(record);

  setStorage('icici', list);
  return record;
}

export function mockDeleteICICIPayment(id) {
  initMockStore();
  const list = getStorage('icici', SEED_DATA.icici).filter(r => r.id !== id);
  setStorage('icici', list);
  return { success: true };
}

export function mockGetSlicePayments() {
  initMockStore();
  return getStorage('slice', SEED_DATA.slice);
}

export function mockSaveSlicePayment(data) {
  initMockStore();
  const list = getStorage('slice', SEED_DATA.slice);
  const opening = parseFloat(data.opening_outstanding) || 0;
  const paid = parseFloat(data.repayment_paid) || 0;
  const remaining = Math.max(0, opening - paid);
  const progress = opening > 0 ? parseFloat(((paid / opening) * 100).toFixed(2)) : 0;
  const status = paid >= opening ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending';

  const record = {
    ...data,
    id: data.id || `slice_pay_${Date.now()}`,
    opening_outstanding: opening,
    repayment_paid: paid,
    remaining_outstanding: remaining,
    repayment_progress: progress,
    status: data.status || status,
    month: data.month || data.billing_month || new Date().toISOString().slice(0, 7),
    billing_month: data.billing_month || data.month || new Date().toISOString().slice(0, 7)
  };

  const idx = list.findIndex(r => r.id === record.id);
  if (idx >= 0) list[idx] = record;
  else list.unshift(record);

  setStorage('slice', list);
  return record;
}

export function mockDeleteSlicePayment(id) {
  initMockStore();
  const list = getStorage('slice', SEED_DATA.slice).filter(r => r.id !== id);
  setStorage('slice', list);
  return { success: true };
}

export function mockGetDashboard() {
  initMockStore();
  const icici = getStorage('icici', SEED_DATA.icici);
  const slice = getStorage('slice', SEED_DATA.slice);

  const iciciLatest = icici[icici.length - 1] || icici[0] || {};
  const sliceLatest = slice[slice.length - 1] || slice[0] || {};

  const totalOutstanding = (iciciLatest.remaining_outstanding || iciciLatest.outstanding || 0) +
                           (sliceLatest.remaining_outstanding || sliceLatest.opening_outstanding || 0);

  const totalLimit = (iciciLatest.credit_limit_at_payment || 150000);
  const totalPaid = (iciciLatest.amount_paid || 0) + (sliceLatest.repayment_paid || 0);
  const overallUtilization = totalLimit > 0 ? parseFloat(((iciciLatest.outstanding || 0) / totalLimit * 100).toFixed(1)) : 0;

  // Monthly trend
  const months = ['2026-05', '2026-06', '2026-07', '2026-08'];
  const monthlyTrends = months.map(m => {
    const i = icici.find(r => (r.billing_month || '').includes(m)) || {};
    const s = slice.find(r => (r.billing_month || r.month || '').includes(m)) || {};
    const iOut = i.remaining_outstanding !== undefined ? i.remaining_outstanding : (i.outstanding || 0);
    const sOut = s.remaining_outstanding !== undefined ? s.remaining_outstanding : (s.opening_outstanding || 0);
    return {
      month: m,
      month_name: m === '2026-05' ? 'May 26' : m === '2026-06' ? 'Jun 26' : m === '2026-07' ? 'Jul 26' : 'Aug 26',
      icici_outstanding: iOut,
      slice_outstanding: sOut,
      total_outstanding: iOut + sOut,
      total_paid: (i.amount_paid || 0) + (s.repayment_paid || 0)
    };
  });

  return {
    combined: {
      total_outstanding: totalOutstanding,
      total_paid_this_month: totalPaid,
      overall_utilization: overallUtilization,
      total_credit_limit: totalLimit,
      total_available_credit: Math.max(0, totalLimit - (iciciLatest.outstanding || 0))
    },
    icici: {
      latest_payment: iciciLatest,
      current_outstanding: iciciLatest.remaining_outstanding || iciciLatest.outstanding || 0,
      amount_paid: iciciLatest.amount_paid || 0,
      credit_limit: iciciLatest.credit_limit_at_payment || 150000,
      available_limit: iciciLatest.available_limit_after_payment || 125500,
      utilization: iciciLatest.credit_utilization || 36.33,
      due_date: iciciLatest.due_date || '2026-08-25',
      status: iciciLatest.status || 'Partially Paid'
    },
    slice: {
      latest_payment: sliceLatest,
      opening_outstanding: sliceLatest.opening_outstanding || 12000,
      repayment_paid: sliceLatest.repayment_paid || 4000,
      remaining_outstanding: sliceLatest.remaining_outstanding || 8000,
      progress: sliceLatest.repayment_progress || 33.33,
      due_date: sliceLatest.due_date || '2026-08-18',
      status: sliceLatest.status || 'Partially Paid'
    },
    monthly_trends: monthlyTrends,
    alerts: [
      { id: 'alt_1', type: 'info', title: 'Upcoming Slice Due Date', message: '₹8,000 due on Aug 18, 2026' },
      { id: 'alt_2', type: 'info', title: 'Upcoming ICICI Due Date', message: '₹24,500 due on Aug 25, 2026' }
    ],
    upcoming_payments: [
      { account: 'Slice', amount: 8000, due_date: '2026-08-18', status: 'Partially Paid' },
      { account: 'ICICI', amount: 24500, due_date: '2026-08-25', status: 'Partially Paid' }
    ],
    insights: {
      summary: 'Your overall outstanding decreased by ₹10,500 compared to last month. ICICI utilization is in a healthy range at 36.3%.'
    }
  };
}

export function mockGetAnalytics() {
  const dash = mockGetDashboard();
  return {
    monthly_trends: dash.monthly_trends,
    highlight_stats: {
      avg_monthly_burn: 45000,
      peak_debt_month: 'Jul 2026',
      lowest_debt_month: 'May 2026',
      total_interest_saved: 3450
    }
  };
}

export function mockGetSettings() {
  initMockStore();
  return getStorage('settings', SEED_DATA.settings);
}

export function mockResetDemo() {
  setStorage('icici', SEED_DATA.icici);
  setStorage('slice', SEED_DATA.slice);
  setStorage('settings', SEED_DATA.settings);
  setStorage('user', SEED_DATA.user);
  return { success: true };
}
