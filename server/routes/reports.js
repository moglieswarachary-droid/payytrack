const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/reports?account=all&type=monthly&year=2026
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { account = 'all', year, month } = req.query;

    let iciciList = DB.getICICIPayments(userId);
    let sliceList = DB.getSlicePayments(userId);

    if (year) {
      iciciList = iciciList.filter(p => p.billing_month && p.billing_month.startsWith(year));
      sliceList = sliceList.filter(p => p.billing_month && p.billing_month.startsWith(year));
    }
    if (month) {
      iciciList = iciciList.filter(p => p.billing_month === month);
      sliceList = sliceList.filter(p => p.billing_month === month);
    }

    const summary = {
      total_icici_outstanding: iciciList.reduce((a, b) => a + Number(b.outstanding || 0), 0),
      total_icici_paid: iciciList.reduce((a, b) => a + Number(b.amount_paid || 0), 0),
      total_icici_remaining: iciciList.reduce((a, b) => a + Number(b.remaining_outstanding || 0), 0),

      total_slice_opening: sliceList.reduce((a, b) => a + Number(b.opening_outstanding || 0), 0),
      total_slice_repaid: sliceList.reduce((a, b) => a + Number(b.repayment_paid || 0), 0),
      total_slice_remaining: sliceList.reduce((a, b) => a + Number(b.remaining_outstanding || 0), 0),

      icici_record_count: iciciList.length,
      slice_record_count: sliceList.length
    };

    summary.combined_total_paid = summary.total_icici_paid + summary.total_slice_repaid;
    summary.combined_remaining = summary.total_icici_remaining + summary.total_slice_remaining;

    res.json({
      filter: { account, year, month },
      summary,
      icici_records: account === 'slice' ? [] : iciciList,
      slice_records: account === 'icici' ? [] : sliceList,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
