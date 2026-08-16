const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const settings = DB.getUserSettings(req.user.id);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', (req, res) => {
  try {
    const updated = DB.updateUserSettings(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/settings/reset-demo
router.post('/reset-demo', (req, res) => {
  try {
    DB.resetToDemoData(req.user.id);
    res.json({ message: 'Demo records successfully reset.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset demo data' });
  }
});

// POST /api/settings/clear-all
router.post('/clear-all', (req, res) => {
  try {
    DB.clearAllUserData(req.user.id);
    res.json({ message: 'All user financial payment records successfully cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear user data' });
  }
});

// GET /api/settings/export-backup
router.get('/export-backup', (req, res) => {
  try {
    const userId = req.user.id;
    const data = {
      icici_payments: DB.getICICIPayments(userId),
      slice_payments: DB.getSlicePayments(userId),
      settings: DB.getUserSettings(userId),
      exported_at: new Date().toISOString()
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fintech_backup_${userId}_${Date.now()}.json`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export backup data' });
  }
});

module.exports = router;
