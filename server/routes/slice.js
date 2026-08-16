const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/slice/payments
router.get('/payments', (req, res) => {
  try {
    const payments = DB.getSlicePayments(req.user.id);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Slice payments' });
  }
});

// GET /api/slice/payments/:id
router.get('/payments/:id', (req, res) => {
  try {
    const payment = DB.getSlicePaymentById(req.user.id, req.params.id);
    if (!payment) return res.status(404).json({ error: 'Slice payment record not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Slice payment record' });
  }
});

// POST /api/slice/payments
router.post('/payments', (req, res) => {
  try {
    const {
      billing_month,
      opening_outstanding,
      repayment_paid,
      payment_date,
      due_date,
      status,
      notes
    } = req.body;

    if (!billing_month || opening_outstanding === undefined || repayment_paid === undefined) {
      return res.status(400).json({ error: 'Missing required Slice fields (Month, Opening Outstanding, Repayment Paid).' });
    }

    if (Number(opening_outstanding) < 0 || Number(repayment_paid) < 0) {
      return res.status(400).json({ error: 'Financial amounts cannot be negative.' });
    }

    const saved = DB.saveSlicePayment(req.user.id, req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save Slice payment record.' });
  }
});

// PUT /api/slice/payments/:id
router.put('/payments/:id', (req, res) => {
  try {
    const existing = DB.getSlicePaymentById(req.user.id, req.params.id);
    if (!existing) return res.status(404).json({ error: 'Slice payment record not found' });

    const payload = { ...req.body, id: req.params.id };
    if (Number(payload.opening_outstanding) < 0 || Number(payload.repayment_paid) < 0) {
      return res.status(400).json({ error: 'Financial amounts cannot be negative.' });
    }

    const updated = DB.saveSlicePayment(req.user.id, payload);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update Slice payment record' });
  }
});

// DELETE /api/slice/payments/:id
router.delete('/payments/:id', (req, res) => {
  try {
    const success = DB.deleteSlicePayment(req.user.id, req.params.id);
    if (!success) return res.status(404).json({ error: 'Slice payment record not found' });
    res.json({ message: 'Slice payment record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Slice payment record' });
  }
});

// POST /api/slice/payments/:id/duplicate
router.post('/payments/:id/duplicate', (req, res) => {
  try {
    const source = DB.getSlicePaymentById(req.user.id, req.params.id);
    if (!source) return res.status(404).json({ error: 'Source record not found' });

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
      opening_outstanding: source.remaining_outstanding || 0,
      repayment_paid: 0,
      payment_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15*86400000).toISOString().split('T')[0],
      status: 'Pending',
      notes: `Duplicated from ${source.billing_month}`
    };

    const created = DB.saveSlicePayment(req.user.id, duplicatedData);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to duplicate Slice payment month' });
  }
});

module.exports = router;
