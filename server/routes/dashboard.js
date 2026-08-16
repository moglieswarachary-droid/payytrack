const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const settings = DB.getUserSettings(userId);
    const iciciList = DB.getICICIPayments(userId);
    const sliceList = DB.getSlicePayments(userId);

    // Latest month records
    const latestIcici = iciciList[0] || null;
    const latestSlice = sliceList[0] || null;

    // ICICI Card Summaries
    const iciciCurrentOutstanding = latestIcici ? Number(latestIcici.outstanding || 0) : 0;
    const iciciPaidThisMonth = latestIcici ? Number(latestIcici.amount_paid || 0) : 0;
    const iciciCreditLimit = latestIcici ? Number(latestIcici.credit_limit_at_payment || 150000) : 150000;
    const iciciAvailableCredit = Math.max(0, iciciCreditLimit - iciciCurrentOutstanding);
    const iciciUtilization = iciciCreditLimit > 0 ? Number(((iciciCurrentOutstanding / iciciCreditLimit) * 100).toFixed(1)) : 0;
    const iciciRemainingOutstanding = latestIcici ? latestIcici.remaining_outstanding : 0;

    // Slice Summaries
    const sliceCurrentOutstanding = latestSlice ? Number(latestSlice.opening_outstanding || 0) : 0;
    const sliceTotalRepaid = sliceList.reduce((acc, curr) => acc + Number(curr.repayment_paid || 0), 0);
    const sliceRemainingOutstanding = latestSlice ? latestSlice.remaining_outstanding : 0;
    const sliceRepaymentProgress = sliceCurrentOutstanding > 0
      ? Number((( (latestSlice ? Number(latestSlice.repayment_paid || 0) : 0) / sliceCurrentOutstanding) * 100).toFixed(1))
      : 0;

    // Combined Summaries
    const totalOutstanding = iciciCurrentOutstanding + sliceRemainingOutstanding;
    const totalPaidThisMonth = iciciPaidThisMonth + (latestSlice ? Number(latestSlice.repayment_paid || 0) : 0);
    const totalAvailableCredit = iciciAvailableCredit;

    // Health Alerts & Utilization Status
    let utilHealthLevel = 'Healthy';
    let utilBadgeColor = 'emerald';
    if (iciciUtilization > settings.alert_util_healthy && iciciUtilization <= settings.alert_util_moderate) {
      utilHealthLevel = 'Moderate';
      utilBadgeColor = 'amber';
    } else if (iciciUtilization > settings.alert_util_moderate && iciciUtilization <= settings.alert_util_high) {
      utilHealthLevel = 'High';
      utilBadgeColor = 'orange';
    } else if (iciciUtilization > settings.alert_util_high) {
      utilHealthLevel = 'Very High';
      utilBadgeColor = 'rose';
    }

    const alerts = [];
    if (iciciUtilization > settings.alert_util_high) {
      alerts.push({
        type: 'danger',
        title: 'High Credit Utilization Warning',
        message: `Your ICICI utilization is at ${iciciUtilization}%, exceeding your threshold of ${settings.alert_util_high}%.`
      });
    }

    // Check Due Soon / Overdue
    const todayStr = new Date().toISOString().split('T')[0];
    if (latestIcici && latestIcici.status !== 'Paid') {
      if (latestIcici.due_date < todayStr) {
        alerts.push({
          type: 'danger',
          title: 'ICICI Payment Overdue',
          message: `ICICI bill for ${latestIcici.billing_month} was due on ${latestIcici.due_date}.`
        });
      } else {
        alerts.push({
          type: 'warning',
          title: 'ICICI Payment Due Soon',
          message: `ICICI payment of ₹${latestIcici.remaining_outstanding} is due on ${latestIcici.due_date}.`
        });
      }
    }

    if (latestSlice && latestSlice.status !== 'Paid') {
      if (latestSlice.due_date < todayStr) {
        alerts.push({
          type: 'danger',
          title: 'Slice Payment Overdue',
          message: `Slice repayment for ${latestSlice.billing_month} was due on ${latestSlice.due_date}.`
        });
      } else {
        alerts.push({
          type: 'warning',
          title: 'Slice Payment Due Soon',
          message: `Slice repayment of ₹${latestSlice.remaining_outstanding} is due on ${latestSlice.due_date}.`
        });
      }
    }

    res.json({
      icici: {
        current_outstanding: iciciCurrentOutstanding,
        amount_paid_this_month: iciciPaidThisMonth,
        remaining_outstanding: iciciRemainingOutstanding,
        available_credit: iciciAvailableCredit,
        credit_limit: iciciCreditLimit,
        utilization: iciciUtilization,
        status: latestIcici ? latestIcici.status : 'N/A',
        billing_month: latestIcici ? latestIcici.billing_month : 'N/A',
        due_date: latestIcici ? latestIcici.due_date : 'N/A'
      },
      slice: {
        current_outstanding: sliceCurrentOutstanding,
        total_repaid: sliceTotalRepaid,
        remaining_outstanding: sliceRemainingOutstanding,
        repayment_progress: sliceRepaymentProgress,
        status: latestSlice ? latestSlice.status : 'N/A',
        billing_month: latestSlice ? latestSlice.billing_month : 'N/A',
        due_date: latestSlice ? latestSlice.due_date : 'N/A'
      },
      combined: {
        total_outstanding: totalOutstanding,
        total_paid: totalPaidThisMonth,
        total_available_credit: totalAvailableCredit
      },
      utilization_status: {
        level: utilHealthLevel,
        color: utilBadgeColor
      },
      alerts,
      settings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to build dashboard payload.' });
  }
});

module.exports = router;
