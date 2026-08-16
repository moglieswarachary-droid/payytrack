// Centralized Financial Engine for PayTrack
// Authoritative calculation logic for balances, totals, payment statuses, and due indicators

/**
 * Format currency in Indian Rupee format (e.g. ₹1,50,000.00 or ₹1,50,000)
 */
export function formatINR(amount, includeDecimals = false) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0
  }).format(num);
}

/**
 * Determine payment status based on authoritative financial rules:
 * - PAID: outstanding <= 0
 * - PARTIAL: paid > 0 && outstanding > 0
 * - DUE: outstanding > 0 && today <= due_date
 * - OVERDUE: outstanding > 0 && today > due_date
 */
export function determineStatus(totalPayable, amountPaid, dueDateStr) {
  const payable = Number(totalPayable) || 0;
  const paid = Number(amountPaid) || 0;
  const outstanding = Math.max(0, payable - paid);

  if (outstanding <= 0 && payable > 0) {
    return 'PAID';
  }
  if (paid > 0 && outstanding > 0) {
    if (isDatePast(dueDateStr)) return 'OVERDUE';
    return 'PARTIAL';
  }
  if (isDatePast(dueDateStr)) {
    return 'OVERDUE';
  }
  return 'DUE';
}

/**
 * Calculate due date relative string (e.g., "Due today", "3 days remaining", "5 days overdue")
 */
export function getDueIndicator(dueDateStr, status) {
  if (status === 'PAID') return { label: 'Settled', type: 'success', days: 0 };
  if (!dueDateStr) return { label: 'No due date', type: 'neutral', days: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
      type: 'danger',
      days: diffDays
    };
  }
  if (diffDays === 0) {
    return { label: 'Due today', type: 'warning', days: 0 };
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', type: 'warning', days: 1 };
  }
  return {
    label: `${diffDays} days remaining`,
    type: diffDays <= 3 ? 'warning' : 'neutral',
    days: diffDays
  };
}

export function isDatePast(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return target.getTime() < today.getTime();
}

/**
 * Calculate full summary for a single Credit Account
 */
export function calculateCreditSummary(credit, allPayments = []) {
  const principal = Number(credit.principal_amount || credit.amount || 0);
  const interestRate = Number(credit.interest_rate || 0);
  const interestAmount = (principal * interestRate) / 100;
  const totalPayable = principal + interestAmount;

  // Filter valid payments matching this credit ID
  const creditPayments = allPayments.filter(
    p => (p.credit_id === credit.id || p.account_id === credit.id) && p.status !== 'VOID'
  );

  const totalPaid = creditPayments.reduce((sum, p) => sum + (Number(p.amount) || Number(p.amount_paid) || 0), 0);
  const outstanding = Math.max(0, totalPayable - totalPaid);
  const status = credit.status === 'ARCHIVED' ? 'ARCHIVED' : determineStatus(totalPayable, totalPaid, credit.due_date);
  const dueInfo = getDueIndicator(credit.due_date, status);

  return {
    ...credit,
    principal,
    interestRate,
    interestAmount,
    totalPayable,
    totalPaid,
    outstanding,
    status,
    dueInfo,
    paymentsCount: creditPayments.length,
    isOverdue: status === 'OVERDUE'
  };
}

/**
 * Calculate summary for a Customer combining all their credits & payments
 */
export function calculateCustomerSummary(customer, allCredits = [], allPayments = []) {
  const custCredits = allCredits.filter(c => c.customer_id === customer.id && c.status !== 'ARCHIVED');
  const custPayments = allPayments.filter(p => p.customer_id === customer.id && p.status !== 'VOID');

  let totalCreditIssued = 0;
  let totalPayable = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let totalOverdue = 0;
  let activeCreditsCount = 0;
  let overdueCreditsCount = 0;

  custCredits.forEach(credit => {
    const summary = calculateCreditSummary(credit, custPayments);
    totalCreditIssued += summary.principal;
    totalPayable += summary.totalPayable;
    totalPaid += summary.totalPaid;
    totalOutstanding += summary.outstanding;

    if (summary.outstanding > 0) {
      activeCreditsCount++;
      if (summary.status === 'OVERDUE') {
        totalOverdue += summary.outstanding;
        overdueCreditsCount++;
      }
    }
  });

  const overallStatus = totalOutstanding <= 0 && custCredits.length > 0
    ? 'PAID'
    : totalOverdue > 0
      ? 'OVERDUE'
      : totalPaid > 0
        ? 'PARTIAL'
        : custCredits.length === 0
          ? 'ACTIVE'
          : 'DUE';

  return {
    ...customer,
    totalCreditIssued,
    totalPayable,
    totalPaid,
    totalOutstanding,
    totalOverdue,
    activeCreditsCount,
    overdueCreditsCount,
    creditsCount: custCredits.length,
    paymentsCount: custPayments.length,
    status: customer.status === 'ARCHIVED' ? 'ARCHIVED' : overallStatus
  };
}

/**
 * Calculate authoritative platform-wide metrics for the Dashboard & Reports
 */
export function calculatePlatformMetrics(customers = [], credits = [], payments = []) {
  const activeCredits = credits.filter(c => c.status !== 'ARCHIVED');
  const validPayments = payments.filter(p => p.status !== 'VOID');

  let totalCreditIssued = 0;
  let totalPayable = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  let totalOverdue = 0;
  let overdueAccountsCount = 0;

  activeCredits.forEach(credit => {
    const summary = calculateCreditSummary(credit, validPayments);
    totalCreditIssued += summary.principal;
    totalPayable += summary.totalPayable;
    totalCollected += summary.totalPaid;
    totalOutstanding += summary.outstanding;

    if (summary.status === 'OVERDUE') {
      totalOverdue += summary.outstanding;
      overdueAccountsCount++;
    }
  });

  // Calculate Today's & This Month's collections
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonthStr = now.toISOString().slice(0, 7);

  let todayCollections = 0;
  let thisMonthCollections = 0;

  validPayments.forEach(p => {
    const pDate = p.payment_date || p.transaction_date || p.created_at || '';
    const amount = Number(p.amount) || Number(p.amount_paid) || 0;
    if (pDate.startsWith(todayStr)) {
      todayCollections += amount;
    }
    if (pDate.startsWith(thisMonthStr)) {
      thisMonthCollections += amount;
    }
  });

  const activeCustomers = customers.filter(c => c.status !== 'ARCHIVED');
  const collectionRate = totalPayable > 0 ? ((totalCollected / totalPayable) * 100).toFixed(1) : '100.0';

  return {
    totalCreditIssued,
    totalPayable,
    totalCollected,
    totalOutstanding,
    totalOverdue,
    todayCollections,
    thisMonthCollections,
    activeCustomersCount: activeCustomers.length,
    overdueAccountsCount,
    collectionRate: Number(collectionRate),
    totalCreditsCount: activeCredits.length,
    totalPaymentsCount: validPayments.length
  };
}

/**
 * Generate monthly collection and credit trends
 */
export function generateMonthlyTrends(credits = [], payments = [], monthsCount = 6) {
  const months = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
    const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    months.push({ key: monthKey, label: monthLabel, creditIssued: 0, collected: 0, outstanding: 0 });
  }

  const validPayments = payments.filter(p => p.status !== 'VOID');
  const activeCredits = credits.filter(c => c.status !== 'ARCHIVED');

  months.forEach(m => {
    // Sum credit issued in this month
    activeCredits.forEach(c => {
      const cDate = (c.credit_date || c.billing_month || '').slice(0, 7);
      if (cDate === m.key) {
        m.creditIssued += Number(c.principal_amount || c.amount || c.outstanding || 0);
      }
    });

    // Sum payments collected in this month
    validPayments.forEach(p => {
      const pDate = (p.payment_date || p.transaction_date || p.billing_month || '').slice(0, 7);
      if (pDate === m.key) {
        m.collected += Number(p.amount || p.amount_paid || 0);
      }
    });

    m.outstanding = Math.max(0, m.creditIssued - m.collected);
  });

  return months;
}

/**
 * Generate dynamic real notifications from active accounts & due dates
 */
export function generateSmartNotifications(customers = [], credits = [], payments = []) {
  const notifications = [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const activeCredits = credits.filter(c => c.status !== 'ARCHIVED');
  const validPayments = payments.filter(p => p.status !== 'VOID');

  activeCredits.forEach(credit => {
    const summary = calculateCreditSummary(credit, validPayments);
    const customer = customers.find(c => c.id === credit.customer_id) || { name: 'Customer' };

    if (summary.outstanding > 0) {
      if (summary.status === 'OVERDUE') {
        notifications.push({
          id: `notif_ovd_${credit.id}`,
          type: 'danger',
          category: 'OVERDUE',
          title: `Payment Overdue: ${customer.name}`,
          message: `${formatINR(summary.outstanding)} is ${summary.dueInfo.label} (Due: ${credit.due_date})`,
          creditId: credit.id,
          customerId: credit.customer_id,
          date: todayStr,
          read: false
        });
      } else if (summary.dueInfo.days === 0) {
        notifications.push({
          id: `notif_due0_${credit.id}`,
          type: 'warning',
          category: 'DUE_TODAY',
          title: `Payment Due Today: ${customer.name}`,
          message: `${formatINR(summary.outstanding)} is due today for ${credit.credit_name || 'Credit Account'}`,
          creditId: credit.id,
          customerId: credit.customer_id,
          date: todayStr,
          read: false
        });
      } else if (summary.dueInfo.days <= 3 && summary.dueInfo.days > 0) {
        notifications.push({
          id: `notif_due3_${credit.id}`,
          type: 'info',
          category: 'UPCOMING',
          title: `Upcoming Due: ${customer.name}`,
          message: `${formatINR(summary.outstanding)} due in ${summary.dueInfo.days} day(s) on ${credit.due_date}`,
          creditId: credit.id,
          customerId: credit.customer_id,
          date: todayStr,
          read: false
        });
      }
    }
  });

  // Recent payments
  const sortedPayments = [...validPayments].sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at)).slice(0, 5);
  sortedPayments.forEach(p => {
    const customer = customers.find(c => c.id === p.customer_id) || { name: p.customer_name || 'Customer' };
    notifications.push({
      id: `notif_pay_${p.id}`,
      type: 'success',
      category: 'PAYMENT_RECEIVED',
      title: `Payment Received: ${customer.name}`,
      message: `Received ${formatINR(p.amount || p.amount_paid)} via ${p.payment_method || 'UPI'} (Ref: ${p.reference_number || 'Direct'})`,
      paymentId: p.id,
      customerId: p.customer_id,
      date: (p.payment_date || p.created_at || todayStr).slice(0, 10),
      read: true
    });
  });

  return notifications;
}
