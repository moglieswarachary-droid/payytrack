const express = require('express');
const router = express.Router();
const DB = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/audit
router.get('/', (req, res) => {
  try {
    const logs = DB.getAuditLogs(req.user.id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

module.exports = router;
