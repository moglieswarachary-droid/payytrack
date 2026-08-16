const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/analytics
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const iciciList = DB.getICICIPayments(userId).sort((a, b) => (a.billing_month || '').localeCompare(b.billing_month || ''));
    const sliceList = DB.getSlicePayments(userId).sort((a, b) => (a.billing_month || '').localeCompare(b.billing_month || ''));

    // Build unique billing months set
    const allMonths = Array.from(new Set([
      ...iciciList.map(p => p.billing_month),
      ...sliceList.map(p => p.billing_month)
    ])).filter(Boolean).sort();

    const monthlyTrends = allMonths.map(month => {
      const icici = iciciList.find(p => p.billing_month === month) || {};
      const slice = sliceList.find(p => p.billing_month === month) || {};

      const icici_outstanding = Number(icici.outstanding || 0);
      const icici_paid = Number(icici.amount_paid || 0);
      const icici_remaining = Number(icici.remaining_outstanding || 0);
      const icici_limit = Number(icici.credit_limit_at_payment || 150000);
      const icici_utilization = Number(icici.credit_utilization || 0);

      const slice_opening = Number(slice.opening_outstanding || 0);
      const slice_paid = Number(slice.repayment_paid || 0);
      const slice_remaining = Number(slice.remaining_outstanding || 0);

      const total_outstanding = icici_outstanding + slice_opening;
      const total_paid = icici_paid + slice_paid;
      const total_remaining = icici_remaining + slice_remaining;

      return {
        month,
        icici_outstanding,
        icici_paid,
        icici_remaining,
        icici_limit,
        icici_utilization,
        slice_opening,
        slice_paid,
        slice_remaining,
        total_outstanding,
        total_paid,
        total_remaining
      };
    });

    // Best Payment Month (month with highest total paid)
    let bestPaymentMonth = { month: 'N/A', amount: 0 };
    // Highest Outstanding Month
    let highestOutstandingMonth = { month: 'N/A', amount: 0 };

    monthlyTrends.forEach(m => {
      if (m.total_paid > bestPaymentMonth.amount) {
        bestPaymentMonth = { month: m.month, amount: m.total_paid };
      }
      if (m.total_outstanding > highestOutstandingMonth.amount) {
        highestOutstandingMonth = { month: m.month, amount: m.total_outstanding };
      }
    });

    const totalPaidAllTime = monthlyTrends.reduce((acc, m) => acc + m.total_paid, 0);
    const avgMonthlyPayment = monthlyTrends.length > 0 ? Math.round(totalPaidAllTime / monthlyTrends.length) : 0;
    const latestMonth = monthlyTrends[monthlyTrends.length - 1] || {};
    const totalRemainingNow = Number(latestMonth.total_remaining || 0);

    res.json({
      monthly_trends: monthlyTrends,
      best_payment_month: bestPaymentMonth,
      highest_outstanding_month: highestOutstandingMonth,
      avg_monthly_payment: avgMonthlyPayment,
      total_paid_all_time: totalPaidAllTime,
      total_remaining_now: totalRemainingNow,
      months_tracked_count: monthlyTrends.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate analytics payload.' });
  }
});

module.exports = router;
