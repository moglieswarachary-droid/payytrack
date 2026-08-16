const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/icici/payments
router.get('/payments', (req, res) => {
  try {
    const payments = DB.getICICIPayments(req.user.id);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ICICI payments' });
  }
});

// GET /api/icici/payments/:id
router.get('/payments/:id', (req, res) => {
  try {
    const payment = DB.getICICIPaymentById(req.user.id, req.params.id);
    if (!payment) return res.status(404).json({ error: 'ICICI payment record not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ICICI payment record' });
  }
});

// POST /api/icici/payments
router.post('/payments', (req, res) => {
  try {
    const {
      billing_month,
      outstanding,
      amount_paid,
      credit_limit_at_payment,
      available_limit_after_payment,
      credit_limit_next_bill,
      payment_date,
      due_date,
      status,
      notes,
      allow_overpayment
    } = req.body;

    // Validation
    if (!billing_month || outstanding === undefined || amount_paid === undefined || !credit_limit_at_payment) {
      return res.status(400).json({ error: 'Missing required billing fields (Month, Outstanding, Amount Paid, Credit Limit).' });
    }

    if (Number(outstanding) < 0 || Number(amount_paid) < 0 || Number(credit_limit_at_payment) < 0) {
      return res.status(400).json({ error: 'Financial amounts cannot be negative numbers.' });
    }

    if (!allow_overpayment && Number(amount_paid) > Number(outstanding)) {
      return res.status(400).json({ error: 'Amount paid cannot exceed outstanding balance unless credit adjustment is explicitly enabled.' });
    }

    const saved = DB.saveICICIPayment(req.user.id, req.body);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save ICICI payment record.' });
  }
});

// PUT /api/icici/payments/:id
router.put('/payments/:id', (req, res) => {
  try {
    const existing = DB.getICICIPaymentById(req.user.id, req.params.id);
    if (!existing) return res.status(404).json({ error: 'ICICI payment record not found' });

    const payload = { ...req.body, id: req.params.id };
    if (Number(payload.outstanding) < 0 || Number(payload.amount_paid) < 0) {
      return res.status(400).json({ error: 'Financial amounts cannot be negative.' });
    }

    const updated = DB.saveICICIPayment(req.user.id, payload);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ICICI payment record.' });
  }
});

// DELETE /api/icici/payments/:id
router.delete('/payments/:id', (req, res) => {
  try {
    const success = DB.deleteICICIPayment(req.user.id, req.params.id);
    if (!success) return res.status(404).json({ error: 'ICICI payment record not found' });
    res.json({ message: 'ICICI payment record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ICICI payment record' });
  }
});

// POST /api/icici/payments/:id/duplicate
router.post('/payments/:id/duplicate', (req, res) => {
  try {
    const source = DB.getICICIPaymentById(req.user.id, req.params.id);
    if (!source) return res.status(404).json({ error: 'Source record not found' });

    // Compute next month from source.billing_month (e.g. "2026-08" -> "2026-09")
    let nextMonth = '2026-09';
    if (source.billing_month && source.billing_month.includes('-')) {
      const [yearStr, monthStr] = source.billing_month.split('-');
      let y = parseInt(yearStr, 10);
      let m = parseInt(monthStr, 10) + 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
      nextMonth = `${y}-${m < 10 ? '0' + m : m}`;
    }

    const duplicatedData = {
      billing_month: nextMonth,
      outstanding: 0,
      amount_paid: 0,
      credit_limit_at_payment: source.credit_limit_next_bill || source.credit_limit_at_payment,
      available_limit_after_payment: source.credit_limit_next_bill || source.credit_limit_at_payment,
      credit_limit_next_bill: source.credit_limit_next_bill || source.credit_limit_at_payment,
      payment_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 20*86400000).toISOString().split('T')[0],
      status: 'Pending',
      notes: `Duplicated from ${source.billing_month}`
    };

    const created = DB.saveICICIPayment(req.user.id, duplicatedData);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to duplicate ICICI payment month' });
  }
});

module.exports = router;
